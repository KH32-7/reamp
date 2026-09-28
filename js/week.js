/* RE:AMP! — one year later: the game state (v2), the call, the OP slot.
   v2: no action points. STORY runs chapters as episodes on a branch map, LIVE earns fans that open them,
   TOWN is for the people (affection events, random events, gifts). State lives in SAVE.game. */
'use strict';

/* ---------- speakers met from here on ---------- */
Object.assign(SPEAKER, {
  '저장 안 된 번호': { role: 'INCOMING CALL', c: '#8FA8FF' },
  '루이': { role: 'RUI · VOCAL', c: 'var(--c-rui)', face: 'rui' },
  '마스크 쓴 여자': { role: '???', c: 'var(--c-rui)' },
  '렌': { role: 'REN', c: 'var(--c-ren)', face: 'ren' },
  '키 큰 점원': { role: '멘야 도돈', c: 'var(--c-ren)' },
  '나츠': { role: 'NATSU', c: 'var(--c-natsu)', face: 'natsu' },
  '헌옷가게 알바': { role: '???', c: 'var(--c-natsu)' },
  '레이': { role: 'REI', c: 'var(--c-rei)', face: 'rei' },
  '악보를 든 여자': { role: '???', c: 'var(--c-rei)' },
  '코토': { role: 'KOTO', c: 'var(--c-koto)', face: 'koto' },
  '@kero_P': { role: 'PULSE · DM', c: 'var(--c-koto)' },
  '렌 아버지': { role: '멘야 도돈 사장', c: 'var(--c-ren)' },
  '오카베': { role: '음향 엔지니어', c: '#8FA8FF' },
  '미카미 쇼고': { role: 'CRESCENDO RECORDS', c: '#FFE14A', face: 'mikami' },
  '손님': { role: '', c: '#8FA8FF' },
  '여고생': { role: '', c: '#8FA8FF' },
  '관객': { role: '', c: '#8FA8FF', face: 'fan' },
  'PULSE': { role: 'SNS', c: '#4FE3FF' },
});

/* every dialogue script registers itself here so the lines sheet can list it: S('KEY', '장면 이름', [lines]) */
const SCRIPTS = {};
function S(key, label, arr) { SCRIPTS[key] = { label, arr }; return arr; }

/* ---------- the call (one year later) ---------- */
const S_CALL = [
  { text: '요즘은 이어폰을 오른쪽에만 끼고 다닌다.' },
  { text: '왼쪽 귀는 거의 다 나았다고 했다. 그래도 조용한 곳에 있으면 그날 일이 먼저 떠오른다.' },
  { text: '주머니에서 휴대폰이 울린다. 모르는 번호다.', fx: 'buzz' },
  { who: '@NAME', text: '여보세요?' },
  { who: '저장 안 된 번호', text: '드디어 받네. 1년 동안 문자를 몇 통이나 보낸 줄 알아?' },
  { who: '저장 안 된 번호', text: '0dB 세리자와야. 너희 첫 공연 했던 지하 라이브하우스. 대기실 벽에 너희 사인 아직 그대로 있어.' },
  { who: '세리자와 점장', text: '용건만 말할게. 알바 한 명이 갑자기 그만뒀거든. 케이블 감고, 조명 켜고, 공연 끝나면 바닥 닦는 일이야.' },
  { who: '세리자와 점장', text: '0dB에서 알바 할래?' },
  { choice: ['"저 이제 음악 안 해요."', '"왜 하필 저예요?"', '(대답하지 않는다)'], eff: [{ mt: -2 }, { mt: 1 }, { mt: 1 }] },
  { who: '세리자와 점장', text: ['누가 음악 하랬어? 케이블 감으라고.', '케이블을 제일 깔끔하게 감던 게 너였으니까.', '대답하기 싫으면 안 해도 돼. 끊지만 마.'] },
  { who: '세리자와 점장', text: '다음 주 월요일 저녁 여섯 시에 가게 앞으로 와. 안 오면 안 하는 걸로 알게.' },
  { who: '@NAME', text: '저는……' },
  { text: '대답하려는 순간, 귀 안쪽에서 찌직 하고 신호가 튀었다.', fx: 'signal' },
];

