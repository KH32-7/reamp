/* RE:AMP! — one year later: the call, the OP slot, and chapter 1 week 1 (town map, actions, weekend).
   State lives in SAVE.game; the menu, the save slot and the band screen read it. */
'use strict';

/* ---------- speakers met from here on ---------- */
Object.assign(SPEAKER, {
  '저장 안 된 번호': { role: 'INCOMING CALL', c: '#8FA8FF' },
  '루이': { role: 'RUI · VOCAL', c: 'var(--c-rui)', face: 'rui' },
  '가면 쓴 여자': { role: '???', c: 'var(--c-rui)' },
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
  { text: '1년 후. 4월.' },
  { text: '강변 둑길을 걷는다. 이어폰은 오른쪽에만 꽂는다.' },
  { text: '왼쪽 귀는 거의 돌아왔다. 의사는 그렇게 말했다. 다만 조용한 곳에 가면, 아직도 그날 소리가 먼저 온다.' },
  { text: '휴대폰이 떨린다. 저장되지 않은 번호.', fx: 'buzz' },
  { who: '@NAME', text: '……여보세요.' },
  { who: '저장 안 된 번호', text: '받았네. 1년 동안 문자를 몇 통 보냈는지 알아?' },
  { who: '저장 안 된 번호', text: '0dB 세리자와. 너희 첫 공연 올렸던 지하 가게. 대기실 벽에 너희 사인, 아직 그대로다.' },
  { who: '세리자와 점장', text: '인사는 됐고. 알바 하나가 갑자기 그만뒀어. 케이블 감고, 조명 켜고, 공연 끝나면 바닥 닦는 일.' },
  { who: '세리자와 점장', text: '0dB에서 알바 할래?' },
  { choice: ['"……저 이제 음악 안 해요."', '"왜 하필 저예요?"', '(대답 대신 숨만 고른다)'], eff: [{ mt: -2 }, { stage: 1 }, { mt: 1 }] },
  { who: '세리자와 점장', text: ['누가 음악 하래? 케이블 감으랬지.', '케이블을 제일 반듯하게 감던 애가 너였으니까. 그거면 충분해.', '……그 숨 고르는 소리, 1년 전 무대 위에서도 들었어.'] },
  { who: '세리자와 점장', text: '다음 주 월요일 저녁 여섯 시. 가게 문 앞에서 대답 들을게. 안 오면 안 오는 거고.' },
  { who: '@NAME', text: '저는……' },
  { text: '대답하려고 입을 연 순간, 귀 안쪽에서 가느다란 선 하나가 튄다.', fx: 'signal' },
];

const S_ARRIVE = [
  { text: '월요일 저녁 여섯 시 오 분 전.' },
  { text: '상점가 끝, 지하로 내려가는 계단. 간판 불은 반쯤 나가 있다. 「0dB」.' },
  { text: '1년 동안 이 앞을 지날 때마다 길을 건넜다.' },
  { who: '세리자와 점장', text: '오 분 일찍 왔네. 그럼 대답은 들은 걸로 칠게.' },
  { who: '@NAME', text: '아직 아무 말도 안 했는데요.' },
  { who: '세리자와 점장', text: '여기까지 걸어온 게 대답이야. 들어와. 먼지 냄새는 그대로야.' },
  { bg: 'stage', text: '지하 1층. 관객 80명이면 꽉 차는 홀. 천장 조명 몇 개가 꺼진 채 매달려 있다.' },
  { who: '세리자와 점장', text: '일은 간단해. 공연 있는 날 오후에 와서 케이블 깔고, 끝나면 걷고.' },
  { who: '세리자와 점장', text: '나머지 시간은 네 거야. 연습을 하든, 사람을 만나든, 잠만 자든.' },
  { text: '무대 쪽에서 마이크 테스트 소리가 들린다. 「아, 아.」 짧게 끊기는 목소리.' },
  { who: '세리자와 점장', text: '아, 쟤. 요즘 매주 오픈 마이크 자리를 달라고 조르는 애야.' },
  { who: '가면 쓴 여자', ch: 'rui', ex: 'neutral', text: '점장님, 모니터 스피커 또 하울링 나요. 이거 언제 고쳐요?' },
  { who: '세리자와 점장', text: '오늘 고칠 사람 왔어. 인사해. 오늘부터 알바.' },
  { who: '가면 쓴 여자', ch: 'rui', ex: 'surprise', text: '……잠깐. 그 얼굴.' },
  { who: '가면 쓴 여자', ch: 'rui', ex: 'surprise', text: '「47초」잖아. 무대 위에서 멈춰 있던 사람.' },
  { choice: ['"……사람 잘못 봤어."', '"맞아. 그 사람."', '(모니터 스피커 쪽으로 걸어간다)'], ch: 'rui', ex: 'neutral', eff: [{ bond: { rui: 0 } }, { bond: { rui: 2 }, mt: -2 }, { bond: { rui: 1 }, stage: 1 }] },
  { who: '가면 쓴 여자', ch: 'rui', ex: ['pout', 'neutral', 'surprise'], text: ['거짓말 서툴다. 목소리가 떨려.', '……그렇게 바로 인정하는 사람은 처음 봐.', '뭐야, 대답 대신 일부터 하는 거야?'] },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '아마네 루이. 다음 주 토요일 오픈 마이크에 나가. 반주는 아직 없어.' },
  { who: '루이', ch: 'rui', ex: 'shy', text: '……딱히 부탁하는 거 아니야. 그냥, 자리가 비어 있다고.' },
  { who: '세리자와 점장', text: '반주자 구하는 중이면 스피커부터 같이 고쳐. 둘 다.' },
  { text: '모니터 스피커 뒤 케이블을 하나 뽑아 다시 꽂는다. 손이 먼저 기억하고 있었다.' },
  { text: '하울링이 멎는다. 홀이 조용해진다. ……그 조용함이, 조금 무섭다.', fx: 'tinnitus' },
  { who: '세리자와 점장', text: '1주일 줄게. 오픈 마이크는 다음 주 토요일. 무대에 설지 말지는 그때까지 네가 정해.' },
];

