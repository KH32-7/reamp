/* RE:AMP! rhythm — signal analysis for auto-charting.
   Takes decoded stems (AudioBuffer), finds onsets per band, estimates tempo + beat phase,
   and measures per-onset pitch / band energy / sustain so the charter can place lanes. */
'use strict';

const DSP = (() => {
  const RATE = 22050, N = 1024, HOP = 256;     // ~11.6 ms frames (fps = rate / HOP, rate depends on the source)

  /* in-place radix-2 FFT */
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2;
          const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }

  /* downmix + decimate to ~22 kHz (box filter is enough for onset work) */
  function mono(buf) {
    const f = Math.max(1, Math.round(buf.sampleRate / RATE)), ch = buf.numberOfChannels;
    const src = [...Array(ch)].map((_, c) => buf.getChannelData(c));
    const out = new Float32Array(Math.floor(buf.length / f));
    for (let i = 0; i < out.length; i++) {
      let s = 0;
      for (let c = 0; c < ch; c++) { const d = src[c]; for (let k = 0; k < f; k++) s += d[i * f + k]; }
      out[i] = s / (f * ch);
    }
    return { x: out, rate: buf.sampleRate / f };
  }

  const BANDS = { low: [30, 150], lowmid: [150, 500], mid: [500, 3000], high: [5000, 11000], all: [30, 11000] };

  /* STFT → per-frame band flux, rms, centroid. Log-compressed magnitude so quiet parts still register. */
  function features(buf) {
    const { x, rate } = mono(buf);
    const frames = Math.max(0, Math.floor((x.length - N) / HOP));
    const win = new Float32Array(N).map((_, i) => .5 - .5 * Math.cos(2 * Math.PI * i / N));
    const re = new Float32Array(N), im = new Float32Array(N);
    let prev = new Float32Array(N / 2), cur = new Float32Array(N / 2);
    const hz = rate / N, bin = f => Math.min(N / 2 - 1, Math.round(f / hz));
    const B = Object.fromEntries(Object.entries(BANDS).map(([k, [a, b]]) => [k, [bin(a), bin(b)]]));
    const flux = Object.fromEntries(Object.keys(BANDS).map(k => [k, new Float32Array(frames)]));
    const rms = new Float32Array(frames), cen = new Float32Array(frames);
    for (let f = 0; f < frames; f++) {
      const o = f * HOP;
      let e = 0;
      for (let i = 0; i < N; i++) { const v = x[o + i]; e += v * v; re[i] = v * win[i]; im[i] = 0; }
      rms[f] = Math.sqrt(e / N);
      fft(re, im);
      let cs = 0, cw = 0;
      for (let k = 1; k < N / 2; k++) { const m = Math.log1p(1000 * Math.hypot(re[k], im[k])); cur[k] = m; cs += m * k; cw += m; }
      cen[f] = cw ? cs / cw * hz : 0;
      for (const [name, [a, b]] of Object.entries(B)) {
        let s = 0;
        for (let k = a; k <= b; k++) { const d = cur[k] - prev[k]; if (d > 0) s += d; }
        flux[name][f] = s / (b - a + 1);
      }
      [prev, cur] = [cur, prev];
    }
    return { x, rate, fps: rate / HOP, frames, flux, rms, cen };
  }

  /* adaptive-threshold peak picking on a novelty curve */
  function peaks(nov, o = {}, FPS = 86.13) {
    const n = nov.length, W = Math.round((o.win || .5) * FPS), L = Math.round((o.local || .035) * FPS);
    const k = o.k ?? 1.35, delta = o.delta ?? .02, gap = Math.round((o.gap || .06) * FPS);
    // running mean via prefix sums
    const pre = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + nov[i];
    let mx = 0; for (let i = 0; i < n; i++) if (nov[i] > mx) mx = nov[i];
    const floor = mx * (o.floor ?? .06);
    const out = [];
    let last = -1e9;
    for (let i = 1; i < n - 1; i++) {
      const v = nov[i];
      if (v < floor) continue;
      let isMax = true;
      for (let j = Math.max(0, i - L); j <= Math.min(n - 1, i + L); j++) if (nov[j] > v) { isMax = false; break; }
      if (!isMax) continue;
      const a = Math.max(0, i - W), b = Math.min(n, i + W), mean = (pre[b] - pre[a]) / (b - a);
      if (v < mean * k + delta * mx) continue;
      if (i - last < gap) { if (v > out[out.length - 1].s) { out[out.length - 1] = { f: i, s: v }; last = i; } continue; }
      out.push({ f: i, s: v }); last = i;
    }
    return out;
  }

  /* tempo: autocorrelation of the novelty curve, weighted toward 90–190 BPM, then a fine comb search
     over the whole song (Suno exports are constant-tempo) for exact BPM + phase. */
  function tempo(nov, hint, FPS = 86.13) {
    const n = nov.length;
    const mean = nov.reduce((a, b) => a + b, 0) / n;
    const c = nov.map(v => Math.max(0, v - mean));
    const score = bpm => {                            // comb energy at best phase
      const P = FPS * 60 / bpm;
      let best = 0, bestPh = 0;
      for (let ph = 0; ph < P; ph += .5) {
        let s = 0, m = 0;
        for (let t = ph; t < n - 1; t += P) { const i = t | 0, fr = t - i; s += c[i] * (1 - fr) + c[i + 1] * fr; m++; }
        s /= m || 1;
        if (s > best) { best = s; bestPh = ph; }
      }
      return { s: best, ph: bestPh };
    };
    let cands = [];
    if (hint) cands = [hint];
    else {
      for (let lag = Math.round(FPS * 60 / 200); lag <= Math.round(FPS * 60 / 70); lag++) {
        let s = 0;
        for (let i = 0; i + lag < n; i++) s += c[i] * c[i + lag];
        const bpm = FPS * 60 / lag, w = Math.exp(-.5 * (Math.log2(bpm / 140) / .6) ** 2);
        cands.push({ bpm, s: s * w });
      }
      cands.sort((a, b) => b.s - a.s);
      cands = cands.slice(0, 5).map(x => x.bpm);
    }
    let best = { bpm: cands[0], s: -1, ph: 0 };
    for (const b0 of cands) {
      for (let b = b0 - 1.5; b <= b0 + 1.5; b += .05) { const r = score(b); if (r.s > best.s) best = { bpm: b, ...r }; }
    }
    // round to 0.01 and re-fit phase; snap near-integers (DAW tempos usually are)
    let bpm = Math.abs(best.bpm - Math.round(best.bpm)) < .08 ? Math.round(best.bpm) : +best.bpm.toFixed(2);
    const r = score(bpm);
    return { bpm, offset: r.ph / FPS + N / 2 / (FPS * HOP) };      // same window-centre correction as onsets
  }

  /* rough pitch at an onset: harmonic product spectrum over a longer window, 55–1300 Hz */
  function pitchAt(x, rate, t) {
    const M = 4096, o = Math.max(0, Math.min(x.length - M, Math.round((t + .03) * rate)));
    const re = new Float32Array(M), im = new Float32Array(M);
    for (let i = 0; i < M; i++) re[i] = (x[o + i] || 0) * (.5 - .5 * Math.cos(2 * Math.PI * i / M));
    fft(re, im);
    const mag = new Float32Array(M / 2);
    for (let k = 0; k < M / 2; k++) mag[k] = Math.hypot(re[k], im[k]);
    const hz = rate / M, lo = Math.ceil(55 / hz), hi = Math.floor(1300 / hz);
    let best = 0, bk = 0;
    for (let k = lo; k <= hi; k++) {
      const p = mag[k] * (mag[2 * k] || 0) ** .6 * (mag[3 * k] || 0) ** .4;
      if (p > best) { best = p; bk = k; }
    }
    return bk ? 12 * Math.log2(bk * hz / 440) + 69 : null;        // MIDI note number
  }

  /* how long the note rings: frames until rms falls under 45% of its post-onset peak */
  function sustainAt(rms, f, FPS) {
    let pk = 0;
    for (let i = f; i < Math.min(rms.length, f + 6); i++) pk = Math.max(pk, rms[i]);
    let i = f + 3;
    while (i < rms.length && rms[i] > pk * .45) i++;
    return (i - f) / FPS;
  }

  /* full analysis of one stem */
  function analyze(buf, role) {
    const F = features(buf), FPS = F.fps;
    const drums = role === 'drums';
    const res = { role, dur: buf.duration, fps: FPS, frames: F.frames, nov: F.flux.all, onsets: [] };
    if (drums) res.dnov = F.flux.low.map((v, i) => v + F.flux.high[i] * .6);   // kick + cymbals mark the downbeat
    const mk = (p, band) => ({
      t: p.f / FPS + N / 2 / F.rate, s: p.s, band,          // flux peaks when the attack reaches the window centre
      low: F.flux.low[p.f], lowmid: F.flux.lowmid[p.f], mid: F.flux.mid[p.f], high: F.flux.high[p.f],
      cen: F.cen[Math.min(F.frames - 1, p.f + 2)], sus: sustainAt(F.rms, p.f, FPS), rms: F.rms[Math.min(F.frames - 1, p.f + 2)],
    });
    if (drums) {
      // separate detectors per drum band so kick + hat on the same 16th both survive
      res.bands = {};
      for (const b of ['low', 'mid', 'high']) {
        res.bands[b] = peaks(F.flux[b], { k: 1.5, floor: b === 'high' ? .1 : .08, gap: .07 }, FPS).map(p => mk(p, b));
      }
    } else {
      res.onsets = peaks(F.flux.all, { k: 1.4, floor: .07 }, FPS).map(p => mk(p, 'all'));
      for (const o of res.onsets) o.pitch = pitchAt(F.x, F.rate, o.t);
    }
    // loudness envelope at 20 Hz — used by the renderer (member lanes breathe) and silence detection
    const step = Math.round(FPS / 20), env = new Float32Array(Math.ceil(F.frames / step));
    for (let i = 0; i < env.length; i++) { let m = 0; for (let j = i * step; j < Math.min(F.frames, (i + 1) * step); j++) m = Math.max(m, F.rms[j]); env[i] = m; }
    res.env = env;
    return res;
  }

  return { fft, analyze, tempo, peaks, RATE };
})();
