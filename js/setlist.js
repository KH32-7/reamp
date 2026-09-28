/* RE:AMP! — LIVE (v2): pick a song, play it with whoever is in the band, earn fans, money and SYNC.
   Fans open story episodes (Cytus-style); SYNC makes each member steadier on stage; 체력 is what a live costs. */
'use strict';

const PART_OF = { natsu: 'GT', koto: 'BA', ren: 'DR', rei: 'KEY' };
/* the band on stage for your part: joined members with a lane (Rui sings; the member on your part moves to SUB, except
   Natsu, who then plays lead) */
function myBand(part) {
  const g = W.g;
  if (!g) return [];
  return bandParty(part).filter(m => g.joined.includes(m.id)).map(m => ({ ...m, cond: W.cond(m.id) }));
}
function bandLabel(party) {
  const g = W.g;
  if (g && g.bandName) return g.bandName;
  if (g && g.joined.length) return party.length ? 'NEW BAND' : `RUI & ${G.name}`;
  return 'SOLO';
}
/* crowd heat at the start: your mood, and whether you're worn out */
function heatStart() {
  const g = W.g;
  if (!g) return 60;
  return Math.max(30, Math.min(80, 60 + Math.round((g.mt - 50) / 5) + (g.hp < 15 ? -15 : 0) + (g.buff.eartip ? 10 : 0)));
}
const LIVE_COST = len => len === 'full' ? 10 : 6;
function liveReward(r, o) {
  const g = W.g;
  if (!g) return;
  const RB = { SS: 130, S: 110, A: 90, B: 70, C: 50, D: 35, F: 10 };
  const lenM = o.len === 'full' ? 1.6 : 1, diffM = [.7, 1, 1.25, 1.5][o.diff] ?? 1;
  const bandM = 1 + .12 * o.party.length + (g.joined.includes('rui') ? .1 : 0);
  const wear = Object.keys(g.bag).filter(k => ITEM[k] && ITEM[k].cat === '코스튬' && g.bag[k] > 0).length;
  let fans = Math.round(RB[r.rank] * lenM * diffM * bandM * (o.story ? 1.5 : 1) * (1 + wear * .03));
  if (g.buff.strings) { fans = Math.round(fans * 1.2); g.buff.strings--; }
  if (g.buff.eartip) g.buff.eartip--;
  const money = r.failed ? 0 : Math.round(fans * 14 / 100) * 100;
  const sy = { SS: 40, S: 34, A: 28, B: 20, C: 14, D: 10, F: 4 }[r.rank] * lenM + (r.eyes ? r.eyes.hit * 3 : 0);
  const sync = {};
  for (const m of o.party) sync[m.id] = Math.round(sy * (g.buff.studio ? 1.2 : 1));
  if (g.joined.includes('rui')) sync.rui = Math.round(sy * .8);
  W.apply({ fans, money, sync, hp: -LIVE_COST(o.len), mt: r.failed ? -6 : RANK_N[r.rank] >= 3 ? 2 : 0 });
  if (r.clear) {
    g.lives++;
    const b = g.clears[o.song];
    if (!b || RANK_N[r.rank] > RANK_N[b]) g.clears[o.song] = r.rank;
  }
  writeSave();
}
/* the next thing fans open */
function nextUnlock() {
  const g = W.g;
  for (let n = 1; CH[n]; n++) for (const e of CH[n].nodes) {
    const s = epState(e);
    if (s === 'lock') return e;
  }
  for (let n = 1; CH[n]; n++) for (const e of CH[n].nodes) if (e.need && !g.ep[e.id] && !needMet(e.need) && epState(e) !== 'closed') return e;
  return null;
}

