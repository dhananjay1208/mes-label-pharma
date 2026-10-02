import type { CaseStep } from './types';

export const SCENARIO = {
  title: 'Scenario: The Case Label That Lied',
  description:
    'Tuesday, 10:20: maintenance swapped PRN-CP1\'s printhead after the wear alarms, mid-way through packaging batch B-CX-2417. Wednesday: the batch record is reviewed by exception — every verify record says PASS, grade A — and the QP certifies QP-2417. Thursday, 14:10: the wholesaler\'s inbound scanner rejects six Helvion pallets — every case label decodes expiry (17)270630, June 2027, last year\'s date. The cartons inside say June 2028 and are correct. Walk the incident end to end: what the verifier really proved, where label content actually comes from, the root cause, the containment, and the one configuration that would have caught it on the first case.',
  stats: [
    { value: '6', label: 'Pallets Quarantined at the Wholesaler', colorClass: 'text-red-600' },
    { value: '240', label: 'Cases With the Wrong Expiry', colorClass: 'text-orange-600' },
    { value: 'A', label: 'Grade on Every Label', colorClass: 'text-leaf-700' },
    { value: '1', label: 'Stale Template (v13)', colorClass: 'text-purple-600' },
  ],
};

export const LINE_STATIONS = [
  'CP1 Case Packer',
  'PRN-CP1 Print & Apply',
  'SCAN-CP1 Verifier',
  'PZ1 Palletizer',
  'Quarantine Warehouse',
  'QP Release',
  'Wholesaler Inbound',
];