const S_WORK = [
  { text: '공연 네 시간 전. 무대 위에 케이블 뭉치가 산처럼 쌓여 있다.' },
  { who: '세리자와 점장', text: '감는 법 기억나? 팔꿈치 말고, 손으로 원을 그려. 꼬이면 다음 사람이 운다.' },
  { text: '오버 언더. 한 바퀴는 정방향, 한 바퀴는 뒤집어서. 손이 먼저 기억한다.' },
  { who: '세리자와 점장', text: '……봐, 제일 반듯하게 감는 건 여전하네.' },
  { who: '세리자와 점장', text: '나도 옛날에 밴드 했어. 걸 펑크. 무대에서 줄 끊어지고, 앰프 터지고, 관객이 반은 나가고.' },
  { who: '세리자와 점장', text: '그래도 다음 주에 또 섰지. 무대는 망한 사람을 기억 안 해. 다시 선 사람만 기억해.' },
  { choice: ['"……점장님은 그날 방송, 봤어요?"', '"다음 케이블 주세요."'], eff: [{ stage: 1, flag: 'askedBroadcast' }, { stage: 2 }] },
  { who: '세리자와 점장', text: ['봤지. 그리고 좀 이상했어. 무대 조명은 끝까지 켜져 있었거든. 전원이 나간 게 아니었어. ……그 얘긴 나중에 하자.', '좋아. 그 속도면 오늘 개장 시간 맞추겠다.'] },
  { text: '공연이 끝나고 바닥을 닦는다. 스피커가 꺼진 홀은 생각보다 조용하지 않았다. 사람들 말소리가 남아 있었다.' },
];

const S_STUDIO = [
  { text: '철길 고가 밑 렌탈 스튜디오. 한 시간 1,500엔.' },
  { text: '케이스를 연다. 1년 만이다.' },
  { text: '줄은 녹슬어 있고, 손끝의 굳은살은 반쯤 사라졌다.' },
  { text: '전철이 머리 위를 지나간다. 그 소음에 기대서, 첫 음을 누른다.' },
];
const S_STUDIO_AFTER = [
  { text: '한 곡을 끝까지 쳤다. 중간에 몇 번 손이 멈췄지만, 끝까지.' },
  { text: '마지막 음이 울리고 조용해지는 순간이, 곡 전체보다 길었다.', fx: 'tinnitus' },
  { text: '……그래도, 끝까지.' },
];

