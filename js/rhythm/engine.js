/* RE:AMP! rhythm — the live engine.
   Clock: WebAudio output timestamp, smoothed against performance.now so visuals and input share one timeline.
   Stems: every stem plays in sync; your part mutes when you miss (you hear your own mistakes),
   member parts dip when a member fumbles and nobody covers.
   Gauges: judgement (score/combo) · BAND SYNC · CROWD HEAT. Heat 0 → silence → recovery or fail.
   Events: tip · fumble · eye · memberDrop · blackout (the 47 seconds). */
'use strict';

const WIN = { P: .045, G: .09, g: .13 };          // judgement windows (s)
const JN = ['PERFECT', 'GREAT', 'GOOD', 'MISS'];

class Live {
  constructor(cfg) {
    this.cfg = cfg;
    const { prep, part, diff } = cfg;
    this.prep = prep; this.tm = prep.tm; this.part = part; this.diff = diff;
    this.beat = 60 / this.tm.bpm; this.bar = this.beat * 4;
    this.lanes = LANES(part); this.role = PART_ROLE[part];
    this.offset = (SETTINGS.offset || 0) / 1000;
    this.on = cfg.on || (() => {});
    const src = (prep.charts[part] && prep.charts[part][diff]) || [];
    this.notes = src.map(n => ({ ...n, kind: part === 'DR' && n.lane === 4 ? 'kick' : 'tap', j: null }));
    // shared notes (chorus / percussion / strings / synth / other) are folded into every part's gaps
    const ex = prep.charts.EX && prep.charts.EX[diff];
    if (ex && !cfg.noExtras) for (const n of Charter.merge(this.notes, ex, this.tm, diff, this.lanes)) this.notes.push({ ...n, kind: 'extra', c: ROLE_C[n.role] || '#FFFFFF', j: null });
    this.events = (cfg.events || []).map(e => ({ ...e, at: e.at ?? Charter.timeOf(this.tm, e.bar * 4), done: false })).sort((a, b) => a.at - b.at);
    this.bo = null;
    const bo = this.events.find(e => e.type === 'blackout');
    const lastAny = Math.max(0, ...Object.values(prep.charts).map(c => (c[1] && c[1].length ? c[1][c[1].length - 1].t : 0)));
    this.endT = bo ? bo.at + (bo.dur || 47) + 3 : Math.min(prep.dur, lastAny + 3);
    this.buildMembers(cfg.party || []);
    this.buildEyes();
    if (bo) this.buildGhosts(bo);
    this.notes.sort((a, b) => a.t - b.t || a.lane - b.lane);
    this.from = cfg.from || 0;                                  // dev: start mid-song
    if (this.from) { this.notes = this.notes.filter(n => n.t >= this.from + 1); this.members.forEach(m => { m.ni = m.notes.findIndex(n => n.t >= this.from); if (m.ni < 0) m.ni = m.notes.length; }); }
    const scoring = this.notes.filter(n => !n.ghost);
    this.total = scoring.length + scoring.filter(n => n.len).length || 1;
    Object.assign(this, {
      counts: [0, 0, 0, 0], combo: 0, maxCombo: 0, pts: 0, score: 0, fast: 0, slow: 0,
      heat: cfg.heat0 ?? 60, sync: cfg.sync0 ?? 60, amp: false, mi: 0, holding: [], down: [],
      cover: { hit: 0, total: this.notes.filter(n => n.kind === 'cover').length }, silence: null, failed: false,
      running: false, paused: false, finished: false, time: -9, sm: null,
    });
  }

