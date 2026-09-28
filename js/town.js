/* RE:AMP! — TOWN (v2): no action points. The map is for the people: who's where today, their ♥ events,
   small talk, gifts (once a day each), random things that happen around town, and a few chores
   (0dB shift, ramen, the river, the shrine, band practice). "하루 끝내기" at home moves to the next day. */
'use strict';

/* ---------------- places ---------------- */
const SPOTS = [
  { id: 'odb', place: '라이브하우스 0dB', tag: '0', x: 50, y: 62, bg: ['stage', 'backstage'], open: '1-2', desc: '상점가 끝 지하 라이브하우스. 알바하는 곳이고, 모든 게 다시 시작된 곳.' },
  { id: 'studio', place: 'UNDERPASS 스튜디오', tag: '練', x: 61, y: 45, bg: ['studio', 'studio_night'], open: '1-10', desc: '철길 고가 밑 렌탈 스튜디오. 전철이 지나갈 때마다 벽이 울린다.' },
  { id: 'ramen', place: '멘야 도돈', tag: '麺', x: 72, y: 56, bg: ['ramen_day', 'ramen_night'], open: '1-4A|1-5', desc: '고가 옆 작은 라멘집. 가게 안에서 일정한 박자로 칼질 소리가 난다.' },
  { id: 'thrift', place: '상점가 헌옷가게', tag: '服', x: 19, y: 42, bg: ['thrift_day', 'thrift_night'], open: '1-4B|1-5', desc: '가판대에 청재킷이 걸린 헌옷가게. 주말이면 가게 앞에서 기타 소리가 난다.' },
  { id: 'record', place: '레코드샵 사이드B', tag: '盤', x: 35, y: 30, bg: ['record_day', 'record_night'], open: '1-4C|1-5', desc: '중고 LP와 절판 악보를 파는 좁은 가게.' },
  { id: 'shrine', place: '나기사카 신사 계단', tag: '社', x: 88, y: 22, bg: ['shrine', 'shrine_night'], open: '1-6', desc: '돌계단이 백 개가 넘는다. 올라오다 지쳐서 아무도 안 온다.' },
  { id: 'koto', place: '코토네 집 앞', tag: '蛙', x: 12, y: 18, bg: ['kotodoor_day', 'kotodoor_night'], open: g => !!g.flags.kotoDoor, desc: '주택가 끝 이층집. 우편함에 개구리 스티커가 붙어 있다.' },
  { id: 'river', place: '강변 둑길', tag: '休', x: 30, y: 84, bg: ['river_day', 'river_night'], open: '1-2', desc: '지난 1년 동안 제일 많이 걸은 길. 강물 소리가 다른 소리를 덮어 준다.' },
  { id: 'home', place: '집', tag: '家', x: 7, y: 64, bg: ['street', 'street_night'], open: '1-2', desc: '원룸. 침대 옆에 기타 케이스가 세워져 있다.' },
];
const spotOpen = (s, g) => typeof s.open === 'function' ? s.open(g) : String(s.open).split('|').some(id => !!g.ep[id]);

/* who's where (0 = 월 … 6 = 일) */
function presentAt(spot, g) {
  const dow = dateOf(g.day).dow, out = [];
  if (spot === 'ramen' && dow !== 1) out.push('ren');
  if (spot === 'thrift' && [2, 5, 6].includes(dow)) out.push('natsu');
  if (spot === 'river' && [0, 3].includes(dow) && g.ep['2-5']) out.push('natsu');
  if (spot === 'record' && [1, 3, 5].includes(dow)) out.push('rei');
  if (spot === 'studio' && dow === 4 && g.joined.includes('rei')) out.push('rei');
  if (spot === 'shrine' && [0, 2, 4].includes(dow)) out.push('rui');
  if (spot === 'odb' && dow === 5 && g.ep['1-6']) out.push('rui');
  if (spot === 'koto' && g.flags.kotoDoor) out.push('koto');
  if (spot === 'studio' && dow === 6 && g.flags.kotoStudio) out.push('koto');
  return out;
}

/* ---------------- people you haven't met yet (the shops you didn't walk into in 1-3) ---------------- */
const TEV = [
  { id: 'meet_ren', who: 'ren', spot: 'ramen', kind: 'meet', t: '처음 보는 가게', after: '1-5', need: g => !g.met.ren, script: REN_MEET, bg: 'ramen_night', place: '<b>멘야 도돈</b>' },
  { id: 'meet_natsu', who: 'natsu', spot: 'thrift', kind: 'meet', t: '가판대 앞 기타 소리', after: '1-5', need: g => !g.met.natsu, script: NATSU_MEET, bg: 'thrift_day', place: '<b>상점가 헌옷가게</b>' },
  { id: 'meet_rei', who: 'rei', spot: 'record', kind: 'meet', t: '악보 코너 앞', after: '1-5', need: g => !g.met.rei, script: REI_MEET, bg: 'record_night', place: '<b>레코드샵 사이드B</b>' },
];

