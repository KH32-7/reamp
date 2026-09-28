/* RE:AMP! — STORY v2: chapters → episodes on a branch map. An episode is a short list of steps (dialogue, live,
   card, custom); clearing it records what happened (rank, choices) and opens the next ones.
   Nodes: { id, c: column, l: lane, type, t, who, day, desc, chg: [what it changes], rw: [rewards],
            from: [any of these cleared] | all: [every one cleared], when: g => this branch is the one taken,
            alt: a branch you may never see (shown as ??? until you do), need: { fans, lives } from LIVE,
            steps, eff (on clear), log: line for the branch record } */
'use strict';

/* conditions for { if: ... } lines, choice needs and branch whens */
const IF = {
  j: id => g => g.joined.includes(id),            // in the band
  m: id => g => !!g.met[id],                       // met
  f: (k, v = true) => g => g.flags[k] === v,       // a flag / a route
  lv: (id, n) => g => W.lv(id) >= n,               // ♥ LV
  rk: (id, n) => g => W.rank(id) >= n,             // rank of an episode's live (D0 C1 B2 A3 S4 SS5)
  last: n => g => W.lastRank() >= n,               // rank of the live just played in this episode
  p: n => (g, p) => p === n,                       // the choice just made
  not: fn => (g, p) => !fn(g, p),
  all: (...fs) => (g, p) => fs.every(f => f(g, p)),
  any: (...fs) => (g, p) => fs.some(f => f(g, p)),
};
/* who you're closest to among the band (for scenes that go to "the one who stayed") */
function topMember(g, pool) {
  const ids = (pool || g.joined).filter(id => id in WHO_NAME && id !== 'serizawa');
  return ids.sort((a, b) => (g.bond[b] || 0) - (g.bond[a] || 0))[0] || 'rui';
}
const CH = {};                      // CH[1..3] = { no, en, name, bg, desc, goals, nodes, forks, end, show }
const EP_TYPE = { talk: 'TALK', live: 'LIVE', ev: '♥ EVENT', cut: 'CUT' };
const epOf = id => { for (const c of Object.values(CH)) { const n = c.nodes.find(x => x.id === id); if (n) return n; } return null; };
const chOfEp = id => +String(id).split('-')[0];

function needMet(nd) {
  const g = W.g;
  if (!nd) return true;
  return (!nd.fans || g.fans >= nd.fans) && (!nd.lives || g.lives >= nd.lives);
}
function needText(nd) {
  const g = W.g, out = [];
  if (nd.fans) out.push(`팬 ${g.fans.toLocaleString('en-US')} / ${nd.fans.toLocaleString('en-US')}`);
  if (nd.lives) out.push(`LIVE 클리어 ${Math.min(g.lives, nd.lives)} / ${nd.lives}회`);
  return out.join(' · ');
}
function epState(n) {
  const g = W.g;
  if (g.ep[n.id]) return 'clear';
  const c = id => !!g.ep[id];
  const pre = n.all ? n.all.every(c) : (!n.from || !n.from.length || n.from.some(c));
  if (!pre) return n.alt ? 'unknown' : 'future';
  if (n.when && !n.when(g)) return 'closed';
  return needMet(n.need) ? 'now' : 'lock';
}
function chState(no) {
  const g = W.g;
  if (!g) return no === 1 ? 'now' : 'lock';
  const c = CH[no];
  if (!c) return 'lock';
  if (g.ep[c.end]) return 'clear';
  return no === 1 || (CH[no - 1] && g.ep[CH[no - 1].end]) ? 'now' : 'lock';
}
const curCh = () => { for (let n = 1; CH[n]; n++) if (chState(n) === 'now') return n; return Object.keys(CH).length; };
/* the show this chapter is counting down to */
function deadline() {
  const g = W.g, c = CH[curCh()];
  if (!g || !c || !c.show) return null;
  const n = epOf(c.show);
  if (!n || g.ep[n.id]) return null;
  return { name: c.showName, days: n.day - g.day };
}
function nextEpLabel() {
  const g = W.g, c = CH[curCh()];
  if (!g || !c) return '';
  const now = c.nodes.filter(n => epState(n) === 'now');
  if (now.length) return `${c.no === '01' ? '1' : +c.no}장 · ${now[0].id} ${now[0].t}`;
  const lock = c.nodes.find(n => epState(n) === 'lock');
  if (lock) return `${lock.id} ${lock.t} · 필요: ${needText(lock.need)}`;
  return `${c.name} 끝`;
}

