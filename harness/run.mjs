/*
 * Re-runs every case through the vendored engine and checks it against the
 * locked expected values. No dependencies, no network, no build step.
 *
 *   node harness/run.mjs
 *
 * Exit code 0 means every case matches. Exit code 1 means at least one did not,
 * and the failing case ids are printed — that is the whole contract.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);

/* the engine is a browser script; give it a window to attach to */
globalThis.window = globalThis;
require(join(root, 'engine', 'i18n-terms.js'));
require(join(root, 'engine', 'engine.js'));
require(join(root, 'engine', 'verify-independent.js'));

const E = globalThis.WuWayEngine;
const V = globalThis.WuWayVerify;

const data = JSON.parse(readFileSync(join(root, 'data', 'reference-charts.json'), 'utf8'));
const TOL = data.element_tolerance_points;
const ELS = ['wood', 'fire', 'earth', 'metal', 'water'];

let pass = 0;
const fails = [];

for (const r of data.results) {
  const i = r.input;
  const [datePart, timePart] = i.local_datetime.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi] = timePart.split(':').map(Number);

  const res = E.compute({
    year: y, month: mo, day: d, hour: h, minute: mi,
    timeUnknown: false,
    city: { name: i.city, country: i.country, admin1: i.admin1,
            lat: i.latitude, lng: i.longitude, tz: i.timezone },
  });

  const got = {
    year: res.pillars.year.hanzi, month: res.pillars.month.hanzi,
    day: res.pillars.day.hanzi, hour: res.pillars.hour.hanzi,
  };
  const pOk = ['year', 'month', 'day', 'hour'].every((k) => got[k] === r.expected.pillars[k]);
  const elOk = ELS.every((k) => Math.abs(res.elements[k] - r.expected.elements[k]) <= TOL);

  const ind = V.chart(res, 1);
  const indOk = ['year', 'month', 'day', 'hour'].every((k) => ind[k] === got[k]);

  const ok = pOk && elOk && indOk;
  if (ok) {
    pass++;
    console.log('  ok    ' + String(r.id).padStart(2) + '  ' +
      [got.year, got.month, got.day, got.hour].join(' '));
  } else {
    fails.push(r.id);
    console.log('  FAIL  ' + String(r.id).padStart(2) + '  engine=' +
      [got.year, got.month, got.day, got.hour].join(' ') +
      '  expected=' + [r.expected.pillars.year, r.expected.pillars.month,
                       r.expected.pillars.day, r.expected.pillars.hour].join(' ') +
      (pOk ? '' : '  [pillars]') + (elOk ? '' : '  [elements]') + (indOk ? '' : '  [independent]'));
  }
}

console.log('');
console.log('  ' + pass + '/' + data.results.length + ' cases match their locked expectations');
if (fails.length) {
  console.log('  failing ids: ' + fails.join(', '));
  process.exit(1);
}
