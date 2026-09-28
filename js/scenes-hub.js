/* RE:AMP! — hub: main menu, band setup (stage plot), member detail. Ported from the UI prototype v0.7. */
'use strict';
const MEMBERS = [
  { id: 'rui', name: '아마네 루이', en: 'RUI', part: 'VO', partName: 'VOCAL', sub: '코러스', c: 'var(--c-rui)', hp: 80, mt: 62, lv: 2, face: 'rui_mask', face2: 'rui_smile', age: 19,
    hook: '가면을 쓰고 노래하는 방출된 전 아이돌 연습생.', like: '새벽 3시의 DM, 탄산수', hate: '평가, 칭찬(을 받는 척)', line: '…딱히 너 들으라고 부른 거 아니거든.' },
  { id: 'natsu', name: '이부키 나츠', en: 'NATSU', part: 'GT', partName: 'GUITAR', sub: '세컨드 기타', c: 'var(--c-natsu)', hp: 95, mt: 90, lv: 1, face: 'natsu_grin', face2: 'natsu_face', age: 16,
    hook: '주인공을 동경하는 고1 후배. 텐션 폭주, 실력은 초보.', like: '선배, 스티커, 편의점 신상', hate: '기다리는 것', line: '선배! 오늘 코드 세 개나 외웠어요!' },
  { id: 'koto', name: '히나타 코토', en: 'KOTO', part: 'BA', partName: 'BASS', sub: '신스', c: 'var(--c-koto)', hp: 34, mt: 58, lv: 3, face: 'koto_neutral', face2: 'koto_phone', age: 17,
    hook: '방에서 나오지 않는 천재 보카로P. 대화는 SNS로만.', like: '개구리, 밤, 직캠 원본', hate: '전화, 햇빛', line: '(DM) …보고 있어요. 계속.' },
  { id: 'ren', name: '쿠로사키 렌', en: 'REN', part: 'DR', partName: 'DRUMS', sub: '퍼커션', c: 'var(--c-ren)', hp: 70, mt: 22, lv: 1, face: 'ren_smile', face2: 'ren_drum', age: 21,
    hook: '키 186cm, 험악한 인상의 라멘집 알바생. 실제로는 다정하다.', like: '차슈, BPM, 새벽 시장', hate: '가게 빚 이야기', line: '…너랑 있으면 심박이 140이야. 템포 얘기다.' },
  { id: 'rei', name: '시라유키 레이', en: 'REI', part: 'KEY', partName: 'KEYS', sub: '코러스', c: 'var(--c-rei)', hp: 66, mt: 84, lv: 1, face: 'rei_smirk', face2: 'rei_smirk', age: 20,
    hook: '음대를 자퇴한 재벌가 딸. 완벽주의자에 독설가.', like: '정확한 템포, 홍차', hate: '크레딧 없는 편곡', line: '틀린 음이 세 개. 다음엔 두 개로.' },
];
const hearts = lv => '♥'.repeat(lv) + '♡'.repeat(5 - lv);
const STAGES = ['', '밴드 동료', '친구', '신경 쓰이는 사이', '특별한 사람', '듀엣'];

/* ---------------- MAIN MENU ----------------
   What this build can reach: TODAY replays the prologue, PRACTICE is the Rhythm Lab, BAND is the stage plot.
   The other entries stay on the menu so it reads whole, and say they're on the way. */
