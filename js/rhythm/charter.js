/* RE:AMP! rhythm — auto-charter.
   analysis (DSP.analyze) + timing {bpm, offset} → notes for one part at one difficulty.
   Charts are a first draft: quantized to the beat grid, thinned by difficulty, lanes follow the melody's contour.
   Hand-fixed charts (JSON) always win over these. */
'use strict';

const DIFFS = ['EASY', 'NORMAL', 'HARD', 'LOUD'];
const PART_ROLE = { GT: 'guitar', BA: 'bass', DR: 'drums', KEY: 'keys' };
const LANES = part => part === 'DR' ? 5 : 4;       // drums: D F J K + Space(kick)

const Charter = (() => {
  // grid in beats, notes-per-second budget (at 150 bpm), chord share, min hold length (beats)
  const D = [
    { grid: 1, nps: 1.9, chord: 0, hold: 2, strength: .32 },
    { grid: .5, nps: 3.4, chord: 0, hold: 1.5, strength: .2 },
    { grid: .25, nps: 6.2, chord: .08, hold: 1, strength: .12 },
    { grid: .25, nps: 9.5, chord: .2, hold: 1, strength: .06 },
  ];
  const beatOf = (tm, t) => (t - tm.offset) * tm.bpm / 60;
  const timeOf = (tm, b) => tm.offset + b * 60 / tm.bpm;
  const metric = q => q % 4 === 0 ? 1.35 : q % 2 === 0 ? 1.2 : q % 1 === 0 ? 1.1 : q % .5 === 0 ? .92 : .78;
  const pct = (arr, p) => { if (!arr.length) return 1; const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

  /* snap onsets to the grid, merge duplicates (keep strongest), normalise strength */
  function quantize(onsets, tm, grid) {
    const ref = pct(onsets.map(o => o.s), .9) || 1, m = new Map();
    for (const o of onsets) {
      const b = beatOf(tm, o.t);
      if (b < -.1) continue;
      const q = Math.max(0, Math.round(b / grid) * grid), key = q.toFixed(3);
      const c = { ...o, q, sn: o.s / ref };
      const prev = m.get(key);
      if (!prev || prev.sn < c.sn) m.set(key, c);
    }
    return [...m.values()].sort((a, b) => a.q - b.q);
  }

  /* keep the strongest notes per bar within the density budget, respecting a minimum gap */
  function thin(cands, tm, d, minGap) {
    const barSec = 240 / tm.bpm, budget = Math.max(1, Math.round(d.nps * (tm.bpm / 150) * barSec));
    const bars = new Map();
    for (const c of cands) {
      if (c.sn < d.strength) continue;
      c.w = c.sn * metric(c.q);
      const bar = Math.floor(c.q / 4);
      (bars.get(bar) || bars.set(bar, []).get(bar)).push(c);
    }
    const out = [];
    for (const list of bars.values()) {
      list.sort((a, b) => b.w - a.w);
      const took = [];
      for (const c of list) {
        if (took.length >= budget) break;
        if (took.some(t => Math.abs(t.q - c.q) < minGap - 1e-6)) continue;
        took.push(c);
      }
      out.push(...took);
    }
    return out.sort((a, b) => a.q - b.q);
  }

  /* lanes follow pitch: phrase starts anchor to the pitch's place in the song's range,
     then each note steps up/down with the melody; fast repeats alternate instead of jacking */
  function laneMelodic(notes, lanes) {
    const ps = notes.map(n => n.pitch).filter(p => p != null);
    const lo = pct(ps, .1), hi = pct(ps, .9), span = Math.max(1, hi - lo);
    let lane = 1, prevP = null, prevQ = -99;
    for (const n of notes) {
      const p = n.pitch ?? prevP ?? lo;
      if (n.q - prevQ >= 2 || prevP == null) lane = Math.max(0, Math.min(lanes - 1, Math.floor((p - lo) / span * lanes)));
      else {
        const d = p - prevP;
        const step = Math.abs(d) < .6 ? 0 : Math.abs(d) < 4 ? Math.sign(d) : 2 * Math.sign(d);
        let nl = lane + step;
        if (step === 0 && n.q - prevQ < .5) nl = lane + (lane >= lanes - 1 ? -1 : lane === 0 ? 1 : (Math.round(n.q * 4) % 2 ? 1 : -1));
        if (nl < 0) nl = Math.min(lanes - 1, -nl);
        if (nl > lanes - 1) nl = Math.max(0, 2 * (lanes - 1) - nl);
        lane = nl;
      }
      n.lane = lane; prevP = p; prevQ = n.q;
    }
  }

  function holds(notes, tm, d, part) {
    if (part === 'DR') return;
    const beatSec = 60 / tm.bpm;
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i], next = notes[i + 1];
      const susB = n.sus / beatSec, room = next ? next.q - n.q - .5 : 8;
      if (susB >= d.hold && room >= d.hold) n.len = Math.min(8, Math.floor(Math.min(susB, room) / .25) * .25);
    }
  }

  function chords(notes, d, lanes) {
    if (!d.chord) return [];
    const cut = pct(notes.map(n => n.w), 1 - d.chord), add = [];
    for (const n of notes) {
      if (n.w < cut || n.len) continue;
      const other = n.lane >= 2 ? n.lane - 2 : n.lane + 2;
      if (other >= 0 && other < lanes) add.push({ ...n, lane: other, chord: true });
    }
    return add;
  }

  function drums(an, tm, d, di) {
    const B = an.bands || {};
    const q = (list, grid) => quantize(list || [], tm, grid);
    const grid = d.grid;
    // lane per hit: 0 D hat · 1 F snare · 2 J tom · 3 K crash · 4 Space kick
    const kick = q(B.low, grid).map(o => ({ ...o, lane: 4 }));
    const mid = q(B.mid, grid).map(o => ({ ...o, lane: o.lowmid > o.mid * 1.25 && o.cen < 1400 ? 2 : 1 }));
    const high = q(B.high, grid).map(o => ({ ...o, lane: o.sus > .32 && o.sn > .8 ? 3 : 0 }));
    let pools;
    if (di === 0) pools = [kick.filter(o => o.q % 1 === 0), mid.filter(o => o.q % 1 === 0 && o.lane === 1)];
    else if (di === 1) pools = [kick, mid, high.filter(o => o.lane === 3 || o.q % 1 === 0)];
    else pools = [kick, mid, high];
    // priority: kick/snare on beats, then crashes, then hats
    const all = pools.flat().filter(o => o.sn >= d.strength * .8);
    const barSec = 240 / tm.bpm, budget = Math.max(2, Math.round(d.nps * 1.25 * (tm.bpm / 150) * barSec));
    const bars = new Map();
    for (const o of all) {
      o.w = o.sn * metric(o.q) * (o.lane === 4 || o.lane === 1 ? 1.25 : o.lane === 3 ? 1.1 : .8);
      const k = Math.floor(o.q / 4);
      (bars.get(k) || bars.set(k, []).get(k)).push(o);
    }
    const out = [];
    for (const list of bars.values()) {
      list.sort((a, b) => b.w - a.w);
      const took = [];
      for (const o of list) {
        if (took.length >= budget) break;
        const same = took.filter(t => Math.abs(t.q - o.q) < 1e-6);
        if (same.some(t => t.lane === o.lane)) continue;
        if (o.lane !== 4 && same.filter(t => t.lane !== 4).length >= (di >= 2 ? 2 : 1)) continue;   // two hands
        if (took.some(t => t.lane === o.lane && Math.abs(t.q - o.q) < grid - 1e-6)) continue;
        took.push(o);
      }
      out.push(...took);
    }
    return out;
  }

  /* public: build one chart */
  function make(an, tm, part, di, o = {}) {
    const d = D[di], lanes = LANES(part);
    let notes;
    if (part === 'DR') notes = drums(an, tm, d, di);
    else {
      const src = o.gate ? an.onsets.filter(x => x.rms >= o.gate) : an.onsets;
      notes = thin(quantize(src, tm, d.grid), tm, o.d || d, d.grid);
      laneMelodic(notes, lanes);
      holds(notes, tm, d, part);
      notes = notes.concat(chords(notes, d, lanes));
    }
    return notes
      .map(n => ({ b: +n.q.toFixed(4), t: timeOf(tm, n.q), lane: n.lane, len: n.len || 0, end: n.len ? timeOf(tm, n.q + n.len) : 0, s: +(n.sn || 0).toFixed(2) }))
      .sort((a, b) => a.t - b.t || a.lane - b.lane);
  }

  /* shared layer: the stems nobody "owns" (chorus, percussion, strings, synth, other).
     Quiet stems carry bleed, so onsets are gated by loudness; each stem gets a thinner budget. */
  function extras(list, tm, di) {
    const out = [];
    for (const [role, an] of list) {
      const r = an.onsets.map(x => x.rms).sort((a, b) => a - b), p95 = r[Math.floor(r.length * .95)] || 0;
      const gate = Math.max(.012, p95 * .2);
      const d = { ...D[di], nps: D[di].nps * .55, strength: Math.max(D[di].strength, .25) };
      for (const n of make(an, tm, 'GT', di, { gate, d })) out.push({ ...n, role });
    }
    out.sort((a, b) => a.t - b.t || b.s - a.s);
    const g = D[di].grid * 60 / tm.bpm, keep = [];
    for (const n of out) { const p = keep[keep.length - 1]; if (p && n.t - p.t < g * .99) { if (n.s > p.s) keep[keep.length - 1] = n; continue; } keep.push(n); }
    return keep;
  }

  /* fold the shared layer into a part's chart: only into the gaps, never on top of your own notes,
     and never past the bar's density budget */
  function merge(part, ex, tm, di, lanes) {
    const d = D[di], g = d.grid * 60 / tm.bpm;
    const mine = part.filter(n => n.lane < lanes || lanes === 5);
    const busy = t => mine.some(p => Math.abs(p.t - t) < g * .99 || (p.len && t > p.t && t < p.end + g * .5));
    const add = [];
    for (const n0 of ex) {
      if (busy(n0.t)) continue;
      const n = { ...n0, lane: n0.lane % Math.min(4, lanes) };
      if (n.len && mine.some(p => p.t > n.t && p.t < n.end + g)) { n.len = 0; n.end = 0; }
      add.push(n);
    }
    const barSec = 240 / tm.bpm, budget = Math.max(2, Math.round(d.nps * (tm.bpm / 150) * barSec * 1.25));
    const byBar = new Map();
    for (const n of add) { const k = Math.floor(beatOf(tm, n.t) / 4); (byBar.get(k) || byBar.set(k, []).get(k)).push(n); }
    const kept = [];
    for (const [k, list] of byBar) {
      const have = mine.filter(p => Math.floor(beatOf(tm, p.t) / 4) === k).length;
      list.sort((a, b) => b.s - a.s);
      kept.push(...list.slice(0, Math.max(0, budget - have)));
    }
    return kept;
  }

  return { make, extras, merge, beatOf, timeOf, D };
})();
