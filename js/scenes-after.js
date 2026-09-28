/* RE:AMP! — after the 47 seconds. Five shots, all from the protagonist's side, then "one year later":
   the phone that won't stop · the hearing test · Haru's contract · the group chat going quiet · the case in the closet.
   Every word on screen lives in AFTER47, so the lines sheet can edit it. Z: next shot · X: skip. */
'use strict';

const AFTER47 = [
  // 1 · that night
  { shot: 'phone', kind: 'place', text: '8월 11일 · 밤' },
  { shot: 'phone', kind: 'clock', text: '23:47' },
  { shot: 'phone', kind: 'date', text: '8월 11일 일요일' },
  { shot: 'phone', kind: 'noti', who: 'PULSE', text: '@bluehour_live 님이 회원님을 태그했습니다.' },
  { shot: 'phone', kind: 'noti', who: 'PULSE', text: '【방송사고】 SIGNAL LOST 무대 도중 47초 무음… 센터는 그대로 굳어버림' },
  { shot: 'phone', kind: 'noti', who: 'SIGNAL LOST', text: '소마: 다들 들어갔어?' },
  { shot: 'phone', kind: 'noti', who: '부재중 전화', text: '키리야 (3)' },
  { shot: 'phone', kind: 'noti', who: 'PULSE', text: '회원님이 언급된 게시물이 1,248개 있습니다.' },
  { shot: 'phone', kind: 'noti', who: 'PULSE', text: '「47초 버티기 챌린지」에 회원님이 태그되었습니다.' },
  { shot: 'phone', kind: 'noti', who: 'SIGNAL LOST', text: '키리야: 레이블에서 연락 왔어' },
  { shot: 'phone', kind: 'noti', who: 'PULSE', text: '@riff_daily: 음향사고가 아니라 실력사고' },
  { shot: 'phone', kind: 'noti', who: '문자', text: '저장 안 된 번호: 괜찮으면 연락 줘. 0dB 세리자와' },
  { shot: 'phone', kind: 'noti', who: 'PULSE', text: '새 팔로워 2,031명' },
  { shot: 'phone', kind: 'cap', text: '그날 밤은 휴대폰 진동이 멈추지 않았다.' },
  { shot: 'phone', kind: 'cap', text: '무대 영상은 벌써 「47초 프리즈」라는 이름으로 돌고 있었다.' },
  { shot: 'phone', kind: 'cap', text: '휴대폰을 뒤집어 놓았다. 진동은 그래도 손바닥으로 전해졌다.' },
  // 2 · the hearing test
  { shot: 'ear', kind: 'place', text: '8월 13일 · 나기사카 시립병원 이비인후과' },
  { shot: 'ear', kind: 'ui', text: '순음 청력 검사' },
  { shot: 'ear', kind: 'ui', text: '소리가 들리면 버튼을 누르세요' },
  { shot: 'ear', kind: 'cap', text: '오른쪽 귀는 금방 끝났다.' },
  { shot: 'ear', kind: 'cap', text: '왼쪽으로 넘어가자 버튼을 누를 일이 점점 줄었다.' },
  { shot: 'ear', kind: 'stamp', text: '왼쪽 · 돌발성 난청' },
  { shot: 'ear', kind: 'cap', who: '의사', text: '왼쪽 고음역이 많이 떨어졌어요. 돌발성 난청입니다.' },
  { shot: 'ear', kind: 'cap', who: '의사', text: '바로 치료하면 회복될 가능성이 높아요. 당분간 큰 소리는 피하세요.' },
  { shot: 'ear', kind: 'cap', text: '진단서는 접어서 가방 안쪽 주머니에 넣었다. 아무한테도 말하지 않았다.' },
  // 3 · Haru's contract
  { shot: 'news', kind: 'place', text: '8월 18일' },
  { shot: 'news', kind: 'site', text: 'MUSIC NOW' },
  { shot: 'news', kind: 'tag', text: '뉴스 · 계약' },
  { shot: 'news', kind: 'head', text: '크레셴도 레코드, 전 SIGNAL LOST 기타리스트 츠키시마 하루와 전속 계약' },
  { shot: 'news', kind: 'lede', text: '지난 11일 블루 아워 페스 무대 사고 이후 해체 수순에 들어간 밴드 SIGNAL LOST의 기타리스트 츠키시마 하루가 크레셴도 레코드와 솔로 전속 계약을 맺었다. 레이블 측은 "하루의 새 출발을 전폭적으로 지원하겠다"고 밝혔다.' },
  { shot: 'news', kind: 'photo', text: '츠키시마 하루 · 크레셴도 레코드 제공' },
  { shot: 'news', kind: 'cmt', who: '@yuu_rockin', text: '배신자' },
  { shot: 'news', kind: 'cmt', who: '@tanaka_m', text: '밴드 망하자마자 혼자 갈아탔네' },
  { shot: 'news', kind: 'cmt', who: '@riff_daily', text: '47초 그 밴드? 기타만 살아남았네ㅋㅋ' },
  { shot: 'news', kind: 'cmt', who: '@minori_07', text: '이럴 줄 알았음' },
  { shot: 'news', kind: 'cmt', who: '@k_n', text: '센터만 불쌍하게 됐다' },
  { shot: 'news', kind: 'cmt', who: '@anon_2231', text: '배신자 소리 들어도 할 말 없지' },
  { shot: 'news', kind: 'cmt', who: '@lol_lol', text: '배신자' },
  { shot: 'news', kind: 'cmt', who: '@nana', text: '배신자ㅋㅋ' },
  { shot: 'news', kind: 'word', text: '배신자' },
  { shot: 'news', kind: 'cap', text: '일주일 뒤, 하루가 크레셴도 레코드와 계약했다는 기사가 떴다.' },
  { shot: 'news', kind: 'cap', text: '다들 하루를 배신자라고 불렀다.' },
  { shot: 'news', kind: 'cap', text: '나는 하루에게 아무것도 묻지 않았다.' },
  // 4 · the group chat
  { shot: 'chat', kind: 'place', text: '8월 11일 ~ 9월 2일' },
  { shot: 'chat', kind: 'title', text: 'SIGNAL LOST' },
  { shot: 'chat', kind: 'old', who: '키리야', text: '내일 7시 집합. 늦으면 라멘 사기' },
  { shot: 'chat', kind: 'old', who: '하루', text: '인이어 예비 하나씩 챙겨' },
  { shot: 'chat', kind: 'old', who: '@NAME', text: '알았어' },
  { shot: 'chat', kind: 'day', text: '8월 11일 일요일' },
  { shot: 'chat', kind: 'msg', who: '소마', text: '다들 들어갔어?' },
  { shot: 'chat', kind: 'msg', who: '키리야', text: '레이블에서 연락 왔어. 내일 사무실로 오래' },
  { shot: 'chat', kind: 'msg', who: '소마', text: '@NAME 괜찮아? 답 좀 해 줘' },
  { shot: 'chat', kind: 'type', text: '사실 그때 귀가' },
  { shot: 'chat', kind: 'day', text: '8월 14일 목요일' },
  { shot: 'chat', kind: 'msg', who: '키리야', text: '우리 이제 어떻게 되는 거야' },
  { shot: 'chat', kind: 'msg', who: '소마', text: '하루야 전화 좀 받아' },
  { shot: 'chat', kind: 'day', text: '8월 19일 화요일' },
  { shot: 'chat', kind: 'sys', text: '하루 님이 나갔습니다.' },
  { shot: 'chat', kind: 'day', text: '9월 2일 화요일' },
  { shot: 'chat', kind: 'msg', who: '소마', text: '해체 공지 올라갔어. 다들 몸 챙겨.' },
  { shot: 'chat', kind: 'type', text: '미안' },
  { shot: 'chat', kind: 'cap', text: '단톡방은 조금씩 조용해졌다.' },
  { shot: 'chat', kind: 'cap', text: '결국 아무것도 보내지 못했다.' },
  // 5 · the closet
  { shot: 'closet', kind: 'place', text: '9월 · 밤' },
  { shot: 'closet', kind: 'sticker', text: 'SIGNAL LOST' },
  { shot: 'closet', kind: 'cap', text: '케이스를 옷장 안쪽에 세워 두고 문을 닫았다.' },
  { shot: 'closet', kind: 'cap', text: '그 뒤로 1년 동안 그 문을 열지 않았다.' },
];
const AF_SKIP = { skip: true };
const afName = s => String(s).replace(/@NAME/g, G.name || '나');
const afL = (shot, kind) => AFTER47.filter(e => e.shot === shot && e.kind === kind);
const afT = (shot, kind, i = 0) => afName((afL(shot, kind)[i] || {}).text || '');

