/* RE:AMP! — one year later: the call, the OP slot, and chapter 1 week 1 (town map, actions, weekend).
   State lives in SAVE.game; the menu, the save slot and the band screen read it. */
'use strict';

/* ---------- speakers met from here on ---------- */
Object.assign(SPEAKER, {
  '저장 안 된 번호': { role: 'INCOMING CALL', c: '#8FA8FF' },
  '루이': { role: 'RUI · VOCAL', c: 'var(--c-rui)', face: 'rui' },
  '마스크 쓴 여자': { role: '???', c: 'var(--c-rui)' },
  '렌': { role: 'REN · 멘야 도돈', c: 'var(--c-ren)', face: 'ren' },
  '앞치마 두른 남자': { role: '???', c: 'var(--c-ren)' },
  '나츠': { role: 'NATSU · 상점가', c: 'var(--c-natsu)', face: 'natsu' },
  '헌옷가게 알바': { role: '???', c: 'var(--c-natsu)' },
  '레이': { role: 'REI', c: 'var(--c-rei)', face: 'rei' },
  '악보를 든 여자': { role: '???', c: 'var(--c-rei)' },
  '@kero_P': { role: 'PULSE · DM', c: 'var(--c-koto)' },
});

/* ---------- scripts ---------- */
const S_CALL = [
  { text: '요즘은 이어폰을 오른쪽에만 끼고 다닌다.' },
  { text: '왼쪽 귀는 거의 다 나았다고 했다. 그래도 조용한 곳에 있으면 그날 일이 먼저 떠오른다.' },
  { text: '주머니에서 휴대폰이 울린다. 모르는 번호다.', fx: 'buzz' },
  { who: '@NAME', text: '여보세요?' },
  { who: '저장 안 된 번호', text: '드디어 받네. 1년 동안 문자를 몇 통이나 보낸 줄 알아?' },
  { who: '저장 안 된 번호', text: '0dB 세리자와야. 너희 첫 공연 했던 지하 라이브하우스. 대기실 벽에 너희 사인 아직 그대로 있어.' },
  { who: '세리자와 점장', text: '용건만 말할게. 알바 한 명이 갑자기 그만뒀거든. 케이블 감고, 조명 켜고, 공연 끝나면 바닥 닦는 일이야.' },
  { who: '세리자와 점장', text: '0dB에서 알바 할래?' },
  { choice: ['"저 이제 음악 안 해요."', '"왜 하필 저예요?"', '(대답하지 않는다)'], eff: [{ mt: -2 }, { stage: 1 }, { mt: 1 }] },
  { who: '세리자와 점장', text: ['누가 음악 하랬어? 케이블 감으라고.', '케이블을 제일 깔끔하게 감던 게 너였으니까.', '대답하기 싫으면 안 해도 돼. 끊지만 마.'] },
  { who: '세리자와 점장', text: '다음 주 월요일 저녁 여섯 시에 가게 앞으로 와. 안 오면 안 하는 걸로 알게.' },
  { who: '@NAME', text: '저는……' },
  { text: '대답하려는 순간, 귀 안쪽에서 찌직 하고 신호가 튀었다.', fx: 'signal' },
];