/* ---------------- ♥ events ---------------- */
TEV.push(
  { id: 'rui1', who: 'rui', spot: 'shrine', kind: 'bond', t: '계단 중간', after: '1-8', lv: 1, eff: { bond: { rui: 2 }, mt: 3 }, bg: 'shrine', place: '<b>신사 계단</b> · 해 질 녘', script: S('T_RUI1', '♥ 루이 1 · 계단 중간', [
    { text: '해 질 녘, 신사 계단 중간쯤에 루이가 앉아 있다. 이어폰 한쪽을 빼고 뭔가를 흥얼거린다.' },
    { who: '루이', ch: 'rui', ex: 'surprise', text: '또 너야? 여기 아무도 안 오는 데라고 했잖아.' },
    { who: '@NAME', text: '그래서 왔어.' },
    { who: '루이', ch: 'rui', ex: 'pout', text: '말은 잘해.' },
    { text: '루이가 옆 계단을 손바닥으로 툭툭 턴다. 앉으라는 뜻인 것 같다.' },
    { who: '루이', ch: 'rui', ex: 'neutral', text: '뭐 듣냐고 안 물어봐?' },
    { choice: ['"뭐 들어?"', '"안 물어볼게."'], ch: 'rui', ex: 'neutral', eff: [{ bond: { rui: 2 } }, { bond: { rui: 3 } }] },
    { who: '루이', ch: 'rui', ex: ['shy', 'smile'], text: ['……비밀.', '그러면 더 궁금해지는 거 알아?'] },
    { text: '루이가 이어폰 한쪽을 내밀었다. 오래된 아이돌 그룹의 노래가 흘러나온다.' },
    { who: '루이', ch: 'rui', ex: 'sad', text: '웃지 마. 옛날에 좋아하던 거야.' },
    { text: '노래가 끝날 때까지 둘 다 아무 말도 하지 않았다. 해가 계단 너머로 졌다.' },
  ]) },
  { id: 'rui2', who: 'rui', spot: 'home', kind: 'bond', t: '새벽 세 시의 DM', after: '1-10', lv: 2, eff: { bond: { rui: 2 } }, bg: 'street_night', place: '<b>집</b> · 새벽 3시', script: S('T_RUI2', '♥ 루이 2 · 새벽 세 시의 DM', [
    { text: '새벽 세 시에 휴대폰 불빛 때문에 잠이 깼다.', fx: 'buzz' },
    { who: '루이', text: '자?' },
    { who: '루이', text: '아니 자겠지. 새벽 세 시니까.' },
    { who: '루이', text: '그냥, 오늘 연습 때 네가 쉼표에서 안 멈춘 거. 그 얘기 하려고.' },
    { choice: ['"안 자. 말해."', '(읽기만 하고 다시 잔다)'], eff: [{ bond: { rui: 3 }, hp: -3 }, { bond: { rui: 1 }, hp: 3 }] },
    { if: IF.p(0), who: '루이', text: '……뭐야, 진짜 안 잤어?' },
    { if: IF.p(0), who: '루이', text: '잘했다고. 그 말 하려던 거야. 낮에는 말이 잘 안 나와서.' },
    { if: IF.p(0), who: '루이', text: '이제 자. 나도 잘 거야. 아마.' },
    { if: IF.p(1), text: '다음 날 아침, 루이는 평소처럼 인사했다. 새벽 DM 얘기는 끝까지 꺼내지 않았다.' },
  ]) },
  { id: 'rui3', who: 'rui', spot: 'shrine', kind: 'bond', t: '맨 목소리 한 소절', after: '2-9', lv: 3, eff: { bond: { rui: 3 } }, bg: 'shrine_night', place: '<b>신사 계단</b> · 밤', script: S('T_RUI3', '♥ 루이 3 · 맨 목소리 한 소절', [
    { text: '밤 열 시, 신사 계단에 루이가 마스크를 무릎 위에 올려놓고 앉아 있다.' },
    { text: '이쪽을 보자마자 마스크를 집어 들었다가 그대로 멈췄다.' },
    { who: '루이', text: '……돌아서 있어.' },
    { text: '돌아서자 등 뒤에서 노래가 한 소절 들렸다. 마스크 없이 부르는 목소리는 생각보다 가늘었다.' },
    { text: '두 번째 소절에서 목소리가 끊겼다.' },
    { who: '루이', text: '……여기까지야. 아직은.' },
    { choice: ['(돌아보지 않고) "좋은 목소리야."', '"다음엔 두 소절 해."'], eff: [{ bond: { rui: 4 } }, { bond: { rui: 3 } }] },
    { who: '루이', text: ['돌아보지 마. 지금 얼굴 이상하니까.', '욕심은.'] },
    { who: '루이', ch: 'rui', ex: 'shy', text: '……가자. 늦었어.' },
    { text: '돌아봤을 때 루이는 마스크를 쓰고 있었다. 눈가가 조금 빨갰다.' },
  ]) },
  { id: 'ren1', who: 'ren', spot: 'ramen', kind: 'bond', t: '서비스 차슈', after: '1-5', lv: 1, eff: { bond: { ren: 2 }, hp: 10 }, bg: 'ramen_night', place: '<b>멘야 도돈</b> · 밤', script: S('T_REN1', '♥ 렌 1 · 서비스 차슈', [
    { text: '멘야 도돈은 오늘도 손님이 별로 없다. 렌은 카운터 안에서 국물 간을 보고 있다.' },
    { who: '렌', ch: 'ren', ex: 'smile', text: '어서 오세요. 또 오셨네요.' },
    { who: '렌', ch: 'ren', ex: 'neutral', text: '오늘은 뭐 들으면서 오셨어요? 이어폰을 늘 한쪽만 끼시던데.' },
    { choice: ['"그냥 옛날 노래요."', '"……한쪽은 좀 쉬게 하려고요."', '"라멘집에서 뭐 듣냐고 묻는 사람은 처음 봐요."'], ch: 'ren', ex: 'neutral', eff: [{ bond: { ren: 1 } }, { bond: { ren: 3 } }, { bond: { ren: 2 } }] },
    { if: IF.p(0), who: '렌', ch: 'ren', ex: 'smile', text: '옛날 노래 좋죠. 드럼을 사람이 직접 쳐서요.' },
    { if: IF.p(1), who: '렌', ch: 'ren', ex: 'neutral', text: '……그렇구나.' },
    { if: IF.p(1), text: '렌은 그 뒤로 국물을 뜰 때 국자를 냄비에 부딪히지 않았다. 소리를 줄이는 것 같았다.' },
    { if: IF.p(2), who: '렌', ch: 'ren', ex: 'laugh', text: '박자 얘기할 사람이 없어서 그래요. 다들 면만 먹고 가요.' },
    { text: '그릇 위에 차슈가 두 장 더 얹혀 있다. 주문하지 않았다.' },
    { who: '렌', ch: 'ren', ex: 'shy', text: '서비스예요. 아버지한테는 비밀로 해 주세요.' },
  ]) },
  { id: 'ren2', who: 'ren', spot: 'ramen', kind: 'bond', t: '밤 열한 시의 도마', after: '2-2', lv: 2, eff: { bond: { ren: 2 } }, bg: 'ramen_night', place: '<b>멘야 도돈</b> · 마감', script: S('T_REN2', '♥ 렌 2 · 밤 열한 시의 도마', [
    { text: '밤 열한 시, 가게 문 닫을 시간이다. 렌이 도마를 닦고 있다.' },
    { who: '렌', ch: 'ren', ex: 'neutral', text: '마감인데요. 라멘은 끝났어요.' },
    { who: '렌', ch: 'ren', ex: 'smile', text: '……그냥 앉아 계세요. 보리차는 있어요.' },
    { text: '안쪽 방에서 기침 소리가 난다. 렌이 손을 멈추고 한참 그쪽을 본다.' },
    { who: '렌', ch: 'ren', ex: 'sad', text: '아버지 기침이 밤이 되면 심해져요.' },
    { choice: ['"병원은 가 보셨어요?"', '(보리차를 마신다)'], ch: 'ren', ex: 'sad', eff: [{ bond: { ren: 2 } }, { bond: { ren: 3 } }] },
    { if: IF.p(0), who: '렌', ch: 'ren', ex: 'sad', text: '가 보시라고 계속 말씀드리는데요. 가게를 하루 닫으면 그만큼…… 아, 아니에요.' },
    { if: IF.p(1), text: '더 말을 걸지 않았다. 렌도 더 말하지 않았다. 도마 닦는 소리만 일정하게 이어졌다.' },
    { who: '렌', ch: 'ren', ex: 'shy', text: '이 시간에 누가 있으니까 좋네요. 가게가 안 조용해서요.' },
  ]) },
  { id: 'ren3', who: 'ren', spot: 'ramen', kind: 'bond', t: '말 놓기', after: '2-9', lv: 3, eff: { bond: { ren: 2 } }, bg: 'ramen_night', place: '<b>멘야 도돈</b> 뒷골목', script: S('T_REN3', '♥ 렌 3 · 말 놓기', [
    { text: '가게 뒤 골목에서 렌이 양동이를 두드리다 나무젓가락을 멈춘다.' },
    { who: '렌', ch: 'ren', ex: 'shy', text: '저기. 말 놓아도 돼요?' },
    { who: '렌', ch: 'ren', ex: 'shy', text: '나이는 제가 많은데 계속 존댓말을 하니까, 박자가 한 박씩 밀리는 느낌이라서요.' },
    { choice: ['"그래, 놓자."', '"렌이 편한 대로 해."'], ch: 'ren', ex: 'shy', eff: [{ bond: { ren: 4 }, flags: { renBanmal: true } }, { bond: { ren: 2 } }] },
    { if: IF.p(0), who: '렌', ch: 'ren', ex: 'surprise', text: '……그럼. 어, 음.' },
    { if: IF.p(0), who: '렌', ch: 'ren', ex: 'laugh', text: '안 되겠다. 입에 안 붙어요. 천천히 할게. ……할게요. 할게.' },
    { if: IF.p(1), who: '렌', ch: 'ren', ex: 'smile', text: '그럼 반반으로 할게요. 박자 맞을 때만 반말.' },
  ]) },
  { id: 'natsu1', who: 'natsu', spot: 'thrift', kind: 'bond', t: '가판대 앞 F 코드', after: '1-5', lv: 1, eff: { bond: { natsu: 2 } }, bg: 'thrift_day', place: '<b>상점가 헌옷가게</b>', script: S('T_NATSU1', '♥ 나츠 1 · 가판대 앞 F 코드', [
    { text: '헌옷가게 가판대 앞에서 나츠가 옷걸이를 정리하다가 이쪽을 보고 손을 흔든다.' },
    { who: '나츠', ch: 'natsu', ex: 'grin', text: '선배! 오늘은 뭐 사러 오셨어요? 아, 아니다. 저 보러 오셨죠?' },
    { who: '나츠', ch: 'natsu', ex: 'shy', text: '농담이에요! 근데 잠깐만요, 이거 들어 보세요.' },
    { text: '나츠가 가판대 밑에서 기타를 꺼낸다. C, G, Am을 지나 F까지 제대로 울렸다.' },
    { choice: ['"소리 났네."', '"F 다음엔 뭐 칠 거야?"'], ch: 'natsu', ex: 'grin', eff: [{ bond: { natsu: 2 } }, { bond: { natsu: 3 } }] },
    { who: '나츠', ch: 'natsu', ex: ['admire', 'neutral'], text: ['났죠! 사흘 동안 물집 잡혀 가면서 쳤어요!', '다음이요? B♭이요. 선배가 제일 싫어하는 코드라고 인터뷰에서 그랬잖아요.'] },
    { if: IF.p(1), who: '@NAME', text: '그런 인터뷰도 봤어?' },
    { if: IF.p(1), who: '나츠', ch: 'natsu', ex: 'shy', text: '……전부 봤어요. 아, 이상한 뜻은 아니고요!' },
    { who: '가게 안쪽', text: '나츠! 손님 오셨다!' },
    { who: '나츠', ch: 'natsu', ex: 'grin', text: '네에! 선배, 또 오세요! 다음엔 B♭ 들려드릴게요!' },
  ]) },
  { id: 'natsu2', who: 'natsu', spot: 'river', kind: 'bond', t: '강변 둑 연습', after: '2-5', lv: 2, eff: { bond: { natsu: 2 } }, bg: 'river_day', place: '<b>강변 둑길</b> · 해 질 녘', script: S('T_NATSU2', '♥ 나츠 2 · 강변 둑 연습', [
    { text: '해 질 녘 강변 둑에서 누가 앰프도 없이 기타를 치고 있다. 나츠다.' },
    { who: '나츠', ch: 'natsu', ex: 'surprise', text: '헉, 선배. 여기 어떻게……' },
    { who: '나츠', ch: 'natsu', ex: 'shy', text: '집에서 치면 누나가 시끄럽다고 해서요. 여기는 강물 소리가 다 덮어 줘요.' },
    { text: '나츠의 왼손 손가락 끝에 반창고가 세 개 붙어 있다.' },
    { choice: ['"반창고는 떼고 쳐. 굳은살이 늦게 생겨."', '"오늘은 그만 쳐."', '"같이 칠까?"'], ch: 'natsu', ex: 'shy', eff: [{ bond: { natsu: 2 } }, { bond: { natsu: 1 }, mmt: { natsu: 5 } }, { bond: { natsu: 4 }, hp: -3 }] },
    { if: IF.p(0), who: '나츠', ch: 'natsu', ex: 'surprise', text: '진짜요? 아파도요?' },
    { if: IF.p(0), who: '@NAME', text: '아파도.' },
    { if: IF.p(0), who: '나츠', ch: 'natsu', ex: 'grin', text: '선배도 그렇게 해서 굳은살 생긴 거죠? 그럼 저도 할래요.' },
    { if: IF.p(1), who: '나츠', ch: 'natsu', ex: 'pout', text: '에이, 조금만 더요. 해 지기 전까지만요.' },
    { if: IF.p(2), text: '나츠 옆에 앉아 기타를 받아 들었다. 강물 소리에 둘의 코드가 섞였다. 나츠는 한 박 빨랐지만 끝까지 따라왔다.' },
    { if: IF.p(2), who: '나츠', ch: 'natsu', ex: 'admire', text: '……이거 평생 자랑할 거예요.' },
  ]) },
  { id: 'natsu3', who: 'natsu', spot: 'thrift', kind: 'bond', t: '서랍 속 휴대폰', after: '2-9', lv: 3, eff: { bond: { natsu: 2 } }, bg: 'thrift_night', place: '<b>헌옷가게</b> 창고', script: S('T_NATSU3', '♥ 나츠 3 · 서랍 속 휴대폰', [
    { text: '헌옷가게 창고에서 나츠가 상자 사이에 있던 오래된 휴대폰을 꺼냈다.' },
    { who: '나츠', ch: 'natsu', ex: 'neutral', text: '선배, 이거 작년 여름에 쓰던 폰이에요. 배터리가 나가서 서랍에 넣어 뒀었는데요.' },
    { who: '나츠', ch: 'natsu', ex: 'sad', text: '페스 전날 리허설을 펜스 밖에서 녹음한 게 여기 있어요.' },
    { who: '나츠', ch: 'natsu', ex: 'sad', text: '한 번도 안 들어 봤어요. 다음 날 그렇게 되고 나서는 듣기가 무서워서요.' },
    { choice: ['"같이 들어 볼래?"', '"듣고 싶어질 때 들어."'], ch: 'natsu', ex: 'sad', eff: [{ bond: { natsu: 3 }, flags: { natsuPhone: 'try' } }, { bond: { natsu: 3 }, flags: { natsuPhone: 'wait' } }] },
    { if: IF.p(0), text: '충전기를 꽂았다. 화면이 켜지지 않는다. 몇 번을 눌러도 까만 화면 그대로다.' },
    { if: IF.p(0), who: '나츠', ch: 'natsu', ex: 'pout', text: '고장 났나 봐요. 수리점에 맡겨 볼게요.' },
    { if: IF.p(1), who: '나츠', ch: 'natsu', ex: 'shy', text: '……네. 그럼 들을 때는 선배 옆에서 들을게요.' },
    { text: '나츠는 휴대폰을 수건으로 싸서 앞치마 주머니에 넣었다.' },
  ]) },
  { id: 'rei1', who: 'rei', spot: 'record', kind: 'bond', t: '7박자', after: '1-5', lv: 1, eff: { bond: { rei: 2 } }, bg: 'record_day', place: '<b>레코드샵 사이드B</b>', script: S('T_REI1', '♥ 레이 1 · 7박자', [
    { text: '레코드샵 사이드B에 들어서자 레이가 LP를 한 장 들고 이쪽을 돌아봤다.' },
    { who: '레이', ch: 'rei', ex: 'neutral', text: '또 왔네. 오늘은 발 가만히 있어?' },
    { who: '레이', ch: 'rei', ex: 'smirk', text: '이거 들어 봐. 7박자야. 세 봐.' },
    { text: '가게 스피커에서 곡이 흐른다. 하나, 둘, 셋, 넷……' },
    { choice: ['"3하고 4로 나눠서 세면 돼?"', '"2, 2, 3이지?"', '"못 세겠어."'], ch: 'rei', ex: 'smirk', eff: [{ bond: { rei: 2 } }, { bond: { rei: 3 } }, { bond: { rei: 1 } }] },
    { who: '레이', ch: 'rei', ex: ['neutral', 'surprise', 'smirk'], text: ['그것도 방법이야. 틀리진 않았어.', '……맞아. 한 번 듣고 바로 맞힌 사람은 처음이야.', '솔직해서 좋네. 아는 척하는 사람보다 훨씬 나아.'] },
    { who: '레이', ch: 'rei', ex: 'neutral', text: '다음엔 5박자 가져올게. 도망가지 마.' },
  ]) },
  { id: 'rei2', who: 'rei', spot: 'record', kind: 'bond', t: '음대 앞 정류장', after: '2-2', lv: 2, eff: { bond: { rei: 2 } }, bg: 'street', place: '<b>버스 정류장</b> · 나기사카 음대 앞', script: S('T_REI2', '♥ 레이 2 · 음대 앞 정류장', [
    { text: '버스 정류장 벤치에 레이가 앉아 있다. 정류장 이름은 「나기사카 음대 앞」이다.' },
    { who: '레이', ch: 'rei', ex: 'surprise', text: '……왜 여기 있어.' },
    { who: '@NAME', text: '지나가다가. 너는?' },
    { who: '레이', ch: 'rei', ex: 'neutral', text: '버릇. 2년 동안 여기서 내렸거든. 지금도 가끔 이 정류장에서 내려.' },
    { who: '레이', ch: 'rei', ex: 'sad', text: '자퇴한 학교 앞에서 내리는 거, 이상하지.' },
    { choice: ['"안 이상해."', '"왜 그만뒀어?"'], ch: 'rei', ex: 'sad', eff: [{ bond: { rei: 3 } }, { bond: { rei: 1 } }] },
    { if: IF.p(0), who: '레이', ch: 'rei', ex: 'shy', text: '……안 이상하다고 해 준 사람은 처음이야.' },
    { if: IF.p(1), who: '레이', ch: 'rei', ex: 'annoyed', text: '묻지 마. 아직은.' },
    { if: IF.p(1), who: '레이', ch: 'rei', ex: 'neutral', text: '……미안. 말투가 원래 이래. 언젠가 말할게.' },
    { text: '버스가 왔다. 레이는 타지 않고 버스가 떠나는 걸 지켜봤다.' },
    { who: '레이', ch: 'rei', ex: 'neutral', text: '걸어가자. 한 정거장이니까.' },
  ]) },
  { id: 'rei3', who: 'rei', spot: 'record', kind: 'bond', t: '한 박도 안 되는 시간', after: '2-9', lv: 3, need: g => Object.values(g.clears).some(r => RANK_N[r] >= 4), needT: 'LIVE에서 S 랭크', eff: { bond: { rei: 3 } }, bg: 'record_night', place: '<b>레코드샵 사이드B</b>', script: S('T_REI3', '♥ 레이 3 · 한 박도 안 되는 시간', [
    { text: '레코드샵에서 레이가 휴대폰으로 뭔가를 보고 있다. 화면을 보니 우리 공연 기록이다.' },
    { who: '레이', ch: 'rei', ex: 'neutral', text: 'S 랭크 받았더라.' },
    { who: '레이', ch: 'rei', ex: 'annoyed', text: '……박자 흔들린 데가 한 군데도 없었어.' },
    { text: '레이가 휴대폰을 내렸다. 입꼬리가 아주 조금 올라가 있다.' },
    { who: '레이', ch: 'rei', ex: 'smile', text: '잘했어.' },
    { text: '그 말을 하고 레이는 바로 표정을 되돌렸다. 한 박도 안 되는 시간이었다.' },
    { choice: ['"방금 웃었어?"', '(못 본 척한다)'], ch: 'rei', ex: 'neutral', eff: [{ bond: { rei: 3 } }, { bond: { rei: 4 } }] },
    { if: IF.p(0), who: '레이', ch: 'rei', ex: 'annoyed', text: '안 웃었어. 잘못 봤겠지.' },
    { if: IF.p(1), who: '레이', ch: 'rei', ex: 'shy', text: '……봤으면서.' },
  ]) },
  { id: 'koto1', who: 'koto', spot: 'home', kind: 'bond', t: '새벽에 온 파일', after: '1-5', need: g => !!g.flags.kotoReply || g.ep['2-3B'], eff: { bond: { koto: 2 } }, bg: 'street_night', place: '<b>집</b> · 밤', script: S('T_KOTO1', '♥ 코토 1 · 새벽에 온 파일', [
    { text: '밤에 침대에 누워 있는데 DM이 왔다.', fx: 'buzz' },
    { who: '@kero_P', text: '주무세요?' },
    { who: '@kero_P', text: '곡 하나 다 만들었는데, 들어 줄 사람이 없어서요. 들어 주시면 좋고, 아니면 말고요.' },
    { text: '링크를 누른다. 3분짜리 곡이다. 가사는 없고 베이스와 신스뿐이다.' },
    { text: '2분쯤에서 모든 소리가 한 마디 동안 끊겼다가 다시 들어온다.' },
    { choice: ['"2분쯤에 끊기는 데, 일부러 그런 거야?"', '"좋아. 계속 만들어 줘."', '(개구리 이모티콘을 보낸다)'], eff: [{ bond: { koto: 3 } }, { bond: { koto: 2 } }, { bond: { koto: 2 } }] },
    { who: '@kero_P', text: ['네. 조용한 데가 있어야 다음 소리가 크게 들려서요.', '……계속이요? 네. 계속할게요.', '(개구리 이모티콘)(개구리 이모티콘)'] },
    { if: IF.p(0), who: '@kero_P', text: '혹시 그런 거 싫으세요? 조용한 데요.' },
    { if: IF.p(0), text: '싫다고 쓰려다가 지웠다. "괜찮아"라고 보냈다.' },
  ]) },
  { id: 'koto2', who: 'koto', spot: 'odb', kind: 'bond', t: '개구리 택배', after: '2-4B|2-4A|2-4C', lv: 2, eff: { bond: { koto: 2 } }, bg: 'stage', place: '<b>0dB</b> 카운터', script: S('T_KOTO2', '♥ 코토 2 · 개구리 택배', [
    { text: '0dB에 출근하자 점장이 카운터 밑에서 작은 상자를 꺼냈다.' },
    { who: '세리자와 점장', text: '너 앞으로 택배 왔어. 보낸 사람 이름 칸에 개구리 그림만 있네.' },
    { text: '상자 안에 개구리 모양 이어폰 케이스와 쪽지가 들어 있다.' },
    { text: '「이어폰을 늘 한쪽만 끼고 다니시길래요. 남은 한쪽은 여기 넣어 두세요.」' },
    { who: '@kero_P', text: '받으셨어요? 이상하면 버리셔도 돼요.' },
    { choice: ['"안 버려. 고마워."', '"한쪽만 끼는 건 어떻게 알았어?"'], eff: [{ bond: { koto: 3 } }, { bond: { koto: 2 } }] },
    { if: IF.p(0), who: '@kero_P', text: '(개구리 이모티콘) 다행이다.' },
    { if: IF.p(1), who: '@kero_P', text: '0dB 사진 계정에 가끔 나오시잖아요. 늘 오른쪽만 끼고 계세요.' },
    { if: IF.p(1), who: '@kero_P', text: '……이런 거 다 보고 있으면 좀 무섭죠. 죄송해요.' },
  ]) },
  { id: 'koto3', who: 'koto', spot: 'koto', kind: 'bond', t: '직캠 폴더', after: '2-9', lv: 3, eff: { bond: { koto: 3 } }, bg: 'kotodoor_night', place: '<b>코토네 집 앞</b> · 밤', script: S('T_KOTO3', '♥ 코토 3 · 직캠 폴더', [
    { text: '코토네 집 앞에 오니 이층 창문에 불이 켜져 있다. DM이 왔는데, 평소보다 긴 메시지다.' },
    { who: '@kero_P', text: '말씀드릴 게 있어요. 근데 아직 다는 못 해요.' },
    { who: '@kero_P', text: '1년 전 그날, 맨 앞줄에서 영상 찍었어요. 처음부터 끝까지요.' },
    { who: '@kero_P', text: '인터넷에 도는 거랑은 달라요. 제 영상에는 소리가 있어요.' },
    { who: '@kero_P', text: '근데 아직은 못 보여 드려요. 제가 그걸 다시 볼 자신이 없어서요.' },
    { choice: ['"보여 줄 수 있을 때 보여 줘."', '"……소리가 있다는 게 무슨 뜻이야?"'], eff: [{ bond: { koto: 4 }, flags: { kotoVideo: 'wait' } }, { bond: { koto: 2 }, mt: -3, flags: { kotoVideo: 'ask' } }] },
    { if: IF.p(0), who: '@kero_P', text: '네. 그때는 제일 먼저 보여 드릴게요.' },
    { if: IF.p(1), who: '@kero_P', text: '그날 스피커가 꺼진 뒤에도 소리가 있었다는 뜻이에요.' },
    { if: IF.p(1), who: '@kero_P', text: '오늘은 여기까지만요. 죄송해요.' },
    { text: '창문의 불이 꺼졌다. 대화창에는 개구리 이모티콘 하나가 마지막으로 남았다.' },
  ]) },
  // the owner
  { id: 'sz1', who: 'serizawa', spot: 'odb', kind: 'sp', t: '문 닫은 뒤의 캔 두 개', after: '1-8', eff: {}, bg: 'backstage', place: '<b>0dB</b> · 문 닫은 뒤', script: S('T_SZ1', '점장 1 · 문 닫은 뒤의 캔 두 개', [
    { text: '문 닫은 0dB에서 점장이 카운터에 맥주 하나와 탄산음료 하나를 올려놓았다.' },
    { who: '세리자와 점장', text: '넌 이거. 내일도 알바니까.' },
    { who: '세리자와 점장', text: '오픈 마이크 어땠어. 무대 위에서.' },
    { choice: ['"무서웠어요."', '"……좋았어요."', '"잘 모르겠어요."'], eff: [{ mt: 3 }, { mt: 4 }, { mt: 2 }] },
    { who: '세리자와 점장', text: ['그래. 무서운 걸 무섭다고 말하는 게 제일 어려워.', '그 말 들으려고 1년 동안 문자 보낸 거야.', '모르는 게 정상이야. 알게 되면 재미없어.'] },
    { who: '세리자와 점장', text: '귀는 좀 어때.' },
    { text: '캔을 쥔 손이 멈췄다. 점장은 이쪽을 보지 않고 맥주를 마셨다.' },
    { choice: ['"……괜찮아요."', '"사실 가끔 울려요."'], eff: [{}, { mt: 5, flags: { toldSerizawa: true } }] },
    { if: IF.p(0), who: '세리자와 점장', text: '그래. 그럼 안 괜찮을 때 말해.' },
    { if: IF.p(1), who: '세리자와 점장', text: '……말해 줘서 고마워. 네 모니터는 좀 줄여 둘게. 다른 사람한테는 말 안 해.' },
  ]) },
  { id: 'sz2', who: 'serizawa', spot: 'odb', kind: 'sp', t: '지우지 말아 달라는 사인', after: '2-9', eff: {}, bg: 'backstage', place: '<b>0dB</b> 대기실 · 개장 전', script: S('T_SZ2', '점장 2 · 지우지 말아 달라는 사인', [
    { text: '개장 전, 점장이 대기실 벽의 사인을 걸레로 닦고 있다. SIGNAL LOST 사인만 피해서 닦는다.' },
    { who: '@NAME', text: '그건 안 닦아요?' },
    { who: '세리자와 점장', text: '이건 지우지 말라는 부탁을 받았거든.' },
    { who: '@NAME', text: '누가요?' },
    { who: '세리자와 점장', text: '…….' },
    { who: '세리자와 점장', text: '작년 겨울에 하루가 왔었어. 가게 문 닫은 밤에. 이 벽 앞에 한참 서 있다가, 이거 지우지 말아 달라고 하고 갔어.' },
    { text: '벽에 적힌 하루의 이름을 본다. 하루는 네 명 중에 이름을 제일 크게 썼다.', eff: { mt: -3 } },
    { choice: ['"……다른 말은 없었어요?"', '(아무 말도 하지 않는다)'], eff: [{ flags: { szHaru: true } }, {}] },
    { if: IF.p(0), who: '세리자와 점장', text: '"걔한테는 말하지 마세요." 그게 다야. 그 약속은 방금 깼고.' },
    { if: IF.p(1), text: '점장은 걸레를 헹구러 나갔다. SIGNAL LOST 사인은 그대로 남았다.' },
  ]) },
);