/* ---------- running an episode ---------- */
const EPR = {
  run(id, o = {}) {
    const n = epOf(id), g = W.g;
    if (!n) return;
    this.n = n; this.i = 0; this.o = o; this.fin = false;
    this.replay = W.replay = !!g.ep[id];
    this.snap = this.replay ? null : JSON.stringify(g);
    if (!this.replay) g.day = Math.max(g.day, n.day ?? g.day);
    g.last = null;
    W.begin();
    this.step();
  },
  chip() { return dayChip({ day: this.n.day, time: this.n.time }); },
  step() {
    const st = this.n.steps[this.i];
    if (!st) return this.done();
    const next = () => { this.i++; this.step(); };
    const abort = () => this.abort();
    if (st.adv) adv(st.adv, { bg: st.bg, place: st.place, date: this.chip(), next, abort });
    else if (st.card) go('card', { via: 'fade', push: false, arg: { lines: st.card, long: st.long, next } });
    else if (st.live) this.live(st.live, next);
    else if (st.fn) st.fn(next, this);
    else next();
  },
  live(L, next) {
    const g = W.g;
    const play = part => {
      const party = L.party === 'band' ? myBand(part) : [];
      go('live', { via: 'slam', push: false, arg: {
        song: L.song, part, diff: G.diff ?? 1, len: L.len || 'hl', bg: L.bg || 'stage', noFail: L.noFail ?? false,
        party, label: typeof L.label === 'function' ? L.label() : L.label || bandLabel(party), scenario: party.length ? 'band' : L.noFail ? 'practice' : 'solo', fumbles: party.length > 0,
        heat0: heatStart(), story: true, quitTo: 'episodes',
        next: r => { g.last = { rank: r.rank, score: r.score }; if (!this.replay) liveReward(r, { song: L.song, len: L.len || 'hl', diff: G.diff ?? 1, party, story: true }); next(); },
      } });
    };
    if (L.part) play(L.part); else pickPart(L.ask || '이번 무대에서 칠 악기', play);
  },
  abort() {
    if (this.snap) { SAVE.game = JSON.parse(this.snap); writeSave(); }
    W.replay = false; W.pend = null;
    G.stack = [];
    go('episodes', { via: 'sweepBack', push: false, arg: chOfEp(this.n.id) });
  },
  done() {
    if (this.fin) return;                         // one clear per run, however many times the last line is pressed
    this.fin = true;
    const g = W.g, n = this.n, replay = this.replay;
    if (!replay) {
      g.ep[n.id] = { day: g.day, ...(g.last ? { rank: g.last.rank } : {}) };
      if (n.eff) W.apply(typeof n.eff === 'function' ? n.eff(g) : n.eff);
      writeSave();
    }
    W.replay = false;
    const ch = chOfEp(n.id), c = CH[ch];
    const after = () => {
      G.stack = [];
      if (!replay && c && n.id === c.end) return chapterClear(ch);
      go('episodes', { via: 'sweep', push: false, arg: ch });
    };
    if (replay) { W.pend = null; return after(); }
    W.summary(`${n.id} ${n.t}`, after);
  },
};
function chapterClear(ch) {
  const c = CH[ch], nx = CH[ch + 1];
  const lines = [`CHAPTER ${ch} CLEAR`, c.name, nx ? `다음 · CHAPTER ${ch + 1} 「${nx.name}」` : '다음 챕터는 업데이트로 이어집니다. 진행 상황은 저장했어요.'];
  go('card', { via: 'fade', push: false, arg: { lines, long: true, next: () => {
    if (!nx) { G.stack = []; return go('menu', { via: 'ink', push: false }); }
    go('card', { via: 'fade', push: false, arg: { lines: [`CHAPTER ${ch + 1}`, nx.name, nx.span], long: true, next: () => go('episodes', { via: 'sweep', push: false, arg: ch + 1 }) } });
  } } });
}

/* instrument for this song: the protagonist plays all four (and sings) */
function pickPart(title, cb) {
  const order = [G.inst, ...PARTS.map(p => p[0]).filter(p => p !== G.inst)];
  modal({ title: `<small>PART</small>${title}`, body: '주인공은 네 악기를 다 쳐요. 고른 악기가 내 레인이 되고, 같은 파트 멤버는 서브로 빠져요.',
    buttons: order.map(p => ({ t: PARTS.find(q => q[0] === p)[2], fn: () => { G.inst = p; if (SAVE.profile) { SAVE.profile.inst = p; writeSave(); } cb(p); } })) });
}