const S_ARRIVE = [
  { text: '월요일 저녁 여섯 시 오 분 전.' },
  { text: '상점가 끝에 지하로 내려가는 계단이 있다. 「0dB」 간판은 불이 반쯤 나가 있다.' },
  { text: '지난 1년 동안은 이 앞을 지날 때마다 일부러 길을 건넜다.' },
  { who: '세리자와 점장', text: '오 분 일찍 왔네. 대답은 들은 걸로 할게.' },
  { who: '@NAME', text: '아직 아무 말도 안 했는데요.' },
  { who: '세리자와 점장', text: '여기까지 온 게 대답이지. 들어와.' },
  { bg: 'stage', text: '지하 1층 홀. 관객이 80명만 들어와도 꽉 차는 크기다. 천장 조명 몇 개는 꺼진 채로 매달려 있다.' },
  { who: '세리자와 점장', text: '일은 간단해. 공연 있는 날 오후에 와서 케이블 깔고, 끝나면 정리하면 돼.' },
  { who: '세리자와 점장', text: '나머지 시간은 알아서 써. 연습을 하든 사람을 만나든 잠을 자든.' },
  { text: '무대 쪽에서 누가 마이크 테스트를 하고 있다.' },
  { who: '세리자와 점장', text: '아, 쟤는 오픈 마이크 자리 달라고 매주 찾아오는 애야.' },
  { who: '마스크 쓴 여자', ch: 'rui', ex: 'neutral', text: '점장님, 모니터 스피커에서 또 하울링 나요. 이거 언제 고쳐 줘요?' },
  { who: '세리자와 점장', text: '마침 고칠 사람 왔어. 인사해. 오늘부터 여기서 일할 애야.' },
  { who: '마스크 쓴 여자', ch: 'rui', ex: 'surprise', text: '어? 잠깐만. 그 얼굴……' },
  { who: '마스크 쓴 여자', ch: 'rui', ex: 'surprise', text: '너, 「47초」 영상에서 무대 위에 굳어 있다가 쓰러진 사람이지?' },
  { choice: ['"사람 잘못 봤어."', '"맞아, 나야."', '(말없이 모니터 스피커 쪽으로 간다)'], ch: 'rui', ex: 'neutral', eff: [{ bond: { rui: 0 } }, { bond: { rui: 2 }, mt: -2 }, { bond: { rui: 1 }, stage: 1 }] },
  { who: '마스크 쓴 여자', ch: 'rui', ex: ['pout', 'neutral', 'surprise'], text: ['거짓말 못 하네. 목소리 떨리는데.', '그렇게 바로 인정할 줄은 몰랐어.', '뭐야, 대답도 안 하고 일부터 해?'] },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '난 아마네 루이. 다음 주 토요일 오픈 마이크에 나가는데, 아직 반주해 줄 사람이 없어.' },
  { who: '루이', ch: 'rui', ex: 'shy', text: '부탁하는 건 아니야. 자리가 비어 있다고 말한 것뿐이야.' },
  { who: '세리자와 점장', text: '반주자 구하는 거면 스피커부터 같이 고쳐. 둘이서.' },
  { text: '모니터 스피커 뒤쪽 케이블을 뽑았다가 다시 꽂는다. 생각보다 손이 먼저 움직였다.' },
  { text: '하울링이 멈추자 홀이 조용해진다. 이렇게 조용한 건 아직 조금 무섭다.', fx: 'tinnitus' },
  { who: '세리자와 점장', text: '오픈 마이크는 다음 주 토요일이야. 무대에 설지 말지는 그때까지 정해.' },
];

const S_WORK = [
  { text: '공연 네 시간 전. 무대 위에 케이블이 잔뜩 쌓여 있다.' },
  { who: '세리자와 점장', text: '감는 법 기억나? 팔꿈치에 감지 말고 손으로 원 그리면서 감아. 꼬이면 다음 사람이 고생해.' },
  { text: '한 바퀴는 바로 감고, 다음 바퀴는 뒤집어서 감는다. 손이 아직 기억하고 있다.' },
  { who: '세리자와 점장', text: '제일 깔끔하게 감는 건 여전하네.' },
  { who: '세리자와 점장', text: '나도 옛날에 밴드 했었어. 걸 펑크. 공연 도중에 줄 끊어지고, 앰프 나가고, 관객이 반이나 나간 적도 있었지.' },
  { who: '세리자와 점장', text: '그래도 다음 주에 또 무대에 섰어. 그러다 보니 여기까지 온 거고.' },
  { choice: ['"점장님은 그날 방송 봤어요?"', '"다음 케이블 주세요."'], eff: [{ stage: 1, flag: 'askedBroadcast' }, { stage: 2 }] },
  { who: '세리자와 점장', text: ['봤지. 근데 좀 이상하더라. 무대 조명은 끝까지 켜져 있었거든. 전기가 나간 건 아니었다는 얘기야. 그 얘기는 나중에 하자.', '좋아. 이 속도면 개장 시간 전에 끝나겠다.'] },
  { text: '공연이 끝나고 바닥을 닦는다. 스피커를 꺼도 홀에는 사람들 말소리가 한참 남아 있었다.' },
];

