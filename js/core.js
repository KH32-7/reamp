/* RE:AMP! — core: stage, router, input, motion helpers, overlays, save + settings.
   Carried over from the UI prototype; dev chrome (toolbar, illustration guide) removed. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const G = {
  K: 1, bpm: 120, gender: 'm', name: '나기', inst: 'GT', guide: false,
  cur: null, stack: [], busy: false, overlays: [], seenTutorial: false, paused: false,
  liveDay: false, diff: 1,
};
const QS = new URLSearchParams(location.search);

/* ---------- settings + save (localStorage; every access guarded) ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('reamp.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('reamp.' + k, JSON.stringify(v)); } catch (e) {} },
};
const SETTINGS = Object.assign({ vol: 1, offset: 0, speed: 1, noFail: false, partVol: 1.5, vocals: true }, store.get('settings', {}));
if (!(SETTINGS.partVol > 0)) SETTINGS.partVol = 1.5;   // your own instrument: ×1.5 over the record by default
if (SETTINGS.vol === .9) SETTINGS.vol = 1;   // the old default left the whole game a notch quiet
function saveSettings() { store.set('settings', SETTINGS); if (window.AU && AU.master) AU.master.gain.value = SETTINGS.vol; }
const SAVE = Object.assign({ profile: null, progress: null }, store.get('save', {}));
function writeSave() { store.set('save', SAVE); }
if (SAVE.profile) Object.assign(G, SAVE.profile);
/* face icons (A10) — duotone portraits in img/icon/, falls back to old crops */
const ICONS = ['rui', 'natsu', 'koto', 'ren', 'rei', 'haru', 'serizawa', 'mikami', 'fan', 'truth'];
function icon(f) {
  const id = String(f || '').split('_')[0];
  if (id === 'you') return `img/icon/you_${G.gender === 'f' ? 'f' : 'm'}.webp`;
  return ICONS.includes(id) ? `img/icon/${id}.webp` : `img/c/${f}.jpg`;
}

const EZ = {
  slam: 'cubic-bezier(.16,1,.3,1)',
  pop: 'cubic-bezier(.34,1.56,.64,1)',
  wipe: 'cubic-bezier(.7,0,.3,1)',
  pan: 'cubic-bezier(.76,0,.24,1)',
  soft: 'cubic-bezier(.4,0,.2,1)',
  lin: 'linear',
};
/* v0.2 tokens — roughly 2× the v0.1 values after playtest feedback ("too fast") */
const T = { snap: 60, pop: 220, slam: 300, wipe: 420, char: 620, step: 60 };

/* ---------- motion helpers ---------- */
function A(el, kf, dur, o = {}) {
  if (!el) return null;
  return el.animate(kf, {
    duration: dur * G.K, delay: (o.delay || 0) * G.K, easing: o.e || EZ.slam,
    fill: o.fill || 'backwards', composite: o.c || 'replace', pseudoElement: o.pe, iterations: o.it || 1,
  });
}
const KF = {
  fromLeft: (d = '-40%') => [{ translate: `${d} 0`, opacity: 0 }, { translate: '0 0', opacity: 1 }],
  fromRight: (d = '40%') => [{ translate: `${d} 0`, opacity: 0 }, { translate: '0 0', opacity: 1 }],
  fromTop: (d = '-40%') => [{ translate: `0 ${d}`, opacity: 0 }, { translate: '0 0', opacity: 1 }],
  fromBottom: (d = '40%') => [{ translate: `0 ${d}`, opacity: 0 }, { translate: '0 0', opacity: 1 }],
  fade: [{ opacity: 0 }, { opacity: 1 }],
  popIn: [{ scale: '1.5', opacity: 0 }, { scale: '1', opacity: 1 }],
  stamp: [{ scale: '2.2', rotate: '14deg', opacity: 0 }, { scale: '1', rotate: '0deg', opacity: 1 }],
  scaleX: [{ scale: '0 1' }, { scale: '1 1' }],
  scaleY: [{ scale: '1 0' }, { scale: '1 1' }],
  iris: [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }],
  wipeR: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
};
function stagger(els, kf, dur, start = 0, step = T.step, o = {}) {
  els.forEach((el, i) => A(el, kf, dur, { ...o, delay: start + i * step }));
}
function pop(el) { if (el) A(el, [{ scale: '1.2', rotate: '-4deg' }, { scale: '1', rotate: '0deg' }], T.pop, { e: EZ.pop }); }
function jolt(el) { if (el) A(el, [{ translate: '0 0' }, { translate: '5px -3px' }, { translate: '0 0' }], 110, { e: 'steps(2)' }); }
function shake(el) { A(el, [{ translate: '0 0' }, { translate: '-10px 0' }, { translate: '10px 0' }, { translate: '-6px 0' }, { translate: '0 0' }], 300, { e: EZ.lin }); }
function countUp(el, to, dur = 900, fmt = n => n.toLocaleString('en-US')) {
  const t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / (dur * G.K));
    el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1 && el.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- per-scene timers ---------- */