export const CASE_STEPS: CaseStep[] = [
  {
    step: 1,
    title: 'What did the verifier actually prove?',
    description:
      'First instinct: "the verifier passed 240 bad labels — it must be broken." Pull one verify event and look at what it really says.',
    question: 'Every verify record shows PASS with grade A. Can the labels still be wrong?',
    options: [
      'No — grade A means the label is correct',
      'Yes — ISO 15416 grades PRINT QUALITY; content correctness needs a separate decode-and-compare against MES-expected values',
      'Only if the scanner was miscalibrated',
      'Only if someone tampered with the verify events',
    ],
    correct: 'Yes — ISO 15416 grades PRINT QUALITY; content correctness needs a separate decode-and-compare against MES-expected values',
    explanation:
      'The grade answers "how well is this barcode printed?" — contrast, modulation, decodability. It never asks "is this the RIGHT data?". Plant 2\'s content-compare was configured for the carton serialization cameras (SER-CR3 — FMD made that unavoidable) but not for SCAN-CP1 — so the case verifier graded beautifully printed lies, honestly. And review-by-exception, seeing nothing but PASS, had nothing to except.',
    dataExample: {
      type: 'Verify Event (Tuesday 10:24)',
      fields: [
        { label: 'grade', value: '3.7 (A)' },
        { label: 'decoded (17)', value: '270630  ← June 2027, last year\'s expiry' },
        { label: 'MES-expected (17)', value: '280630  (batch B-CX-2417, expiry 2028-06)' },
        { label: 'contentMatch', value: 'NOT CONFIGURED for SCAN-CP1' },
        { label: 'disposition', value: 'PASS' },
      ],
    },
  },
  {
    step: 2,
    title: 'Where does label content actually come from?',
    description:
      'The MES print jobs for Tuesday all carry the right data — ORDER PO-77231, BATCH B-CX-2417, EXPIRY 280630. So how did 270630 reach the label?',
    question: 'The per-case jobs send only ^FN variable data and recall the template by name (^XF E:LBLCASE.ZPL). What does that make the printer?',
    options: [
      'A pure output device — it prints exactly what each job sends',
      'A second, unmanaged content source: whatever template its flash holds supplies every field the job does NOT send',
      'A backup of the label library',
      'Irrelevant — content always comes from the MES',
    ],
    correct: 'A second, unmanaged content source: whatever template its flash holds supplies every field the job does NOT send',
    explanation:
      'Template v14 binds the expiry into ^FN2 (text) and ^FN3 (barcode) from the job. v13 — last year\'s layout — carried the expiry as a STATIC ^FD left over from its qualification print run against a 2027-06 batch. Recall-by-name happily used v13: the job\'s correct batch and serial filled the fields v13 exposed, and v13\'s frozen expiry filled the rest. The printer is a data store, and nobody was managing it.',
    dataExample: {
      type: 'Template Registry vs Printer Flash',
      fields: [
        { label: 'Library LBL-CASE-STD', value: 'v14 · CRC 0x5C3E91A7' },
        { label: 'PRN-CP1 E:LBLCASE.ZPL', value: 'v13 · CRC 0x2B80D4F1  ✗ MISMATCH' },
        { label: 'v13 expiry field', value: 'static ^FD270630 / "EXP 06/2027" (qualification-run leftover)' },
        { label: 'v14 expiry field', value: '^FN2 + ^FN3 (merged from the job)' },
      ],
    },
  },
  {
    step: 3,
    title: 'Root cause',
    description:
      'The head swap is the trigger, not the cause. The service laptop re-flashed the printer from its local folder — restoring the template that laptop last held: v13.',
    question: 'What is the actual root cause of 240 wrong labels?',
    options: [
      'The technician who used an old service laptop',
      'The printhead swap procedure',
      'Recall-by-name with no version pin and no CRC readback — v13 could masquerade as v14 indefinitely',
      'Zebra printers retaining flash through power cycles',
    ],
    correct: 'Recall-by-name with no version pin and no CRC readback — v13 could masquerade as v14 indefinitely',
    explanation:
      'Blaming the technician fixes nothing — flash persistence and old service laptops are permanent facts of plant life. The integration gap is that the MES recalled E:LBLCASE.ZPL by NAME and never verified WHICH version answered. One SGD file.crc32 readback at order start — two lines of code — makes the masquerade impossible. Note what the batch record did: it recorded "LBL-CASE-STD v14" on every print job, because that is what the MES sent. The record was honest about the request and blind to the result.',
    dataExample: {
      type: 'Timeline',
      fields: [
        { label: 'Tue 10:20', value: 'Head swap on PRN-CP1; service laptop re-flashes E: with v13' },
        { label: 'Tue 10:24', value: 'Case CS-2417-161 prints — grade A, EXP 06/2027, PASS' },
        { label: 'Tue 10:24–14:40', value: 'Cases 161–400 of the batch: 240 cases, pallets 4–9, all "clean" in the eBR' },
        { label: 'Wed', value: 'Review by exception: nothing to except → QP-2417 certified, FMD upload OK' },
        { label: 'Thu 14:10', value: 'Wholesaler inbound scan: (17) ≠ despatch advice → 6 pallets quarantined' },
      ],
    },
  },
  {
    step: 4,
    title: 'Containment',
    description:
      'Six pallets sit in the wholesaler\'s quarantine bay. Pallets 1–3 of the same batch shipped clean. The plant needs a scope — and a deviation — fast.',
    question: 'How do you scope and contain the damage?',
    options: [
      'Ship the pallets — the barcodes scan fine, the cartons are correct and the product is in date either way',
      'Recall every pallet of every batch packed since the head swap, to be safe',
      'Time-window the exposure via MES genealogy (head swap → detection), quarantine and relabel those cases under a deviation with content-verify ON, and have the QP re-review the packaging record before re-release',
      'Relabel only the six pallets the wholesaler caught and close the ticket',
    ],
    correct: 'Time-window the exposure via MES genealogy (head swap → detection), quarantine and relabel those cases under a deviation with content-verify ON, and have the QP re-review the packaging record before re-release',
    explanation:
      'The MES knows exactly which case serials PRN-CP1 labeled between the swap and the detection — CS-2417-161 to CS-2417-400 — that IS the exposure list, no guessing in either direction. Each case gets a fresh verified label; the deviation records the scope, the root cause and the CAPA; the QP re-reviews the packaging record because the certified record was wrong about its own labels. The carton UIs never lied, so the EU Hub needs nothing — but the wholesaler\'s hold is exactly what kept this a deviation instead of a market recall. "It scans fine" is how wrong data propagates.',
    dataExample: {
      type: 'Containment Checklist',
      fields: [
        { label: 'Exposure window', value: 'Tue 10:24 – 14:40, PRN-CP1 only (pallets 1–3 clean)' },
        { label: 'Affected cases', value: '240 serials CS-2417-161 … CS-2417-400 (6 pallets, 0 beyond the wholesaler)' },
        { label: 'Action', value: 'Deviation → hold → relabel with content-verify ON → QP re-review → release' },
        { label: 'EU Hub / EPCIS', value: 'Carton UIs correct — no correction; aggregation re-confirmed per relabeled case' },
      ],
    },
  },
  {
    step: 5,
    title: 'Prevention — which control catches it EARLIEST?',
    description:
      'The retro: three candidate controls, all worth having. The question is which one turns a 240-case deviation into a one-case blip.',
    question: 'Which control catches a stale template FIRST?',
    options: [
      'A revised head-swap SOP with a template re-flash step',
      'CRC readback + version pin on every template store and at order start',
      'Content verification at SCAN-CP1 — decode every label and compare GTIN, expiry, batch and serial against MES-expected values',
      'Quarterly template audits across all printers',
    ],
    correct: 'Content verification at SCAN-CP1 — decode every label and compare GTIN, expiry, batch and serial against MES-expected values',
    explanation:
      'The CRC handshake PREVENTS this specific path, and the SOP helps — but content verification catches EVERY content failure, whatever the cause: stale template, wrong data mapping, middleware bug, hand-typed override. It would have voided case CS-2417-161 seconds after the swap and opened the deviation on Tuesday, not Thursday. Defense in depth: CRC pinning to prevent, content-compare to catch, SOP to reinforce — the same layering as a PLC recipe download\'s readback verify.',
    dataExample: {
      type: 'Config Changes Raised (change control)',
      fields: [
        { label: 'SCAN-CP1', value: 'contentMatch = ON (compare (01)(17)(10)(21) vs MES)' },
        { label: 'Template store', value: 'CRC readback mandatory before pool-enable' },
        { label: 'Order start', value: 'file.crc32 check per pool printer, logged to the eBR' },
        { label: 'Maps to checklist', value: 'Items 1, 5 and 7 in the next section' },
      ],
    },
  },
];

export const INSIGHT_CARDS = [
  {
    title: 'Grade ≠ Content',
    text: 'The verifier graded honestly; nobody asked it the second question. Print quality and content truth are separate checks with separate configurations — an integration needs both, and the batch record needs the second one.',
  },
  {
    title: 'The Printer Is a Data Store',
    text: 'Flash survives everything, service laptops carry history, and recall-by-name trusts whatever answers. Manage printer-resident templates like the controlled documents they are — versioned, CRC-verified, change-controlled, audited.',
  },
];

export const COMPLETION = {
  checklist: ['Content verification configured at SCAN-CP1', 'Template CRC handshake enforced', 'Genealogy-scoped containment and QP re-review complete'],
  closing:
    '💡 A label is a claim about physical product — and in pharma, a regulated one. Printing it well is engineering; proving it tells the truth is integration — and the second part is what this workshop exists for.',
};
