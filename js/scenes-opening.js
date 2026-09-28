/* Opening 1 · cold open (NEW GAME → this → create).
   Everything the world saw happens on a screen: a desktop at 02:14 (the person who cuts the clip) → a phone (everyone else).
   The only shot outside any screen is the cable — the truth nobody saw.
   Two user-edited clips (12fps) are played; everything else is DOM/canvas/WebAudio. Timed to 172bpm. */
'use strict';

const OP_VIDEO = {
  // the user's edits, played whole (only re-encoded to 12fps)
  crowd: { src: 'video/op_crowd.mp4' },
  cable: { src: 'video/op_cable.mp4', throwAt: 4.5 },   // logo + flatline land when the cable is thrown
};
const OP_LINE = '그때 기억은 이제 잘 나지 않는다.';
const OP_BPM = 172, OP_BEAT = 60000 / OP_BPM, OP_BAR = OP_BEAT * 4;
const OP_CHAT = {
  before: ['후렴 온다', 'SIGNAL LOST 최고', '👏👏', '여기 현장ㅋㅋ', '센터 오늘 미쳤다', '데뷔 축하해!!'],
  after: ['?', '소리 안 나옴', '내 폰만?', '??????', '방송사고?', '뭐야 얼었어', '음향 나감', '새로고침 해봄', 'ㅋㅋㅋㅋㅋ', '왜 가만히 있음', '??'],
};
const OP_POST = {
  clip: ['@bluehour_live', '【방송사고】 SIGNAL LOST 무대 도중 47초 무음… 센터는 그대로 굳어버림'],
  comments: [['@yuu_rockin', 'ㅋㅋㅋㅋ 아무것도 안 함'], ['@tanaka_m', '데뷔 앞둔 밴드 맞냐'], ['@riff_daily', '음향사고가 아니라 실력사고'], ['@minori_07', 'SIGNAL LOST 끝났네']],
  quotes: ['ㅋㅋㅋㅋ', '이거 봄?', '47초 버티기 챌린지', '↻↻↻'],
  remix: ['🔁 LOOP', '0.5x', '8BIT', 'slowed+reverb', '자막 ver.', '리액션', 'AI 커버', '47초 풀버전'],
  dissent: ['@anon_2231', '근데 원본은? 관객 소리가 너무 조용하지 않음?'],
  buried: [['@sora_fes', '현장에 있었는데 이게 다가 아님…'], ['@beatbox_x', '밈 템플릿 확정'], ['@k_n', '방송 음향 누가 맡았던 거임?'], ['@lol_lol', '47초 동안 서 있기만 함'], ['@edit_king', '루프 버전 올림'], ['@nana', '박제각']],
  trend: ['#블루아워페스', '#방송사고', '#SIGNAL_LOST', '#여름페스', '#라이브', '#밴드', '#47초'],
  toasts: ['새 멘션', '리포스트', '인용', '새 팔로워', '태그됨', '좋아요 999+'],
};