/* ---------- sound (WebAudio, nothing loaded) ---------- */
function afAudio() {
  const ac = AU.get(), out = ac.createGain(); out.gain.value = 1; out.connect(AU.master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const now = () => ac.currentTime;
  const noise = (t, type, f, q, v, a, d, dest = out) => { const s = ac.createBufferSource(); s.buffer = nb; const bq = ac.createBiquadFilter(); bq.type = type; bq.frequency.value = f; bq.Q.value = q; const g = ac.createGain(); s.connect(bq).connect(g).connect(dest); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); s.start(t, Math.random()); s.stop(t + a + d + .05); return bq; };
  const tone = (t, type, f, v, a, hold, rel, dest = out) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; o.connect(g).connect(dest); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.setValueAtTime(v, t + a + hold); g.gain.exponentialRampToValueAtTime(.0001, t + a + hold + rel); o.start(t); o.stop(t + a + hold + rel + .05); return o; };
  // a low room tone under everything
  const room = ac.createBufferSource(); room.buffer = nb; room.loop = true;
  const rf = ac.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 220; const rg = ac.createGain(); rg.gain.value = 0;
  room.connect(rf).connect(rg).connect(out); room.start(); rg.gain.setTargetAtTime(.05, now(), 1);
  const S = {
    ac, out,
    buzz(v = .5) {                                   // a phone vibrating on a desk: two rough pulses
      const t = now();
      for (const k of [0, .42]) {
        const o = ac.createOscillator(), am = ac.createOscillator(), ag = ac.createGain(), g = ac.createGain(), lp = ac.createBiquadFilter();
        o.type = 'square'; o.frequency.value = 160; am.frequency.value = 38; ag.gain.value = .5;
        lp.type = 'lowpass'; lp.frequency.value = 420;
        am.connect(ag).connect(g.gain); o.connect(lp).connect(g).connect(out);
        g.gain.setValueAtTime(0, t + k); g.gain.linearRampToValueAtTime(v * .35, t + k + .02); g.gain.setValueAtTime(v * .35, t + k + .3); g.gain.linearRampToValueAtTime(0, t + k + .34);
        o.start(t + k); am.start(t + k); o.stop(t + k + .36); am.stop(t + k + .36);
      }
    },
    ding(v = .08) { const t = now(); tone(t, 'sine', 1318.5, v, .004, .03, .12); tone(t + .06, 'sine', 1975.5, v * .8, .004, .03, .2); },
    pop(v = .12) { const t = now(); const o = tone(t, 'sine', 700, v, .004, .02, .09); o.frequency.exponentialRampToValueAtTime(1250, t + .06); },
    leave() { const t = now(); tone(t, 'triangle', 520, .08, .01, .08, .3); tone(t + .14, 'triangle', 390, .08, .01, .1, .5); },
    key(v = .1) { noise(now(), 'bandpass', 3200 + Math.random() * 900, 2, v, .001, .03); },
    del(v = .09) { noise(now(), 'bandpass', 1900, 2, v, .001, .04); },
    whoosh(v = .18) { const t = now(), f = noise(t, 'bandpass', 400, 1.2, v, .08, .3); f.frequency.exponentialRampToValueAtTime(3000, t + .3); },
    thud(v = .5) { const t = now(); const o = tone(t, 'sine', 110, v, .003, .02, .35); o.frequency.exponentialRampToValueAtTime(40, t + .2); noise(t, 'lowpass', 220, .7, v * .5, .002, .18); },
    clack(v = .35) { const t = now(); noise(t, 'bandpass', 900, 3, v, .001, .07); S.thud(v * .6); },
    slide(dur = 2) { const t = now(), f = noise(t, 'lowpass', 380, .9, .16, .25, dur); f.frequency.linearRampToValueAtTime(260, t + dur); },
    // the audiometer: pure tones; `heard` false plays what the left ear gets: almost nothing, dull
    beep(f, v = .1, heard = true) {
      const t = now(), o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
      o.frequency.value = Math.min(f, 8000); lp.type = 'lowpass'; lp.frequency.value = heard ? 16000 : 700;
      o.connect(lp).connect(g).connect(out);
      const pk = heard ? v : v * .06;
      for (const k of [0, .5]) { g.gain.setValueAtTime(0, t + k); g.gain.linearRampToValueAtTime(pk, t + k + .03); g.gain.setValueAtTime(pk, t + k + .32); g.gain.linearRampToValueAtTime(0, t + k + .36); }
      o.start(t); o.stop(t + .9);
    },
    drone(v = .12) {                                  // a low swell for the comment pile-up; returns stop()
      const t = now(), g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 6); g.connect(out);
      const os = [55, 55.4, 82.4].map(f => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; o.connect(lp).connect(g); o.start(); return o; });
      return (r = .3) => { const t2 = now(); g.gain.cancelScheduledValues(t2); g.gain.setValueAtTime(g.gain.value, t2); g.gain.linearRampToValueAtTime(0, t2 + r); os.forEach(o => o.stop(t2 + r + .05)); };
    },
    tinn(v = .03, len = 3) { tone(now(), 'sine', 7400, v, .05, len * .4, len * .6); },
    end() { const t = now(); out.gain.setTargetAtTime(0, t, .25); setTimeout(() => { try { room.stop(); out.disconnect(); } catch (e) {} }, 1500); },
  };
  return S;
}