const S_STUDIO = [
  { text: '철길 고가 밑에 있는 렌탈 스튜디오. 한 시간에 1,500엔이다.' },
  { text: '1년 만에 케이스를 연다.' },
  { text: '줄은 녹이 슬었고, 손끝 굳은살도 반쯤 없어졌다.' },
  { text: '머리 위로 전철이 지나간다. 그 소리에 묻히듯 첫 음을 쳐 본다.' },
];
const S_STUDIO_AFTER = [
  { text: '중간에 몇 번 손이 멈췄지만 한 곡을 끝까지 쳤다.' },
  { text: '마지막 음이 끝나고 스튜디오가 조용해지자 또 귀가 울린다.', fx: 'tinnitus' },
  { text: '그래도 오늘은 끝까지 쳤다.' },
];

const S_REN = [
  { text: '고가 옆 작은 라멘집. 문을 열자 도마 소리가 들린다. 탁, 탁, 탁. 소리 간격이 일정하다.' },
  { who: '앞치마 두른 남자', ch: 'ren', ex: 'neutral', text: '어서 오세요. 편한 데 앉으세요.' },
  { text: '키가 문틀에 닿을 만큼 크고 인상도 험악하다. 그런데 목소리는 의외로 조용하다.' },
  { who: '앞치마 두른 남자', ch: 'ren', ex: 'neutral', text: '뭐로 드릴까요?' },
  { choice: ['"제일 잘 나가는 걸로 주세요."', '"칼질 박자가 되게 일정하네요."', '"차슈 많이 주세요."'], ch: 'ren', ex: 'neutral', eff: [{ bond: { ren: 1 } }, { bond: { ren: 2 } }, { bond: { ren: 1 }, money: -300 }] },
  { who: '앞치마 두른 남자', ch: 'ren', ex: ['neutral', 'surprise', 'laugh'], text: ['간장 라멘이요. 5분 걸려요.', '들려요? BPM 120이에요. 파는 이 속도로 썰어야 제일 고르게 썰려요.', '차슈 추가는 300엔이에요. 두 장 더 올려 드릴게요. 서비스예요.'] },
  { who: '렌', ch: 'ren', ex: 'smile', text: '쿠로사키 렌이에요. 아버지 가게라서 밤에는 제가 봐요.' },
  { who: '렌', ch: 'ren', ex: 'neutral', text: '손님, 손끝이 딱딱하시네요. 현악기 하시죠? 아니면 예전에 하셨거나.' },
  { who: '@NAME', text: '예전에요.' },
  { who: '렌', ch: 'ren', ex: 'sad', text: '저도 드럼 쳤었어요. 이번 봄까지만 하기로 했지만요.' },
  { text: '렌은 더 말하지 않고 국물을 붓는다. 그릇 내려놓는 소리까지 박자가 맞는다.' },
  { who: '렌', ch: 'ren', ex: 'smile', text: '맛있게 드세요. 또 오세요. 여기서 박자 얘기할 사람이 별로 없거든요.' },
];

const S_NATSU = [
  { text: '상점가 헌옷가게 앞. 가판대 옆에서 누가 기타를 치면서 손님을 부르고 있다.' },
  { text: 'C, G, Am까지는 괜찮은데 F만 치면 소리가 죽는다.' },
  { who: '헌옷가게 알바', ch: 'natsu', ex: 'grin', text: '어서 오세요! 오늘 청재킷 30퍼센트 할인…… 어?' },
  { who: '헌옷가게 알바', ch: 'natsu', ex: 'surprise', text: '어어? 잠깐만요. 혹시……' },
  { who: '헌옷가게 알바', ch: 'natsu', ex: 'admire', text: 'SIGNAL LOST 맞죠?! 저 그 영상 보고 기타 시작했어요!' },
  { choice: ['"그 영상을 보고 시작했다고?"', '"F 코드 칠 때 검지를 좀 더 눕혀 봐."', '"사람 잘못 봤어."'], ch: 'natsu', ex: 'admire', eff: [{ bond: { natsu: 1 }, mt: -2 }, { bond: { natsu: 2 }, tech: 1 }, { bond: { natsu: 0 } }] },
  { who: '헌옷가게 알바', ch: 'natsu', ex: ['sad', 'grin', 'pout'], text: ['네! 다들 웃긴 영상이라고 하는데, 전 그냥 소리가 좀 이상하다고 생각했거든요.', '이렇게요? 우와, 소리 났다! 선배 진짜 대박이에요!', '에이, 아니긴요. 저 그 영상 몇천 번은 봤는데요.'] },
  { who: '나츠', ch: 'natsu', ex: 'grin', text: '저 이부키 나츠예요! 고1이고, 주말마다 여기서 알바해요. 기타는 4개월 됐어요!' },
  { who: '나츠', ch: 'natsu', ex: 'shy', text: '언젠가 선배처럼 쳐 보고 싶어요. 아, 부담 가지시라는 건 아니고요!' },
  { text: '나츠가 가판대에서 피크 하나를 집어 건넨다. 「개업 기념」이라고 적힌 싸구려 피크다.' },
  { who: '나츠', ch: 'natsu', ex: 'grin', text: '또 오세요! 다음엔 F 코드 제대로 쳐 드릴게요!' },
];