/* ---------- sound: synthesized, no files ---------- */
function opAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx || document.body.classList.contains('shotmode')) return null;
  const ac = new Ctx(), out = ac.createGain(); out.gain.value = .9; out.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
  const bus = (vol, dest = out) => { const g = ac.createGain(); g.gain.value = vol; g.connect(dest); return g; };
  const loopNoise = (dest, type, f, q = .7) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const bq = ac.createBiquadFilter(); bq.type = type; bq.frequency.value = f; bq.Q.value = q; const g = ac.createGain(); g.gain.value = 0; s.connect(bq).connect(g).connect(dest); s.start(); return g; };
  const A = {
    ac, out, now: () => ac.currentTime,
    set(g, v, t = ac.currentTime, r = .01) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + r); },
  };
  A.fx = bus(1);
  const lim = ac.createDynamicsCompressor(); lim.threshold.value = -14; lim.ratio.value = 12; lim.attack.value = .002; lim.release.value = .1; lim.connect(out);
  A.dingBus = ac.createGain(); A.dingBus.gain.value = 1; A.dingBus.connect(lim);
  A.fan = loopNoise(out, 'lowpass', 260, .5);                       // computer fan / room tone
  const tO = ac.createOscillator(); tO.frequency.value = 7400; A.tinn = ac.createGain(); A.tinn.gain.value = 0; tO.connect(A.tinn).connect(out); tO.start();
  const hO = ac.createOscillator(); hO.frequency.value = 60; A.hum = ac.createGain(); A.hum.gain.value = 0; hO.connect(A.hum).connect(out); hO.start();
  // band through a laptop speaker
  A.bandBus = bus(0); const bl = ac.createBiquadFilter(); bl.type = 'lowpass'; bl.frequency.value = 1800;
  A.bandIn = ac.createGain(); A.bandIn.connect(bl).connect(A.bandBus);
  // the hidden chorus (the crowd singing): own bus + filter so it can be muffled, scrubbed, deleted
  A.choBus = bus(0); const cf = ac.createBiquadFilter(); cf.type = 'lowpass'; cf.frequency.value = 500; A.choLP = cf;
  A.choIn = ac.createGain(); A.choIn.connect(cf).connect(A.choBus);

  const osc = (type, f, t, dur, dest, peak, a = .005) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; o.connect(g).connect(dest); env(g, t, a, peak, dur); o.start(t); o.stop(t + a + dur + .05); return o; };
  A.kick = (t, v = .8, d = A.fx) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .12); o.connect(g).connect(d); env(g, t, .002, v, .2); o.start(t); o.stop(t + .3); };
  A.snare = (t, v = .45, d = A.fx) => { const s = ac.createBufferSource(); s.buffer = nb; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; const g = ac.createGain(); s.connect(f).connect(g).connect(d); env(g, t, .002, v, .13); s.start(t, Math.random()); s.stop(t + .2); };
  A.click = (t, v = .35) => { const s = ac.createBufferSource(); s.buffer = nb; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000; const g = ac.createGain(); s.connect(f).connect(g).connect(out); env(g, t, .001, v, .03); s.start(t, Math.random()); s.stop(t + .06); };
  A.ping = (t, f = 1568, v = .1) => { osc('sine', f, t, .14, out, v); osc('sine', f * 1.5, t + .045, .1, out, v * .6); };
  A.thud = (t, v = .6) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + .18); o.connect(g).connect(out); env(g, t, .003, v, .3); o.start(t); o.stop(t + .4); };
  A.whoosh = (t, v = .25) => { const s = ac.createBufferSource(); s.buffer = nb; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(4000, t + .25); const g = ac.createGain(); s.connect(f).connect(g).connect(out); env(g, t, .06, v, .22); s.start(t, Math.random()); s.stop(t + .4); };
  A.beep = (t, len = .3, f = 1000) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; o.connect(g).connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.2, t + .01); g.gain.setValueAtTime(.2, t + len); g.gain.linearRampToValueAtTime(0, t + len + .04); o.start(t); o.stop(t + len + .1); };
  A.cluster = (t, dur) => { for (const f of [1568, 1760, 2093]) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 2, t + dur); o.connect(g).connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + dur * .8); g.gain.linearRampToValueAtTime(0, t + dur); o.start(t); o.stop(t + dur + .05); } };
  // a muffled 172bpm band (E E A G)
  A.band = (t0, secs) => {
    const b = 60 / OP_BPM, roots = [82.4, 82.4, 110, 98];
    for (let i = 0; i * b / 2 < secs; i++) {
      const t = t0 + i * b / 2, s = i % 8, r = roots[Math.floor(i / 8) % 4];
      if (s === 0 || s === 3 || s === 4) A.kick(t, .9, A.bandIn);
      if (s === 2 || s === 6) A.snare(t, .6, A.bandIn);
      osc('sawtooth', r, t, b * .42, A.bandIn, .25, .01);
      for (const m of [2, 3, 4]) osc('square', r * m, t, b * .42, A.bandIn, .045);
    }
  };
  // the crowd singing the chorus: 12 detuned saws through two formant bands
  A.chorus = (t0, secs) => {
    const b = 60 / OP_BPM, mel = [64, 68, 71, 73, 71, 68, 69, 71, 73, 76, 73, 71, 69, 68, 66, 64];
    const f1 = ac.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 700; f1.Q.value = 4;
    const f2 = ac.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1200; f2.Q.value = 4;
    const mix = ac.createGain(); f1.connect(mix); f2.connect(mix); mix.connect(A.choIn);
    for (let i = 0; i * b < secs; i++) {
      const t = t0 + i * b, f = 440 * 2 ** ((mel[i % mel.length] - 69) / 12);
      for (let v = 0; v < 12; v++) {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth';
        o.frequency.value = f * 2 ** (((Math.random() - .5) * 30) / 1200);
        o.connect(g); g.connect(f1); g.connect(f2);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.03, t + .06); g.gain.setValueAtTime(.03, t + b * .8); g.gain.linearRampToValueAtTime(0, t + b);
        o.start(t); o.stop(t + b + .05);
      }
    }
  };
  // notification "띠링": two quick sine notes; cents detune for the late, out-of-tune pile-up
  A.ding = (t, v = .1, cents = 0) => { const k = 2 ** (cents / 1200); osc('sine', 1318.5 * k, t, .09, A.dingBus, v); osc('sine', 1975.5 * k, t + .055, .16, A.dingBus, v * .8); };
  A.stop = () => { try { out.gain.setTargetAtTime(0, ac.currentTime, .06); setTimeout(() => ac.close(), 400); } catch (e) {} };
  return A;
}

const opEl = (cls, html = '', tag = 'div') => { const d = document.createElement(tag); d.className = cls; d.innerHTML = html; return d; };
const opNum = n => Math.round(n).toLocaleString();