const MENU_BASE = [
  { t: 'TODAY', h: '', go: 'today', fs: 2.9, ml: .4 },
  { t: 'PRACTICE', h: '리듬 랩 · 곡·악기·난이도를 골라 자유 연습', go: 'lab', fs: 2.5, ml: .9 },
  { t: 'BAND', h: '멤버 · 컨디션 · 무대 배치', go: 'band', fs: 2.8, ml: .3 },
  { t: 'PULSE', h: 'SNS · DM — 준비 중', lock: true, fs: 3.2, ml: .1 },
  { t: 'FILE', h: '47초 파일 · 진실 조각 — 준비 중', lock: true, fs: 2.6, ml: 1.2 },
  { t: 'SHOP', h: '의상 · 악기 스킨 — 준비 중', lock: true, fs: 2.4, ml: .6 },
  { t: 'ALBUM', h: 'CG · 컷신 · 엔딩 — 준비 중', lock: true, fs: 2.6, ml: 1.0 },
  { t: 'SYSTEM', h: '설정 — 준비 중 · 노트 속도와 판정 오프셋은 리듬 랩에서', lock: true, fs: 2.6, ml: .4 },
];
scene('menu', {
  title: '메인 메뉴', cls: 'mm pm-menu', back: false, via: 'ink',
  html: `<div class="vword" aria-hidden="true">RE:AMP!</div>
    <div class="hero-img" data-asset="A25"><img alt=""></div>
    <i class="shard" style="left:30%;top:18%;width:3%;height:5%"></i>
    <i class="shard" style="left:36%;top:72%;width:2%;height:4%;background:var(--lime)"></i>
    <i class="shard" style="left:12%;top:80%;width:2.5%;height:4%"></i>
    <div class="wallet"><span class="wl-n"></span><small>current wallet</small></div>
    ${dateChip()}
    <div class="menu">${MENU_BASE.map(m => `<span class="${m.lock ? 'lock' : ''}" style="font-size:${m.fs}em;margin-left:${m.ml}em"><i class="mt">${m.t}</i></span>`).join('')}</div>
    <div class="party" data-asset="A10"></div>
    <div class="cmd"><span class="cmd-t"></span><small>COMMAND</small></div>
    <div class="keys2"><span data-tap="ok"><i>Z</i>결정</span><span data-tap="back"><i>X</i>타이틀</span></div>`,
  init(el) {
    const spans = $$('.menu span', el);
    this.L = List(spans, {
      jolt: $('.menu', el),
      onChange: (n, s) => {
        spans.forEach((x, i) => { x.style.fontSize = MENU_BASE[i].fs + 'em'; });
        s.style.fontSize = MENU_BASE[n].fs + 2.2 + 'em';
        const c = $('.cmd-t', el);
        c.textContent = MENU_BASE[n].h;
        A(c, KF.fromRight('8%'), T.slam);
      },
      onPick: () => this.key('ok'),
      start: 0,
    });
  },
  enter() {
    const el = this.el, g = SAVE.game;
    G.stack = [];
    MENU_BASE[0].h = todayLabel();
    $('.cmd-t', el).textContent = MENU_BASE[this.L.i].h;
    $('.wl-n', el).textContent = `¥${(g ? g.money : 0).toLocaleString('en-US')}`;
    const dc = $('.datechip', el); if (dc) { const t = document.createElement('div'); t.innerHTML = weekChip(); dc.replaceWith(t.firstElementChild); }
    // the party is who's actually with you: for now, just you
    const team = [{ face: 'you', c: '#4FE3FF', hp: g ? g.hp : 80, mt: g ? g.mt : 40 }, ...(g ? g.joined : []).map(id => ({ ...MEMBERS.find(m => m.id === id), hp: 70, mt: 60 }))];
    $('.party', el).innerHTML = team.map(m => `<div class="pm" style="--c:${m.c}"><img src="${icon(m.face)}" alt=""><div class="bars"><i><b style="width:${m.hp}%"></b></i><i class="m"><b style="width:${m.mt}%"></b></i></div></div>`).join('');
    $('.hero-img img', el).src = `img/ill/fall_${G.gender === 'f' ? 'f' : 'm'}.webp`;
    A($('.hero-img', el), [{ translate: '0 -30%', opacity: 0 }, { translate: '0 0', opacity: 1 }], T.char * 1.3, { delay: 150 });
    A($('.vword', el), KF.fromTop('-20%'), T.char, { delay: 150 });
    const spans = $$('.menu span', el);
    spans.forEach((s, i) => A(s, KF.fromLeft('-35%'), T.char, { delay: 450 + i * T.step }));
    const sel = this.L.el;
    A(sel, KF.scaleX, T.pop, { delay: 1000, pe: '::before', e: EZ.pop });
    A(sel, KF.scaleX, T.pop, { delay: 1040, pe: '::after', e: EZ.pop });
    stagger($$('.pm', el), KF.fromRight('60%'), T.char, 400, 80);
    A($('.wallet', el), KF.fromTop('-100%'), T.char, { delay: 300 });
    A($('.datechip', el), KF.fromTop('-100%'), T.char, { delay: 360 });
    A($('.cmd', el), KF.fromRight('30%'), T.char, { delay: 700 });
    if (!G.seenMenuTip) {
      G.seenMenuTip = true;
      later(() => tutorial({ title: '메인 메뉴', body: '↑↓ 또는 마우스 휠로 고르고 <b>Z/Enter</b>나 클릭으로 들어갑니다. <b>X/Esc</b>는 뒤로.<br><b>TODAY</b>로 이야기와 이번 주를 이어가요. <b>PRACTICE</b>(리듬 랩)와 <b>BAND</b>는 시간을 쓰지 않아요.', asset: 'A20' }), 1600);
    }
  },
  key(k) {
    if (k === 'up') this.L.move(-1);
    else if (k === 'down') this.L.move(1);
    else if (k === 'ok') {
      const m = MENU_BASE[this.L.i];
      if (m.lock) { shake(this.L.el); toast('아직 준비 중이에요'); }
      else if (m.go === 'today') {
        if (SAVE.progress && SAVE.progress.story === 'year' && !SAVE.progress.done) Story.start('year', SAVE.progress.step);
        else if (SAVE.game) W.resume();
        else if (SAVE.progress && SAVE.progress.done) Story.start('year');
        else Story.start('prologue', SAVE.progress ? SAVE.progress.step : 0);
      }
      else go(m.go, { arg: m.arg });
    } else if (k === 'y') toast('PULSE는 아직 준비 중이에요');
    else if (k === 'back') confirmBox('타이틀로 돌아갈까요?', '진행 상황은 자동으로 저장되어 있어요.', () => { G.stack = []; go('title', { via: 'iris', push: false }); });
    return true;
  },
});

