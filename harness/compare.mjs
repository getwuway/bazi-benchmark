/*
 * Compare YOUR calculator against this benchmark.
 *
 * Drop a JSON file with one entry per case id and the four pillars you produce:
 *
 *   { "1": {"year":"庚午","month":"辛巳","day":"乙酉","hour":"癸未"}, "2": { ... } }
 *
 * then run:
 *
 *   node harness/compare.mjs my-results.json
 *
 * Only the pillars are compared, because element weights are an opinion
 * (coefficients differ between schools) while the four pillars are arithmetic
 * and should not. That distinction is the point of this benchmark.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const file = process.argv[2];
if (!file) {
  console.error('usage: node harness/compare.mjs <your-results.json>');
  process.exit(2);
}

const mine = JSON.parse(readFileSync(file, 'utf8'));
const data = JSON.parse(readFileSync(join(root, 'data', 'reference-charts.json'), 'utf8'));

let match = 0, miss = 0, skipped = 0;
const misses = [];

for (const r of data.results) {
  const got = mine[String(r.id)] || mine[r.id];
  if (!got) { skipped++; continue; }
  const ok = ['year', 'month', 'day', 'hour'].every((k) => got[k] === r.expected.pillars[k]);
  if (ok) match++;
  else {
    miss++;
    misses.push({ id: r.id, got, expected: r.expected.pillars, note: r.note });
  }
}

console.log('  matched ' + match + ' / ' + (match + miss) + (skipped ? '  (' + skipped + ' not supplied)' : ''));
if (misses.length) {
  console.log('');
  for (const m of misses) {
    console.log('  case ' + m.id + ' (' + m.note + ')');
    console.log('    yours:    ' + [m.got.year, m.got.month, m.got.day, m.got.hour].join(' '));
    console.log('    expected: ' + [m.expected.year, m.expected.month, m.expected.day, m.expected.hour].join(' '));
  }
  process.exit(1);
}
