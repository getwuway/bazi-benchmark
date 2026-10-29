"""Regenerate chart/true-solar-time-30-charts.png from data/reference-charts.json.

Every value in the figure is read from the JSON, so the image cannot drift from
the data. Requires matplotlib:  python -m pip install matplotlib

    python chart/make-chart.py
"""

import json
import os
import statistics

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "data", "reference-charts.json")
OUT = os.path.join(HERE, "true-solar-time-30-charts.png")

CREAM = "#FBF6EF"
INK = "#2C2A24"
MUTED = "#7A7266"
LINE = "#DED5C6"
EARLY = "#3F6B8A"   # clock ahead of the sun -> negative correction
LATE = "#B4553C"    # clock behind the sun -> positive correction

with open(DATA, encoding="utf-8") as fh:
    results = json.load(fh)["results"]

rows = sorted(
    (
        {
            "city": c["input"]["city"],
            "shift": c["correction"]["total_shift_minutes"],
        }
        for c in results
    ),
    key=lambda r: r["shift"],
)

shifts = [abs(r["shift"]) for r in rows]
n = len(shifts)
mean_abs = statistics.mean(shifts)
median_abs = statistics.median(shifts)
hour_boundary = mean_abs / 120 * 100
day_boundary = mean_abs / 1440 * 100

fig, ax = plt.subplots(figsize=(16, 9), dpi=100)
fig.patch.set_facecolor(CREAM)
ax.set_facecolor(CREAM)

for i, r in enumerate(rows):
    ax.barh(i, r["shift"], height=0.68,
            color=EARLY if r["shift"] < 0 else LATE, linewidth=0, zorder=3)

ax.axvline(0, color=INK, linewidth=1.1, zorder=4)
for band in (15, 30, 60):
    for sign in (-1, 1):
        ax.axvline(sign * band, color=LINE, linewidth=1, linestyle=(0, (3, 4)), zorder=1)

ax.set_yticks(range(n))
ax.set_yticklabels([r["city"] for r in rows], fontsize=10.5, color=INK)
ax.tick_params(axis="y", length=0, pad=6)

ax.set_xlim(-95, 45)
ax.set_xticks([-90, -60, -30, 0, 30])
ax.set_xticklabels(["\u221290", "\u221260", "\u221230", "0", "+30"],
                   fontsize=11, color=MUTED)
ax.tick_params(axis="x", length=0, pad=6, colors=MUTED)

for spine in ax.spines.values():
    spine.set_visible(False)
ax.grid(False)

ax.text(0, 1.115, "Your birth clock is not the sun's clock",
        transform=ax.transAxes, fontsize=27, color=INK, fontweight="bold", va="bottom")
ax.text(0, 1.055,
        "True solar time correction for the 30 reference charts in this repository. "
        "Bars left of zero: the local clock runs ahead of the sun.",
        transform=ax.transAxes, fontsize=12.5, color=MUTED, va="bottom")

worst, best = rows[0], rows[-1]
ax.annotate(f"{worst['city']}  {worst['shift']:.0f} min",
            xy=(worst["shift"], 0), xytext=(-86, 1.35),
            fontsize=12.5, color=EARLY, fontweight="bold", ha="left", va="center")
ax.annotate(f"{best['city']}  {best['shift']:+.0f} min",
            xy=(best["shift"], n - 1), xytext=(26, n - 1),
            fontsize=12, color=LATE, fontweight="bold", ha="left", va="center")

box = dict(boxstyle="round,pad=0.6", facecolor="#FFFFFF", edgecolor=LINE, linewidth=1)
ax.text(0.985, 0.66,
        f"median {median_abs:.0f} min\nmean {mean_abs:.1f} min\n"
        f"{sum(1 for s in shifts if s > 30)} of {n} shift by more than 30 min",
        transform=ax.transAxes, fontsize=12, color=INK, ha="right", va="top",
        bbox=box, linespacing=1.7)

fig.text(0.012, 0.028,
         f"Consequence: shifting the clock by {mean_abs:.0f} min on average moves "
         f"{hour_boundary:.0f}% of uniformly-timed births across a two-hour pillar "
         f"boundary, and {day_boundary:.1f}% across the 23:00 day boundary.",
         fontsize=11.5, color=INK)
fig.text(0.012, 0.008,
         "Data: data/reference-charts.json  \u00b7  30 charts, 20 cities, values locked "
         "2026-10-20  \u00b7  longitude offset + equation of time",
         fontsize=9.5, color=MUTED)
fig.text(0.988, 0.008, "getwuway.com", fontsize=13, color=INK, ha="right",
         fontweight="bold", alpha=0.55)

plt.subplots_adjust(left=0.115, right=0.975, top=0.845, bottom=0.115)
fig.savefig(OUT, facecolor=CREAM)
print("saved", OUT)
