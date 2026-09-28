/* RE:AMP! rhythm — songs, stems, parties.
   A song is a set of stems (guitar / bass / drums / keys / + vocals, lead, other as backing).
   Real songs: files under audio/<id>/. Until the Suno stems arrive, placeholder songs are synthesized
   into the same stem format so the whole pipeline (decode → analyze → chart → play) is exercised. */
'use strict';

const ROLES = ['guitar', 'bass', 'drums', 'keys', 'lead', 'vocals', 'bvox', 'perc', 'strings', 'synth', 'other'];
/* stems every player hits no matter which instrument they chose ("shared" notes) */
const EXTRA_ROLES = ['bvox', 'perc', 'strings', 'synth', 'other'];
const ROLE_KO = { guitar: '기타', bass: '베이스', drums: '드럼', keys: '건반', lead: '리드 기타', vocals: '보컬', bvox: '코러스', perc: '퍼커션', strings: '스트링', synth: '신스', other: '그 외' };
const ROLE_C = { bvox: '#FF8FC8', perc: '#FFE14A', strings: '#C9A8FF', synth: '#5CF2C8', other: '#FFFFFF' };

/* ---------- audio context (shared) ---------- */
const AU = {
  ctx: null,
  get() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      this.ctx = new C({ latencyHint: 'interactive' });
      this.master = this.ctx.createGain(); this.master.gain.value = SETTINGS.vol;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  },
};

/* ---------- song registry ---------- */
const SONGS = [
  {
    id: 'count4', title: 'カウント四つ', sub: 'SIGNAL LOST · 1곡째 · 카운트 넷', bpm: 127, jk: 'img/jk/47.webp', chart: 'audio/count4/chart.json',
    stems: { vocals: 'audio/count4/vocals.mp3', bvox: 'audio/count4/bvox.mp3', drums: 'audio/count4/drums.mp3', bass: 'audio/count4/bass.mp3', guitar: 'audio/count4/guitar.mp3', keys: 'audio/count4/keys.mp3', perc: 'audio/count4/perc.mp3', strings: 'audio/count4/strings.mp3', synth: 'audio/count4/synth.mp3', other: 'audio/count4/other.mp3' },
  },
  {
    id: 'hanpaku', title: '半拍ずれたまま', sub: 'SIGNAL LOST · 2곡째 · 반 박자 어긋난 채로', bpm: 125, jk: 'img/jk/47.webp', chart: 'audio/hanpaku/chart.json',
    cutAt: 151,                                     // 2:31 — the sound dies here
    stems: { vocals: 'audio/hanpaku/vocals.mp3', bvox: 'audio/hanpaku/bvox.mp3', drums: 'audio/hanpaku/drums.mp3', bass: 'audio/hanpaku/bass.mp3', guitar: 'audio/hanpaku/guitar.mp3', keys: 'audio/hanpaku/keys.mp3', perc: 'audio/hanpaku/perc.mp3', synth: 'audio/hanpaku/synth.mp3', other: 'audio/hanpaku/other.mp3' },
  },
];

/* ---------- placeholder synth: renders each stem with an OfflineAudioContext ---------- */
const SYNTH = {
  rock1: {
    bpm: 172, key: 0,
    form: [['intro', 4], ['verse', 8], ['pre', 4], ['chorus', 8], ['break', 4], ['chorus', 8], ['outro', 4]],
  },
  rock2: {
    bpm: 176, key: 5,
    form: [['intro', 4], ['verse', 8], ['pre', 4], ['chorus', 8], ['verse', 4], ['pre', 4], ['chorus', 8], ['chorus', 8], ['outro', 4]],
  },
};
const PROG = {   // power-chord roots per bar (MIDI), cycled through each section
  intro: [40, 40, 48, 50], verse: [40, 40, 48, 50], pre: [45, 47, 48, 50],
  chorus: [48, 50, 43, 40], break: [45, 45, 48, 50], outro: [40, 48, 50, 40],
};