/* ---------- calendar: day 0 = 4월 7일 월요일 (0dB 첫 출근) ---------- */
const MONTHS = [[4, 30], [5, 31], [6, 30], [7, 31], [8, 31]];
const DOW_KO = ['월', '화', '수', '목', '금', '토', '일'];
const DOW_EN = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
function dateOf(day) {
  let d = 7 + day, i = 0;
  while (i < MONTHS.length - 1 && d > MONTHS[i][1]) { d -= MONTHS[i][1]; i++; }
  return { m: MONTHS[i][0], d, dow: ((day % 7) + 7) % 7 };
}
const dateKo = day => { const t = dateOf(day); return `${t.m}월 ${t.d}일 (${DOW_KO[t.dow]})`; };
const isWeekend = day => dateOf(day).dow >= 5;

/* ---------- affection: points → LV (LV0 = not met yet) ---------- */
const LV_AT = [0, 6, 15, 28, 45];
const WHO_NAME = { rui: '루이', ren: '렌', natsu: '나츠', rei: '레이', koto: '코토', serizawa: '세리자와 점장' };
const nm = id => id === 'koto' && !(W.g && W.g.flags.kotoName) ? 'kero_P' : WHO_NAME[id] || id;   // Koto is a DM handle until she gives her name
/* particles after a name: jo('렌', '와') → '렌과' */
function jo(w, p) {
  w = String(w); const c = w.charCodeAt(w.length - 1), bat = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0;
  const m = { '와': ['과', '와'], '가': ['이', '가'], '는': ['은', '는'], '를': ['을', '를'] };
  return w + (m[p] ? m[p][bat ? 0 : 1] : p);
}
const RANK_N = { F: -1, D: 0, C: 1, B: 2, A: 3, S: 4, SS: 5 };