const S_REN = [
  { text: '고가 옆 작은 라멘집. 문을 열자마자 칼질 소리가 들린다. 탁, 탁, 탁. 박자가 너무 정확하다.' },
  { who: '앞치마 두른 남자', ch: 'ren', ex: 'neutral', text: '……어서 오세요. 자리 아무 데나.' },
  { text: '키가 문틀에 닿을 것 같다. 인상은 험악한데, 말끝이 이상하게 조용하다.' },
  { who: '앞치마 두른 남자', ch: 'ren', ex: 'neutral', text: '주문은.' },
  { choice: ['"제일 잘 나가는 걸로요."', '"……칼질, 박자가 되게 정확하네요."', '"차슈 많이 주세요."'], ch: 'ren', ex: 'neutral', eff: [{ bond: { ren: 1 } }, { bond: { ren: 2 } }, { bond: { ren: 1 }, money: -300 }] },
  { who: '앞치마 두른 남자', ch: 'ren', ex: ['neutral', 'surprise', 'laugh'], text: ['간장. 5분.', '……들려요? BPM 120. 파는 이 속도로 썰어야 제일 고르게 썰려요.', '차슈 추가 300엔. ……두 장 더 얹을게요. 서비스.'] },
  { who: '렌', ch: 'ren', ex: 'smile', text: '쿠로사키 렌. 아버지 가게라서, 밤엔 제가 봐요.' },
  { who: '렌', ch: 'ren', ex: 'neutral', text: '……손님, 손가락 끝이 딱딱하네요. 현악기 하죠. 아니면, 했거나.' },
  { who: '@NAME', text: '……예전에.' },
  { who: '렌', ch: 'ren', ex: 'sad', text: '저도 예전에 드럼 쳤어요. 이번 봄까지만 치기로 했지만.' },
  { text: '렌은 더 말하지 않고 국물을 붓는다. 그릇을 내려놓는 소리까지 정박이다.' },
  { who: '렌', ch: 'ren', ex: 'smile', text: '맛있게 드세요. ……다음에 또 와요. 박자 얘기할 사람, 여기 잘 없거든요.' },
];

const S_NATSU = [
  { text: '상점가 헌옷가게 앞. 가판대 옆에서 누가 기타로 호객을 하고 있다.' },
  { text: 'C, G, Am…… F에서 매번 소리가 죽는다.' },
  { who: '헌옷가게 알바', ch: 'natsu', ex: 'grin', text: '어서 오세요~! 오늘 청재킷 30퍼센트…… 어?' },
  { who: '헌옷가게 알바', ch: 'natsu', ex: 'surprise', text: '어어? 잠깐만요. 혹시…… 설마……!' },
  { who: '헌옷가게 알바', ch: 'natsu', ex: 'admire', text: 'SIGNAL LOST! 맞죠?! 저 그 영상 보고 기타 시작했어요!' },
  { choice: ['"……그 영상이면, 기타 말고 다른 걸 배웠어야지."', '"F 코드, 검지 좀 더 눕혀 봐."', '"사람 잘못 봤어."'], ch: 'natsu', ex: 'admire', eff: [{ bond: { natsu: 1 }, mt: -2 }, { bond: { natsu: 2 }, tech: 1 }, { bond: { natsu: 0 } }] },
  { who: '헌옷가게 알바', ch: 'natsu', ex: ['sad', 'grin', 'pout'], text: ['그런 말 하지 마세요. 그 영상에서 선배, 멈춰 있었지만…… 뭔가 이상했거든요. 소리가요.', '눕혀서…… 이렇게? ……우와, 났다! 소리 났다! 선배 천재예요?!', '에이, 아니긴요. 저 그 영상 3천 번 봤는데요.'] },
  { who: '나츠', ch: 'natsu', ex: 'grin', text: '이부키 나츠! 고1이고요, 여기서 주말 알바해요. 기타는 4개월 차!' },
  { who: '나츠', ch: 'natsu', ex: 'shy', text: '저, 언젠가 선배 같은 소리 내 보고 싶어요. ……아, 부담 주려는 건 아니고요!' },
  { text: '나츠가 가판대에서 피크 하나를 집어 내민다. 「개업 기념」이라고 찍힌 싸구려 피크.' },
  { who: '나츠', ch: 'natsu', ex: 'grin', text: '또 오세요! 다음엔 F 코드 제대로 들려 드릴게요!' },
];