const S_REI = [
  { text: '좁은 레코드샵. 중고 LP와 오래된 종이 냄새가 난다.' },
  { text: '클래식 악보 코너 앞에 누가 악보를 펼친 채 서 있다.' },
  { who: '악보를 든 여자', ch: 'rei', ex: 'annoyed', text: '저기, 발로 박자 좀 그만 세. 게다가 틀렸어. 이 곡은 3박자야.' },
  { who: '@NAME', text: '제가 박자를 세고 있었어요?' },
  { who: '악보를 든 여자', ch: 'rei', ex: 'smirk', text: '가게에서 나오는 곡에 맞춰서. 모르고 그랬다면 더 문제고.' },
  { choice: ['"미안. 버릇이라."', '"지금 나오는 곡은 4박자인데."', '(악보 제목을 슬쩍 본다)'], ch: 'rei', ex: 'annoyed', eff: [{ bond: { rei: 1 } }, { bond: { rei: 2 }, tech: 1 }, { bond: { rei: 1 } }] },
  { who: '악보를 든 여자', ch: 'rei', ex: ['neutral', 'surprise', 'annoyed'], text: ['버릇이면 고쳐. 무대에서 제일 먼저 튀어나오는 게 버릇이야.', '곡이 바뀌었네. 이번엔 네 말이 맞아.', '보지 마. 편곡 공부하는 거야. 해 봤자 크레딧에 이름도 안 남지만.'] },
  { who: '레이', ch: 'rei', ex: 'neutral', text: '시라유키 레이. 여기 단골이야. 너는 처음 보는데.' },
  { who: '레이', ch: 'rei', ex: 'smirk', text: '굳은살 위치를 보니까 현악기 했네. 요즘은 안 치나 봐.' },
  { who: '레이', ch: 'rei', ex: 'sad', text: '안 치는 사람 손은 금방 알아봐. 나도 한동안 안 쳤거든.' },
  { text: '레이는 악보를 계산대에 올려놓더니 돌아보지도 않고 가게를 나갔다.' },
];

const S_REST = [
  { text: '강변 둑길. 지난 1년 동안 제일 많이 걸은 길이다.' },
  { text: '이어폰을 빼 본다. 바람 소리, 자전거 벨 소리, 멀리서 야구부가 외치는 소리가 들린다.' },
  { text: '왼쪽 귀로도 다 들린다.' },
  { who: '@NAME', text: '(오늘은 괜찮네.)' },
];