let TIMERS = [];
function later(fn, ms) { const id = setTimeout(fn, ms * G.K); TIMERS.push(id); return id; }
function every(fn, ms) { const id = setInterval(fn, ms * G.K); TIMERS.push(id); return id; }
function clearTimers() { TIMERS.forEach(id => { clearTimeout(id); clearInterval(id); }); TIMERS = []; }

/* ---------- discrete list selection ---------- */
function List(items, o = {}) {
  const L = {
    items, i: -1, cls: o.cls || 'sel',
    set(n, silent) {
      const len = L.items.length; if (!len) return;
      n = o.loop === false ? Math.max(0, Math.min(len - 1, n)) : (n + len) % len;
      if (n === L.i && !silent) return;
      if (L.items[L.i]) L.items[L.i].classList.remove(L.cls);
      L.i = n;
      const el = L.items[n]; el.classList.add(L.cls);
      if (!silent) { if (o.pop !== false) pop(o.popTarget ? o.popTarget(el) : el); if (o.jolt) jolt(o.jolt); }
      o.onChange && o.onChange(n, el, silent);
    },
    move(d) { L.set(L.i + d); },
    get el() { return L.items[L.i]; },
  };
  L.items.forEach((el, n) => {
    if (o.hover !== false) el.addEventListener('mouseenter', () => { if (!G.busy && !G.overlays.length) L.set(n); });
    el.addEventListener('click', e => { e.stopPropagation(); const was = L.i === n; L.set(n); if (o.onPick && (was || o.pickOnFirst)) o.onPick(n, el); });
  });
  L.set(o.start || 0, true);
  return L;
}

/* ---------- smooth scroller: animates a float position toward an integer target ----------
   layout(el, offset, i) positions each item from its signed distance to the current position. */
function Scroller(items, o = {}) {
  const S = {
    items, pos: o.start || 0, target: o.start || 0, raf: 0,
    get i() { return Math.round(S.target); },
    set(n, silent) {
      const len = S.items.length;
      n = o.loop ? n : Math.max(0, Math.min(len - 1, n));
      if (n === S.target && !silent) return;
      S.target = n;
      if (silent) S.pos = n;
      const idx = ((n % len) + len) % len;
      S.items.forEach((el, k) => el.classList.toggle('sel', k === idx));
      o.onChange && o.onChange(idx, S.items[idx], silent);
      S.kick();
    },
    move(d) { S.set(S.target + d); },
    kick() {
      if (S.raf) return;
      let last = performance.now();
      const tick = t => {
        const dt = Math.min(64, t - last); last = t;
        const k = 1 - Math.pow(1 - (o.ease || .16), dt / 16.7 / G.K);
        S.pos += (S.target - S.pos) * k;
        if (Math.abs(S.target - S.pos) < .001) S.pos = S.target;
        S.paint();
        S.raf = S.pos === S.target ? 0 : requestAnimationFrame(tick);
      };
      S.raf = requestAnimationFrame(tick);
    },
    paint() {
      const len = S.items.length;
      S.items.forEach((el, k) => {
        let off = k - S.pos;
        if (o.loop) { off = ((off % len) + len) % len; if (off > len / 2) off -= len; }
        o.layout(el, off, k);
      });
    },
    get idx() { const len = S.items.length; return ((S.target % len) + len) % len; },
  };
  items.forEach((el, k) => el.addEventListener('click', e => {
    e.stopPropagation();
    if (k === S.idx) o.onPick && o.onPick(k, el);
    else { let d = k - S.idx; if (o.loop && Math.abs(d) > items.length / 2) d -= Math.sign(d) * items.length; S.set(S.target + d); }
  }));
  S.set(S.target, true); S.paint();
  return S;
}