scene('opening', {
  title: '오프닝 1 · 콜드 오픈', cls: 'op', back: false, via: 'fade',
  html: `
    <div class="op-desk">
      <div class="od-wall"></div>
      <div class="od-menu"><b>◉</b><span>PULSE</span><span>파일</span><span>편집</span><span>보기</span><span>창</span><i class="od-clock">02:14</i></div>
      <div class="od-win od-live">
        <div class="od-tb"><i></i><i></i><i></i><b>PULSE LIVE — BLUE HOUR FES 2025 · SUB STAGE</b></div>
        <div class="od-body">
          <div class="od-vbox"><video class="od-vid" playsinline preload="auto"></video>
            <div class="od-play"><i></i></div>
            <div class="od-vhud"><span class="od-live-tag">● LIVE</span><span class="od-view">시청 12,044</span><span class="od-tc">02:30</span></div>
            <div class="od-stop" hidden><b>⚠ 라이브가 중단되었습니다</b><span>잠시 후 다시 시도해 주세요</span><i class="od-spin"></i></div>
            <div class="od-cap"><b>SIGNAL LOST</b><span>2nd song</span></div>
          </div>
          <div class="od-chat"><div class="od-chat-h">실시간 채팅</div><div class="od-chat-l"></div></div>
        </div>
      </div>
      <div class="od-win od-edit" hidden>
        <div class="od-tb"><i></i><i></i><i></i><b>clip_0231_final_v3 — 편집</b></div>
        <div class="oe-body">
          <div class="oe-row"><em>V1</em><div class="oe-thumbs"></div></div>
          <div class="oe-row"><em>A1 · 관객</em><div class="oe-wwrap"><canvas class="oe-wave" width="1100" height="80"></canvas><i class="oe-sel"><b>00:47 선택</b></i></div></div>
          <div class="oe-row"><em>A2 · 무대</em><div class="oe-flat"></div></div>
          <div class="oe-foot"><div class="oe-key"><b>🗑 삭제<small>DEL</small></b></div><div class="oe-exp"><span class="oe-expbtn">⤓ 내보내기</span><i><b></b></i><em>0%</em></div><div class="oe-up">PULSE에 업로드 ↑</div></div>
        </div>
      </div>
      <div class="od-dock"><i></i><i></i><i class="on"></i><i></i><i></i><i></i></div>
      <div class="od-cursor"></div>
    </div>
    <div class="op-phone-stage" hidden>
      <div class="ops-bignum"></div>
      <div class="ops-trend"><i>실시간 트렌드</i><ol></ol></div>
      <div class="ops-wall"></div>
      <div class="ops-phone"><div class="ops-screen">
        <div class="ops-top"><b>PULSE</b><span>알림 <em>0</em></span></div>
        <div class="ops-feed"></div>
        <div class="ops-grid" hidden></div>
      </div></div>
      <div class="ops-fly"></div>
      <div class="ops-toasts"></div>
    </div>
    <video class="op-full" playsinline preload="auto"></video>
    <div class="op-end" hidden><p class="op-line"></p><div class="op-logo"><img src="img/logo/logo.webp" alt="RE:AMP!"><canvas class="op-flatline" width="1600" height="120"></canvas></div></div>
    <div class="op-count" hidden>00:00</div>
    <div class="op-flash"></div>
    <div class="op-black"></div>
    <div class="op-skip" data-tap="back"><i>X</i>SKIP</div>`,

  enter() {
    this.stopped = false; this.cDone = false; this.t0 = performance.now(); this.frames = []; this.marks = []; this.cAcc = null; this.cSec = 0;
    this.au = opAudio();
    this.reset();
    this.run();
  },
  leave() {
    this.stopped = true;
    $$('video', this.el).forEach(v => { try { v.pause(); } catch (e) {} });
    if (this.au) { this.au.stop(); this.au = null; }
  },
  key(k) { if (k === 'back' || k === 'ok') this.finish(); return true; },
  finish() { if (this.stopped) return; this.stopped = true; go('create', { via: 'fade', push: false }); },
  reset() {
    const el = this.el;
    ['.op-phone-stage', '.op-end', '.op-count', '.od-edit', '.od-stop'].forEach(s => { $(s, el).hidden = true; });
    const d = $('.op-desk', el); d.getAnimations().forEach(a => a.cancel()); d.style.opacity = 1;
    $('.od-chat-l', el).innerHTML = ''; $('.od-play', el).getAnimations().forEach(a => a.cancel());
    $('.od-live-tag', el).classList.remove('off');
    const f = $('.op-full', el); f.style.opacity = 0; f.className = 'op-full';
    $('.op-black', el).style.opacity = 1;
  },
  wait(ms) { return new Promise(r => later(r, ms)); },
  // cursor: aim at a real element (fractions of its box), move there; the arrow tip is the cursor's top-left
  aim(t, fx = .5, fy = .5) {
    const d = $('.op-desk', this.el).getBoundingClientRect(), r = t.getBoundingClientRect();
    return { left: `${(r.left + r.width * fx - d.left) / d.width * 100}%`, top: `${(r.top + r.height * fy - d.top) / d.height * 100}%` };
  },
  moveCur(to, ms, e = EZ.soft, delay = 0) {
    const cur = $('.od-cursor', this.el), from = this.curPos || { left: '86%', top: '88%' };
    this.curPos = to; return A(cur, [from, to], ms, { e, delay, fill: 'forwards' });
  },
  clickCur(v = .5) {
    const au = this.au; if (au) { au.click(au.now(), v); au.click(au.now() + .07, v * .6); }   // press + release: 딸깍
    A($('.od-cursor', this.el), [{ scale: '1' }, { scale: '.82' }, { scale: '1' }], 170);
  },
  mark(n) { this.marks.push([n, Math.round(performance.now() - this.t0)]); },

  async run() {
    const from = new URLSearchParams(location.search).get('opfrom');   // dev: ?op=1&opfrom=phone jumps to a section
    const steps = ['desktop', 'live', 'editor', 'phone', 'line', 'cable'];
    try {
      for (const k of steps.slice(Math.max(0, steps.indexOf(from)))) {
        if (this.stopped) return;
        if (from && k === from) { $('.op-black', this.el).style.opacity = 0; if (k === 'phone' || k === 'editor') this.startCounter(); }
        await this[k]();
      }
      this.mark('done');
      this.finish();
    } catch (e) { if (!this.stopped) console.error(e); }
  },

  /* ---------- 1 · desktop at 02:14 ---------- */
  async desktop() {
    const el = this.el, au = this.au;
    this.mark('desk');
    if (au) au.set(au.fan, .05, au.now(), 1.2);
    A($('.op-black', el), [{ opacity: 1 }, { opacity: 0 }], 900, { fill: 'forwards' });
    A($('.od-live', el), [{ opacity: 0, scale: '.96', translate: '0 2%' }, { opacity: 1, scale: '1', translate: '0 0' }], 700, { delay: 500, e: EZ.slam, fill: 'both' });
    this.curPos = null;
    await this.wait(1200);                                           // window has settled; measure the real play button
    this.moveCur(this.aim($('.od-play i', el), .5, .52), 1400 * G.K);
    await this.wait(1600);
    this.clickCur(.5);
    A($('.od-play', el), [{ opacity: 1, scale: '1' }, { opacity: 0, scale: '1.4' }], 260, { fill: 'forwards' });
  },

  /* ---------- 2 · the live: band → 02:31 cut → murmurs → stream stops ---------- */
  async live() {
    const el = this.el, au = this.au, v = $('.od-vid', el), chat = $('.od-chat-l', el), view = $('.od-view', el), tc = $('.od-tc', el), vbox = $('.od-vbox', el);
    this.mark('live');
    const names = ['yuu', 'k_n', 'rock_on', 'minori', 'anon', 'bluehour', 'neko', 'riff'];
    const say = (t, hot) => { const d = opEl('od-msg' + (hot ? ' hot' : ''), `<b>${names[Math.random() * names.length | 0]}</b>${t}`); chat.appendChild(d); if (chat.children.length > 22) chat.firstChild.remove(); };
    let viewers = 12044, lastMsg = 0, lastFrame = 0, cut = false;
    const tickChat = now => { if (now - lastMsg > (cut ? 170 : 420)) { lastMsg = now; say(cut ? OP_CHAT.after[Math.random() * OP_CHAT.after.length | 0] : OP_CHAT.before[Math.random() * OP_CHAT.before.length | 0], cut); } viewers += cut ? 90 : 12; view.textContent = `시청 ${opNum(viewers)}`; };
    // the stream buffers for a moment: the band comes through first (02:30) — the user's clip itself is left untouched
    v.src = OP_VIDEO.crowd.src; v.muted = false; v.volume = .9; v.preload = 'auto';
    vbox.classList.add('buffering'); tc.textContent = '02:30';
    if (au) { au.set(au.bandBus, .5, au.now(), .05); au.band(au.now(), 1.5); }
    const b0 = performance.now();
    await new Promise(r => { const f = now => { if (this.stopped || now - b0 > 1400) return r(); tickChat(now); requestAnimationFrame(f); }; requestAnimationFrame(f); });
    // 02:31 — the sound dies; the clip starts
    cut = true; tc.textContent = '02:31'; vbox.classList.remove('buffering');
    if (au) { au.set(au.bandBus, 0, au.now(), .005); au.set(au.tinn, .012, au.now() + .3, 1.5); au.chorus(au.now() + .3, 12); au.set(au.choBus, .03, au.now() + .3, .8); }
    this.startCounter();
    try { v.currentTime = 0; await v.play(); } catch (e) { v.muted = true; try { await v.play(); } catch (e2) {} }
    const t0 = performance.now();
    await new Promise(res => {
      const f = now => {
        if (this.stopped) return res();
        tickChat(now);
        if (now - lastFrame > 350 && v.readyState >= 2) { lastFrame = now; const u = this.grab(v); if (v.currentTime > 1 && v.currentTime < 6) this.freezeSrc = u; }
        const dur = isFinite(v.duration) ? v.duration : 12.6;
        if (v.ended || v.currentTime >= dur - .03 || (now - t0) / 1000 > dur + 1.5) res(); else requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
    // played to the end of the user's edit; then the stream is gone
    try { v.pause(); } catch (e) {}
    const stop = $('.od-stop', el); stop.hidden = false; A(stop, KF.fade, 160);
    $('.od-live-tag', el).classList.add('off');
    if (au) { au.set(au.choBus, 0, au.now(), .05); au.set(au.tinn, .02, au.now(), .6); }
    await this.wait(1300);
  },
  grab(v) {
    try {
      const c = document.createElement('canvas'); c.width = 320; c.height = 180;
      c.getContext('2d').drawImage(v, 0, 0, 320, 180);
      const px = c.getContext('2d').getImageData(0, 0, 320, 180).data; let sum = 0; for (let i = 0; i < px.length; i += 400) sum += px[i] + px[i + 1] + px[i + 2];
      if (sum / (px.length / 400) < 30) return '';                  // black frame (after the edit's blackout)
      const u = c.toDataURL('image/jpeg', .8); this.frames.push(u); return u;
    } catch (e) { return ''; }
  },

  /* ---------- 3 · the edit: select the audience, DEL, export, upload ---------- */
  async editor() {
    const el = this.el, au = this.au, w = $('.od-edit', el);
    this.mark('edit');
    const th = $('.oe-thumbs', el); th.innerHTML = '';
    const fr = this.frames;
    for (let i = 0; i < 10; i++) { const s = fr.length ? fr[Math.floor(i / 10 * fr.length)] : ''; const d = th.appendChild(opEl('oe-th', '', 'i')); if (s) d.style.backgroundImage = `url(${s})`; }
    const wc = $('.oe-wave', el).getContext('2d'), bars = [], flat = new Array(220).fill(1);
    for (let i = 0; i < 220; i++) bars.push(.25 + Math.random() * .75);
    const draw = () => { wc.clearRect(0, 0, 1100, 80); bars.forEach((h, i) => { const hh = Math.max(1, h * 34 * flat[i]); wc.fillStyle = flat[i] < 1 ? '#3A4466' : '#4FE3FF'; wc.fillRect(i * 5, 40 - hh, 3, hh * 2); }); };
    draw();
    const sel = $('.oe-sel', el); sel.getAnimations().forEach(a => a.cancel()); sel.style.width = '0%'; sel.classList.remove('on');
    $('.oe-key', el).classList.remove('on'); $('.oe-exp b', el).style.width = '0%'; $('.oe-exp em', el).textContent = '0%'; $('.oe-up', el).className = 'oe-up'; $('.oe-up', el).textContent = 'PULSE에 업로드 ↑'; $('.oe-expbtn', el).classList.remove('on');
    w.hidden = false;
    if (au) au.whoosh(au.now(), .18);
    A(w, [{ translate: '40% 6%', opacity: 0 }, { translate: '0 0', opacity: 1 }], 420, { e: EZ.slam, fill: 'both' });
    await this.wait(460);                                            // let the window land before measuring
    const ww = $('.oe-wwrap', el);
    this.moveCur(this.aim(ww, .18, .5), 380);
    await this.wait(440);
    // beats 1–2: drag across the audience track — the chorus leaks through the laptop speaker while scrubbing
    if (au) { au.click(au.now(), .4); au.chorus(au.now(), OP_BEAT * 2 / 1000 + .2); au.choLP.frequency.setValueAtTime(3000, au.now()); au.set(au.choBus, .09, au.now(), .04); }
    sel.classList.add('on');
    A(sel, [{ width: '0%' }, { width: '70%' }], OP_BEAT * 2, { e: 'linear', fill: 'forwards' });
    this.moveCur(this.aim(ww, .88, .5), OP_BEAT * 2, 'linear');
    const gate = au ? setInterval(() => au.choBus.gain.setValueAtTime(Math.random() < .5 ? .09 : .02, au.now()), 30) : 0;
    await this.wait(OP_BEAT * 2);
    clearInterval(gate);
    // move to the delete button and click it
    this.moveCur(this.aim($('.oe-key b', el), .45, .55), 420);
    await this.wait(520);
    $('.oe-key', el).classList.add('on'); this.clickCur(.85);
    await this.wait(260);
    // beat 4: the audience waveform goes flat, left to right like dominoes; chorus + tinnitus → 0
    if (au) { au.set(au.choBus, 0, au.now(), .005); au.set(au.tinn, 0, au.now(), .005); au.choLP.frequency.setValueAtTime(500, au.now() + .1); }
    const t0 = performance.now();
    await new Promise(r => { const f = () => { const k = (performance.now() - t0) / (OP_BEAT * .9); for (let i = 38; i < 192; i++) if ((i - 38) / 154 < k) flat[i] = Math.max(.03, flat[i] - .25); draw(); if (k < 1.3 && !this.stopped) requestAnimationFrame(f); else r(); }; f(); });
    await this.wait(OP_BEAT / 2);                                     // half a beat of true silence
    // click 내보내기 → the bar fills → 업로드 lights up → click it → 업로드 완료
    const expBtn = $('.oe-expbtn', el), up = $('.oe-up', el);
    this.moveCur(this.aim(expBtn, .5, .55), 440);
    await this.wait(520);
    expBtn.classList.add('on'); this.clickCur(.6);
    A($('.oe-exp b', el), [{ width: '0%' }, { width: '100%' }], 1100, { e: EZ.wipe, fill: 'forwards' });
    const e0 = performance.now(), pct = $('.oe-exp em', el);
    await new Promise(r => { const f = () => { const k = Math.min(1, (performance.now() - e0) / 1100); pct.textContent = Math.round(k * 100) + '%'; if (k < 1 && !this.stopped) requestAnimationFrame(f); else r(); }; f(); });
    pct.textContent = '완료'; up.classList.add('ready'); A(up, [{ scale: '1.08' }, { scale: '1' }], 220, { e: EZ.pop });
    this.moveCur(this.aim(up, .5, .55), 460);
    await this.wait(560);
    up.classList.add('on'); this.clickCur(.7);
    await this.wait(200);
    up.textContent = '업로드 중…';
    await this.wait(450);
    up.textContent = '✓ 업로드 완료';
    await this.wait(380);
    if (au) { au.whoosh(au.now(), .3); au.set(au.fan, 0, au.now(), .3); }
    A($('.op-desk', el), [{ opacity: 1, scale: '1' }, { opacity: 0, scale: '.92' }], 380, { e: EZ.wipe, fill: 'forwards' });
    await this.wait(380);
  },

  startCounter() {
    const c = $('.op-count', this.el); c.hidden = false;
    this.cStart = performance.now();
    const tick = () => {
      if (this.stopped || this.cDone) return;
      let s;
      if (!this.cAcc) s = (performance.now() - this.cStart) / 1000;            // real time until the flood
      else { const k = Math.min(1, (performance.now() - this.cAcc.t) / this.cAcc.span); s = this.cAcc.from + (47 - this.cAcc.from) * k * k; }
      this.cSec = s; c.textContent = `00:${String(Math.min(46, Math.floor(s))).padStart(2, '0')}`;
      requestAnimationFrame(tick);
    };
    tick();
  },

  /* ---------- 4 · the phone: one feed that won't stop — dings, posts, cards spilling out, the tag climbing to #1 ---------- */
  async phone() {
    const el = this.el, au = this.au, st = $('.op-phone-stage', el), ph = $('.ops-phone', el), feed = $('.ops-feed', el),
      fly = $('.ops-fly', el), toasts = $('.ops-toasts', el), big = $('.ops-bignum', el), trend = $('.ops-trend ol', el), notif = $('.ops-top em', el);
    this.mark('phone');
    [feed, fly, toasts, $('.ops-grid', el), $('.ops-wall', el)].forEach(x => { x.innerHTML = ''; x.getAnimations().forEach(a => a.cancel()); });
    ph.getAnimations().forEach(a => a.cancel()); ph.classList.remove('nobezel'); st.className = 'op-phone-stage'; big.className = 'ops-bignum'; big.textContent = '';
    $('.ops-trend', el).classList.remove('on'); $('.ops-grid', el).hidden = true; feed.hidden = false; feed.style.translate = '0 0';
    const END = 13;                                                  // seconds; the counter lands on 47 at the freeze
    const FZ = this.freezeSrc || this.frames[this.frames.length - 1] || '';
    const bg = FZ ? `background-image:url(${FZ})` : '';
    const thumb = () => `<div class="ops-thumb" style="${bg}"><em>0:47</em></div>`;
    const post = (who, txt, extra = '', cls = '') => opEl('ops-post ' + cls, `<b>${who}</b><p>${txt}</p>${extra}`);
    const rnd = a => a[Math.random() * a.length | 0];
    const handle = () => '@' + rnd(['yuu', 'k_n', 'rock', 'mino', 'neko', 'riff', 'sora', 'lol', 'nana', 'edit', 'anon', 'bh_fes', 'tanaka', 'rin']) + '_' + (Math.random() * 999 | 0);
    const junk = () => rnd(['ㅋㅋㅋㅋㅋㅋ', '47초 버티기 챌린지', '이거 봄?', '박제', '밈 템플릿 확정', '데뷔 전에 끝남', '루프 버전 올림', '굳었네', '방송사고 레전드', '아무것도 안 함 ㅋㅋ', '#47초프리즈', 'SIGNAL LOST 끝났네', '음향사고가 아니라 실력사고', '센터 왜 가만히 있음?', '리믹스 만들어 봄 🔁']);
    let notes = 0; const bump = n => { notes += n; notif.textContent = notes > 999 ? '999+' : notes; };
    this.cAcc = { t: performance.now(), span: (END - .8) * 1000, from: Math.min(20, this.cSec || 8) };
    const seek = +new URLSearchParams(location.search).get('opsec') || 0;          // dev: freeze at a second for captures

    // the clip post: counters explode
    const clip = post(...OP_POST.clip, thumb() + '<div class="ops-stats"><span class="v">조회 12,044</span><span class="l">♥ 311</span><span class="r">↻ 40</span></div>', 'clip');
    feed.appendChild(clip);
    const cv = $('.v', clip), cl = $('.l', clip), cr = $('.r', clip);
    st.hidden = false; $('.op-black', el).style.opacity = 0;
    A(ph, [{ translate: '0 60%', rotate: '0deg', opacity: 0 }, { translate: '0 0', rotate: '-2deg', opacity: 1 }], 520, { e: EZ.slam, fill: 'forwards' });

    const S0 = performance.now() - seek * 1000;
    let nextPost = .9, nextFly = 3.6, nextToast = 1.6, nextDing = .05, scroll = 0, rankStep = 0, frozen = false, dissentShown = false;
    const RANKS = [[5.2, 8], [5.9, 6], [6.5, 5], [7.0, 3], [7.4, 2], [7.75, 1]];
    await new Promise(res => {
      const tick = () => {
        if (this.stopped) return res();
        const s = (performance.now() - S0) / 1000, k = Math.min(1, s / 12);
        if (!frozen) {
          // counters: slow enough to read at first, then they run away
          const views = 12044 + (s < 2 ? s * 1900 : 3800 + Math.pow(s - 2, 3.1) * 1900);
          cv.textContent = `조회 ${opNum(views)}`; cl.textContent = `♥ ${opNum(311 + Math.pow(s, 3) * 40)}`; cr.textContent = `↻ ${opNum(40 + Math.pow(s, 3.2) * 18)}`;
          if (s > 4.4) { if (!big.classList.contains('on')) { big.classList.add('on'); A(big, [{ translate: '-6% 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], 600, { e: EZ.slam }); } big.textContent = opNum(views); }
          // posts pour into the feed, faster and faster, irregular; the feed keeps scrolling to the newest
          for (let n = 0; s >= nextPost && n < (seek ? 400 : 4); n++) {
            const c = post(handle(), junk(), Math.random() < .22 ? thumb() : ''); feed.appendChild(c);
            A(c, [{ translate: '0 26px', opacity: 0 }, { translate: '0 0', opacity: 1 }], 140); bump(3);
            if (!dissentShown && s > 6.1) { dissentShown = true; const d = post(...OP_POST.dissent, '<div class="ops-stats"><span>♥ 3</span><span>↻ 0</span></div>', 'dissent'); feed.appendChild(d); }
            while (feed.children.length > 22) { const h = feed.firstChild.offsetHeight + 8; feed.firstChild.remove(); scroll -= h; }
            nextPost = s + Math.max(.035, .5 * Math.pow(.72, s)) * (.6 + Math.random() * .8);
          }
          const target = Math.max(0, feed.scrollHeight - (ph.clientHeight - 90));
          scroll += (target - scroll) * Math.min(1, .12 + k * .3); feed.style.translate = `0 ${-scroll}px`;
          // notifications stack on the right
          for (let n = 0; s >= nextToast && n < (seek ? 400 : 4); n++) {
            const d = opEl('ops-toast', `<i></i><span>${rnd(OP_POST.toasts)} · #47초프리즈</span>`); toasts.prepend(d); A(d, KF.fromRight('50%'), 160);
            if (toasts.children.length > 12) toasts.lastChild.remove(); bump(7);
            nextToast = s + Math.max(.04, .7 * Math.pow(.7, s - 1.6)) * (.6 + Math.random() * .8);
          }
          // cards burst out of the phone
          for (let n = 0; s >= nextFly && n < (seek ? 400 : 4); n++) {
            const pp = rnd(OP_POST.buried), c = post(pp[0], Math.random() < .5 ? pp[1] : junk(), Math.random() < .35 ? thumb() : '', 'fly'); fly.appendChild(c);
            const a = Math.random() * Math.PI * 2, dist = 380 + Math.random() * 380;
            A(c, [{ translate: '-50% -50%', rotate: '0deg', opacity: 0, scale: '.5' }, { translate: `calc(-50% + ${Math.cos(a) * dist}px) calc(-50% + ${Math.sin(a) * dist * .62}px)`, rotate: `${(Math.random() - .5) * 28}deg`, opacity: 1, scale: '1' }], 520, { e: EZ.slam, fill: 'forwards' });
            if (fly.children.length > 60) fly.firstChild.remove();
            nextFly = s + Math.max(.03, .45 * Math.pow(.66, s - 3.6)) * (.6 + Math.random() * .8);
          }
          // the tag climbs the live trend chart
          while (rankStep < RANKS.length && s >= RANKS[rankStep][0]) {
            if (rankStep === 0) $('.ops-trend', el).classList.add('on');
            this.rank = RANKS[rankStep][1]; this.paintTrend(trend, this.rank === 1);
            if (this.rank === 1) { A(st, [{ scale: '1.035' }, { scale: '1' }], 260, { e: EZ.slam }); A($('.op-flash', el) || st, [{ opacity: .35 }, { opacity: 0 }], 160); }
            rankStep++;
          }
          if (s > 9.5) st.classList.add('flood');
          // 띠링 → 따라라라락: dings accelerate irregularly, overlap, and slide out of tune near the end
          if (au && s >= nextDing) {
            au.ding(au.now(), .08 + Math.min(.06, s * .005), s > 8 ? (Math.random() - .5) * (s - 8) * 55 : 0);
            nextDing = s + Math.max(.016, .75 * Math.pow(.66, s)) * (.55 + Math.random() * .9);
          }
          // 12.2 — everything stops at once
          if (s >= END - .8) {
            frozen = true;
            if (au) { au.out.gain.cancelScheduledValues(au.now()); au.out.gain.setValueAtTime(0, au.now()); au.out.gain.setValueAtTime(.9, au.now() + .3); }
            st.classList.add('frozen'); $$('*', st).forEach(n => n.getAnimations().forEach(a => a.pause()));
          }
        }
        if (s >= END) { this.cDone = true; const c = $('.op-count', el); c.textContent = '00:47'; c.classList.add('solo'); st.hidden = true; $('.op-black', el).style.opacity = 1; return res(); }
        if (seek && s >= seek) return;                            // hold for capture
        requestAnimationFrame(tick);
      };
      tick();
    });
    await this.wait(700);                                         // 00:47 alone
    $('.op-count', el).hidden = true; $('.op-count', el).classList.remove('solo');
    await this.wait(700);
  },
  paintTrend(ol, hot) {
    const tags = OP_POST.trend.slice(), list = [];
    let k = 0; for (let r = 1; r <= 8; r++) list.push(r === this.rank ? '#47초프리즈' : tags[k++]);
    ol.innerHTML = list.map((tg, i) => `<li class="${tg === '#47초프리즈' ? 'me' + (hot ? ' hot' : '') : ''}"><b>${i + 1}</b>${tg}</li>`).join('');
    const me = $('.me', ol); if (me) A(me, [{ translate: '0 60%' }, { translate: '0 0' }], 160, { e: EZ.slam });
  },

  /* ---------- 5 · off every screen: the cable ---------- */
  /* ---------- 5 · one line on black ---------- */
  async line() {
    const el = this.el, end = $('.op-end', el), line = $('.op-line', el), au = this.au;
    this.mark('line');
    end.hidden = false; end.classList.remove('over'); $('.op-logo', el).style.opacity = 0; line.textContent = ''; line.style.opacity = 1; line.getAnimations().forEach(x => x.cancel());
    $('.op-black', el).style.opacity = 0;
    for (const ch of OP_LINE) { if (this.stopped) return; line.textContent += ch; if (au && ch.trim()) au.click(au.now(), .1); await this.wait(95); }
    await this.wait(1500);
    A(line, [{ opacity: 1 }, { opacity: 0 }], 500, { fill: 'forwards' });
    await this.wait(600);
    end.hidden = true;
  },

  /* ---------- 6 · off every screen: the cable (user's edit, whole); logo + flatline land on the thrown cable ---------- */
  async cable() {
    const el = this.el, v = $('.op-full', el), au = this.au, end = $('.op-end', el), logo = $('.op-logo', el);
    this.mark('cable');
    v.src = OP_VIDEO.cable.src; v.muted = !au; v.volume = .9; v.className = 'op-full';
    await new Promise(r => { if (v.readyState >= 1) r(); else { v.onloadedmetadata = r; later(r, 1500); } });
    try { v.currentTime = 0; } catch (e) {}
    v.style.opacity = 1; $('.op-black', el).style.opacity = 0;
    try { await v.play(); } catch (e) { v.muted = true; try { await v.play(); } catch (e2) {} }
    const dur = isFinite(v.duration) ? v.duration : 8.75;
    // wait for the throw (the cable hits the floor ≈4.5s into the edit)
    await new Promise(r => { const f = () => { if (this.stopped || v.currentTime >= OP_VIDEO.cable.throwAt || v.ended) r(); else requestAnimationFrame(f); }; f(); later(r, (OP_VIDEO.cable.throwAt + 1.5) * 1000); });
    end.hidden = false; end.classList.add('over'); $('.op-line', el).textContent = '';
    A(logo, [{ opacity: 0, scale: '1.04' }, { opacity: 1, scale: '1' }], 800, { fill: 'forwards' });
    // flatline across the logo's speaker height, then 삐빅: two blips, the second one held longer
    const cv = $('.op-flatline', el), c = cv.getContext('2d'), t0 = performance.now(), W = 1600, mid = 60;
    const BLIPS = [[1.5, .22, 30], [1.78, .7, 40]];          // [start, length, height]
    const fired = [false, false];
    const done = new Promise(r => {
      const f = now => {
        if (this.stopped) return r();
        const tt = (now - t0) / (1000 * G.K); c.clearRect(0, 0, W, 120);
        const x1 = W * Math.min(1, tt / .8), bx = W * .47;
        c.beginPath();
        for (let x = 0; x <= x1; x += 2) {
          let y = 0; const d = x - bx;
          for (const [b0, bl, bh] of BLIPS) { const bt = tt - b0; if (bt > 0 && bt < bl && Math.abs(d) < 70) y -= Math.sin(d / 70 * Math.PI) * bh * Math.sin(Math.min(1, bt / .08) * Math.PI / 2) * (1 - Math.max(0, bt - bl + .12) / .12) * Math.cos(d / 11); }
          x ? c.lineTo(x, mid + y) : c.moveTo(x, mid + y);
        }
        c.strokeStyle = 'rgb(8,231,253)'; c.lineWidth = 4; c.shadowColor = 'rgba(8,231,253,.6)'; c.shadowBlur = 10; c.stroke();
        BLIPS.forEach(([b0, bl], i) => { if (!fired[i] && tt >= b0) { fired[i] = true; if (au) au.beep(au.now(), bl, i ? 1000 : 1000); } });
        if (tt < 3.2) requestAnimationFrame(f); else r();
      };
      requestAnimationFrame(f);
    });
    const vEnd = new Promise(r => { if (v.ended) return r(); v.onended = r; later(r, (dur - OP_VIDEO.cable.throwAt + 1.5) * 1000); });
    await Promise.all([done, vEnd]);
    v.onended = null;
    await this.wait(500);
    $('.op-black', el).style.opacity = 1;
    await this.wait(500);
  },
});