const W = {
  get g() { const g = SAVE.game; return g && g.v === 2 ? g : null; },   // an old week-1 save is migrated by init(), never read as-is
  replay: false,                          // replaying a cleared episode: nothing changes
  fresh() {
    return { v: 2, day: 0, money: 8000, hp: 80, mt: 45, fans: 0, bond: {}, met: {}, joined: [], flags: {}, sync: {}, mc: {},
      ep: {}, seen: {}, ev: {}, bag: {}, gave: {}, did: {}, lives: 0, clears: {}, buff: {}, bandName: '', last: null, chSeen: {} };
  },
  init() {
    let g = SAVE.game;
    if (!g) g = SAVE.game = this.fresh();
    else if (g.v !== 2) {                  // a week-1 save from the old build: keep the person, restart chapter 1 on the new map
      const o = g; g = SAVE.game = this.fresh();
      for (const k of ['money', 'hp', 'mt', 'bond', 'met', 'flags']) if (o[k] != null) g[k] = o[k];
      if (o.phase && o.phase !== 'event') g.ep['1-1'] = { day: 0 };
    }
    writeSave();
    return g;
  },
  lv(id) { const g = this.g; if (!g || !g.met[id]) return 0; const p = g.bond[id] || 0; return 1 + LV_AT.slice(1).filter(x => p >= x).length; },
  syncLv(id) { const g = this.g; return g ? Math.min(5, 1 + Math.floor((g.sync[id] || 0) / 100)) : 1; },
  cond(id) {                              // a member's condition on stage: SYNC, then their mood
    const m = this.mc(id);
    return Math.max(.4, Math.min(.97, .6 + this.syncLv(id) * .07 + (m.mt - 50) / 400 + (m.hp < 30 ? -.08 : 0)));
  },
  mc(id) {                                // member hp / mental (starts from the cast sheet)
    const g = this.g, base = (typeof MEMBERS !== 'undefined' && MEMBERS.find(m => m.id === id)) || { hp: 70, mt: 60 };
    if (!g) return { hp: base.hp, mt: base.mt };
    return g.mc[id] || (g.mc[id] = { hp: base.hp, mt: base.mt });
  },
  cleared(id) { return !!(this.g && this.g.ep[id]); },
  rank(id) { const e = this.g && this.g.ep[id]; return e && e.rank ? RANK_N[e.rank] : -1; },
  lastRank() { const l = this.g && this.g.last; return l ? RANK_N[l.rank] ?? -1 : -1; },
  has(item) { return !!(this.g && this.g.bag[item] > 0); },

  pend: null,
  begin() { this.pend = { d: {}, bond: {}, lvup: {}, met: [], sync: {}, join: [], fans: 0, items: [] }; },
  /* choices, episodes, events and gifts all land here */
  apply(e) {
    if (!e || this.replay) return;
    const g = this.g || this.init();
    if (!this.pend) this.begin();
    const p = this.pend;
    for (const k of ['hp', 'mt', 'money']) if (e[k]) {
      const before = g[k];
      g[k] = k === 'money' ? Math.max(0, g[k] + e[k]) : Math.max(0, Math.min(100, g[k] + e[k]));
      p.d[k] = (p.d[k] || 0) + (g[k] - before);
    }
    if (e.fans) { g.fans = Math.max(0, g.fans + e.fans); p.fans += e.fans; }
    if (e.meet) for (const id of [].concat(e.meet)) if (!g.met[id]) { g.met[id] = true; p.met.push(id); }
    if (e.bond) for (const [id, n] of Object.entries(e.bond)) {
      if (!g.met[id]) { g.met[id] = true; p.met.push(id); }
      const lv0 = this.lv(id);
      g.bond[id] = Math.max(0, (g.bond[id] || 0) + n);
      if (n) p.bond[id] = (p.bond[id] || 0) + n;
      const lv1 = this.lv(id);
      if (lv1 > lv0 && !p.met.includes(id)) p.lvup[id] = lv1;
    }
    if (e.sync) for (const [id, n] of Object.entries(e.sync)) { g.sync[id] = (g.sync[id] || 0) + n; p.sync[id] = (p.sync[id] || 0) + n; }
    for (const [key, k] of [['mhp', 'hp'], ['mmt', 'mt']]) if (e[key]) for (const [id, n] of Object.entries(e[key])) { const m = this.mc(id); m[k] = Math.max(0, Math.min(100, m[k] + n)); }
    if (e.flag) g.flags[e.flag] = true;
    if (e.flags) Object.assign(g.flags, e.flags);
    if (e.join) for (const id of [].concat(e.join)) if (!g.joined.includes(id)) { g.joined.push(id); g.met[id] = true; p.join.push(id); }
    if (e.item) for (const [id, n] of Object.entries(e.item)) { g.bag[id] = (g.bag[id] || 0) + n; p.items.push([id, n]); }
    writeSave();
  },
  /* one popup that says what just changed */
  summary(title, fn) {
    const p = this.pend || { d: {}, bond: {}, lvup: {}, met: [], sync: {}, join: [], fans: 0, items: [] }, g = this.g;
    this.pend = null;
    if (!g) return fn();
    const bar = (label, to, v) => `<div class="ar-row"><span>${label}</span><span class="ar-bar"><i style="--f:${to - v}%;--t:${to}%;background:${v > 0 ? 'var(--cobalt)' : 'var(--pink)'}"></i></span><b class="${v > 0 ? 'up' : 'dn'}">${v > 0 ? '+' : ''}${v}</b></div>`;
    const rows = [['hp', '체력'], ['mt', '멘탈']].filter(([k]) => p.d[k]).map(([k, n]) => bar(n, g[k], p.d[k])).join('');
    const who = [
      ...p.join.map(id => `<div class="ar-meet join">밴드 합류 · <b>${nm(id)}</b></div>`),
      ...p.met.filter(id => !p.join.includes(id)).map(id => `<div class="ar-meet">새로 알게 된 사람 · <b>${nm(id)}</b></div>`),
      ...Object.entries(p.bond).filter(([id]) => !p.met.includes(id)).map(([id, n]) => `<div class="ar-meet${n < 0 ? ' dn' : ''}">${nm(id)} 호감도 <b>${n > 0 ? '+' : ''}${n}</b>${p.lvup[id] ? ` <em>♥ LV${p.lvup[id]} · ${STAGES[p.lvup[id]]}</em>` : ''}</div>`),
      ...Object.entries(p.sync).map(([id, n]) => `<div class="ar-meet sync">${nm(id)} SYNC <b>+${n}</b></div>`),
      ...p.items.map(([id, n]) => `<div class="ar-meet">받은 것 · <b>${(ITEM[id] || { n: id }).n}</b>${n > 1 ? ` ×${n}` : ''}</div>`),
    ].join('');
    const money = p.d.money ? `<div class="ar-money">${p.d.money > 0 ? '+' : '-'}¥${Math.abs(p.d.money).toLocaleString('en-US')} · 잔액 ¥${g.money.toLocaleString('en-US')}</div>` : '';
    const fans = p.fans ? `<div class="ar-fans">팬 <b>${p.fans > 0 ? '+' : ''}${p.fans.toLocaleString('en-US')}</b> · ${g.fans.toLocaleString('en-US')}명</div>` : '';
    if (!rows && !who && !money && !fans) return fn();
    modal({ title: `<small>RESULT</small>${title}`, body: `<div class="act-res">${rows}${who}${fans}${money}</div>`, buttons: [{ t: '확인', fn }] });
    setTimeout(() => $$('.ar-bar i').forEach((i, n) => A(i, [{ width: i.style.getPropertyValue('--f') }, { width: i.style.getPropertyValue('--t') }], 700, { delay: 350 + n * 120, fill: 'forwards' })), 50);
  },
};
function applyEff(e) { W.apply(e); }
function adv(script, o) { go('adv', { via: 'fade', push: false, arg: { script, date: dayChip(), ...o } }); }
const lv = id => W.lv(id);

