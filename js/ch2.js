/* RE:AMP! — CHAPTER 2 「결성」 · 4월 21일 ~ 5월 18일 · 첫 밴드 공연 (평일 밤, 관객 다섯 명)
   Branches: who you go to first (2-3) and whether they come in (2-4) · Natsu now or later (2-5) ·
   how the first show goes (2-7) · the band's name (2-8). */
'use strict';
Object.assign(SPEAKER, { '후드 쓴 여자': { role: '???', c: 'var(--c-koto)' }, '기타 멘 남자애': { role: '???', c: 'var(--c-natsu)' } });

const E2_1 = S('E2_1', '2-1 · 빈자리 세기', [
  { text: '월요일 밤, 공연이 끝난 0dB에서 의자를 다 올려놓고 나니 루이가 무대 끝에 걸터앉아 있다.' },
  { who: '세리자와 점장', text: '둘 다 잠깐 앉아 봐.' },
  { who: '세리자와 점장', text: '5월 16일 금요일, 평일 밤 자리가 하나 비었어. 새 밴드 셋이 나눠 쓰는 날이야. 한 팀에 두 곡.' },
  { who: '세리자와 점장', text: '관객은 보장 못 해. 평일 밤이라 다섯 명 오면 다행이지.' },
  { who: '루이', ch: 'rui', ex: 'surprise', text: '다섯 명이요?' },
  { who: '세리자와 점장', text: '그 다섯 명도 너희가 데려와야 돼. 오픈 마이크에서 너희 본 사람이든, PULSE로 아는 사람이든.' },
  { who: '세리자와 점장', text: '그리고 둘로는 안 세워. 밴드라며.' },
  { text: '점장이 사무실로 들어가자 루이가 손가락을 하나씩 접는다.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '드럼. 베이스. 건반. 기타는 네가 치면 되고.' },
  { who: '@NAME', text: '나 혼자 넷 다 칠 수는 없잖아.' },
  { who: '루이', ch: 'rui', ex: 'pout', text: '칠 수는 있잖아. 동시에 못 칠 뿐이지.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '아는 사람 없어? 이 동네에서.' },
  { if: IF.m('ren'), text: '라멘집 벽에 걸려 있던 스틱이 떠오른다. 끝이 하얗게 닳아 있었다.' },
  { if: IF.m('rei'), text: '3박자라고 발끝을 지적하던 사람이 떠오른다. 그 사람은 박자를 틀린 적이 없을 것 같다.' },
  { if: IF.m('natsu'), text: '헌옷가게 앞의 F 코드가 떠오른다. 이제는 소리가 날까.' },
  { if: IF.f('kotoReply'), text: 'kero_P가 보내 준 곡이 떠오른다. 그 베이스 라인은 아직 귀에 남아 있다.' },
  { who: '루이', ch: 'rui', ex: 'smile', text: '……누가 떠오르긴 하나 보네. 얼굴에 다 나와.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '일단 수요일에 스튜디오 가자. 둘이서 어디까지 되는지부터 보고.' },
]);
const E2_2 = S('E2_2', '2-2 · 둘이서 맞춰 보기', [
  { text: '수요일 밤, UNDERPASS 스튜디오에 들어왔다. 루이는 방음문을 닫자마자 방 안을 한 바퀴 돌았다.' },
  { who: '루이', ch: 'rui', ex: 'surprise', text: '전철 지나갈 때마다 벽이 울려.' },
  { who: '@NAME', text: '그래서 싸.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '뭐 칠 거야? 기타? 베이스?' },
  { text: '드럼 세트, 베이스 앰프, 낡은 건반이 있다. 전부 칠 줄은 알지만 한 번에 하나씩밖에 못 친다.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '반 박자 어긋난 거, 그거 해 보자. 영상에서 두 번째로 했던 곡.' },
  { choice: ['"그 곡은……"', '(고개를 끄덕인다)'], ch: 'rui', ex: 'neutral', eff: [{ mt: -2 }, { mt: -1, bond: { rui: 1 } }] },
  { who: '루이', ch: 'rui', ex: ['sad', 'neutral'], text: ['알아. 그 곡 중간에 소리가 끊겼지. 그러니까 한 번은 끝까지 쳐 보자는 거야.', '후렴 전까지만. 오늘은 거기까지.'] },
]);
const E2_2B = S('E2_2B', '2-2 · 합주 끝', [
  { if: IF.last(3), who: '루이', ch: 'rui', ex: 'surprise', text: '……처음 맞춰 본 거 맞아?', eff: { bond: { rui: 2 } } },
  { if: IF.last(3), who: '@NAME', text: '네 목소리가 박자를 안 흔들어서 편했어.' },
  { if: IF.last(3), who: '루이', ch: 'rui', ex: 'shy', text: '칭찬이면 그냥 칭찬이라고 해.' },
  { if: IF.not(IF.last(3)), who: '루이', ch: 'rui', ex: 'pout', text: '나쁘진 않았어. 좋지도 않았고.' },
  { if: IF.not(IF.last(3)), who: '루이', ch: 'rui', ex: 'neutral', text: '넌 틀린 데서 표정이 다 보여. 관객도 다 봐.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '근데 역시 둘로는 안 돼. 뒤가 텅 비어.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '누구한테 먼저 말해 볼 거야?' },
  { choice: ['라멘집 벽에 걸린 스틱이 떠오른다', '개구리 프로필의 베이스 라인이 떠오른다', '3박자를 세던 사람이 떠오른다'], need: [IF.m('ren'), null, IF.m('rei')], needT: ['아직 모르는 사람이다', '', '아직 모르는 사람이다'], ch: 'rui', ex: 'neutral', eff: [{ flags: { first2: 'ren' } }, { flags: { first2: 'koto' } }, { flags: { first2: 'rei' } }] },
  { who: '루이', ch: 'rui', ex: ['neutral', 'surprise', 'pout'], text: ['드럼이면 제일 급한 거네. 잘 골랐어.', '개구리? DM으로만 아는 사람을 밴드에 넣겠다고?', '건반? 그 사람 무섭게 생겼으면 나는 안 따라간다.'] },
]);

/* ---------- Ren ---------- */
const E2_3A = S('E2_3A', '2-3A · 라멘집 뒷문', [
  { text: '목요일 밤 열한 시, 멘야 도돈은 셔터가 반쯤 내려와 있다.' },
  { text: '가게 뒤 골목에서 소리가 난다. 탁, 타닥, 탁. 빈 양동이와 맥주 상자를 두드리는 소리다.' },
  { text: '렌이 뒤집어 놓은 양동이 앞에 앉아 나무젓가락으로 박자를 치고 있다. 소리는 작은데 박자가 단단하다.' },
  { who: '렌', ch: 'ren', ex: 'surprise', text: '아.' },
  { who: '렌', ch: 'ren', ex: 'shy', text: '들으셨어요? 가게 문 닫고 나면 손이 심심해서요.' },
  { choice: ['"스틱은 왜 벽에 걸어 둬요?"', '"양동이 소리 좋네요."', '"같이 밴드 할래요?"'], ch: 'ren', ex: 'shy', eff: [{ bond: { ren: 1 } }, { bond: { ren: 2 } }, { bond: { ren: 1 } }] },
  { who: '렌', ch: 'ren', ex: ['sad', 'smile', 'surprise'], text: ['쓸 일이 없어서요. 이번 봄까지만 치기로 했거든요.', '이게 제일 조용해요. 스네어 치면 아버지가 깨셔서.', '……밴드요?'] },
  { if: IF.p(2), who: '렌', ch: 'ren', ex: 'sad', text: '죄송해요. 드럼은 이번 봄까지만 하기로 했어요.' },
  { who: '@NAME', text: '이유 물어봐도 돼요?' },
  { who: '렌', ch: 'ren', ex: 'neutral', text: '…….' },
  { text: '가게 안에서 기침 소리가 들린다. 길고 무거운 기침이다. 렌이 가게 쪽을 돌아봤다가 다시 이쪽을 본다.' },
  { who: '렌', ch: 'ren', ex: 'smile', text: '별 이유 없어요. 가게 일이 바빠져서요.' },
  { who: '렌', ch: 'ren', ex: 'neutral', text: '그래도 누가 쳐 달라고 한 건 오랜만이에요. 고마워요.' },
  { text: '렌은 나무젓가락을 앞치마 주머니에 넣고 셔터를 마저 내렸다. 내리는 속도까지 일정했다.' },
]);
const E2_4A = S('E2_4A', '2-4A · 스틱을 반납하러 온 밤', [
  { text: '월요일 저녁, 0dB 카운터에 렌이 서 있다. 손에 든 스틱 한 쌍은 가게 벽에 걸려 있던 그 스틱이다.' },
  { who: '세리자와 점장', text: '이거 내가 준 거잖아. 네가 고등학생 때 여기서 처음 쳤을 때.' },
  { who: '렌', ch: 'ren', ex: 'neutral', text: '네. 그래서 돌려드리려고요. 봄 끝났으니까.' },
  { who: '세리자와 점장', text: '……그래. 거기 둬.' },
  { text: '점장은 스틱을 받지 않고 카운터에 내려놓게 했다. 그러고는 이쪽을 한 번 보고 사무실로 들어갔다.' },
  { who: '렌', ch: 'ren', ex: 'shy', text: '아, 계셨네요.' },
  { choice: ['"그만두지 마요. 우리 밴드에서 쳐 줘요."', '"……수고했어요."', '"마지막으로 한 곡만 쳐 줄래요?"'], need: [IF.lv('ren', 2), null, null], needT: ['렌과 더 가까워져야 붙잡을 수 있다', '', ''], ch: 'ren', ex: 'shy', eff: [{ bond: { ren: 3 }, mmt: { ren: 15 }, flags: { renIn: true } }, { bond: { ren: 1 } }, { bond: { ren: 2 }, flags: { renMaybe: true } }] },
  { if: IF.p(0), who: '렌', ch: 'ren', ex: 'surprise', text: '…….' },
  { if: IF.p(0), who: '렌', ch: 'ren', ex: 'sad', text: '가게 빚이 있어요. 아버지 혼자서는 못 갚아요. 밤에는 제가 가게를 봐야 하고요.' },
  { if: IF.p(0), who: '@NAME', text: '연습은 가게 끝나고 해요. 밤 열한 시 넘어서. 스튜디오 심야는 싸요.' },
  { if: IF.p(0), who: '렌', ch: 'ren', ex: 'neutral', text: '……그 시간에는 제 박자가 제일 잘 맞아요.' },
  { if: IF.p(0), who: '렌', ch: 'ren', ex: 'shy', text: '지금 심박 140쯤 돼요. 템포 얘기예요.' },
  { if: IF.p(0), text: '렌이 카운터에 내려놓았던 스틱을 다시 집었다.' },
  { if: IF.p(1), who: '렌', ch: 'ren', ex: 'smile', text: '네. 라멘 먹으러 오세요. 그건 계속하니까요.' },
  { if: IF.p(1), text: '스틱은 카운터에 남았다. 점장은 그걸 다음 날에도 치우지 않았다.' },
  { if: IF.p(2), who: '렌', ch: 'ren', ex: 'surprise', text: '지금요?' },
  { if: IF.p(2), text: '렌이 무대 위 드럼 앞에 앉는다. 카운트 넷을 세자마자 스네어 첫 타가 홀 안에 울렸다.' },
  { if: IF.p(2), text: '딱 한 곡이었다. 끝나고 렌은 스틱을 드럼 위에 가지런히 올려놓았다.' },
  { if: IF.p(2), who: '렌', ch: 'ren', ex: 'sad', text: '……이러면 더 못 그만두잖아요.' },
  { if: IF.p(2), text: '렌은 그 말만 하고 나갔다. 스틱은 드럼 위에 그대로 있다.' },
]);

/* ---------- Koto ---------- */
const E2_3B = S('E2_3B', '2-3B · 자판기 옆 개구리', [
  { text: '목요일 밤, kero_P에게 DM을 보냈다.' },
  { if: IF.f('kotoReply'), who: '@NAME', text: '보내 준 곡, 베이스 누가 쳤어요?' },
  { if: IF.not(IF.f('kotoReply')), who: '@NAME', text: '저번에 답장 못 해서 미안해요. 곡 만든다고 했죠?' },
  { who: '@kero_P', text: '제가요. 방에서 녹음해요.' },
  { who: '@NAME', text: '밴드를 하려는데 베이스가 없어요.' },
  { text: '읽음 표시가 뜨고 한참 동안 답이 없다.' },
  { who: '@kero_P', text: '무대는 못 서요.' },
  { who: '@kero_P', text: '근데 베이스 라인은 드릴 수 있어요. 0dB 앞 자판기 옆에 두고 갈게요. 30분 뒤에요.' },
  { bg: 'street_night', text: '30분 뒤, 0dB 앞 자판기 불빛 아래에 개구리 스티커가 붙은 USB 하나가 놓여 있다.' },
  { text: '골목 끝에 누가 서 있다. 초록 후드를 뒤집어썼는데, 후드에 눈알 두 개가 달렸다.' },
  { text: '눈이 마주쳤다. 그 사람이 그대로 굳었다.' },
  { who: '후드 쓴 여자', ch: 'koto', ex: 'nervous', text: '그, 그거…… 베이스……' },
  { who: '후드 쓴 여자', ch: 'koto', ex: 'nervous', text: '들어 보…… 세요. 안 들어도……' },
  { choice: ['"kero_P?"', '(USB를 들어 보인다)', '"같이 하자."'], ch: 'koto', ex: 'nervous', eff: [{ bond: { koto: 1 } }, { bond: { koto: 2 } }, { bond: { koto: 1 } }] },
  { who: '후드 쓴 여자', ch: 'koto', ex: ['surprise', 'smile', 'nervous'], text: ['…….', '……네.', '무, 무대는……'] },
  { text: '그 사람은 고개를 한 번 꾸벅 숙이고 골목으로 뛰어갔다. 슬리퍼 소리가 멀어진다.' },
  { text: '집에 와서 USB를 꽂았다. 파일 이름이 「bass_for_you.wav」다.' },
  { text: '폴더에 메모 파일이 하나 있다. 곡 설명 끝에 「히나타 코토」라는 이름이 적혀 있다.', eff: { flags: { kotoName: true } } },
  { who: '@kero_P', text: '아까는 죄송했어요. 사람 얼굴 보면 말이 반만 나와서요.' },
  { who: '@kero_P', text: '베이스, 들어 보셨어요?' },
]);
const E2_4B = S('E2_4B', '2-4B · 첫 번째 파일', [
  { text: '월요일 밤, 코토가 보낸 베이스 트랙을 스튜디오 스피커로 틀었다.' },
  { text: '루이가 가사 없이 흥얼거리다 멈췄다.' },
  { who: '루이', ch: 'rui', ex: 'surprise', text: '이거 누가 친 거야? 되게…… 노래하기 편해.' },
  { who: '@NAME', text: '개구리.' },
  { who: '루이', ch: 'rui', ex: 'pout', text: '진지하게 묻는 건데.' },
  { text: '그날 밤 코토에게 DM을 보낸다.' },
  { who: '@kero_P', text: '들으셨어요?' },
  { who: '@kero_P', text: '밴드 하시는 분들한테 제 베이스가 필요할 리가 없는데.' },
  { choice: ['"무대 옆에서라도 같이 하자."', '"파일로 같이 해도 돼."', '"다음에 다시 물어볼게."'], need: [IF.lv('koto', 2), null, null], needT: ['코토와 더 가까워져야 한다', '', ''], eff: [{ bond: { koto: 3 }, flags: { kotoIn: 'stage' } }, { bond: { koto: 2 }, flags: { kotoIn: 'file' } }, { bond: { koto: 1 } }] },
  { if: IF.p(0), who: '@kero_P', text: '무대 옆이요?' },
  { if: IF.p(0), who: '@kero_P', text: '……조명 안 닿는 데면 한 번 가 볼게요.' },
  { if: IF.p(0), who: '@kero_P', text: '후드는 쓰고 갈 거예요.' },
  { if: IF.p(1), who: '@kero_P', text: '파일로요?' },
  { if: IF.p(1), who: '@kero_P', text: '그럼 매주 보낼게요. 고칠 데 있으면 말해 주세요. 말로 말고 DM으로요.' },
  { if: IF.p(2), who: '@kero_P', text: '네. 기다릴게요. 아, 기다린다고 부담 가지시라는 건 아니고요.' },
  { if: IF.p(2), who: '@kero_P', text: '(개구리 이모티콘)' },
]);

/* ---------- Rei ---------- */
const E2_3C = S('E2_3C', '2-3C · 틀린 음 세 개', [
  { text: '목요일 밤, 레코드샵 사이드B에 갔다. 레이는 오늘도 클래식 악보 코너 앞에 있다.' },
  { who: '레이', ch: 'rei', ex: 'neutral', text: '또 왔네. 이번엔 발 조심해.' },
  { who: '@NAME', text: '건반 칠 사람을 찾고 있어.' },
  { who: '레이', ch: 'rei', ex: 'smirk', text: '그걸 왜 나한테 말해.' },
  { who: '@NAME', text: '박자를 틀린 적이 없을 것 같아서.' },
  { who: '레이', ch: 'rei', ex: 'annoyed', text: '틀려. 사람이니까. 대신 한 번 틀린 데는 기억해 뒀다가 다음엔 안 틀려.' },
  { who: '레이', ch: 'rei', ex: 'neutral', text: '……좋아. 네가 먼저 쳐 봐. 건반으로.' },
  { who: '레이', ch: 'rei', ex: 'smirk', text: '가게 뒤에 사장님 연습용 키보드 있어. 틀린 음 세 개까지만 봐줄게.' },
]);
const E2_3C2 = S('E2_3C2', '2-3C · 채점', [
  { if: IF.last(3), who: '레이', ch: 'rei', ex: 'surprise', text: '……두 개.' },
  { if: IF.last(3), who: '레이', ch: 'rei', ex: 'neutral', text: '건반이 본업도 아닌 사람치고는 괜찮네. 한 개로 줄여 오면 생각해 볼게.', eff: { bond: { rei: 3 } } },
  { if: IF.not(IF.last(3)), who: '레이', ch: 'rei', ex: 'annoyed', text: '여섯 개. 세 개라고 했지.' },
  { if: IF.not(IF.last(3)), who: '레이', ch: 'rei', ex: 'neutral', text: '그래도 박자는 안 흔들렸어. 음이 틀려도 박자가 안 흔들리는 사람은 드물어.', eff: { bond: { rei: 1 } } },
  { who: '레이', ch: 'rei', ex: 'neutral', text: '월요일에 너희 연습하는 데 한 번 가 볼게. 듣기만.' },
]);
const E2_4C = S('E2_4C', '2-4C · 3BPM', [
  { text: '월요일 밤, 스튜디오 문이 열리고 레이가 들어왔다. 인사 대신 메트로놈 앱을 켠다.' },
  { who: '루이', ch: 'rui', ex: 'surprise', text: '……이 사람이야?' },
  { who: '레이', ch: 'rei', ex: 'neutral', text: '신경 쓰지 말고 해. 나는 듣기만 할 거야.' },
  { text: '루이와 둘이서 한 곡을 한다. 레이는 벽에 기대 눈을 감고 있다.' },
  { who: '레이', ch: 'rei', ex: 'annoyed', text: '후렴 들어가기 전에 둘 다 빨라져. 한 마디에 3BPM쯤.' },
  { who: '루이', ch: 'rui', ex: 'pout', text: '그걸 어떻게 알아.' },
  { who: '레이', ch: 'rei', ex: 'smirk', text: '들리니까.' },
  { who: '레이', ch: 'rei', ex: 'neutral', text: '그리고 건반 들어갈 자리가 이상해. 원곡 편곡을 그대로 따라 하니까 그래. 둘이면 둘에 맞게 바꿔야지.' },
  { choice: ['"그럼 네가 편곡해 줘."', '"네가 들어오면 되잖아."', '"다음에 또 들으러 와."'], need: [IF.any(IF.rk('2-3C', 3), IF.lv('rei', 2)), IF.lv('rei', 3), null], needT: ['레이에게 실력을 더 보여 줘야 한다', '레이와 더 가까워져야 한다', ''], ch: 'rei', ex: 'neutral', eff: [{ bond: { rei: 3 }, flags: { reiIn: true } }, { bond: { rei: 3 }, flags: { reiIn: true } }, { bond: { rei: 1 }, flags: { reiMaybe: true } }] },
  { if: IF.p(0), who: '레이', ch: 'rei', ex: 'surprise', text: '……편곡?' },
  { if: IF.p(0), who: '레이', ch: 'rei', ex: 'sad', text: '편곡은 해 봤어. 내 이름이 남은 적이 없어서 그렇지.' },
  { if: IF.p(0), who: '@NAME', text: '이번엔 남기면 되지. 크레딧 맨 앞에.' },
  { if: IF.p(0), who: '레이', ch: 'rei', ex: 'shy', text: '……건반은 내가 칠 거야. 남이 치면 편곡이 망가지니까.' },
  { if: IF.p(1), who: '레이', ch: 'rei', ex: 'smirk', text: '들어오라는 말을 그렇게 쉽게 하는구나.' },
  { if: IF.p(1), who: '레이', ch: 'rei', ex: 'neutral', text: '좋아. 대신 박자 흔들리면 그 자리에서 멈출 거야. 무대 위라도.' },
  { if: IF.p(2), who: '레이', ch: 'rei', ex: 'neutral', text: '기분 내키면.' },
  { if: IF.p(2), text: '레이는 메트로놈 앱을 끄고 나갔다. 문 닫히는 소리까지 정박이었다.' },
]);

/* ---------- Natsu ---------- */
const E2_5 = S('E2_5', '2-5 · F 코드 소리 났어요', [
  { text: '공휴일인 수요일 낮, 개장 전인 0dB 계단에서 기타 케이스를 멘 누군가가 기다리고 있다.' },
  { if: IF.m('natsu'), who: '나츠', ch: 'natsu', ex: 'admire', text: '선배! 오픈 마이크 봤어요! 저 맨 뒤에 있었어요!' },
  { if: IF.not(IF.m('natsu')), who: '기타 멘 남자애', ch: 'natsu', ex: 'admire', text: '저기요! 오픈 마이크 봤어요! 맨 뒤에서요!' },
  { if: IF.not(IF.m('natsu')), who: '기타 멘 남자애', ch: 'natsu', ex: 'shy', text: '아, 갑자기 죄송해요. 이부키 나츠예요. 상점가 헌옷가게에서 알바해요.', eff: { meet: 'natsu' } },
  { who: '나츠', ch: 'natsu', ex: 'grin', text: '밴드 하신다는 거 진짜예요? 점장님이 그러던데.' },
  { who: '@NAME', text: '점장님 입이 가볍네.' },
  { who: '나츠', ch: 'natsu', ex: 'grin', text: '저도 끼워 주세요! 기타요! 선배가 기타 치시면 저는 세컨드라도요!' },
  { who: '나츠', ch: 'natsu', ex: 'shy', text: 'F 코드 이제 소리 나요. 들어 보실래요?' },
  { text: '나츠가 계단에 앉아 기타를 꺼낸다. C, G, Am을 지나 F에서 소리가 났다. 조금 떨리지만 끝까지 울린다.' },
  { if: IF.lv('natsu', 2), text: '검지를 눕히라고 했던 말을 그대로 지키고 있다. 손가락 옆에 물집이 잡혀 있다.' },
  { who: '나츠', ch: 'natsu', ex: 'admire', text: '어때요?' },
  { choice: ['"같이 하자."', '"B♭도 잡으면 와."', '"왜 하필 우리 밴드야?"'], ch: 'natsu', ex: 'admire', eff: [{ bond: { natsu: 3 }, flags: { natsuIn: 'now' } }, { bond: { natsu: 1 }, flags: { natsuIn: 'later' } }, { bond: { natsu: 2 } }] },
  { if: IF.p(0), who: '나츠', ch: 'natsu', ex: 'surprise', text: '진짜요?' },
  { if: IF.p(0), who: '나츠', ch: 'natsu', ex: 'grin', text: '진짜죠? 취소 없어요! 루이 선배한테도 말해도 돼요?' },
  { if: IF.p(1), who: '나츠', ch: 'natsu', ex: 'pout', text: 'B♭……. 그거 F보다 어려운 거죠.' },
  { if: IF.p(1), who: '나츠', ch: 'natsu', ex: 'grin', text: '잡아 올게요. 다음 달 안에요!' },
  { if: IF.p(2), who: '나츠', ch: 'natsu', ex: 'shy', text: '……그 영상 보고 기타 시작했거든요.' },
  { if: IF.p(2), who: '나츠', ch: 'natsu', ex: 'neutral', text: '다들 웃긴 영상이라고 하는데, 저는 계속 이상했어요. 소리가요.' },
  { if: IF.p(2), who: '@NAME', text: '소리가?' },
  { if: IF.p(2), who: '나츠', ch: 'natsu', ex: 'grin', text: '아, 아니에요! 그냥 그렇다고요. 아무튼 끼워 주세요!' },
  { if: IF.p(2), choice: ['"……같이 하자."', '"B♭도 잡으면 와."'], ch: 'natsu', ex: 'grin', eff: [{ bond: { natsu: 2 }, flags: { natsuIn: 'now' } }, { bond: { natsu: 1 }, flags: { natsuIn: 'later' } }] },
]);

/* ---------- the first show ---------- */
const E2_6 = S('E2_6', '2-6 · 관객 다섯 명', [
  { text: '5월 16일 금요일 밤, 0dB 평일 밤 공연 날이다. 우리는 오늘 세 번째 순서다.' },
  { text: '대기실에서 객석을 몰래 내다본다.' },
  { text: '한 명, 두 명……. 세다가 그만뒀다. 손가락을 다 접을 필요도 없었다.' },
  { if: IF.j('natsu'), who: '나츠', ch: 'natsu', ex: 'grin', text: '맨 앞에 있는 둘은 제 반 친구예요! 억지로 끌고 왔어요!' },
  { if: IF.j('ren'), who: '렌', ch: 'ren', ex: 'neutral', text: '카운터 옆은 저희 아버지예요. 가게 일찍 닫고 오셨어요.' },
  { if: IF.f('kotoIn', 'stage'), text: '무대 옆 조명이 안 닿는 자리에서 초록 후드가 앰프 뒤로 반쯤 숨어 있다.' },
  { if: IF.f('kotoIn', 'file'), text: '코토에게서 DM이 와 있다. 「스트리밍 켜 주시면 방에서 볼게요」.' },
  { if: IF.j('rei'), who: '레이', ch: 'rei', ex: 'neutral', text: '관객 수는 세지 마. 박자만 세.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '두 곡이야. 첫 곡은 카운트 넷.' },
  { who: '루이', ch: 'rui', ex: 'sad', text: '두 번째는 그거. 반 박자.' },
  { choice: ['(고개를 끄덕인다)', '"끝까지 칠게."', '"……솔직히 무서워."'], ch: 'rui', ex: 'sad', eff: [{}, { mt: 2, bond: { rui: 1 } }, { mt: -2, bond: { rui: 2 } }] },
  { who: '루이', ch: 'rui', ex: ['neutral', 'smile', 'sad'], text: ['가자.', '그래. 이번엔 끝까지.', '알아. 나도 무서워. 그러니까 같이 가는 거야.'] },
]);
const E2_6M = S('E2_6M', '2-6 · 곡 사이', [
  { text: '첫 곡이 끝났다. 박수는 다섯 명분이다. 그래도 크게 들린다.' },
  { who: '루이', ch: 'rui', ex: 'shy', text: '……다음 곡.' },
  { text: '루이가 MC를 한 줄도 안 하고 바로 넘어갔다. 누군가 웃었다. 나쁜 웃음은 아니었다.' },
]);
const E2_7S = S('E2_7S', '2-7S · 앵콜', [
  { text: '두 번째 곡이 끝나자 다섯 명이 박수를 멈추지 않았다.' },
  { who: '관객', text: '한 곡 더!' },
  { text: '다섯 명이 앵콜을 외쳤다. 평일 밤 0dB에서 앵콜이 나온 건 오랜만이라고 점장이 나중에 말했다.' },
  { who: '루이', ch: 'rui', ex: 'surprise', text: '어떡해. 준비한 곡 없는데.' },
  { choice: ['"카운트 넷, 한 번 더."', '"인사만 하고 내려가자."'], ch: 'rui', ex: 'surprise', eff: [{ fans: 40, mt: 3 }, { mt: 1 }] },
  { if: IF.p(0), text: '같은 곡을 한 번 더 쳤다. 두 번째가 더 빨랐다. 아무도 신경 쓰지 않았다.' },
  { if: IF.all(IF.p(0), IF.j('rei')), who: '레이', ch: 'rei', ex: 'annoyed', text: '6BPM 빨랐어. 오늘만 봐준다.' },
  { if: IF.p(1), text: '고개를 숙였다. 다섯 명의 박수 소리가 계단 위까지 들렸다.' },
  { who: '세리자와 점장', text: '다섯 명이 다섯 명 몫보다 더 떠들었네. PULSE 봐 봐.' },
  { text: '#0dB 태그에 사진이 세 장 올라와 있다. 흔들려서 얼굴은 잘 안 보인다. 그게 다행이었다.' },
]);
const E2_7B = S('E2_7B', '2-7B · 빈 객석', [
  { text: '두 번째 곡 중간에 두 명이 전화를 받으며 나갔다. 우리 탓은 아닐지도 모른다.' },
  { text: '그래도 무대에서는 문이 닫히는 게 다 보였다.' },
  { text: '공연이 끝나고 대기실이 조용하다. 다들 짐을 싸는 척한다.' },
  { text: '누가 옆에 와서 앉았다.' },
  { if: g => topMember(g) === 'rui', who: '루이', ch: 'rui', ex: 'sad', text: '두 명 나간 거, 나도 봤어.' },
  { if: g => topMember(g) === 'rui', who: '루이', ch: 'rui', ex: 'neutral', text: '근데 세 명은 끝까지 있었잖아. 나는 그 세 명 얼굴 기억할 거야.' },
  { if: g => topMember(g) === 'ren', who: '렌', ch: 'ren', ex: 'sad', text: '두 번째 곡, 제가 후렴에서 좀 당겼어요. 죄송해요.' },
  { if: g => topMember(g) === 'ren', who: '렌', ch: 'ren', ex: 'smile', text: '다음엔 안 당길게요. 가게 끝나고 연습 더 해요. 열한 시부터요.' },
  { if: g => topMember(g) === 'koto', text: '휴대폰이 울렸다. 앰프 뒤에 있던 초록 후드는 벌써 사라지고 없다.' },
  { if: g => topMember(g) === 'koto', who: '@kero_P', text: '나간 두 분, 표정 보니까 급한 전화였어요. 곡 때문 아니에요.' },
  { if: g => topMember(g) === 'koto', who: '@kero_P', text: '저는 끝까지 봤어요. 그러니까 여섯 명 중에 넷이 남은 거예요.' },
  { if: g => topMember(g) === 'rei', who: '레이', ch: 'rei', ex: 'neutral', text: '두 명 나갔을 때 박자가 흔들렸어. 그게 문제야.' },
  { if: g => topMember(g) === 'rei', who: '레이', ch: 'rei', ex: 'sad', text: '……나도 흔들렸어. 그러니까 너만 그런 거 아니야.' },
  { if: g => topMember(g) === 'natsu', who: '나츠', ch: 'natsu', ex: 'sad', text: '제 반 친구들은 끝까지 있었어요! 진짜 좋았대요. 진짜로요.' },
  { if: g => topMember(g) === 'natsu', who: '나츠', ch: 'natsu', ex: 'grin', text: '다음엔 반 전체 데려올게요. 담임 선생님까지요.' },
  { text: '대기실 불을 끄고 나왔다. 다섯 명 중 세 명이 남았다. 숫자로 보면 초라한데, 세 사람 얼굴은 다 기억났다.' },
]);

/* ---------- the name ---------- */
const E2_8 = S('E2_8', '2-8 · 이름을 정하는 밤', [
  { text: '일요일 밤, 공연이 끝난 0dB 대기실에서 점장이 포스터 시안을 테이블에 던졌다.' },
  { who: '세리자와 점장', text: '다음 달 포스터 만들어야 하는데. 밴드 이름 뭐야?' },
  { text: '다들 서로 얼굴만 본다. 아무도 정하지 않았다.' },
  { if: IF.j('natsu'), who: '나츠', ch: 'natsu', ex: 'grin', text: '「47 SECONDS」 어때요!' },
  { if: IF.j('natsu'), who: '루이', ch: 'rui', ex: 'angry', text: '나츠.' },
  { if: IF.j('natsu'), who: '나츠', ch: 'natsu', ex: 'shy', text: '……취소요.' },
  { if: IF.j('ren'), who: '렌', ch: 'ren', ex: 'shy', text: '「BPM120」은요. 제일 편한 템포라서요.' },
  { if: IF.j('rei'), who: '레이', ch: 'rei', ex: 'smirk', text: '「Opus 0」. 아직 작품 번호도 없는 애들이니까.' },
  { if: IF.j('koto'), text: '휴대폰이 울린다. 코토다. 「우물 밖 개구리」 어때요. 싫으면 무시해 주세요.' },
  { who: '루이', ch: 'rui', ex: 'neutral', text: '……「RE:AMP」.' },
  { who: '루이', ch: 'rui', ex: 'shy', text: '꺼진 앰프를 다시 켠다는 뜻. 방금 생각한 거야. 아니, 좀 전부터.' },
  { who: '세리자와 점장', text: '정해. 포스터는 내일 인쇄 넘길 거야.' },
]);
const E2_8B = S('E2_8B', '2-8 · 이름', [
  { who: '세리자와 점장', text: '「@BAND」. 좋네. 포스터에 크게 박아 줄게.' },
  { who: '루이', ch: 'rui', ex: 'smile', text: '……@BAND.' },
  { text: '루이가 입에 붙는지 확인하듯 한 번 더 작게 불러 봤다.' },
]);
const E2_9 = S('E2_9', '2-9 · 결성', [
  { text: '점장이 대기실 벽 앞에 우리를 세웠다. SIGNAL LOST 사인 바로 옆에 빈자리가 있다.' },
  { who: '세리자와 점장', text: '사진 찍자. 가게 계정에 올릴 거야. 얼굴 가리고 싶은 사람은 가려.' },
  { text: '루이는 마스크를 고쳐 썼다.' },
  { if: IF.f('kotoIn', 'stage'), text: '코토는 후드를 끝까지 당겨 썼다. 그래도 사진 안에는 들어왔다.' },
  { if: IF.f('kotoIn', 'file'), text: '코토는 영상 통화 화면으로 들어왔다. 휴대폰 화면 속 개구리 후드가 꾸벅 인사했다.' },
  { if: IF.j('ren'), text: '렌은 맨 뒤에 섰다. 그래도 머리 하나가 더 나왔다.' },
  { if: IF.j('rei'), text: '레이는 "하나, 둘" 하고 박자를 세더니 셋에 정확히 표정을 바꿨다.' },
  { if: IF.j('natsu'), text: '나츠는 두 손으로 브이를 했다.' },
  { who: '세리자와 점장', text: '하나, 둘……' },
  { text: '셔터 소리가 났다. 사진 속 나는 웃고 있었다. 이렇게 웃으며 찍힌 게 언제가 마지막이었는지 기억나지 않는다.' },
  { text: 'SIGNAL LOST 사인 바로 옆, 사진 아래에 매직으로 「@BAND」라고 적었다.' },
]);

/* the name: candidates from whoever's in the band, or your own */
function bandNameStep(next) {
  const g = W.g;
  const c = [['RE:AMP', '루이'], ...[['natsu', '47 SECONDS'], ['ren', 'BPM120'], ['rei', 'Opus 0'], ['koto', '우물 밖 개구리']].filter(([id]) => g.joined.includes(id)).map(([id, n]) => [n, nm(id)])];
  const set = n => { g.bandName = n; writeSave(); next(); };
  const own = () => {
    const ov = modal({ title: '<small>BAND NAME</small>직접 짓기', body: '<input class="bn-in" maxlength="16" placeholder="밴드 이름 (16자까지)">', buttons: [{ t: '정했다', fn: () => { const v = ($('.bn-in') ? $('.bn-in').value : '').trim(); set(v || 'RE:AMP'); } }] });
    setTimeout(() => { const i = $('.bn-in'); if (i) { i.focus(); i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ov.key('ok'); } }); } }, 60);
  };
  modal({ title: '<small>BAND NAME</small>밴드 이름', body: '포스터에 들어갈 이름이에요. 한번 정하면 바꿀 수 없어요.', buttons: [...c.map(([n, who]) => ({ t: `${n} <small>${who}</small>`, fn: () => set(n) })), { t: '직접 짓기', fn: own }] });
}

CH[2] = {
  no: '02', en: 'CHAPTER 2', name: '결성', bg: 'street', span: '4월 말 ~ 5월 · 첫 밴드 공연',
  desc: '멤버를 모으고 밴드 이름을 정한다. 평일 밤, 관객 다섯 명 앞의 첫 공연.',
  goals: g => [['멤버 모으기', g.joined.length >= 3], ['첫 밴드 공연', !!g.ep['2-6']], ['밴드 이름', !!g.bandName]],
  show: '2-6', showName: 'FIRST SHOW', end: '2-9',
  forks: [{ c: 2, t: '선택 · 먼저 찾아간 사람' }, { c: 3, t: '조건 · 합류할까' }, { c: 6, t: '결과 · 두 번째 곡 랭크' }],
  nodes: [
    { id: '2-1', c: 0, l: 2, type: 'talk', t: '빈자리 세기', day: 14, time: '밤', who: 'rui', desc: '점장이 5월 16일 평일 밤 자리를 내준다. 조건은 밴드일 것.', chg: ['첫 공연 날짜가 정해진다'], rw: [], from: ['1-10'],
      steps: [{ adv: E2_1, bg: 'stage', place: '<b>0dB</b> 홀 · 공연 후' }] },
    { id: '2-2', c: 1, l: 2, type: 'live', t: '둘이서 맞춰 보기', day: 16, time: '밤', who: 'rui', desc: '루이와 처음으로 스튜디오에서 합주한다. 곡은 그날의 두 번째 곡.', chg: ['랭크에 따라 루이의 반응', '누구를 먼저 찾아갈지 정한다'], rw: ['팬', '루이 SYNC'], from: ['2-1'],
      steps: [{ adv: E2_2, bg: 'studio_night', place: '<b>UNDERPASS 스튜디오</b> · 밤' }, { live: { song: 'hanpaku', len: 'hl', bg: 'studio_night', label: () => `RUI & ${G.name}` } }, { adv: E2_2B, bg: 'studio_night', place: '<b>UNDERPASS 스튜디오</b> · 밤' }],
      log: g => `먼저 찾아간 사람 · ${nm(g.flags.first2)}` },
    { id: '2-3A', c: 2, l: 1, type: 'ev', who: 'ren', t: '라멘집 뒷문', day: 17, time: '밤', alt: true, desc: '문 닫은 라멘집 뒤 골목. 렌이 빈 양동이를 두드리고 있다.', chg: ['렌이 드럼을 그만두려는 이유에 가까워진다'], rw: ['렌 ♥'], from: ['2-2'], when: IF.f('first2', 'ren'),
      steps: [{ adv: E2_3A, bg: 'ramen_night', place: '<b>멘야 도돈</b> 뒷골목 · 밤' }] },
    { id: '2-3B', c: 2, l: 2, type: 'ev', who: 'koto', t: '자판기 옆 개구리', day: 17, time: '밤', alt: true, desc: 'kero_P가 베이스 라인을 두고 가겠다고 한다. 0dB 앞 자판기 옆에.', chg: ['kero_P의 이름을 알게 된다'], rw: ['코토 ♥'], from: ['2-2'], when: IF.f('first2', 'koto'),
      steps: [{ adv: E2_3B, bg: 'street_night', place: '<b>PULSE</b> DM · 밤' }] },
    { id: '2-3C', c: 2, l: 3, type: 'live', who: 'rei', t: '틀린 음 세 개', day: 17, time: '밤', alt: true, desc: '레이가 건반으로 한 곡 쳐 보라고 한다. 틀린 음 세 개까지만 봐준다.', chg: ['랭크가 레이의 합류 조건이 된다'], rw: ['레이 ♥'], from: ['2-2'], when: IF.f('first2', 'rei'),
      steps: [{ adv: E2_3C, bg: 'record_night', place: '<b>레코드샵 사이드B</b> · 밤' }, { live: { song: 'count4', len: 'hl', bg: 'record_night', part: 'KEY', noFail: true, label: 'TRIAL · KEYS' } }, { adv: E2_3C2, bg: 'record_night', place: '<b>레코드샵 사이드B</b> · 밤' }] },
    { id: '2-4A', c: 3, l: 1, type: 'talk', who: 'ren', t: '스틱을 반납하러 온 밤', day: 21, time: '저녁', alt: true, desc: '렌이 쓰던 스틱을 점장에게 돌려주러 0dB에 온다. 붙잡을지, 그냥 받을지.', chg: ['렌 ♥LV2 이상이면 붙잡을 수 있다 → 렌 합류', '붙잡지 않으면 렌은 3장에서 다시'], rw: ['렌 ♥'], from: ['2-3A'],
      steps: [{ adv: E2_4A, bg: 'stage', place: '<b>0dB</b> 카운터 · 월요일' }], eff: g => g.flags.renIn ? { join: 'ren' } : {}, log: g => g.flags.renIn ? '렌을 붙잡았다 · 렌 합류' : '렌을 붙잡지 않았다' },
    { id: '2-4B', c: 3, l: 2, type: 'talk', who: 'koto', t: '첫 번째 파일', day: 21, time: '밤', alt: true, desc: '코토의 베이스 트랙을 루이와 함께 들어 본다. 그날 밤, 코토에게 다시 묻는다.', chg: ['코토 ♥LV2 이상이면 무대 옆으로 부를 수 있다', '파일로만 같이 해도 합류'], rw: ['코토 ♥'], from: ['2-3B'],
      steps: [{ adv: E2_4B, bg: 'studio_night', place: '<b>UNDERPASS 스튜디오</b> · 밤' }], eff: g => g.flags.kotoIn ? { join: 'koto' } : {}, log: g => g.flags.kotoIn === 'stage' ? '코토 합류 · 무대 옆에서' : g.flags.kotoIn === 'file' ? '코토 합류 · 파일로만' : '코토에게 다음에 묻기로 했다' },
    { id: '2-4C', c: 3, l: 3, type: 'talk', who: 'rei', t: '3BPM', day: 21, time: '밤', alt: true, desc: '레이가 루이와의 연습을 들으러 온다. 메트로놈 앱을 켠 채로.', chg: ['2-3C 랭크 A 이상이거나 레이 ♥LV2 이상이면 편곡을 맡길 수 있다 → 레이 합류'], rw: ['레이 ♥'], from: ['2-3C'],
      steps: [{ adv: E2_4C, bg: 'studio_night', place: '<b>UNDERPASS 스튜디오</b> · 밤' }], eff: g => g.flags.reiIn ? { join: 'rei' } : {}, log: g => g.flags.reiIn ? '레이 합류 · 편곡 크레딧' : '레이는 아직' },
    { id: '2-5', c: 4, l: 2, type: 'ev', who: 'natsu', t: 'F 코드 소리 났어요', day: 23, time: '낮', desc: '0dB 계단에서 기타를 멘 남자애가 기다리고 있다.', chg: ['나츠를 지금 들일지, 다음으로 미룰지'], rw: ['나츠 ♥'], from: ['2-4A', '2-4B', '2-4C'],
      steps: [{ adv: E2_5, bg: 'street', place: '<b>0dB</b> 계단 · 공휴일 낮' }], eff: g => g.flags.natsuIn === 'now' ? { join: 'natsu' } : {}, log: g => g.flags.natsuIn === 'now' ? '나츠 합류' : '나츠에게 B♭을 잡아 오라고 했다' },
    { id: '2-6', c: 5, l: 2, type: 'live', t: '관객 다섯 명', day: 39, time: '밤', desc: '0dB 평일 밤. 객석에는 다섯 명. 합류한 멤버가 함께 선다. 두 곡.', chg: ['두 번째 곡 랭크 A 이상 → 「앵콜」', 'B 이하 → 「빈 객석」'], rw: ['팬', '¥', 'SYNC'], from: ['2-5'], need: { fans: 300, lives: 3 },
      steps: [{ adv: E2_6, bg: 'backstage', place: '<b>0dB</b> 대기실 · 금요일 밤' }, { live: { song: 'count4', len: 'hl', bg: 'stage', party: 'band', ask: '첫 곡 · カウント四つ에서 칠 악기' } }, { adv: E2_6M, bg: 'stage', place: '<b>0dB</b> · 곡 사이' }, { live: { song: 'hanpaku', len: 'hl', bg: 'stage', party: 'band', ask: '두 번째 곡 · 半拍ずれたまま에서 칠 악기' } }],
      log: g => `첫 공연 · ${g.ep['2-6'] && g.ep['2-6'].rank}랭크` },
    { id: '2-7S', c: 6, l: 1, type: 'cut', t: '앵콜', day: 39, time: '밤', alt: true, desc: '다섯 명이 박수를 멈추지 않는다.', chg: ['PULSE에 첫 사진이 올라온다'], rw: ['팬 +80', '멘탈 +5'], from: ['2-6'], when: IF.rk('2-6', 3),
      steps: [{ adv: E2_7S, bg: 'stage', place: '<b>0dB</b> · 공연 직후' }], eff: { fans: 80, mt: 5, flags: { encore1: true } } },
    { id: '2-7B', c: 6, l: 3, type: 'talk', t: '빈 객석', day: 39, time: '밤', alt: true, desc: '다섯 명 중 둘이 중간에 나갔다. 대기실이 조용하다.', chg: ['가장 가까운 멤버와 둘이서 이야기한다'], rw: ['♥ +4 (한 명)'], from: ['2-6'], when: IF.not(IF.rk('2-6', 3)),
      steps: [{ adv: E2_7B, bg: 'backstage', place: '<b>0dB</b> 대기실 · 공연 후' }], eff: g => ({ bond: { [topMember(g)]: 4 }, mt: 2 }), log: g => `옆에 앉은 사람 · ${nm(topMember(g))}` },
    { id: '2-8', c: 7, l: 2, type: 'talk', t: '이름을 정하는 밤', day: 41, time: '밤', desc: '점장이 포스터를 만들겠다며 밴드 이름을 묻는다.', chg: ['밴드 이름 (포스터 · 라이브 · PULSE)'], rw: [], from: ['2-7S', '2-7B'],
      steps: [{ adv: E2_8, bg: 'backstage', place: '<b>0dB</b> 대기실 · 일요일 밤' }, { fn: bandNameStep }, { adv: E2_8B, bg: 'backstage', place: '<b>0dB</b> 대기실 · 일요일 밤' }], log: g => `밴드 이름 · ${g.bandName}` },
    { id: '2-9', c: 8, l: 2, type: 'cut', t: '결성', day: 41, time: '밤', desc: '대기실 벽 앞에서 첫 단체 사진을 찍는다.', chg: ['CHAPTER 3가 열린다'], rw: ['팬 +50'], from: ['2-8'],
      steps: [{ adv: E2_9, bg: 'backstage', place: '<b>0dB</b> 대기실 · 일요일 밤' }], eff: { fans: 50, mt: 4 } },
  ],
};
