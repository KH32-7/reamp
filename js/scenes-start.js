/* Start flow: loading → title ⇣ save → (NEW GAME) opening → create → prologue */
'use strict';
const YOU_ART = { GT: '', BA: 'ba_', DR: 'dr_', KEY: 'key_' };   // A04: protagonist standing per instrument
const hasYouArt = () => G.inst in YOU_ART;
const youImg = () => `img/ill/you_${YOU_ART[G.inst] ?? ''}${G.gender}.webp`;

/* ---------------- SIGNAL LINE ----------------
   The logo's cyan line + waveform are drawn live, not baked into the logo art.
   LOGO_GEO: speaker centre / radius and line height as fractions of the logo image. */
const LOGO_GEO = { lineY: .409, sx: .4713, sr: .0487, lw: .0072, ar: 573 / 2577 };
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
function signal(cv, logo, o = {}) {
  const S = 2, W = 1600, H = 160, ctx = cv.getContext('2d');
  cv.width = W * S; cv.height = H * S; ctx.scale(S, S);
  const lw = logo.offsetWidth, lh = lw * LOGO_GEO.ar;
  cv.style.top = (logo.offsetTop + lh * LOGO_GEO.lineY - H / 2) + 'px';
  const s = {
    reveal: 0, from: o.from || 'center', travel: !REDUCED && o.travel !== false, speaker: o.speaker !== false,
    sx: logo.offsetLeft + lw * LOGO_GEO.sx, sr: lw * LOGO_GEO.sr, lw: Math.max(3, lw * LOGO_GEO.lw), t0: performance.now(), raf: 0,
  };
  const mid = H / 2, col = 'rgb(8,231,253)';
  if (document.body.classList.contains('shotmode')) { s.t0 -= 4000; if (o.from === 'left') s.reveal = .62; }  // captures: start mid-motion
  const frame = now => {
    const t = (now - s.t0) / 1000 / G.K;
    ctx.clearRect(0, 0, W, H);
    if (o.auto) { const k = Math.max(0, Math.min(1, (t - o.auto[0]) / o.auto[1])); s.reveal = 1 - (1 - k) ** 3; }  // self-timed reveal (title)
    let x0 = 0, x1 = W * s.reveal;
    if (s.from === 'center') { const h = W / 2 * s.reveal; x0 = W / 2 - h; x1 = W / 2 + h; }
    const beat = 60 / G.bpm, ph = (t % beat) / beat, kick = REDUCED ? .4 : Math.exp(-ph * 4);
    const live = s.speaker && s.reveal > .02 && x1 > s.sx;               // speaker wakes once the signal reaches it
    const bi = Math.floor(t / beat);                    // beat index: each beat sends one ripple out of the speaker
    if (x1 - x0 > 1) {
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 1.5) {
        let y = 0;
        if (s.travel && live) {                          // ripples leave the speaker both ways and fade with distance
          const dx = Math.abs(x - s.sx) - s.sr;
          if (dx > 0) for (let k = 0; k < 4; k++) {
            const age = t - (bi - k) * beat, pos = age * 380, a = 8 * Math.exp(-age * 1.1), d = dx - pos;
            if (a > .3 && Math.abs(d) < 60) y += a * Math.exp(-((d / 20) ** 2)) * Math.sin(d * .55);
          }
        }
        if (live) {
          const d = x - s.sx, r = s.sr * .82;
          if (Math.abs(d) < r) {
            const w = Math.cos(d / r * Math.PI / 2) ** 2;
            y += s.sr * .62 * (.3 + .7 * kick) * w * Math.sin(d * .42 + t * (REDUCED ? 0 : 20)) * (REDUCED ? 1 : Math.sin(d * .09 + t * 3.1));
          }
        }
        if (s.from === 'left' && s.reveal < 1) { const d = x1 - x; y += 7 * Math.exp(-((d / 14) ** 2)) * Math.sin(d * .8 + t * 24); }
        x === x0 ? ctx.moveTo(x, mid + y) : ctx.lineTo(x, mid + y);
      }
      ctx.strokeStyle = col; ctx.lineWidth = s.lw; ctx.lineJoin = 'round'; ctx.stroke();
      if (s.from === 'left' && s.reveal < 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x1, mid, s.lw * 1.1, 0, 7); ctx.fill(); }
    }
    if (live && !REDUCED) {                              // speaker pump ring on every beat
      ctx.strokeStyle = `rgba(8,231,253,${(1 - ph) * .55})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.sx, mid, s.sr * (1.02 + ph * .7), 0, 7); ctx.stroke();
    }
    s.raf = requestAnimationFrame(frame);
  };
  s.raf = requestAnimationFrame(frame);
  s.stop = () => cancelAnimationFrame(s.raf);
  return s;
}

/* dust motes drifting through the stage light (title) */
function motes(cv) {
  const W = 1600, H = 900, ctx = cv.getContext('2d');
  cv.width = W; cv.height = H;
  const P = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 1.8, v: 4 + Math.random() * 10, p: Math.random() * 6.28 }));
  const s = { raf: 0, t0: performance.now() };
  const frame = now => {
    const t = (now - s.t0) / 1000 / G.K;
    ctx.clearRect(0, 0, W, H);
    for (const m of P) {
      const y = (m.y - t * m.v + H * 10) % H, x = m.x + Math.sin(t * .4 + m.p) * 14;
      const a = (.25 + .45 * (.5 + .5 * Math.sin(t * 1.3 + m.p))) * (1 - y / H * .6);
      ctx.fillStyle = `rgba(200,245,255,${a})`;
      ctx.beginPath(); ctx.arc(x, y, m.r, 0, 7); ctx.fill();
    }
    if (!REDUCED) s.raf = requestAnimationFrame(frame);
  };
  s.raf = requestAnimationFrame(frame);
  s.stop = () => cancelAnimationFrame(s.raf);
  return s;
}

/* ---------------- LOADING ---------------- */
const TIPS = [
  '한 주에 할 수 있는 행동은 두 번이에요.',
  'BAND와 PRACTICE는 언제 열어도 시간이 흐르지 않아요.',
  '롱노트는 끝나기 조금 전까지만 누르고 있으면 성공이에요.',
  '체력이 떨어지면 강변 둑길을 걸어 보세요.',
  'COVER 노트를 치면 흔들리는 멤버를 받쳐 줄 수 있어요.',
];
scene('loading', {
  title: '로딩', cls: 'ld', back: false,
  html: `<div class="ld-bg"></div>
    <div class="ld-logo" data-asset="A02"><img class="logo-img" src="img/logo/logo.webp" alt="RE:AMP!"></div>
    <canvas class="sig"></canvas>
    <div class="ld-tip" data-asset="A26"><b>TIP</b><span class="ld-tiptext"></span></div>
    <div class="ld-now"><span>NOW LOADING</span><i></i><i></i><i></i><b class="ld-pct">0%</b></div>`,
  enter() {
    const el = this.el, logo = $('.ld-logo', el), pct = $('.ld-pct', el);
    $('.ld-tiptext', el).textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
    A(logo, KF.fade, 500, { fill: 'both' });
    A($('.ld-tip', el), KF.fromBottom('60%'), T.slam, { delay: 300 });
    this.sig = signal($('.sig', el), logo, { from: 'left', travel: false });
    // the bar follows the real EARLY image load; at least ~1.9s so the logo gets its moment
    if (document.body.classList.contains('shotmode')) { this.sig.reveal = .62; pct.textContent = '62%'; return; }
    const t0 = performance.now(), MIN = 1900 * G.K, CAP = 25000;
    let shown = 0, popped = false;
    const tick = now => {
      if (G.cur !== 'loading') return;
      const real = PRE.early ? PRE.earlyDone / PRE.early : 1, time = Math.min(1, (now - t0) / MIN);
      const target = Math.min(real, .15 + time * .85);            // never runs ahead of the files
      shown += (target - shown) * .12;
      if (target - shown < .002) shown = target;
      this.sig.reveal = shown; pct.textContent = Math.round(shown * 100) + '%';
      if (shown >= 1 && !popped) { popped = true; A(logo, KF.popIn, T.pop, { e: EZ.pop }); later(() => go('title', { push: false }), 600); return; }
      if (now - t0 > CAP && !popped) { popped = true; go('title', { push: false }); return; }   // slow network: carry on, the rest streams in
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
  leave() { this.sig && this.sig.stop(); },
  key() { return true; },
});

/* ---------------- TITLE ---------------- */
scene('title', {
  title: '타이틀', cls: 'tt', back: false, via: 'fade',
  html: `${bgImg('title', 'tt-img drift')}<div class="tt-vig"></div>
    <div class="tt-beams"><i></i><i></i><i></i></div>
    <canvas class="tt-motes"></canvas>
    <div class="tt-logo" data-asset="A02"><img class="logo-img" src="img/logo/logo.webp" alt="RE:AMP!"><i class="tt-shine"></i></div>
    <canvas class="sig"></canvas>
    <div class="tt-fx"></div>
    <div class="tt-press" data-tap="ok"><i></i><span>PRESS ANY BUTTON</span></div>
    <div class="tt-lab" data-tap="y"><b>Y</b>RHYTHM LAB</div>
    <div class="tt-foot">© RE:AMP! PROJECT · GAME BUILD 0.1</div>`,
  init(el) {
    el.classList.add('lay-b');
    $('.tt-img', el).insertAdjacentHTML('beforeend', '<i class="tt-sil glow"></i><i class="tt-sil sweep"></i><i class="tt-sil spark"></i>');
    el.addEventListener('click', () => { if (G.cur === 'title') dispatch('ok'); });
  },
  enter() {
    const el = this.el;
    A($('.tt-img', el), [{ opacity: 0, scale: '1.12' }, { opacity: 1, scale: '1' }], 1400, { e: EZ.soft });
    A($('.tt-logo img', el), KF.popIn, T.char, { delay: 500 });
    this.sig = signal($('.sig', el), $('.tt-logo', el), { auto: [.7, .9] });
    this.motes = motes($('.tt-motes', el));
    A($('.tt-press', el), KF.fade, 700, { delay: 1300, fill: 'both' });
    A($('.tt-foot', el), KF.fade, 700, { delay: 1500, fill: 'both' });
  },
  leave() { this.sig && this.sig.stop(); this.motes && this.motes.stop(); },
  key(k) { if (k === 'y') go('lab', { via: 'slam' }); else if (k === 'ok' || k === 'down') go('save', { via: 'pan' }); return true; },
});

/* ---------------- SAVE ---------------- */
const slotOf = () => {
  if (!SAVE.progress || !SAVE.profile) return null;
  const g = SAVE.game, yr = SAVE.progress.story === 'year';
  if (g && g.v === 2 && typeof dateOf === 'function') {
    const t = dateOf(g.day), ch = typeof curCh === 'function' ? curCh() : 1, c = typeof CH !== 'undefined' && CH[ch];
    return {
      date: `${t.m}/${t.d}`, dow: DOW_EN[t.dow], time: isWeekend(g.day) ? '낮' : '저녁', moon: 'half', place: '나기사카', bg: c ? c.bg : 'stage',
      ch: `${ch}장 ${c ? c.name : ''} · 팬 ${g.fans.toLocaleString('en-US')} · ¥${g.money.toLocaleString('en-US')}`, lv: ch, play: new Date(SAVE.progress.t || Date.now()).toLocaleDateString('ko-KR'),
      band: `${g.bandName || '0dB 알바'} · ${SAVE.profile.name}`, faces: ['you', ...g.joined],
    };
  }
  return g ? {
    date: '4월', dow: `${g.week || 1}주`, time: '평일', moon: 'half', place: '나기사카 · 0dB', bg: 'stage',
    ch: `1장 제로 데시벨 · ¥${(g.money || 0).toLocaleString('en-US')}`, lv: 1, play: new Date(SAVE.progress.t || Date.now()).toLocaleDateString('ko-KR'),
    band: `0dB 알바 · ${SAVE.profile.name}`, faces: ['you'],
  } : {
    date: yr ? '1년 후' : '1년 전', dow: yr ? 'APR' : 'SUN', time: yr ? '밤' : '저녁', moon: 'full', place: yr ? '나기사카' : '블루 아워 페스', bg: yr ? 'river_night' : 'backstage',
    ch: yr ? '1년 후' : SAVE.progress.done ? '프롤로그 · 완료' : '프롤로그 · 47초', lv: 1, play: new Date(SAVE.progress.t || Date.now()).toLocaleDateString('ko-KR'),
    band: `SIGNAL LOST · ${SAVE.profile.name}`, faces: ['you', 'haru'],
  };
};
let SLOTS = [slotOf(), null, null];
scene('save', {
  title: '세이브 선택', cls: 'sv',
  html: `<div class="sv-floor"></div>${bigWord('LOAD', 'sv-word')}
    <div class="sv-slab"></div>
    <div class="sv-head"><b>DATA SELECT</b><small>이어서 할 데이터를 고르세요. 휠로 넘길 수 있어요.</small></div>
    <div class="sv-list">${SLOTS.map((s, i) => s ? `
      <div class="sv-row"><span class="sv-no">${i + 1}</span><span class="sv-date">${s.date}</span><span class="sv-dow">${s.dow}</span>
        <span class="sv-time"><i class="moon ${s.moon}"></i>${s.time}</span><span class="sv-place">${s.place}</span>
        <span class="sv-lv">LV ${s.lv}</span><span class="sv-play">${s.play}</span><span class="sv-more">${s.ch} · ${s.band}</span></div>` : `
      <div class="sv-row empty"><span class="sv-no">${i + 1}</span><span class="sv-new">NEW GAME</span><span class="sv-place">비어 있음</span></div>`).join('')}
    </div>
    <div class="sv-prev"><div class="sv-thumb" data-asset="A03"><div class="sv-thumbimg"></div><span class="sv-thumb-lbl"></span></div><div class="sv-info"></div></div>
    ${backChip()}
    ${hint([['A', '결정'], ['B', '타이틀'], ['↕', '슬롯']], 'LOAD GAME?')}`,
  init(el) {
    this.S = Scroller($$('.sv-row', el), {
      layout: (r, off) => {
        const a = Math.abs(off);
        r.style.transform = `translate(${off * -26}px, ${off * 96}px) skewX(-12deg) scale(${1 - Math.min(a, 3) * .04})`;
        r.style.opacity = a > 3.2 ? 0 : 1 - Math.max(0, a - 2) * .6;
        r.style.zIndex = 10 - Math.round(a);
      },
      onChange: (n, r, silent) => this.preview(n, silent),
      onPick: () => this.key('ok'),
    });
  },
  preview(n, silent) {
    const el = this.el, s = SLOTS[n];
    $('.sv-thumbimg', el).style.backgroundImage = s ? `url(img/bg/${s.bg}.webp)` : 'none';
    $('.sv-thumb', el).classList.toggle('empty', !s);
    $('.sv-thumb-lbl', el).textContent = s ? `${s.date} ${s.time} · ${s.place}` : 'NEW GAME';
    $('.sv-info', el).innerHTML = s
      ? `<b>${s.band}</b><span>${s.ch} · 플레이 ${s.play}</span><div class="sv-faces">${s.faces.map(f => `<img src="${icon(f)}" alt="">`).join('')}</div>`
      : `<b>새로 시작</b><span>주인공을 만들고 프롤로그 「47초」부터 시작해요</span>`;
    if (!silent) { A($('.sv-thumb', el), [{ rotate: '8deg', opacity: .3, translate: '8% 0' }, { rotate: '3deg', opacity: 1, translate: '0 0' }], T.slam); A($('.sv-info', el), KF.fromRight('6%'), T.slam, { delay: 60 }); }
  },
  enter() {
    const el = this.el;
    SLOTS = [slotOf(), null, null];
    $$('.sv-row', el).forEach((r, i) => {
      const s = SLOTS[i];
      r.classList.toggle('empty', !s);
      r.innerHTML = s ? `<span class="sv-no">${i + 1}</span><span class="sv-date">${s.date}</span><span class="sv-dow">${s.dow}</span><span class="sv-time"><i class="moon ${s.moon}"></i>${s.time}</span><span class="sv-place">${s.place}</span><span class="sv-lv">LV ${s.lv}</span><span class="sv-play">${s.play}</span><span class="sv-more">${s.ch} · ${s.band}</span>`
        : `<span class="sv-no">${i + 1}</span><span class="sv-new">NEW GAME</span><span class="sv-place">비어 있음</span>`;
    });
    this.S.set(0, true); this.S.paint(); this.preview(0, true);
    A($('.sv-word', el), KF.fromRight('20%'), 900, { e: EZ.soft });
    A($('.sv-slab', el), [{ clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' }, { clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)' }], T.wipe, { e: EZ.wipe });
    A($('.sv-head', el), KF.fromLeft(), T.char, { delay: 120 });
    stagger($$('.sv-row', el), KF.fromLeft('-25%'), T.char, 200, 70);
    A($('.sv-prev', el), KF.fromRight('20%'), T.char, { delay: 300 });
  },
  key(k) {
    if (k === 'up') this.S.move(-1);
    else if (k === 'down') this.S.move(1);
    else if (k === 'ok') {
      const s = SLOTS[this.S.idx];
      if (s) confirmBox('이 데이터를 불러올까요?', `${s.ch} · ${s.band}`, () => { Object.assign(G, SAVE.profile); if (SAVE.progress.done) { saving(); go('menu', { via: 'pan', push: false }); } else Story.start(SAVE.progress.story || 'prologue', SAVE.progress.step); });
      else go('opening');   // NEW GAME → cold open → create
    } else if (k === 'back') { G.stack = []; go('title', { via: 'pan', dir: -1, push: false }); }
    return true;
  },
});

/* ---------------- CREATE ---------------- */
const INSTS = [['GT', 'GUITAR', '기타'], ['BA', 'BASS', '베이스'], ['DR', 'DRUMS', '드럼'], ['KEY', 'KEYS', '키보드']];
const CSTEPS = [
  { k: 'gender', t: '성별', q: '너는 누구였지?' },
  { k: 'name', t: '이름', q: '다들 너를 뭐라고 불렀지?' },
  { k: 'inst', t: '악기', q: '그날 무슨 악기를 들고 있었지?' },
];
scene('create', {
  title: '주인공 생성', cls: 'cr', via: 'sweep',
  html: `${bgImg('title', 'cr-img')}<div class="cr-tint"></div>${bigWord('PROFILE', 'cr-word')}
    <div class="cr-art" data-asset="A04"><img alt=""><span class="cr-need">A04 · <em></em> 버전 일러 필요</span></div>
    <div class="cr-head">1년 전, 그날의 나</div>
    <div class="cr-steps">${CSTEPS.map((s, i) => `<span><b>0${i + 1}</b>${s.t}</span>`).join('')}</div>
    <div class="cr-q"></div>
    <div class="cr-opts"></div>
    <div class="cr-name"><input id="crName" maxlength="8" value="나기" aria-label="주인공 이름" autocomplete="off"><small>Enter로 확정 · 최대 8자</small></div>
    ${backChip()}
    ${hint([['A', '결정'], ['B', '이전 단계'], ['↕', '선택']], 'NEW GAME')}`,
  init(el) {
    $('#crName', el).addEventListener('input', e => { G.name = e.target.value.trim() || '나기'; });
  },
  paintArt(anim) {
    const el = this.el, img = $('.cr-art img', el), gt = hasYouArt(), src = youImg();
    img.classList.toggle('dim', !gt);
    $('.cr-need', el).hidden = gt || this.step < 2;
    $('.cr-need em', el).textContent = INSTS.find(x => x[0] === G.inst)[2];
    // swap only once the new art is decoded, so the old picture never lingers under the entrance motion
    const next = new Image(); next.src = src;
    (next.decode ? next.decode() : Promise.resolve()).catch(() => {}).then(() => {
      if (youImg() !== src) return;                 // the choice moved on while this one loaded
      img.src = src;
      if (anim) A($('.cr-art', el), [{ translate: '0 3%', opacity: .2 }, { translate: '0 0', opacity: 1 }], T.char);
    });
  },
  showStep(dir) {
    const el = this.el, st = CSTEPS[this.step];
    $$('.cr-steps span', el).forEach((s, i) => { s.classList.toggle('on', i === this.step); s.classList.toggle('done', i < this.step); });
    $('.cr-q', el).textContent = st.q;
    A($('.cr-q', el), KF.fromRight('10%'), T.char);
    const box = $('.cr-opts', el), nm = $('.cr-name', el);
    nm.hidden = st.k !== 'name';
    box.innerHTML = '';
    this.L = null;
    if (st.k === 'name') {
      const inp = $('#crName', el);
      A(nm, KF.fromRight('20%'), T.char);
      setTimeout(() => { inp.focus(); inp.select(); }, 200);
    } else {
      const opts = st.k === 'gender' ? [['m', 'MALE', '남'], ['f', 'FEMALE', '여']] : INSTS;
      box.innerHTML = opts.map(([v, t, s]) => `<span data-v="${v}">${t}<small>${s}</small></span>`).join('');
      const items = $$('span', box), cur = st.k === 'gender' ? G.gender : G.inst;
      this.L = List(items, {
        start: Math.max(0, opts.findIndex(o => o[0] === cur)),
        jolt: box,
        onChange: (n, s, silent) => { if (st.k === 'gender') G.gender = s.dataset.v; else G.inst = s.dataset.v; if (!silent) this.paintArt(true); },
        onPick: () => this.key('ok'),
      });
      items.forEach((s, i) => A(s, KF.fromLeft(`${-30 * (dir || 1)}%`), T.char, { delay: 80 + i * 70 }));
      A(this.L.el, KF.scaleX, T.pop, { delay: 400, pe: '::before', e: EZ.pop });
    }
    this.paintArt(false);
  },
  enter() {
    this.step = 0;
    const el = this.el;
    A($('.cr-img', el), KF.fade, 700);
    A($('.cr-word', el), KF.fromRight('20%'), 900, { e: EZ.soft });
    A($('.cr-head', el), [{ opacity: 0, letterSpacing: '.5em' }, { opacity: 1, letterSpacing: '.08em' }], 1200, { e: EZ.soft });
    A($('.cr-art', el), KF.fromBottom('15%'), T.char, { delay: 150 });
    stagger($$('.cr-steps span', el), KF.fromTop('-100%'), T.slam, 200, 70);
    this.showStep(1);
  },
  leave() { $('#crName', this.el).blur(); },
  key(k) {
    const st = CSTEPS[this.step];
    if (k === 'up' && this.L) this.L.move(-1);
    else if (k === 'down' && this.L) this.L.move(1);
    else if (k === 'ok') {
      if (this.step < 2) { this.step++; this.showStep(1); }
      else {
        // freeze the choice now: the dialog closes before its callback runs, and a stray hover over the list
        // in that gap used to switch the instrument (e.g. KEYS saved as DRUMS)
        const prof = { name: G.name, gender: G.gender, inst: G.inst };
        confirmBox(`${prof.name}, 맞아?`, `${prof.gender === 'm' ? '남' : '여'} · ${INSTS.find(x => x[0] === prof.inst)[2]} · SIGNAL LOST에서 맡았던 파트`, () => {
          Object.assign(G, prof);
          SAVE.profile = prof; writeSave();
          Story.start('prologue');
        });
      }
    } else if (k === 'back') {
      if (this.step > 0) { this.step--; $('#crName', this.el).blur(); this.showStep(-1); }
      else go('save', { via: 'iris', push: false });
    }
    return true;
  },
});

/* ---------------- ADV (dialogue) ---------------- */
/* default script when the dialogue scene opens without one (dev ?shot=adv): the week-1 arrival */
const SCRIPT = null;
/* which way each portrait looks: stand on the opposite side so they face the dialogue box */
const FACING = { rui: 'r', natsu: 'r', koto: 'r', rei: 'r', ren: 'l', haru: 'l' };
const SPEAKER = {   // face window uses the A10 face icons, so NPCs without portraits get a face too
  '세리자와 점장': { role: '0dB OWNER', c: 'var(--pink)', face: 'serizawa' },
  '@NAME': { role: 'YOU', c: 'var(--lime)', face: 'you' },
  '???': { role: '???', c: 'var(--c-rui)', face: 'rui' },
  '아마네 루이': { role: 'RUI · VOCAL', c: 'var(--c-rui)', face: 'rui' },
  '하루': { role: 'HARU · LEAD GUITAR', c: 'var(--c-haru)', face: 'haru' },
  '소마': { role: 'SIGNAL LOST', c: '#8FA8FF' },
  '키리야': { role: 'SIGNAL LOST', c: '#8FA8FF' },
  '미카미': { role: 'CRESCENDO RECORDS', c: '#FFE14A', face: 'mikami' },
};
scene('adv', {
  title: '대화 (ADV)', cls: 'adv adv2 adv3', via: 'zoom',
  html: `${bgImg('backstage', 'adv-img drift')}<div class="adv-vig"></div>
    <div class="adv-place"><b>0dB</b> 백스테이지 · 밤</div>
    ${dateChip()}
    <div class="adv-ch" data-asset="A05"><img src="img/pt/rui_neutral.webp" alt=""></div>
    <div class="adv-choices"></div>
    <div class="adv-box">
      <div class="adv-ink"></div>
      <span class="adv-face"><img alt=""></span>
      <div class="adv-name"><span></span><small class="adv-role"></small></div>
      <div class="adv-text"></div>
      <span class="adv-next"><i></i></span>
    </div>
    <div class="adv-sig"><i></i></div>
    <div class="adv-ctrl"><span data-c="log"><b>Q</b>LOG</span><span data-c="auto"><b>Y</b>AUTO</span><span data-c="skip"><b>E</b>SKIP</span><span data-c="menu"><b>X</b>MENU</span></div>`,
  init(el) {
    el.addEventListener('click', e => {
      if (G.cur !== 'adv' || e.target.closest('.adv-ctrl') || e.target.closest('.adv-choices') || e.target.closest('.datechip')) return;
      this.key('ok');
    });
    $$('.adv-ctrl span', el).forEach(s => s.addEventListener('click', e => { e.stopPropagation(); this.ctrl(s.dataset.c); }));
  },
  enter(arg) {
    const o = arg && typeof arg === 'object' ? arg : {};
    this.script = o.script || SCRIPT || S_CALL; this.next2 = o.next || null; this.abort = o.abort || null;
    $('.adv-img', this.el).style.backgroundImage = `url(img/bg/${o.bg || 'backstage'}.webp)`;
    $('.adv-place', this.el).innerHTML = o.place || '<b>0dB</b> 백스테이지 · 밤';
    const dc = $('.datechip', this.el); if (o.date && dc) { const t = document.createElement('div'); t.innerHTML = o.date; dc.replaceWith(t.firstElementChild); }
    this.el.classList.remove('fx-blur');
    this.i = typeof arg === 'number' ? arg : 0; this.pick = 0; this.ended = false; this.log = []; this.auto = false; this.choosing = false; this.speaking = null;
    const el = this.el;
    $('.adv-ch', el).hidden = true;
    $$('.adv-ctrl span', el).forEach(s => s.classList.remove('on'));
    this.prime();
    A($('.adv-img', el), [{ opacity: 0, scale: '1.08' }, { opacity: 1, scale: '1' }], 900, { e: EZ.soft });
    A($('.adv-place', el), KF.fromLeft('-60%'), T.char, { delay: 300 });
    A($('.datechip', el), KF.fromRight('60%'), T.char, { delay: 360 });
    A($('.adv-box', el), [{ translate: '0 30%', opacity: 0 }, { translate: '0 0', opacity: 1 }], T.char, { delay: 500 });
    stagger($$('.adv-ctrl span', el), KF.fromRight('60%'), T.slam, 600, 70);
    later(() => this.show(), 900);
  },
  leave() { clearInterval(this.tw); },
  line() { return this.script[this.i]; },
  /* lines can depend on the save: { if: g => ... } is skipped when false (g = SAVE.game, pick = the last choice) */
  skipIf() { let ln; while ((ln = this.script[this.i]) && ln.if && !ln.if(SAVE.game || {}, this.pick)) this.i++; },
  /* shape the empty box for the first line before it slides in, so it never flashes a face slot it won't use */
  prime() {
    this.skipIf();
    const el = this.el, ln = this.line() || {}, box = $('.adv-box', el), meta = SPEAKER[ln.who] || {};
    el.dataset.side = !ln.ch ? 'N' : FACING[ln.ch] === 'l' ? 'R' : 'L';
    $('.adv-face', el).hidden = !meta.face;
    box.classList.toggle('noface', !meta.face);
    box.classList.toggle('narr', !ln.who);
    box.classList.toggle('me', ln.who === '@NAME');
    box.classList.toggle('talk', !!ln.ch && ln.who !== '@NAME');
    box.style.setProperty('--sc', meta.c || 'var(--peri)');
    $('.adv-name span', el).textContent = ''; $('.adv-role', el).textContent = ''; $('.adv-text', el).textContent = '';
    $('.adv-next', el).hidden = true;
    this.speaking = null;
  },
  show() {
    this.skipIf();
    const el = this.el, ln = this.line();
    if (!ln) return this.end();
    if (ln.eff && !ln.choice && typeof applyEff === 'function') applyEff(ln.eff);   // a line that changes something as it plays
    const ch = $('.adv-ch', el);
    const side = !ln.ch ? 'N' : FACING[ln.ch] === 'l' ? 'R' : 'L';   // N = narration: centred box, no portrait
    if (el.dataset.side !== side) { el.dataset.side = side; if (side === 'N') ch.hidden = true; }
    if (ln.ch && ch.hidden) { ch.hidden = false; A(ch, [{ translate: side === 'R' ? '12% 0' : '-12% 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], T.char * 1.2); }
    ch.classList.toggle('listening', !!ln.ch && ln.who === '@NAME');
    if (ln.ch) {                                    // swap expression: quick squash so the change reads
      const ex = Array.isArray(ln.ex) ? ln.ex[this.pick] : (ln.ex || 'neutral'), img = $('img', ch), src = `img/pt/${ln.ch}_${ex}.webp`;
      if (!img.src.endsWith(src)) { img.src = src; if (!ch.hidden) A(img, [{ scale: '1.03 .97', translate: '0 1%' }, { scale: '1', translate: '0 0' }], T.pop, { e: EZ.pop }); }
    }
    if (ln.bg) {                                    // cut to a new place inside the same scene
      const im = $('.adv-img', el);
      A(im, [{ opacity: 1 }, { opacity: 0 }], 260, { fill: 'forwards' }).finished.then(() => {
        im.style.backgroundImage = `url(img/bg/${ln.bg}.webp)`;
        A(im, [{ opacity: 0, scale: '1.05' }, { opacity: 1, scale: '1' }], 700, { e: EZ.soft, fill: 'forwards' });
      });
    }
    if (ln.choice) return this.openChoice(ln.choice);
    if (ln.fx === 'tinnitus') this.tinnitus();
    if (ln.fx === 'buzz') A($('.adv-box', el), [{ translate: '0 0' }, { translate: '-4px 0' }, { translate: '4px 0' }, { translate: '-3px 0' }, { translate: '0 0' }], 90, { it: 4, e: EZ.lin });
    if (ln.fx === 'signal') this.signal();
    this.el.classList.toggle('fx-blur', ln.fx === 'blur' || ln.fx === 'tinnitus');
    const who = ln.who === '@NAME' ? G.name : (ln.who || '');
    const name = $('.adv-name', el), box = $('.adv-box', el), face = $('.adv-face', el);
    const meta = SPEAKER[ln.who] || {};
    box.style.setProperty('--sc', meta.c || 'var(--peri)');
    $('.adv-role', el).textContent = meta.role || '';
    face.hidden = !meta.face;
    box.classList.toggle('noface', !meta.face);
    if (meta.face) $('img', face).src = icon(meta.face);
    if (who !== this.speaking) {
      A(name, [{ translate: '-30% 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], T.slam);
      if (meta.face) A(face, [{ scale: '1.6', rotate: '20deg', opacity: 0 }, { scale: '1', rotate: '-8deg', opacity: 1 }], T.pop * 1.4, { e: EZ.pop });
      if (this.speaking) jolt(box);
      this.speaking = who;
    }
    $('span', name).textContent = who;
    box.classList.toggle('me', ln.who === '@NAME');
    box.classList.toggle('talk', !!ln.ch && ln.who !== '@NAME');
    box.classList.toggle('narr', !ln.who);
    const text = (Array.isArray(ln.text) ? ln.text[this.pick] : ln.text).replace(/@NAME/g, G.name).replace(/@BAND/g, (SAVE.game && SAVE.game.bandName) || 'RE:AMP');
    this.log.push({ who, text });
    const t = $('.adv-text', el);
    t.textContent = '';
    $('.adv-next', el).hidden = true;
    let n = 0;
    clearInterval(this.tw);
    this.typing = true; this.full = text;
    this.tw = setInterval(() => { t.textContent = text.slice(0, ++n); if (n >= text.length) this.finishType(); }, 45 * G.K);
  },
  finishType() {
    clearInterval(this.tw);
    this.typing = false;
    $('.adv-text', this.el).textContent = this.full;
    $('.adv-next', this.el).hidden = false;
    if (this.auto) later(() => { if (!this.typing && !this.choosing && G.cur === 'adv') this.next(); }, 1800);
  },
  next() { this.i++; this.show(); },
  openChoice(opts) {
    this.choosing = true; this.picked = false;
    const box = $('.adv-choices', this.el);
    const ln = this.line(), g = SAVE.game || {};
    this.off = opts.map((o, i) => !!(ln.need && ln.need[i] && !ln.need[i](g)));   // options the player can't take yet: shown, greyed, with why
    box.innerHTML = opts.map((o, i) => `<span class="adv-opt${this.off[i] ? ' off' : ''}"><b>${'ABCDE'[i]}</b>${o}${this.off[i] && ln.needT && ln.needT[i] ? `<small>${ln.needT[i]}</small>` : ''}</span>`).join('');
    const items = $$('.adv-opt', box);
    stagger(items, KF.fromRight('30%'), T.char, 0, 90);
    this.CL = List(items, { onPick: n => this.choose(n), jolt: box, start: Math.max(0, this.off.indexOf(false)) });   // the cursor starts on an option you can take
    A(this.CL.el, KF.scaleX, T.pop, { delay: 350, pe: '::before', e: EZ.pop });
    A($('.adv-box', this.el), [{ opacity: 1 }, { opacity: .35 }], T.slam, { fill: 'forwards' });
  },
  /* the cyan line from the logo snaps across the room: the cue for the OP */
  signal() {
    const sg = $('.adv-sig', this.el), line = $('i', sg);
    A(sg, [{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .8 }, { opacity: 0 }], 1600, { e: EZ.lin });
    A(line, [{ scale: '0 1', translate: '0 0' }, { scale: '1 1', translate: '0 -8px', offset: .2 }, { translate: '0 6px', offset: .3 }, { translate: '0 -3px', offset: .4 }, { scale: '1 1', translate: '0 0', offset: .75 }, { scale: '1 3', translate: '0 0' }], 1600, { e: EZ.lin });
    A($('.adv-img', this.el), [{ filter: 'none' }, { filter: 'brightness(1.8) saturate(0)', offset: .2 }, { filter: 'brightness(.4)' }], 1600, { fill: 'forwards' });
  },
  choose(n) {
    if (this.picked) return;                        // a second press while the choice plays out must not count twice
    if (this.off && this.off[n]) { shake(this.CL.items[n]); return; }
    this.picked = true;
    const eff = this.line().eff;
    if (eff && eff[n] && typeof applyEff === 'function') applyEff(eff[n]);
    this.pick = n;
    this.log.push({ who: G.name, text: this.line().choice[n] });
    const box = $('.adv-choices', this.el), chosen = this.CL.items[n];
    A(chosen, [{ scale: '1' }, { scale: '1.08' }, { scale: '1' }], 300, { e: EZ.pop });
    this.CL.items.forEach((it, i) => { if (i !== n) A(it, [{ opacity: 1 }, { opacity: 0, translate: '20% 0' }], T.slam, { fill: 'forwards' }); });
    later(() => { A(chosen, [{ opacity: 1 }, { opacity: 0, translate: '-10% 0' }], T.slam, { fill: 'forwards' }); }, 380);
    later(() => { box.innerHTML = ''; this.choosing = false; $('.adv-box', this.el).getAnimations().forEach(a => a.cancel()); this.next(); }, 700);
  },
  end() {
    if (this.ended) return;                         // a double press on the last line must not run what comes next twice
    this.ended = true;
    clearInterval(this.tw);
    if (this.next2) return this.next2();
    later(() => { G.stack = []; go('title', { push: false }); }, 600);
  },
  /* a thin high tone + the room pulling away */
  tinnitus() {
    try {
      const ac = AU.get(), o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = 7400; o.connect(g).connect(AU.master);
      g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(.045, ac.currentTime + .05); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + 4.5);
      o.start(); o.stop(ac.currentTime + 4.6);
    } catch (e) {}
    A(this.el, [{ filter: 'blur(0) brightness(1)' }, { filter: 'blur(3px) brightness(1.6)', offset: .1 }, { filter: 'blur(1.5px) brightness(1)' }], 2400, { e: EZ.soft });
  },
  ctrl(c) {
    const el = this.el, btn = $(`[data-c="${c}"]`, el);
    pop(btn);
    if (c === 'auto') { this.auto = !this.auto; btn.classList.toggle('on', this.auto); if (this.auto && !this.typing && !this.choosing) this.next(); }
    else if (c === 'skip') {
      while (this.script[this.i + 1] && !this.script[this.i + 1].choice && !this.choosing) { this.i++; const l = this.script[this.i]; if (l.if && !l.if(SAVE.game || {}, this.pick)) continue; if (l.eff && typeof applyEff === 'function') applyEff(l.eff); this.log.push({ who: l.who === '@NAME' ? G.name : l.who, text: Array.isArray(l.text) ? l.text[this.pick] : l.text }); }
      if (!this.choosing) this.next();
    } else if (c === 'log') this.openLog();
    else if (c === 'menu') {
      if (this.abort) confirmBox('여기서 그만둘까요?', '이 이야기는 처음부터 다시 봐야 해요. 지금까지 고른 선택은 없던 일이 돼요.', () => this.abort());
      else confirmBox('타이틀로 갈까요?', '이 장면은 처음부터 다시 시작해요.', () => { G.stack = []; go('title', { push: false }); });
    }
  },
  openLog() {
    const el = document.createElement('div');
    el.className = 'backlog';
    el.innerHTML = `<div class="bl-dim"></div><div class="bl-word">LOG</div><div class="bl-date"><b>${W.g ? dateKo(W.g.day) : '1년 전'}</b>${W.g ? '나기사카' : '블루 아워 페스'}</div>
      <div class="bl-list">${this.log.map(l => `<div class="bl-row${l.who === G.name ? ' me' : ''}"><b>${l.who}</b><span>${l.text}</span></div>`).join('')}</div>
      <div class="bl-hint">↕ 스크롤 · X 닫기</div>`;
    overlayRoot.appendChild(el);
    A($('.bl-dim', el), KF.fade, T.slam);
    A($('.bl-word', el), KF.fromLeft('-30%'), T.char);
    stagger($$('.bl-row', el), KF.fromBottom('40%'), T.slam, 100, 40);
    const list = $('.bl-list', el);
    list.scrollTop = list.scrollHeight;
    const ov = openOverlay({
      key(k) {
        if (k === 'up') list.scrollBy({ top: -120, behavior: 'smooth' });
        else if (k === 'down') list.scrollBy({ top: 120, behavior: 'smooth' });
        else if (k === 'back' || k === 'l1') ov.close();
        return true;
      },
      close(instant) {
        closeOverlay(ov);
        if (instant) return el.remove();
        A(el, [{ opacity: 1 }, { opacity: 0 }], T.slam, { fill: 'forwards' });
        setTimeout(() => el.remove(), 320 * G.K);
      },
    });
    $('.bl-dim', el).addEventListener('click', () => ov.close());
  },
  key(k) {
    if (this.choosing) {
      if (k === 'up') this.CL.move(-1); else if (k === 'down') this.CL.move(1); else if (k === 'ok') this.choose(this.CL.i);
      else if (k === 'l1') this.openLog();
      return true;
    }
    if (k === 'ok' || k === 'down') { if (this.typing) this.finishType(); else this.next(); }
    else if (k === 'l1' || k === 'up') this.openLog();
    else if (k === 'y') this.ctrl('auto');
    else if (k === 'r1') this.ctrl('skip');
    else if (k === 'back') this.ctrl('menu');
    return true;
  },
});
