import type { Challenge, TrueFalseQ, ConfigChecklistItem } from './types';

export const SUCCESS_FACTORS = [
  {
    title: 'Three Loops, Always',
    text: 'Print job down, printer status across, verify result back — an integration missing a loop loses labels silently',
    iconBgClass: 'bg-red-100',
    iconTextClass: 'text-red-600',
    icon: 'Zap',
  },
  {
    title: 'Templates Under Change Control',
    text: 'Versioned, CRC-verified, QA-approved, deployed from one library — never hand-copied to a printer again',
    iconBgClass: 'bg-orange-100',
    iconTextClass: 'text-orange-600',
    icon: 'Scale',
  },
  {
    title: 'Content Over Cosmetics',
    text: 'Decode-and-compare every label against MES-expected values — the only check that catches a beautiful lie about the expiry',
    iconBgClass: 'bg-leaf-100',
    iconTextClass: 'text-leaf-700',
    icon: 'GitBranch',
  },
];

// The team's actual ask: the eight configurations every MES ↔ labeling
// integration needs. Rendered as accordions in the Config & Close section.
export const CONFIG_CHECKLIST: ConfigChecklistItem[] = [
  {
    id: 'templates',
    title: '1 · Template versioning & ownership',
    what: 'Every label layout lives in one library with a version, a CRC, a QA approver and a change record. Printers hold verified copies; recalls are version-pinned; stores are CRC-readback-checked. Under Annex 11 the template is part of the validated system.',
    why: 'The Case Study: recall-by-name with no version pin let v13 masquerade as v14 for 240 cases and one certified batch record. Flash survives everything — manage it or it manages you.',
    plantExample: 'LBL-CASE-STD v14 (CRC 0x5C3E91A7) in the labelsvc librarian; SGD file.crc32 checked at every store and at every packaging-order start, logged to the eBR.',
  },
  {
    id: 'pools',
    title: '2 · Printer pool & failover',
    what: 'Define which printers are interchangeable, the failover order, and how the job response reports which engine actually printed. Keep the spare flashed with the SAME template versions.',
    why: 'A dead printer at case 31 of a pallet is a line stop unless the spare takes over in seconds — and an unmanaged spare is where stale templates hide.',
    plantExample: 'POOL-CASE = PRN-CP1 → PRN-CP1B; the middleware response carries printerUsed so odometers, label lots and audits reconcile.',
  },
  {
    id: 'mapping',
    title: '3 · Data mapping (MES field → label field)',
    what: 'A governed map from MES fields (order, SKU, batch, expiry, serial, GTIN) to template slots (^FN numbers) and barcode AIs — including date formats (2028-06 → (17)280630) — reviewed whenever the template or the message changes.',
    why: 'The playground\'s (17)→(11) exercise: one wrong AI and your expiry becomes their production date. Silently. Everything still scans, and no parser complains.',
    plantExample: 'ORDER→^FN1, BATCH+EXP→^FN2, barcode→^FN3 with (01)(17)(10)(21), human line→^FN4, QTY→^FN5 — one table, under change control.',
  },
  {
    id: 'serials',
    title: '4 · Serial & range allocation',
    what: 'Two authorities, explicitly configured: L4 serialization-provider ranges for carton UIs (allocated to HP2-SER, consumed, monitored for depletion, never invented), MES-generated sequences for bundle/case/SSCC under the company GS1 prefix (no gaps, no duplicates, survive restarts).',
    why: 'Running out of carton serials stops the line legally, not just technically; a duplicated SSCC is two pallets with one identity at the wholesaler.',
    plantExample: 'Carton serials (e.g. 4T7K9DQ2CX41) from the L4 provider via HP2-SER; BN-/CS-/SSCC serial-reference sequences under prefix 0359123 owned by the MES.',
  },
  {
    id: 'verify',
    title: '5 · Verify thresholds & reactions',
    what: 'Grade policy (pass ≥ C, warn < B), no-read handling, and — non-negotiable — content verification: decode every label and compare GTIN, expiry, batch and serial against the MES-expected values for that unit. A content mismatch is a hard fail AND a deviation.',
    why: 'Grade thresholds catch a dying printhead days early; content-compare catches the lying label on case #1 instead of case #240 — before the QP certifies a record that is wrong about its own labels.',
    plantExample: 'SCAN-CP1: pass ≥ 1.5, warn < 2.5, no-read → auto-void + reprint, contentMatch = ON for (01)(17)(10)(21).',
  },
  {
    id: 'reprint',
    title: '6 · Reprint/void policy & label reconciliation',
    what: 'The MES owns every void and reprint as a record; jobs carry idempotency keys; reconciliation continuously proves printed = applied + voided and one verify record per physical case. Under EU GMP the printed-label reconciliation (issued vs used vs destroyed) is a batch-record requirement, not a nice-to-have.',
    why: 'The Live Line\'s :133 incident: one hand reprint, two verify records, a label count that does not add up — the QP will not sign until reconciliation votes it out.',
    plantExample: 'jobId LBL-YYYYMMDD-#### on every request; event-driven reconciliation votes duplicates out within a tick; reconciliation totals land in the eBR per packaging order.',
  },
  {
    id: 'errors',
    title: '7 · Error handling & buffering',
    what: 'Status polling with dispatch gating (never feed a printer in error), alarms on the warnings (ribbon low, media low), and store-and-forward buffering for every event that feeds HP2-SER and the EU Hub.',
    why: 'The ribbon-out vs ribbon-low story: the same event is a non-issue or a line stop depending on whether anyone was listening. And a commissioning event lost in a network blip is a batch that cannot be released for sale later.',
    plantExample: 'SGD poll 10 s on POOL-CASE, PRN-PZ1 and PRN-BN3; EPCIS / EU Hub events buffered locally and replayed with original timestamps; release gate checks the upload ACK.',
  },
  {
    id: 'materials',
    title: '8 · Label stock & vignettes as lot-tracked materials',
    what: 'Labels, ribbon and vignettes are materials with lots, consumption records and line-side stock rules — exactly like carton blanks and leaflets. Consumption ties label lots to case serials; vignettes are reconciled every shift.',
    why: 'A bad label-stock lot (adhesive, coating) surfaces as a grade drift days later — genealogy from case serial back to label lot is how you scope it. A vignette count that does not reconcile is a fiscal report.',
    plantExample: 'LBL-CASE, LBL-PALLET, LBL-BUNDLE, RIB-WAX-RES — lotTracked, consumed at CP1/PZ1/BN3, linked per pallet; VIG-IT-CDX10 lotTracked and reconciled per shift on CDX-10-EXP runs.',
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'grade-drift',
    title: 'Grade Drift & Printhead Life',
    description:
      'Printheads wear in printed centimetres. The verifier grade slides from A toward C over days — and the first hard failure arrives mid-pallet on a Friday night',
    solution:
      'Trend the grade per printer, alarm at the warn threshold (< B), schedule head changes on the odometer through the maintenance system, and let the pool absorb the swap. The grade sparkline in the Live Line is this control chart.',
    impact: 'High',
    category: 'Hardware',
  },
  {
    id: 'dup-serials',
    title: 'Duplicate Serials from Retries',
    description:
      'Network blips, watched-folder re-submissions and operator hand-reprints all create the same defect: two labels claiming one identity — and a label reconciliation that will not close',
    solution:
      'Idempotent jobIds end-to-end, reprints only through the MES (voiding the original), and continuous reconciliation of printed vs applied vs verified counts. Fault 6220 should be a logged non-event, not a batch-record review finding.',
    impact: 'Critical',
    category: 'Integration',
  },
  {
    id: 'template-sprawl',
    title: 'Template Sprawl Across the Fleet',
    description:
      'Forty printers, three vendors, fifteen years of layouts — and nobody can say which template version printed any given case last month',
    solution:
      'One librarian (BarTender/NiceLabel), versions with CRCs, deployment as a handshake, per-job version recorded on the print record and in the eBR. An audit query, not an archaeology project — the inspector will ask.',
    impact: 'High',
    category: 'Governance',
  },
  {
    id: 'verifier-bypass',
    title: 'Verifier Bypass Culture',
    description:
      'The verifier faults, production is waiting, and someone bridges it "just for this shift". Every label since is unproven',
    solution:
      'Treat the verifier as a quality gate with the same discipline as a checkweigher: bypass requires QA authorization, is logged as a deviation, time-boxed, and triggers 100% retrospective inspection. The MES refuses verify-less cases for aggregation and release.',
    impact: 'Critical',
    category: 'Quality',
  },
  {
    id: 'hub-latency',
    title: 'EU Hub Latency vs Release',
    description:
      'The batch record is reviewed, the QP is ready to certify — and the FMD upload of the batch\'s carton UIs is still in the store-and-forward buffer because the WAN to the L4 gateway is down',
    solution:
      'Buffer-and-retry with original timestamps, a release gate that checks the EU Hub acknowledgement (not just event creation), and an explicit business rule for outage handling. A batch released before its UIs are in the Hub is verifiable by nobody at the pharmacy counter.',
    impact: 'High',
    category: 'Compliance',
  },
];