/* ---------- shared markup helpers ---------- */
const bgImg = (name, cls = '') => `<div class="bgimg ${cls}" style="background-image:url(img/bg/${name}.webp)"></div>`;
const bigWord = (w, cls = '') => `<div class="bigword ${cls}" aria-hidden="true">${w}</div>`;
const dateChip = () => typeof weekChip === 'function' ? weekChip() : '<div class="datechip"><b>4월</b><span>—<small></small></span><i class="moon"></i><em></em></div>';   // week.js fills it from SAVE.game
const backChip = () => `<span class="backchip" data-tap="back">◀ BACK</span>`;
const KEYLABEL = { A: 'Z', B: 'X', L: 'Q', R: 'E', Y: 'Y', P: 'P' };
function hint(keys, right) {
  return `<div class="hint">${keys.map(([k, t]) => `<span data-key="${k}"><span class="k">${KEYLABEL[k] || k}</span>${t}</span>`).join('')}${right ? `<span class="right">${right}</span>` : ''}</div>`;
}
const KEYNAME = { A: 'ok', B: 'back', L: 'l1', R: 'r1', P: 'pause', Y: 'y' };

/* ---------- stage + scenes ---------- */
const SC = {};
function scene(id, def) { SC[id] = def; }
let stage, fx, guideLayer, overlayRoot;

function buildScenes() {
  for (const [id, def] of Object.entries(SC)) {
    const sec = document.createElement('section');
    sec.className = `scene screen ${def.cls || ''}`;
    sec.dataset.scene = id;
    sec.innerHTML = `<div class="s">${typeof def.html === 'function' ? def.html() : def.html}</div>`;
    stage.insertBefore(sec, fx);
    def.el = sec;
    def.init && def.init(sec);
    $$('.hint [data-key]', sec).forEach(h => h.addEventListener('click', e => { e.stopPropagation(); dispatch(KEYNAME[h.dataset.key] || h.dataset.key); }));
  }
}

function swap(id, arg) {
  const prev = G.cur && SC[G.cur];
  if (prev) { clearTimers(); prev.leave && prev.leave(); prev.el.classList.remove('on'); }
  G.cur = id;
  const next = SC[id];
  next.el.classList.add('on');
  next.enter && next.enter(arg);
}

const VIA = {
  ink(done) {
    const [a, b] = [$('.fx-ink1', fx), $('.fx-ink2', fx)];
    const x = `${20 + Math.random() * 30}% ${30 + Math.random() * 30}%`;
    const kf = [{ clipPath: `circle(0% at ${x})`, opacity: 1 }, { clipPath: `circle(150% at ${x})`, opacity: 1 }];
    A(a, kf, 300, { e: EZ.wipe, fill: 'forwards' });
    A(b, kf, 300, { e: EZ.wipe, delay: 90, fill: 'forwards' });
    setTimeout(() => {
      done();
      A(a, [{ opacity: 1 }, { opacity: 0 }], 260, { fill: 'forwards' });
      A(b, [{ clipPath: `circle(150% at ${x})` }, { clipPath: `circle(0% at 110% 110%)` }], 420, { e: EZ.wipe, fill: 'forwards' });
    }, 400 * G.K);
    return 820;
  },
  iris(done) {
    const c = $('.fx-iris', fx);
    A(c, [{ clipPath: 'circle(0% at 100% 100%)' }, { clipPath: 'circle(160% at 100% 100%)' }], 280, { e: EZ.wipe, fill: 'forwards' });
    setTimeout(() => {
      done();
      A(c, [{ clipPath: 'circle(160% at 0% 0%)' }, { clipPath: 'circle(0% at 0% 0%)' }], 320, { e: EZ.wipe, fill: 'forwards' });
    }, 300 * G.K);
    return 640;
  },
  // white panel sweeps in, the blue one right behind it; swap; blue leaves first, then white
  slam(done) {
    const el = fxEl('fx-slide', '<i></i><b></b>'), w = $('i', el), b = $('b', el);
    A(w, [{ translate: '-115% 0' }, { translate: '0 0' }], 300, { e: EZ.slam, fill: 'forwards' });
    A(b, [{ translate: '-115% 0' }, { translate: '0 0' }], 300, { e: EZ.slam, delay: 110, fill: 'forwards' });
    setTimeout(() => {
      done();
      A(b, [{ translate: '0 0' }, { translate: '115% 0' }], 340, { e: EZ.wipe, fill: 'forwards' });
      A(w, [{ translate: '0 0' }, { translate: '115% 0' }], 340, { e: EZ.wipe, delay: 110, fill: 'forwards' });
    }, 460 * G.K);
    return 920;
  },
  cut(done) { done(); return 0; },
};

