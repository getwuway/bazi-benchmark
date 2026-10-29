# Methodology

How the expected values in this repository were produced, and what would make
them wrong.

## 1. Two implementations, no shared code

The expected pillars are not one program's output copied down. They were
produced by two independent paths:

**Path A — the reference engine** (`engine/engine.js`): delegates the sexagenary
cycle to a vendored Chinese calendar library, evaluates year and month pillars
against the birth's absolute instant in a UTC+8 frame, and evaluates day and hour
pillars against local true solar time.

**Path B — the independent implementation** (`engine/verify-independent.js`):
- day pillar from **Julian Day Number arithmetic** (anchor: 1949-10-01 = JDN
  2433191 = 甲子)
- year and month pillars from **Meeus apparent solar longitude** solved
  iteratively for each solar term
- hour pillar from the **五鼠遁** stem rule

Path B imports nothing from Path A. Agreement between them is therefore evidence,
not tautology.

## 2. What is compared, and what is not

| Field | Compared | Why |
|---|---|---|
| Four pillars | yes | Deterministic arithmetic. A mismatch is a bug. |
| Element weights | yes, within 0.6 points | Coefficients are a modelling choice; 0.6 allows different rounding without allowing different structure. |
| Core / anchor / dominant element | recorded, not asserted | Depends on the weighting scheme, which is an opinion. |
| Interpretation of the chart | never | Out of scope. This is a calendar-rules benchmark, not a reading. |

## 3. The measurement that limits the benchmark

The independent implementation uses the Meeus **low-precision** solar longitude
series. Its own header states the accuracy: about 0.01°, roughly ±15 minutes in
time.

That was measured rather than trusted. Sweeping minute offsets around 立春
2026-02-04 04:02:08 (UTC+8) and comparing the two implementations:

| Offset from the term | Agreement |
|---|---|
| −20 min and earlier | agree |
| −10 min | agree |
| **−6 min and closer** | **disagree** — path B reports the new month first |
| +5 min and later | agree again |

This is why every one of the 30 cases sits well away from a solar-term boundary.
It is not a weakness that was hidden; it is the reason the pass rate is
meaningful at all.

## 4. Reproduction

```bash
node harness/run.mjs
```

The engine is vendored, so this runs against exactly the version that produced
`data/reference-charts.json`. If a future change to the engine moves a pillar,
this command fails loudly and the failing case ids are printed.

## 5. Regeneration

The canonical source is the live site's test suite:
<https://getwuway.com/tests/cases.json>. `data/reference-charts.json` is a
reshaped, documented projection of it, recomputed with the engine at build time
rather than transcribed.
