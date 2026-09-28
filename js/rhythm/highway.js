/* RE:AMP! rhythm — the highway renderer. One canvas, four instruments, each with its own board:
   GT  FRETBOARD  strings that ring when struck, pick-shaped notes, frets on the beat
   BA  LOW END    fat strings, heavy slabs, a sub cone that thumps under the line
   DR  KIT        drum heads at the line, kick as a full-width bar, crashes throw sparks
   KEY KEYS       a real keyboard at the line, light tiles, pillars of light on each hit */
'use strict';

const THEME = {
  GT: { name: 'FRETBOARD', acc: '#2EC7F0', hi: '#BFF6FF', note: ['#FFFFFF', '#46E0FF'], top: '#0A1550', bot: '#1A34B8', halfW: 270 },
  BA: { name: 'LOW END', acc: '#9B6BFF', hi: '#E3D6FF', note: ['#F3EDFF', '#9B6BFF'], top: '#0E0838', bot: '#2E1685', halfW: 280 },
  DR: { name: 'KIT', acc: '#FF7A3D', hi: '#FFE0C8', note: ['#FFFFFF', '#FF7A3D'], top: '#0B0F3A', bot: '#2A1868', halfW: 300 },
  KEY: { name: 'KEYS', acc: '#FF4FA0', hi: '#FFD6EA', note: ['#FFFFFF', '#FF4FA0'], top: '#0A1248', bot: '#1C2C96', halfW: 290 },
};
const KEYS_LABEL = { 4: ['D', 'F', 'J', 'K'], 5: ['D', 'F', 'J', 'K', 'SPACE'] };
const DRUM = [{ n: 'HH', c: '#FFE14A' }, { n: 'SN', c: '#DDE6FF' }, { n: 'TOM', c: '#FF7A3D' }, { n: 'CR', c: '#FFC93A' }];