/* ---------- the shots ---------- */
const AF_SHOTS = [
  /* 1 · that night: the phone on the desk won't stop */
  async function phone() {
    const sh = this.shot('s-phone', `<div class="p-room"></div><div class="p-glow"></div>
      <div class="p-cam"><div class="p-dev"><div class="p-front"><div class="p-scr">
        <div class="p-clock">${afT('phone', 'clock')}</div><div class="p-date">${afT('phone', 'date')}</div>
        <div class="p-list"></div><div class="p-badge">알림 <b>0</b></div>
      </div></div><div class="p-back"><i></i></div></div></div>`);
    const cam = $('.p-cam', sh), dev = $('.p-dev', sh), list = $('.p-list', sh), badge = $('.p-badge b', sh), glow = $('.p-glow', sh);
    A(cam, [{ scale: '1', translate: '0 0' }, { scale: '1.16', translate: '0 -50px' }], 26000, { e: EZ.lin, fill: 'forwards' });
    A(glow, [{ opacity: 0 }, { opacity: 1 }], 900, { fill: 'forwards' });
    this.place(afT('phone', 'place'));
    const notes = afL('phone', 'noti');
    let count = 0;
    const push = (e, fast) => {
      const n = document.createElement('div');
      n.className = 'p-nt'; n.dataset.app = e.who;
      n.innerHTML = `<i></i><div><small>${afName(e.who)}<em>지금</em></small><p>${afName(e.text)}</p></div>`;
      list.prepend(n);
      A(n, [{ translate: '0 -24px', opacity: 0, scale: '.96' }, { translate: '0 0', opacity: 1, scale: '1' }], fast ? 180 : 320);
      while (list.children.length > 5) list.lastElementChild.remove();
      count += fast ? 37 + Math.floor(Math.random() * 60) : 1 + Math.floor(Math.random() * 3);
      badge.textContent = count > 999 ? '999+' : count;
      A(dev, [{ translate: '0 0' }, { translate: '-3px 1px' }, { translate: '3px -1px' }, { translate: '-2px 0' }, { translate: '0 0' }], 240, { e: EZ.lin });
      this.sfx.buzz(fast ? .3 : .5); if (!fast) this.sfx.ding(.05);
    };
    await this.w(700);
    const caps = afL('phone', 'cap');
    for (let i = 0; i < notes.length; i++) {
      push(notes[i]);
      if (i === 1) this.cap(caps[0]);
      if (i === 6) this.cap(caps[1]);
      await this.w(Math.max(260, 1500 - i * 130));
    }
    for (let i = 0; i < 16; i++) { push(notes[i % notes.length], true); await this.w(Math.max(90, 240 - i * 10)); }
    await this.w(700);
    // face down: the light goes out
    A(dev, [{ rotate: 'y 0deg' }, { rotate: 'y 180deg' }], 650, { e: EZ.wipe, fill: 'forwards' });
    A(glow, [{ opacity: 1 }, { opacity: 0 }], 500, { delay: 220, fill: 'forwards' });
    this.sfx.clack(.25);
    await this.w(900);
    this.cap(caps[2]);
    for (let i = 0; i < 3; i++) { await this.w(1300); this.sfx.buzz(.35); A(dev, [{ translate: '0 0' }, { translate: '-2px 0' }, { translate: '2px 0' }, { translate: '0 0' }], 220, { e: EZ.lin }); }
    await this.w(1800);
  },

  /* 2 · the hearing test: the right ear answers every tone, the left one stops answering */
  async function ear() {
    const sh = this.shot('s-ear', `<div class="e-wall"></div>
      <div class="e-cam"><div class="e-card"><div class="e-h"><b>${afT('ear', 'ui', 0)}</b><span>AUDIOGRAM</span></div><canvas class="e-cv" width="880" height="440"></canvas><div class="e-stamp">${afT('ear', 'stamp')}</div></div>
      <div class="e-side"><div class="e-phones"><span class="r">R</span><span class="l">L</span></div>
        <div class="e-read"><small>FREQ</small><b class="e-f">— Hz</b><small>LEVEL</small><b class="e-db">— dB</b></div>
        <div class="e-lamp"><i></i><span>${afT('ear', 'ui', 1)}</span></div></div></div>`);
    this.place(afT('ear', 'place'));
    A($('.e-cam', sh), [{ scale: '1.08', translate: '20px 10px' }, { scale: '1', translate: '0 0' }], 30000, { e: EZ.soft, fill: 'forwards' });
    A($('.e-card', sh), [{ translate: '0 40px', opacity: 0, rotate: '-4deg' }, { translate: '0 0', opacity: 1, rotate: '-2deg' }], 700, { fill: 'forwards' });
    const cv = $('.e-cv', sh), c = cv.getContext('2d');
    const F = [250, 500, 1000, 2000, 4000, 8000], X0 = 90, X1 = 840, Y0 = 30, Y1 = 400;
    const xOf = i => X0 + (X1 - X0) * i / (F.length - 1), yOf = db => Y0 + (Y1 - Y0) * (db + 10) / 110;
    const pts = { r: [], l: [] };
    const draw = () => {
      c.clearRect(0, 0, cv.width, cv.height);
      c.fillStyle = '#FBFCFF'; c.fillRect(0, 0, cv.width, cv.height);
      c.fillStyle = 'rgba(47,75,255,.07)'; c.fillRect(X0, yOf(25), X1 - X0, Y1 - yOf(25));   // below "normal"
      c.strokeStyle = '#C9D4FF'; c.lineWidth = 1; c.font = '14px "IBM Plex Mono", monospace'; c.fillStyle = '#56619A';
      for (let db = -10; db <= 100; db += 10) { const y = yOf(db); c.beginPath(); c.moveTo(X0, y); c.lineTo(X1, y); c.stroke(); c.textAlign = 'right'; c.fillText(db, X0 - 14, y + 5); }
      F.forEach((f, i) => { const x = xOf(i); c.beginPath(); c.moveTo(x, Y0); c.lineTo(x, Y1); c.stroke(); c.textAlign = 'center'; c.fillText(f >= 1000 ? f / 1000 + 'k' : f, x, Y1 + 26); });
      c.textAlign = 'left'; c.fillText('dB HL', 8, 26); c.textAlign = 'right'; c.fillText('Hz', X1 + 30, Y1 + 26);
      for (const [k, col] of [['r', '#E8344E'], ['l', '#2F4BFF']]) {
        const p = pts[k]; c.strokeStyle = col; c.lineWidth = 3;
        if (p.length > 1) { c.beginPath(); p.forEach(([i, db], n) => n ? c.lineTo(xOf(i), yOf(db)) : c.moveTo(xOf(i), yOf(db))); c.stroke(); }
        c.lineWidth = 3.5;
        for (const [i, db] of p) {
          const x = xOf(i), y = yOf(db);
          c.beginPath();
          if (k === 'r') c.arc(x, y, 10, 0, 7); else { c.moveTo(x - 9, y - 9); c.lineTo(x + 9, y + 9); c.moveTo(x + 9, y - 9); c.lineTo(x - 9, y + 9); }
          c.stroke();
        }
      }
    };
    draw();
    const fEl = $('.e-f', sh), dEl = $('.e-db', sh), lamp = $('.e-lamp', sh), side = (k) => { $('.e-phones .r', sh).classList.toggle('on', k === 'r'); $('.e-phones .l', sh).classList.toggle('on', k === 'l'); };
    const test = async (k, i, final, tries) => {
      fEl.textContent = F[i].toLocaleString() + ' Hz';
      for (const db of tries) {
        dEl.textContent = db + ' dB';
        const heard = db >= final;
        this.sfx.beep(F[i], .09, heard);
        await this.w(heard ? 520 : 900);
        if (heard) {
          lamp.classList.add('on'); this.sfx.key(.06);
          pts[k].push([i, final]); draw();
          await this.w(260); lamp.classList.remove('on');
          return;
        }
      }
    };
    await this.w(900);
    side('r');
    const R = [10, 10, 5, 10, 15, 15];
    const caps = afL('ear', 'cap');
    this.cap(caps[0]);
    for (let i = 0; i < F.length; i++) await test('r', i, R[i], [R[i]]);
    await this.w(500);
    side('l');
    this.cap(caps[1]);
    const Lv = [15, 20, 35, 55, 70, 75];
    for (let i = 0; i < F.length; i++) {
      const tries = []; for (let db = Math.min(20, Lv[i]); db <= Lv[i]; db += 10) tries.push(db); if (tries[tries.length - 1] !== Lv[i]) tries.push(Lv[i]);
      await test('l', i, Lv[i], i < 2 ? [Lv[i]] : tries);
    }
    await this.w(600);
    side('');
    const st = $('.e-stamp', sh);
    A(st, [{ scale: '2.2', opacity: 0, rotate: '-20deg' }, { scale: '1', opacity: 1, rotate: '-9deg' }], 260, { e: EZ.slam, fill: 'forwards' });
    this.sfx.thud(.45);
    A($('.e-card', sh), [{ translate: '0 0' }, { translate: '-4px 3px' }, { translate: '3px -2px' }, { translate: '0 0' }], 200, { e: EZ.lin, c: 'add' });
    await this.w(900);
    for (const k of [2, 3]) { await this.cap(caps[k], true); await this.w(400); }
    this.sfx.tinn(.02, 4);
    await this.cap(caps[4], true);
    await this.w(1400);
  },

  /* 3 · a week later: the contract, and everyone's word for Haru */
  async function news() {
    const cm = afL('news', 'cmt');
    const sh = this.shot('s-news', `<div class="n-cam"><div class="n-page">
        <div class="n-top"><b>${afT('news', 'site')}</b><span>음악</span><span>인디</span><span>페스티벌</span><span>인터뷰</span></div>
        <div class="n-body"><span class="n-tag">${afT('news', 'tag')}</span><h1>${afT('news', 'head')}</h1><div class="n-by">${afT('news', 'place')} 09:12 · MUSIC NOW 편집부</div>
          <figure class="n-ph"><img src="img/c/haru_neutral.jpg" alt=""><figcaption>${afT('news', 'photo')}</figcaption></figure>
          <p class="n-lede">${afT('news', 'lede')}</p></div>
        <div class="n-cm"><div class="n-cmh">댓글 <b>0</b></div><div class="n-cml"></div></div>
      </div></div><div class="n-words"></div>`);
    this.place(afT('news', 'place'));
    const cam = $('.n-cam', sh), page = $('.n-page', sh), cml = $('.n-cml', sh), cnt = $('.n-cmh b', sh), words = $('.n-words', sh);
    A(page, [{ translate: '0 80px', opacity: 0 }, { translate: '0 0', opacity: 1 }], 600, { fill: 'forwards' });
    this.sfx.whoosh(.14);
    const caps = afL('news', 'cap');
    await this.w(900);
    await this.cap(caps[0]);
    // slow scroll to the comments while they pile up
    A(cam, [{ translate: '0 0', scale: '1' }, { translate: '-60px -120px', scale: '1.06' }], 9000, { e: EZ.soft, fill: 'forwards' });
    const stop = this.sfx.drone(.1); this.tok.stops.push(stop);
    let n = 0;
    const add = (e) => {
      const d = document.createElement('div'); d.className = 'n-c';
      const bad = /배신자/.test(e.text);
      d.innerHTML = `<b>${e.who}</b><p class="${bad ? 'bad' : ''}">${afName(e.text)}</p>`;
      cml.prepend(d); while (cml.children.length > 7) cml.lastElementChild.remove();
      A(d, [{ translate: '0 -14px', opacity: 0 }, { translate: '0 0', opacity: 1 }], 220);
      n += 1 + Math.floor(Math.random() * 40); cnt.textContent = n.toLocaleString();
      this.sfx.pop(.05);
    };
    for (let i = 0; i < cm.length; i++) { add(cm[i]); if (i === 2) this.cap(caps[1]); await this.w(Math.max(260, 900 - i * 80)); }
    // the word takes over the screen
    const w = afT('news', 'word');
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('span');
      s.textContent = w; s.style.left = (4 + Math.random() * 84) + '%'; s.style.top = (8 + Math.random() * 76) + '%';
      s.style.fontSize = (28 + Math.random() * 70) + 'px'; s.style.rotate = (Math.random() * 16 - 8) + 'deg';
      words.appendChild(s);
      A(s, [{ opacity: 0, scale: '1.6' }, { opacity: 1, scale: '1' }], 160, { e: EZ.slam, fill: 'forwards' });
      if (i % 3 === 0) this.sfx.pop(.04);
      if (i % 4 === 0) add(cm[i % cm.length]);
      await this.w(Math.max(40, 150 - i * 5));
    }
    await this.w(500);
    // cut: silence, and only Haru's face left
    stop(.08); this.tok.stops = [];
    words.innerHTML = '';
    sh.classList.add('focus');
    A($('.n-ph', sh), [{ scale: '1' }, { scale: '1.04' }], 5000, { e: EZ.lin, fill: 'forwards' });
    this.sfx.tinn(.025, 5);
    await this.w(600);
    await this.cap(caps[2], true);
    await this.w(1600);
  },

  /* 4 · the group chat goes quiet */
  async function chat() {
    const title = afT('chat', 'title');
    const sh = this.shot('s-chat', `<div class="c-room"></div><div class="c-cam"><div class="c-dev"><div class="c-scr">
        <div class="c-top"><i>‹</i><b>${title}</b><span class="c-n">4</span></div>
        <div class="c-list"></div>
        <div class="c-in"><div class="c-field"><span class="c-tx"></span><i class="c-caret"></i></div><b class="c-send">전송</b></div>
      </div></div></div>`);
    this.place(afT('chat', 'place'));
    const list = $('.c-list', sh), tx = $('.c-tx', sh), num = $('.c-n', sh), scr = $('.c-scr', sh);
    A($('.c-cam', sh), [{ scale: '1', translate: '0 0' }, { scale: '1.05', translate: '0 -8px' }], 32000, { e: EZ.lin, fill: 'forwards' });
    A($('.c-dev', sh), [{ translate: '0 60px', opacity: 0 }, { translate: '0 0', opacity: 1 }], 700, { fill: 'forwards' });
    const COL = { '하루': '#2EC7F0', '소마': '#8FA8FF', '키리야': '#8FA8FF' };
    const add = (e, quiet) => {
      const d = document.createElement('div');
      if (e.kind === 'day') { d.className = 'c-day'; d.textContent = afName(e.text); }
      else if (e.kind === 'sys') { d.className = 'c-sys'; d.textContent = afName(e.text); }
      else {
        const me = e.who === '@NAME';
        d.className = 'c-m' + (me ? ' me' : '') + (e.kind === 'old' ? ' old' : '');
        d.innerHTML = me ? `<p>${afName(e.text)}</p>` : `<i style="--c:${COL[e.who] || '#8FA8FF'}">${e.who.slice(0, 1)}</i><div><small>${e.who}</small><p>${afName(e.text)}</p></div>`;
      }
      list.appendChild(d);
      list.scrollTop = list.scrollHeight;
      if (!quiet) { A(d, [{ translate: '0 14px', opacity: 0 }, { translate: '0 0', opacity: 1 }], 240); e.kind === 'sys' ? this.sfx.leave() : this.sfx.pop(.08); }
    };
    const typeDel = async (s) => {
      for (const ch of s) { tx.textContent += ch; this.sfx.key(.07); await this.w(150 + Math.random() * 120); }
      await this.w(1300);
      for (let i = s.length; i > 0; i--) { tx.textContent = s.slice(0, i - 1); this.sfx.del(.06); await this.w(110); }
      await this.w(500);
    };
    const seq = AFTER47.filter(e => e.shot === 'chat' && e.kind !== 'place' && e.kind !== 'title' && e.kind !== 'cap');
    seq.filter(e => e.kind === 'old').forEach(e => add(e, true));
    const caps = afL('chat', 'cap');
    await this.w(1200);
    let types = 0;
    for (const e of seq) {
      if (e.kind === 'old') continue;
      if (e.kind === 'type') { await typeDel(afName(e.text)); if (++types === 1) this.cap(caps[0]); continue; }
      if (e.kind === 'day') { await this.w(700); add(e); await this.w(500); continue; }
      add(e);
      if (e.kind === 'sys') { num.textContent = '3'; await this.w(1600); }
      else await this.w(1100);
    }
    await this.w(600);
    this.cap(caps[1]);
    await this.w(1800);
    // the screen dims, then sleeps
    A(scr, [{ filter: 'brightness(1)' }, { filter: 'brightness(.35)' }], 1400, { fill: 'forwards' });
    await this.w(1600);
    A(scr, [{ filter: 'brightness(.35)', opacity: 1 }, { filter: 'brightness(0)', opacity: 0 }], 300, { fill: 'forwards' });
    this.sfx.key(.04);
    await this.w(1800);
  },

  /* 5 · the case goes into the closet, the door slides shut */
  async function closet() {
    const part = G.inst || 'GT';
    const CASE = {
      GT: '<path d="M70 20 h60 v250 q70 20 70 110 q0 110 -100 110 q-100 0 -100 -110 q0 -90 70 -110 z"/>',
      BA: '<path d="M78 0 h44 v285 q72 20 72 105 q0 105 -94 105 q-94 0 -94 -105 q0 -85 72 -105 z"/>',
      DR: '<rect x="20" y="40" width="70" height="440" rx="18"/><circle cx="150" cy="330" r="100"/>',
      KEY: '<rect x="45" y="10" width="110" height="490" rx="16"/>',
    }[part] || '';
    const sh = this.shot('s-closet', `<div class="k-cam"><div class="k-wall"></div><div class="k-moon"></div>
        <div class="k-closet"><div class="k-in"><i class="k-rod"></i><i class="k-cl a"></i><i class="k-cl b"></i><i class="k-cl c"></i>
          <div class="k-case"><svg viewBox="0 0 200 500" preserveAspectRatio="xMidYMax meet">${CASE}</svg><span class="k-stk">${afT('closet', 'sticker')}</span></div>
          <i class="k-beam"></i></div>
          <div class="k-door l"></div><div class="k-door r"></div></div>
        <div class="k-floor"></div></div>`);
    this.place(afT('closet', 'place'));
    const cam = $('.k-cam', sh), cs = $('.k-case', sh), door = $('.k-door.r', sh), beam = $('.k-beam', sh);
    A(cam, [{ scale: '1', translate: '0 0' }, { scale: '1.12', translate: '0 20px' }], 20000, { e: EZ.soft, fill: 'forwards' });
    await this.w(900);
    // set down
    A(cs, [{ translate: '120px -30px', rotate: '10deg', opacity: 0 }, { translate: '0 0', rotate: '-4deg', opacity: 1 }], 900, { e: EZ.soft, fill: 'forwards' });
    await this.w(820); this.sfx.thud(.3);
    const caps = afL('closet', 'cap');
    await this.w(700);
    await this.cap(caps[0]);
    // the door slides shut; the moonlight on the sticker narrows to nothing
    this.sfx.slide(2.1);
    A(door, [{ translate: '0 0' }, { translate: '-100% 0' }], 2200, { e: EZ.soft, fill: 'forwards' });
    A(beam, [{ opacity: 1, scale: '1 1' }, { opacity: 0, scale: '.1 1' }], 2200, { e: EZ.soft, fill: 'forwards' });
    await this.w(2150); this.sfx.clack(.4);
    A(door, [{ translate: '-100% 0' }, { translate: 'calc(-100% + 6px) 0' }, { translate: '-100% 0' }], 160, { e: EZ.lin, fill: 'forwards' });
    await this.w(900);
    A($('.k-moon', sh), [{ opacity: 1 }, { opacity: 0 }], 2600, { fill: 'forwards' });
    A($('.k-wall', sh), [{ filter: 'brightness(1)' }, { filter: 'brightness(.2)' }], 2600, { fill: 'forwards' });
    await this.w(1400);
    await this.cap(caps[1], true);
    await this.w(1800);
  },
];