  /* ---------- setup ---------- */
  buildMembers(party) {
    const ch = this.prep.charts;
    this.members = party.map((m, i) => {
      if (m.role === 'lead' && !this.prep.bufs.lead) m = { ...m, role: 'guitar' };   // no separate lead stem: Haru owns the guitar
      const key = ch[m.role] ? m.role : m.part;
      const notes = ((ch[key] && ch[key][1]) || []).filter(n => !(m.part === 'DR' && n.lane === 4) || true).map(n => ({ t: n.t, lane: n.lane, len: n.len, end: n.end, done: false, bad: false }));
      const stem = this.prep.bufs[m.role] && m.role !== this.role ? m.role : null;
      return { ...m, i, notes, ni: 0, stem, fumbles: [], dropped: false, warn: 0, flash: 0, hits: [] };
    });
    // fumbles: scripted ones from events, random ones from condition (lab / later chapters)
    const rng = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(this.cfg.seed || 4747);
    const lastBar = Math.floor(Charter.beatOf(this.tm, this.endT) / 4) - 2;
    for (const m of this.members) {
      const scripted = this.events.filter(e => e.type === 'fumble' && e.who === m.id);
      if (scripted.length) scripted.forEach(e => m.fumbles.push({ t0: e.at, t1: e.at + (e.beats || 2) * this.beat, scripted: true }));
      else if (this.cfg.randomFumbles) {
        let b = 6;
        while (b < lastBar) {
          if (rng() < (1 - m.cond) * .5) {
            const t0 = Charter.timeOf(this.tm, b * 4 + Math.floor(rng() * 3));
            m.fumbles.push({ t0, t1: t0 + (1 + Math.floor(rng() * 2)) * this.beat });
            b += 5;
          } else b += 2;
        }
      }
      // cover notes: the member's notes inside the fumble land in your lanes
      const lanes = Math.min(4, this.lanes);
      m.fumbles = m.fumbles.filter(f => {
        const theirs = m.notes.filter(n => n.t >= f.t0 - .01 && n.t < f.t1);
        f.covers = 0;
        const mark = p => Object.assign(p, { kind: 'cover', who: m.id, c: m.c, fumble: f });
        for (const n of theirs) {
          n.fumble = f;
          // your note at the same moment becomes the cover; otherwise one is added in a free lane
          const mine = this.notes.find(p => p.kind !== 'kick' && Math.abs(p.t - n.t) < this.beat / 8);
          if (mine) { if (mine.kind !== 'cover') { mark(mine); f.covers++; } continue; }
          if (this.notes.some(p => Math.abs(p.t - n.t) < this.beat / 4)) continue;
          this.notes.push(mark({ t: n.t, lane: n.lane % lanes, len: 0, end: 0, j: null }));
          f.covers++;
        }
        // a scripted stumble always reaches you: with nothing of theirs in the window, your own notes carry it
        if (!f.covers && f.scripted) for (const p of this.notes) if (p.kind === 'tap' && p.t >= f.t0 - .01 && p.t < f.t1) { mark(p); f.covers++; }
        return f.covers > 0 || f.scripted;
      });
    }
  }

  buildEyes() {
    this.eyes = this.events.filter(e => e.type === 'eye').map((e, i) => {
      const t0 = e.at, t1 = e.at + (e.bars || 1) * this.bar;
      const m = this.members.find(x => x.id === e.who) || {};
      const w = { i, who: e.who, c: m.c || '#FF4FA0', en: m.en || e.who.toUpperCase(), ex: e.ex, t0, t1, fail: false, done: false, n: 0 };
      for (const n of this.notes) if (n.t >= t0 && n.t < t1) { n.eye = i; w.n++; }
      return w;
    }).filter(w => w.n > 0);
  }

  /* the 47 seconds: every note after the cut becomes a ghost of the crowd's singalong rhythm */
  buildGhosts(bo) {
    const t0 = bo.at, dur = bo.dur || 47, ch = this.prep.charts;
    this.notes = this.notes.filter(n => n.t < t0 - .02);
    const src = ((ch.vocals && ch.vocals[1]) || (ch.KEY && ch.KEY[1]) || (ch[this.part] && ch[this.part][1]) || []);
    const period = this.bar * 8;
    let pat = src.filter(n => n.t >= t0 - period && n.t < t0);
    if (pat.length < 6) { const c = src.filter(n => n.t > this.bar * 8); pat = c.slice(0, 24); }
    if (!pat.length) return;
    const p0 = pat[0].t, span = Math.max(period, pat[pat.length - 1].t - p0 + this.beat);
    for (let k = 0; k * span < dur; k++) for (const n of pat) {
      const t = t0 + this.beat + (n.t - p0) + k * span;
      if (t > t0 + dur - .5) break;
      this.notes.push({ t, lane: n.lane % 4, len: 0, end: 0, kind: 'ghost', ghost: true, j: null });
    }
    // recovery prompts: four ghost notes each, always end in NO SIGNAL
    const ghosts = this.notes.filter(n => n.ghost).sort((a, b) => a.t - b.t);
    this.recs = [6, 16, 27, 38].map(s => {
      const g = ghosts.filter(n => n.t >= t0 + s).slice(0, 4);
      g.forEach(n => { n.rec = true; });
      return g.length ? { t: g[0].t - 1.6, end: g[g.length - 1].t + .25, notes: g, shown: false, done: false } : null;
    }).filter(Boolean);
  }