/* ---------------- LIVE · song select ---------------- */
scene('setlist', {
  title: '곡 선택', cls: 'ss', via: 'shutter',
  html: () => `${bgImg('stage', 'ss-img')}<div class="bgtxt">LIVE</div>
    <div class="left">
      <div class="title">LIVE <b>SELECT</b></div>
      <div class="jacket has-img"></div>
      <div class="eq"><i></i><i></i><i></i><i></i><i></i><span>PREVIEW</span></div>
      <div class="meta1"></div><div class="meta2"></div>
      <div class="meta3"><div>BPM<b class="m-bpm"></b></div><div>BEST<b class="m-best">—</b></div><div>BAND<b class="m-band"></b></div></div>
    </div>
    <div class="tabs"><span class="arrow" data-tap="left">◀</span>${DIFFS.map(d => `<span class="tb"><span class="unskew">${d}</span></span>`).join('')}<span class="arrow" data-tap="right">▶</span></div>
    <div class="sortbar"><span class="unskew">내 파트 · Q / E</span><span class="inst unskew">${PARTS.map(p => `<i data-v="${p[0]}">${p[2]}</i>`).join('')}</span></div>
    <div class="wheel">${SONGS.map(x => `<div class="row"><div class="thumb" style="background:url(${x.jk}) center/cover"></div><div class="tx"><div class="nm">${x.title}</div><div class="ar">${x.sub}</div></div><div class="lv"></div></div>`).join('')}</div>
    <div class="cursor"></div>
    <div class="ss-cond"></div>
    <div class="ss-fan"><div class="f-top"><span>FAN</span><b class="f-n"></b><small class="f-goal"></small></div><div class="f-bar"><i></i></div><div class="f-next"></div></div>
    ${backChip()}
    ${hint([['B', '메뉴'], ['←→', '난이도'], ['L', '파트'], ['R', '파트'], ['↕', '곡']], 'Z · START')}`,
  init(el) {
    this.rows = $$('.wheel .row', el);
    G.song = G.song || 0;
    this.W = Scroller(this.rows, {
      loop: false, start: G.song, ease: .14,
      layout: (r, off) => {
        const a = Math.abs(off);
        r.style.transform = `translate(${-a * a * 18}px, ${off * 124}px) skewX(-14deg) scale(${1 - Math.min(a, 3) * .05})`;
        r.style.opacity = a > 2.6 ? 0 : 1 - Math.max(0, a - 1.6);
        r.style.zIndex = 10 - Math.round(a);
      },
      onChange: (n, r, silent) => { G.song = n; if (!silent) this.paint(true); },
      onPick: () => this.key('ok'),
    });
    this.TL = List($$('.tb', el), { hover: false, start: G.diff ?? 1, onChange: n => { G.diff = n; } });
    $$('.sortbar i', el).forEach(i => i.addEventListener('click', e => { e.stopPropagation(); G.inst = i.dataset.v; this.paint(false); }));
  },
  paint(anim) {
    const el = this.el, s = SONGS[G.song], g = W.g, jk = $('.jacket', el);
    const apply = () => {
      jk.style.background = `url(${s.jk}) center/cover`;
      $('.meta1', el).textContent = s.title; $('.meta2', el).textContent = s.sub;
      $('.m-bpm', el).textContent = s.bpm;
      $('.m-best', el).textContent = g.clears[s.id] || '—';
      el.style.setProperty('--eq', (60 / s.bpm) + 's');
    };
    const party = myBand(G.inst);
    $('.m-band', el).textContent = party.length + 1 + (g.joined.includes('rui') ? 1 : 0);
    $$('.sortbar i', el).forEach(i => i.classList.toggle('on', i.dataset.v === G.inst));
    this.rows.forEach((r, i) => { $('.lv', r).textContent = g.clears[SONGS[i].id] || ''; });
    if (!anim) return apply();
    A(jk, [{ rotate: '0 1 0 0deg' }, { rotate: '0 1 0 90deg' }], 150, { e: EZ.wipe }).finished.then(() => {
      apply();
      A(jk, [{ rotate: '0 1 0 -90deg' }, { rotate: '0 1 0 0deg' }], 260, { e: EZ.slam });
    });
    A($('.meta1', el), KF.fromLeft('-10%'), T.slam, { delay: 150 });
  },
  status() {
    const el = this.el, g = W.g;
    const nx = nextUnlock(), goal = nx && nx.need && nx.need.fans ? nx.need.fans : null;
    $('.f-n', el).textContent = g.fans.toLocaleString('en-US');
    $('.f-goal', el).textContent = goal ? `/ ${goal.toLocaleString('en-US')}` : '';
    const nd = nx && nx.need, ratio = !nd ? 1 : Math.min(nd.fans ? g.fans / nd.fans : 1, nd.lives ? g.lives / nd.lives : 1);
    $('.f-bar i', el).style.width = Math.min(100, ratio * 100) + '%';
    $('.f-next', el).innerHTML = nx ? `다음 해금 · <b>${nx.id} 「${nx.t}」</b> · ${needText(nx.need)}` : '지금 열 수 있는 에피소드는 다 열었어요';
    $('.ss-cond', el).innerHTML = `<span>체력 <b class="${g.hp < 15 ? 'lo' : ''}">${g.hp}</b></span><span>멘탈 <b class="${g.mt < 30 ? 'lo' : ''}">${g.mt}</b></span><span>¥ <b>${g.money.toLocaleString('en-US')}</b></span>${g.buff.strings ? '<em>새 줄 · 팬 +20%</em>' : ''}${g.buff.eartip ? '<em>이어팁 · 열기 +10</em>' : ''}`;
  },
  enter() {
    const el = this.el;
    W.g || W.init();
    this.TL.set(G.diff ?? 1, true);
    this.W.set(G.song || 0, true); this.W.paint();
    this.paint(false); this.status();
    A($('.ss-img', el), KF.fade, 900);
    A($('.left', el), KF.fromLeft('-50%'), T.char);
    this.rows.forEach((r, i) => A(r, [{ opacity: 0, translate: '30% 0' }, { opacity: 1, translate: '0 0' }], T.char, { delay: 250 + i * 60, fill: 'backwards' }));
    stagger($$('.tabs > *', el), KF.fromTop('-100%'), T.slam, 150, 40);
    A($('.sortbar', el), KF.fromRight('30%'), T.char, { delay: 250 });
    A($('.cursor', el), KF.fromLeft('-200%'), T.char, { delay: 600 });
    A($('.ss-fan', el), KF.fromRight('30%'), T.char, { delay: 500 });
    A($('.ss-cond', el), KF.fromRight('30%'), T.char, { delay: 560 });
    const g = W.g;
    if (!g.flags.tutLive) {
      g.flags.tutLive = true; writeSave();
      later(() => tutorial({ title: 'LIVE', body: '곡을 클리어하면 <b>팬</b>과 <b>돈</b>이 들어오고, 같이 무대에 선 멤버의 <b>SYNC</b>가 올라요. SYNC가 높을수록 멤버가 무대에서 덜 흔들려요.<br>팬이 모이면 🔒 걸린 에피소드가 열려요. 한 곡에 <b>체력</b>이 6(전곡은 10) 들어요. 지쳐 있으면 관객 열기가 낮게 시작해요.' }), 1300);
    }
  },
  play(len) {
    const s = SONGS[G.song], part = G.inst, g = W.g;
    const party = myBand(part), label = bandLabel(party);
    go('live', { via: 'slam', arg: {
      song: s, part, diff: G.diff ?? 1, len, bg: 'stage', party, label, scenario: party.length ? 'band' : 'solo', fumbles: party.length > 0,
      heat0: heatStart(), quitTo: 'setlist',
      next: r => { W.begin(); liveReward(r, { song: s.id, len, diff: G.diff ?? 1, party }); W.summary(`LIVE · ${s.title}`, () => { G.stack = []; go('setlist', { via: 'shutter', push: false }); }); },
    } });
  },
  key(k) {
    if (k === 'up') this.W.move(-1);
    else if (k === 'down') this.W.move(1);
    else if (k === 'left') this.TL.move(-1);
    else if (k === 'right') this.TL.move(1);
    else if (k === 'l1' || k === 'r1') {
      const n = PARTS.findIndex(q => q[0] === G.inst);
      G.inst = PARTS[(n + (k === 'l1' ? -1 : 1) + PARTS.length) % PARTS.length][0];
      if (SAVE.profile) { SAVE.profile.inst = G.inst; writeSave(); }
      this.paint(false); pop($('.sortbar .on', this.el));
    } else if (k === 'ok') {
      const g = W.g, s = SONGS[G.song];
      const go_ = () => pickLength(s, len => this.play(len));
      if (g.hp < 6) confirmBox('많이 지쳐 있어요', `체력 ${g.hp}. 이대로 하면 관객 열기가 낮게 시작해요.<br>TOWN에서 쉬거나 하루를 끝내면 회복돼요. 그래도 할까요?`, go_);
      else go_();
    } else if (k === 'back') go('menu', { via: 'sweepBack', push: false });
    else return undefined;
    return true;
  },
});