const S_REI = [
  { text: '좁은 레코드샵. 중고 LP 냄새와 오래된 종이 냄새.' },
  { text: '클래식 악보 코너 앞에서 누가 한 권을 펼친 채 움직이지 않는다.' },
  { who: '악보를 든 여자', ch: 'rei', ex: 'annoyed', text: '……거기, 발로 박자 세지 마. 틀렸어. 이 곡은 4분의 3박자야.' },
  { who: '@NAME', text: '……제가 박자를 세고 있었어요?' },
  { who: '악보를 든 여자', ch: 'rei', ex: 'smirk', text: '가게 스피커에서 나오는 곡에 맞춰서. 무의식이라면 더 문제고.' },
  { choice: ['"미안. 버릇이야."', '"스피커 곡은 4분의 4박자인데."', '(악보 제목을 슬쩍 본다)'], ch: 'rei', ex: 'annoyed', eff: [{ bond: { rei: 1 } }, { bond: { rei: 2 }, tech: 1 }, { bond: { rei: 1 } }] },
  { who: '악보를 든 여자', ch: 'rei', ex: ['neutral', 'surprise', 'annoyed'], text: ['버릇이면 고쳐. 버릇은 무대에서 제일 먼저 튀어나오니까.', '……지금 곡이 바뀌었네. 네 말이 맞아. 드물게.', '보지 마. 편곡 공부용이야. 크레딧에 이름 안 남는 종류의.'] },
  { who: '레이', ch: 'rei', ex: 'neutral', text: '시라유키 레이. 여기 단골이야. 너는 처음 보는 얼굴이고.' },
  { who: '레이', ch: 'rei', ex: 'smirk', text: '손가락 굳은살 위치 보니까 현악기네. 요즘은 안 치고.' },
  { who: '레이', ch: 'rei', ex: 'sad', text: '……안 치는 사람 손은 금방 알아. 나도 그랬으니까.' },
  { text: '레이는 악보를 계산대에 올려놓고, 돌아보지 않고 가게를 나간다.' },
];

const S_REST = [
  { text: '강변 둑길. 1년 동안 제일 많이 걸은 길.' },
  { text: '물소리는 괜찮다. 박자가 없으니까.' },
  { text: '이어폰을 빼 본다. 바람, 자전거 벨, 멀리서 야구부 구령.' },
  { text: '왼쪽 귀에도 전부 들린다. ……들린다.' },
  { who: '@NAME', text: '(……괜찮아. 오늘은.)' },
];

const S_WEEKEND = [
  { text: '주말 밤. 휴대폰 화면만 켜 놓고 누워 있다.' },
  { text: 'PULSE 검색창에 손가락이 멋대로 움직인다. 「47초」.' },
  { text: '#47초프리즈. 오늘도 누군가 그 클립을 다시 올렸다. 조회수는 아직도 오른다.' },
  { text: 'DM 알림 하나. 프로필 사진은…… 개구리.', fx: 'buzz' },
  { who: '@kero_P', text: '갑자기 연락드려 죄송합니다. 0dB 공식 계정에 올라온 사진 봤어요. 케이블 감는 손만 나온 거.' },
  { who: '@kero_P', text: '그 손, 알아요. 1년 전에 맨 앞줄에서 봤으니까요.' },
  { who: '@kero_P', text: '……답장은 안 하셔도 돼요. 그냥, 아직 거기 있다는 게 좋아서.' },
  { choice: ['"누구세요?"', '"……맨 앞줄이었으면, 그날 다 봤겠네요."', '(읽음 표시만 남긴다)'], eff: [{ bond: { koto: 1 } }, { bond: { koto: 2 }, mt: -2 }, { bond: { koto: 0 } }] },
  { who: '@kero_P', text: ['kero_P라고 합니다. 곡 만들어요. ……개구리는 신경 쓰지 마세요.', '네. 전부요. 사람들이 모르는 것까지.', '(……읽음. 1분 뒤, 개구리 스티커 하나가 온다.)'] },
  { text: '화면을 끈다. 다음 주 토요일, 오픈 마이크.' },
];