/* vertical camera pan: previous scene slides up, next rises from below, with speed lines */

/* ---- screen-specific transitions (v0.3) ---- */
function fxEl(cls, html = '') {
  let el = $('.' + cls, fx);
  if (!el) { el = document.createElement('div'); el.className = cls; el.innerHTML = html; fx.appendChild(el); }
  return el;
}
Object.assign(VIA, {
  // diagonal cobalt band with a white leading edge sweeps across
  sweep(done, dir = 1) {
    const el = fxEl('fx-sweep', '<i></i><b></b>');
    const from = dir > 0 ? 'polygon(-40% 0,-10% 0,-40% 100%,-70% 100%)' : 'polygon(140% 0,170% 0,140% 100%,110% 100%)';
    const full = 'polygon(-40% 0,140% 0,110% 100%,-70% 100%)';
    const to = dir > 0 ? 'polygon(140% 0,170% 0,140% 100%,110% 100%)' : 'polygon(-40% 0,-10% 0,-40% 100%,-70% 100%)';
    [$('i', el), $('b', el)].forEach((p, n) => {
      A(p, [{ clipPath: from }, { clipPath: full }], 340, { e: EZ.wipe, delay: n * 60, fill: 'forwards' });
      setTimeout(() => A(p, [{ clipPath: full }, { clipPath: to }], 380, { e: EZ.wipe, delay: (1 - n) * 50, fill: 'forwards' }), 460 * G.K);
    });
    setTimeout(done, 420 * G.K);
    return 900;
  },
  sweepBack(done) { return VIA.sweep(done, -1); },
  // stage curtain: two panels close to a red seam, then open
  curtain(done) {
    const el = fxEl('fx-curtain', '<i></i><i></i><b></b>');
    const [l, r] = $$('i', el), seam = $('b', el);
    A(l, [{ translate: '-101% 0' }, { translate: '0 0' }], 380, { e: EZ.wipe, fill: 'forwards' });
    A(r, [{ translate: '101% 0' }, { translate: '0 0' }], 380, { e: EZ.wipe, fill: 'forwards' });
    A(seam, [{ scale: '1 0', opacity: 1 }, { scale: '1 1', opacity: 1 }], 200, { delay: 330, fill: 'forwards' });
    setTimeout(() => {
      done();
      A(seam, [{ opacity: 1 }, { opacity: 0 }], 150, { fill: 'forwards' });
      A(l, [{ translate: '0 0' }, { translate: '-101% 0' }], 520, { e: EZ.wipe, delay: 60, fill: 'forwards' });
      A(r, [{ translate: '0 0' }, { translate: '101% 0' }], 520, { e: EZ.wipe, delay: 60, fill: 'forwards' });
    }, 600 * G.K);
    return 1200;
  },
  // horizontal slats close top-down, then open bottom-up
  shutter(done) {
    const el = fxEl('fx-shutter', '<i></i>'.repeat(9));
    const bars = $$('i', el);
    bars.forEach((b, n) => A(b, [{ scale: '1 0' }, { scale: '1 1' }], 220, { e: EZ.slam, delay: n * 30, fill: 'forwards' }));
    setTimeout(() => {
      done();
      bars.forEach((b, n) => A(b, [{ scale: '1 1' }, { scale: '1 0' }], 240, { e: EZ.wipe, delay: (bars.length - n) * 30, fill: 'forwards' }));
    }, 520 * G.K);
    return 1100;
  },
  // push into the scene: old one zooms and flashes out, new one settles from 1.12
  zoom(done) {
    const flash = fxEl('fx-flash');
    const prev = G.cur && SC[G.cur];
    if (prev) A(prev.el, [{ scale: '1', filter: 'brightness(1)' }, { scale: '1.25', filter: 'brightness(1.8)' }], 360, { e: EZ.wipe });
    A(flash, [{ opacity: 0 }, { opacity: 1 }], 340, { e: EZ.wipe, fill: 'forwards' });
    setTimeout(() => {
      done();
      const next = SC[G.cur];
      A(next.el, [{ scale: '1.12' }, { scale: '1' }], 700, { e: EZ.slam });
      A(flash, [{ opacity: 1 }, { opacity: 0 }], 460, { fill: 'forwards' });
    }, 360 * G.K);
    return 900;
  },
  // cyan scan line reveals the next screen top to bottom
  scan(done) {
    const line = fxEl('fx-scan', '<i></i>');
    const prevEl = G.cur && SC[G.cur].el;
    done();
    const next = SC[G.cur];
    if (prevEl && prevEl !== next.el) { prevEl.classList.add('on'); prevEl.style.zIndex = 0; next.el.style.zIndex = 1; }
    A(next.el, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], 700, { e: EZ.soft });
    A(line, [{ translate: '0 0', opacity: 1 }, { translate: '0 900px', opacity: 1 }], 700, { e: EZ.soft, fill: 'forwards' });
    setTimeout(() => {
      A(line, [{ opacity: 1 }, { opacity: 0 }], 200, { fill: 'forwards' });
      if (prevEl && prevEl !== next.el) { prevEl.classList.remove('on'); prevEl.style.zIndex = ''; next.el.style.zIndex = ''; }
    }, 720 * G.K);
    return 800;
  },
  // dip to deep blue
  fade(done) {
    const flash = fxEl('fx-dip');
    A(flash, [{ opacity: 0 }, { opacity: 1 }], 300, { e: EZ.soft, fill: 'forwards' });
    setTimeout(() => { done(); A(flash, [{ opacity: 1 }, { opacity: 0 }], 420, { e: EZ.soft, fill: 'forwards' }); }, 320 * G.K);
    return 760;
  },
});
VIA.iris = VIA.sweepBack;   // v0.3: the old circular iris is retired; "back" is a reverse sweep