async function renderSynth(def, role, rate) {
  const beat = 60 / def.bpm, bar = beat * 4;
  const bars = [];
  for (const [sec, n] of def.form) for (let i = 0; i < n; i++) bars.push({ sec, i, n, root: PROG[sec][i % 4] + def.key, last: i === n - 1 });
  const lead = .1, dur = lead + bars.length * bar + 2.5;
  const c = new OfflineAudioContext(1, Math.ceil(dur * rate), rate);
  const out = c.createGain(); out.connect(c.destination);
  const noise = (() => { const b = c.createBuffer(1, rate, rate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const hz = m => 440 * 2 ** ((m - 69) / 12);
  const env = (g, t, a, v, hold, rel) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.setValueAtTime(v, t + a + hold); g.gain.exponentialRampToValueAtTime(.0005, t + a + hold + rel); };
  const nz = (t, type, f, q, v, a, d, dest = out) => { const s = c.createBufferSource(); s.buffer = noise; const bq = c.createBiquadFilter(); bq.type = type; bq.frequency.value = f; bq.Q.value = q; const g = c.createGain(); s.connect(bq).connect(g).connect(dest); env(g, t, a, v, 0, d); s.start(t, Math.random() * .5); s.stop(t + a + d + .05); };
  const tone = (t, type, f, v, a, hold, rel, dest = out, f2) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + hold + rel * .5); o.connect(g).connect(dest); env(g, t, a, v, hold, rel); o.start(t); o.stop(t + a + hold + rel + .05); return o; };
  const amp = (drive, lp) => {   // distortion chain for guitars
    const sh = c.createWaveShaper(), cv = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; cv[i] = Math.tanh(x * drive); }
    sh.curve = cv; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1600; pk.gain.value = 4;
    const g = c.createGain(); g.gain.value = .32; sh.connect(f).connect(pk).connect(g).connect(out); return sh;
  };
  const T = (b, bt) => lead + b * bar + bt * beat;

  if (role === 'drums') {
    const kick = (t, v = 1) => { tone(t, 'sine', 160, v, .002, .02, .3, out, 42); nz(t, 'highpass', 3000, .7, .25 * v, .001, .02); };
    const snare = (t, v = 1) => { nz(t, 'bandpass', 1900, .7, .7 * v, .001, .16); tone(t, 'triangle', 200, .35 * v, .001, .01, .08, out, 150); };
    const hat = (t, open, v = 1) => nz(t, 'highpass', 7500, .8, (open ? .26 : .2) * v, .001, open ? .22 : .045);
    const crash = t => { nz(t, 'highpass', 5200, .5, .45, .002, 1.5); nz(t, 'bandpass', 9000, .6, .2, .002, 1.1); };
    const tom = (t, f) => tone(t, 'sine', f, .75, .002, .02, .28, out, f * .62);
    bars.forEach((B, b) => {
      const t = bt => T(b, bt);
      if (B.sec === 'intro') {
        if (B.i < 2) { for (let k = 0; k < 8; k++) hat(t(k / 2), false, k % 2 ? .6 : 1); kick(t(0)); kick(t(2)); }
        else { kick(t(0)); snare(t(1)); kick(t(1.5)); kick(t(2)); snare(t(3)); for (let k = 0; k < 8; k++) hat(t(k / 2), false, k % 2 ? .6 : 1); }
        if (B.last) { for (let k = 0; k < 4; k++) snare(t(3 + k / 4), .6 + k * .12); }
      } else if (B.sec === 'verse') {
        if (B.i === 0) crash(t(0));
        kick(t(0)); kick(t(1.5)); kick(t(2)); snare(t(1)); snare(t(3));
        for (let k = 0; k < 8; k++) if (!(B.i === 0 && k === 0)) hat(t(k / 2), false, k % 2 ? .55 : 1);
      } else if (B.sec === 'pre') {
        kick(t(0)); kick(t(2)); snare(t(1)); snare(t(3));
        for (let k = 0; k < 4; k++) hat(t(k), true, .8);
        if (B.last) for (let k = 0; k < 8; k++) snare(t(k / 2), .5 + k * .06);
      } else if (B.sec === 'chorus') {
        if (B.i % 2 === 0) crash(t(0)); else hat(t(0), true);
        kick(t(0)); kick(t(1.5)); kick(t(2)); kick(t(2.5)); snare(t(1)); snare(t(3));
        for (let k = 1; k < 8; k++) hat(t(k / 2), true, k % 2 ? .5 : .8);
        if (B.last) { tom(t(3), 190); tom(t(3.25), 190); tom(t(3.5), 140); tom(t(3.75), 110); }
      } else if (B.sec === 'break') {
        kick(t(0)); snare(t(2)); for (let k = 0; k < 4; k++) hat(t(k), false, .8);
      } else if (B.sec === 'outro') {
        crash(t(0)); kick(t(0)); if (!B.last) { snare(t(2)); kick(t(2.5)); }
      }
    });
  } else if (role === 'guitar' || role === 'lead') {
    const isLead = role === 'lead', sh = amp(isLead ? 6 : 9, isLead ? 4200 : 3400);
    const pluck = (t, midi, len, mute, v = .5) => {
      const notes = isLead ? [midi] : [midi, midi + 7, midi + 12];
      for (const m of notes) for (const det of [-7, 6]) {
        const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = det;
        if (isLead && len > .3) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(25, t + len * .8); l.connect(lg).connect(o.detune); l.start(t); l.stop(t + len + .3); }
        f.type = 'lowpass'; f.frequency.value = mute ? 700 : 5000;
        o.connect(f).connect(g).connect(sh);
        env(g, t, .004, v / notes.length, mute ? .03 : len * .85, mute ? .06 : .18);
        o.start(t); o.stop(t + len + .4);
      }
    };
    bars.forEach((B, b) => {
      const t = bt => T(b, bt), r = B.root;
      if (!isLead) {
        if (B.sec === 'intro' && B.i >= 2) for (let k = 0; k < 8; k++) pluck(t(k / 2), r, beat / 2, true);
        else if (B.sec === 'verse') for (let k = 0; k < 8; k++) pluck(t(k / 2), r, beat / 2, k % 4 !== 0, k % 4 ? .45 : .6);
        else if (B.sec === 'pre') { pluck(t(0), r, beat, false); pluck(t(1), r, beat, false); pluck(t(2), r, beat * .5, false); pluck(t(2.5), r, beat * 1.5, false); }
        else if (B.sec === 'chorus') { pluck(t(0), r, beat * 1.5, false); pluck(t(1.5), r, beat, false); pluck(t(2.5), r, beat * .5, true); pluck(t(3), r, beat, false); }
        else if (B.sec === 'break') pluck(t(0), r, bar * .95, false);
        else if (B.sec === 'outro') pluck(t(0), r, B.last ? bar * 1.6 : bar * .9, false);
      } else {
        const m = r + 24;
        if (B.sec === 'intro') { const riff = [[0, 0, .5], [.5, 3, .5], [1, 5, .5], [1.5, 7, 1], [2.5, 5, .5], [3, 3, .5], [3.5, 0, .5]]; for (const [bt, st, l] of riff) pluck(t(bt), m + st, beat * l, false, .55); }
        else if (B.sec === 'verse' && B.i % 2 === 1) { pluck(t(2.5), m + 7, beat * .5, false, .4); pluck(t(3), m + 10, beat, false, .45); }
        else if (B.sec === 'chorus') {
          const ph = B.i % 2 ? [[0, 7, 1.5], [1.5, 5, .5], [2, 3, 2]] : [[0, 12, 2], [2, 10, 1], [3, 7, 1]];
          for (const [bt, st, l] of ph) pluck(t(bt), m + st, beat * l, false, .55);
        } else if (B.sec === 'break' && B.i % 2 === 0) pluck(t(0), m + 12, bar * 1.8, false, .5);
      }
    });
  } else if (role === 'bass') {
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(out);
    const note = (t, m, len, v = .7) => { tone(t, 'sawtooth', hz(m), v * .5, .004, len * .7, .08, lp); tone(t, 'sine', hz(m), v * .6, .004, len * .75, .08, out); };
    bars.forEach((B, b) => {
      const t = bt => T(b, bt), r = B.root - 12;
      if (B.sec === 'intro' && B.i >= 2) for (let k = 0; k < 8; k++) note(t(k / 2), r, beat / 2);
      else if (B.sec === 'verse') for (let k = 0; k < 8; k++) note(t(k / 2), r, beat * .45, k % 2 ? .55 : .75);
      else if (B.sec === 'pre') { note(t(0), r, beat); note(t(1), r + 12, beat * .5); note(t(1.5), r, beat * .5); note(t(2), r, beat); note(t(3), r + 7, beat); }
      else if (B.sec === 'chorus') for (let k = 0; k < 8; k++) note(t(k / 2), k % 2 ? r + 12 : r, beat * .45);
      else if (B.sec === 'break') note(t(0), r, bar * .9);
      else if (B.sec === 'outro') note(t(0), r, B.last ? bar * 1.5 : bar * .9);
    });
  } else if (role === 'keys') {
    const pad = (t, root, len) => { for (const st of [12, 16, 19]) { tone(t, 'triangle', hz(root + st + (st === 16 && PROG.chorus.includes(root - 0) ? 0 : 0)), .12, .06, len - .2, .5); tone(t, 'sine', hz(root + st + 12), .05, .06, len - .2, .5); } };
    const key = (t, m, len, v = .22) => { tone(t, 'square', hz(m), v * .35, .004, len * .6, .25); tone(t, 'triangle', hz(m), v, .004, len * .6, .3); };
    const mel = [[0, 76, 1], [1, 74, .5], [1.5, 72, .5], [2, 71, 1], [3, 72, .5], [3.5, 74, .5], [4, 76, 1.5], [5.5, 79, .5], [6, 78, 1], [7, 76, 1]];
    bars.forEach((B, b) => {
      const t = bt => T(b, bt), r = B.root;
      if (B.sec === 'verse' || B.sec === 'break' || B.sec === 'outro') { if (B.i % 2 === 0 || B.sec === 'outro') pad(t(0), r + 12, (B.sec === 'outro' ? 1 : 2) * bar); }
      else if (B.sec === 'pre') for (let k = 0; k < 8; k++) key(t(k / 2), r + 24 + [0, 4, 7, 12][k % 4] - (r % 12 === 11 || r % 12 === 4 ? 1 : 0), beat * .45, .18);
      else if (B.sec === 'chorus') { const off = (B.i % 2) * 4; for (const [bt, m, l] of mel) if (bt >= off && bt < off + 4) key(t(bt - off), m + def.key, beat * l); }
    });
  }
  return c.startRendering();
}

