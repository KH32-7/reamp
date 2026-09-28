/* RE:AMP! — SHOP (v2): money from lives and 0dB shifts buys gifts (given in TOWN), items and stage costumes.
   like: 3 = 아주 좋아함 · 2 = 좋아함 · (없음) 1 = 보통 · 0 = 별로 */
'use strict';

const ITEMS = [
  // gifts
  { id: 'soda', cat: '선물', n: '레몬 탄산수', k: '泡', c: 'var(--c-rui)', p: 250, d: '편의점 냉장고 맨 아래 칸에 있는 무가당 레몬 탄산수.', like: { rui: 3, natsu: 2, rei: 0 } },
  { id: 'melon', cat: '선물', n: '편의점 멜론빵', k: '甘', c: 'var(--c-natsu)', p: 180, d: '겉은 바삭하고 속은 폭신하다. 저녁 여섯 시면 다 팔린다.', like: { natsu: 3, koto: 2 } },
  { id: 'frog', cat: '선물', n: '개구리 캡슐 토이', k: '蛙', c: 'var(--c-koto)', p: 400, d: '상점가 입구 뽑기 기계. 뭐가 나올지 모른다. 전부 개구리다.', like: { koto: 3, natsu: 2, rei: 0 } },
  { id: 'katsuo', cat: '선물', n: '가다랑어포 한 덩이', k: '節', c: 'var(--c-ren)', p: 1600, d: '건어물 가게 할아버지가 "국물 내는 사람한테 줘"라고 한 물건.', like: { ren: 3, rui: 0 } },
  { id: 'score', cat: '선물', n: '절판 악보 복사본', k: '譜', c: 'var(--c-rei)', p: 1200, d: '사이드B 창고에서 나온 옛 교본. 연필 자국이 조금 남아 있다.', like: { rei: 3, koto: 2 } },
  { id: 'candy', cat: '선물', n: '허브 목캔디', k: '喉', c: 'var(--c-rui)', p: 300, d: '노래하는 사람들이 주머니에 넣고 다니는 그 캔디.', like: { rui: 2, rei: 2 } },
  { id: 'gstr', cat: '선물', n: '기타 줄 한 세트', k: '弦', c: 'var(--c-natsu)', p: 900, d: '09 게이지. 손가락이 아직 덜 단단한 사람에게 맞는 굵기.', like: { natsu: 3 } },
  { id: 'sticks', cat: '선물', n: '히코리 드럼 스틱', k: '棒', c: 'var(--c-ren)', p: 1400, d: '5A 한 쌍. 손에 쥐면 무게가 앞쪽으로 살짝 쏠린다.', like: { ren: 2 } },
  { id: 'plugs', cat: '선물', n: '뮤지션 귀마개', k: '耳', c: 'var(--c-koto)', p: 1100, d: '소리를 줄이되 뭉개지 않는 귀마개. 시끄러운 곳이 힘든 사람에게.', like: { koto: 2, rei: 2 } },
  { id: 'mask', cat: '선물', n: '새 천 마스크', k: '布', c: 'var(--c-rui)', p: 500, d: '검은 면 마스크. 끈이 부드럽다.', like: { rui: 2 } },
  { id: 'bar', cat: '선물', n: '초코 에너지바', k: '糖', c: 'var(--c-natsu)', p: 150, d: '가방에 하나쯤 있으면 든든하다.', like: { natsu: 2, rei: 0 } },
  // items: used right away or kept for the next live
  { id: 'drink', cat: '아이템', n: '에너지 드링크', k: '力', c: 'var(--cobalt)', p: 500, d: '바로 마신다. 체력 +25.', use: { hp: 25 } },
  { id: 'yuzu', cat: '아이템', n: '따뜻한 유자차', k: '茶', c: 'var(--cobalt)', p: 400, d: '바로 마신다. 멘탈 +8.', use: { mt: 8 } },
  { id: 'strings', cat: '아이템', n: '새 줄 세트', k: '新', c: 'var(--cobalt)', p: 1200, d: '다음 LIVE 한 번 팬 +20%.', buff: 'strings' },
  { id: 'eartip', cat: '아이템', n: '인이어 이어팁', k: '耳', c: 'var(--cobalt)', p: 900, d: '다음 LIVE 한 번 관객 열기 +10으로 시작.', buff: 'eartip' },
  { id: 'coupon', cat: '아이템', n: '스튜디오 회원 쿠폰', k: '練', c: 'var(--cobalt)', p: 2000, d: 'UNDERPASS 스튜디오 합주 연습 3번 무료.', buff: 'studio', n3: 3 },
  // stage costumes (art pending: owning one already counts)
  { id: 'cos_you', cat: '코스튬', n: '0dB 스태프 티셔츠', who: 'you', k: '0', c: '#4FE3FF', p: 3000, d: '점장이 "이거 입고 무대 서면 가게 홍보도 되고 좋잖아"라고 했다.' },
  { id: 'cos_rui', cat: '코스튬', n: '루이 · 레이스 마스크 세트', who: 'rui', k: '仮', c: 'var(--c-rui)', p: 5800, d: '검은 레이스 마스크와 맞춤 재킷.' },
  { id: 'cos_ren', cat: '코스튬', n: '렌 · 가게 법피', who: 'ren', k: '麺', c: 'var(--c-ren)', p: 4800, d: '「멘야 도돈」 글씨가 등에 크게 박힌 법피.' },
  { id: 'cos_natsu', cat: '코스튬', n: '나츠 · 빈티지 청재킷', who: 'natsu', k: '夏', c: 'var(--c-natsu)', p: 4200, d: '헌옷가게 창고에서 나츠가 몰래 찜해 둔 재킷.' },
  { id: 'cos_rei', cat: '코스튬', n: '레이 · 연주회 블라우스', who: 'rei', k: '玲', c: 'var(--c-rei)', p: 6400, d: '목 끝까지 단추가 달린 흰 블라우스.' },
  { id: 'cos_koto', cat: '코스튬', n: '코토 · 개구리 후드', who: 'koto', k: '琴', c: 'var(--c-koto)', p: 4600, d: '모자에 눈이 두 개 달린 초록 후드.' },
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const SHOP_CAT = ['선물', '아이템', '코스튬'];
const LIKE_W = ['별로일 것 같다', '', '좋아할 것 같다', '아주 좋아할 것 같다'];

scene('shop', {
  title: '상점', cls: 'sh3', via: 'shutter',
  html: () => `${bgImg('thrift_day', 'sh-img')}<div class="sh-tint"></div>${bigWord('SHOP', 'sh-word')}
    <div class="s3-head"><b>나기사카 상점가</b><small>선물 · 아이템 · 무대 의상</small></div>
    <div class="s3-money">¥ <b></b></div>
    <div class="s3-cats">${SHOP_CAT.map(c => `<span>${c}</span>`).join('')}</div>
    <div class="s3-grid"></div>
    <div class="s3-det"><div class="dk"></div><b class="dn"></b><p class="dd"></p><div class="dl"></div><div class="dh"></div><div class="dp"></div><span class="db" data-tap="ok">사기 ▶</span></div>
    ${backChip()}
    ${hint([['A', '사기'], ['B', '메뉴'], ['↕↔', '상품'], ['L', '분류'], ['R', '분류']], 'SHOP')}`,
  init(el) {
    this.cat = 0;
    this.CL = List($$('.s3-cats span', el), { hover: false, onChange: (n, x, silent) => { this.cat = n; if (!silent) this.fill(true); } });
  },
  list() { return ITEMS.filter(i => i.cat === SHOP_CAT[this.cat]); },
  fill(anim) {
    const el = this.el, items = this.list(), g = W.g, grid = $('.s3-grid', el);
    grid.innerHTML = items.map(it => `<div class="s3-c${it.cat === '코스튬' && g.bag[it.id] ? ' owned' : ''}" style="--c:${it.c}">
      <div class="art">${it.who && it.who !== 'you' ? `<img src="img/ill/${it.who}.webp" alt="">` : `<span>${it.k}</span>`}</div><b>${it.n}</b><em>${it.cat === '코스튬' && g.bag[it.id] ? '보유' : `¥${it.p.toLocaleString('en-US')}`}</em>${it.cat === '선물' && g.bag[it.id] ? `<i class="cnt">×${g.bag[it.id]}</i>` : ''}</div>`).join('');
    this.IL = List($$('.s3-c', el), { loop: false, start: Math.min(this.n || 0, items.length - 1), onChange: n => this.det(n), onPick: () => this.key('ok') });
    this.det(this.IL.i);
    if (anim) stagger($$('.s3-c', el), [{ opacity: 0, translate: '0 18px' }, { opacity: 1, translate: '0 0' }], T.slam, 0, 35);
  },
  det(n) {
    const el = this.el, it = this.list()[n], g = W.g;
    this.n = n;
    const card = $$('.s3-c', el)[n], grid = $('.s3-grid', el);   // keep the chosen card inside the scrolling grid
    if (card) { const t = card.offsetTop - 8, b = t + card.offsetHeight + 16; if (t < grid.scrollTop) grid.scrollTo({ top: t, behavior: 'smooth' }); else if (b > grid.scrollTop + grid.clientHeight) grid.scrollTo({ top: b - grid.clientHeight, behavior: 'smooth' }); }
    const k = $('.dk', el);
    k.innerHTML = it.who && it.who !== 'you' ? `<img src="img/ill/${it.who}.webp" alt="">` : `<span>${it.k}</span>`;
    k.style.setProperty('--c', it.c);
    $('.dn', el).textContent = it.n; $('.dd', el).textContent = it.d;
    // who'd like it: only for people you know well enough (♥ LV2+)
    const known = it.like ? Object.entries(it.like).filter(([w]) => W.lv(w) >= 2) : [];
    $('.dl', el).innerHTML = it.cat === '선물' ? (known.length ? `<small>이런 반응일 것 같다</small>${known.map(([w, h]) => `<span style="--c:var(--c-${w})"><img src="${icon(w)}" alt="">${h >= 2 ? '♥'.repeat(h - 1) : '✕'}</span>`).join('')}` : '<small>누가 좋아할지는 친해져야 알 수 있어요 (♥ LV2)</small>') : '';
    $('.dh', el).textContent = it.cat === '선물' ? `가지고 있는 것 ${g.bag[it.id] || 0}개 · TOWN에서 만난 사람에게 줄 수 있어요` : it.cat === '코스튬' ? '무대 의상 일러는 준비 중이에요. 가지고 있으면 LIVE 팬 +3%.' : it.buff ? `대기 중 ${g.buff[it.buff] || 0}회` : '';
    $('.dp', el).textContent = `¥${it.p.toLocaleString('en-US')}`;
    $('.db', el).classList.toggle('off', it.cat === '코스튬' && !!g.bag[it.id]);
  },
  paintMoney() { $('.s3-money b', this.el).textContent = W.g.money.toLocaleString('en-US'); },
  enter() {
    const el = this.el;
    W.g || W.init();
    this.CL.set(this.cat, true); this.fill(false); this.paintMoney();
    A($('.sh-img', el), KF.fade, 800);
    A($('.sh-word', el), KF.fromRight('20%'), 900, { e: EZ.soft });
    A($('.s3-head', el), KF.fromLeft(), T.char);
    stagger($$('.s3-cats span', el), KF.fromLeft('-60%'), T.char, 150, 60);
    stagger($$('.s3-c', el), [{ opacity: 0, translate: '0 25px' }, { opacity: 1, translate: '0 0' }], T.char, 250, 45);
    A($('.s3-det', el), KF.fromRight('20%'), T.char, { delay: 350 });
    A($('.s3-money', el), KF.fromTop('-100%'), T.char, { delay: 250 });
  },
  buy(it) {
    const g = W.g;
    if (g.money < it.p) { shake($('.s3-money', this.el)); return toast('돈이 모자라요 · LIVE나 0dB 알바로 벌 수 있어요'); }
    g.money -= it.p;
    let msg = '샀어요';
    if (it.use) { W.begin(); W.apply(it.use); W.pend = null; msg = `${it.n} · ${Object.entries(it.use).map(([k, v]) => `${k === 'hp' ? '체력' : '멘탈'} +${v}`).join(' ')} (체력 ${g.hp} · 멘탈 ${g.mt})`; }
    else if (it.buff) { g.buff[it.buff] = (g.buff[it.buff] || 0) + (it.n3 || 1); msg = `${it.n} · 다음 LIVE에 적용돼요`; }
    else { g.bag[it.id] = (g.bag[it.id] || 0) + 1; if (it.cat === '선물') msg = `${it.n} · TOWN에서 만난 사람에게 줄 수 있어요`; }
    writeSave(); saving(); toast(msg);
    this.paintMoney(); this.fill(false);
  },
  key(k) {
    const cols = 3;
    if (k === 'l1' || k === 'r1') { this.n = 0; this.CL.move(k === 'l1' ? -1 : 1); }
    else if (k === 'left') this.IL.move(-1);
    else if (k === 'right') this.IL.move(1);
    else if (k === 'up' || k === 'down') { for (let i = 0; i < cols; i++) this.IL.move(k === 'up' ? -1 : 1); }
    else if (k === 'ok') {
      const it = this.list()[this.n], g = W.g;
      if (it.cat === '코스튬' && g.bag[it.id]) return toast('이미 가지고 있어요'), true;
      confirmBox(it.n, `¥${it.p.toLocaleString('en-US')}에 살까요? (잔액 ¥${g.money.toLocaleString('en-US')})`, () => this.buy(it));
    } else if (k === 'back') go('menu', { via: 'sweepBack', push: false });
    else return undefined;
    return true;
  },
});