const S_WEEKEND = [
  { text: '주말 밤. 침대에 누워 휴대폰만 보고 있다.' },
  { text: '정신을 차려 보니 PULSE 검색창에 「47초」를 치고 있었다.' },
  { text: '#47초프리즈 태그에 오늘도 누가 그 클립을 올렸다. 조회수는 아직도 올라간다.' },
  { text: 'DM 알림이 하나 왔다. 프로필 사진이 개구리다.', fx: 'buzz' },
  { who: '@kero_P', text: '갑자기 연락드려서 죄송해요. 0dB 공식 계정에 올라온 사진 봤어요. 케이블 감는 손만 나온 사진이요.' },
  { who: '@kero_P', text: '그 손 알아요. 1년 전에 맨 앞줄에서 봤거든요.' },
  { who: '@kero_P', text: '답장은 안 하셔도 돼요. 아직 거기 계신 것 같아서 반가웠어요.' },
  { choice: ['"누구세요?"', '"맨 앞줄이었으면 그날 다 봤겠네요."', '(읽기만 한다)'], eff: [{ bond: { koto: 1 } }, { bond: { koto: 2 }, mt: -2 }, { bond: { koto: 0 } }] },
  { who: '@kero_P', text: ['kero_P예요. 곡 만들어요. 개구리는 신경 쓰지 마세요.', '네, 다 봤어요. 사람들이 모르는 것까지요.', '(개구리 이모티콘)'] },
  { text: '휴대폰 화면을 끈다. 오픈 마이크는 다음 주 토요일이다.' },
];

/* ---------- where you can go in week 1 ---------- */
const SPOTS1 = [
  { id: 'work', place: '라이브하우스 0dB', tag: '¥', x: 50, y: 62, bg: ['backstage', 'stage'], sub: '알바 · 돈↑ 무대감↑ 체력↓',
    desc: '상점가 끝에 있는 지하 라이브하우스. 관객이 80명만 와도 꽉 찬다. 우리 밴드가 처음 무대에 선 곳이다.',
    script: S_WORK, eff: { money: 4000, hp: -12, stage: 3 } },
  { id: 'studio', place: 'UNDERPASS 스튜디오', tag: '練', x: 61, y: 45, bg: ['studio', 'studio_night'], sub: '혼자 연습 · 테크닉↑ 체력↓ · ¥1,500',
    desc: '철길 고가 밑에 있는 렌탈 스튜디오. 전철이 지나갈 때마다 벽이 울린다.',
    script: S_STUDIO, practice: true, eff: { tech: 6, hp: -10, money: -1500 } },
  { id: 'ren', who: 'ren', place: '멘야 도돈', tag: '麺', x: 72, y: 56, bg: ['ramen_day', 'ramen_night'], sub: '고가 옆 라멘집 · 처음 가 보는 곳',
    desc: '고가 옆 작은 라멘집. 가게 안에서 일정한 박자로 칼질 소리가 들린다.',
    script: S_REN, eff: { hp: 6, money: -900 } },
  { id: 'natsu', who: 'natsu', place: '상점가 헌옷가게', tag: '服', x: 19, y: 42, bg: ['thrift_day', 'thrift_night'], sub: '상점가 · 누가 기타 치면서 호객 중',
    desc: '헌옷가게 앞에서 누가 기타를 치며 손님을 부르고 있다. 코드를 자꾸 틀린다.',
    script: S_NATSU, eff: { mt: 3 } },
  { id: 'rei', who: 'rei', place: '레코드샵 사이드B', tag: '盤', x: 35, y: 30, bg: ['record_day', 'record_night'], sub: '중고 LP · 절판 악보',
    desc: '중고 LP와 절판 악보를 파는 좁은 가게. 클래식 코너 앞에 누가 한참 서 있다.',
    script: S_REI, eff: { tech: 2, money: -600 } },
  { id: 'rest', place: '강변 둑길', tag: '休', x: 30, y: 84, bg: ['river_day', 'river_night'], sub: '산책 · 체력·멘탈 회복',
    desc: '지난 1년 동안 제일 많이 걸은 길. 물소리를 듣고 있으면 마음이 좀 가라앉는다.',
    script: S_REST, eff: { hp: 20, mt: 6 } },
];

