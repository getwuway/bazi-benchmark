/* ==========================================================================
   WuWay — independent verification implementation
   --------------------------------------------------------------------------
   Used ONLY by tests.html. This file deliberately shares no code with
   js/engine.js so that the two can be compared against each other.

     Day pillar   : Julian Day Number arithmetic
                    (anchor: 1949-10-01, JDN 2433191, is 甲子)
     Year + month : Meeus 'Astronomical Algorithms' ch.25 apparent solar
                    longitude, solved iteratively for each solar term,
                    combined with the 五虎遁 stem rule
     Hour pillar  : the 五鼠遁 stem rule

   Accuracy note: the Meeus low-precision series is good to roughly 0.01°,
   about ±15 minutes in time. Cases here sit far enough from a solar-term
   boundary for that to be a fair comparison.
   ========================================================================== */

(function (root) {

  var api = (function () {

    var RAD = Math.PI / 180;
    var STEMS = '甲乙丙丁戊己庚辛壬癸';
    var BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

    /* ------------------------------------------------------- day pillar */
    function jdn(y, m, d) {
      var a = Math.floor((14 - m) / 12);
      var yy = y + 4800 - a;
      var mm = m + 12 * a - 3;
      return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
        Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
    }

    function dayPillar(y, m, d, hour, sect) {
      var day = jdn(y, m, d);
      if (sect === 1 && hour >= 23) day += 1;
      var idx = ((day + 49) % 60 + 60) % 60;
      return STEMS.charAt(idx % 10) + BRANCHES.charAt(idx % 12);
    }

    /* ------------------------------------------------------- solar terms */
    function apparentSolarLongitude(jd) {
      var T = (jd - 2451545.0) / 36525;
      var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
      var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
      var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD) +
        (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) +
        0.000289 * Math.sin(3 * M * RAD);
      var omega = 125.04 - 1934.136 * T;
      var lambda = (L0 + C) - 0.00569 - 0.00478 * Math.sin(omega * RAD);
      return ((lambda % 360) + 360) % 360;
    }

    function solarTermInstant(year, targetDeg, approxMonth, approxDay) {
      var jd = Date.UTC(year, approxMonth - 1, approxDay, 12, 0, 0) / 86400000 + 2440587.5;
      for (var i = 0; i < 6; i++) {
        var delta = targetDeg - apparentSolarLongitude(jd);
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        jd += delta / 0.98564736;
        if (Math.abs(delta) < 1e-6) break;
      }
      return (jd - 2440587.5) * 86400000;
    }

    var JIE = [
      { lon: 315, branch: 2,  m: 2,  d: 4,  name: 'Lichun' },
      { lon: 345, branch: 3,  m: 3,  d: 6,  name: 'Jingzhe' },
      { lon: 15,  branch: 4,  m: 4,  d: 5,  name: 'Qingming' },
      { lon: 45,  branch: 5,  m: 5,  d: 6,  name: 'Lixia' },
      { lon: 75,  branch: 6,  m: 6,  d: 6,  name: 'Mangzhong' },
      { lon: 105, branch: 7,  m: 7,  d: 7,  name: 'Xiaoshu' },
      { lon: 135, branch: 8,  m: 8,  d: 8,  name: 'Liqiu' },
      { lon: 165, branch: 9,  m: 9,  d: 8,  name: 'Bailu' },
      { lon: 195, branch: 10, m: 10, d: 8,  name: 'Hanlu' },
      { lon: 225, branch: 11, m: 11, d: 7,  name: 'Lidong' },
      { lon: 255, branch: 0,  m: 12, d: 7,  name: 'Daxue' },
      { lon: 285, branch: 1,  m: 1,  d: 6,  name: 'Xiaohan' },
    ];

    /* ------------------------------------------------------- year + month */
    function yearMonthPillar(utcMs) {
      var utcYear = new Date(utcMs).getUTCFullYear();

      var solarYear = null, bestLichun = -Infinity;
      for (var y = utcYear - 1; y <= utcYear + 1; y++) {
        var lc = solarTermInstant(y, 315, 2, 4);
        if (lc <= utcMs && lc > bestLichun) { bestLichun = lc; solarYear = y; }
      }

      var yStem = (((solarYear - 4) % 10) + 10) % 10;
      var yBranch = (((solarYear - 4) % 12) + 12) % 12;

      var governing = null, governingAt = -Infinity;
      for (var y2 = utcYear - 1; y2 <= utcYear + 1; y2++) {
        for (var k = 0; k < JIE.length; k++) {
          var at = solarTermInstant(y2, JIE[k].lon, JIE[k].m, JIE[k].d);
          if (at <= utcMs && at > governingAt) { governingAt = at; governing = JIE[k]; }
        }
      }
      var mBranch = governing.branch;
      var n = ((mBranch - 2) % 12 + 12) % 12;
      var mBase = ((yStem % 5) * 2 + 2) % 10;
      var mStem = (mBase + n) % 10;

      return {
        year: STEMS.charAt(yStem) + BRANCHES.charAt(yBranch),
        month: STEMS.charAt(mStem) + BRANCHES.charAt(mBranch),
        governingJie: governing.name,
        solarYear: solarYear,
      };
    }

    /* ------------------------------------------------------- hour pillar */
    function hourPillar(dayHanzi, hour) {
      var dStem = STEMS.indexOf(dayHanzi.charAt(0));
      var hBranch = Math.floor(((hour + 1) % 24) / 2);
      var base = (dStem % 5) * 2;
      return STEMS.charAt((base + hBranch) % 10) + BRANCHES.charAt(hBranch);
    }

    /** Full independent chart for an engine result. */
    function chart(result, sect) {
      sect = sect || 1;
      var ts = result.time.trueSolar;
      var day = dayPillar(ts.year, ts.month, ts.day, ts.hour, sect);
      var ym = yearMonthPillar(result.time.utcMs);
      return {
        year: ym.year,
        month: ym.month,
        day: day,
        hour: hourPillar(day, ts.hour),
        governingJie: ym.governingJie,
        solarYear: ym.solarYear,
      };
    }

    return { chart: chart, jdn: jdn, dayPillar: dayPillar, hourPillar: hourPillar, yearMonthPillar: yearMonthPillar };
  })();

  root.WuWayVerify = api;
  if (typeof module === 'object' && module.exports) module.exports = api;

})(typeof window !== 'undefined' ? window : globalThis);
