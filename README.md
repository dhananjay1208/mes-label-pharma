# MES ↔ Barcode Printer & Labeling Integration Workshop — Pharma Edition

An interactive training workshop on how a Manufacturing Execution System
drives barcode printers, coders and verifiers — built around the fictional
**Helvion Pharma, Plant 2 Lakeworth** (oral solid dose tablets, EU FMD
serialization), with **real** standards and tools: ZPL, TCP 9100, GS1-128,
GS1 DataMatrix, SSCC, BarTender, NiceLabel, Zebra, Cognex, Antares Vision,
ISO/IEC 15416, EU GMP Annex 11.

Login: `mes` / `dec25` (instructor security code available from your trainer).

## What you'll learn

1. **Where labels live** — the six marking points from the serialization
   station to the palletizer: the FMD carton UI (printed ON the carton, not a
   label), the anti-tamper seal (applied), bundle / case / pallet labels
   (printed from MES via middleware), and why the Italian vignette (bollino)
   is a consumed fiscal material, not a printed label.
2. **The interface contract** — five real message exchanges: a raw ZPL print
   job over TCP 9100, printer health (~HS/SGD/SNMP), verify-&-grade results,
   the template store/version handshake, and the BarTender middleware pattern.
3. **Tools & technology** — ZPL and the direct print path, GS1 identifiers
   (with the SSCC check-digit arithmetic worked end-to-end), label software
   and middleware — plus a table of the real products behind each role,
   including the serialization vendors.
4. **ZPL Playground** — edit live ZPL and watch the label render (the Code 128
   is genuinely scannable from your screen), merge MES batch data into a
   template, and run three guided "break it" failures — including the
   (17)→(11) expiry-becomes-production-date trap that no parser catches.
5. **The Live Label Line** — a deterministic print-&-apply + verify simulation:
   ribbon-out, no-read reprints, a duplicate serial, and a stale template
   printing grade-A labels with last year's expiry — truth vs what the MES
   recorded, under three reconciliation modes.
6. **The Case Label That Lied** — a five-step incident walkthrough: 240 cases
   of batch B-CX-2417 with the wrong expiry, a certified batch record, six
   pallets quarantined at the wholesaler — and the config that catches it on
   case #1.
7. **The configuration checklist** — the eight configurations every
   MES-labeling integration needs: templates under change control, pools, data
   mapping, serial authorities, verify thresholds, label reconciliation, error
   buffering, label stock and vignettes as lot-tracked materials.

## Suggested workshop flow (~90 min)

Sections 1–4 guided (~40 min) → Playground hands-on (15 min) → Live Line
experiments (15 min) → Case study (10 min) → Config-checklist debrief against
your own plant (10 min).

## Running locally

```bash
npm install     # if it hangs: see CLAUDE.md for the IPv6 workaround
npm run dev     # http://localhost:8085
npm test        # 22 engine tests (GS1, Code 128, ZPL, simulation)
npm run build   # static build → dist/
```

## Sibling apps in the pharma training pack

- **ForgeMES Studio — Pharma Edition** — practice the aggregation / Track & Trace
  configuration: https://forgemes-pharma.netlify.app
- **MES-PLC Workshop** — the same interface thinking one level down:
  https://mesplcpharma.netlify.app

*Training environment · fictional company & products · no real production data.*