/* ---------- decoding / loading ---------- */
const STEM_CACHE = {};
async function loadStems(song, onStep = () => {}) {
  if (STEM_CACHE[song.id]) return STEM_CACHE[song.id];
  const ac = AU.get(), bufs = {};
  if (song.synth) {
    const def = SYNTH[song.synth];
    onStep('임시곡 합성 중');
    const roles = ['drums', 'bass', 'guitar', 'keys', 'lead'];
    const out = await Promise.all(roles.map(r => renderSynth(def, r, ac.sampleRate)));
    roles.forEach((r, i) => { bufs[r] = out[i]; });
  } else if (song.files) {
    for (const [r, f] of Object.entries(song.files)) { onStep(`${ROLE_KO[r] || r} 디코딩`); bufs[r] = await ac.decodeAudioData(f.data.slice(0)); }
  } else {
    onStep('스템 불러오는 중');
    const ent = Object.entries(song.stems);
    const got = await Promise.all(ent.map(async ([r, url]) => ac.decodeAudioData(await (await fetch(url)).arrayBuffer())));
    ent.forEach(([r], i) => { bufs[r] = got[i]; });
  }
  return (STEM_CACHE[song.id] = bufs);
}

/* analysis + tempo + every chart, cached per song */
const PREP = {};
async function prepareSong(song, onStep = () => {}) {
  if (PREP[song.id]) return PREP[song.id];
  const bufs = await loadStems(song, onStep);
  const dur0 = Math.max(...Object.values(bufs).map(b => b.duration));
  if (song.chart && !QS.get('rechart')) {                    // baked charts: no analysis on the player's machine
    try {
      onStep('채보 불러오는 중');
      const baked = await (await fetch(song.chart)).json();
      return (PREP[song.id] = { song, bufs, tm: baked.tm, dur: dur0, charts: baked.charts });
    } catch (e) { /* fall through to live analysis */ }
  }
  const an = {};
  for (const [r, b] of Object.entries(bufs)) {
    onStep(`${ROLE_KO[r] || r} 분석 중`);
    await new Promise(res => setTimeout(res, 16));              // let the loader repaint between stems
    an[r] = DSP.analyze(b, r);
  }
  onStep('템포 찾는 중');
  const src = an.drums || an.bass || Object.values(an)[0];
  const tm = DSP.tempo(src.nov, song.bpm, src.fps);       // bpm hint when known; the first-beat offset is always measured
  // downbeat: of the four beats in a bar, the one where kicks + crashes land hardest is "1"
  const beat = 60 / tm.bpm, bar = beat * 4, fl = an.drums || src, nv = fl.dnov || fl.nov;
  let bestK = 0, best = -1;
  for (let k = 0; k < 4; k++) {
    let sc = 0;
    for (let t = tm.offset + k * beat; t < (nv.length / fl.fps); t += bar) { const f = Math.round(t * fl.fps); for (let d = -1; d <= 1; d++) sc += nv[f + d] || 0; }
    if (sc > best) { best = sc; bestK = k; }
  }
  tm.offset = (tm.offset + bestK * beat) % bar;
  const firstOn = Math.min(...Object.values(an).map(a => Math.min(a.onsets[0] ? a.onsets[0].t : 99, ...Object.values(a.bands || {}).map(b => b[0] ? b[0].t : 99))));
  while (tm.offset > firstOn + .04) tm.offset -= bar;       // beat 0 sits on a downbeat at or before the first sound
  if (song.offset != null) tm.offset = song.offset;
  const dur = Math.max(...Object.values(bufs).map(b => b.duration));
  const charts = {};
  for (const [part, role] of Object.entries(PART_ROLE)) {
    const a = an[role];
    if (!a) continue;
    charts[part] = DIFFS.map((_, d) => Charter.make(a, tm, part, d));
  }
  for (const r of ['lead', 'vocals']) if (an[r]) charts[r] = DIFFS.map((_, d) => Charter.make(an[r], tm, 'GT', d));
  // shared notes: every extra stem charted, then combined into one layer per difficulty
  const ex = EXTRA_ROLES.filter(r => an[r]);
  if (ex.length) charts.EX = DIFFS.map((_, d) => Charter.extras(ex.map(r => [r, an[r]]), tm, d));
  return (PREP[song.id] = { song, bufs, an, tm, dur, charts });
}