/* vertical camera pan */
function pan(id, arg, dir = 1) {
  const prev = SC[G.cur], next = SC[id];
  const dur = 1000;
  clearTimers(); prev.leave && prev.leave();
  next.el.classList.add('on');
  G.cur = id;
  const lines = $('.fx-pan', fx);
  A(lines, [{ opacity: 0 }, { opacity: 1, offset: .4 }, { opacity: 1, offset: .6 }, { opacity: 0 }], dur, { e: EZ.lin });
  A($('i', lines), [{ translate: `0 ${dir > 0 ? 0 : -50}%` }, { translate: `0 ${dir > 0 ? -50 : 0}%` }], dur, { e: EZ.lin });
  A(prev.el, [{ translate: '0 0', }, { translate: `0 ${-100 * dir}%` }], dur, { e: EZ.pan, fill: 'forwards' })
    .finished.then(() => { prev.el.classList.remove('on'); prev.el.getAnimations().forEach(a => a.cancel()); });
  A(next.el, [{ translate: `0 ${100 * dir}%` }, { translate: '0 0' }], dur, { e: EZ.pan });
  setTimeout(() => next.enter && next.enter(arg), dur * .55 * G.K);
  return dur;
}

function go(id, o = {}) {
  if (G.busy || !SC[id]) return;
  closeAllOverlays();
  if (o.push !== false && G.cur && G.cur !== id) G.stack.push(G.cur);
  G.busy = true;
  const via = o.via || SC[id].via || 'sweep';
  const t = via === 'pan' ? pan(id, o.arg, o.dir || 1) : VIA[via](() => swap(id, o.arg));
  setTimeout(() => { G.busy = false; }, (t + 40) * G.K);
}
function back() {
  const def = SC[G.cur];
  if (def.back === false) return;
  if (typeof def.back === 'function') return def.back();
  const to = def.back || G.stack.pop();
  if (!to) return;
  if (def.back) G.stack.pop();
  go(to, { via: 'sweepBack', push: false });
}

