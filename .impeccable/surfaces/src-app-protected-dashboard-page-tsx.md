---
version: 1
slug: "src-app-protected-dashboard-page-tsx"
primary_target: "src/app/(protected)/dashboard/page.tsx"
related_targets: ["src/app/(public)/page.tsx"]
---

# App shell and screens

Scope: every signed-in screen plus landing and sign-in/up. Mode: Operate (landing: Persuade, same world).
Audience: gym-goers on a phone between sets or at home in the evening. Job: know today's one thing, do it, feel it count.
Constraints: CLAUDE.md rules, UI only, copy in src/shared/const, honest data only (PRODUCT.md).
Unattended run: user pinned "consumer app, warmer more human palette" and asked not to be consulted.

## Direction contract

THESIS: The app is an outdoor swim club on a sunny morning: bright, clean, encouraging. It refuses the fitness-app default of near-black with neon and the wellness default of pastel calm cards.
OWN-WORLD: Warm sun-washed white ground, lido yellow fields that own the "today" regions, deep ink text, pool blue only for things filling up (progress), coral only for warnings. Archivo (heavy, tight, condensed numerals like painted depth markers) over Figtree body. Small tile radius for rows, full round for floats and chips, one big rounded yellow field per screen. Almost no shadows.
STORY: Open the app, see the one next thing huge, tap it, watch floats fill, get a "You did it" moment, come back tomorrow for the streak.
FIRST VIEWPORT: Home at 375px: greeting line small, then a full-width yellow field with today's workout name at display size and one Start button inside thumb reach; under it a week lane rope of 7 floats; food ring and streak quieter below. Bottom tab bar, 5 items.
FORM: candidate 7 of 7 (outdoor swim club / lido), seed:7fd4e7229a4fd464. Signature move: lane-rope floats, a row of round floats that fill in pool blue one by one for sets, workout days and meals. Raise from airport wayfinding (competitive): each screen leads with the single next decision at monumental scale. Raise from split-flap board (declined): every number sits in tabular fixed cells and changes in place. Raise from ticket wallet (declined): done and missed items stay visible, marked, never removed. Raise from claim-and-proof marketing (declined): landing proves with the real interface, not claims.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