scene('after47', {
  cls: 'af', back: false,
  html: `<div class="af-shots"></div><canvas class="af-grain" width="320" height="180"></canvas><div class="af-vig"></div>
    <div class="af-bar t"></div><div class="af-bar b"></div>
    <div class="af-place"></div><div class="af-cap"><span class="who"></span><p class="tx"></p></div>
    <div class="af-hint"><span>Z</span> 다음 장면 <span>X</span> 건너뛰기</div><div class="af-black"></div>`,
  enter(a = {}) {
    const el = this.el;
    this.next = a.next; this.i = a.at || 0; this.done = false;
    el.getAnimations({ subtree: true }).forEach(x => x.cancel());   // a replay must not start under the last run's black
    this.sfx = afAudio();
    $('.af-shots', el).innerHTML = ''; $('.af-place', el).innerHTML = ''; $('.af-cap', el).classList.remove('on');
    A($('.af-bar.t', el), [{ translate: '0 -100%' }, { translate: '0 0' }], 900, { e: EZ.soft });
    A($('.af-bar.b', el), [{ translate: '0 100%' }, { translate: '0 0' }], 900, { e: EZ.soft });
    A($('.af-hint', el), KF.fade, 600, { delay: 1500 });
    this.grainOn();
    this.play();
  },
  leave() { this.done = true; this.kill(); cancelAnimationFrame(this.graf); if (this.sfx) this.sfx.end(); this.sfx = null; },

  async play() {
    const runId = this.run = {};
    while (!this.done && this.i < AF_SHOTS.length) {
      this.tok = { dead: false, timers: [], wake: [], stops: [] };
      try { await AF_SHOTS[this.i].call(this); } catch (e) { if (e !== AF_SKIP) console.error(e); }
      if (this.run !== runId || this.done) return;
      this.kill();
      await this.dip();
      this.i++;
    }
    if (!this.done) this.finish();
  },
  kill() {
    const t = this.tok; if (!t) return;
    t.dead = true; t.timers.forEach(clearTimeout); t.wake.forEach(r => r()); t.stops.forEach(s => { try { s(); } catch (e) {} }); t.stops = [];
  },
  async w(ms) {
    const t = this.tok;
    if (t.dead) throw AF_SKIP;
    await new Promise(r => { t.timers.push(setTimeout(r, ms)); t.wake.push(r); });
    if (t.dead) throw AF_SKIP;
  },
  dip() {                                             // a short cut to black between shots
    const b = $('.af-black', this.el);
    A(b, [{ opacity: 0 }, { opacity: 1 }], 260, { fill: 'forwards', e: EZ.lin });
    return new Promise(r => setTimeout(() => {
      $('.af-shots', this.el).innerHTML = ''; $('.af-cap', this.el).classList.remove('on'); $('.af-place', this.el).innerHTML = '';
      A(b, [{ opacity: 1 }, { opacity: 0 }], 420, { fill: 'forwards', e: EZ.lin, delay: 200 });
      r();
    }, 300));
  },
  shot(cls, html) {
    const box = $('.af-shots', this.el);
    box.innerHTML = `<div class="af-shot ${cls}">${html}</div>`;
    return box.firstElementChild;
  },
  place(text) {
    const p = $('.af-place', this.el);
    p.innerHTML = `<span>${afName(text)}</span>`;
    A(p.firstElementChild, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 520, { e: EZ.wipe, delay: 300 });
  },
  /* caption: typed on; `wait` resolves after a reading pause (throws on skip like w()) */
  async cap(e, wait) {
    if (!e) return;
    const box = $('.af-cap', this.el), who = $('.who', box), tx = $('.tx', box), s = afName(e.text), tok = this.tok;
    who.textContent = e.who ? afName(e.who) : ''; who.hidden = !e.who;
    box.classList.add('on');
    tx.textContent = '';
    A(box, [{ opacity: 0, translate: '-16px 0' }, { opacity: 1, translate: '0 0' }], 260);
    let i = 0;
    const iv = setInterval(() => { if (tok.dead) return clearInterval(iv); tx.textContent = s.slice(0, ++i); if (i >= s.length) clearInterval(iv); }, 38);
    tok.stops.push(() => clearInterval(iv));
    if (wait) await this.w(s.length * 38 + 1100 + s.length * 45);
  },
  grainOn() {
    const cv = $('.af-grain', this.el), c = cv.getContext('2d'), img = c.createImageData(320, 180);
    let last = 0;
    const tick = t => {
      if (G.cur !== 'after47') return;
      if (t - last > 80) {
        last = t; const d = img.data;
        for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
        c.putImageData(img, 0, 0);
      }
      this.graf = requestAnimationFrame(tick);
    };
    this.graf = requestAnimationFrame(tick);
  },
  finish() {
    if (this.done) return;
    this.done = true; this.kill();
    const b = $('.af-black', this.el);
    A(b, [{ opacity: 0 }, { opacity: 1 }], 500, { fill: 'forwards', e: EZ.lin });
    if (this.sfx) this.sfx.end();
    setTimeout(() => { if (G.cur === 'after47') this.next ? this.next() : go('title', { push: false }); }, 700);
  },
  key(k) {
    if (this.done) return true;
    if (k === 'ok') this.kill();                     // next shot
    else if (k === 'back') { this.run = null; this.finish(); }
    return true;
  },
});