/* ---------------- random things around town (each happens once) ---------------- */
const RND = [
  { id: 'r_girls', spots: ['thrift', 'record'], t: '알아본 사람', after: '1-5', bg: 'street', script: S('R_GIRLS', '랜덤 · 알아본 사람', [
    { text: '상점가 입구에서 교복 입은 여고생 둘이 이쪽을 보며 수군거린다.' },
    { who: '여고생', text: '저 사람 그 47초……' },
    { who: '여고생', text: '야, 다 들려.' },
    { choice: ['"맞아요, 나예요."', '(못 들은 척 지나간다)', '(이어폰을 양쪽에 낀다)'], eff: [{ mt: -2, fans: 10 }, { mt: -1 }, { mt: -4 }] },
    { if: IF.p(0), who: '여고생', text: '헉, 죄송해요! 저희 0dB 영상 봤어요! 이번엔 안 멈추던데요!' },
    { if: IF.p(0), text: '둘은 꾸벅 인사하고 도망치듯 뛰어갔다. 나쁜 뜻은 아니었던 것 같다.' },
    { if: IF.p(1), text: '등 뒤에서 웃음소리가 들렸다. 무슨 웃음인지는 모르겠다.' },
    { if: IF.p(2), text: '양쪽 이어폰에서 음악이 크게 흘렀다. 왼쪽 귀가 조금 아팠다.' },
  ]) },
  { id: 'r_recorder', spots: ['river'], t: '리코더 합주', after: '1-2', bg: 'river_day', script: S('R_RECORDER', '랜덤 · 리코더 합주', [
    { text: '강변 둑에서 초등학생 셋이 리코더 합주를 연습하고 있다. 셋이 전부 다른 박자다.' },
    { choice: ['(손뼉으로 박자를 쳐 준다)', '(지나간다)'], eff: [{ mt: 5 }, {}] },
    { if: IF.p(0), text: '손뼉을 치자 아이들이 이쪽을 봤다. 하나, 둘, 셋, 넷. 두 번째 마디부터 셋이 맞기 시작했다.' },
    { if: IF.p(0), text: '끝나고 아이들이 박수를 쳤다. 누구한테 치는 박수인지는 몰라도 기분은 좋았다.' },
    { if: IF.p(1), text: '등 뒤로 어긋난 리코더 소리가 멀어진다. 조금 아쉬웠다.' },
  ]) },
  { id: 'r_pizza', spots: ['odb'], t: '남은 피자', after: '1-2', bg: 'backstage', script: S('R_PIZZA', '랜덤 · 남은 피자', [
    { text: '0dB 대기실에 오늘 공연한 밴드가 피자 두 판을 남기고 갔다.' },
    { who: '세리자와 점장', text: '버리기 아까우니까 먹어. 식었어도 피자는 피자야.' },
    { text: '식은 피자는 생각보다 맛있었다.', eff: { hp: 10 } },
  ]) },
  { id: 'r_train', spots: ['studio', 'ramen'], t: '고가 밑', after: '1-2', bg: 'studio_night', script: S('R_TRAIN', '랜덤 · 고가 밑', [
    { text: '고가 밑에 서 있는데 머리 위로 전철이 지나간다. 쇠 긁히는 소리가 길게 이어진다.' },
    { text: '소리가 지나가고 난 뒤에도 귀 안쪽이 계속 울린다.', fx: 'tinnitus' },
    { choice: ['(오른쪽 이어폰으로 음악을 튼다)', '(울림이 멎을 때까지 가만히 서 있는다)'], eff: [{ mt: -2 }, { mt: -3 }] },
    { text: ['음악을 틀자 울림이 조금 덜 들렸다.', '30초쯤 지나자 울림이 멎었다. 30초가 길었다.'] },
  ]) },
  { id: 'r_rain', spots: ['thrift'], t: '소나기', after: '1-5', bg: 'street', script: S('R_RAIN', '랜덤 · 소나기', [
    { text: '상점가를 걷는데 갑자기 소나기가 쏟아진다.' },
    { if: IF.m('natsu'), who: '나츠', ch: 'natsu', ex: 'grin', text: '선배! 이거 쓰세요! 가게 우산이에요. 분실물이긴 하지만요!' },
    { if: IF.m('natsu'), text: '나츠가 투명 우산을 쥐여 주고 가게로 뛰어 들어갔다.', eff: { bond: { natsu: 1 } } },
    { if: IF.not(IF.m('natsu')), choice: ['(편의점에서 우산을 산다)', '(그냥 뛴다)'], eff: [{ money: -500 }, { hp: -5 }] },
    { if: IF.all(IF.not(IF.m('natsu')), IF.p(1)), text: '0dB까지 뛰었다. 신발 안까지 다 젖었다.' },
  ]) },
  { id: 'r_cd', spots: ['record'], t: '100엔 박스', after: '1-5', bg: 'record_day', script: S('R_CD', '랜덤 · 100엔 박스', [
    { text: '레코드샵 앞 100엔 박스를 보니 먼지 쌓인 CD 사이에 낯익은 재킷이 있다.' },
    { text: 'SIGNAL LOST 데모 CD다. 첫 공연 날 0dB에서 50장 찍어서 팔았던 거다. 누가 여기 팔았나 보다.' },
    { choice: ['(100엔을 내고 산다)', '(그대로 둔다)'], eff: [{ money: -100, mt: 2 }, { mt: -1 }] },
    { if: IF.p(0), text: '재킷 안쪽에 네 명의 사인이 있다. 하루의 이름이 제일 크다.' },
    { if: IF.p(1), text: 'CD를 박스 맨 아래로 밀어 넣었다. 누가 사 가면 좋겠다는 생각이 조금은 들었다.' },
  ]) },
  { id: 'r_sit', spots: ['odb'], t: '대타 드러머', after: '1-8', bg: 'stage', script: S('R_SIT', '랜덤 · 대타 드러머', [
    { text: '개장 30분 전인데 오늘 나오는 밴드의 드러머가 안 왔다. 전화도 안 받는다고 한다.' },
    { who: '세리자와 점장', text: '……너 드럼 치지?' },
    { choice: ['"한 곡만이요."', '"오늘은 못 해요."'], eff: [{ money: 3000, fans: 40, hp: -8, mt: 3 }, {}] },
    { if: IF.p(0), text: '처음 보는 밴드와 처음 듣는 곡을 쳤다. 악보는 드럼 옆에 테이프로 붙였다.' },
    { if: IF.p(0), text: '끝나고 그 밴드 보컬이 몇 번이나 고개를 숙였다. 점장은 대타비를 봉투에 넣어 줬다.' },
    { if: IF.p(1), text: '점장은 다른 데 전화를 돌렸다. 공연은 30분 늦게 시작했다.' },
  ]) },
  { id: 'r_omikuji', spots: ['shrine'], t: '오미쿠지', after: '1-6', bg: 'shrine', script: S('R_OMIKUJI', '랜덤 · 오미쿠지', [
    { text: '신사 앞에 오미쿠지 상자가 있다. 한 번에 100엔이다.' },
    { choice: ['(뽑는다)', '(안 뽑는다)'], eff: [{ money: -100 }, {}] },
    { if: IF.all(IF.p(0), g => g.day % 3 === 0), text: '대길이 나왔다. 「기다리던 사람이 온다」라고 적혀 있다.', eff: { mt: 6 } },
    { if: IF.all(IF.p(0), g => g.day % 3 === 1), text: '길이 나왔다. 「서두르지 말 것」이라고 적혀 있다.', eff: { mt: 2 } },
    { if: IF.all(IF.p(0), g => g.day % 3 === 2), text: '흉이 나왔다. 「소리를 조심할 것」이라고 적혀 있다. 종이는 나뭇가지에 묶고 왔다.', eff: { mt: -1 } },
    { if: IF.p(1), text: '100엔이면 탄산수를 반 캔 살 수 있다. 그냥 내려왔다.' },
  ]) },
  { id: 'r_busk', spots: ['thrift', 'river'], t: '줄 끊어진 버스커', after: '1-8', bg: 'street', script: S('R_BUSK', '랜덤 · 줄 끊어진 버스커', [
    { text: '상점가 광장에서 대학생쯤 돼 보이는 사람이 버스킹을 하고 있다. 기타 줄 하나가 끊어져 있다.' },
    { text: '다섯 줄로 버티고 있는데 코드가 자꾸 비어서 들린다.' },
    { choice: ['(가방에서 여분 줄을 꺼내 건넨다)', '(동전을 넣고 간다)', '(지나간다)'], eff: [{ fans: 20, mt: 3 }, { money: -100, mt: 1 }, {}] },
    { if: IF.p(0), text: '줄을 갈아 주자 그 사람이 한 곡을 더 불렀다. 끝나고 "혹시 0dB에서……" 하고 물었다. 고개만 끄덕였다.' },
    { if: IF.p(1), text: '동전 소리에 그 사람이 고개를 숙였다. 끊어진 줄은 그대로였다.' },
    { if: IF.p(2), text: '광장을 빠져나올 때까지 줄 하나 빠진 기타 소리가 계속 들렸다.' },
  ]) },
  { id: 'r_pick', spots: ['river'], t: '풀밭의 피크', after: '1-5', bg: 'river_day', script: S('R_PICK', '랜덤 · 풀밭의 피크', [
    { text: '강변 둑 풀밭에서 뭔가 반짝인다. 기타 피크다. 「개업 기념」이라고 적혀 있다.' },
    { if: IF.m('natsu'), text: '헌옷가게 가판대에서 파는 그 싸구려 피크다. 나츠가 떨어뜨렸을지도 모른다.' },
    { text: '주머니에 넣었다. 언젠가 쓸 일이 있을 거다.', eff: { mt: 2 } },
  ]) },
  { id: 'r_reup', spots: ['home'], t: '#47초프리즈', after: '1-5', bg: 'street_night', script: S('R_REUP', '랜덤 · #47초프리즈', [
    { text: '밤에 PULSE 알림이 떴다. #47초프리즈 태그가 또 트렌드에 올라왔다.', fx: 'buzz' },
    { text: '누가 그 클립에 새 효과음을 붙여 다시 올렸다. 조회수가 무섭게 올라간다.' },
    { choice: ['(댓글을 읽는다)', '(태그를 뮤트한다)', '(0dB 공연 영상을 대신 튼다)'], need: [null, null, g => !!g.ep['2-6']], needT: ['', '', '아직 올라온 공연 영상이 없다'], eff: [{ mt: -8 }, { mt: -2 }, { mt: 4 }] },
    { text: ['읽지 말걸 그랬다.', '뮤트 버튼을 누르고 휴대폰을 뒤집었다.', '객석 맨 뒤에서 찍은 흔들리는 영상을 틀었다. 거기서는 멈추지 않았다.'] },
  ]) },
  { id: 'r_poster', spots: ['thrift'], t: '게시판의 포스터', after: '3-1', bg: 'street', script: S('R_POSTER', '랜덤 · 게시판의 포스터', [
    { text: '상점가 게시판에 ECLIPSE 여름 투어 포스터가 새로 붙었다.' },
    { text: '네 명 중 하나가 하루다. 머리가 짧아졌다.', eff: { mt: -4 } },
    { choice: ['(포스터를 한참 본다)', '(지나간다)'], eff: [{}, { mt: 1 }] },
    { if: IF.p(0), text: '하루 얼굴 옆에 누가 매직으로 「배신자」라고 써 놓았다. 손가락으로 문질러 봤다. 지워지지 않았다.' },
    { if: IF.p(1), text: '포스터 앞을 지나쳤다. 세 걸음쯤 가서 한 번 돌아봤다.' },
  ]) },
  { id: 'r_dad', spots: ['ramen'], t: '렌 아버지', after: '2-3A|2-4A|3-1', need: g => !!g.met.ren, bg: 'ramen_night', script: S('R_DAD', '랜덤 · 렌 아버지', [
    { text: '멘야 도돈에 가니 오늘은 렌 대신 나이 든 남자가 카운터에 서 있다.' },
    { who: '렌 아버지', text: '렌 친구지? 걔 오늘 배달 갔어.' },
    { who: '렌 아버지', text: '걔가 요즘 밤마다 뭘 두드려. 양동이인지 뭔지.' },
    { who: '렌 아버지', text: '그 소리 들으면 잠이 잘 와. 걔한테는 말하지 마라.' },
    { text: '라멘 위에 차슈가 한 장 더 얹혀 있었다. 이 집 서비스는 아버지한테 배운 거였나 보다.', eff: { hp: 10, bond: { ren: 1 } } },
  ]) },
];