/* ---------------- STORY · chapter select ---------------- */
const CHAPTER_CARDS = () => [
  { no: '序', en: 'PROLOGUE', name: '47초', bg: 'stage_fest_off', desc: '블루 아워 페스 서브 스테이지. 소리가 사라진 47초.', goals: [], st: 'clear', pro: true },
  ...Object.entries(CH).map(([k, c]) => ({ ...c, k: +k, st: chState(+k) })),
  { no: '04', en: 'CHAPTER 4', name: '라이벌', bg: 'stage_battle', desc: 'ECLIPSE와의 대항전.', goals: [], st: 'lock', soon: true },
  { no: '05', en: 'CHAPTER 5', name: '진실의 조각', bg: 'river_night', desc: '', goals: [], st: 'lock', soon: true },
  { no: '終', en: 'FINAL', name: 'RE:AMP', bg: 'stage_fest', desc: '', goals: [], st: 'lock', soon: true },
];
scene('chapter', {
  title: '챕터 선택', cls: 'ch', wheel: 'x', via: 'sweep',
  html: () => `${bgImg('title', 'ch-img')}<div class="ch-tint"></div>${bigWord('STORY', 'ch-word')}
    <div class="ch-head"><b>STORY</b><small>챕터 선택 · ←→ 또는 휠</small></div>
    <div class="ch-arc"></div>
    <div class="ch-info"><div class="ch-it"></div><div class="ch-desc"></div><ul class="ch-goals"></ul><span class="ch-go" data-tap="ok">이어하기 ▶</span></div>
    ${backChip()}
    ${hint([['A', '결정'], ['B', '뒤로'], ['←→', '챕터']], 'STORY')}`,
  build() {
    const el = this.el;
    this.cards = CHAPTER_CARDS();
    $('.ch-arc', el).innerHTML = this.cards.map(c => `
      <div class="ch-card ${c.st}"><div class="ch-art" style="background-image:url(img/bg/${c.bg}.webp)"><span class="ch-no">${c.no}</span></div>
        <div class="ch-cap"><small>${c.en}</small><b>${c.st === 'lock' ? '未解放' : c.name}</b></div>
        ${c.st === 'now' ? '<span class="ch-now">NOW</span>' : ''}${c.st === 'clear' ? '<span class="ch-clear">CLEAR</span>' : ''}</div>`).join('');
    const start = Math.max(0, this.cards.findIndex(c => c.st === 'now'));
    this.S = Scroller($$('.ch-card', el), {
      start, ease: .12,
      layout: (c, off) => {
        const a = Math.abs(off);
        c.style.transform = `translate(calc(-50% + ${off * 250}px), ${a * a * 14}px) rotate(${off * 5}deg) scale(${1 - Math.min(a, 1) * .24 - Math.max(0, a - 1) * .06})`;
        c.style.zIndex = 20 - Math.round(a * 2);
        c.style.opacity = a > 3.3 ? 0 : 1;
        c.style.filter = a > .5 ? `brightness(${1 - Math.min(a, 3) * .15})` : 'none';
      },
      onChange: (n, c, silent) => this.info(n, silent),
      onPick: () => this.key('ok'),
    });
    this.info(start, true);
  },
  info(n, silent) {
    const c = this.cards[n], el = this.el;
    $('.ch-it', el).innerHTML = `<small>${c.en}</small>${c.st === 'lock' ? '未解放' : c.name}`;
    $('.ch-desc', el).textContent = c.soon ? '다음 업데이트에서 이어져요.' : c.st === 'lock' ? '앞 챕터를 끝내면 열려요.' : c.desc;
    const goals = c.goals && c.st !== 'lock' ? (typeof c.goals === 'function' ? c.goals(W.g) : c.goals) : [];
    $('.ch-goals', el).innerHTML = goals.map(([t, ok]) => `<li class="${ok ? 'ok' : ''}">${ok ? '✓ ' : ''}${t}</li>`).join('');
    const b = $('.ch-go', el);
    b.textContent = c.pro ? '다시 보기 ▶' : c.st === 'clear' ? '에피소드 보기 ▶' : c.st === 'now' ? '이어하기 ▶' : '잠김';
    b.classList.toggle('off', c.st === 'lock');
    if (!silent) stagger([...$('.ch-info', el).children], KF.fromLeft('-8%'), T.slam, 0, 40);
  },
  enter() {
    const el = this.el;
    this.build();
    A($('.ch-img', el), [{ opacity: 0, scale: '1.1' }, { opacity: 1, scale: '1' }], 900, { e: EZ.soft });
    A($('.ch-word', el), KF.fromRight('20%'), 900, { e: EZ.soft });
    stagger($$('.ch-card', el), KF.fromBottom('40%'), T.char, 150, 70);
    A($('.ch-head', el), KF.fromLeft(), T.char);
    A($('.ch-info', el), KF.fromLeft('-20%'), T.char, { delay: 400 });
  },
  key(k) {
    if (k === 'left' || k === 'up') this.S.move(-1);
    else if (k === 'right' || k === 'down') this.S.move(1);
    else if (k === 'ok') {
      const c = this.cards[this.S.idx];
      if (c.st === 'lock') { shake($$('.ch-card', this.el)[this.S.idx]); toast(c.soon ? '다음 업데이트에서 열려요' : '앞 챕터를 끝내면 열려요'); }
      else if (c.pro) confirmBox('프롤로그를 다시 볼까요?', '지금 진행 상황은 그대로 남아요.', () => Story.replayStart('prologue'));
      else go('episodes', { via: 'sweep', arg: c.k });
    } else if (k === 'back') go('menu', { via: 'sweepBack', push: false });
    else return undefined;
    return true;
  },
});

