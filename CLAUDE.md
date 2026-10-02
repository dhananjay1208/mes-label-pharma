# CLAUDE.md — mes-label-pharma

MES ↔ Barcode Printer / Labeling integration training workshop for
pharmaceutical (oral solid dose) manufacturing — fictional **Helvion Pharma,
Plant 2 Lakeworth**. Built 2026-09-26 by porting the tobacco golden master
`MES Practitioner Training\Apps\mes-label-tobacco` (deliverable #11 of the
pharma pack). **The canon is `..\PHARMA-MES-CONTEXT.md`** (its "Labeling canon"
block is reproduced verbatim in `src/data/world.ts` `labels{}`) — every id,
number, machine code and fault code comes from there; never invent parallel ids.

Vite 5 + React 18 + **TypeScript** + Tailwind 3.4 + shadcn/ui (stock kit under
`src/components/ui/`, do not edit) + **vitest** (22 tests). Single route;
`src/pages/Index.tsx` holds the `currentSection` switch over 8 sections.
Deploys to Netlify (`netlify.toml`, SPA redirect). Dev port **8085**.
Repo / Netlify site: not yet created (DK's orchestrator does git + publishing).

## Product concept (do not drift from this)

The labeling-side sibling of mes-plc-pharma: participants learn how an MES
drives barcode printers, coders and verifiers — the interface mechanics, the
required configurations, and the real tools involved. 8 sections: Overview →
**Where Labels Live** (the marking map, 6 cards) → **The Interface Contract**
(5 exchanges) → Tools & Technology (3 deep-dives + real-tools table) → **ZPL
Playground** (live editor + real Code 128 render, 4 presets, 3 break-its) →
**The Live Label Line** (print-apply-verify tick sim) → Case Study ("The Case
Label That Lied") → Configuration & Glossary (the 8-item config checklist).
Real standards and vendor names (Zebra/ZPL, SATO, BarTender, NiceLabel, GS1,
Cognex, Antares Vision / OPTEL / Systech, EU FMD, Annex 11); the plant, the
products (Cardexil) and the MES (ForgeMES) stay fictional.

## Architecture contract

- **ALL content lives in `src/data/*.ts`; components are presentation only** —
  with TWO deliberate exceptions, both vitest-covered:
  1. Pure engines live in `src/lib/`: `gs1.ts` (check digits, AI parsing),
     `zpl/code128.ts` (REAL GS1-128 encoding — 107-entry width table,
     subset B/C auto-switch, checksum), `zpl/tokenizer.ts` + `zpl/renderer.ts`
     (the playground's ZPL subset), `labelLineSim.ts` (the sim's pure
     `step(prev)`). Ported UNTOUCHED from the golden master except: doc-comment
     examples now use pharma ids, and the two event strings that carried canon
     values (case-serial prefix, cases per pallet) now read `SIM.caseSerialPrefix`
     / `SIM.palletCases` from `data/liveLine.ts`.
  2. `LiveLineSection.tsx` owns ONLY the gated `setInterval`; physics are in
     the lib. Sim CONFIG (script, fault map, state colors) stays in
     `data/liveLine.ts`.
- **Frozen test vector (re-derived by hand for the pharma SSCC; do not change
  without re-deriving):** encoding `(00)003591230800127456` → Start C(105)
  FNC1(102) pairs 00 00 35 91 23 08 00 12 74 56 → weighted sum 2460 →
  2460 mod 103 = **91** → Stop(106).
- **Check digits are computed, never invented** (mod-10, weights 3/1 from the
  right): SSCC payload 00359123080012745 → 3×27 + 23 = 104 → **6**; case
  GTIN 2035912300031 → 3×17 + 12 = 63 → **7**; carton GTIN 0035912300010 →
  3×14 + 10 = 52 → **8**. `gs1.test.ts` proves all three with the app's helper.
- The sim is **deterministic**: no RNG, no `Date.now` — sine ripple + scripted
  incidents at ticks 28 (ribbon-low warn) / 52 (6101) / 97 (6210) / 133 (6220)
  / 168–201 (6305); windows avoid multiples of 15 so batch-15s reconciliation
  visibly lags. Loop 240 ticks = one **48-case** pallet (a case every 5 ticks;
  the real CP1 closes exactly 1 case/min).
- `src/data/types.ts` — `MessageType` union: `print-job | printer-status |
  verify-result | template-download | middleware-trigger`. `SignalRow` columns
  `{tag, address, dataType, format, trigger}`; `trap: true` rows get the teal
  highlight. Field names `plantUse` / `plantRole` / `plantExample` /
  `ProtocolDeepDive.plant` (renamed from the donor's `tobaccoUse` / `plant4*`).
- ZPL subset (tokenizer KNOWN set): `XA XZ FO FS FD FN CF A0 BY BC BX GB PW
  LL CI DF XF`. `^FB` and true DataMatrix encoding are DECLARED NON-GOALS —
  the FMD carton UI is deliberately NOT rendered as a real DataMatrix; unknown
  commands surface as "unsupported" chips. Do not silently widen the subset.
- **Case label is 6×4" LANDSCAPE (`^PW1218^LL812`, `^BY2`)** — four AIs
  (01)(17)(10)(21) make a 442-module GS1-128 that does not fit the 4×6 portrait
  canvas at any legible width. Pallet and blank presets stay 812×1218 portrait;
  the bundle preset is 812×406 (4×2", PRN-BN3). `zplTokenizer.test.ts` asserts
  the case barcode fits inside 1218 dots.
- Login gate: user `mes`, default password `dec25` (localStorage
  `mesLabelPharmaPass`), instructor code `1208`, session flag
  `mesLabelPharmaAuth`.
- `caseStudy.ts` `correct` values must be exact string copies of an
  `options[]` entry.

## Domain rules from DK (owner) — MUST respect

- **Identity law (canon):** ORDER → BATCH → **carton UI (FMD DataMatrix)
  printed & verified ONLY at the cartoner's serialization station** → bundle
  (10) → case (200 cartons) → pallet SSCC (48 cases) — and no batch is
  sellable without QP certification + FMD upload. Never show a UI before CR3.
- **Serial authority:** carton serials come ONLY from the L4 serialization
  provider's allocated ranges (randomised, ≤20 alnum; e.g. `4T7K9DQ2CX41`) via
  `HP2-SER` — "the MES consumes ranges, it never invents carton codes".
  Bundle/case/SSCC ids (`BN-2417-88`, `CS-2417-31`, `003591230800127456`) are
  MES-generated under **GS1 company prefix 0359123**. Never blur the two.
- **Marking map:** carton UI = printed ON the carton (not a label); anti-tamper
  seal = applied, not printed; bundle/case/pallet = printed labels from MES via
  middleware; Italian vignette `VIG-IT-CDX10` on `CDX-10-EXP` = consumed,
  lot-tracked fiscal material reconciled per shift (the tax-stamp analog).
- **Labeling canon (verbatim from PHARMA-MES-CONTEXT.md):** printers
  `PRN-CP1`/`PRN-CP1B` (Zebra ZE511, 300 dpi, pool `POOL-CASE`) on CP1,
  `PRN-PZ1` (ZT411, 203 dpi) on PZ1, `PRN-BN3` (ZD621) bundle labels; endpoints
  `tcp://prn-*.hp2.local:9100`; middleware `http://labelsvc.hp2.local:8080`
  (BarTender Integration Builder); site serialization manager `HP2-SER`;
  carton GTIN-14 `00359123000108`, case GTIN-14 `20359123000317`, SSCC-18
  `003591230800127456`; case label `(01)+(17)+(10)+(21)`, pallet
  `(00)+(02)+(37)+(10)`; templates `LBL-CASE-STD` v14 (stale v13 = the
  case-study incident, `E:LBLCASE.ZPL`) / `LBL-PLT-SSCC` v6 / `LBL-BUNDLE` v3;
  grading pass ≥ C (1.5), warn < B (2.5), **content mismatch = hard fail (in
  GMP a readable label with the wrong batch/expiry is a recall)**; faults
  6101 / 6102 / 6210 / 6220 / 6305 (+ 2205 = CR3 UI printhead); materials
  `LBL-CASE` / `LBL-PALLET` / `LBL-BUNDLE` / `RIB-WAX-RES` (lotTracked).
- Expiry `2028-06` is encoded as AI (17) `280630` (last day of the month);
  the stale v13 template's lie is `270630` (June 2027, "last year's expiry").
- **Never duplicate ForgeMES Studio's Track & Trace configuration exercises**
  (aggregation levels, track points, EPCIS config) — cross-link
  forgemes-pharma.netlify.app instead. This app owns printing/verifying;
  ForgeMES owns aggregation practice. Honest FMD note: aggregation is NOT
  mandated by FMD — Helvion builds it as best practice; say so, never "by law".
- Color rule (theming seam = `tailwind.config.ts` ramps ONLY; class names are
  inherited from the golden master and NOT renamed): **`leaf-*` = MES = indigo
  (`#3730a3` family)**, **`tobacco-*` = printers / marking devices = teal
  (`#0f766e` family)**, `cream` = mist `#f2f7f9`; the stale-template
  content-mismatch stays **purple** in the sim.
- Never-block quizzes; fictional company/products only; never build Tailwind
  classes from template strings (literal class fields in data).

## Stack & commands

```bash
npm install    # HANGS on this machine (IPv6). node_modules was robocopied
               # from the donor mes-label-tobacco instead.
npm run dev    # port 8085
npm run build  # vite build only — no type check!
npx tsc -p tsconfig.app.json --noEmit   # run this too; TS strict is OFF
npm test       # vitest — 22 tests: gs1, code128, zpl tokenizer/renderer, sim
```

Deploy = `git push` to main (Netlify auto-builds) once DK creates the repo.
Do NOT use the Netlify MCP deploy tool. PowerShell multiline commits:
`git commit -F <tempfile>`.

## Verification

`npm run build` + `npx tsc --noEmit` + `npm test` must pass. Browser smoke
(DK's orchestrator — not done by the port agent): login (pharma strapline) →
Overview tiles → Label Points (6 marking cards: carton UI "NOT a label", seal
"applied", vignette "NOT a printed label") → Interface Contract: all 5 flows
render both viewer tabs, ⚠ trap rows teal, quizzes wrong-first continue →
Tools: drag-drop, 3 deep-dive tabs, real-tools table incl. serialization row →
**Playground**: case preset renders a landscape label with bars + human line;
edit BATCH → preview updates; break-it #2 (FNC1) turns the GS1 panel red;
break-it #3 ((17)→(11)) shows "Production date" with NO error; check-digit
widget gives 6 for 00359123080012745 → **Live Label Line**: Start → :28
ribbon-low warn, :52 ribbon-out fault (queue grows), :97 no-read reprints
(printed > applied), :133 duplicate serial CS-2417-31, :168–:201 purple
content-mismatch cells while the MES strip stays green; pallet closes at
case 48; recon-mode switch changes the MES strip cadence; Pause/Reset clean;
navigate away+back = no runaway interval → Case study 5 steps (wrong-first
continues) → Config & Close: 8 checklist accordions, T/F quiz (q3 = check
digit 6), glossary search "FNC1" → new tab shows the gate again.