/* ---------------- small talk (♥+1 the first time each day) ---------------- */
const TALK = {
  rui: [
    [{ who: '루이', ch: 'rui', ex: 'neutral', text: '왜. 할 말 있어?' }, { who: '@NAME', text: '그냥 지나가다가.' }, { who: '루이', ch: 'rui', ex: 'pout', text: '그냥 지나가다가 이 계단을 올라와? 백 개가 넘는데.' }],
    [{ text: '루이가 탄산수를 마시다가 캔을 흔들어 보인다.' }, { who: '루이', ch: 'rui', ex: 'neutral', text: '레몬 맛이 제일 나아. 다른 건 너무 달아.' }],
    [{ who: '루이', ch: 'rui', ex: 'shy', text: '어제 연습 녹음 들어 봤어. 네 기타, 나쁘지 않더라.' }, { who: '루이', ch: 'rui', ex: 'pout', text: '칭찬 아니야. 사실이야.' }],
    [{ who: '루이', ch: 'rui', ex: 'neutral', text: '편의점 새벽 알바하는 애가 나를 알아. 마스크 쓴 탄산수 손님이래.' }, { who: '루이', ch: 'rui', ex: 'pout', text: '그 별명 싫어.' }],
    [{ lv: 3, who: '루이', ch: 'rui', ex: 'smile', text: '요즘은 계단 올라오는 발소리만 들어도 너인지 알아.' }, { who: '루이', ch: 'rui', ex: 'shy', text: '……박자가 일정해서. 그뿐이야.' }],
  ],
  ren: [
    [{ who: '렌', ch: 'ren', ex: 'smile', text: '오셨어요. 오늘 국물 잘 나왔어요. 끓는 소리로 알아요.' }],
    [{ who: '렌', ch: 'ren', ex: 'neutral', text: '주문 들어오는 BPM이 있어요. 손님 많은 날은 160, 오늘은 60쯤.' }, { who: '렌', ch: 'ren', ex: 'laugh', text: '한가하다는 뜻이에요.' }],
    [{ text: '렌이 가게 스피커에서 나오는 곡에 딱 맞춰 나무젓가락으로 카운터를 톡톡 친다.' }, { who: '렌', ch: 'ren', ex: 'shy', text: '아, 버릇이에요. 신경 쓰지 마세요.' }],
    [{ who: '렌', ch: 'ren', ex: 'neutral', text: '새벽 시장은 다섯 시에 열어요. 그 시간이 제일 조용해요.' }],
    [{ lv: 3, who: '렌', ch: 'ren', ex: 'shy', text: '요즘 스틱을 앞치마 주머니에 넣고 다녀요.' }, { who: '렌', ch: 'ren', ex: 'smile', text: '쉬는 시간에 무릎 치려고요. 들키면 아버지한테 혼나요.' }],
  ],
  natsu: [
    [{ who: '나츠', ch: 'natsu', ex: 'grin', text: '선배! 오늘 손님이 제 기타 듣고 청재킷 샀어요! 저 영업 천재 아니에요?' }],
    [{ who: '나츠', ch: 'natsu', ex: 'pout', text: '사장님이 가판대에서 기타 치지 말래요. 손님들이 무서워한대요.' }, { who: '나츠', ch: 'natsu', ex: 'grin', text: '근데 오늘도 쳤어요.' }],
    [{ who: '나츠', ch: 'natsu', ex: 'shy', text: '선배는 연습할 때 뭐 먹어요? 저는 멜론빵이요. 손에 기름이 안 묻어서요.' }],
    [{ who: '나츠', ch: 'natsu', ex: 'neutral', text: '누나가 기타 소리 시끄럽다고 방문을 쾅 닫아요. 그 소리가 제 기타보다 커요.' }],
    [{ lv: 3, who: '나츠', ch: 'natsu', ex: 'admire', text: '선배 옆에서 치면 손이 덜 떨려요. 신기하죠.' }, { who: '나츠', ch: 'natsu', ex: 'shy', text: '……방금 거 좀 이상하게 들렸나?' }],
  ],
  rei: [
    [{ who: '레이', ch: 'rei', ex: 'neutral', text: '오늘 가게 BGM, 원곡보다 조금 빨라. 턴테이블 속도가 틀어졌나 봐.' }, { who: '레이', ch: 'rei', ex: 'annoyed', text: '사장님한테 세 번 말했어.' }],
    [{ who: '레이', ch: 'rei', ex: 'smirk', text: '오늘 걸음이 느리네. 피곤하지?' }],
    [{ who: '레이', ch: 'rei', ex: 'neutral', text: '절판 악보는 원본 가진 사람이 내놓기 전엔 안 나와. 그래서 복사본이라도 모으는 거야.' }],
    [{ who: '레이', ch: 'rei', ex: 'neutral', text: '홍차는 3분. 3분 10초도 안 되고 2분 50초도 안 돼.' }],
    [{ lv: 3, who: '레이', ch: 'rei', ex: 'shy', text: '어제 녹음 들었어. 두 번째 곡 브리지, 네 소리 좋았어.' }, { who: '레이', ch: 'rei', ex: 'annoyed', text: '한 번만 말할 거야.' }],
  ],
  koto: [
    [{ who: '@kero_P', text: '지금 창문으로 보고 있어요. 손 흔들지 마세요. 부끄러워요.' }],
    [{ who: '@kero_P', text: '새 베이스 라인 만들었어요. 오늘은 개구리 울음소리를 샘플로 넣어 봤어요.' }, { who: '@kero_P', text: '농담이에요. 반은요.' }],
    [{ who: '@kero_P', text: '밖이 시끄러우면 헤드폰을 두 개 겹쳐 써요. 그럼 제 소리만 남아요.' }],
    [{ who: '@kero_P', text: '오늘 밤하늘 봤어요? 창문 크기만큼만 보이는데, 그래도 좋았어요.' }],
    [{ lv: 3, who: '코토', ch: 'koto', ex: 'nervous', text: '……안녕, 하세요.' }, { text: '코토가 현관문을 반쯤 열고 직접 인사했다. 그러고는 바로 문을 닫았다.' }, { who: '@kero_P', text: '방금 거 연습했어요.' }],
  ],
};
for (const [id, list] of Object.entries(TALK)) list.forEach((t, i) => S(`TALK_${id.toUpperCase()}${i + 1}`, `잡담 · ${WHO_NAME[id]} ${i + 1}`, t));

