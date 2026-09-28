/* RE:AMP! — the lines sheet. Every dialogue line, choice and on-screen story text gets a stable key
   (SCRIPT:index, .1/.2/.3 for per-choice replies, .c1/.c2/.c3 for choices, STORY cards as STORY.id:step.n).
   data/lines.csv (key,장면,화자,대사,원문) is edited as a spreadsheet; at boot each row whose 원문 still matches
   the code gets its 대사 (and 화자) swapped in. A row whose 원문 no longer matches is skipped, so an old sheet
   can never put a line in the wrong place. linesCSV() writes the sheet from the current code.
   Adding: a row with an empty key is a new line, played right after the keyed row above it (same speaker's
   portrait/expression carried over). Removing: write (삭제) in 대사. Choices and title cards can only be edited. */
'use strict';

const LINE_SCRIPTS = {
  GREENROOM: '프롤로그 · 대기실', S_CALL: '1년 후 · 걸려 온 전화', S_ARRIVE: '1장 · 0dB 첫 출근',
  S_WORK: '1주차 · 0dB 알바', S_STUDIO: '1주차 · 스튜디오 연습', S_STUDIO_AFTER: '1주차 · 연습 끝',
  S_REN: '1주차 · 멘야 도돈 (렌)', S_NATSU: '1주차 · 헌옷가게 (나츠)', S_REI: '1주차 · 레코드샵 (레이)',
  S_REST: '1주차 · 강변 산책', S_WEEKEND: '1주차 · 주말', AFTER47: '47초 이후 컷신',
};
const AF_SHOT_KO = { phone: '그날 밤 휴대폰', ear: '청력 검사', news: '하루 계약 기사', chat: '단톡방', closet: '옷장' };
const AF_KIND_KO = { place: '장소 표시', clock: '시계', date: '날짜', noti: '알림', cap: '자막', ui: '화면 문구', stamp: '도장', site: '사이트 이름', tag: '분류', head: '제목', lede: '본문', photo: '사진 설명', cmt: '댓글', word: '화면을 덮는 말', title: '방 이름', old: '예전 메시지', day: '날짜 구분', msg: '메시지', type: '입력했다 지우는 말', sys: '시스템 메시지', sticker: '스티커' };

/* every editable cell: { key, scene, who, text, set(text, who), arr, idx (the script line it belongs to) } */
function lineCells() {
  const out = [];
  for (const [name, label] of Object.entries(LINE_SCRIPTS)) {
    let arr = null; try { arr = eval(name); } catch (e) {}   // top-level consts aren't on window
    if (!Array.isArray(arr)) continue;
    arr.forEach((e, i) => {
      const scene = name === 'AFTER47' ? `${label} · ${AF_SHOT_KO[e.shot] || e.shot} · ${AF_KIND_KO[e.kind] || e.kind}` : label;
      if (Array.isArray(e.choice)) e.choice.forEach((c, j) => out.push({
        key: `${name}:${i}.c${j + 1}`, scene: `${scene} · 선택지 ${j + 1}`, who: '(선택지)', text: c, arr, idx: i, fixed: true,
        set: t => { e.choice[j] = t; },
      }));
      if (Array.isArray(e.text)) e.text.forEach((t, j) => out.push({
        key: `${name}:${i}.${j + 1}`, scene: `${scene} · 선택지 ${j + 1}을 골랐을 때`, who: e.who || '', text: t, arr, idx: i, fixed: true,
        set: (t2, w) => { e.text[j] = t2; if (w && w !== '(내레이션)') e.who = w; },
      }));
      else if (typeof e.text === 'string') out.push({
        key: `${name}:${i}`, scene, who: e.who || '', text: e.text, arr, idx: i,
        set: (t2, w) => { e.text = t2; if (w && w !== '(내레이션)' && e.who) e.who = w; },
      });
    });
  }
  // title cards between story steps
  for (const [id, steps] of Object.entries(STORY)) steps.forEach((st, i) => {
    if (Array.isArray(st.card)) st.card.forEach((t, j) => out.push({
      key: `STORY.${id}:${i}.${j + 1}`, scene: `타이틀 카드 · ${id === 'prologue' ? '프롤로그' : id === 'year' ? '1년 후' : id}`, who: `(카드 ${j + 1}줄)`, text: t, fixed: true,
      set: t2 => { st.card[j] = t2; },
    }));
  });
  return out.map(c => ({ ...c, who: c.who === '' ? '(내레이션)' : c.who }));
}