const THEME_DEAD = { acc: '#7C84A8', hi: '#C9CCE0', note: ['#FFFFFF', '#9AA0BC'], top: '#0C0D18', bot: '#262838' };
function Highway(cv, live, o = {}) {
  const part = live.part, TH0 = THEME[part];
  let th = TH0;
  const N = part === 'DR' ? 4 : live.lanes;
  const ctx = cv.getContext('2d');
  const CX = 800, LINE = 772, HOR = 140, Dz = 1, SFAR = .15;
  const halfW = th.halfW, laneW = halfW * 2 / N;
  let K = 1;
  const H = {
    fx: [], lane: [...Array(5)].map(() => ({ hit: 0, press: 0, miss: 0, vib: 0, vibT: 0 })), kick: 0, thump: 0, shake: 0, punch: 0,
    ghost: false, handsStop: 0, silence: 0, amp: 0, beatPulse: 0, flashEye: null,
    resize(k) { K = k; cv.width = 1600 * k; cv.height = 900 * k; },
  };
  H.resize(o.k || 1);

  /* ---------- projection ---------- */
  const speed = () => 2.1 * (SETTINGS.speed || 1);
  const sOf = dt => { const z = dt * speed(); return z >= 0 ? Dz / (Dz + z) : 1 - z * .55; };
  const yOf = s => HOR + (LINE - HOR) * s;
  const xOf = (lane, s) => CX + (-halfW + (lane + .5) * laneW) * s;
  const edge = s => halfW * s;

  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
  const para = (x, y, w, h, k) => { ctx.beginPath(); ctx.moveTo(x - w / 2 + k, y - h / 2); ctx.lineTo(x + w / 2 + k, y - h / 2); ctx.lineTo(x + w / 2 - k, y + h / 2); ctx.lineTo(x - w / 2 - k, y + h / 2); ctx.closePath(); };
  const alphaFar = s => Math.max(0, Math.min(1, (s - SFAR) / .08));

  /* ---------- particles ---------- */
  function burst(x, y, c, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = (o.dir ?? -Math.PI / 2) + (Math.random() - .5) * (o.spread ?? Math.PI * 1.4), v = (o.v || 520) * (.35 + Math.random() * .8);
      H.fx.push({ k: o.k || 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: o.g ?? 900, life: 0, max: (o.life || .45) * (.6 + Math.random() * .6), c, r: o.r || 2.5 + Math.random() * 2.5 });
    }
  }
  const ring = (x, y, c, o = {}) => H.fx.push({ k: 'ring', x, y, c, life: 0, max: o.life || .35, r0: o.r0 || 20, r1: o.r1 || 90, sy: o.sy || .35, w: o.w || 5 });
  const text = (x, y, s, c, o = {}) => H.fx.push({ k: 'text', x, y, s, c, life: 0, max: o.life || .7, vy: o.vy ?? -90, size: o.size || 26 });

  /* called by the scene on each judgement */
  H.hit = (n, k) => {
    const L = H.lane[n.lane] || H.lane[0];
    if (k === 3) { L.miss = 1; H.shake = Math.max(H.shake, n.kind === 'kick' ? 5 : 3.5); return; }
    L.hit = 1; L.vib = part === 'BA' ? 16 : 9; L.vibT = 0;
    const x = n.kind === 'kick' ? CX : xOf(n.lane, 1), y = LINE, gold = k === 0;
    const c = n.kind === 'cover' || n.kind === 'extra' ? (n.c || '#FF4FA0') : gold ? '#FFF6B8' : th.hi;
    glow(n, k, x);
    if (part === 'GT') {
      H.fx.push({ k: 'slash', x, y, life: 0, max: .18, c: gold ? '#FFFFFF' : th.hi });
      burst(x, y, c, gold ? 9 : 5, { v: 620, spread: Math.PI * 1.1 });
      ring(x, y, th.acc, { r1: 90, w: 3 });
    } else if (part === 'BA') {
      H.thump = Math.max(H.thump, gold ? 7 : 5);
      ring(x, y, th.acc, { r0: 30, r1: 170, sy: .22, w: 5, life: .38 });
      ring(x, y, '#FFFFFF', { r0: 10, r1: 110, sy: .3, w: 3, life: .3 });
      burst(x, y, c, gold ? 8 : 5, { v: 380, spread: Math.PI * .9, r: 4 });
    } else if (part === 'DR') {
      if (n.kind === 'kick') {
        H.kick = 1; H.punch = Math.max(H.punch, gold ? 1 : .7);
        ring(CX, LINE + 10, '#FF7A3D', { r0: 80, r1: 330, sy: .14, w: 4, life: .32 });
        burst(CX - halfW * .9, LINE, '#FFB27A', 3, { dir: -Math.PI * .6, spread: .8, v: 500 });
        burst(CX + halfW * .9, LINE, '#FFB27A', 3, { dir: -Math.PI * .4, spread: .8, v: 500 });
      } else {
        const d = DRUM[n.lane];
        ring(x, y, d.c, { r0: 14, r1: laneW * .62, sy: .38, w: 3, life: .26 });
        ring(x, y, '#FFFFFF', { r0: 8, r1: laneW * .45, sy: .38, w: 2, life: .22 });
        if (n.lane === 3) burst(x, y - 10, '#FFE9A0', gold ? 18 : 12, { k: 'star', v: 700, spread: Math.PI * 1.5, life: .6, r: 3 });
        else burst(x, y, d.c, gold ? 9 : 6, { v: 480 });
      }
    } else {
      H.fx.push({ k: 'pillar', x, lane: n.lane, life: 0, max: .5, c: n.kind === 'cover' ? (n.c || th.acc) : th.acc });
      for (let i = 0; i < (gold ? 2 : 1); i++) H.fx.push({ k: 'note', x: x + (Math.random() - .5) * 40, y: y - 30, vx: (Math.random() - .5) * 60, vy: -160 - Math.random() * 90, life: 0, max: 1, c: i ? '#FFFFFF' : th.hi, g: 0, ch: ['♪', '♫', '♩'][Math.random() * 3 | 0] });
      burst(x, y, c, gold ? 10 : 6, { v: 420, r: 2.5 });
    }
    if (n.kind === 'cover') { text(x, y - 60, 'COVER!', n.c || '#FF4FA0', { size: 30 }); burst(x, y, '#FFFFFF', 10, { v: 700 }); }
  };
  /* the glow: a light column shooting up the lane + diamond flares on the line (additive) */
  function glow(n, k, x) {
    const col = n.kind === 'cover' || n.kind === 'extra' ? (n.c || '#FF4FA0') : n.kind === 'kick' ? '#FF7A3D' : th.acc, gold = k === 0;
    if (n.kind === 'kick') { H.fx.push({ k: 'diamond', x: CX, y: LINE, life: 0, max: .28, c: col, r: 60, sx: 3.2, ring: true }); return; }
    const old = H.fx.find(p => p.k === 'column' && p.lane === n.lane);
    if (old) Object.assign(old, { life: 0, c: col, h: gold ? 1 : .75 });
    else H.fx.push({ k: 'column', lane: n.lane, life: 0, max: .3, c: col, h: gold ? 1 : .75 });
    H.fx.push({ k: 'diamond', x, y: LINE, life: 0, max: .26, c: '#FFFFFF', r: laneW * (gold ? .3 : .24), sx: 1.5 });
    H.fx.push({ k: 'diamond', x, y: LINE, life: 0, max: .36, c: col, r: laneW * (gold ? .56 : .46), sx: 1.5, ring: true });
    const m = gold ? 3 : 1;
    for (let i = 0; i < m; i++) H.fx.push({ k: 'diamond', x: x + (Math.random() - .5) * laneW * .8, y: LINE - 10, vy: -120 - Math.random() * 160, life: 0, max: .5 + Math.random() * .3, c: i % 2 ? '#FFFFFF' : col, r: 7 + Math.random() * 8, sx: 1, float: true });
  }
  /* perspective quad for a lane between two depths */
  function laneQuad(lane, sA, sB, wk = 1) {
    const hw = laneW / 2 * wk;
    ctx.beginPath();
    ctx.moveTo(xOf(lane, sA) - hw * sA, yOf(sA)); ctx.lineTo(xOf(lane, sA) + hw * sA, yOf(sA));
    ctx.lineTo(xOf(lane, sB) + hw * sB, yOf(sB)); ctx.lineTo(xOf(lane, sB) - hw * sB, yOf(sB)); ctx.closePath();
  }
  function column(lane, amt, c, h = 1) {
    amt *= .6;
    const top = Math.max(SFAR + .05, 1 - .55 * h), yT = yOf(top);
    const g = ctx.createLinearGradient(0, LINE, 0, yT);
    g.addColorStop(0, c + 'AA'); g.addColorStop(.22, c + '55'); g.addColorStop(1, c + '00');
    ctx.globalAlpha = amt; ctx.fillStyle = g; laneQuad(lane, 1, top, .98); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = amt * .5; laneQuad(lane, 1.006, .992, .9); ctx.fill();   // hot white base
  }
  H.ghostHit = (n, k) => {
    if (k === 3) return;
    const x = xOf(n.lane, 1);
    ring(x, LINE, n.rec ? '#FFE14A' : '#9AA0BC', { r0: 10, r1: laneW * .5, sy: .35, w: 2, life: .3 });
  };
  H.press = (lane, on) => { if (H.lane[lane]) H.lane[lane].press = on ? 1 : H.lane[lane].press; H.lane[lane].down = on; };

  /* ---------- board ---------- */
  function board(t) {
    const yF = yOf(SFAR), yN = LINE + 46;
    const sN = 1 + 46 / (LINE - HOR);
    const g = ctx.createLinearGradient(0, yF, 0, yN);
    g.addColorStop(0, th.top + '00'); g.addColorStop(.25, th.top + 'CC'); g.addColorStop(1, th.bot + 'EE');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(CX - edge(SFAR), yF); ctx.lineTo(CX + edge(SFAR), yF); ctx.lineTo(CX + edge(sN), yN); ctx.lineTo(CX - edge(sN), yN); ctx.closePath(); ctx.fill();
    // lane tint columns (keys look like keys running into the distance)
    if (part === 'KEY' || part === 'DR') for (let i = 0; i < N; i++) {
      if (i % 2) continue;
      ctx.fillStyle = part === 'KEY' ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.18)';
      const a = -halfW + i * laneW, b = a + laneW;
      ctx.beginPath(); ctx.moveTo(CX + a * SFAR, yF); ctx.lineTo(CX + b * SFAR, yF); ctx.lineTo(CX + b * sN, yN); ctx.lineTo(CX + a * sN, yN); ctx.fill();
    }
    // separators
    ctx.lineWidth = 1;
    for (let i = 1; i < N; i++) {
      const a = -halfW + i * laneW;
      ctx.strokeStyle = part === 'DR' ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.07)';
      if (part === 'GT' || part === 'BA') continue;
      ctx.beginPath(); ctx.moveTo(CX + a * SFAR, yF); ctx.lineTo(CX + a * sN, yN); ctx.stroke();
    }
    // beat / bar lines (frets)
    const b0 = Math.ceil(Charter.beatOf(live.tm, t - .3)), b1 = Math.floor(Charter.beatOf(live.tm, t + 3.2));
    for (let b = b0; b <= b1; b++) {
      const s = sOf(Charter.timeOf(live.tm, b) - t);
      if (s < SFAR || s > sN) continue;
      const y = yOf(s), w = edge(s), bar = b % 4 === 0, a = alphaFar(s);
      ctx.globalAlpha = a * (bar ? .5 : part === 'BA' ? .2 : .13);
      ctx.fillStyle = bar ? th.hi : '#FFFFFF';
      ctx.fillRect(CX - w, y - (bar ? 1.5 : .75) * s * 1.6, w * 2, (bar ? 3 : 1.5) * s * 1.6);
      if (part === 'GT' && bar && (b / 4) % 2 === 0) {          // fret inlay dots
        ctx.globalAlpha = a * .35; ctx.fillStyle = th.hi;
        ctx.beginPath(); ctx.ellipse(CX, y - 14 * s, 6 * s, 3 * s, 0, 0, 7); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // edges: glow brighter with heat, pulse on the beat
    const pulse = .55 + .45 * H.beatPulse, ampK = H.amp;
    ctx.save();
    ctx.shadowColor = th.acc; ctx.shadowBlur = 14 + ampK * 20;
    ctx.strokeStyle = th.acc; ctx.lineWidth = 4 + ampK * 2; ctx.globalAlpha = .75 * pulse + ampK * .25;
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(CX + sg * edge(SFAR), yF); ctx.lineTo(CX + sg * edge(sN), yN); ctx.stroke(); }
    ctx.restore();
    if (ampK > 0) {                                                     // AMP: light streaks racing down the edges
      ctx.save(); ctx.globalAlpha = ampK * .8; ctx.fillStyle = '#FFFFFF';
      for (let k = 0; k < 3; k++) {
        const u = ((t * 1.6 + k / 3) % 1), s = SFAR + (1 - SFAR) * u * u, y = yOf(s);
        for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(CX + sg * edge(s), y, 3 + 5 * s, 16 * s, 0, 0, 7); ctx.fill(); }
      }
      ctx.restore();
    }
  }

  /* strings for GT / BA: a line per lane that rings when struck */
  function strings(t, dt) {
    if (part !== 'GT' && part !== 'BA') return;
    const yF = yOf(SFAR), sN = 1 + 46 / (LINE - HOR);
    for (let i = 0; i < N; i++) {
      const L = H.lane[i];
      L.vib *= Math.pow(part === 'BA' ? .02 : .006, dt); L.vibT += dt;
      const held = live.holding[i], amp = L.vib + (held ? (part === 'BA' ? 5 : 3) : 0);
      const wBase = part === 'BA' ? 3.2 + (N - i) * .9 : 1.4 + (N - i) * .45;
      ctx.strokeStyle = L.down || held ? '#FFFFFF' : th.hi;
      ctx.globalAlpha = L.down || held ? .95 : .38;
      ctx.lineWidth = wBase;
      if (L.down || held) { ctx.shadowColor = th.acc; ctx.shadowBlur = 16; }
      ctx.beginPath();
      const seg = 28;
      for (let k = 0; k <= seg; k++) {
        const u = k / seg, s = SFAR + (sN - SFAR) * u, y = yF + (LINE + 46 - yF) * u;
        const env = Math.sin(Math.PI * Math.min(1, u * 1.05)) * u;
        const x = xOf(i, s) + amp * env * Math.sin(u * (part === 'BA' ? 7 : 11) + L.vibT * (part === 'BA' ? 38 : 70));
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  /* eye-contact zones: a tinted stretch of road in the member's colour */
  function eyes(t) {
    for (const w of live.eyes) {
      if (w.done && !w.fail && t > w.t1 + .4) continue;
      const s0 = sOf(w.t0 - t), s1 = sOf(w.t1 - t);
      if (s0 < SFAR || s1 > 1.1) continue;
      const a = Math.max(SFAR, s1), b = Math.min(1.08, s0), ya = yOf(a), yb = yOf(b);
      const g = ctx.createLinearGradient(0, ya, 0, yb);
      g.addColorStop(0, w.c + '00'); g.addColorStop(.2, w.c + (w.fail ? '18' : '40')); g.addColorStop(1, w.c + (w.fail ? '10' : '55'));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(CX - edge(a), ya); ctx.lineTo(CX + edge(a), ya); ctx.lineTo(CX + edge(b), yb); ctx.lineTo(CX - edge(b), yb); ctx.fill();
      if (s1 > SFAR + .02 && s1 < 1) {
        ctx.save(); ctx.globalAlpha = alphaFar(s1) * (w.fail ? .4 : 1);
        ctx.font = `${Math.round(13 + 16 * s1)}px "Dela Gothic One"`; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center';
        ctx.fillText(w.fail ? '— — —' : `EYE CONTACT · ${w.en}`, CX, ya - 6); ctx.restore();
      }
    }
  }

  /* ---------- receptors (the judgement line) ---------- */
  function receptors(t, dt) {
    const pulse = H.beatPulse;
    // line
    ctx.save();
    ctx.shadowColor = th.acc; ctx.shadowBlur = 18 + pulse * 14;
    ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = .85;
    ctx.fillRect(CX - halfW - 8, LINE - 2, halfW * 2 + 16, 4);
    ctx.restore();
    for (let i = 0; i < N; i++) {
      const L = H.lane[i], x = xOf(i, 1), d = L.down ? 1 : 0;
      L.hit = Math.max(0, L.hit - dt * 5); L.miss = Math.max(0, L.miss - dt * 4); L.press = Math.max(d, L.press - dt * 7);
      if (live.holding[i]) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; column(i, .45 + .12 * Math.sin(t * 34), (live.holding[i].c) || th.acc, .7); ctx.restore(); }
      // pressed beam up the lane
      if (L.press > 0 && part !== 'KEY') {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(0, LINE, 0, LINE - 320);
        g.addColorStop(0, th.acc + '66'); g.addColorStop(1, th.acc + '00');
        ctx.globalAlpha = L.press * .8; ctx.fillStyle = g;
        const s2 = sOf(.9);
        ctx.beginPath(); ctx.moveTo(xOf(i, 1) - laneW / 2 + 3, LINE); ctx.lineTo(xOf(i, 1) + laneW / 2 - 3, LINE);
        ctx.lineTo(xOf(i, s2) + laneW / 2 * s2, yOf(s2)); ctx.lineTo(xOf(i, s2) - laneW / 2 * s2, yOf(s2)); ctx.fill();
        ctx.restore(); ctx.globalAlpha = 1;
      }
      if (part === 'GT') {
        ctx.lineWidth = 3; ctx.strokeStyle = L.miss > 0 ? `rgba(255,80,110,${.5 + L.miss * .5})` : th.hi;
        para(x, LINE, laneW * .8, 26, 7); ctx.globalAlpha = .9; ctx.stroke();
        if (L.press > 0 || L.hit > 0) { ctx.fillStyle = th.acc; ctx.globalAlpha = Math.max(L.press * .5, L.hit * .9); para(x, LINE, laneW * .8 * (1 + L.hit * .12), 26 * (1 + L.hit * .2), 7); ctx.fill(); }
      } else if (part === 'BA') {
        ctx.lineWidth = 4; ctx.strokeStyle = L.miss > 0 ? `rgba(255,80,110,${.5 + L.miss * .5})` : th.hi;
        rr(x - laneW * .43, LINE - 17, laneW * .86, 34, 17); ctx.globalAlpha = .85; ctx.stroke();
        if (L.press > 0 || L.hit > 0) { ctx.fillStyle = th.acc; ctx.globalAlpha = Math.max(L.press * .5, L.hit * .9); rr(x - laneW * .43, LINE - 17, laneW * .86, 34, 17); ctx.fill(); }
      } else if (part === 'DR') {
        const d = DRUM[i], sq = 1 - L.hit * .18, r = laneW * .4;
        ctx.globalAlpha = 1;
        const g = ctx.createRadialGradient(x, LINE - 4, 2, x, LINE, r);
        g.addColorStop(0, L.press > 0 ? '#FFFFFF' : '#2A2F66'); g.addColorStop(1, L.press > 0 ? d.c : '#121640');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, LINE, r, r * .36 * sq, 0, 0, 7); ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = L.miss > 0 ? '#FF506E' : d.c; ctx.stroke();
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(x, LINE, r * .8, r * .29 * sq, 0, 0, 7); ctx.stroke();
        if (L.hit > 0) { ctx.globalAlpha = L.hit * .45; ctx.fillStyle = d.c; ctx.beginPath(); ctx.ellipse(x, LINE, r * (1 + (1 - L.hit) * .4), r * .36, 0, 0, 7); ctx.fill(); }
        ctx.globalAlpha = .8; ctx.fillStyle = d.c; ctx.font = '12px "DotGothic16"'; ctx.textAlign = 'center'; ctx.fillText(d.n, x, LINE + r * .36 + 16);
      }
      ctx.globalAlpha = 1;
    }
    // kick bar receptor
    if (part === 'DR') {
      H.kick = Math.max(0, H.kick - dt * 4);
      const L = H.lane[4], on = Math.max(H.kick, L.down ? .6 : 0);
      ctx.save(); ctx.shadowColor = '#FF7A3D'; ctx.shadowBlur = 10 + on * 30;
      ctx.fillStyle = L.miss > 0 ? '#FF506E' : '#FF7A3D'; ctx.globalAlpha = .45 + on * .55;
      rr(CX - halfW - 4, LINE + 30, halfW * 2 + 8, 10 + on * 6, 6); ctx.fill(); ctx.restore();
      L.miss = Math.max(0, L.miss - dt * 4);
      ctx.fillStyle = '#FFD2B8'; ctx.globalAlpha = .7; ctx.font = '12px "DotGothic16"'; ctx.textAlign = 'center'; ctx.fillText('KICK · SPACE', CX, LINE + 64); ctx.globalAlpha = 1;
    }
    // keyboard for KEY
    if (part === 'KEY') {
      for (let i = 0; i < N; i++) {
        const L = H.lane[i], x = xOf(i, 1), d = Math.max(L.press, L.hit * .7), dy = d * 5;
        const g = ctx.createLinearGradient(0, LINE, 0, LINE + 92);
        g.addColorStop(0, d > .05 ? '#FFD6EA' : '#F4F6FF'); g.addColorStop(1, d > .05 ? '#FF7FBC' : '#C9D4FF');
        ctx.fillStyle = g; rr(x - laneW / 2 + 3, LINE + 4 + dy, laneW - 6, 88 - dy, 8); ctx.fill();
        ctx.fillStyle = 'rgba(20,27,77,.35)'; ctx.fillRect(x - laneW / 2 + 3, LINE + 86, laneW - 6, 6);
        if (L.miss > 0) { ctx.fillStyle = `rgba(255,80,110,${L.miss * .6})`; rr(x - laneW / 2 + 3, LINE + 4, laneW - 6, 88, 8); ctx.fill(); }
        ctx.fillStyle = '#141B4D'; ctx.globalAlpha = .55; ctx.font = '16px "Dela Gothic One"'; ctx.textAlign = 'center'; ctx.fillText(KEYS_LABEL[4][i], x, LINE + 76 + dy); ctx.globalAlpha = 1;
      }
      for (const i of [1, 3]) { const x = CX - halfW + i * laneW; ctx.fillStyle = '#141B4D'; rr(x - 17, LINE + 2, 34, 50, 5); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x - 12, LINE + 5, 24, 5); }
    } else {
      ctx.font = '15px "Dela Gothic One"'; ctx.textAlign = 'center';
      for (let i = 0; i < N; i++) { const L = H.lane[i]; ctx.fillStyle = L.down ? th.acc : 'rgba(234,240,255,.55)'; ctx.fillText(KEYS_LABEL[4][i], xOf(i, 1), part === 'DR' ? LINE + 100 : LINE + 44); }
    }
  }

  /* ---------- notes ---------- */
  function note(n, t) {
    const dt = n.t - t;
    if (n.j !== null && !(n.len && n.hold === 'on')) {
      if (n.j < 3 || n.ghost) return;
      if (dt < -.35) return;                          // missed: slide past the line and fade
    }
    const s = sOf(dt);
    if (s < SFAR || s > 1.45) return;
    const a = alphaFar(s) * (n.j === 3 ? Math.max(0, 1 + dt * 3) * .45 : 1);
    if (a <= 0) return;
    const y = yOf(s);
    ctx.globalAlpha = a;
    if (n.ghost) {
      const gx = xOf(n.lane, s), gw = laneW * s * .74, gh = 16 * s + 4;
      if (n.rec) {                                   // RECOVER notes: solid yellow, glowing — the one thing still lit
        const pulse = .8 + .2 * Math.sin(t * 14);
        ctx.save(); ctx.globalAlpha = a * pulse; ctx.shadowColor = '#FFE14A'; ctx.shadowBlur = 22;
        const g = ctx.createLinearGradient(0, y - gh / 2, 0, y + gh / 2); g.addColorStop(0, '#FFFBD6'); g.addColorStop(1, '#FFD21A');
        ctx.fillStyle = g; para(gx, y, gw, gh, 5 * s); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = '#141B4D'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.restore(); ctx.globalAlpha = 1; return;
      }
      ctx.globalAlpha = a * (H.handsStop ? .08 : .22);
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
      para(gx, y, gw, gh, 5 * s); ctx.stroke();
      ctx.globalAlpha = 1; return;
    }
    if (n.kind === 'kick') {
      const w = edge(s) * 1.92, h = 11 * s + 4;
      const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#FFD2B8'); g.addColorStop(1, '#FF5A3D');
      ctx.fillStyle = g; rr(CX - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
      ctx.strokeStyle = '#141B4D'; ctx.lineWidth = 2; ctx.stroke();
      ctx.globalAlpha = 1; return;
    }
    const x = xOf(n.lane, s), cover = n.kind === 'cover', rec = n.rec;
    const extra = n.kind === 'extra', c0 = cover || extra ? '#FFFFFF' : th.note[0], c1 = cover || extra ? (n.c || '#FF4FA0') : n.eye != null ? (live.eyes[n.eye] && live.eyes[n.eye].c) || th.note[1] : th.note[1];
    // hold body first
    if (n.len) {
      const tail = n.end - t, st = Math.max(SFAR, sOf(tail)), sh = n.hold === 'on' ? 1 : s, yt = yOf(st), yh = yOf(sh);
      const wk = part === 'KEY' ? .72 : part === 'BA' ? .86 : .8;
      const on = n.hold === 'on', drop = n.hold === 'drop';
      ctx.save(); ctx.globalCompositeOperation = drop ? 'source-over' : 'lighter';
      ctx.globalAlpha = a * (drop ? .18 : on ? .6 + .12 * Math.sin(t * 30) : .45);
      const g = ctx.createLinearGradient(0, yt, 0, yh); g.addColorStop(0, c1 + '10'); g.addColorStop(.5, c1 + '60'); g.addColorStop(1, c1 + (on ? 'CC' : 'AA'));
      ctx.fillStyle = g; laneQuad(n.lane, sh, st, wk); ctx.fill();
      // bright rails on both sides of the ribbon
      ctx.strokeStyle = on ? '#FFFFFF' : c1; ctx.lineWidth = 2.5; ctx.globalAlpha = a * (drop ? .2 : on ? 1 : .7);
      for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(xOf(n.lane, sh) + sg * laneW / 2 * wk * sh, yh); ctx.lineTo(xOf(n.lane, st) + sg * laneW / 2 * wk * st, yt); ctx.stroke(); }
      ctx.restore();
      if (on) { if (Math.random() < .6) H.fx.push({ k: 'diamond', x: xOf(n.lane, 1) + (Math.random() - .5) * laneW * .6, y: LINE - 6, vy: -140 - Math.random() * 120, life: 0, max: .45, c: Math.random() < .5 ? '#FFFFFF' : c1, r: 5 + Math.random() * 6, sx: 1, float: true }); return; }
      ctx.globalAlpha = a;
    }
    const w = laneW * s, g = ctx.createLinearGradient(0, y - 14 * s, 0, y + 14 * s);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.strokeStyle = '#0B1033'; ctx.lineWidth = 2.5;
    if (extra) {                                     // shared notes: a gem, same on every instrument, tinted by the stem
      const hw = w * .3, hh = 16 * s + 5;
      ctx.save(); ctx.shadowColor = c1; ctx.shadowBlur = 12 * s;
      ctx.beginPath(); ctx.moveTo(x, y - hh); ctx.lineTo(x + hw, y); ctx.lineTo(x, y + hh); ctx.lineTo(x - hw, y); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.moveTo(x, y - hh * .6); ctx.lineTo(x + hw * .35, y - hh * .1); ctx.lineTo(x, y); ctx.lineTo(x - hw * .35, y - hh * .1); ctx.fill();
    }
    else if (part === 'GT') { para(x, y, w * .8, 20 * s + 6, 7 * s); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.85)'; para(x, y - 5 * s, w * .56, 3 * s, 4 * s); ctx.fill(); }
    else if (part === 'BA') { rr(x - w * .44, y - (14 * s + 3), w * .88, 28 * s + 6, 14 * s + 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; rr(x - w * .32, y - 9 * s, w * .64, 4 * s, 2 * s); ctx.fill(); }
    else if (part === 'DR') {
      const d = DRUM[n.lane], r = w * .38;
      const rg = ctx.createRadialGradient(x, y - r * .1, 1, x, y, r); rg.addColorStop(0, '#FFFFFF'); rg.addColorStop(.55, cover ? c1 : d.c); rg.addColorStop(1, '#141B4D');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(x, y, r, r * .42, 0, 0, 7); ctx.fill(); ctx.stroke();
    } else { rr(x - w * .36, y - (11 * s + 3), w * .72, 22 * s + 6, 8 * s + 2); ctx.save(); ctx.shadowColor = c1; ctx.shadowBlur = 14 * s; ctx.fill(); ctx.restore(); ctx.stroke(); }
    if (cover) {                                     // COVER tag + flicker ring
      ctx.globalAlpha = a * (.6 + .4 * Math.sin(t * 22));
      ctx.strokeStyle = c1; ctx.lineWidth = 3; rr(x - w * .5, y - 16 * s - 5, w, 32 * s + 10, 8 * s); ctx.stroke();
      ctx.globalAlpha = a; ctx.font = `${Math.round(9 + 8 * s)}px "DotGothic16"`; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.fillText('COVER', x, y - 20 * s - 6);
    }
    if (rec) {
      ctx.save(); ctx.globalAlpha = a * (.75 + .25 * Math.sin(t * 16)); ctx.shadowColor = '#FFE14A'; ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(255,225,74,.35)'; rr(x - w * .5, y - 16 * s - 5, w, 32 * s + 10, 8 * s); ctx.fill();
      ctx.strokeStyle = '#FFE14A'; ctx.lineWidth = 3.5; ctx.stroke(); ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  function notes(t) {
    const list = live.notes;
    // chord connectors (same time, 2+ lanes)
    let i = Math.max(0, live.mi - 8);
    const vis = [];
    for (; i < list.length; i++) { const n = list[i]; if (n.t - t > 3.6 / (SETTINGS.speed || 1)) break; vis.push(n); }
    ctx.lineWidth = 3;
    for (let k = 1; k < vis.length; k++) {
      const a = vis[k - 1], b = vis[k];
      if (Math.abs(a.t - b.t) > .002 || a.j !== null || b.j !== null || a.kind === 'kick' || b.kind === 'kick' || a.ghost) continue;
      const s = sOf(a.t - t); if (s < SFAR) continue;
      ctx.globalAlpha = alphaFar(s) * .5; ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath(); ctx.moveTo(xOf(a.lane, s), yOf(s)); ctx.lineTo(xOf(b.lane, s), yOf(s)); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let k = vis.length - 1; k >= 0; k--) note(vis[k], t);
  }

  /* ---------- member mini lanes ---------- */
  const SLOT = [[508, 1], [558, 1], [1042, -1], [1092, -1]];
  function members(t, dt) {
    const top = 250, bot = 590, span = 1.4;
    live.members.forEach((m, i) => {
      const [x] = SLOT[i] || SLOT[0], w = 28;
      m.flash = Math.max(0, m.flash - dt * 5);
      const dead = m.dropped;
      ctx.save();
      ctx.globalAlpha = dead ? .35 : .9;
      const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, 'rgba(11,16,51,0)'); g.addColorStop(1, 'rgba(11,16,51,.75)');
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, top, w, bot - top);
      ctx.strokeStyle = dead ? '#56619A' : m.c; ctx.lineWidth = 2; ctx.globalAlpha *= .6;
      ctx.beginPath(); ctx.moveTo(x - w / 2, top + 40); ctx.lineTo(x - w / 2, bot); ctx.lineTo(x + w / 2, bot); ctx.lineTo(x + w / 2, top + 40); ctx.stroke();
      ctx.globalAlpha = dead ? .35 : 1;
      // notes
      for (let k = Math.max(0, m.ni - 3); k < m.notes.length; k++) {
        const n = m.notes[k], d = n.t - t;
        if (d > span) break;
        if (d < -.15) continue;
        const y = bot - (bot - top) * (d / span);
        ctx.fillStyle = n.bad && d < .05 ? '#FF506E' : dead ? '#56619A' : m.c;
        ctx.globalAlpha = (dead ? .35 : 1) * Math.min(1, (span - d) / .25) * (d < 0 ? .4 : 1);
        ctx.fillRect(x - w / 2 + 4, y - 3, w - 8, 6);
        if (n.len) { ctx.globalAlpha *= .4; ctx.fillRect(x - 3, bot - (bot - top) * (Math.min(span, n.end - t) / span), 6, (bot - top) * (Math.min(span, n.end - t) - Math.max(0, d)) / span); }
      }
      // hit flash
      if (m.flash > 0 && !dead) { ctx.globalAlpha = m.flash; ctx.fillStyle = m.lastBad ? '#FF506E' : '#FFFFFF'; ctx.shadowColor = m.c; ctx.shadowBlur = 16; ctx.fillRect(x - w / 2 - 3, bot - 4, w + 6, 8); ctx.shadowBlur = 0; }
      ctx.globalAlpha = dead ? .5 : 1;
      ctx.font = '13px "Dela Gothic One"'; ctx.textAlign = 'center'; ctx.fillStyle = dead ? '#56619A' : m.c;
      ctx.fillText(m.part, x, bot + 20);
      ctx.font = '10px "DotGothic16"'; ctx.fillStyle = 'rgba(234,240,255,.7)'; ctx.fillText(m.en, x, bot + 34);
      if (m.warn > 0 && !dead) { m.warn = Math.max(0, m.warn - dt); ctx.globalAlpha = (Math.sin(t * 20) > 0 ? 1 : .3); ctx.fillStyle = '#FF4FA0'; ctx.font = '26px "Dela Gothic One"'; ctx.fillText('!', x, top + 24); }
      if (dead) { ctx.globalAlpha = .9; ctx.fillStyle = '#FF506E'; ctx.font = '11px "DotGothic16"'; ctx.save(); ctx.translate(x + 4, (top + bot) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('NO SIGNAL', 0, 0); ctx.restore(); }
      ctx.restore();
    });
  }

  /* ---------- fx ---------- */
  function fx(dt) {
    H.fx = H.fx.filter(p => (p.life += dt) < p.max);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const p of H.fx) {
      const u = p.life / p.max;
      ctx.globalAlpha = 1 - u;
      if (p.k === 'column') { column(p.lane, (1 - u) ** 1.6, p.c, p.h * (.7 + u * .5)); continue; }
      if (p.k === 'diamond') {
        if (p.float) { p.y += p.vy * dt; p.vy *= Math.pow(.2, dt); }
        const r = p.float ? p.r * (1 - u * .5) : p.r * (.45 + .75 * (1 - (1 - u) ** 3));
        ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.sx, .42);
        ctx.shadowColor = p.c; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
        if (p.ring) { ctx.strokeStyle = p.c; ctx.globalAlpha = (1 - u) * .85; ctx.lineWidth = 4 * (1 - u) + 1; ctx.stroke(); }
        else { ctx.fillStyle = p.c; ctx.globalAlpha = (1 - u) * (p.float ? .85 : .5); ctx.fill(); }
        ctx.restore(); continue;
      }
      if (p.k === 'spark' || p.k === 'star') {
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.fillStyle = p.c;
        if (p.k === 'star') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(u * 3); ctx.fillRect(-p.r * 2, -.8, p.r * 4, 1.6); ctx.fillRect(-.8, -p.r * 2, 1.6, p.r * 4); ctx.restore(); }
        else { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); ctx.strokeStyle = p.c; ctx.lineWidth = p.r; ctx.stroke(); }
      } else if (p.k === 'ring') {
        const r = p.r0 + (p.r1 - p.r0) * (1 - (1 - u) ** 3);
        ctx.strokeStyle = p.c; ctx.lineWidth = p.w * (1 - u) + .5;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, r, r * p.sy, 0, 0, 7); ctx.stroke();
      } else if (p.k === 'slash') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-.35); ctx.fillStyle = p.c;
        const w = laneW * (1.1 + u * .8), h = 10 * (1 - u) + 2; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
      } else if (p.k === 'pillar') {
        const h = 520 * (1 - (1 - u) ** 2), g = ctx.createLinearGradient(0, LINE, 0, LINE - h);
        g.addColorStop(0, p.c + 'CC'); g.addColorStop(1, p.c + '00');
        ctx.fillStyle = g; ctx.fillRect(p.x - laneW * .36 * (1 - u * .5), LINE - h, laneW * .72 * (1 - u * .5), h);
        ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = (1 - u) * .8; ctx.fillRect(p.x - 2, LINE - h, 4, h);
      } else if (p.k === 'note') {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx += Math.sin(p.life * 8) * 40 * dt;
        ctx.fillStyle = p.c; ctx.font = '30px "Dela Gothic One"'; ctx.textAlign = 'center'; ctx.fillText(p.ch, p.x, p.y);
      } else if (p.k === 'text') {
        p.y += p.vy * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.transform(1, 0, -.2, 1, 0, 0); const sc = 1 + Math.max(0, .25 - u) * 2; ctx.scale(sc, sc);
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = `${p.size}px "Dela Gothic One"`; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = '#141B4D'; ctx.strokeText(p.s, 0, 0); ctx.fillStyle = p.c; ctx.fillText(p.s, 0, 0); ctx.restore();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* ---------- frame ---------- */
  let last = performance.now();
  H.draw = (t, p = performance.now()) => {
    const dt = Math.min(.05, (p - last) / 1000); last = p;
    const bph = Charter.beatOf(live.tm, t);
    th = live.bo || live.silence ? { ...TH0, ...THEME_DEAD } : TH0;       // grey board, drawn here so yellow notes stay yellow
    H.beatPulse = bph > 0 && !live.bo ? Math.exp(-(bph % 1) * 5) : 0;
    H.amp += ((live.amp ? 1 : 0) - H.amp) * Math.min(1, dt * 4);
    H.thump *= Math.pow(.001, dt); H.shake *= Math.pow(.0005, dt); H.punch *= Math.pow(.002, dt);
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.clearRect(0, 0, 1600, 900);
    const sx = (Math.random() - .5) * H.shake * 2, sy = H.thump + (Math.random() - .5) * H.shake;
    const pk = 1 + H.punch * .018;
    ctx.setTransform(K * pk, 0, 0, K * pk, K * (sx + CX * (1 - pk)), K * (sy + LINE * (1 - pk)));
    if (part === 'BA') {                                 // sub cone under the line
      const r = 150 + H.beatPulse * 14 + H.thump * 6;
      ctx.save(); ctx.globalAlpha = .35 + H.thump * .06;
      for (let k = 0; k < 4; k++) { ctx.strokeStyle = k % 2 ? '#9B6BFF' : '#E3D6FF'; ctx.lineWidth = 3 - k * .5; ctx.beginPath(); ctx.ellipse(CX, LINE + 10, r * (1 - k * .22), r * .3 * (1 - k * .22), 0, 0, 7); ctx.stroke(); }
      ctx.restore();
    }
    board(t);
    eyes(t);
    strings(t, dt);
    receptors(t, dt);
    notes(t);
    fx(dt);
    ctx.setTransform(K, 0, 0, K, 0, 0);
    members(t, dt);
  };
  return H;
}