/* ---------------- gifts ---------------- */
const GIFT_SAY = {
  rui: S('GIFT_RUI', '선물 반응 · 루이', [
    { tier: 3, who: '루이', ch: 'rui', ex: 'surprise', text: '……이거 내가 맨날 사는 거잖아. 어떻게 알았어?' },
    { tier: 2, who: '루이', ch: 'rui', ex: 'shy', text: '고마워. 잘 쓸게.' },
    { tier: 1, who: '루이', ch: 'rui', ex: 'neutral', text: '응. 받아 둘게.' },
    { tier: 0, who: '루이', ch: 'rui', ex: 'pout', text: '……이걸 나보고 어쩌라고.' },
    { item: 'mask', who: '루이', ch: 'rui', ex: 'shy', text: '새 거네. 끈이 부드러워. ……고마워. 진짜로.' },
  ]),
  ren: S('GIFT_REN', '선물 반응 · 렌', [
    { tier: 3, who: '렌', ch: 'ren', ex: 'surprise', text: '이거 비싼 건데요. ……고마워요. 내일 국물에 넣을게요.' },
    { tier: 2, who: '렌', ch: 'ren', ex: 'smile', text: '잘 쓸게요. 아껴서요.' },
    { tier: 1, who: '렌', ch: 'ren', ex: 'neutral', text: '아, 감사합니다.' },
    { tier: 0, who: '렌', ch: 'ren', ex: 'shy', text: '……마음만 받을게요.' },
    { item: 'sticks', who: '렌', ch: 'ren', ex: 'shy', text: '5A네요. 이건 벽에 안 걸게요. 쓸게요.' },
  ]),
  natsu: S('GIFT_NATSU', '선물 반응 · 나츠', [
    { tier: 3, who: '나츠', ch: 'natsu', ex: 'admire', text: '헉, 이거 오늘 다 팔렸던 건데요?! 선배 최고예요!' },
    { tier: 2, who: '나츠', ch: 'natsu', ex: 'grin', text: '우와, 감사합니다! 아껴 쓸게요!' },
    { tier: 1, who: '나츠', ch: 'natsu', ex: 'grin', text: '감사합니다! 헤헤.' },
    { tier: 0, who: '나츠', ch: 'natsu', ex: 'surprise', text: '아, 감사합니다! ……근데 이거 어디에 쓰는 거예요?' },
    { item: 'gstr', who: '나츠', ch: 'natsu', ex: 'admire', text: '09 게이지! 선배가 첫 기타에 끼웠던 거랑 같은 거죠? 인터뷰에서 봤어요!' },
  ]),
  rei: S('GIFT_REI', '선물 반응 · 레이', [
    { tier: 3, who: '레이', ch: 'rei', ex: 'surprise', text: '……이거 어디서 구했어. 찾는 데 2년 걸렸는데.' },
    { tier: 2, who: '레이', ch: 'rei', ex: 'neutral', text: '고마워. 쓸모 있네.' },
    { tier: 1, who: '레이', ch: 'rei', ex: 'neutral', text: '받을게.' },
    { tier: 0, who: '레이', ch: 'rei', ex: 'annoyed', text: '미안. 이건 별로야. 마음은 받을게.' },
  ]),
  koto: S('GIFT_KOTO', '선물 반응 · 코토', [
    { tier: 3, who: '@kero_P', text: '개구리다……. 가방에 달게요. 지금 바로요.' },
    { tier: 2, who: '@kero_P', text: '고마워요. 진짜로요.' },
    { tier: 1, who: '@kero_P', text: '감사합니다.' },
    { tier: 0, who: '@kero_P', text: '……? 감사합니다.' },
    { item: 'plugs', who: '@kero_P', text: '귀마개……. 이거 좋은 거예요. 소리가 안 뭉개져요. 어떻게 아셨어요.' },
  ]),
};
const GIFT_UP = [-1, 1, 3, 6];
const likeOf = (item, id) => (ITEM[item].like || {})[id] ?? 1;
function openGift(id, done) {
  const g = W.g, own = ITEMS.filter(i => i.cat === '선물' && g.bag[i.id] > 0);
  const m = MEMBERS.find(x => x.id === id);
  const el = document.createElement('div');
  el.className = 'gift';
  el.innerHTML = `<div class="gf-dim"></div><div class="gf-box" style="--c:${m.c}">
      <div class="gf-h"><img src="${icon(id)}" alt=""><div><small>선물하기</small><b>${nm(id)}</b></div><span class="gf-lv">${'♥'.repeat(W.lv(id))}${'♡'.repeat(5 - W.lv(id))}</span></div>
      <div class="gf-list">${own.map(i => `<div class="gf-i" style="--g:${i.c}"><span class="k">${i.k}</span><b>${i.n}</b><em>×${g.bag[i.id]}</em><i class="gf-hint"></i></div>`).join('')}</div>
      <div class="gf-note">한 사람에게 하루 한 번 줄 수 있어요. 좋아하는 걸 주면 호감도가 많이 올라요.${W.lv(id) >= 2 ? '' : ' 뭘 좋아하는지는 친해지면(♥ LV2) 보여요.'}</div>
      <div class="gf-say"><img src="${icon(id)}" alt=""><p></p><b class="gf-up"></b></div></div>`;
  overlayRoot.appendChild(el);
  A($('.gf-dim', el), KF.fade, T.slam);
  A($('.gf-box', el), [{ scale: '1 0', opacity: 0 }, { scale: '1 1', opacity: 1 }], T.slam);
  const rows = $$('.gf-i', el);
  if (W.lv(id) >= 2) rows.forEach((r, i) => { const h = likeOf(own[i].id, id); $('.gf-hint', r).textContent = LIKE_W[h] || ''; });
  let given = false;
  const give = n => {
    if (given) return; given = true;
    const it = own[n], h = likeOf(it.id, id), say = $('.gf-say', el), lines = GIFT_SAY[id];
    const ln = lines.find(l => l.item === it.id && h >= 2) || lines.find(l => l.tier === h);
    g.bag[it.id]--; g.gave[id] = g.day;
    W.begin(); W.apply({ bond: { [id]: GIFT_UP[h] } });
    const p = W.pend; W.pend = null;
    $('p', say).textContent = ln.text.replace(/@NAME/g, G.name);
    $('.gf-up', say).textContent = `${GIFT_UP[h] > 0 ? '♥ +' + GIFT_UP[h] : '♥ ' + GIFT_UP[h]}${p.lvup[id] ? ` · LV${p.lvup[id]} ${STAGES[p.lvup[id]]}` : ''}`;
    say.classList.add('on');
    A(say, KF.fromBottom('30%'), T.char);
    A($('.gf-up', say), [{ scale: '2', opacity: 0 }, { scale: '1', opacity: 1 }], T.pop, { delay: 300, e: EZ.pop });
    rows.forEach((r, i) => r.classList.toggle('used', i === n));
    writeSave();
  };
  const L = List(rows, { onPick: give });
  const close = () => { closeOverlay(ov); A(el, [{ opacity: 1 }, { opacity: 0 }], T.slam, { fill: 'forwards' }); setTimeout(() => el.remove(), 200); done && done(); };
  const ov = openOverlay({
    key(k) { if (k === 'up') L.move(-1); else if (k === 'down') L.move(1); else if (k === 'ok') { if (given) close(); else give(L.i); } else if (k === 'back') close(); return true; },
    close(instant) { closeOverlay(ov); el.remove(); },
  });
  $('.gf-dim', el).addEventListener('click', () => close());
}