/* ---------- state ---------- */
const STAT_NAME = { hp: '체력', mt: '멘탈', stage: '무대감', tech: '테크닉' };
const WHO_NAME = { rui: '루이', ren: '렌', natsu: '나츠', rei: '레이', koto: 'kero_P' };
const W = {
  get g() { return SAVE.game; },
  init() {
    if (!SAVE.game) SAVE.game = { ch: 1, week: 1, slot: 0, phase: 'event', used: [], money: 8000, hp: 80, mt: 40, stage: 5, tech: 30, bond: {}, met: {}, joined: [], flags: {} };
    writeSave();
    return SAVE.game;
  },
  pend: null,
  begin() { this.pend = { d: {}, bond: {}, met: [] }; },
  /* choices and actions both land here */
  apply(e) {
    const g = this.g || this.init();
    if (!this.pend) this.begin();
    for (const k of ['hp', 'mt', 'stage', 'tech', 'money']) if (e[k]) {
      const before = g[k];
      g[k] = k === 'money' ? g[k] + e[k] : Math.max(0, Math.min(100, g[k] + e[k]));
      this.pend.d[k] = (this.pend.d[k] || 0) + (g[k] - before);
    }
    if (e.bond) for (const [id, n] of Object.entries(e.bond)) {
      if (!g.met[id]) { g.met[id] = true; this.pend.met.push(id); }
      g.bond[id] = (g.bond[id] || 0) + n;
      if (n) this.pend.bond[id] = (this.pend.bond[id] || 0) + n;
    }
    if (e.flag) g.flags[e.flag] = true;
    writeSave();
  },
  /* one popup that says what the action did */
  summary(title, fn) {
    const p = this.pend || { d: {}, bond: {}, met: [] }, g = this.g;
    const rows = Object.entries(p.d).filter(([k, v]) => v && k !== 'money').map(([k, v]) => {
      const to = g[k], from = to - v;
      return `<div class="ar-row"><span>${STAT_NAME[k]}</span><span class="ar-bar"><i style="--f:${from}%;--t:${to}%;background:${v > 0 ? 'var(--cobalt)' : 'var(--pink)'}"></i></span><b class="${v > 0 ? 'up' : 'dn'}">${v > 0 ? '+' : ''}${v}</b></div>`;
    }).join('');
    const who = [...p.met.map(id => `<div class="ar-meet">새로 만남 · <b>${WHO_NAME[id]}</b></div>`),
      ...Object.entries(p.bond).filter(([id]) => !p.met.includes(id)).map(([id, n]) => `<div class="ar-meet">${WHO_NAME[id]} 유대 <b>+${n}</b></div>`)].join('');
    const money = p.d.money ? `<div class="ar-money">${p.d.money > 0 ? '+' : '-'}¥${Math.abs(p.d.money).toLocaleString('en-US')} · 잔액 ¥${g.money.toLocaleString('en-US')}</div>` : '';
    this.pend = null;
    if (!rows && !who && !money) return fn();
    modal({ title: `<small>RESULT</small>${title}`, body: `<div class="act-res">${rows}${who}${money}</div>`, buttons: [{ t: '확인', fn }] });
    setTimeout(() => $$('.ar-bar i').forEach((i, n) => A(i, [{ width: i.style.getPropertyValue('--f') }, { width: i.style.getPropertyValue('--t') }], 700, { delay: 350 + n * 120, fill: 'forwards' })), 50);
  },
  place(s, night) { return `<b>${s.place}</b> · ${night ? '밤' : '낮'}`; },

  /* TODAY lands here: play whatever this week is waiting on */
  resume() {
    const g = this.g || this.init();
    if (g.phase === 'event') {
      this.begin();
      return adv(S_ARRIVE, { bg: 'street_night', place: '<b>0dB</b> 앞 · 월요일 저녁', next: () => this.summary('0dB 첫 출근', () => {
        g.phase = 'map'; writeSave();
        go('town', { via: 'zoom', push: false });
      }) });
    }
    if (g.phase === 'map') return go('town', { via: 'zoom', push: false });
    if (g.phase === 'weekend') {
      this.begin();
      return adv(S_WEEKEND, { bg: 'river_night', place: '<b>주말</b> · 밤', next: () => this.summary('주말 · 에고서치', () => {
        g.phase = 'end'; writeSave();
        go('card', { via: 'fade', push: false, arg: { lines: ['4월 1주 끝', '오픈 마이크까지 1주', '2주차는 다음 업데이트에서 이어집니다. 진행 상황은 저장했어요.'], long: true, next: () => { G.stack = []; go('menu', { via: 'ink', push: false }); } } });
      }) });
    }
    toast('4월 2주는 다음 업데이트에서 이어져요');
    go('menu', { via: 'ink', push: false });
  },

  doSpot(s) {
    const g = this.g, night = g.slot === 1;
    if (g.used.includes(s.id) || g.slot >= 2 || this.busy) return;   // never run the same visit twice
    this.busy = true;
    this.begin();
    const done = () => { this.apply(s.eff); this.summary(s.place, () => this.afterAction(s)); };
    if (s.practice) {
      return adv(s.script, { bg: s.bg[night ? 1 : 0], place: this.place(s, night), next: () => pickLength(SONGS[0], len => go('live', { via: 'slam', push: false, arg: {
        song: 'count4', part: G.inst || 'GT', diff: G.diff ?? 1, party: 'solo', scenario: 'practice', noFail: true, bg: s.bg[1], len,
        next: r => {
          this.apply({ mt: r.rank === 'S' || r.rank === 'SS' ? 5 : r.rank === 'A' ? 3 : 1 });
          adv(S_STUDIO_AFTER, { bg: s.bg[night ? 1 : 0], place: this.place(s, night), next: done });
        },
      } })) });
    }
    adv(s.script, { bg: s.bg[night ? 1 : 0], place: this.place(s, night), next: done });
  },
  afterAction(s) {
    const g = this.g;
    this.busy = false;
    if (!g.used.includes(s.id)) { g.used.push(s.id); g.slot++; }
    if (g.slot >= 2) { g.phase = 'weekend'; writeSave(); return this.resume(); }
    writeSave();
    go('town', { via: 'zoom', push: false });
  },
};
function applyEff(e) { W.apply(e); }
function adv(script, o) { go('adv', { via: 'fade', push: false, arg: { script, date: weekChip(), ...o } }); }