/* ---------- input ---------- */
const KEYMAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right',
  Enter: 'ok', z: 'ok', Z: 'ok', ' ': 'ok',
  Escape: 'back', x: 'back', X: 'back', Backspace: 'back',
  q: 'l1', Q: 'l1', e: 'r1', E: 'r1', p: 'pause', P: 'pause', y: 'y', Y: 'y',
};
function dispatch(k) {
  if (G.busy) return;
  const top = G.overlays[G.overlays.length - 1];
  if (top) { const r = top.key(k); if (r === undefined && k === 'back') top.close(); return; }
  const def = SC[G.cur];
  const r = def.key ? def.key(k) : undefined;
  if (r === undefined && k === 'back') back();
}
document.addEventListener('keydown', e => {
  const t = e.target;
  const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
  if (typing && !['Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  const k = KEYMAP[e.key];
  if (!k) return;
  if (SC[G.cur] && SC[G.cur].rawKeys) return;          // the live scene reads the keyboard itself
  e.preventDefault();
  if (e.repeat && (k === 'ok' || k === 'back')) return;
  dispatch(k);
});
let wheelLock = 0;
function onWheel(e) {
  e.preventDefault();
  const now = performance.now();
  if (now - wheelLock < 130) return;
  const dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (Math.abs(dy) < 4) return;
  wheelLock = now;
  const def = SC[G.cur];
  const horiz = !G.overlays.length && def.wheel === 'x';
  dispatch(dy > 0 ? (horiz ? 'right' : 'down') : (horiz ? 'left' : 'up'));
}

/* ---------- overlays: modal, toast, tutorial ---------- */
function openOverlay(o) { G.overlays.push(o); return o; }
function closeOverlay(o) { G.overlays = G.overlays.filter(x => x !== o); }
function closeAllOverlays() { [...G.overlays].reverse().forEach(o => o.close(true)); G.overlays = []; }

function modal({ title, body = '', buttons = [{ t: '확인' }], tone = 'ink', asset }) {
  const el = document.createElement('div');
  el.className = `modal tone-${tone}`;
  el.innerHTML = `<div class="md-dim"></div><div class="md-box"${asset ? ` data-asset="${asset}"` : ''}>
    <div class="md-title">${title}</div><div class="md-body">${body}</div>
    <div class="md-btns">${buttons.map(b => `<span class="md-btn">${b.t}</span>`).join('')}</div></div>`;
  overlayRoot.appendChild(el);
  const box = $('.md-box', el);
  A($('.md-dim', el), KF.fade, T.slam);
  A(box, [{ scale: '1 0', opacity: 0 }, { scale: '1 1', opacity: 1 }], T.slam);
  const ov = {
    close(instant) {
      closeOverlay(ov);
      if (instant) return el.remove();
      A(box, [{ scale: '1 1', opacity: 1 }, { scale: '1 0', opacity: 0 }], 200, { e: EZ.wipe, fill: 'forwards' });
      A($('.md-dim', el), [{ opacity: 1 }, { opacity: 0 }], 220, { fill: 'forwards' });
      setTimeout(() => el.remove(), 230 * G.K);
    },
    key(k) {
      if (k === 'left' || k === 'up') L.move(-1);
      else if (k === 'right' || k === 'down') L.move(1);
      else if (k === 'ok') pick(L.i);
      else if (k === 'back') { if (answered) return true; answered = true; ov.close(); const c = buttons.find(b => b.cancel); c && c.fn && c.fn(); }
      return true;
    },
  };
  // one answer per dialog: the box lingers ~0.2s while it closes, and a second click there used to run the action twice
  let answered = false;
  const pick = n => { if (answered) return; answered = true; ov.close(); const b = buttons[n]; setTimeout(() => b.fn && b.fn(), 240 * G.K); };
  const L = List($$('.md-btn', el), { onPick: n => pick(n) });
  openOverlay(ov);
  return ov;
}
function confirmBox(title, body, yes, no) {
  return modal({ title, body, buttons: [{ t: '예', fn: yes }, { t: '아니오', fn: no, cancel: true }] });
}
function toast(text, tone = '') {
  const el = document.createElement('div');
  el.className = `toast ${tone}`;
  el.innerHTML = `<span>${text}</span>`;
  overlayRoot.appendChild(el);
  A(el, KF.fromRight('60%'), T.slam);
  setTimeout(() => {
    A(el, [{ translate: '0 0', opacity: 1 }, { translate: '60% 0', opacity: 0 }], T.slam, { fill: 'forwards' });
    setTimeout(() => el.remove(), 320 * G.K);
  }, 2400);
}
function saving() {
  const el = document.createElement('div');
  el.className = 'saving';
  el.innerHTML = '<i></i>SAVING';
  overlayRoot.appendChild(el);
  A(el, KF.fromBottom('100%'), T.slam);
  setTimeout(() => el.remove(), 1800);
}
function tutorial({ title, body, asset }) {
  return modal({ title: `<small>TUTORIAL</small>${title}`, body, buttons: [{ t: '알겠어' }], tone: 'tut', asset });
}

/* ---------- preloading ----------
   Every image is fetched and decoded before a screen asks for it, so swaps (gender, instrument, expressions)
   are instant. EARLY (manifest.js) gates the loading screen; LATE, the videos and the song stems stream in behind. */
const PRE = { early: 0, earlyDone: 0, keep: [], ready: null };
function loadImages(list, onEach, conc = 6) {
  return new Promise(res => {
    let i = 0, done = 0;
    if (!list.length) return res();
    const next = () => {
      if (i >= list.length) return;
      const im = new Image();
      im.decoding = 'async';
      const fin = () => { done++; onEach && onEach(); if (done === list.length) res(); else next(); };
      im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(fin);
      im.onerror = fin;
      im.src = list[i++];
      PRE.keep.push(im);                       // hold a reference so the decoded bitmap stays warm
    };
    for (let k = 0; k < Math.min(conc, list.length); k++) next();
  });
}
function warm(urls) {                          // one at a time, low priority: fills the HTTP cache for later fetches
  return urls.reduce((p, u) => p.then(() => fetch(u, { priority: 'low' }).then(r => r.blob()).catch(() => {})), Promise.resolve());
}
function startPreload() {
  if (PRE.ready || typeof IMG_EARLY === 'undefined') return PRE.ready || Promise.resolve();
  PRE.early = IMG_EARLY.length;
  PRE.ready = loadImages(IMG_EARLY, () => { PRE.earlyDone++; });
  PRE.ready.then(() => loadImages(IMG_LATE, null, 4)).then(() => {
    const songs = typeof SONGS !== 'undefined' ? SONGS.filter(x => x.stems) : [];
    return warm([...WARM_LATE, ...songs.flatMap(x => [x.chart, ...Object.values(x.stems)])]);
  });
  return PRE.ready;
}

/* ---------- boot ---------- */
function fit() {
  const vp = $('#viewport');
  const s = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
  G.scale = s;
  stage.style.transform = `scale(${s})`;
  vp.style.width = 1600 * s + 'px';
  vp.style.height = 900 * s + 'px';
  SC[G.cur] && SC[G.cur].resize && SC[G.cur].resize();
}
function setBeat() { document.documentElement.style.setProperty('--beat', 60 / G.bpm + 's'); }

function boot() {
  stage = $('#stage'); fx = $('#fx'); overlayRoot = $('#overlays');
  buildScenes();
  stage.addEventListener('click', e => { const t = e.target.closest('[data-tap]'); if (t) { e.stopPropagation(); dispatch(t.dataset.tap); } });
  stage.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', fit);
  setBeat();
  fit();
  startPreload();
  const shot = QS.get('shot');
  if (shot && SC[shot]) {   // dev hook for headless screenshots: ?shot=<scene>&arg=<n>
    G.seenTutorial = true;
    document.body.classList.add('shotmode');
    const arg = QS.get('arg');
    swap(shot, arg !== null ? (isNaN(+arg) ? arg : +arg) : undefined);
  } else if (QS.get('selftest')) selftest();
  else if (QS.get('op')) swap('opening');
  else if (QS.get('lab')) swap('lab');
  else if (QS.get('play')) swap('live', { song: QS.get('play'), part: QS.get('inst') || 'GT', diff: +(QS.get('diff') || 1), scenario: QS.get('sc') || 'lab', auto: QS.get('auto') === '1', from: +(QS.get('from') || 0), party: QS.get('party') || undefined });
  else if (QS.get('story')) Story.start(QS.get('story'), +(QS.get('step') || 0));
  else swap('loading');
}
async function selftest() {
  const errs = [], wait = ms => new Promise(r => setTimeout(r, ms));
  window.addEventListener('error', e => errs.push(e.message));
  window.addEventListener('unhandledrejection', e => errs.push('rej ' + e.reason));
  for (const id of ['title', 'save', 'create', 'adv', 'lab', 'result']) {
    try { G.busy = false; closeAllOverlays(); swap(id); await wait(400); for (const k of ['down', 'up', 'left', 'right']) { G.busy = false; dispatch(k); await wait(80); } } catch (e) { errs.push(id + ': ' + e.message); }
  }
  document.body.dataset.selftest = errs.length ? errs.join(' | ') : 'OK';
}
document.addEventListener('DOMContentLoaded', boot);
