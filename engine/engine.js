/* ==========================================================================
   WuWay — calculation engine
   --------------------------------------------------------------------------
   Runs entirely in the browser. No birth data ever leaves the device.

   Pipeline
     1. Resolve the birth city's IANA timezone and standard UTC offset
     2. Detect whether Daylight Saving Time applied at that moment
     3. Convert clock time -> local standard time
     4. Apply the True Solar Time correction (longitude + equation of time)
     5. Build the Four Pillars chart with `lunar-javascript`
     6. Score the five elements from stems, branches and hidden stems
     7. Derive Core / Dominant / Deficit / Anchor element and the five dimensions

   Verified against an independent implementation — see tests.html
   ========================================================================== */

(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WuWayEngine = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {

  var T = (typeof window !== 'undefined' ? window : globalThis).WuWayTerms ||
          (typeof require === 'function' ? require('./i18n-terms.js') : null);

  /* ---------------------------------------------------------------------
     Library access — `lunar-javascript` is loaded as a global in the browser
     and via require() when the engine is used from Node (build / test runs).
     --------------------------------------------------------------------- */
  function LunarLib() {
    if (typeof Solar !== 'undefined') return { Solar: Solar, LunarUtil: LunarUtil };
    if (typeof require === 'function') return require('./vendor/lunar.js');
    throw new Error('lunar-javascript is not loaded');
  }

  var HANZI_TO_KEY = { '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water' };

  var DEFAULTS = {
    dayBoundarySect: 1,
    weights: { stem: 1.0, branch: 0.8, hiddenStem: 0.3 },
    boundaryWarningMinutes: 20,
    unknownTimeHour: 12,
    unknownTimeMinute: 0,
  };

  function cfg() {
    var c = (typeof window !== 'undefined' && window.WUWAY_CONFIG && window.WUWAY_CONFIG.engine) || {};
    return {
      dayBoundarySect: c.dayBoundarySect == null ? DEFAULTS.dayBoundarySect : c.dayBoundarySect,
      weights: c.weights || DEFAULTS.weights,
      boundaryWarningMinutes:
        c.boundaryWarningMinutes == null ? DEFAULTS.boundaryWarningMinutes : c.boundaryWarningMinutes,
      unknownTimeHour: c.unknownTimeHour == null ? DEFAULTS.unknownTimeHour : c.unknownTimeHour,
      unknownTimeMinute: c.unknownTimeMinute == null ? DEFAULTS.unknownTimeMinute : c.unknownTimeMinute,
    };
  }

  /* =====================================================================
     1. TIMEZONE HELPERS
     ===================================================================== */

  /**
   * UTC offset (in minutes) that `timeZone` was observing at the instant `date`.
   * Uses the ICU timezone database through Intl, so historical DST rules and
   * half-hour / 45-minute offsets are all handled correctly.
   */
  function tzOffsetMinutes(timeZone, date) {
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    var parts = dtf.formatToParts(date);
    var o = {};
    for (var i = 0; i < parts.length; i++) o[parts[i].type] = parts[i].value;
    var asUTC = Date.UTC(
      +o.year, +o.month - 1, +o.day,
      (+o.hour) % 24, +o.minute, +o.second
    );
    var t = Math.floor(date.getTime() / 1000) * 1000;
    return Math.round((asUTC - t) / 60000);
  }

  /**
   * Convert a wall-clock local time in `timeZone` to a UTC instant.
   * Two-pass resolution handles the DST transition hours correctly.
   */
  function localToUtc(timeZone, y, mo, d, h, mi) {
    var guess = Date.UTC(y, mo - 1, d, h, mi, 0);
    var off1 = tzOffsetMinutes(timeZone, new Date(guess));
    var utc1 = guess - off1 * 60000;
    var off2 = tzOffsetMinutes(timeZone, new Date(utc1));
    if (off2 !== off1) {
      var utc2 = guess - off2 * 60000;
      var off3 = tzOffsetMinutes(timeZone, new Date(utc2));
      if (off3 === off2) return { utcMs: utc2, offsetMinutes: off2 };
      return { utcMs: utc1, offsetMinutes: off1 };
    }
    return { utcMs: utc1, offsetMinutes: off1 };
  }

  /**
   * The zone's *standard* (non-DST) offset for a given year, in hours.
   * DST always adds time, so the smaller of the January / July offsets is the
   * standard one — this also works for the southern hemisphere.
   */
  function standardOffsetHours(timeZone, year) {
    var jan = tzOffsetMinutes(timeZone, new Date(Date.UTC(year, 0, 15, 12, 0, 0)));
    var jul = tzOffsetMinutes(timeZone, new Date(Date.UTC(year, 6, 15, 12, 0, 0)));
    return Math.min(jan, jul) / 60;
  }

  /**
   * Could this wall-clock time refer to more than one instant, or to none?
   * Happens inside a DST spring-forward gap and during a fall-back overlap.
   */
  function localTimeCandidates(timeZone, y, mo, d, h, mi) {
    var g = Date.UTC(y, mo - 1, d, h, mi, 0);
    var base = tzOffsetMinutes(timeZone, new Date(g));
    var valid = [];
    [base - 60, base, base + 60, base + 120, base - 120].forEach(function (o) {
      var utc = g - o * 60000;
      if (tzOffsetMinutes(timeZone, new Date(utc)) === o && valid.indexOf(utc) === -1) valid.push(utc);
    });
    return valid;
  }

  /* =====================================================================
     2. EQUATION OF TIME  (NOAA formulation, accurate to a few seconds)
     Returns apparent-solar-time minus mean-solar-time, in minutes.
     ===================================================================== */
  function equationOfTimeMinutes(date) {
    var start = Date.UTC(date.getUTCFullYear(), 0, 1);
    var doy = Math.floor((date.getTime() - start) / 86400000) + 1;
    var hour = date.getUTCHours() + date.getUTCMinutes() / 60;
    var gamma = (2 * Math.PI / 365) * (doy - 1 + (hour - 12) / 24);
    return 229.18 * (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    );
  }

  /* =====================================================================
     3. TRUE SOLAR TIME
     trueSolar = localStandard + (longitude - meridian) * 4min + equationOfTime
     ===================================================================== */
  function trueSolarTime(clock, city, tz, options) {
    var opts = options || {};
    var stdOffsetHours = standardOffsetHours(tz, clock.year);
    var conv = localToUtc(tz, clock.year, clock.month, clock.day, clock.hour, clock.minute);
    var dstMinutes = conv.offsetMinutes - Math.round(stdOffsetHours * 60);
    var candidates = localTimeCandidates(tz, clock.year, clock.month, clock.day, clock.hour, clock.minute);

    /* wall clock expressed on a "fake UTC" timeline, then stripped of DST */
    var clockMs = Date.UTC(clock.year, clock.month - 1, clock.day, clock.hour, clock.minute, 0);
    var localStdMs = clockMs - dstMinutes * 60000;

    var meridianLng = stdOffsetHours * 15;
    var eot = equationOfTimeMinutes(new Date(localStdMs));
    var longitudeShift = (city.lng - meridianLng) * 4;      /* minutes */
    var shiftMinutes = longitudeShift + eot;

    var trueMs = localStdMs + shiftMinutes * 60000;
    var d = new Date(trueMs);

    return {
      standardOffsetHours: stdOffsetHours,
      dstOffsetMinutes: dstMinutes,
      offsetAtBirthMinutes: conv.offsetMinutes,
      /* the absolute instant of the birth — timezone- and DST-correct.
         Solar-term boundaries are global events, so the year and month
         pillars must be read against this instant, not the local wall clock. */
      utcMs: conv.utcMs,
      dstAmbiguity: candidates.length === 0 ? 'nonexistent'
        : (candidates.length > 1 ? 'ambiguous' : 'normal'),
      meridianLng: meridianLng,
      equationOfTimeMinutes: eot,
      longitudeShiftMinutes: longitudeShift,
      totalShiftMinutes: shiftMinutes,
      trueSolar: {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        hour: d.getUTCHours(),
        minute: d.getUTCMinutes(),
      },
      localStandardMs: localStdMs,
    };
  }

  /* =====================================================================
     4. FOUR PILLARS
     ---------------------------------------------------------------------
     Two reference frames are needed, and this is the part most
     implementations get wrong:

       * The YEAR and MONTH pillars are governed by solar terms (立春, 惊蛰…),
         which are astronomical events happening at a single instant for the
         whole planet. They must be evaluated against the birth's absolute
         instant — expressed here in the UTC+8 frame that the Chinese
         calendar library works in.

       * The DAY and HOUR pillars are local by definition: the day begins at
         local midnight (or 23:00 under the 子时 rule), so they are evaluated
         against the local True Solar Time.
     ===================================================================== */
  function buildPillars(t) {
    var lib = LunarLib();
    var sect = cfg().dayBoundarySect;
    var ts = t.trueSolar;

    /* ---- local frame: day + hour pillars ---- */
    var localSolar = lib.Solar.fromYmdHms(ts.year, ts.month, ts.day, ts.hour, ts.minute, 0);
    var localLunar = localSolar.getLunar();

    /* ---- absolute frame: year + month pillars ---- */
    var bj = new Date(t.utcMs + 8 * 3600000);
    var cstSolar = lib.Solar.fromYmdHms(
      bj.getUTCFullYear(), bj.getUTCMonth() + 1, bj.getUTCDate(),
      bj.getUTCHours(), bj.getUTCMinutes(), bj.getUTCSeconds()
    );
    var cstLunar = cstSolar.getLunar();

    var ecDay = localLunar.getEightChar();
    ecDay.setSect(sect);
    var ecYearMonth = cstLunar.getEightChar();
    ecYearMonth.setSect(sect);

    var ganWx = lib.LunarUtil.WU_XING_GAN;
    var zhiWx = lib.LunarUtil.WU_XING_ZHI;

    function pillar(label, hanzi, gan, zhi, hideGan) {
      return {
        label: label,
        hanzi: hanzi,
        gan: gan,
        zhi: zhi,
        ganElement: HANZI_TO_KEY[ganWx[gan]],
        zhiElement: HANZI_TO_KEY[zhiWx[zhi]],
        hiddenStems: hideGan.slice(),
        hiddenElements: hideGan.map(function (g) { return HANZI_TO_KEY[ganWx[g]]; }),
      };
    }

    return {
      year:  pillar('Year',  ecYearMonth.getYear(),  ecYearMonth.getYearGan(),  ecYearMonth.getYearZhi(),  ecYearMonth.getYearHideGan()),
      month: pillar('Month', ecYearMonth.getMonth(), ecYearMonth.getMonthGan(), ecYearMonth.getMonthZhi(), ecYearMonth.getMonthHideGan()),
      day:   pillar('Day',   ecDay.getDay(),   ecDay.getDayGan(),   ecDay.getDayZhi(),   ecDay.getDayHideGan()),
      hour:  pillar('Hour',  ecDay.getTime(),  ecDay.getTimeGan(),  ecDay.getTimeZhi(),  ecDay.getTimeHideGan()),
      lunar: {
        year: localLunar.getYearInChinese() + '年',
        month: localLunar.getMonthInChinese() + '月',
        day: localLunar.getDayInChinese(),
      },
      prevJieQi: cstLunar.getPrevJieQi(true).getName(),
      prevJieQiAt: cstLunar.getPrevJieQi(true).getSolar().toYmdHms(),
      nextJieQi: cstLunar.getNextJieQi(true).getName(),
      nextJieQiAt: cstLunar.getNextJieQi(true).getSolar().toYmdHms(),
      /* the UTC+8 wall clock of the birth — useful for debugging & tests */
      cstFrame: {
        year: bj.getUTCFullYear(), month: bj.getUTCMonth() + 1, day: bj.getUTCDate(),
        hour: bj.getUTCHours(), minute: bj.getUTCMinutes(),
      },
    };
  }

  /* =====================================================================
     5. ELEMENT DISTRIBUTION
     ===================================================================== */
  function scoreElements(pillars) {
    var w = cfg().weights;
    var raw = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    var list = [pillars.year, pillars.month, pillars.day, pillars.hour];

    list.forEach(function (p) {
      raw[p.ganElement] += w.stem;                                  /* heavenly stem    */
      raw[p.zhiElement] += w.branch;                                /* earthly branch   */
      p.hiddenElements.forEach(function (e) {                       /* branch hidden stems */
        raw[e] += w.hiddenStem;
      });
    });

    var total = 0;
    for (var k in raw) total += raw[k];

    var pct = {};
    for (var k2 in raw) pct[k2] = total > 0 ? (raw[k2] / total) * 100 : 0;

    return { raw: raw, total: total, pct: pct };
  }

  function sortByScore(pct) {
    return T.ORDER.slice().sort(function (a, b) {
      if (pct[b] !== pct[a]) return pct[b] - pct[a];
      return T.ORDER.indexOf(a) - T.ORDER.indexOf(b);
    });
  }

  /* =====================================================================
     6. CORE / STRENGTH / ANCHOR
     ===================================================================== */
  function deriveCore(pillars, pct) {
    var core = pillars.day.ganElement;            /* the Day Master */
    var supportGroup = [core, T.fedBy(core)];     /* Community + Support = 2 of 5 roles */
    var support = pct[supportGroup[0]] + pct[supportGroup[1]];

    /* Neutral expectation for a two-role group is 40% of the total.
       The month branch (月令) is the single strongest influence on a chart,
       so a supportive month lifts the index and a draining one lowers it. */
    var index = support / 40;
    var monthEl = pillars.month.zhiElement;
    var monthSupports = supportGroup.indexOf(monthEl) !== -1;
    index *= monthSupports ? 1.15 : 0.9;

    var state = index >= 1 ? 'abundant' : 'depleted';

    var candidates;
    if (state === 'depleted') {
      /* Depleted energy is restored by Support (what feeds the Core) and by
         Community (the Core itself). */
      candidates = [T.fedBy(core), core];
    } else {
      /* Abundant energy is balanced by Expression (what the Core produces),
         Structure (what restrains it) and Resources (what it can put to work). */
      candidates = [T.FEEDS[core], T.controlledBy(core), T.CONTROLS[core]];
    }

    var anchor = candidates[0];
    var anchorScore = pct[anchor];
    var anchorTie = false;
    for (var i = 1; i < candidates.length; i++) {
      var c = candidates[i];
      if (pct[c] < anchorScore - 0.0001) {
        anchor = c;
        anchorScore = pct[c];
        anchorTie = false;
      } else if (Math.abs(pct[c] - anchorScore) < 0.0001) {
        anchorTie = true;
      }
    }

    var sorted = sortByScore(pct);
    var dominant = sorted[0];
    var lowest = sorted[sorted.length - 1];

    /* "Deficit" = any element carrying less than half of the balanced share. */
    var deficits = sorted.filter(function (e) { return pct[e] < 8; });
    if (deficits.length === 0) deficits = [lowest];
    deficits.sort(function (a, b) { return pct[a] - pct[b]; });

    return {
      core: core,
      coreGan: pillars.day.gan,
      coreGanHanzi: pillars.day.hanzi,
      supportGroup: supportGroup,
      supportPercent: support,
      strengthIndex: index,
      energyState: state,
      anchor: anchor,
      anchorScore: anchorScore,
      anchorCandidates: candidates,
      anchorTie: anchorTie,
      dominant: dominant,
      dominantScore: pct[dominant],
      lowest: lowest,
      lowestScore: pct[lowest],
      deficits: deficits,
    };
  }

  /* =====================================================================
     7. FIVE DIMENSIONS
     ===================================================================== */
  function buildDimensions(core, pct) {
    return T.DIMENSIONS.map(function (dim) {
      var el = T.elementForDimension(dim, core.core);
      var p = pct[el];
      var level = p >= 26 ? 'high' : (p >= 15 ? 'moderate' : 'low');
      return {
        key: dim.key,
        term: dim.term,
        cn: dim.cn,
        name: dim.name,
        summary: dim.summary,
        element: el,
        elementName: T.ELEMENTS[el].name,
        percent: p,
        level: level,
      };
    });
  }

  /* =====================================================================
     8. WARNINGS
     ===================================================================== */
  function buildWarnings(input, t, pillars) {
    var warn = [];
    var limit = cfg().boundaryWarningMinutes;

    if (input.timeUnknown) {
      warn.push({
        code: 'unknown-time',
        level: 'info',
        text: 'Birth time not provided — the reading uses 12:00 local time. ' +
              'The Hour pillar and the element distribution are approximate.',
      });
    }

    /* DST spring-forward gap / fall-back overlap */
    if (t.dstAmbiguity === 'ambiguous') {
      warn.push({
        code: 'dst-ambiguous',
        level: 'warn',
        text: 'This clock time occurred twice on that date because the clocks went back. ' +
              'The reading uses the standard-time interpretation — if you were born in the ' +
              'first pass, the Hour pillar may differ.',
      });
    } else if (t.dstAmbiguity === 'nonexistent') {
      warn.push({
        code: 'dst-gap',
        level: 'warn',
        text: 'This clock time did not exist on that date because the clocks jumped forward. ' +
              'The nearest valid instant was used.',
      });
    }

    /* proximity to a two-hour boundary (odd hours, 23:00-01:00 being the Rat hour) */
    var ts = t.trueSolar;
    var minutes = ts.minute + ts.hour * 60;
    var twoHour = 120;
    var into = minutes % twoHour;
    var dist = Math.min(into, twoHour - into);
    if (dist <= limit) {
      warn.push({
        code: 'hour-boundary',
        level: 'warn',
        text: 'The true solar time falls within ' + Math.round(dist) + ' minute(s) of a ' +
              'two-hour boundary, so the Hour pillar sits on a cusp. A slightly different ' +
              'birth time would shift it.',
      });
    }

    /* proximity to the solar term that governs the month pillar */
    try {
      var lib = LunarLib();
      var bj = new Date(t.utcMs + 8 * 3600000);
      var s = lib.Solar.fromYmdHms(
        bj.getUTCFullYear(), bj.getUTCMonth() + 1, bj.getUTCDate(),
        bj.getUTCHours(), bj.getUTCMinutes(), bj.getUTCSeconds()
      );
      var lu = s.getLunar();
      [lu.getPrevJieQi(true), lu.getNextJieQi(true)].forEach(function (jq) {
        var diff = Math.abs((jq.getSolar().getJulianDay() - s.getJulianDay()) * 86400);
        if (diff < limit * 60) {
          warn.push({
            code: 'jieqi-boundary',
            level: 'warn',
            text: 'The birth moment sits within ' + Math.round(diff / 60) + ' minute(s) of the ' +
                  'solar term that starts the month pillar. Births this close to a boundary are ' +
                  'traditionally read on both sides.',
          });
        }
      });
    } catch (e) { /* jieqi proximity is a nicety — never block a result on it */ }

    return warn;
  }

  /* =====================================================================
     PUBLIC: compute()
     ===================================================================== */
  function compute(input) {
    if (!input || !input.city) throw new Error('A birth city is required.');
    var city = input.city;
    if (!city.lat && city.lat !== 0) throw new Error('Birth city is missing coordinates.');
    if (!city.lng && city.lng !== 0) throw new Error('Birth city is missing coordinates.');
    if (!city.tz) throw new Error('Birth city is missing a timezone.');

    var c = cfg();
    var timeUnknown = !!input.timeUnknown;

    var clock = {
      year: +input.year,
      month: +input.month,
      day: +input.day,
      hour: timeUnknown ? c.unknownTimeHour : +input.hour,
      minute: timeUnknown ? c.unknownTimeMinute : +input.minute,
    };

    var t = trueSolarTime(clock, city, city.tz, c);
    var pillars = buildPillars(t);
    var scored = scoreElements(pillars);
    var core = deriveCore(pillars, scored.pct);
    var dimensions = buildDimensions(core, scored.pct);
    var warnings = buildWarnings(input, t, pillars);

    var sorted = sortByScore(scored.pct);
    var ranked = sorted.map(function (k, i) {
      return {
        key: k,
        rank: i + 1,
        name: T.ELEMENTS[k].name,
        hanzi: T.ELEMENTS[k].hanzi,
        color: T.ELEMENTS[k].color,
        percent: Math.round(scored.pct[k] * 10) / 10,
        raw: Math.round(scored.raw[k] * 100) / 100,
      };
    });

    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      input: {
        year: clock.year, month: clock.month, day: clock.day,
        hour: clock.hour, minute: clock.minute,
        timeUnknown: timeUnknown,
        city: {
          name: city.name, admin1: city.admin1 || '', country: city.country || '',
          lat: city.lat, lng: city.lng, tz: city.tz,
        },
      },
      time: {
        clock: clock,
        utcMs: t.utcMs,
        dstAmbiguity: t.dstAmbiguity,
        standardOffsetHours: t.standardOffsetHours,
        dstOffsetMinutes: t.dstOffsetMinutes,
        offsetAtBirthMinutes: t.offsetAtBirthMinutes,
        dstApplied: t.dstOffsetMinutes !== 0,
        meridianLng: t.meridianLng,
        equationOfTimeMinutes: t.equationOfTimeMinutes,
        longitudeShiftMinutes: t.longitudeShiftMinutes,
        totalShiftMinutes: t.totalShiftMinutes,
        trueSolar: t.trueSolar,
      },
      pillars: pillars,
      elements: scored.pct,
      ranked: ranked,
      core: core,
      dimensions: dimensions,
      warnings: warnings,
      approximate: timeUnknown,
    };
  }

  /* ---------------------------------------------------------------------
     Convenience: the one-line summary used on the free result page
     --------------------------------------------------------------------- */
  function summaryLine(result) {
    var E = T.ELEMENTS;
    var d = result.core.dominant;
    var a = result.core.anchor;
    return 'Your energy is led by ' + E[d].name + ' (' + Math.round(result.elements[d]) + '%) — ' +
           E[d].keyword.toLowerCase() + '. Your Anchor Element is ' + E[a].name +
           ': ' + anchorInvitation(a) + '.';
  }

  function anchorInvitation(el) {
    var map = {
      wood: 'small steps that start something and keep it moving',
      fire: 'warmth, contact and a little visible delight',
      earth: 'simple routines that repeat and settle you',
      metal: 'a little more clarity, order and honest editing',
      water: 'quiet, rest and time with your own instinct',
    };
    return map[el];
  }

  return {
    compute: compute,
    summaryLine: summaryLine,
    anchorInvitation: anchorInvitation,
    /* exposed for tests.html */
    _internals: {
      tzOffsetMinutes: tzOffsetMinutes,
      localToUtc: localToUtc,
      standardOffsetHours: standardOffsetHours,
      equationOfTimeMinutes: equationOfTimeMinutes,
      trueSolarTime: trueSolarTime,
      scoreElements: scoreElements,
      deriveCore: deriveCore,
      sortByScore: sortByScore,
    },
  };
});