/* date chip: the day, and how far the chapter's show is */
function dayChip(o = {}) {
  const g = W.g;
  if (!g) return `<div class="datechip"><b>4월</b><span>1년 후<small>봄</small></span><i class="moon"></i><em>0dB</em></div>`;
  const day = o.day ?? g.day, t = dateOf(day), dl0 = typeof deadline === 'function' ? deadline() : null;
  const dl = dl0 && { ...dl0, days: dl0.days - (day - g.day) };
  const time = o.time || (isWeekend(day) ? '낮' : '저녁');
  const em = dl ? (dl.days > 0 ? `${dl.name} D-${dl.days}` : dl.days === 0 ? `${dl.name} D-DAY` : dl.name) : 'NAGISAKA';
  return `<div class="datechip${dl && dl.days === 0 ? ' live' : ''}"><b>${t.m}/${t.d}</b><span>${DOW_EN[t.dow]}<small>${time}</small></span><i class="moon"></i><em>${em}</em></div>`;
}
const weekChip = () => dayChip();

/* ---------------- OP (placeholder until the film exists) ---------------- */
scene('op0', {
  cls: 'op0', back: false,
  html: `<div class="o0-line"></div><div class="o0-cap"><b>OPENING</b><small>OP 영상이 들어갈 자리입니다</small></div><div class="o0-skip">Z · 건너뛰기</div>`,
  enter(a = {}) {
    const el = this.el; this.next = a.next; this.done = false;
    const line = $('.o0-line', el);
    A(line, [{ scale: '0 1', translate: '0 0', opacity: 1 }, { scale: '1 1', translate: '0 -6px', opacity: 1, offset: .25 }, { translate: '0 5px', offset: .35 }, { translate: '0 -2px', offset: .45 }, { scale: '1 .2', translate: '0 0', opacity: .9, offset: .7 }, { scale: '1 0', opacity: 0 }], 1400, { e: EZ.lin, fill: 'forwards' });
    A($('.o0-cap', el), KF.fade, 600, { delay: 1300 });
    A($('.o0-skip', el), KF.fade, 400, { delay: 1600 });
    later(() => this.go(), 4200);
  },
  go() { if (this.done) return; this.done = true; clearTimers(); this.next ? this.next() : go('menu', { push: false }); },
  key(k) { if (k === 'ok' || k === 'back') this.go(); return true; },
});