/* ---------------- STORY · episodes / branch map of one chapter ---------------- */
const EPX = c => 110 + c * 196, EPY = l => 196 + l * 88;
scene('episodes', {
  title: '에피소드', cls: 'ep', via: 'sweep',
  html: () => `${bgImg('street_night', 'ep-img')}<div class="ep-tint"></div>${bigWord('ROUTE', 'ep-word')}
    <div class="ep-head"><small class="eh-no"></small><b class="eh-t"></b><span class="eh-p"></span></div>
    <div class="ep-near"></div>
    <div class="ep-view"><div class="ep-pan"><svg class="ep-lines"></svg><div class="ep-forks"></div><div class="ep-nodes"></div></div></div>
    <div class="ep-info">
      <div class="ei-l"><span class="ei-k"></span><span class="ei-ty"></span><span class="ei-date"></span><b class="ei-t"></b><p class="ei-d"></p><div class="ei-need"></div></div>
      <div class="ei-m"><div class="ei-h">이 에피소드가 바꾸는 것</div><ul class="ei-ch"></ul><div class="ei-h">보상</div><div class="ei-rw"></div></div>
      <div class="ei-r"><div class="ei-h">분기 기록</div><div class="ei-log"></div></div>
      <span class="ei-go" data-tap="ok"></span></div>
    ${backChip()}
    ${hint([['A', '보기'], ['B', '챕터'], ['←→', '에피소드'], ['↕', '분기']], 'STORY')}`,
  enter(arg) {
    const g = W.g || W.init();
    this.ch = typeof arg === 'number' ? arg : this.ch || curCh();
    const c = CH[this.ch], el = this.el;
    $('.ep-img', el).style.backgroundImage = `url(img/bg/${c.bg}.webp)`;
    $('.eh-no', el).textContent = c.en; $('.eh-t', el).textContent = c.name;
    const clear = c.nodes.filter(n => g.ep[n.id]).length, seenAlt = c.nodes.filter(n => n.alt && g.ep[n.id]).length, alts = c.nodes.filter(n => n.alt).length;
    $('.eh-p', el).innerHTML = `본 에피소드 <em>${clear}</em> / ${c.nodes.length} · 분기 <em>${seenAlt}</em> / ${alts}`;
    // who you're closest to
    const near = Object.keys(WHO_NAME).filter(id => id !== 'serizawa' && g.met[id]).sort((a, b) => (g.bond[b] || 0) - (g.bond[a] || 0)).slice(0, 4);
    $('.ep-near', el).innerHTML = near.length ? `<small>가까운 사람</small>${near.map(id => `<span style="--c:var(--c-${id})"><img src="${icon(id)}" alt="">${nm(id)} <b>${'♥'.repeat(W.lv(id))}</b></span>`).join('')}` : '';
    // the map
    this.nodes = c.nodes;
    const cols = Math.max(...c.nodes.map(n => n.c)) + 1;
    this.w = EPX(cols - 1) + 230;
    const pan = $('.ep-pan', el); pan.style.width = this.w + 'px';
    this.st = Object.fromEntries(c.nodes.map(n => [n.id, epState(n)]));
    const hideT = n => this.st[n.id] === 'unknown' || (this.st[n.id] === 'closed' && n.alt);
    $('.ep-nodes', el).innerHTML = c.nodes.map(n => {
      const s = this.st[n.id], hid = hideT(n);
      return `<div class="ep-n ${s} t-${n.type}${hid ? ' hid' : ''}" style="left:${EPX(n.c)}px;top:${EPY(n.l)}px${n.who ? `;--c:var(--c-${n.who})` : ''}">
        <span class="k">${n.id}</span><span class="ty">${EP_TYPE[n.type]}</span><b>${hid ? '???' : n.t}</b>
        ${s === 'lock' ? `<small class="nd">🔒 ${needText(n.need)}</small>` : s === 'now' ? '<i class="now">NOW</i>' : s === 'clear' ? `<i class="ok">${g.ep[n.id].rank ? g.ep[n.id].rank + ' · ' : ''}CLEAR</i>` : ''}</div>`;
    }).join('');
    $('.ep-forks', el).innerHTML = (c.forks || []).map(f => `<span class="ep-fork" style="left:${EPX(f.c) - 10}px">${f.t}</span>`).join('');
    const at = id => c.nodes.find(n => n.id === id);
    const edges = [];
    for (const n of c.nodes) for (const f of n.all || n.from || []) if (at(f)) edges.push([at(f), n]);
    const svg = $('.ep-lines', el);
    svg.setAttribute('width', this.w); svg.setAttribute('height', 560); svg.setAttribute('viewBox', `0 0 ${this.w} 560`);
    svg.innerHTML = edges.map(([a, b]) => {
      const x1 = EPX(a.c) + 164, y1 = EPY(a.l) + 36, x2 = EPX(b.c) - 4, y2 = EPY(b.l) + 36, mx = (x1 + x2) / 2;
      const sa = this.st[a.id], sb = this.st[b.id];
      const cls = sa === 'clear' && (sb === 'clear' || sb === 'now' || sb === 'lock') ? 'done' : sb === 'unknown' || sb === 'closed' ? 'unk' : 'todo';
      return `<path class="${cls}" d="M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}"/>`;
    }).join('');
    this.els = $$('.ep-n', el);
    this.els.forEach((d, i) => { d.onmouseenter = () => { if (!G.overlays.length) this.sel(i); }; d.onclick = e => { e.stopPropagation(); if (this.i === i) this.key('ok'); else this.sel(i); }; });
    // branch record: what you chose, in order
    const log = c.nodes.filter(n => g.ep[n.id] && n.log).map(n => [n.id, typeof n.log === 'function' ? n.log(g) : n.log]).filter(x => x[1]);
    $('.ei-log', el).innerHTML = log.length ? log.slice(-6).map(([k, t]) => `<div><em>${k}</em><span>${t}</span></div>`).join('') : '<div class="dim">아직 없어요</div>';
    const start = c.nodes.findIndex(n => this.st[n.id] === 'now');
    const lastClear = c.nodes.map(n => this.st[n.id]).lastIndexOf('clear');
    this.sel(start >= 0 ? start : Math.max(0, lastClear), true);
    A($('.ep-img', el), KF.fade, 800);
    A($('.ep-word', el), KF.fromRight('20%'), 900, { e: EZ.soft });
    A($('.ep-head', el), KF.fromLeft(), T.char);
    $$('.ep-lines path', el).forEach((p, i) => { const L = p.getTotalLength(); if (p.classList.contains('unk')) p.style.strokeDasharray = '8 10'; else { p.style.strokeDasharray = `${L} ${L}`; A(p, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 600, { delay: 200 + i * 30, fill: 'backwards', e: EZ.soft }); } });
    this.els.forEach((d, i) => A(d, [{ opacity: 0, translate: '0 20px' }, { opacity: 1, translate: '0 0' }], T.char, { delay: 150 + c.nodes[i].c * 60 }));
    stagger($$('.ep-fork', el), KF.fade, 400, 600, 100);
    A($('.ep-near', el), KF.fromRight('20%'), T.char, { delay: 300 });
    A($('.ep-info', el), KF.fromBottom('30%'), T.char, { delay: 450 });
    if (!g.flags.tutEp) {
      g.flags.tutEp = true; writeSave();
      later(() => tutorial({ title: '에피소드와 분기', body: '이야기는 에피소드 단위로 진행돼요. 선택지와 라이브 결과에 따라 <b>다음 에피소드가 달라져요</b>. 보지 못한 분기는 <b>???</b>로 남아요.<br>🔒가 붙은 에피소드는 <b>LIVE</b>에서 곡을 클리어하고 팬을 모으면 열려요.' }), 1300);
    }
  },
  sel(i, silent) {
    const el = this.el, n = this.nodes[i], s = this.st[n.id], g = W.g;
    this.i = i;
    this.els.forEach((d, k) => d.classList.toggle('sel', k === i));
    // keep the chosen column in view
    const pan = $('.ep-pan', el), x = Math.max(0, Math.min(this.w - 1480, EPX(n.c) - 640));
    if (silent) pan.style.translate = `${-x}px 0`; else pan.animate([{ translate: getComputedStyle(pan).translate }, { translate: `${-x}px 0` }], { duration: 450, easing: EZ.soft, fill: 'forwards' }).finished.then(() => { pan.style.translate = `${-x}px 0`; }).catch(() => {});
    const hid = s === 'unknown' || (s === 'closed' && n.alt);
    $('.ei-k', el).textContent = n.id; $('.ei-ty', el).textContent = EP_TYPE[n.type];
    $('.ei-date', el).textContent = n.day != null ? dateKo(n.day) : '';
    $('.ei-t', el).textContent = hid ? '아직 보지 않은 분기' : n.t;
    $('.ei-d', el).textContent = s === 'closed' ? '이번에는 다른 쪽을 골라서 열리지 않았어요.' : s === 'unknown' ? '앞 이야기에서 무엇을 고르느냐, 라이브를 어떻게 끝내느냐에 따라 열려요.' : n.desc;
    $('.ei-need', el).innerHTML = n.need ? `<span class="${needMet(n.need) ? 'y' : 'n'}">${needMet(n.need) ? '✓' : '🔒'} ${needText(n.need)}</span>` : n.hint && !hid ? `<span class="h">${n.hint}</span>` : '';
    $('.ei-ch', el).innerHTML = !hid && n.chg && n.chg.length ? n.chg.map(t => `<li>${t}</li>`).join('') : '<li class="dim">—</li>';
    $('.ei-rw', el).innerHTML = !hid && n.rw && n.rw.length ? n.rw.map(r => `<span>${r}</span>`).join('') : '<span class="dim">—</span>';
    const b = $('.ei-go', el);
    b.textContent = s === 'clear' ? '다시 보기 ▶' : s === 'now' ? (n.type === 'live' ? '무대로 ▶' : '보기 ▶') : s === 'lock' ? 'LIVE로 ▶' : '잠김';
    b.className = 'ei-go ' + s;
    if (!silent) stagger([...$('.ep-info', el).querySelectorAll('.ei-t, .ei-d, .ei-ch li')], KF.fromLeft('-6%'), T.slam, 0, 30);
  },
  key(k) {
    const n = this.nodes[this.i];
    const pick = cands => { if (!cands.length) return; cands.sort((a, b) => Math.abs(a.l - n.l) - Math.abs(b.l - n.l)); this.sel(this.nodes.indexOf(cands[0])); };
    if (k === 'left' || k === 'right') { const d = k === 'left' ? -1 : 1; for (let c = n.c + d; c >= 0 && c < 40; c += d) { const cs = this.nodes.filter(x => x.c === c); if (cs.length) { pick(cs); break; } } }
    else if (k === 'up' || k === 'down') { const col = this.nodes.filter(x => x.c === n.c).sort((a, b) => a.l - b.l), j = col.indexOf(n) + (k === 'up' ? -1 : 1); if (col[j]) this.sel(this.nodes.indexOf(col[j])); }
    else if (k === 'ok') {
      const s = this.st[n.id];
      if (s === 'now') EPR.run(n.id);
      else if (s === 'clear') confirmBox(`${n.id} ${n.t}`, '다시 볼까요? 다시 볼 때는 선택해도 아무것도 바뀌지 않아요.', () => EPR.run(n.id));
      else if (s === 'lock') confirmBox('LIVE에서 팬을 모아야 해요', `${needText(n.need)}<br>LIVE로 갈까요?`, () => go('setlist', { via: 'shutter' }));
      else { shake(this.els[this.i]); toast(s === 'closed' ? '이번에는 다른 쪽을 골랐어요' : s === 'unknown' ? '다른 선택을 하면 열리는 이야기예요' : '앞 에피소드를 먼저 봐야 해요'); }
    } else if (k === 'back') go('chapter', { via: 'sweepBack', push: false });
    else return undefined;
    return true;
  },
});
