/* RE:AMP! — story flow. A chapter is a list of steps (dialogue, live, card); progress is saved per step. */
'use strict';

/* prologue · green room, 20 minutes before SIGNAL LOST goes on. Draft script. */
const GREENROOM = [
  { text: '블루 아워 페스 서브 스테이지 대기실. 무대까지 20분 남았다.' },
  { text: '앞 팀 베이스 소리가 벽을 타고 울린다.' },
  { who: '하루', ch: 'haru', ex: 'neutral', text: '야, 인이어에서 소리 들려?' },
  { who: '@NAME', ch: 'haru', ex: 'neutral', text: '리허설 때는 멀쩡했잖아.' },
  { who: '하루', ch: 'haru', ex: 'smile', text: '그렇긴 하지.' },
  { text: '하루는 아까부터 인이어를 뺐다 꼈다 하고 있다.' },
  { who: '소마', text: '또 저런다. 쟤는 긴장하면 꼭 인이어를 만지더라.' },
  { who: '키리야', text: '첫 방송인데 긴장 안 하는 게 더 이상하지. 난 손이 다 차가워.' },
  { who: '미카미', text: 'SIGNAL LOST 여러분, 10분 뒤에 스탠바이 부탁드립니다.' },
  { who: '미카미', text: '방송 쪽은 걱정 마세요. 저희가 다 준비해 뒀습니다.' },
  { who: '하루', ch: 'haru', ex: 'guilt', text: '……네.' },
  { text: '삐이이이.', fx: 'tinnitus' },
  { text: '귀 안쪽에서 가늘고 높은 소리가 길게 이어진다. 주변 소리가 점점 멀어진다.', fx: 'blur' },
  { who: '하루', ch: 'haru', ex: 'surprise', text: '@NAME, 야. 괜찮아?' },
  { choice: ['"괜찮아."', '"응, 좀 긴장했나 봐."', '(고개를 끄덕인다)'], ch: 'haru', ex: 'surprise' },
  { who: '하루', ch: 'haru', ex: ['smile', 'smile', 'neutral'], text: ['그래. 네가 괜찮으면 됐어.', '다행이다. 나만 떨리는 줄 알았네.', '말로 해. 그래야 믿지.'] },
  { who: '하루', ch: 'haru', ex: 'smile', text: '가자. 오늘 제대로 한번 울려 보자.' },
];

const STORY = {
  /* 6. one year later: the call, the signal line snaps, OP (placeholder), chapter 1 opens */
  year: [
    { card: ['ONE YEAR LATER', '1년 후', '4월 · 나기사카'] },
    { adv: S_CALL, bg: 'river_night', place: '<b>나기사카</b> 강변 둑길 · 밤', date: '<div class="datechip"><b>4월</b><span>1년 후<small>밤</small></span><i class="moon"></i><em>SPRING</em></div>' },
    { op: true },
    { card: ['CHAPTER 1', '제로 데시벨', '4월 1주 · 오픈 마이크까지 2주'], long: true },
    { week: true },
  ],
  prologue: [
    { adv: GREENROOM, bg: 'backstage', place: '<b>블루 아워 페스</b> 서브 스테이지 대기실', date: '<div class="datechip past"><b>1년 전</b><span>SUN<small>저녁</small></span><i class="moon"></i><em>SIGNAL LOST</em></div>' },
    { card: ['SET 1 / 2', 'SIGNAL LOST', '블루 아워 페스 · 서브 스테이지'] },
    { live: { song: 'count4', scenario: 'tutorial', len: 'hl', bg: 'stage_fest', skipResult: true } },
    { card: ['SET 2 / 2', '두 번째 곡', '생중계 중'] },
    { live: { song: 'hanpaku', scenario: 'incident', bg: 'stage_fest', noFail: true } },
    { cut: 'after47' },                           // the phone · the hearing test · Haru's contract · the group chat · the closet
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
    else if (st.cut) go(st.cut, { via: 'fade', push: false, arg: { next } });
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