/* ---------------- BAND · STAGE PLOT (v0.7) ----------------
   A top-down stage plot like the sheet a band sends to the venue: everyone's spot, the riser, amps, wedges,
   and the input list. Pick a spot, the member stands big on the right in their colour. Q/E moves you to
   another part and the band re-arranges itself on the plot. */
const SLOT = {           // x %, y % on the plot
  VO: [50, 74], GT: [24, 64], BA: [76, 64], DR: [55, 28], KEY: [84, 36], SUB: [10, 30],
};
const PARTS = [['GT', 'GUITAR', '기타'], ['BA', 'BASS', '베이스'], ['DR', 'DRUMS', '드럼'], ['KEY', 'KEYS', '키보드']];
const KANJI = { rui: ['天音', '天音 ルイ · AMANE RUI'], natsu: ['夏', '伊吹 夏 · IBUKI NATSU'], koto: ['琴', '日向 琴 · HINATA KOTO'], ren: ['蓮', '黒崎 蓮 · KUROSAKI REN'], rei: ['玲', '白雪 玲 · SHIRAYUKI REI'], haru: ['春', '月島 春 · TSUKISHIMA HARU'] };
const CH_ORDER = ['VO', 'GT', 'BA', 'DR', 'KEY', 'SUB'];
const WARM_ART = [];
function warmArt() {
  if (WARM_ART.length) return;
  const srcs = ['m', 'f'].flatMap(g => ['', 'ba_', 'dr_', 'key_'].map(p => `img/ill/you_${p}${g}.webp`))
    .concat(MEMBERS.map(m => `img/ill/${m.id}.webp`), MEMBERS.map(m => icon(m.id)), ['img/icon/you_m.webp', 'img/icon/you_f.webp']);
  for (const src of srcs) { const im = new Image(); im.src = src; im.decode && im.decode().catch(() => {}); WARM_ART.push(im); }
}
/* set an <img> only once the new picture is decoded; the old one stays until then instead of a blank or a stale frame */
function swapArt(img, src, after) {
  if (img.getAttribute('src') === src) return;
  img.dataset.want = src;
  const n = new Image(); n.src = src;
  (n.decode ? n.decode() : Promise.resolve()).catch(() => {}).then(() => { if (img.dataset.want !== src) return; img.src = src; after && after(); });
}
if (document.readyState === 'complete') warmArt(); else window.addEventListener('load', warmArt);
scene('band', {
  title: '밴드 셋업 (무대 배치)', cls: 'bd2', wheel: 'x', via: 'curtain',
  html: `<div class="b2-water"></div><div class="b2-word" aria-hidden="true">STAGE PLOT</div>
    <div class="b2-head"><b>BAND SETUP</b><small class="b2-sub">NO SIGNAL · 6인 편성</small></div>
    <div class="b2-cut"><div class="b2-slab"></div><div class="b2-kj" aria-hidden="true"></div><img class="b2-img" alt="" data-asset="A11"></div>
    <div class="b2-plot">
      <div class="b2-floor"></div>
      <div class="b2-prop b2-riser">DRUM RISER</div>
      <div class="b2-prop b2-side">SIDE · SUB</div>
      <div class="b2-prop b2-amp" style="left:15%;top:40%">AMP</div>
      <div class="b2-prop b2-amp" style="left:76%;top:46%">AMP</div>
      <div class="b2-prop b2-wedge" style="left:21%;top:86%"></div>
      <div class="b2-prop b2-wedge" style="left:46%;top:88%"></div>
      <div class="b2-prop b2-wedge" style="left:72%;top:86%"></div>
      <div class="b2-front"></div><div class="b2-aud">▼ AUDIENCE ▼</div>
      <div class="pm2 you" data-id="you" data-asset="A10"><span class="glow"></span><span class="ring"><img alt=""></span><span class="tag"><span class="pt"></span><small></small></span></div>
      ${MEMBERS.map(m => `<div class="pm2" data-id="${m.id}" style="--c:${m.c}" data-asset="A10"><span class="glow"></span><span class="ring"><img src="${icon(m.id)}" alt=""></span><span class="tag"><span class="pt"></span><small>${m.en}</small></span>${m.mt < 30 ? '<span class="warn">RUSH 위험</span>' : ''}</div>`).join('')}
      <div class="b2-list"></div>
      <div class="b2-mine"><small>내 파트</small><span class="arw" data-tap="l1">◀ Q</span><b class="b2-pv"></b><span class="arw" data-tap="r1">E ▶</span></div>
      <div class="b2-form" data-tap="y"><i>Y</i><span class="b2-ft">결성!</span></div>
    </div>
    <div class="b2-info">
      <span class="b2-part"></span><b class="b2-name"></b>
      <div class="b2-bond"><span class="lv"></span><span class="ht"></span><span class="st"></span></div>
      <div class="b2-bars"><span>체력</span><i><b class="hp"></b></i><em class="hpv"></em><span>멘탈</span><i><b class="mt"></b></i><em class="mtv"></em></div>
      <p class="b2-line"></p>
      <span class="b2-go" data-tap="ok">Z 멤버 상세 ▶</span>
    </div>
    ${backChip()}
    ${hint([['←→', '멤버'], ['A', '상세'], ['L', '내 파트'], ['R', '내 파트'], ['Y', '결성']], 'STAGE PLOT')}`,
  init(el) {
    this.pms = $$('.pm2', el);
    this.pms.forEach(p => p.addEventListener('click', e => {
      e.stopPropagation();
      if (p.classList.contains('vacant')) return toast('아직 비어 있는 자리예요');
      const n = this.order().indexOf(p);
      if (n === this.sel) this.key('ok'); else this.select(n);
    }));
  },
  slotOf(id) {
    if (id === 'you') return G.inst;
    const m = MEMBERS.find(x => x.id === id);
    return m.part === G.inst ? 'SUB' : m.part;
  },
  joined(id) { return id === 'you' || !!(SAVE.game && SAVE.game.joined.includes(id)); },
  /* only people who are actually in the band can be picked; empty seats stay on the plot as "?" */
  order() { return [...this.pms].filter(p => this.joined(p.dataset.id)).sort((a, b) => CH_ORDER.indexOf(this.slotOf(a.dataset.id)) - CH_ORDER.indexOf(this.slotOf(b.dataset.id))); },
  place(anim) {
    const el = this.el;
    this.pms.forEach(p => {
      const id = p.dataset.id, slot = this.slotOf(id), [x, y] = SLOT[slot], m = MEMBERS.find(q => q.id === id);
      const vacant = !this.joined(id);
      p.style.left = x + '%'; p.style.top = y + '%';
      p.classList.toggle('sub', slot === 'SUB');
      p.classList.toggle('vacant', vacant);
      p.hidden = vacant && slot === 'SUB';                      // your part is yours; no empty seat beside you
      $('.pt', p).textContent = vacant ? slot : slot === 'SUB' ? `SUB · ${m.sub}` : slot;
      if (m) $('small', p).textContent = vacant ? '모집 중' : m.en;
    });
    const you = $('.pm2.you', el);
    $('img', you).src = icon('you'); $('small', you).textContent = G.name;
    $('.b2-pv', el).textContent = PARTS.find(q => q[0] === G.inst)[1];
    $('.b2-list', el).innerHTML = this.order().map((p, i) => {
      const id = p.dataset.id, slot = this.slotOf(id), m = MEMBERS.find(q => q.id === id);
      return `<span style="--c:${id === 'you' ? '#fff' : m.c}">CH ${String(i + 1).padStart(2, '0')} · ${slot === 'SUB' ? 'SUB' : slot}<b>${id === 'you' ? G.name : m.en}</b></span>`;
    }).join('');
    if (anim) { pop($('.b2-pv', el)); stagger($$('.b2-list span', el), KF.fromBottom('30%'), T.slam, 0, 30); }
  },
  select(n, silent) {
    const order = this.order();
    this.sel = (n + order.length) % order.length;
    const p = order[this.sel], id = p.dataset.id, el = this.el;
    this.pms.forEach(q => q.classList.toggle('sel', q === p));
    const cut = $('.b2-cut', el), info = $('.b2-info', el), img = $('.b2-img', el);
    let c, src, kj;
    if (id === 'you') {
      c = '#4FE3FF'; src = youImg(); kj = G.name;
      img.classList.toggle('need', !hasYouArt());
      $('.b2-part', info).textContent = `LEADER · ${PARTS.find(q => q[0] === G.inst)[1]}`;
      $('.b2-name', info).textContent = G.name;
      const g = SAVE.game || { hp: 80, mt: 40, stage: 5, tech: 30 };
      $('.lv', info).textContent = `무대감 ${g.stage}`; $('.ht', info).textContent = ''; $('.st', info).textContent = `테크닉 ${g.tech}`;
      $('.hp', info).style.width = g.hp + '%'; $('.mt', info).style.width = g.mt + '%'; $('.hpv', info).textContent = g.hp; $('.mtv', info).textContent = g.mt;
      $('.mt', info).classList.toggle('lo', g.mt < 30); $('.hp', info).classList.toggle('lo', g.hp < 40);
      $('.b2-line', info).textContent = this.order().length > 1 ? '같이 설 사람이 생겼다. 그게 아직 조금 어색하다.' : '케이블은 다시 감을 수 있게 됐다. 무대는, 아직.';
      $('.b2-go', info).hidden = true;
    } else {
      const m = MEMBERS.find(q => q.id === id), slot = this.slotOf(id);
      c = m.c; src = `img/ill/${m.id}.webp`; kj = KANJI[m.id][0];
      img.classList.remove('need');
      $('.b2-part', info).textContent = slot === 'SUB' ? `${m.partName} → SUB · ${m.sub}` : m.partName;
      $('.b2-name', info).textContent = m.name;
      $('.lv', info).textContent = `LV ${m.lv}`; $('.ht', info).textContent = hearts(m.lv); $('.st', info).textContent = STAGES[m.lv];
      $('.hp', info).style.width = m.hp + '%'; $('.mt', info).style.width = m.mt + '%'; $('.hpv', info).textContent = m.hp; $('.mtv', info).textContent = m.mt;
      $('.mt', info).classList.toggle('lo', m.mt < 30); $('.hp', info).classList.toggle('lo', m.hp < 40);
      $('.b2-line', info).textContent = m.mt < 30 ? '(멘탈 22%) 오늘은 템포가 달릴 것 같아. 전날 쉬게 해 줘.' : m.line;
      $('.b2-go', info).hidden = false;
    }
    cut.style.setProperty('--c', c); info.style.setProperty('--c', c);
    $('.b2-kj', cut).textContent = kj;
    swapArt(img, src, () => { if (!silent) A(img, [{ translate: '8% 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], T.char); });
    if (!silent) {
      A($('.b2-slab', cut), [{ clipPath: 'polygon(100% 0,100% 0,100% 100%,84% 100%)' }, { clipPath: 'polygon(16% 0,100% 0,100% 100%,0 100%)' }], T.slam, { e: EZ.wipe });
      A($('.b2-kj', cut), KF.fromTop('-12%'), T.char, { delay: 60 });
      A(info, [{ translate: '0 12%', opacity: .2 }, { translate: '0 0', opacity: 1 }], T.slam);
      A($('.ring', p), [{ scale: '.8' }, { scale: '1.18' }], T.pop, { e: EZ.pop });
    }
  },
  enter(arg) {
    this.live = !!(arg && arg.live);
    const el = this.el;
    const n = this.pms.filter(p => this.joined(p.dataset.id)).length;
    $('.b2-sub', el).textContent = `${this.live ? '라이브 전 편성' : '무대 배치'} · 멤버 ${n}명${n < 6 ? ` · 빈 자리 ${6 - n}` : ''}`;
    $('.b2-ft', el).textContent = this.live ? '결성! ▶ 곡 선택' : '결성!';
    this.pms.forEach(p => { p.style.transition = 'none'; });
    this.place(false);
    el.offsetWidth; this.pms.forEach(p => { p.style.transition = ''; });
    this.select(this.order().findIndex(p => p.dataset.id === 'you'), true);
    // shapes → big type → the plot's data → the member, last
    A($('.b2-word', el), KF.fromLeft('-20%'), 900, { e: EZ.soft, delay: 100 });
    A($('.b2-head', el), KF.fromLeft('-30%'), T.char, { delay: 150 });
    A($('.b2-floor', el), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], T.wipe, { e: EZ.wipe, delay: 120 });
    stagger($$('.b2-prop, .b2-front', el), KF.fade, T.slam, 380, 40);
    A($('.b2-aud', el), KF.fromBottom('100%'), T.slam, { delay: 520 });
    this.pms.filter(p => !p.hidden).forEach((p, i) => A(p, [{ scale: '.3', opacity: 0 }, { scale: '1', opacity: 1 }], T.pop * 1.3, { delay: 560 + i * 70, e: EZ.pop }));
    stagger($$('.b2-list span', el), KF.fromBottom('40%'), T.slam, 800, 50);
    A($('.b2-slab', el), [{ clipPath: 'polygon(100% 0,100% 0,100% 100%,84% 100%)' }, { clipPath: 'polygon(16% 0,100% 0,100% 100%,0 100%)' }], T.wipe, { e: EZ.wipe, delay: 300 });
    A($('.b2-kj', el), KF.fromTop('-20%'), T.char, { delay: 600 });
    A($('.b2-img', el), [{ translate: '12% 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], T.char * 1.3, { delay: 900 });
    A($('.b2-info', el), KF.fromBottom('20%'), T.char, { delay: 1100 });
    A($('.b2-mine', el), KF.fromLeft('-30%'), T.char, { delay: 1000 });
    A($('.b2-form', el), KF.popIn, T.pop * 1.4, { delay: 1250, e: EZ.pop });
  },
  key(k) {
    if (k === 'left' || k === 'up') this.select(this.sel - 1);
    else if (k === 'right' || k === 'down') this.select(this.sel + 1);
    else if (k === 'l1' || k === 'r1') {
      const cur = this.order()[this.sel].dataset.id;
      const n = PARTS.findIndex(q => q[0] === G.inst);
      G.inst = PARTS[(n + (k === 'l1' ? -1 : 1) + PARTS.length) % PARTS.length][0];
      this.place(true);
      this.select(this.order().findIndex(p => p.dataset.id === cur), false);
    } else if (k === 'ok') {
      const id = this.order()[this.sel].dataset.id;
      if (id === 'you') toast('내 파트는 Q / E로 바꾸고, Y로 저장해요');
      else go('member', { arg: MEMBERS.findIndex(m => m.id === id), via: 'slam' });
    } else if (k === 'y') {
      pop($('.b2-form', this.el));
      if (this.live) later(() => go('setlist', { arg: { live: true } }), 250);
      else {
        if (SAVE.profile) { SAVE.profile.inst = G.inst; writeSave(); }      // your part carries into TODAY and the save
        saving(); toast(`${this.order().length > 1 ? '무대 배치를 저장했습니다' : '아직 혼자예요 · 내 파트만 저장했습니다'} · ${PARTS.find(q => q[0] === G.inst)[1]}`);
      }
    } else return undefined;
    return true;
  },
});

/* ---------------- MEMBER DETAIL (stats-screen layering) ---------------- */
const MEV = {
  rui: [['가면 아래', 'clear'], ['새벽 3시의 DM', 'new'], ['맨얼굴의 노래', 'lock']],
  natsu: [['첫 코드', 'clear'], ['강변 둑의 연습', 'lock'], ['그날의 관객석', 'lock']],
  koto: [['개구리의 방', 'clear'], ['직캠 원본', 'new'], ['밖으로', 'lock']],
  ren: [['차슈 서비스', 'clear'], ['가게의 빚', 'lock'], ['마지막 봄', 'lock']],
  rei: [['트리플 S', 'new'], ['빠진 크레딧', 'lock'], ['웃는 얼굴', 'lock']],
};
const MTABS = ['프로필', '이벤트', '한마디'];
scene('member', {
  title: '멤버 상세', cls: 'mb2x',
  html: `<div class="mx-bg"></div><div class="mx-dark"></div>
    <div class="mx-str k1"></div><div class="mx-str w1"></div><div class="mx-str k2"></div>
    <div class="mx-gp"></div>
    <div class="mx-por" data-asset="A11"><img alt=""></div>
    <div class="mx-kj"><small></small><b></b></div>
    <div class="mx-name"><small class="mx-part"></small><b></b><span class="mx-age"></span></div>
    <div class="mx-tag"><i></i><span></span></div>
    <div class="mx-data">
      <div class="mx-bars"><span>체력</span><i><b class="hp"></b></i><span>멘탈</span><i><b class="mt"></b></i></div>
      <div class="mx-hearts"></div>
    </div>
    <div class="mx-lr"><span data-tap="left">◀ L</span><span class="mx-dots"></span><span data-tap="right">R ▶</span></div>
    <div class="mx-tabs">${MTABS.map(t => `<span>${t}</span>`).join('')}</div>
    <div class="mx-body"></div>
    ${backChip()}
    ${hint([['←→', '멤버'], ['L', '탭'], ['R', '탭'], ['B', '뒤로']], 'MEMBER')}`,
  init(el) {
    this.tab = 0;
    this.TL = List($$('.mx-tabs span', el), { onChange: (n, s, silent) => { this.tab = n; if (this.i !== undefined) this.body(!silent); } });
  },
  paint(dir) {
    const el = this.el, m = MEMBERS[this.i];
    el.style.setProperty('--c', m.c);
    $('.mx-por img', el).src = `img/ill/${m.id}.webp`;
    const kj = $('.mx-kj', el); $('b', kj).textContent = KANJI[m.id][0]; $('small', kj).textContent = KANJI[m.id][1]; kj.dataset.n = KANJI[m.id][0].length;
    $('.mx-part', el).textContent = m.partName;
    $('.mx-name b', el).textContent = m.name;
    $('.mx-age', el).textContent = `${m.age}세 · ${m.en}`;
    $('.mx-tag span', el).textContent = STAGES[m.lv];
    $('.mx-data .hp', el).style.width = m.hp + '%';
    $('.mx-data .mt', el).style.width = m.mt + '%';
    $('.mx-data .mt', el).classList.toggle('lo', m.mt < 30);
    $('.mx-hearts', el).textContent = hearts(m.lv);
    $('.mx-dots', el).innerHTML = MEMBERS.map((_, i) => `<i class="${i === this.i ? 'on' : ''}"></i>`).join('');
    this.body(false);
    this.seq(dir ? 0 : 150);
  },
  seq(d0) {
    const el = this.el;
    A($('.mx-dark', el), [{ clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' }, { clipPath: 'polygon(0 0,70% 0,48% 100%,0 100%)' }], T.slam, { delay: d0, e: EZ.wipe });
    stagger($$('.mx-str', el), [{ scale: '0 1' }, { scale: '1 1' }], T.slam, d0 + 100, 70);
    A($('.mx-kj', el), [{ translate: '-30% 0', opacity: 0, scale: '1.15' }, { translate: '0 0', opacity: 1, scale: '1' }], T.char, { delay: d0 + 250 });
    A($('.mx-name', el), KF.fromLeft('-20%'), T.char, { delay: d0 + 380 });
    A($('.mx-data', el), KF.fade, T.char, { delay: d0 + 500 });
    A($('.mx-tag', el), KF.stamp, T.pop * 1.5, { delay: d0 + 620, e: EZ.pop });
    A($('.mx-gp', el), [{ clipPath: 'polygon(30% 0,100% 0,100% 100%,0 100%)', opacity: 1 }, { clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)', opacity: 1 }], T.wipe, { delay: d0 + 650, e: EZ.wipe, fill: 'backwards' });
    A($('.mx-por', el), [{ translate: '6% 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], T.char * 1.3, { delay: d0 + 700 });
    A($('.mx-body', el), KF.fromBottom('20%'), T.char, { delay: d0 + 800 });
  },
  body(anim) {
    const el = this.el, m = MEMBERS[this.i], b = $('.mx-body', el);
    if (this.tab === 0) b.innerHTML = `<p class="mx-hook">${m.hook}</p><dl><dt>좋아하는 것</dt><dd>${m.like}</dd><dt>싫어하는 것</dt><dd>${m.hate}</dd><dt>파트</dt><dd>${m.partName} · 서브 ${m.sub}</dd></dl>`;
    else if (this.tab === 1) b.innerHTML = `<ul class="mx-evs">${MEV[m.id].map(([t, s]) => `<li class="${s}"><span>${t}</span><em>${s === 'clear' ? 'CLEAR' : s === 'new' ? 'NEW!' : 'LOCK'}</em></li>`).join('')}</ul>`;
    else b.innerHTML = `<div class="mx-line"><img src="img/c/${m.face2}.jpg" alt=""><span>${m.line}</span></div>`;
    if (anim) stagger([...b.firstElementChild.children].length ? [...b.firstElementChild.children] : [b.firstElementChild], KF.fromRight('8%'), T.slam, 0, 50);
  },
  enter(arg) {
    this.i = typeof arg === 'number' ? arg : 0;
    this.TL.set(0, true); this.tab = 0;
    this.paint(0);
    A($('.mx-bg', this.el), KF.fade, 600);
    A($('.mx-lr', this.el), KF.fromTop('-100%'), T.char, { delay: 300 });
    stagger($$('.mx-tabs span', this.el), KF.fromLeft('-40%'), T.slam, 700, 60);
  },
  key(k) {
    if (k === 'left') { this.i = (this.i + MEMBERS.length - 1) % MEMBERS.length; this.paint(-1); }
    else if (k === 'right') { this.i = (this.i + 1) % MEMBERS.length; this.paint(1); }
    else if (k === 'l1' || k === 'up') this.TL.move(-1);
    else if (k === 'r1' || k === 'down') this.TL.move(1);
    else return undefined;
    return true;
  },
});
