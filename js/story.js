/* RE:AMP! — story flow. A chapter is a list of steps (dialogue, live, card); progress is saved per step. */
'use strict';

/* prologue · green room, 20 minutes before SIGNAL LOST goes on. Draft script. */
const GREENROOM = [
  { text: '블루 아워 페스, 서브 스테이지 대기실. 본 무대까지 20분.' },
  { text: '문 너머로 앞 팀의 베이스가 벽을 타고 울린다.' },
  { who: '하루', ch: 'haru', ex: 'neutral', text: '……야. 이거 소리 들려? 인이어.' },
  { who: '@NAME', ch: 'haru', ex: 'neutral', text: '리허설 때 멀쩡했잖아.' },
  { who: '하루', ch: 'haru', ex: 'smile', text: '그렇지. 그랬지.' },
  { text: '하루는 아까부터 계속 인이어를 만지작거리고 있다. 뺐다가, 다시 끼웠다가.' },
  { who: '소마', text: '또 그런다. 긴장하면 저거 만지는 버릇.' },
  { who: '키리야', text: '첫 방송인데 긴장 안 하는 게 이상하지. 난 손이 차가워.' },
  { who: '미카미', text: 'SIGNAL LOST 여러분, 10분 뒤 스탠바이입니다.' },
  { who: '미카미', text: '방송은 걱정 마, 다 준비해 뒀으니까.' },
  { who: '하루', ch: 'haru', ex: 'guilt', text: '……네.' },
  { text: '삐—', fx: 'tinnitus' },
  { text: '귀 안쪽에서 가느다란 소리가 길게 울린다. 방이 조금, 멀어진다.', fx: 'blur' },
  { who: '하루', ch: 'haru', ex: 'surprise', text: '@NAME? 야. 괜찮아?' },
  { choice: ['"괜찮아."', '"……괜찮아. 조금 긴장했나 봐."', '(고개를 끄덕인다)'], ch: 'haru', ex: 'surprise' },
  { who: '하루', ch: 'haru', ex: ['smile', 'smile', 'neutral'], text: ['……그래. 너만 괜찮으면 돼.', '다행이다. 나만 그런 줄 알았네.', '……말로 해 줘. 그래야 믿지.'] },
  { who: '하루', ch: 'haru', ex: 'smile', text: '가자. 오늘은 우리가 제일 크게 울리는 날이니까.' },
];

const STORY = {
  /* 6. one year later: the call, the signal line snaps, OP (placeholder), chapter 1 opens */
  year: [
    { card: ['ONE YEAR LATER', '1년 후', '4월 · 나기사카'] },
    { adv: S_CALL, bg: 'river_night', place: '<b>나기사카</b> 강변 둑길 · 밤', date: '<div class="datechip"><b>4월</b><span>1년 후<small>밤</small></span><i class="moon"></i><em>SPRING</em></div>' },
    { op: true },
    { card: ['CHAPTER 1', '제로 데시벨', '4월 1주 — 오픈 마이크까지 2주'], long: true },
    { week: true },
  ],
  prologue: [
    { adv: GREENROOM, bg: 'backstage', place: '<b>블루 아워 페스</b> 서브 스테이지 대기실', date: '<div class="datechip past"><b>1년 전</b><span>SUN<small>저녁</small></span><i class="moon"></i><em>SIGNAL LOST</em></div>' },
    { card: ['SET 1 / 2', 'SIGNAL LOST', '블루 아워 페스 · 서브 스테이지'] },
    { live: { song: 'count4', scenario: 'tutorial', bg: 'stage_fest', skipResult: true } },
    { card: ['SET 2 / 2', '두 번째 곡', '생중계 중'] },
    { live: { song: 'hanpaku', scenario: 'incident', bg: 'stage_fest', noFail: true } },
    { card: ['그 후', '— 몽타주 자리 —', '클립 확산 · 청력 검사 · 조용해진 단톡방 · 하루 전속 계약 · 옷장 속 기타 케이스'], long: true },
  ],
};

const Story = {
  id: null, i: 0,
  start(id, step = 0) { this.id = id; this.i = step; G.stack = []; this.run(); },
  run() {
    const steps = STORY[this.id], st = steps[this.i];
    SAVE.progress = { story: this.id, step: this.i, t: Date.now() }; writeSave();
    if (!st) {
      if (this.id === 'prologue') { SAVE.progress = { story: 'prologue', step: 0, done: true }; writeSave(); return this.start('year'); }
      SAVE.progress = { story: this.id, step: 0, done: true }; writeSave(); G.stack = []; return go('menu', { via: 'ink', push: false });
    }
    const next = () => { this.i++; this.run(); };
    if (st.adv) go('adv', { via: 'fade', push: false, arg: { script: st.adv, bg: st.bg, place: st.place, date: st.date, next } });
    else if (st.card) go('card', { via: 'fade', push: false, arg: { lines: st.card, long: st.long, next } });
    else if (st.op) go('op0', { via: 'cut', push: false, arg: { next } });
    else if (st.week) { W.init(); SAVE.progress = { story: this.id, step: this.i, done: true }; writeSave(); W.resume(); }
    else if (st.live) go('live', { via: 'slam', push: false, arg: { ...st.live, part: G.inst, diff: G.diff ?? 1, party: 'signal', story: this.id, next } });
  },
};

/* title card between steps */
scene('card', {
  cls: 'card', back: false,
  html: `<div class="cd-bg"></div><div class="cd-a"></div><div class="cd-b"></div><div class="cd-c"></div><div class="cd-skip">Z · 계속</div>`,
  enter(a = { lines: ['SET 1 / 2', 'SIGNAL LOST', ''] }) {
    const el = this.el, [x, y, z] = a.lines;
    this.next = a.next;
    $('.cd-a', el).textContent = x; $('.cd-b', el).textContent = y; $('.cd-c', el).textContent = z;
    A($('.cd-a', el), KF.fromLeft('-40%'), T.char, { delay: 100 });
    A($('.cd-b', el), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 600, { e: EZ.wipe, delay: 260 });
    A($('.cd-c', el), KF.fade, 600, { delay: 700 });
    this.done = false;
    later(() => this.go(), a.long ? 6000 : 2600);
  },
  go() { if (this.done) return; this.done = true; clearTimers(); this.next ? this.next() : go('title', { push: false }); },
  key(k) { if (k === 'ok' || k === 'back') this.go(); return true; },
});