/* ---------------- today ---------------- */
function today() {
  const g = W.g;
  if (!g.did || g.did.day !== g.day) {
    // one or two random things happen somewhere today (the same ones until the day ends)
    const open = SPOTS.filter(s => spotOpen(s, g)).map(s => s.id);
    const pool = RND.filter(r => !g.ev[r.id] && afterOk(r.after, g) && (!r.need || r.need(g)) && r.spots.some(s => open.includes(s)));
    let seed = (g.day * 9301 + 49297) % 233280;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const n = Math.min(pool.length, isWeekend(g.day) ? 2 : 1), rs = [];
    while (rs.length < n) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; const sp = r.spots.filter(s => open.includes(s)); rs.push([r.id, sp[Math.floor(rnd() * sp.length)]]); }
    g.did = { day: g.day, talk: {}, act: {}, rnd: rs };
    writeSave();
  }
  return g.did;
}
const afterOk = (after, g) => !after || String(after).split('|').some(id => !!g.ep[id]);
/* everything worth doing at a place today */
function spotEvents(s, g) {
  const here = presentAt(s.id, g), d = today(), out = [];
  for (const e of TEV) {
    if (e.spot !== s.id || g.ev[e.id] || !afterOk(e.after, g)) continue;
    if (e.kind === 'meet' && !here.includes(e.who)) continue;
    if (e.kind === 'bond') {
      if (!g.met[e.who]) continue;
      if (!['home', 'odb'].includes(e.spot) && !here.includes(e.who)) continue;
      if (e.lv && W.lv(e.who) < e.lv) { out.push({ ...e, locked: `♥ LV${e.lv} 필요` }); continue; }
    }
    if (e.need && !e.need(g)) { if (e.needT) out.push({ ...e, locked: e.needT }); continue; }
    out.push(e);
  }
  for (const [id, sp] of d.rnd) if (sp === s.id && !g.ev[id]) out.push({ ...RND.find(r => r.id === id), kind: 'rnd' });
  return out;
}
const ACT = {
  odb: { k: 'work', t: '알바하기 · ¥4,000 · 체력 -15', eff: { money: 4000, hp: -15, mt: 1 }, say: '케이블을 감고, 조명을 켜고, 바닥을 닦았다. 오늘 공연은 무사히 끝났다.' },
  ramen: { k: 'eat', t: '라멘 먹기 · ¥900 · 체력 +15', eff: { money: -900, hp: 15 }, say: '국물을 끝까지 마셨다. 몸이 조금 따뜻해졌다.' },
  river: { k: 'rest', t: '쉬기 · 체력 +20 · 멘탈 +6', eff: { hp: 20, mt: 6 }, say: '이어폰을 빼고 강물 소리를 들었다. 왼쪽 귀로도 다 들렸다.' },
  shrine: { k: 'pray', t: '참배하기 · ¥100 · 멘탈 +3', eff: { money: -100, mt: 3 }, say: '100엔을 넣고 손뼉을 두 번 쳤다. 소원은 정하지 못했다.' },
};