/* ---------- user stems: file picker / drag-drop, persisted in IndexedDB ---------- */
const roleFromName = n => /back.*vo|chorus|bvox/i.test(n) ? 'bvox' : /perc/i.test(n) ? 'perc' : /drum|kit/i.test(n) ? 'drums' : /bass/i.test(n) ? 'bass'
  : /lead gu|solo/i.test(n) ? 'lead' : /guitar|gtr/i.test(n) ? 'guitar' : /string/i.test(n) ? 'strings' : /synth/i.test(n) ? 'synth'
  : /key|piano|organ/i.test(n) ? 'keys' : /vocal|vox|voice/i.test(n) ? 'vocals' : 'other';
const IDB = {
  open() { return new Promise((res, rej) => { const r = indexedDB.open('reamp', 1); r.onupgradeneeded = () => r.result.createObjectStore('stems'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async put(k, v) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('stems', 'readwrite'); tx.objectStore('stems').put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); },
  async get(k) { const db = await this.open(); return new Promise((res, rej) => { const q = db.transaction('stems').objectStore('stems').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); },
};
async function customSong(files) {
  const map = {};
  for (const f of files) { const r = roleFromName(f.name); map[r] = { name: f.name, data: await f.arrayBuffer() }; }
  const song = { id: 'custom-' + Date.now(), title: '내 스템', sub: Object.values(map).map(x => x.name).join(' · '), files: map, bpm: null, custom: true };
  try { await IDB.put('custom', { files: map, t: Date.now() }); } catch (e) {}
  return song;
}
async function savedCustom() {
  try { const v = await IDB.get('custom'); if (v && v.files) return { id: 'custom-' + v.t, title: '내 스템 (저장됨)', sub: Object.values(v.files).map(x => x.name).join(' · '), files: v.files, custom: true }; } catch (e) {}
  return null;
}

/* ---------- parties ---------- */
/* SIGNAL LOST, one year ago: you (your part, also the voice), Haru on lead guitar, and two members
   who fill whatever parts are left. They are only ever seen from behind. */
function signalParty(inst) {
  const rest = ['BA', 'DR', 'KEY'].filter(p => p !== inst).slice(0, 2);
  return [
    { id: 'haru', en: 'HARU', name: '하루', part: 'GT', role: 'lead', c: '#2EC7F0', icon: 'img/icon/haru.webp', cond: .9 },
    { id: 'soma', en: 'SOMA', name: '소마', part: rest[0], role: PART_ROLE[rest[0]], c: '#8FA8FF', blur: true, cond: .96 },
    { id: 'kiriya', en: 'KIRIYA', name: '키리야', part: rest[1], role: PART_ROLE[rest[1]], c: '#8FA8FF', blur: true, cond: .96 },
  ];
}
function bandParty(inst) {
  const all = [
    { id: 'natsu', en: 'NATSU', name: '나츠', part: 'GT', role: 'lead', c: '#FFC93A', cond: .6 },
    { id: 'koto', en: 'KOTO', name: '코토', part: 'BA', role: 'bass', c: '#9BD62A', cond: .8 },
    { id: 'ren', en: 'REN', name: '렌', part: 'DR', role: 'drums', c: '#FF7A3D', cond: .55 },
    { id: 'rei', en: 'REI', name: '레이', part: 'KEY', role: 'keys', c: '#A98BFF', cond: .92 },
  ];
  return all.filter(m => m.part !== inst || m.id === 'natsu').map(m => ({ ...m, icon: `img/icon/${m.id}.webp` }));
}
