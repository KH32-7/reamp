#!/usr/bin/env node
/* Lines sheet tool (not shipped to players).
   node tools/lines.js export            → writes data/lines.csv from the current scripts
   node tools/lines.js merge <sheet.csv> → takes the edited 대사/화자 from a downloaded sheet, writes data/lines.csv,
                                           and reports what changed and what no longer matches the code.
   The script files are evaluated with every browser/game global stubbed out; only their data is used. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const FILES = ['js/week.js', 'js/story.js', 'js/scenes-after.js', 'js/lines.js'];

function load() {
  const noop = new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : noop, apply: () => noop, construct: () => noop });
  const real = { eval: globalThis.eval, Object, Array, JSON, Math, String, Number, Boolean, RegExp, Date, Map, Set, Promise, console, Symbol, Error, parseInt, parseFloat, isNaN, Infinity, NaN, undefined };
  const sandbox = new Proxy({ SPEAKER: {}, STORY_EXTRA: {} }, {
    has: () => true,
    get: (t, k) => k in t ? t[k] : k in real ? real[k] : k === Symbol.unscopables ? undefined : noop,
    set: (t, k, v) => { t[k] = v; return true; },
  });
  const src = FILES.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/^'use strict';/m, '')).join('\n;\n');
  // one sloppy-mode block so every top-level const is visible to lines.js (and its eval)
  const run = new Function('sandbox', `with (sandbox) { ${src}\n; return { linesCSV, parseCSV, lineCells }; }`);
  return run(sandbox);
}

const [, , cmd, arg] = process.argv;
const L = load();
const out = path.join(ROOT, 'data/lines.csv');
if (cmd === 'export') {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const csv = L.linesCSV();
  fs.writeFileSync(out, csv);
  console.log(`data/lines.csv · ${csv.split('\r\n').length - 2} lines`);
} else if (cmd === 'merge') {
  // walks the code's lines in order; each keeps the sheet's edit (unless stale) and the new rows written under it
  const rows = L.parseCSV(fs.readFileSync(arg, 'utf8'));
  const head = rows.shift(), col = n => head.findIndex(h => h.trim().startsWith(n));
  const K = col('key'), W = col('화자'), D = col('대사'), O = col('원문');
  const byKey = {}, under = {}; let last = '^';
  for (const r of rows) {
    const k = (r[K] || '').trim();
    if (k) { byKey[k] = r; last = k; } else if ((r[D] || '').trim()) (under[last] = under[last] || []).push(r);
  }
  const keep = [['key', '장면', '화자', '대사', '원문 (고치지 마세요)']];
  let changed = 0, added = 0, removed = 0; const stale = [];
  const extra = (k, scene) => (under[k] || []).forEach(r => { keep.push(['', scene + ' · 추가', r[W] || '(내레이션)', r[D], '']); added++; });
  extra('^', '(맨 앞)');
  for (const c of L.lineCells()) {
    const r = byKey[c.key];
    if (!r) keep.push([c.key, c.scene, c.who, c.text, c.text]);                     // a line added to the code since
    else if (O >= 0 && r[O] !== c.text) { stale.push(`${c.key}  시트 원문: ${r[O]}  /  코드: ${c.text}`); keep.push([c.key, c.scene, c.who, c.text, c.text]); }
    else {
      if ((r[D] || '').trim() === '(삭제)') removed++;
      else if (r[D] !== c.text || (r[W] && r[W] !== c.who)) changed++;
      keep.push([c.key, c.scene, r[W] || c.who, r[D], c.text]);
    }
    extra(c.key, c.scene);
  }
  const cell = s => /[",\n\r]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
  fs.writeFileSync(out, '\ufeff' + keep.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n');
  console.log(`바뀐 줄 ${changed} · 추가 ${added} · 삭제 ${removed} · 코드가 바뀌어 건너뛴 줄 ${stale.length}`);
  stale.forEach(s => console.log('  ' + s));
} else {
  console.log('usage: node tools/lines.js export | merge <sheet.csv>');
}
