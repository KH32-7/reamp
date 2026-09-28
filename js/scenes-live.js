/* RE:AMP! — rhythm scenes: RHYTHM LAB (test bench) · LIVE (the game) · RESULT.
   Scenarios bundle the scripted events: lab (random fumbles + eye contacts), tutorial (prologue song 1),
   incident (prologue song 2: Haru's lane dies, then the 47 seconds). */
'use strict';

const INST_INFO = {
  GT: { en: 'GUITAR', ko: '기타', th: 'FRETBOARD', keys: 'D F J K' },
  BA: { en: 'BASS', ko: '베이스', th: 'LOW END', keys: 'D F J K' },
  DR: { en: 'DRUMS', ko: '드럼', th: 'KIT', keys: 'D F J K + SPACE' },
  KEY: { en: 'KEYS', ko: '키보드', th: 'KEYS', keys: 'D F J K' },
};
const LANE_CODE = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3, Space: 4 };

/* scripted events per scenario (bars are song bars; real songs will use seconds, e.g. blackout at 151 = 2:31) */
function scenarioEvents(sc, prep, part) {
  const hasHold = (prep.charts[part] || [[], []])[1].some(n => n.len);
  // カウント四つ (127bpm): vocals from bar 4, guitar comes in at bar 12, chorus 1 at 16, chorus 2 at 40, last chorus at 80
  if (sc === 'tutorial') return [
    { type: 'tip', bar: -.5, text: `노트가 판정선에 닿는 순간 <b>${INST_INFO[part].keys}</b>`, dur: 5 },
    ...(part === 'DR' ? [{ type: 'tip', bar: 4, text: '가로로 긴 주황 막대는 킥 — <b>SPACE</b>', dur: 4 }] : []),
    ...(hasHold ? [{ type: 'tip', bar: 7, text: '길게 이어진 노트는 <b>끝까지 누르고 있기</b>', dur: 4 }] : []),
    ...(prep.charts.EX ? [{ type: 'tip', bar: 9.5, text: '반짝이는 <b>보석 노트</b>는 코러스·퍼커션 — 어떤 악기든 같이 친다', dur: 4.5, c: '#FF8FC8' }] : []),
    { type: 'tip', bar: 12.5, text: '하루가 흔들린다 — <b>COVER</b> 노트를 쳐서 받쳐 줘', dur: 4, c: '#2EC7F0' },
    { type: 'fumble', who: 'haru', bar: 14, beats: 4 },
    { type: 'tip', bar: 15, text: '<b>EYE CONTACT</b> — 색이 칠해진 한 마디를 GREAT 이상으로', dur: 4, c: '#2EC7F0' },
    { type: 'eye', who: 'haru', bar: 16, bars: 1, ex: 'pained' },
    { type: 'cameo', who: 'koto', bar: 24 },
    { type: 'eye', who: 'soma', bar: 40, bars: 1 },
    { type: 'cameo', who: 'natsu', bar: 44 },
    { type: 'eye', who: 'kiriya', bar: 80, bars: 1 },
  ];
  // 半拍ずれたまま (125bpm): chorus at 20 and 48; 2:31 falls right before the last chorus
  if (sc === 'incident') {
    const bo = +(QS.get('bo') || 47);
    const cut = prep.song.cutAt;
    const at = cut != null ? { at: cut } : { bar: 36 };
    const pre = cut != null ? { at: cut - 2 * 240 / prep.tm.bpm } : { bar: 34 };
    return [
      { type: 'eye', who: 'haru', bar: 20, bars: 1, ex: 'smile' },
      { type: 'eye', who: 'kiriya', bar: 48, bars: 1 },
      { type: 'eye', who: 'haru', bar: 68, bars: 1, ex: 'neutral' },
      { type: 'memberDrop', who: 'haru', ...pre },
      { type: 'blackout', ...at, dur: bo },
    ];
  }
  // lab: an eye contact every 16 bars, rotating through the band
  return [0, 1, 2, 3].map(k => ({ type: 'eye', who: null, bar: 8 + k * 16, bars: 1, k }));
}