/* date chip from the real week */
function weekChip() {
  const g = SAVE.game;
  if (!g) return `<div class="datechip"><b>4월</b><span>1년 후<small>봄</small></span><i class="moon"></i><em>0dB</em></div>`;
  const slot = g.phase === 'event' ? '월요일' : g.phase === 'map' ? `행동 ${g.slot + 1}/2` : '주말';
  return `<div class="datechip"><b>4월</b><span>${g.week}주<small>${slot}</small></span><i class="moon"></i><em>OPEN MIC ${g.week === 1 ? '다음 주' : '이번 주'}</em></div>`;
}
function todayLabel() {
  const g = SAVE.game;
  if (!g) return SAVE.progress && SAVE.progress.done ? '1년 후 이야기 이어서' : '프롤로그 이어서';
  if (g.phase === 'event') return '4월 1주 · 0dB 첫 출근';
  if (g.phase === 'map') return `4월 ${g.week}주 · 남은 행동 ${2 - g.slot}번`;
  if (g.phase === 'weekend') return `4월 ${g.week}주 · 주말`;
  return '4월 1주 끝 · 2주차는 다음 업데이트에서';
}

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

/* ---------------- TOWN MAP (week 1) ---------------- */
scene('town', {
  title: '타운 맵', cls: 'tm', via: 'zoom',
  html: `<div class="tm-cam">${bgImg('map', 'tm-img')}
      ${SPOTS1.map(s => `<span class="tm-pin act" style="left:${s.x}%;top:${s.y}%"><b>${s.tag}</b></span>`).join('')}
      <span class="tm-ring"></span>
    </div>
    <div class="tm-shade"></div>${bigWord('TOWN MAP', 'tm-word')}
    <div class="tm-chip"></div>
    <div class="tm-ap">행동 <i></i><i></i></div>
    <div class="tm-card"><div class="tm-photo" data-asset="A06"></div><b class="tm-place"></b><p class="tm-desc"></p></div>
    <div class="tm-list"><div class="tm-lt">THIS WEEK · 이번 주 갈 수 있는 곳</div>${SPOTS1.map(s => `
      <div class="tm-row act" data-id="${s.id}" style="--c:var(--yellow)"><span class="av ic">${s.tag}</span>
        <span class="tx"><b>${s.place}</b><small>${s.sub}</small></span><em>${s.tag}</em></div>`).join('')}</div>
    ${backChip()}
    ${hint([['A', '가기'], ['B', '메뉴'], ['↕', '장소']], 'TOWN MAP')}`,
  init(el) {
    this.L = List($$('.tm-row', el), { loop: false, onChange: (n, r, silent) => this.focus(n, silent), onPick: () => this.key('ok') });
  },
  focus(n, silent) {
    const s = SPOTS1[n], el = this.el, cam = $('.tm-cam', el), night = SAVE.game && SAVE.game.slot === 1;
    const to = `translate(${(50 - s.x) * .55 + 12}%, ${(50 - s.y) * .5}%) scale(1.35)`;
    if (silent) cam.style.transform = to;
    else cam.animate([{ transform: getComputedStyle(cam).transform }, { transform: to }], { duration: 700 * G.K, easing: EZ.soft, fill: 'forwards' }).finished.then(() => { cam.style.transform = to; }).catch(() => {});
    const ring = $('.tm-ring', el); ring.style.left = s.x + '%'; ring.style.top = s.y + '%';
    $$('.tm-pin', el).forEach((p, i) => p.classList.toggle('on', i === n));
    $('.tm-place', el).textContent = s.place;
    $('.tm-desc', el).textContent = s.desc;
    $('.tm-photo', el).style.backgroundImage = `url(img/bg/${s.bg[night ? 1 : 0]}.webp)`;
    if (!silent) { A($('.tm-card', el), KF.fromLeft('-10%'), T.char); A(ring, [{ scale: '2.4', opacity: 0 }, { scale: '1', opacity: 1 }], 500, { e: EZ.pop, delay: 300 }); }
  },
  enter() {
    const el = this.el, g = SAVE.game || W.init();
    W.busy = false;
    $('.tm-chip', el).innerHTML = weekChip();
    $$('.tm-ap i', el).forEach((i, n) => i.classList.toggle('u', n < g.slot));
    el.classList.toggle('night', g.slot === 1);
    $$('.tm-row', el).forEach(r => {
      const used = g.used.includes(r.dataset.id), s = SPOTS1.find(x => x.id === r.dataset.id);
      r.classList.toggle('used', used);
      $('small', r).textContent = used ? '이번 주에는 이미 다녀왔어요' : s.who && g.met[s.who] ? `${WHO_NAME[s.who]}를 또 만나러 가기` : s.sub;
    });
    const first = SPOTS1.findIndex(s => !g.used.includes(s.id));
    this.L.set(Math.max(0, first), true); this.focus(this.L.i, true);
    A($('.tm-cam', el), [{ opacity: 0, scale: '1.2' }, { opacity: 1, scale: '1' }], 1000, { e: EZ.soft });
    A($('.tm-word', el), KF.fromLeft('-20%'), 900, { e: EZ.soft, delay: 200 });
    A($('.tm-chip', el), KF.fromTop('-100%'), T.char, { delay: 300 });
    A($('.tm-card', el), KF.fromLeft('-20%'), T.char, { delay: 400 });
    stagger($$('.tm-row', el), KF.fromRight('30%'), T.char, 450, 70);
    stagger($$('.tm-pin', el), KF.popIn, T.pop, 700, 80, { e: EZ.pop });
    if (!g.flags.tutWeek) {
      g.flags.tutWeek = true; writeSave();
      later(() => tutorial({ title: '한 주의 흐름', body: '한 주에 할 수 있는 <b>행동은 2번</b>이에요. 장소를 고르면 시간이 흘러요.<br>BAND와 PRACTICE(리듬 랩)는 언제 열어도 시간이 흐르지 않아요.<br>오픈 마이크는 <b>다음 주 토요일</b>이에요.' }), 1300);
    }
  },
  key(k) {
    if (k === 'up') this.L.move(-1);
    else if (k === 'down') this.L.move(1);
    else if (k === 'ok') {
      const s = SPOTS1[this.L.i], g = SAVE.game;
      if (g.used.includes(s.id)) { shake(this.L.el); toast('이번 주에는 이미 다녀왔어요'); return true; }
      confirmBox(`${s.place}에 갈까요?`, `이번 주에 남은 행동 ${2 - g.slot}번 중 1번을 써요.`, () => W.doSpot(s));
    } else if (k === 'back') go('menu', { via: 'sweepBack', push: false });
    else return undefined;
    return true;
  },
});