/* ---------- CSV ---------- */
const csvCell = s => /[",\n\r]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
function linesCSV() {
  const rows = [['key', '장면', '화자', '대사', '원문 (고치지 마세요)']];
  for (const c of lineCells()) rows.push([c.key, c.scene, c.who, c.text, c.text]);
  return '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
function parseCSV(s) {
  s = s.replace(/^﻿/, '');
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && s[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(x => x !== ''));
}
function applyLines(csv) {
  const rows = parseCSV(csv), head = rows.shift() || [];
  const col = n => head.findIndex(h => h.trim().startsWith(n));
  const K = col('key'), W = col('화자'), D = col('대사'), O = col('원문');
  if (K < 0 || D < 0) return { applied: 0, stale: 0 };
  const cells = Object.fromEntries(lineCells().map(c => [c.key, c]));
  let applied = 0, stale = 0, added = 0, removed = 0, anchor = null;
  const ops = [];                                              // inserts / removals, done last so indices stay valid
  for (const r of rows) {
    const key0 = (r[K] || '').trim(), text = r[D] ?? '', who = W >= 0 ? (r[W] || '').trim() : '';
    const key = cells[key0] ? key0 : '';                      // a key the code doesn't have (e.g. a made-up "GREENROOM:17") is a new line too
    if (!key) {                                                // a new line under the row above
      if (!anchor || anchor.fixed || !text.trim()) continue;
      const base = anchor.arr[anchor.idx], line = { text };
      if (who && !who.startsWith('(')) line.who = who;
      if (base.shot) { line.shot = base.shot; line.kind = base.kind; }
      if (line.who) {                                          // portrait: the nearest earlier line by the same speaker
        for (let i = anchor.idx; i >= 0; i--) { const p = anchor.arr[i]; if (p.who === line.who && p.ch) { line.ch = p.ch; line.ex = Array.isArray(p.ex) ? p.ex[0] : p.ex; break; } }
      }
      ops.push({ arr: anchor.arr, at: anchor.idx + 1, ins: line, n: ops.length });
      continue;
    }
    const c = cells[key]; if (!c) { anchor = null; continue; }
    anchor = c;
    const orig = O >= 0 ? r[O] : c.text;
    if (orig !== c.text) { stale++; anchor = null; continue; }   // the code line changed since this sheet was made
    if (text.trim() === '(삭제)' && !c.fixed) { ops.push({ arr: c.arr, at: c.idx, del: true, n: ops.length }); continue; }
    if (text !== c.text || (who && who !== c.who && !who.startsWith('('))) { c.set(text, who); applied++; }
  }
  // bottom-up per script; at one index the removal goes first, then inserts in reverse so they end up in sheet order
  ops.sort((a, b) => b.at - a.at || (a.del ? 0 : 1) - (b.del ? 0 : 1) || b.n - a.n);
  for (const o of ops) { if (o.del) { o.arr.splice(o.at, 1); removed++; } else { o.arr.splice(o.at, 0, o.ins); added++; } }
  if (stale) console.warn(`[lines] ${stale}줄은 코드가 바뀌어서 시트 내용을 적용하지 않았어요.`);
  return { applied, stale, added, removed };
}
const LINES_READY = fetch('data/lines.csv?v=' + (document.querySelector('script[src*="lines.js"]')?.src.split('v=')[1] || '1'))
  .then(r => r.ok ? r.text() : '').then(t => t ? applyLines(t) : null).catch(() => null);