/* ================= LIVE ================= */
scene('live', {
  cls: 'lv', back: false,
  html: `<div class="lv-bg"><div class="lv-img"></div><div class="lv-beams"><i></i><i></i><i></i><i></i></div><div class="lv-vig"></div></div>
    <div class="lv-title" aria-hidden="true"></div>
    <div class="lv-crowd"></div>
    <canvas class="lv-cv"></canvas>
    <div class="lv-prog"><i></i></div>
    <div class="lv-score">
      <div class="rk"><small>RANK</small><b class="rk-n">D</b></div>
      <div class="sc">
        <div class="sc-lb">SCORE <b class="lv-t"></b><small class="lv-d"></small></div>
        <div class="sc-bar"><i class="fill"></i><u data-r="C" style="left:70%"></u><u data-r="B" style="left:80%"></u><u data-r="A" style="left:90%"></u><u data-r="S" style="left:95%"></u></div>
        <b class="sc-n"><span class="z">00000000</span></b>
      </div>
    </div>
    <div class="lv-heat"><div class="ht-top"><span class="ht-lb">CROWD HEAT</span><em class="ht-amp">AMP!</em><b class="ht-n">50</b></div><div class="ht-bar"><b></b><i class="ht-80"></i></div></div>
    <div class="lv-sync"><span>BAND SYNC</span><div class="segs">${'<i></i>'.repeat(20)}</div><b class="sy-n">60%</b></div>
    <div class="lv-pz" aria-label="일시정지"><i></i><i></i></div>
    <div class="lv-party"></div>
    <div class="lv-inst"><b></b><small></small></div>
    <div class="lv-jd"><b class="jt"></b><em class="fs"></em></div>
    <div class="lv-combo"><b class="cb-n"></b><small>COMBO</small></div>
    <div class="lv-ci"><div class="bk"></div><div class="s1"></div><div class="s2"></div><div class="eyes"><img alt=""></div><div class="tx"><b>EYE<br>CONTACT!</b><em></em><small>한 마디 · GREAT 이상</small></div></div>
    <div class="lv-cameo"><div class="cm-lens"><img alt=""></div><span></span></div>
    <div class="lv-tip"></div>
    <div class="lv-banner"><b></b><small></small></div>
    <div class="lv-count"></div>
    <div class="lv-bo"><div class="bo-timer">00:00</div><div class="bo-prompt"><b>RECOVER</b><small>노란 노트를 쳐서 소리를 되살려</small></div><div class="bo-err">NO SIGNAL</div></div>
    <div class="lv-load"><div class="ld-ring"></div><b>SOUND CHECK</b><small class="ld-st"></small></div>
    <div class="lv-fail"><div class="fl-dim"></div><div class="fl-word">SILENCE</div><div class="fl-q">관객이 조용해졌다.</div><div class="fl-list"><span>다시 한다</span><span>조금 쉽게 다시 한다</span><span>받아들인다</span></div></div>`,
  init(el) {
    this.cv = $('.lv-cv', el);
    $('.lv-pz', el).addEventListener('click', e => { e.stopPropagation(); if (G.cur === 'live' && this.L && !this.L.finished && !this.menu) this.pauseMenu(); });
    this.onKey = e => this.key2(e, true);
    this.onKeyUp = e => this.key2(e, false);
  },
  resize() { if (this.R) this.R.resize(Math.min(2, (G.scale || 1) * (window.devicePixelRatio || 1))); },

  async enter(arg = {}) {
    const el = this.el;
    this.arg = arg;
    this.stopLoop();
    el.className = el.className.replace(/\b(amp|cold|silence|bo|hands|ready|th-\w+)\b/g, '').trim();
    const song = typeof arg.song === 'string' ? SONGS.find(s => s.id === arg.song) : arg.song || SONGS[0];
    const part = arg.part || G.inst || 'GT', diff = arg.diff ?? G.diff ?? 1;
    this.part = part;
    el.classList.add('th-' + part.toLowerCase());
    $('.lv-t', el).textContent = song.title; $('.lv-d', el).textContent = `${DIFFS[diff]} · ${part}`;
    $('.lv-title', el).textContent = song.title;
    $('.lv-inst b', el).textContent = INST_INFO[part].th; $('.lv-inst small', el).textContent = `${INST_INFO[part].en} · ${INST_INFO[part].keys}`;
    $('.lv-img', el).style.backgroundImage = `url(img/bg/${arg.bg || 'stage_fest'}.webp)`;
    $$('.lv-jd b, .lv-jd em, .cb-n', el).forEach(x => { x.textContent = ''; });
    $('.lv-combo', el).style.opacity = 0;
    $('.lv-fail', el).hidden = true; $('.lv-bo', el).hidden = true;
    // prepare (synthesize / decode / analyze) with a sound-check screen
    const ld = $('.lv-load', el); ld.hidden = false; A(ld, KF.fade, 300);
    let prep;
    try { prep = await prepareSong(song, st => { $('.ld-st', el).textContent = st; }); }
    catch (e) { $('.ld-st', el).textContent = '불러오지 못했어요: ' + e.message; return; }
    if (G.cur !== 'live' || this.arg !== arg) return;
    this.prep = prep;
    // party + events
    const party = (arg.party || (arg.scenario === 'lab' ? 'band' : 'signal')) === 'band' ? bandParty(part) : signalParty(part);
    let events = arg.events || scenarioEvents(arg.scenario || 'lab', prep, part);
    events = events.map(e => e.who === null ? { ...e, who: party[e.k % party.length].id } : e);
    const L = this.L = new Live({
      prep, part, diff, party, events, seed: arg.seed,
      noFail: SETTINGS.noFail || arg.noFail || arg.scenario === 'incident',          // the 47 seconds can't be failed tutorial: arg.scenario === 'tutorial',
      randomFumbles: arg.scenario === 'lab', auto: arg.auto, heat0: arg.heat0, from: arg.from,
      on: (t, d) => this.ev(t, d),
    });
    this.R = Highway(this.cv, L, { k: Math.min(2, (G.scale || 1) * (window.devicePixelRatio || 1)) });
    this.renderParty();
    A(ld, [{ opacity: 1 }, { opacity: 0 }], 300, { fill: 'forwards' }).finished.then(() => { ld.hidden = true; ld.getAnimations().forEach(a => a.cancel()); });
    this.intro();
    window.addEventListener('keydown', this.onKey, true);
    window.addEventListener('keyup', this.onKeyUp, true);
    this.rawKeys = true;
    L.start(2.6);
    this.countdown();
    this.shown = { score: 0, rank: '', syncOn: -1 };
    this.loop();
  },
  leave() {
    this.stopLoop();
    this.L && this.L.stop();
    this.rawKeys = false;
    window.removeEventListener('keydown', this.onKey, true);
    window.removeEventListener('keyup', this.onKeyUp, true);
  },
  stopLoop() { cancelAnimationFrame(this.raf); this.raf = 0; },

  intro() {
    const el = this.el;
    A($('.lv-img', el), [{ opacity: 0, scale: '1.1' }, { opacity: 1, scale: '1' }], 1200, { e: EZ.soft });
    A($('.lv-title', el), KF.fromTop('-20%'), T.char);
    A($('.lv-score', el), KF.fromLeft('-40%'), T.slam, { delay: 80 });
    A($('.lv-heat', el), KF.fromRight('40%'), T.slam, { delay: 120 });
    A($('.lv-sync', el), KF.fromRight('40%'), T.slam, { delay: 180 });
    A($('.lv-pz', el), KF.popIn, T.pop, { delay: 240, e: EZ.pop });
    stagger($$('.lv-prow', el), KF.fromLeft('-60%'), T.slam, 200, 60);
    A($('.lv-inst', el), KF.fromBottom('200%'), T.char, { delay: 300 });
    A(this.cv, [{ clipPath: 'inset(100% 0 0 0)', opacity: .2 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }], 700, { e: EZ.wipe, delay: 200 });
  },
  countdown() {
    const L = this.L, el = this.el, c = $('.lv-count', el), beat = L.beat;
    const t0 = L.tm.offset;
    [3, 2, 1, 'GO!'].forEach((n, i) => {
      const at = (L.t0 + t0 - (3 - i) * beat - L.ac.currentTime) * 1000;
      setTimeout(() => {
        if (G.cur !== 'live' || this.L !== L) return;
        c.textContent = n; c.classList.toggle('go', n === 'GO!');
        A(c, [{ scale: '2.4', opacity: 0, rotate: '-12deg' }, { scale: '1', opacity: 1, rotate: '-6deg', offset: .35 }, { scale: '.9', opacity: 0, rotate: '-6deg' }], i === 3 ? 700 : beat * 1000, { e: EZ.slam, fill: 'forwards' });
      }, Math.max(0, at));
    });
  },

  loop() {
    const tick = p => {
      const L = this.L;
      if (!L || G.cur !== 'live') return;
      L.update(p);
      this.R.draw(L.running && !L.paused ? L.timeAt(p) : L.time, p);
      this.hud(p);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  },

  hud(p) {
    const L = this.L, el = this.el, s = this.shown;
    s.score += (L.score - s.score) * .25;
    if (Math.abs(L.score - s.score) < 1) s.score = L.score;
    const str = String(Math.round(s.score)).padStart(8, '0'), nz = str.search(/[1-9]/);
    if (str !== s.str) { s.str = str; $('.sc-n', el).innerHTML = nz < 0 ? `<span class="z">${str}</span>` : `<span class="z">${str.slice(0, nz)}</span>${str.slice(nz)}`; }
    $('.sc-bar .fill', el).style.width = (s.score / 1e4) + '%';
    const sc = L.score, rk = sc >= 980000 ? 'SS' : sc >= 950000 ? 'S' : sc >= 900000 ? 'A' : sc >= 800000 ? 'B' : sc >= 700000 ? 'C' : 'D';
    if (rk !== s.rank) {
      const first = !s.rank; s.rank = rk;
      const r = $('.rk-n', el); r.textContent = rk; r.style.fontSize = rk.length > 1 ? '44px' : '';
      if (!first) A(r, [{ scale: '1.5', rotate: '-8deg' }, { scale: '1', rotate: '0deg' }], 260, { e: EZ.pop });
      $$('.sc-bar u', el).forEach(u => u.classList.toggle('on', sc >= { C: 7e5, B: 8e5, A: 9e5, S: 9.5e5 }[u.dataset.r]));
    }
    const on = Math.round(L.sync / 5);
    if (s.syncOn !== on) { s.syncOn = on; $$('.lv-sync .segs i', el).forEach((g, i) => g.classList.toggle('on', i < on)); $('.sy-n', el).textContent = Math.round(L.sync) + '%'; }
    $('.ht-bar b', el).style.width = L.heat + '%';
    $('.ht-n', el).textContent = Math.round(L.heat);
    el.classList.toggle('cold', L.heat < 25 && !L.bo);
    const prog = Math.max(0, Math.min(1, L.time / L.endT));
    $('.lv-prog i', el).style.transform = `scaleX(${prog})`;
    // lights breathe on the beat (harder when the crowd is hot); the stage and HUD thump, a touch harder on the downbeat
    const b = Charter.beatOf(L.tm, L.time), live = b > 0 && !L.bo && !L.paused, ph = ((b % 1) + 1) % 1;
    el.style.setProperty('--pulse', live ? (Math.exp(-ph * 4) * (.3 + L.heat / 140)).toFixed(3) : 0);
    el.style.setProperty('--thump', live && !REDUCED ? (Math.exp(-ph * 7) * (Math.floor(b) % 4 === 0 ? 1 : .6)).toFixed(3) : 0);
    el.style.setProperty('--jump', (live && L.heat > 40 ? Math.abs(Math.sin(b * Math.PI)) * (L.heat - 40) / 60 : 0).toFixed(3));
  },

  judgeText(k, dt = 0) {
    const jt = $('.jt', this.el), fs = $('.fs', this.el);
    jt.textContent = JN[k]; jt.dataset.k = k;
    fs.textContent = k === 1 || k === 2 ? (dt < 0 ? 'FAST' : 'SLOW') : ''; fs.dataset.f = dt < 0 ? 'f' : 's';
    jt.getAnimations().forEach(a => a.cancel());
    A(jt, k === 3
      ? [{ translate: '0 -20%', opacity: .9 }, { translate: '0 10%', opacity: .9, offset: .5 }, { opacity: 0 }]
      : [{ scale: '1.3', opacity: .3 }, { scale: '1', opacity: 1, offset: .2 }, { opacity: 1, offset: .7 }, { opacity: 0 }], 700, { fill: 'forwards' });
  },
  comboShow() {
    const cb = $('.lv-combo', this.el), n = $('.cb-n', this.el), c = this.L.combo;
    if (c >= 5) { cb.style.opacity = 1; n.textContent = c; n.getAnimations().forEach(a => a.cancel()); A(n, [{ scale: '1.2', translate: '0 -6%' }, { scale: '1', translate: '0 0' }], 140, { e: EZ.pop }); }
    else cb.style.opacity = 0;
  },

  /* ---------- engine events → DOM ---------- */
  ev(type, d) {
    const el = this.el, R = this.R;
    if (type === 'judge') {
      R.hit(d.n, d.k);
      this.judgeText(d.k, d.dt);
      this.comboShow();
      if (d.k === 3 && this.L.combo === 0) A($('.lv-score', el), [{ translate: '-4px 0' }, { translate: '4px 0' }, { translate: '0 0' }], 140);
    } else if (type === 'ghost') {
      R.ghostHit(d.n, d.k);
    } else if (type === 'hold') {
      // the tail's verdict is shown too: letting go early reads as a MISS, never as a silent success
      if (d.ok) R.hit({ ...d.n, kind: 'tap' }, 0); else this.judgeText(3);
      this.comboShow();
    } else if (type === 'empty') {
      R.lane[d.lane] && (R.lane[d.lane].press = 1);
    } else if (type === 'member') {
      d.m.lastBad = d.n.bad;
      const row = $(`.lv-prow[data-id="${d.m.id}"]`, el);
      if (row && d.n.bad) { row.classList.add('bad'); clearTimeout(row._t); row._t = setTimeout(() => row.classList.remove('bad'), 300); }
    } else if (type === 'warn') {
      d.m.warn = 1.8;
      const row = $(`.lv-prow[data-id="${d.m.id}"]`, el);
      if (row) { row.classList.add('warn'); A(row, [{ translate: '-6px 0' }, { translate: '6px 0' }, { translate: '0 0' }], 200, { it: 3 }); setTimeout(() => row.classList.remove('warn'), 3000); }
    } else if (type === 'cover') {
      if (d.k < 3) this.banner('COVER!', `${d.m ? d.m.en : ''} 파트를 받쳤다 · SYNC +`, d.m && d.m.c, true);
    } else if (type === 'eyeIn') this.cutin(d.w);
    else if (type === 'eyeOut') { if (d.ok) this.banner('SYNC UP!', `${d.w.en}와 눈이 맞았다`, d.w.c); }
    else if (type === 'milestone') this.banner(`${d.combo} COMBO`, '', null, true);
    else if (type === 'amp') { el.classList.toggle('amp', d.on); if (d.on) this.banner('AMP UP!', '관객이 달아올랐다', '#FF4FA0'); }
    else if (type === 'tip') this.tip(d);
    else if (type === 'cameo') this.cameo(d.who);
    else if (type === 'silence') { el.classList.add('silence'); this.banner('SILENCE', `노란 노트 ${d.of}개 중 ${d.need}개를 쳐서 되살려`, '#FFE14A'); }
    else if (type === 'recover') { el.classList.remove('silence'); this.banner('RE:AMP!', '소리가 돌아왔다', '#D7FF3A'); A(el, [{ filter: 'brightness(2)' }, { filter: 'brightness(1)' }], 400); }
    else if (type === 'fail') this.failMenu();
    else if (type === 'memberDrop') this.dropCut(d.m);
    else if (type === 'blackout') this.blackout(d);
    else if (type === 'recPrompt') { const p = $('.bo-prompt', el); p.hidden = false; A(p, KF.popIn, T.pop, { e: EZ.pop }); }
    else if (type === 'recFail') {
      $('.bo-prompt', el).hidden = true;
      const e = $('.bo-err', el); e.hidden = false;
      A(e, [{ opacity: 0, translate: '-8px 0' }, { opacity: 1, translate: '6px 0' }, { opacity: .6, translate: '-3px 0' }, { opacity: 1, translate: '0 0' }, { opacity: 0 }], 900, { e: 'steps(6)' }).finished.then(() => { e.hidden = true; });
    } else if (type === 'handsStop') { el.classList.add('hands'); }
    else if (type === 'end') this.end(d);
  },

  renderParty() {
    const L = this.L;
    $('.lv-party', this.el).innerHTML = `<span class="lead">${this.arg.scenario === 'lab' && this.arg.party === 'band' ? 'BAND' : 'SIGNAL LOST'}</span>` +
      `<div class="lv-prow you" style="--c:#4FE3FF"><div class="av"><img src="${icon('you')}" alt=""></div><div class="in"><div class="nm">${G.name || 'YOU'}<small>${this.part} · VO</small></div></div></div>` +
      L.members.map(m => `<div class="lv-prow${m.blur ? ' blur' : ''}" data-id="${m.id}" style="--c:${m.c}"><div class="av">${m.icon ? `<img src="${m.icon}" alt="">` : '<i class="sil"></i>'}</div><div class="in"><div class="nm">${m.en}<small>${m.part}</small></div></div><span class="st">ON AIR</span></div>`).join('');
  },

  banner(big, small, c, quick) {
    const b = $('.lv-banner', this.el);
    $('b', b).textContent = big; $('small', b).textContent = small || '';
    b.style.setProperty('--bc', c || '#FFFFFF');
    b.getAnimations().forEach(a => a.cancel());
    A(b, [{ clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)', opacity: 1 }, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', opacity: 1, offset: .15 }, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', opacity: 1, offset: .82 }, { clipPath: 'polygon(0 0,100% 0,100% 100%,100% 100%)', opacity: 0 }], quick ? 1000 : 1500, { e: EZ.lin, fill: 'forwards' });
    A($('b', b), [{ translate: '12% 0' }, { translate: '0 0' }], 400, { e: EZ.slam });
  },
  tip(d) {
    const t = $('.lv-tip', this.el);
    t.innerHTML = `<i>TUTORIAL</i><span>${d.text}</span>`;
    t.style.setProperty('--tc', d.c || 'var(--cyan)');
    t.getAnimations().forEach(a => a.cancel());
    A(t, [{ translate: '0 -140%', opacity: 0 }, { translate: '0 0', opacity: 1, offset: .08 }, { translate: '0 0', opacity: 1, offset: .92 }, { translate: '0 -140%', opacity: 0 }], (d.dur || 4) * 1000, { e: EZ.lin, fill: 'forwards' });
  },
  cutin(w) {
    const ci = $('.lv-ci', this.el), m = this.L.members.find(x => x.id === w.who) || {};
    ci.style.setProperty('--c', w.c);
    const img = $('.eyes img', ci);
    img.src = m.id === 'haru' ? `img/pt/haru_${w.ex || 'neutral'}.webp` : m.icon || '';
    img.classList.toggle('pt', m.id === 'haru');
    ci.classList.toggle('sil', !!m.blur);
    $('em', ci).textContent = m.blur ? `${w.en} · (뒷모습)` : w.en;
    ci.getAnimations().forEach(a => a.cancel());
    A(ci, [{ translate: '110% 0', opacity: 1 }, { translate: '0 0', opacity: 1, offset: .1 }, { translate: '-2% 0', opacity: 1, offset: .82 }, { translate: '110% 0', opacity: 1 }], 1400, { e: EZ.lin, fill: 'forwards' });
    A(img, [{ scale: '2.6' }, { scale: '2' }], 400, { e: EZ.slam, delay: 120 });
  },
  dropCut(m) {
    const ci = $('.lv-ci', this.el);
    ci.style.setProperty('--c', '#56619A');
    $('.eyes img', ci).src = 'img/pt/haru_surprise.webp'; $('.eyes img', ci).classList.add('pt');
    ci.classList.add('drop');
    $('b', ci).innerHTML = '……';
    $('em', ci).textContent = 'HARU'; $('small', ci).textContent = '인이어를 누른 채 굳어 있다';
    A(ci, [{ translate: '130% 0', opacity: 1 }, { translate: '0 0', opacity: 1, offset: .08 }, { translate: '0 0', opacity: 1, offset: .9 }, { translate: '0 0', opacity: 0 }], 2600, { e: EZ.lin, fill: 'forwards' })
      .finished.then(() => { ci.classList.remove('drop'); $('b', ci).innerHTML = 'EYE<br>CONTACT!'; $('small', ci).textContent = '한 마디 · GREAT 이상'; });
    const row = $(`.lv-prow[data-id="${m && m.id}"]`, this.el);
    if (row) { row.classList.add('lost'); $('.st', row).textContent = 'NO SIGNAL'; }
  },
  cameo(who) {
    const c = $('.lv-cameo', this.el);
    const src = { koto: 'img/c/koto_phone.jpg', natsu: 'img/pt/natsu_admire.webp' }[who];
    $('img', c).src = src; c.dataset.who = who;
    $('span', c).textContent = who === 'koto' ? '객석 · 개구리 폰케이스' : '펜스 밖';
    c.getAnimations().forEach(a => a.cancel());
    A(c, [{ opacity: 0, scale: '.6' }, { opacity: 1, scale: '1', offset: .12 }, { opacity: 1, scale: '1', offset: .8 }, { opacity: 0, scale: '1.1' }], 1800, { e: EZ.lin, fill: 'forwards' });
  },

  /* ---------- the 47 seconds ---------- */
  blackout(d) {
    const el = this.el, bo = $('.lv-bo', el);
    el.classList.add('bo');
    bo.hidden = false; $('.bo-prompt', bo).hidden = true; $('.bo-err', bo).hidden = true;
    $('.lv-combo', el).style.opacity = 0; $('.jt', el).textContent = '';
    $$('.lv-prow', el).forEach(r => { if (!r.classList.contains('you')) { r.classList.add('lost'); const s = $('.st', r); if (s) s.textContent = 'NO SIGNAL'; } });
    A(el, [{ filter: 'brightness(3) blur(2px)' }, { filter: 'brightness(1) blur(0)' }], 500);
    const L = this.L, timer = $('.bo-timer', bo), t0 = d.dur;
    const tick = () => {
      if (this.L !== L || G.cur !== 'live') return;
      const e = Math.max(0, Math.min(t0, L.time - L.bo.t0));
      const s = Math.floor(e);
      timer.textContent = `00:${String(s).padStart(2, '0')}`;
      if (L.bo.stage !== 'end') requestAnimationFrame(tick);
      else timer.textContent = `00:${String(Math.round(t0)).padStart(2, '0')}`;
    };
    tick();
  },

  /* ---------- keyboard (raw, for timing) ---------- */
  key2(e, down) {
    if (G.cur !== 'live' || !this.L) return;
    if (this.menu) {
      if (down) this.menu(e);
      else { const l = LANE_CODE[e.code]; if (l !== undefined) { this.R.press(l, false); this.L.release(l, e.timeStamp || performance.now()); } }
      e.preventDefault(); e.stopPropagation(); return;
    }
    const L = this.L;
    if (down && (e.code === 'Escape' || e.code === 'KeyP')) { e.preventDefault(); e.stopPropagation(); if (!L.finished) this.pauseMenu(); return; }
    let lane = LANE_CODE[e.code];
    if (lane === undefined) return;
    e.preventDefault(); e.stopPropagation();
    if (lane === 4 && this.part !== 'DR') return;
    if (e.repeat) return;
    if (down) { this.R.press(lane, true); L.press(lane, e.timeStamp || performance.now()); }
    else { this.R.press(lane, false); L.release(lane, e.timeStamp || performance.now()); }
  },

  /* P3-style list menus drawn over the live (pause / fail) */
  listMenu(root, items, onPick) {
    const spans = $$('span', root);
    let i = 0;
    const paint = () => spans.forEach((s, k) => s.classList.toggle('sel', k === i));
    paint();
    spans.forEach((s, k) => { s.onclick = () => { i = k; paint(); done(); }; s.onmouseenter = () => { i = k; paint(); }; });
    const done = () => { this.menu = null; onPick(i); };
    this.menu = e => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') { i = (i + spans.length - 1) % spans.length; paint(); pop(spans[i]); }
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') { i = (i + 1) % spans.length; paint(); pop(spans[i]); }
      else if (e.code === 'Enter' || e.code === 'KeyZ' || e.code === 'Space') done();
      else if ((e.code === 'Escape' || e.code === 'KeyX') && items.cancel != null) { i = items.cancel; done(); }
    };
  },
  pauseMenu() {
    const L = this.L; L.pause();
    const el = document.createElement('div');
    el.className = 'pause';
    const items = ['계속하기', '처음부터', `노트 속도 ×${SETTINGS.speed.toFixed(1)}`, this.arg.story ? '타이틀로' : 'RHYTHM LAB으로'];
    el.innerHTML = `<div class="ps-dim"></div><div class="ps-title">PAUSE</div><div class="ps-list">${items.map(t => `<span>${t}</span>`).join('')}</div><div class="ps-song">${this.prep.song.title} · ${DIFFS[L.diff]} · ${this.part}</div>`;
    overlayRoot.appendChild(el);
    A($('.ps-dim', el), KF.fade, T.slam); A($('.ps-title', el), KF.fromLeft('-60%'), T.slam);
    stagger($$('.ps-list span', el), KF.fromLeft('-40%'), T.slam, 60);
    const close = () => { el.remove(); };
    const menu = () => this.listMenu(el, Object.assign(items, { cancel: 0 }), n => {
      if (n === 2) { SETTINGS.speed = SETTINGS.speed >= 2 ? .6 : +(SETTINGS.speed + .2).toFixed(1); saveSettings(); $$('.ps-list span', el)[2].textContent = `노트 속도 ×${SETTINGS.speed.toFixed(1)}`; menu(); return; }
      close();
      if (n === 0) this.resumeCount();
      else if (n === 1) { L.stop(); this.restart(); }
      else { L.stop(); this.quit(); }
    });
    menu();
  },
  resumeCount() {
    const c = $('.lv-count', this.el);
    let n = 3;
    const step = () => {
      if (n === 0) { this.L.resume(); return; }
      c.textContent = n; c.classList.remove('go');
      A(c, [{ scale: '2', opacity: 0 }, { scale: '1', opacity: 1, offset: .3 }, { scale: '.9', opacity: 0 }], 500, { e: EZ.slam, fill: 'forwards' });
      n--; setTimeout(step, 520);
    };
    step();
  },
  restart(o = {}) { const a = { ...this.arg, ...o }; this.L = null; swap('live', a); },
  quit() { this.L = null; if (this.arg.story) { G.stack = []; go('title', { push: false }); } else go('lab', { via: 'sweepBack', push: false }); },
  failMenu() {
    const f = $('.lv-fail', this.el);
    f.hidden = false;
    A($('.fl-dim', f), KF.fade, 600); A($('.fl-word', f), [{ opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.12em' }], 1200, { e: EZ.soft });
    stagger($$('.fl-list span', f), KF.fromLeft('-30%'), T.char, 700, 90);
    setTimeout(() => this.listMenu(f, [0, 1, 2], n => {
      this.L.stop();
      if (n === 0) this.restart();
      else if (n === 1) this.restart({ diff: Math.max(0, (this.arg.diff ?? 1) - 1), heat0: 70 });
      else this.end({ ...this.L.result(), accepted: true });
    }), 900);
  },

  end(r) {
    const L = this.L;
    this.rawKeys = false;
    if (r.blackout) {                            // the 47 seconds end the scene with no result screen
      setTimeout(() => { L.stop(); this.arg.next ? this.arg.next(r) : go('lab', { via: 'fade', push: false }); }, 400);
      return;
    }
    if (r.fc && !r.failed) this.banner(r.ap ? 'ALL PERFECT' : 'FULL COMBO', '', '#FFE14A');
    setTimeout(() => {
      if (this.L !== L) return;
      L.stop();
      if (this.arg.next && this.arg.skipResult) return this.arg.next(r);
      go('result', { via: 'slam', push: false, arg: { r, song: this.prep.song, part: this.part, diff: L.diff, party: L.members, back: this.arg } });
    }, r.fc ? 2200 : 1400);
  },
  key() { return true; },
});

/* ================= RESULT ================= */
/* shapes → big type → data → the band; commands in the main-menu grammar. Red only on the chosen command. */
const RCMD = [['RETRY', '같은 곡을 처음부터 다시'], ['NEXT', '다음으로']];
scene('result', {
  cls: 'rs2', back: false,
  html: `<div class="water"></div><div class="word" aria-hidden="true">RESULT</div>
    <div class="band"></div><div class="st1"></div><div class="st2"></div>
    <div class="jk"></div>
    <div class="hd"><span class="ey">LIVE RESULT</span><b class="tt"></b><div class="mt"><span class="rs-band">SIGNAL LOST</span><span class="rs-part"></span><span class="rs-diff"></span></div></div>
    <div class="rk2"><small>RANK</small><div class="lt"><span class="p1"></span><span class="p2"></span><span class="p0"></span></div></div>
    <div class="badge"></div>
    <div class="panel"><div class="sc-h"><span>SCORE</span><em class="rs-sub"></em></div><div class="sc-v">0</div><div class="jr"></div><div class="rst"></div></div>
    <div class="bd-l">ON STAGE</div>
    <div class="rmbs"></div>
    <div class="rmenu">${RCMD.map(([t]) => `<span>${t}</span>`).join('')}</div>
    <div class="rcmd"><span class="rcmd-t"></span><small>COMMAND · ↑↓ 고르기 · Z 결정</small></div>
    <div class="flash"></div>`,
  init(el) {
    this.Lst = List($$('.rmenu span', el), {
      jolt: $('.rmenu', el), start: 1,
      onChange: n => { const c = $('.rcmd-t', el); c.textContent = RCMD[n][1]; A(c, KF.fromRight('8%'), T.slam); },
      onPick: n => this.pick(n),
    });
  },
  enter(a) {
    a = a || { r: { score: 962410, rank: 'S', counts: [612, 41, 6, 2], maxCombo: 488, sync: 88, heat: 72, cover: { hit: 3, total: 4 }, eyes: { hit: 2, total: 3 }, fast: 20, slow: 27 }, song: SONGS[0], part: 'GT', diff: 1, party: [] };
    this.a = a;
    const el = this.el, r = a.r, q = x => $(x, el), qa = x => $$(x, el);
    const total = r.counts.reduce((x, y) => x + y, 0) || 1;
    el.getAnimations({ subtree: true }).forEach(x => x.cancel());
    q('.jk').style.backgroundImage = `url(${a.song.jk || 'img/jk/47.webp'})`;
    q('.tt').textContent = a.song.title;
    q('.rs-part').textContent = (INST_INFO[a.part] || INST_INFO.GT).en; q('.rs-diff').textContent = DIFFS[a.diff];
    q('.rs-band').textContent = a.back && a.back.party === 'band' ? 'NEW BAND' : 'SIGNAL LOST';
    q('.rs-sub').textContent = r.failed ? '공연 중단' : `${r.counts[0]} PERFECT`;
    const rank = q('.rk2'); rank.dataset.r = r.rank; rank.dataset.l = r.rank.length; rank.classList.remove('shine');
    qa('.lt span').forEach(sp => { sp.textContent = r.rank; });
    const bd = q('.badge'); bd.textContent = r.failed ? 'SILENCE' : r.ap ? 'ALL PERFECT' : r.fc ? 'FULL COMBO' : 'CLEAR'; bd.dataset.k = r.failed ? 'f' : r.ap ? 'ap' : r.fc ? 'fc' : 'c';
    q('.jr').innerHTML = JN.map((k, i) => `<div class="jrow" data-k="${i}"><b>${k}</b><div class="jbar"><i style="--w:${(r.counts[i] / total * 100).toFixed(1)}%"></i></div><span class="n">${r.counts[i]}</span></div>`).join('');
    q('.rst').innerHTML = [['MAX COMBO', r.maxCombo], ['FAST / SLOW', `${r.fast}<small> / </small>${r.slow}`], ['BAND SYNC', `${r.sync}<small>%</small>`], ['COVER', `${r.cover.hit}<small> / ${r.cover.total}</small>`], ['EYE CONTACT', `${r.eyes.hit}<small> / ${r.eyes.total}</small>`], ['CROWD HEAT', r.heat]].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    const face = m => m.icon ? `<img src="${m.icon}" alt="">` : '<i class="sil"></i>';
    q('.rmbs').innerHTML = `<div class="rmb" style="--c:#4FE3FF"><div class="av"><img src="${icon('you')}" alt=""></div><div class="in"><b>${G.name || 'YOU'}</b><small>${a.part} · VO</small></div></div>` +
      (a.party || []).map(m => `<div class="rmb" style="--c:${m.c}"><div class="av">${face(m)}</div><div class="in"><b>${m.en}</b><small>${m.part}</small></div></div>`).join('');
    this.Lst.set(1, true); q('.rcmd-t').textContent = RCMD[1][1];
    // 1. shapes
    A(q('.band'), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], T.wipe, { e: EZ.wipe });
    A(q('.st1'), [{ translate: '-110% 0' }, { translate: '0 0' }], T.slam, { delay: 80 });
    A(q('.st2'), [{ translate: '110% 0' }, { translate: '0 0' }], T.slam, { delay: 140 });
    A(q('.word'), [{ translate: '30% 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], 900, { delay: 120, e: EZ.soft });
    // 2. big type
    A(q('.jk'), [{ translate: '-60px -40px', rotate: '-22deg', opacity: 0 }, { translate: '0 0', rotate: '-5deg', opacity: 1 }], 520, { delay: 200, e: EZ.pop });
    A(q('.hd .ey'), KF.fromLeft('-30px'), T.slam, { delay: 260 });
    A(q('.hd .tt'), [{ clipPath: 'inset(0 100% 0 0)', translate: '-20px 0' }, { clipPath: 'inset(0 0 0 0)', translate: '0 0' }], T.wipe, { delay: 300 });
    stagger(qa('.hd .mt span'), KF.fromBottom('12px'), T.slam, 420);
    // 3. data
    A(q('.panel'), KF.fromRight('80px'), T.wipe, { delay: 380 });
    later(() => countUp(q('.sc-v'), r.score, 900), 520);
    qa('.jrow').forEach((row, i) => {
      A(row, KF.fromRight('40px'), T.slam, { delay: 620 + i * 60 });
      A($('.jbar i', row), KF.scaleX, 620, { delay: 700 + i * 60 });
    });
    stagger(qa('.rst div'), KF.fromBottom('14px'), T.slam, 900);
    // the rank lands: plates slide in, the letter stamps, the stage flashes and jolts
    const RK = 1500;
    A(q('.rk2 small'), KF.fade, 200, { delay: RK - 150 });
    A(q('.lt .p1'), [{ translate: '-140px -10px', opacity: 0 }, { translate: '-14px -10px', opacity: 1 }], T.slam, { delay: RK });
    A(q('.lt .p2'), [{ translate: '160px 14px', opacity: 0 }, { translate: '18px 14px', opacity: 1 }], T.slam, { delay: RK + 60 });
    A(q('.lt .p0'), [{ scale: '2.4', opacity: 0, filter: 'blur(6px)' }, { scale: '.94', opacity: 1, filter: 'blur(0)', offset: .7 }, { scale: '1', opacity: 1, filter: 'blur(0)' }], 360, { delay: RK + 140 });
    A(q('.flash'), [{ opacity: 0 }, { opacity: r.failed ? .12 : .45, offset: .15 }, { opacity: 0 }], T.wipe, { delay: RK + 360, e: EZ.lin });
    A(q('.s') || el.firstElementChild, [{ translate: '0 0' }, { translate: '-6px 4px' }, { translate: '5px -3px' }, { translate: '0 0' }], 220, { delay: RK + 360, e: EZ.lin });
    A(bd, [{ scale: '2', opacity: 0, rotate: '-14deg' }, { scale: '1', opacity: 1, rotate: '0deg' }], T.slam, { delay: RK + 620, e: EZ.pop });
    if (!r.failed) later(() => rank.classList.add('shine'), RK + 700);
    // 4. the band, last and slowest; then the commands
    A(q('.bd-l'), KF.fade, T.slam, { delay: RK + 700 });
    stagger(qa('.rmb'), KF.fromBottom('60px'), T.char, RK + 760, 70);
    stagger(qa('.rmenu span'), KF.fromRight('35%'), T.char, RK + 1000, T.step);
    const sel = this.Lst.el;
    A(sel, KF.scaleX, T.pop, { delay: RK + 1300, pe: '::before', e: EZ.pop });
    A(sel, KF.scaleX, T.pop, { delay: RK + 1340, pe: '::after', e: EZ.pop });
    A(q('.rcmd'), KF.fromRight('30%'), T.char, { delay: RK + 1150 });
  },
  pick(n) {
    const a = this.a;
    if (n === 0) return go('live', { via: 'slam', push: false, arg: a.back || {} });
    if (a.back && a.back.next) return a.back.next(a.r);
    go('lab', { via: 'sweepBack', push: false });
  },
  key(k) {
    if (k === 'up' || k === 'left') this.Lst.move(-1);
    else if (k === 'down' || k === 'right') this.Lst.move(1);
    else if (k === 'ok') this.pick(this.Lst.i);
    else if (k === 'back') this.pick(1);
    return true;
  },
});

/* ================= RHYTHM LAB ================= */
const LAB = { song: 0, inst: 0, diff: 1, sc: 0, party: 0, auto: false };
const LAB_SC = [['lab', '일반 (랜덤 흔들림 · 아이 콘택트)'], ['tutorial', '프롤로그 1곡째 · 튜토리얼'], ['incident', '프롤로그 2곡째 · 사건 + 47초']];
scene('lab', {
  cls: 'lab', back: false, via: 'shutter',
  html: `${bgImg('studio_night', 'lab-img')}<div class="lab-tint"></div>${bigWord('LAB', 'lab-word')}
    <div class="lab-head"><b>RHYTHM <em>LAB</em></b><small>리듬 엔진 테스트 · 스템을 올리면 자동으로 채보합니다</small></div>
    <div class="lab-songs"></div>
    <div class="lab-drop"><input type="file" multiple accept="audio/*" hidden><b>＋ 스템 파일 올리기</b><small>guitar · bass · drums · keys (+ vocals, lead) — 파일 이름으로 자동 분류 · 여기로 끌어다 놓아도 됩니다</small></div>
    <div class="lab-opts"></div>
    <div class="lab-info"><div class="li-h">ANALYSIS</div><div class="li-body">곡을 고르면 분석합니다</div><canvas class="li-graph" width="520" height="120"></canvas></div>
    <div class="lab-play" data-tap="ok"><span class="unskew">PLAY ▶</span></div>
    ${hint([['A', '결정'], ['↕', '항목'], ['↔', '값 바꾸기'], ['B', '타이틀']], 'RHYTHM LAB')}`,
  init(el) {
    const inp = $('input', el);
    $('.lab-drop', el).addEventListener('click', () => inp.click());
    inp.addEventListener('change', () => this.addFiles([...inp.files]));
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag'); });
    el.addEventListener('dragleave', () => el.classList.remove('drag'));
    el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('drag'); this.addFiles([...e.dataTransfer.files].filter(f => /audio|\.(mp3|wav|m4a|ogg|flac)$/i.test(f.type + f.name))); });
    this.row = 0;
    savedCustom().then(s => { if (s && !SONGS.some(x => x.custom)) { SONGS.push(s); if (G.cur === 'lab') this.paint(); } });
  },
  async addFiles(files) {
    if (!files.length) return;
    toast('스템 읽는 중…');
    const s = await customSong(files);
    const i = SONGS.findIndex(x => x.custom);
    if (i >= 0) SONGS.splice(i, 1, s); else SONGS.push(s);
    LAB.song = SONGS.indexOf(s);
    this.paint(); this.analyze();
  },
  rows() {
    return [
      ['곡', SONGS.map(s => s.title), 'song'],
      ['악기', ['GT', 'BA', 'DR', 'KEY'].map(k => `${INST_INFO[k].en}<small>${INST_INFO[k].th}</small>`), 'inst'],
      ['난이도', DIFFS, 'diff'],
      ['시나리오', LAB_SC.map(x => x[1]), 'sc'],
      ['파티', ['SIGNAL LOST (1년 전)', '새 밴드'], 'party'],
      ['노트 속도', [`×${SETTINGS.speed.toFixed(1)}`], 'speed'],
      ['판정 오프셋', [`${SETTINGS.offset > 0 ? '+' : ''}${SETTINGS.offset} ms`], 'offset'],
      ['내 악기 볼륨', [SETTINGS.partDb ? `원곡 +${SETTINGS.partDb}dB` : '원곡 그대로'], 'partdb'],
      ['노페일', [SETTINGS.noFail ? 'ON' : 'OFF'], 'nofail'],
      ['오토플레이', [LAB.auto ? 'ON (구경)' : 'OFF'], 'auto'],
    ];
  },
  paint() {
    const el = this.el, rows = this.rows();
    $('.lab-songs', el).innerHTML = SONGS.map((s, i) => `<div class="ls-row${i === LAB.song ? ' on' : ''}" data-i="${i}"><div class="ls-jk" style="background-image:url(${s.jk || 'img/jk/47.webp'})"></div><div><b>${s.title}</b><small>${s.sub}</small></div></div>`).join('');
    $$('.ls-row', el).forEach(r => r.addEventListener('click', () => { LAB.song = +r.dataset.i; this.paint(); this.analyze(); }));
    $('.lab-opts', el).innerHTML = rows.map(([k, vals, id], i) => {
      const cur = { song: LAB.song, inst: LAB.inst, diff: LAB.diff, sc: LAB.sc, party: LAB.party }[id] ?? 0;
      return `<div class="lo-row${i === this.row ? ' sel' : ''}" data-r="${i}"><span class="lo-k">${k}</span><span class="lo-v"><i data-d="-1">◀</i><b>${vals[cur] ?? vals[0]}</b><i data-d="1">▶</i></span></div>`;
    }).join('');
    $$('.lo-row', el).forEach(r => {
      r.addEventListener('mouseenter', () => { this.row = +r.dataset.r; $$('.lo-row', el).forEach(x => x.classList.toggle('sel', x === r)); });
      $$('i', r).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); this.row = +r.dataset.r; this.change(+b.dataset.d); }));
    });
    $('.lab-play', el).classList.toggle('sel', this.row === rows.length);
  },
  change(d) {
    const id = this.rows()[this.row][2];
    const wrap = (v, n) => (v + d + n) % n;
    if (id === 'song') { LAB.song = wrap(LAB.song, SONGS.length); this.analyze(); }
    else if (id === 'inst') { LAB.inst = wrap(LAB.inst, 4); this.info(); }
    else if (id === 'diff') { LAB.diff = wrap(LAB.diff, 4); this.info(); }
    else if (id === 'sc') LAB.sc = wrap(LAB.sc, 3);
    else if (id === 'party') LAB.party = wrap(LAB.party, 2);
    else if (id === 'speed') { SETTINGS.speed = Math.max(.6, Math.min(2, +(SETTINGS.speed + d * .1).toFixed(1))); saveSettings(); }
    else if (id === 'offset') { SETTINGS.offset = Math.max(-200, Math.min(200, SETTINGS.offset + d * 5)); saveSettings(); }
    else if (id === 'partdb') { const v = [0, 3, 6], i = v.indexOf(SETTINGS.partDb ?? 3); SETTINGS.partDb = v[(i + d + 3) % 3]; saveSettings(); }
    else if (id === 'nofail') { SETTINGS.noFail = !SETTINGS.noFail; saveSettings(); }
    else if (id === 'auto') LAB.auto = !LAB.auto;
    this.paint();
    pop($('.lo-row.sel b', this.el));
  },
  async analyze() {
    const el = this.el, song = SONGS[LAB.song], body = $('.li-body', el);
    body.innerHTML = '<span class="li-busy">분석 중…</span>';
    try { await prepareSong(song, st => { if (SONGS[LAB.song] === song) body.innerHTML = `<span class="li-busy">${st}…</span>`; }); }
    catch (e) { body.textContent = '실패: ' + e.message; return; }
    if (SONGS[LAB.song] === song) this.info();
  },
  info() {
    const el = this.el, p = PREP[SONGS[LAB.song].id];
    if (!p) return;
    const part = ['GT', 'BA', 'DR', 'KEY'][LAB.inst], ch = p.charts[part];
    const stems = Object.keys(p.bufs).map(r => `<i>${ROLE_KO[r] || r}</i>`).join('');
    const cnt = ch ? ch.map((c, d) => `<span class="${d === LAB.diff ? 'on' : ''}">${DIFFS[d]} <b>${c.length}</b></span>`).join('') : '<span>이 악기 스템 없음</span>';
    const ex = p.charts.EX ? p.charts.EX[LAB.diff] : [];
    const exBy = {}; for (const n of ex) exBy[n.role] = (exBy[n.role] || 0) + 1;
    const exLine = ex.length ? `<div class="li-ex">공용 노트 후보 ${Object.entries(exBy).map(([r, c]) => `<i style="color:${ROLE_C[r]}">◆ ${ROLE_KO[r]} ${c}</i>`).join(' ')}</div>` : '';
    const body = $('.li-body', el);
    body.innerHTML = `<div class="li-kv"><span>BPM</span><b>${p.tm.bpm}</b><span>첫 박</span><b>${p.tm.offset.toFixed(3)}s</b><span>길이</span><b>${Math.floor(p.dur / 60)}:${String(Math.floor(p.dur % 60)).padStart(2, '0')}</b></div><div class="li-stems">${stems}</div><div class="li-cnt">${cnt}</div>${exLine}`;
    // density graph of the chosen chart
    const g = $('.li-graph', el), c = g.getContext('2d');
    c.clearRect(0, 0, g.width, g.height);
    const notes = ch ? ch[LAB.diff] : [];
    const bins = new Array(104).fill(0);
    for (const n of notes) bins[Math.min(103, Math.floor(n.t / p.dur * 104))]++;
    const mx = Math.max(1, ...bins);
    bins.forEach((v, i) => { const h = v / mx * 100; c.fillStyle = v / mx > .75 ? '#FF4FA0' : '#D7FF3A'; c.fillRect(i * 5, 110 - h, 4, h); });
    c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(0, 110, 520, 1);
  },
  enter() {
    const el = this.el;
    this.row = Math.min(this.row, 9);
    this.paint();
    this.analyze();
    A($('.lab-img', el), KF.fade, 700);
    A($('.lab-word', el), KF.fromRight('20%'), 900, { e: EZ.soft });
    A($('.lab-head', el), KF.fromLeft(), T.char);
    stagger($$('.ls-row', el), KF.fromLeft('-30%'), T.char, 150, 60);
    stagger($$('.lo-row', el), KF.fromRight('20%'), T.slam, 200, 35);
    A($('.lab-info', el), KF.fromBottom('20%'), T.char, { delay: 300 });
    A($('.lab-play', el), KF.popIn, T.pop, { delay: 500, e: EZ.pop });
  },
  play() {
    const part = ['GT', 'BA', 'DR', 'KEY'][LAB.inst];
    G.inst = part; G.diff = LAB.diff;
    go('live', { via: 'slam', arg: { song: SONGS[LAB.song], part, diff: LAB.diff, scenario: LAB_SC[LAB.sc][0], party: LAB.party ? 'band' : 'signal', auto: LAB.auto } });
  },
  key(k) {
    const n = this.rows().length;
    if (k === 'up') { this.row = (this.row + n) % (n + 1); this.paint(); }
    else if (k === 'down') { this.row = (this.row + 1) % (n + 1); this.paint(); }
    else if (k === 'left' || k === 'l1') { if (this.row < n) this.change(-1); }
    else if (k === 'right' || k === 'r1') { if (this.row < n) this.change(1); }
    else if (k === 'ok') { if (this.row === n) this.play(); else if (this.row === 0) { this.row = n; this.paint(); } else this.change(1); }
    else if (k === 'back') go('title', { via: 'sweepBack', push: false });
    return true;
  },
});