/* ---------------- TOWN MAP ---------------- */
scene('town', {
  title: '타운 맵', cls: 'tm', via: 'zoom',
  html: () => `<div class="tm-cam">${bgImg('map', 'tm-img')}
      ${SPOTS.map(s => `<span class="tm-pin act" data-id="${s.id}" style="left:${s.x}%;top:${s.y}%"><b>${s.tag}</b></span>`).join('')}
      <span class="tm-ring"></span>
    </div>
    <div class="tm-shade"></div>${bigWord('TOWN MAP', 'tm-word')}
    <div class="tm-chip"></div>
    <div class="tm-stat"></div>
    <div class="tm-card"><div class="tm-photo"></div><b class="tm-place"></b><p class="tm-desc"></p><div class="tm-here"></div></div>
    <div class="tm-list"><div class="tm-lt">TODAY · 오늘 갈 수 있는 곳</div><div class="tm-rows"></div></div>
    ${backChip()}
    ${hint([['A', '가기'], ['B', '메뉴'], ['↕', '장소']], 'TOWN MAP')}`,
  build() {
    const el = this.el, g = W.g;
    this.spots = SPOTS.filter(s => spotOpen(s, g));
    $$('.tm-pin', el).forEach(p => { p.hidden = !this.spots.some(s => s.id === p.dataset.id); });
    $('.tm-rows', el).innerHTML = this.spots.map(s => {
      const here = presentAt(s.id, g), evs = spotEvents(s, g).filter(e => !e.locked);
      const face = here.find(id => g.met[id]);
      return `<div class="tm-row${evs.length ? ' ev' : ''}" data-id="${s.id}" style="--c:${face ? `var(--c-${face})` : 'var(--yellow)'}">
        ${face ? `<span class="av"><img src="${icon(face)}" alt=""></span>` : `<span class="av ic">${s.tag}</span>`}
        <span class="tx"><b>${s.place}</b><small>${this.sub(s, here, evs)}</small></span><em>${evs.some(e => e.kind === 'bond' || e.kind === 'sp' || e.kind === 'meet') ? '★' : evs.length ? '?' : s.tag}</em></div>`;
    }).join('');
    this.L = List($$('.tm-row', el), { loop: false, start: Math.min(this.i || 0, this.spots.length - 1), onChange: (n, r, silent) => this.focus(n, silent), onPick: () => this.key('ok') });
  },
  sub(s, here, evs) {
    const g = W.g, bits = [];
    const people = here.map(id => g.met[id] ? nm(id) : '처음 보는 사람');
    if (people.length) bits.push(`${people.join(', ')} 있음`);
    if (evs.length) bits.push(evs.map(e => e.kind === 'rnd' ? '무슨 일이 있다' : e.t).join(' · '));
    if (!bits.length) bits.push(ACT[s.id] ? ACT[s.id].t.split(' · ')[0] : s.id === 'home' ? '하루 끝내기' : '조용하다');
    return bits.join(' · ');
  },
  focus(n, silent) {
    const s = this.spots[n], el = this.el, g = W.g, cam = $('.tm-cam', el), night = !isWeekend(g.day);
    this.i = n;
    const to = `translate(${(50 - s.x) * .55 + 12}%, ${(50 - s.y) * .5}%) scale(1.35)`;
    if (silent) cam.style.transform = to;
    else cam.animate([{ transform: getComputedStyle(cam).transform }, { transform: to }], { duration: 700 * G.K, easing: EZ.soft, fill: 'forwards' }).finished.then(() => { cam.style.transform = to; }).catch(() => {});
    const ring = $('.tm-ring', el); ring.style.left = s.x + '%'; ring.style.top = s.y + '%';
    $$('.tm-pin', el).forEach(p => p.classList.toggle('on', p.dataset.id === s.id));
    $('.tm-place', el).textContent = s.place;
    $('.tm-desc', el).textContent = s.desc;
    const here = presentAt(s.id, g);
    $('.tm-here', el).innerHTML = here.map(id => g.met[id] ? `<span style="--c:var(--c-${id})"><img src="${icon(id)}" alt="">${nm(id)} <b>${'♥'.repeat(W.lv(id))}</b>${g.gave[id] === g.day ? ' · 선물함' : ''}</span>` : '<span class="q">처음 보는 사람</span>').join('');
    $('.tm-photo', el).style.backgroundImage = `url(img/bg/${s.bg[night ? 1 : 0]}.webp)`;
    if (!silent) { A($('.tm-card', el), KF.fromLeft('-10%'), T.char); A(ring, [{ scale: '2.4', opacity: 0 }, { scale: '1', opacity: 1 }], 500, { e: EZ.pop, delay: 300 }); }
  },
  stat() {
    const g = W.g, el = this.el;
    $('.tm-chip', el).innerHTML = dayChip();
    $('.tm-stat', el).innerHTML = `<div><span>체력</span><i><b style="width:${g.hp}%"></b></i><em>${g.hp}</em></div><div><span>멘탈</span><i class="m"><b style="width:${g.mt}%"></b></i><em>${g.mt}</em></div><p>¥${g.money.toLocaleString('en-US')} · 팬 ${g.fans.toLocaleString('en-US')}</p>`;
    el.classList.toggle('night', !isWeekend(g.day));
  },
  enter() {
    const el = this.el, g = W.g || W.init();
    if (!SPOTS.some(s => spotOpen(s, g))) { toast('STORY에서 1-2 「케이블 감는 법」까지 보면 열려요'); return later(() => { G.busy = false; go('menu', { via: 'fade', push: false }); }, 300); }
    today();
    this.build(); this.stat();
    this.focus(this.L.i, true);
    A($('.tm-cam', el), [{ opacity: 0, scale: '1.2' }, { opacity: 1, scale: '1' }], 1000, { e: EZ.soft });
    A($('.tm-word', el), KF.fromLeft('-20%'), 900, { e: EZ.soft, delay: 200 });
    A($('.tm-chip', el), KF.fromTop('-100%'), T.char, { delay: 300 });
    A($('.tm-stat', el), KF.fromTop('-100%'), T.char, { delay: 340 });
    A($('.tm-card', el), KF.fromLeft('-20%'), T.char, { delay: 400 });
    stagger($$('.tm-row', el), KF.fromRight('30%'), T.char, 450, 60);
    stagger($$('.tm-pin:not([hidden])', el), KF.popIn, T.pop, 700, 70, { e: EZ.pop });
    if (!g.flags.tutTown) {
      g.flags.tutTown = true; writeSave();
      later(() => tutorial({ title: 'TOWN', body: 'TOWN에는 행동력이 없어요. 가고 싶은 곳에 가서 <b>만나고, 이야기하고, 선물하세요</b>.<br>★는 호감도 이벤트, ?는 그날만 생기는 일이에요. 사람마다 있는 요일이 달라요.<br>선물은 한 사람에게 하루 한 번. <b>집</b>에서 하루를 끝내면 다음 날이 되고 체력이 회복돼요.' }), 1300);
    }
  },
  /* the place's menu: events first, then the person, then the chores */
  visit(s) {
    const g = W.g, d = today(), here = presentAt(s.id, g), evs = spotEvents(s, g);
    const b = [];
    for (const e of evs) b.push({ t: e.locked ? `🔒 ${e.t} <small>${e.locked}</small>` : `${e.kind === 'rnd' ? '?' : '★'} ${e.kind === 'rnd' ? e.t : e.t}`, fn: () => e.locked ? (toast(`${e.t} · ${e.locked}`), this.visit(s)) : this.play(e, s) });
    for (const id of here.filter(x => g.met[x])) {
      b.push({ t: `${jo(nm(id), '와')} 이야기하기${d.talk[id] ? '' : ' <small>♥ +1</small>'}`, fn: () => this.talk(id, s) });
      const gifts = ITEMS.some(i => i.cat === '선물' && g.bag[i.id] > 0);
      b.push({ t: g.gave[id] === g.day ? `선물하기 <small>오늘은 이미 줬어요</small>` : gifts ? `${nm(id)}에게 선물하기` : '선물하기 <small>가진 선물이 없어요</small>', fn: () => {
        if (g.gave[id] === g.day) return toast('오늘은 이미 선물했어요'), this.visit(s);
        if (!gifts) return toast('SHOP에서 선물을 살 수 있어요'), this.visit(s);
        openGift(id, () => { this.refresh(); });
      } });
    }
    const a = ACT[s.id];
    if (a) b.push({ t: d.act[a.k] ? `${a.t.split(' · ')[0]} <small>오늘은 했어요</small>` : a.t, fn: () => this.act(a, s) });
    if (s.id === 'studio' && g.joined.length) b.push({ t: `합주 연습 · ${g.buff.studio ? '쿠폰 사용' : '¥1,500'} · SYNC ×1.5`, fn: () => this.jam() });
    if (s.id === 'thrift') b.push({ t: '상점가에서 쇼핑하기', fn: () => go('shop', { via: 'shutter' }) });
    if (s.id === 'home') b.push({ t: '하루 끝내기 · 체력 +35', fn: () => this.sleep() });
    b.push({ t: '그냥 둘러보고 나오기', cancel: true, fn: () => {} });
    modal({ title: `<small>${dateKo(g.day)}</small>${s.place}`, body: here.length ? here.map(id => g.met[id] ? `${jo(nm(id), '가')} 있다.` : '처음 보는 사람이 있다.').join(' ') : s.desc, buttons: b, tone: 'act' });
  },
  refresh() { if (G.cur !== 'town') return; const i = this.L.i; this.build(); this.stat(); this.L.set(i, true); this.focus(i, true); },
  back() { G.stack = []; go('town', { via: 'fade', push: false }); },
  play(e, s) {
    const g = W.g;
    W.begin();
    adv(e.script, { bg: e.bg || s.bg[isWeekend(g.day) ? 0 : 1], place: e.place || `<b>${s.place}</b>`, next: () => {
      g.ev[e.id] = g.day;
      if (e.kind === 'meet') g.met[e.who] = true;
      W.apply(e.eff || {});
      W.summary(e.t, () => this.back());
    } });
  },
  talk(id, s) {
    const g = W.g, d = today(), pool = TALK[id].filter(t => !t[0].lv || W.lv(id) >= t[0].lv);
    const t = pool[(g.day + id.length) % pool.length];
    W.begin();
    adv(t, { bg: s.bg[isWeekend(g.day) ? 0 : 1], place: `<b>${s.place}</b>`, next: () => {
      if (!d.talk[id]) { d.talk[id] = true; W.apply({ bond: { [id]: 1 } }); }
      W.summary(`${jo(nm(id), '와')} 이야기`, () => this.back());
    } });
  },
  act(a, s) {
    const g = W.g, d = today();
    if (d.act[a.k]) return toast('오늘은 이미 했어요');
    if (a.eff.money < 0 && g.money < -a.eff.money) return toast('돈이 모자라요');
    if (a.k === 'work' && g.hp < 15) return confirmBox('많이 지쳐 있어요', `체력 ${g.hp}. 그래도 일할까요?`, () => this.act2(a, s));
    this.act2(a, s);
  },
  act2(a, s) {
    const d = today();
    d.act[a.k] = true;
    W.begin(); W.apply(a.eff);
    toast(a.say);
    W.summary(a.t.split(' · ')[0], () => this.refresh());
  },
  jam() {
    const g = W.g;
    if (!g.buff.studio && g.money < 1500) return toast('돈이 모자라요');
    pickLength(SONGS[G.song || 0], len => {
      if (g.buff.studio) g.buff.studio--; else g.money -= 1500;
      writeSave();
      const s = SONGS[G.song || 0], part = G.inst, party = myBand(part);
      go('live', { via: 'slam', arg: {
        song: s, part, diff: G.diff ?? 1, len, bg: 'studio_night', party, label: bandLabel(party), scenario: party.length ? 'band' : 'practice', fumbles: party.length > 0, noFail: true,
        heat0: heatStart(), quitTo: 'town',
        next: r => {
          W.begin();
          const sy = Math.round(({ SS: 40, S: 34, A: 28, B: 20, C: 14, D: 10, F: 4 }[r.rank]) * 1.5 * (len === 'full' ? 1.6 : 1));
          const sync = Object.fromEntries([...party.map(m => m.id), ...(g.joined.includes('rui') ? ['rui'] : [])].map(id => [id, sy]));
          W.apply({ sync, hp: -LIVE_COST(len) });
          if (r.clear) { g.lives++; writeSave(); }
          W.summary('합주 연습', () => this.back());
        },
      } });
    });
  },
  sleep() {
    const g = W.g, d0 = g.day;
    confirmBox('하루를 끝낼까요?', `${dateKo(d0)} → ${dateKo(d0 + 1)}<br>체력 +35 · 멘탈 +4. 선물과 이야기, 오늘 한 일이 다시 가능해져요.`, () => {
      W.begin(); W.apply({ hp: 35, mt: 4 });
      for (const id of Object.keys(g.mc)) { const m = W.mc(id); m.hp = Math.min(100, m.hp + 10); }
      g.day++; writeSave();
      W.pend = null;
      playCalendar(d0, g.day, () => this.refresh());
    });
  },
  key(k) {
    if (k === 'up') this.L.move(-1);
    else if (k === 'down') this.L.move(1);
    else if (k === 'ok') this.visit(this.spots[this.L.i]);
    else if (k === 'back') go('menu', { via: 'sweepBack', push: false });
    else return undefined;
    return true;
  },
});