/* ---------- where you can go in week 1 ---------- */
const SPOTS1 = [
  { id: 'work', place: '라이브하우스 0dB', tag: '¥', x: 50, y: 62, bg: ['backstage', 'stage'], sub: '알바 · 돈 ↑ · 무대감 ↑ · 체력 ↓',
    desc: '상점가 끝 지하 1층. 관객 80명이면 꽉 찬다. 모든 게 여기서 시작됐고, 여기서 멈췄다.',
    script: S_WORK, eff: { money: 4000, hp: -12, stage: 3 } },
  { id: 'studio', place: 'UNDERPASS 스튜디오', tag: '練', x: 61, y: 45, bg: ['studio', 'studio_night'], sub: '혼자 연습 · 테크닉 ↑ · 체력 ↓ · ¥1,500',
    desc: '철길 고가 밑 렌탈 스튜디오. 전철이 지나가면 방음이 반쯤 사라진다.',
    script: S_STUDIO, practice: true, eff: { tech: 6, hp: -10, money: -1500 } },
  { id: 'ren', who: 'ren', place: '멘야 도돈', tag: '麺', x: 72, y: 56, bg: ['ramen_day', 'ramen_night'], sub: '고가 옆 라멘집 · 처음 가 보는 곳',
    desc: '고가 옆 작은 라멘집. 가게 안에서 일정한 박자로 칼질 소리가 난다.',
    script: S_REN, eff: { hp: 6, money: -900 } },
  { id: 'natsu', who: 'natsu', place: '상점가 헌옷가게', tag: '服', x: 19, y: 42, bg: ['thrift_day', 'thrift_night'], sub: '상점가 · 누가 기타로 호객 중',
    desc: '헌옷가게 앞 가판대. 누가 기타를 치며 손님을 부르고 있다. 코드가 자꾸 틀린다.',
    script: S_NATSU, eff: { mt: 3 } },
  { id: 'rei', who: 'rei', place: '레코드샵 사이드B', tag: '盤', x: 35, y: 30, bg: ['record_day', 'record_night'], sub: '중고 LP · 절판 악보',
    desc: '중고 LP와 절판 악보를 파는 좁은 가게. 클래식 코너 앞에 누가 오래 서 있다.',
    script: S_REI, eff: { tech: 2, money: -600 } },
  { id: 'rest', place: '강변 둑길', tag: '休', x: 30, y: 84, bg: ['river_day', 'river_night'], sub: '산책 · 체력 · 멘탈 회복',
    desc: '1년 동안 가장 많이 걸은 길. 물소리는 괜찮다. 박자가 없으니까.',
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
        go('card', { via: 'fade', push: false, arg: { lines: ['4월 1주 · 끝', '오픈 마이크까지 1주', '2주차는 다음 업데이트에서 이어집니다 · 진행 상황은 저장됐어요'], long: true, next: () => { G.stack = []; go('menu', { via: 'ink', push: false }); } } });
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
      return adv(s.script, { bg: s.bg[night ? 1 : 0], place: this.place(s, night), next: () => go('live', { via: 'slam', push: false, arg: {
        song: 'count4', part: G.inst || 'GT', diff: G.diff ?? 1, party: 'solo', scenario: 'practice', noFail: true, bg: s.bg[1],
        next: r => {
          this.apply({ mt: r.rank === 'S' || r.rank === 'SS' ? 5 : r.rank === 'A' ? 3 : 1 });
          adv(S_STUDIO_AFTER, { bg: s.bg[night ? 1 : 0], place: this.place(s, night), next: done });
        },
      } }) });
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
  if (!g) return SAVE.progress && SAVE.progress.done ? '1년 후 — 이야기 이어서' : '프롤로그 이어서';
  if (g.phase === 'event') return '4월 1주 · 0dB 첫 출근';
  if (g.phase === 'map') return `4월 ${g.week}주 · 남은 행동 ${2 - g.slot}번`;
  if (g.phase === 'weekend') return `4월 ${g.week}주 · 주말`;
  return '4월 1주 끝 · 2주차는 다음 업데이트에서';
}

/* ---------------- OP (placeholder until the film exists) ---------------- */
scene('op0', {
  cls: 'op0', back: false,
  html: `<div class="o0-line"></div><div class="o0-cap"><b>OPENING</b><small>OP 영상 자리 · 제작 예정</small></div><div class="o0-skip">Z · 건너뛰기</div>`,
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
      $('small', r).textContent = used ? '이번 주에 이미 다녀왔다' : s.who && g.met[s.who] ? `${WHO_NAME[s.who]} · 다시 가 보기` : s.sub;
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
      later(() => tutorial({ title: '한 주의 흐름', body: '한 주에 <b>행동은 2번</b>. 장소를 고르면 시간이 흐릅니다.<br>BAND와 PRACTICE(리듬 랩)는 언제 열어도 시간이 흐르지 않아요.<br>오픈 마이크는 <b>다음 주 토요일</b>.' }), 1300);
    }
  },
  key(k) {
    if (k === 'up') this.L.move(-1);
    else if (k === 'down') this.L.move(1);
    else if (k === 'ok') {
      const s = SPOTS1[this.L.i], g = SAVE.game;
      if (g.used.includes(s.id)) { shake(this.L.el); toast('이번 주에는 이미 다녀왔어요'); return true; }
      confirmBox(`${s.place}(으)로 갈까요?`, `이번 주 행동 ${2 - g.slot}번 중 1번을 씁니다.`, () => W.doSpot(s));
    } else if (k === 'back') go('menu', { via: 'sweepBack', push: false });
    else return undefined;
    return true;
  },
});