export const QUIZ_QUESTIONS: TrueFalseQ[] = [
  {
    id: 'q1',
    question: 'A grade-A label is always a correct label.',
    answer: false,
    explanation:
      'FALSE: ISO 15416 grades print quality — contrast, modulation, decodability. The Case Study\'s 240 wrong labels all graded A. Content correctness needs decode-and-compare against MES-expected values.',
  },
  {
    id: 'q2',
    question: 'A clean TCP close on port 9100 confirms the label was printed and applied.',
    answer: false,
    explanation:
      'FALSE: The raw port confirms bytes reached the printer\'s buffer — nothing more. Proof of printing comes from the status channel; proof of application and correctness comes from the verifier.',
  },
  {
    id: 'q3',
    question: 'The SSCC check digit is computed mod-10 with 3-1 alternating weights over the first 17 digits.',
    answer: true,
    explanation:
      'TRUE: Weight 3 on the rightmost payload digit, alternating leftward. For 00359123080012745: weight-3 sum 27 → 81, weight-1 sum 23, total 104 → check digit 6. The playground widget runs this arithmetic on anything you paste.',
  },
  {
    id: 'q4',
    question: 'If the allocated carton serial range runs low mid-shift, the MES should generate temporary carton serials under the company prefix until the L4 provider allocates more.',
    answer: false,
    explanation:
      'FALSE: Carton UIs come ONLY from the L4 serialization provider\'s allocated ranges — Delegated Regulation (EU) 2016/161 territory. The MES consumes ranges and monitors depletion; inventing carton serials is a compliance incident, not a workaround. (Bundle/case/SSCC ids are a different authority: those the MES does generate.)',
  },
  {
    id: 'q5',
    question: 'With store-and-forward buffering, a batch can be released for sale while its carton UIs are still queued for upload to the EU Hub.',
    answer: false,
    explanation:
      'FALSE: Buffering protects the DATA, not the release. A UI that is not in the Hub cannot be verified at dispense — the release gate must check the upload ACKNOWLEDGEMENT, not the event queue. The same logic applies to the QP certificate: no complete, correct record, no release.',
  },
];