/* the diagonal calendar sweep when a day ends */
function playCalendar(from, to, mid) {
  const el = document.createElement('div');
  el.className = 'calov';
  const days = [];
  for (let d = to - 3; d <= to + 3; d++) days.push(d);
  el.innerHTML = `<div class="cv-dim"></div><div class="cv-band"></div><div class="cv-month"><small>NAGISAKA</small>${dateOf(to).m}</div>
    <div class="cv-days">${days.map(d => `<div class="cv-d${d === from ? ' from' : ''}${d === to ? ' to' : ''}"><b>${dateOf(d).d}</b><span>${DOW_EN[dateOf(d).dow]}</span><i class="moon"></i></div>`).join('')}</div>`;
  overlayRoot.appendChild(el);
  A($('.cv-dim', el), KF.fade, T.slam);
  A($('.cv-band', el), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], T.wipe, { e: EZ.wipe });
  A($('.cv-month', el), KF.fromLeft('-40%'), T.char, { delay: 120 });
  A($('.cv-days', el), [{ translate: '9% 13%' }, { translate: '0 0' }], 800, { delay: 400, e: EZ.soft, fill: 'backwards' });
  stagger($$('.cv-d', el), KF.fade, T.slam, 150, 40);
  const toEl = $('.cv-d.to', el);
  const ov = openOverlay({ key() { return true; }, close() { el.remove(); closeOverlay(ov); } });
  setTimeout(() => { toEl.classList.add('now'); pop(toEl); mid && mid(); }, 1250 * G.K);
  setTimeout(() => { A(el, [{ opacity: 1 }, { opacity: 0 }], 400, { fill: 'forwards' }); setTimeout(() => el.remove(), 420 * G.K); closeOverlay(ov); }, 2100 * G.K);
}