  /* ---------- audio ---------- */
  start(lead = 2.4) {
    const ac = this.ac = AU.get();
    const first = this.notes.length ? this.notes[0].t : 0;
    lead = Math.max(lead, 2.2 - (first - this.from) + .6);
    this.t0 = ac.currentTime + lead - this.from;
    this.music = ac.createGain(); this.lp = ac.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 20000;
    // limiter at the end so a boosted part never clips
    const lim = ac.createDynamicsCompressor();
    lim.threshold.value = -3; lim.knee.value = 4; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .12;
    this.music.connect(this.lp).connect(lim).connect(AU.master);
    this.boost = Math.pow(10, (SETTINGS.partDb ?? 3) / 20);      // your own instrument sits a little above the record
    this.gains = {}; this.srcs = [];
    for (const [role, buf] of Object.entries(this.prep.bufs)) {
      const g = ac.createGain(), s = ac.createBufferSource();
      g.gain.value = role === this.role ? this.boost : 1; s.buffer = buf; s.connect(g).connect(this.music);
      s.start(this.t0 + this.from, this.from);
      this.gains[role] = g; this.srcs.push(s);
    }
    this.gPart = this.gains[this.role] || null;
    // crowd bed: filtered noise, follows heat
    const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = nb.getChannelData(0);
    let b0 = 0; for (let i = 0; i < d.length; i++) { b0 = .98 * b0 + .02 * (Math.random() * 2 - 1); d[i] = b0 * 6; }
    const cs = ac.createBufferSource(); cs.buffer = nb; cs.loop = true;
    const cf = ac.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 900; cf.Q.value = .6;
    this.crowd = ac.createGain(); this.crowd.gain.value = 0; cs.connect(cf).connect(this.crowd).connect(AU.master); cs.start();
    this.srcs.push(cs);
    this.sfx = ac.createGain(); this.sfx.gain.value = .6; this.sfx.connect(AU.master);
    // count-in sticks
    for (let k = 4; k >= 1; k--) { const t = this.t0 + this.tm.offset - k * this.beat; if (t > ac.currentTime) this.stick(t, k === 4 ? 1 : .7); }
    // the cut is scheduled sample-accurately
    for (const e of this.events) if (e.type === 'blackout') { this.music.gain.setValueAtTime(1, this.t0 + e.at - .01); this.music.gain.setValueAtTime(0, this.t0 + e.at); }
    this.running = true;
    this.setCrowd();
  }
  stick(t, v) {
    const ac = this.ac, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = this.noiseBuf(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 3;
    s.connect(f).connect(g).connect(this.sfx); g.gain.setValueAtTime(v * .9, t); g.gain.exponentialRampToValueAtTime(.001, t + .05); s.start(t); s.stop(t + .08);
  }
  noiseBuf() {
    if (this._nb) return this._nb;
    const ac = this.ac, b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return (this._nb = b);
  }
  thunk() {   // dead note on a miss
    const ac = this.ac, t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = this.noiseBuf(); f.type = 'bandpass'; f.frequency.value = this.part === 'BA' ? 300 : 1400; f.Q.value = 2;
    s.connect(f).connect(g).connect(this.sfx); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .09); s.start(t, Math.random() * .5); s.stop(t + .1);
  }
  cheer(v = .5, len = 1.6) {
    const ac = this.ac, t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = this.noiseBuf(); s.loop = true; f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = .7;
    f.frequency.linearRampToValueAtTime(1700, t + len * .3);
    s.connect(f).connect(g).connect(this.sfx);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * .22, t + .12); g.gain.exponentialRampToValueAtTime(.001, t + len); s.start(t); s.stop(t + len + .1);
  }
  setCrowd() { if (this.crowd && !this.bo) this.crowd.gain.setTargetAtTime(this.silence ? 0 : .012 + this.heat / 100 * .05, this.ac.currentTime, .4); }
  partGain(v, n) {
    const g = n && n.kind === 'extra' ? this.gains[n.role] : this.gPart;
    if (g) g.gain.setTargetAtTime(v * (g === this.gPart ? this.boost : 1), this.ac.currentTime, .012);
  }

  /* ---------- clock ---------- */
  raw(p) {
    const ac = this.ac, ts = ac.getOutputTimestamp ? ac.getOutputTimestamp() : null;
    let ct;
    if (ts && ts.contextTime > 0 && ts.performanceTime > 0) ct = ts.contextTime + (p - ts.performanceTime) / 1000;
    else ct = ac.currentTime - (ac.outputLatency || ac.baseLatency || 0);
    return ct - this.t0 - this.offset;
  }
  clock(p) {
    const r = this.raw(p);
    if (!this.sm) { this.sm = { t: r, p }; return; }
    const pred = this.sm.t + (p - this.sm.p) / 1000;
    this.sm = Math.abs(r - pred) > .04 ? { t: r, p } : { t: pred + (r - pred) * .06, p };
  }
  timeAt(p) { return this.sm ? this.sm.t + (p - this.sm.p) / 1000 : this.raw(p); }

  pause() { if (!this.running || this.paused || this.finished) return; this.paused = true; this.ac.suspend(); }
  resume() { if (!this.paused) return; this.paused = false; this.sm = null; this.ac.resume(); }
  stop() {
    this.running = false;
    try { this.srcs.forEach(s => { try { s.stop(); } catch (e) {} }); } catch (e) {}
    if (this.ac && this.ac.state === 'suspended') this.ac.resume();
    if (this.tinn) try { this.tinn.stop(); } catch (e) {}
  }

  /* ---------- input ---------- */
  press(lane, p) {
    if (!this.running || this.paused || this.finished) return;
    this.down[lane] = true;
    if (this.bo && this.bo.stage === 'end') return;
    const t = this.timeAt(p);
    let best = null;
    for (let i = this.mi; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.t > t + WIN.g) break;
      if (n.j !== null || n.lane !== lane) continue;
      if (Math.abs(n.t - t) <= WIN.g) { best = n; break; }
    }
    if (!best) return this.on('empty', { lane });
    const dt = t - best.t, a = Math.abs(dt);
    this.judge(best, a <= WIN.P ? 0 : a <= WIN.G ? 1 : 2, dt);
    if (best.len && best.j < 3 && !best.ghost) { this.holding[lane] = best; best.hold = 'on'; }
  }
  release(lane, p) {
    this.down[lane] = false;
    const h = this.holding[lane];
    if (!h || !this.running) return;
    const t = this.timeAt(p);
    if (t < h.end - .12) this.holdEnd(h, false); else this.holdEnd(h, true);
  }
  holdEnd(h, ok) {
    this.holding[h.lane] = null;
    h.hold = ok ? 'ok' : 'drop';
    if (ok) { this.pts += 1; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); }
    else { this.combo = 0; this.partGain(.08, h); this.heatAdd(-this.missLoss() * .5); }
    this.score = Math.round(1e6 * this.pts / this.total);
    this.on('hold', { n: h, ok });
  }
  missLoss() { return [1.8, 2.6, 3.4, 4.2][this.diff]; }
  heatAdd(v) {
    const was = this.heat;
    const warm = this.time < this.tm.offset + 8 * this.bar;          // first 8 bars: the crowd is still warming up
    this.heat = Math.max(this.cfg.noFail || this.cfg.tutorial ? 1 : warm ? 12 : 0, Math.min(100, this.heat + v));
    if (!this.amp && this.heat >= 80) { this.amp = true; this.on('amp', { on: true }); this.cheer(.6, 2); }
    else if (this.amp && this.heat < 74) { this.amp = false; this.on('amp', { on: false }); }
    if (was > 0 && this.heat <= 0 && !this.silence) this.enterSilence();
    if (Math.floor(was / 10) !== Math.floor(this.heat / 10)) this.setCrowd();
  }

  judge(n, k, dt = 0) {
    n.j = k; n.dt = dt;
    if (n.ghost) { this.on('ghost', { n, k }); return; }
    this.counts[k]++;
    if (k < 3) {
      this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.pts += [1, .7, .3][k];
      if (k > 0) dt < 0 ? this.fast++ : this.slow++;
      this.partGain(1, n);
      this.heatAdd([.9, .6, .15][k] * (.6 + this.sync / 125));
      this.sync += ((k === 0 ? 100 : k === 1 ? 75 : 40) - this.sync) * .012;
      if (this.combo % 50 === 0) { this.on('milestone', { combo: this.combo }); this.cheer(.45); }
    } else {
      if (this.combo >= 20) this.on('break', { combo: this.combo });
      this.combo = 0;
      this.partGain(.06, n); this.thunk();
      this.heatAdd(-this.missLoss());
      this.sync += (15 - this.sync) * .02;
    }
    if (n.kind === 'cover') {
      const m = this.members.find(x => x.id === n.who);
      if (k < 3) { this.cover.hit++; this.sync = Math.min(100, this.sync + 2.5); this.heatAdd(1.2); }
      else { this.sync = Math.max(0, this.sync - 4); if (m && m.stem) this.dip(m, .35); }
      this.on('cover', { n, k, m });
    }
    if (n.eye != null && k >= 2) this.eyes[n.eye].fail = true;
    if (n.rec && this.silence) this.silence.judged++, k < 3 && this.silence.hit++;
    this.sync = Math.max(0, Math.min(100, this.sync));
    this.score = Math.round(1e6 * this.pts / this.total);
    this.on('judge', { n, k, dt });
  }
  dip(m, len) {
    const g = this.gains[m.stem], t = this.ac.currentTime;
    if (!g) return;
    g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(.08, t, .01); g.gain.setTargetAtTime(1, t + len, .05);
  }

  /* ---------- silence (heat hit zero) ---------- */
  enterSilence() {
    if (this.cfg.noFail || this.cfg.tutorial || this.bo) return;
    const t = this.time, ac = this.ac;
    const rec = [];                                              // 8 readable notes: 2.5s out, at least half a beat apart
    for (const n of this.notes) { if (rec.length >= 8) break; if (n.j !== null || n.ghost || n.kind === 'kick' || n.t < t + 2.5) continue; if (rec.length && n.t - rec[rec.length - 1].t < this.beat / 2) continue; rec.push(n); }
    if (rec.length < 4) return;
    rec.forEach(n => { n.rec = true; });
    this.silence = { t0: t, notes: rec, hit: 0, judged: 0, need: Math.ceil(rec.length * .75) };
    this.lp.frequency.setTargetAtTime(380, ac.currentTime, .25);
    this.music.gain.setTargetAtTime(.4, ac.currentTime, .3);
    this.setCrowd();
    this.on('silence', { need: this.silence.need, of: rec.length });
  }
  checkSilence() {
    const s = this.silence;
    if (!s || this.bo || s.judged < s.notes.length) return;
    this.silence = null;
    const ac = this.ac;
    if (s.hit >= s.need) {
      this.heat = 32; this.lp.frequency.setTargetAtTime(20000, ac.currentTime, .15); this.music.gain.setTargetAtTime(1, ac.currentTime, .1);
      s.notes.forEach(n => { n.rec = false; });
      this.cheer(.8, 2.2); this.setCrowd(); this.on('recover', {});
    } else this.fail();
  }
  fail() {
    this.failed = true; this.finished = true;
    const ac = this.ac;
    this.music.gain.setTargetAtTime(0, ac.currentTime, .4);
    this.on('fail', this.result());
  }

  /* ---------- the 47 seconds ---------- */
  startBlackout(e) {
    const ac = this.ac, dur = e.dur || 47;
    this.bo = { t0: e.at, dur, stage: 'on' };
    if (this.silence) { this.silence.notes.forEach(n => { n.rec = false; }); this.silence = null; this.lp.frequency.setValueAtTime(20000, ac.currentTime); }
    this.crowd.gain.cancelScheduledValues(ac.currentTime); this.crowd.gain.setValueAtTime(0, ac.currentTime);
    // tinnitus: a thin 7.4 kHz line that swells, then settles
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 7400; o.connect(g).connect(AU.master);
    g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(.05, ac.currentTime + .08); g.gain.exponentialRampToValueAtTime(.012, ac.currentTime + 6);
    o.start(); this.tinn = o; this.tinnG = g;
    this.holding = [];
    this.members.forEach(m => { m.dropped = true; });
    this.partGain(0);
    this.on('blackout', { dur });
  }
  tickBlackout(t) {
    const bo = this.bo;
    const el = t - bo.t0;
    // heat and sync drain
    const dt = Math.max(0, Math.min(.1, t - (bo.lastT ?? t))); bo.lastT = t;
    this.heat = Math.max(0, this.heat - dt * 30); this.sync = Math.max(0, this.sync - dt * 12);
    for (const r of this.recs || []) {
      if (!r.shown && t >= r.t) { r.shown = true; this.on('recPrompt', { r }); }
      if (r.shown && !r.done && t >= r.end + WIN.g) { r.done = true; this.on('recFail', { r }); }
    }
    if (bo.stage === 'on' && el >= bo.dur) {
      bo.stage = 'end';
      this.tinnG.gain.setTargetAtTime(.0001, this.ac.currentTime, 1.2);
      this.on('handsStop', {});
    }
    if (bo.stage === 'end' && el >= bo.dur + 3) this.finish();
  }

  /* ---------- frame ---------- */
  update(p) {
    if (!this.running || this.paused) return;
    this.clock(p);
    const t = this.time = this.timeAt(p);
    const notes = this.notes;
    // autoplay (dev / demo)
    if (this.cfg.auto) {
      for (let i = this.mi; i < notes.length && notes[i].t <= t; i++) {
        const n = notes[i];
        if (n.j !== null || (n.ghost && this.bo && this.bo.stage === 'end')) continue;
        this.judge(n, 0, 0);
        if (n.len && !n.ghost) { this.holding[n.lane] = n; n.hold = 'on'; }
      }
    }
    // late misses
    for (let i = this.mi; i < notes.length; i++) {
      const n = notes[i];
      if (n.t > t - WIN.g) break;
      if (n.j === null) this.judge(n, 3);
    }
    while (this.mi < notes.length && notes[this.mi].j !== null) this.mi++;
    // holds
    for (const h of this.holding) if (h && t >= h.end) this.holdEnd(h, true);
    // members
    for (const m of this.members) {
      while (m.ni < m.notes.length && m.notes[m.ni].t <= t) {
        const n = m.notes[m.ni++];
        if (m.dropped) { n.done = true; continue; }
        n.done = true; n.bad = !!n.fumble;
        m.flash = 1;
        this.on('member', { m, n });
      }
      for (const f of m.fumbles) {
        if (!f.warned && t >= f.t0 - 1.6) { f.warned = true; this.on('warn', { m, f }); }
      }
    }
    // eye contact windows
    for (const w of this.eyes) {
      if (!w.shown && t >= w.t0 - this.beat * 3) { w.shown = true; this.on('eyeIn', { w }); }
      if (!w.done && t >= w.t1 + WIN.g) {
        w.done = true;
        if (!w.fail) { this.sync = Math.min(100, this.sync + 8); this.heatAdd(5); this.cheer(.4); }
        this.on('eyeOut', { w, ok: !w.fail });
      }
    }
    // events
    for (const e of this.events) {
      if (e.done || t < e.at - (e.lead || 0)) continue;
      e.done = true;
      if (e.type === 'memberDrop') {
        const m = this.members.find(x => x.id === e.who);
        if (m) { m.dropped = true; if (m.stem) this.gains[m.stem].gain.setTargetAtTime(0, this.ac.currentTime, .08); }
        this.on('memberDrop', { m, e });
      } else if (e.type === 'blackout') this.startBlackout(e);
      else if (e.type !== 'fumble' && e.type !== 'eye') this.on(e.type, e);
    }
    this.checkSilence();
    if (this.bo) this.tickBlackout(t);
    else if (t >= this.endT && !this.finished) this.finish();
  }

  finish() {
    if (this.finished && !this.failed) return;
    this.finished = true;
    const r = this.result();
    if (!this.bo && r.clear) this.cheer(1, 3);
    this.on('end', r);
  }
  result() {
    const c = this.counts, played = c.reduce((a, b) => a + b, 0);
    const fc = c[3] === 0 && played > 0 && this.notes.every(n => n.ghost || n.hold !== 'drop');
    const s = this.score;
    const rank = this.failed ? 'F' : s >= 980000 ? 'SS' : s >= 950000 ? 'S' : s >= 900000 ? 'A' : s >= 800000 ? 'B' : s >= 700000 ? 'C' : 'D';
    return {
      score: s, rank, counts: [...c], maxCombo: this.maxCombo, fast: this.fast, slow: this.slow,
      sync: Math.round(this.sync), heat: Math.round(this.heat), cover: { ...this.cover },
      eyes: { hit: this.eyes.filter(w => w.done && !w.fail).length, total: this.eyes.length },
      fc, ap: fc && c[1] + c[2] === 0, clear: !this.failed, failed: this.failed, blackout: !!this.bo,
    };
  }
}
