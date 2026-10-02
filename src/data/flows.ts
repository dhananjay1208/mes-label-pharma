import type { FlowQuiz, SignalRow } from './types';

// ---- (1) Print Job ↓ ----

export const JOB_EXPLAINER = {
  heading: 'Bytes In, Labels Out — Maybe',
  body: "The MES merges batch data into ZPL and streams it to PRN-CP1's raw port (tcp://prn-cp1.hp2.local:9100). No session, no schema, no acknowledgement — the socket accepts bytes whether the printer is ready, paused, or out of ribbon. Everything else in this section exists because of that sentence.",
};

export const JOB_DIAGRAM = [
  { label: 'MES', caption: 'merge batch data', color: 'bg-leaf-100 text-leaf-800' },
  { label: 'ZPL', caption: 'the job text', color: 'bg-blue-100 text-blue-800' },
  { label: '9100', caption: 'raw TCP socket', color: 'bg-amber-100 text-amber-800' },
  { label: 'PRN', caption: 'PRN-CP1 prints', color: 'bg-tobacco-100 text-tobacco-700' },
  { label: 'APP', caption: 'applicator tamps', color: 'bg-purple-100 text-purple-800' },
];

export const JOB_SIGNALS: SignalRow[] = [
  { tag: 'ORDER', address: '^FN1 / ^FD text', dataType: 'ZPL field', format: 'PO-77231', trigger: 'per case', description: 'Packaging-order context printed for humans and audits' },
  { tag: '(01) GTIN', address: 'barcode ^FD', dataType: 'AI, fixed 14', format: '20359123000317', trigger: 'per case', description: 'GTIN-14 of the case — indicator 2 + prefix 0359123 + item ref + check digit 7' },
  { tag: '(17) EXPIRY', address: 'barcode ^FD', dataType: 'AI, fixed 6', format: 'YYMMDD 280630', trigger: 'per case', description: 'Fixed length, no FNC1 after it — and the field a stale template lies about most', trap: true },
  { tag: '(10) BATCH', address: 'barcode ^FD', dataType: 'AI, variable', format: 'B-CX-2417', trigger: 'per case', description: 'Variable length — MUST be followed by FNC1 before the next AI', trap: true },
  { tag: '(21) SERIAL', address: 'barcode ^FD', dataType: 'AI, variable', format: 'CS-2417-31', trigger: 'per case', description: 'The MES-generated case serial — the aggregation scan reports the same id' },
  { tag: 'Transport', address: 'tcp://prn-cp1.hp2.local:9100', dataType: 'raw TCP', format: 'fire-and-forget', trigger: 'per job', description: 'TCP accept ≠ printed ≠ applied — there is NO application-level ack', trap: true },
  { tag: 'Retry', address: 'connection layer', dataType: 'policy', format: 'idempotent jobId', trigger: 'on failure', description: 'A naive retry after a blip queues the job twice → duplicate serial (fault 6220)', trap: true },
];

export const JOB_QUIZ: FlowQuiz = {
  question: 'The MES opened the socket, streamed the ZPL, and the connection closed cleanly. What has been proven about the case label?',
  options: [
    'It was printed and applied to the case',
    'It was printed, but application is unconfirmed',
    'Only that the printer buffered the bytes — nothing about printing or applying',
  ],
  correctIndex: 2,
  correctMsg: '✓ Correct! Port 9100 is a byte pipe. The printer may be paused, out of ribbon, or feeding a jammed web. Proof of printing comes from status; proof of application and correctness comes from the verifier — and only proven labels belong in the batch record\'s label reconciliation.',
  wrongMsg: '✗ Not quite. Raw port printing has no application-level acknowledgement at all — a clean TCP close proves only that bytes reached the printer\'s buffer. That is why the status and verify exchanges exist.',
};

// ---- (2) Printer Status ↑ ----

export const STATUS_EXPLAINER = {
  heading: 'Know Before You Send',
  body: 'The status back-channel (~HS host status, SGD getvars, SNMP) is how the MES knows a printer CAN print before feeding it jobs — and how a "ribbon low" warning becomes a reel change at the pallet break instead of a line stop at case 31. Poll every 10 seconds; alarm on warnings; stop dispatching to a printer in error.',
};

export const STATUS_DIAGRAM = [
  { label: 'PRN', caption: 'PRN-CP1', color: 'bg-tobacco-100 text-tobacco-700' },
  { label: '~HS', caption: '3 status strings', color: 'bg-amber-100 text-amber-800' },
  { label: 'SGD', caption: 'getvar / setvar', color: 'bg-blue-100 text-blue-800' },
  { label: 'SNMP', caption: 'Printer-MIB watchdog', color: 'bg-purple-100 text-purple-800' },
  { label: 'MES', caption: 'dispatch gate', color: 'bg-leaf-100 text-leaf-800' },
];

export const STATUS_SIGNALS: SignalRow[] = [
  { tag: 'device.status', address: 'SGD getvar', dataType: 'string', format: 'ready·paused·error', trigger: 'poll 10 s', description: 'The one-word dispatch gate — never send jobs to "error"' },
  { tag: 'media.status', address: 'SGD getvar', dataType: 'string', format: 'ok · out', trigger: 'poll 10 s', description: 'Label stock state — "out" is fault 6102 and stops the station' },
  { tag: 'ribbon.status', address: 'SGD getvar', dataType: 'string', format: 'ok · out', trigger: 'poll 10 s', description: 'Fault 6101 territory — the thermal-transfer mid-run killer' },
  { tag: 'head.latch', address: 'SGD getvar', dataType: 'string', format: 'ok · open', trigger: 'poll 10 s', description: 'Open after cleaning = every job errors until someone walks over' },
  { tag: 'ribbon out flag', address: '~HS string 2, field 8', dataType: 'flag', format: 'POSITIONAL', trigger: 'on ~HS', description: '~HS fields are positional in three comma strings — off-by-one parsers report the WRONG problem', trap: true },
  { tag: 'odometer.total_print_length', address: 'SGD getvar', dataType: 'number', format: 'cm', trigger: 'per shift', description: 'Printhead wear proxy — feeds the grade-drift story in the Live Line and the equipment logbook' },
];

export const STATUS_QUIZ: FlowQuiz = {
  question: 'Which signal lets the MES prevent label loss BEFORE it happens, rather than discover it afterwards?',
  options: [
    'The TCP error when a print job fails to connect',
    'The "ribbon low" SGD warning, polled every 10 seconds',
    'The verifier\'s no-read event',
  ],
  correctIndex: 1,
  correctMsg: '✓ Correct! The warning arrives while the printer still prints — a reel change gets scheduled at the next pallet break and nothing is lost. TCP errors and no-reads are both after-the-fact.',
  wrongMsg: '✗ Not quite. TCP errors and no-read events tell you about damage already done. Only the status warnings (ribbon low, media low) arrive while there is still time to act — that is the entire value of the back-channel.',
};

// ---- (3) Verify & Grade ↑ ----

export const VERIFY_EXPLAINER = {
  heading: 'The Loop-Closer',
  body: 'SCAN-CP1 reads every applied case label: decodes the GS1-128, grades the print (ISO/IEC 15416 — lowest parameter wins), and compares the decoded content against what the MES expected for THIS case. Plant 2 policy: pass ≥ C, warn below B, no-read or content mismatch → auto-void + reprint. The scanner reports; the MES owns the disposition — and under GMP a content mismatch is a deviation, not a warning.',
};

export const VERIFY_DIAGRAM = [
  { label: 'APP', caption: 'label applied', color: 'bg-purple-100 text-purple-800' },
  { label: 'SCAN', caption: 'SCAN-CP1 reads', color: 'bg-tobacco-100 text-tobacco-700' },
  { label: 'GRD', caption: 'ISO 15416 grade', color: 'bg-amber-100 text-amber-800' },
  { label: 'CMP', caption: 'content vs MES-expected', color: 'bg-blue-100 text-blue-800' },
  { label: 'MES', caption: 'pass / void+reprint', color: 'bg-leaf-100 text-leaf-800' },
];

export const VERIFY_SIGNALS: SignalRow[] = [
  { tag: 'decoded', address: 'verify event', dataType: 'element string', format: '(01)(17)(10)(21)', trigger: 'per label', description: 'What the wholesaler and every downstream system will believe — the truth to check' },
  { tag: 'grade.numeric', address: 'verify event', dataType: 'number', format: '0.0–4.0', trigger: 'per label', description: 'Lowest-parameter-wins print quality; policy pass ≥ 1.5 (C)' },
  { tag: 'grade vs content', address: '—', dataType: 'concept', format: 'INDEPENDENT', trigger: '—', description: 'A grade-A label can carry the WRONG expiry — grade proves print quality only', trap: true },
  { tag: 'contentMatch', address: 'verify event', dataType: 'boolean', format: 'true/false', trigger: 'per label', description: 'Decoded AIs compared to the MES-expected GTIN/expiry/batch/serial — catches the stale template on the FIRST case' },
  { tag: 'disposition', address: 'MES decision', dataType: 'enum', format: 'PASS·FAIL·NO-READ', trigger: 'per label', description: 'FAIL and NO-READ auto-void and reprint — reconciled, never hand-managed; content FAIL also opens a deviation' },
];

export const VERIFY_QUIZ: FlowQuiz = {
  question: 'A case label grades a perfect A — and decodes to expiry (17)270630 (June 2027) instead of the batch\'s 280630 (June 2028). What should happen?',
  options: [
    'Pass — the grade is the quality standard and it passed',
    'Hard fail: content mismatch overrides any grade; void, reprint, open a deviation and investigate the template',
    'Warn the operator and continue — the date is only a year off and the product is still in date',
  ],
  correctIndex: 1,
  correctMsg: '✓ Correct! Grade measures printing; content measures truth. A beautiful lie is still a lie — and in GMP a case label with the wrong expiry that reaches the market is a recall. A content mismatch usually means a template or data-mapping problem that will repeat on every following case until someone stops it.',
  wrongMsg: '✗ Not quite. The ISO grade only proves the barcode is well printed. Content verification against MES-expected values is a separate check — and it is the ONLY check that catches a stale template printing perfect wrong expiry dates. "Still in date" is irrelevant: the label is a regulated statement about the batch, and it is false.',
};

// ---- (4) Template Download ↓ ----

export const TEMPLATE_EXPLAINER = {
  heading: 'The Printer Is a Data Store — Manage It Like One',
  body: 'Stored formats (^DF) live on the printer\'s E: flash and survive power cycles, head swaps and service visits. Per-case jobs recall them by name (^XF) and send only variable data. That efficiency has a shadow: recall-by-name trusts whatever the flash holds. The fix is the same law as a PLC recipe download — version pinning and a CRC readback after every store. Under Annex 11 the template is part of the validated system; the flash copy is uncontrolled until the readback proves it.',
};

export const TEMPLATE_DIAGRAM = [
  { label: 'LIB', caption: 'template librarian v14', color: 'bg-blue-100 text-blue-800' },
  { label: '^DF', caption: 'store to E: flash', color: 'bg-amber-100 text-amber-800' },
  { label: 'CRC', caption: 'SGD readback verify', color: 'bg-purple-100 text-purple-800' },
  { label: '^XF', caption: 'recall + ^FN data', color: 'bg-tobacco-100 text-tobacco-700' },
  { label: 'LBL', caption: 'printed case label', color: 'bg-leaf-100 text-leaf-800' },
];

export const TEMPLATE_SIGNALS: SignalRow[] = [
  { tag: 'LBL-CASE-STD', address: 'E:LBLCASE.ZPL', dataType: 'stored format', format: 'v14', trigger: 'per rollout', description: 'The governed layout — v13 is last year\'s and still on any printer nobody re-flashed' },
  { tag: '^FN1…^FN5', address: 'template slots', dataType: 'numbered fields', format: 'ORDER/BATCH+EXP/SERIAL…', trigger: 'per case', description: 'The merge slots the per-case recall job fills' },
  { tag: 'file.crc32', address: 'SGD getvar', dataType: 'hex', format: '0x5C3E91A7', trigger: 'after store', description: 'Must equal the library CRC before the template is enabled for the pool' },
  { tag: 'E: persistence', address: 'printer flash', dataType: 'behaviour', format: 'survives everything', trigger: '—', description: 'Flash outlives power cycles and head swaps — a printer can carry v13 forever', trap: true },
];

export const TEMPLATE_QUIZ: FlowQuiz = {
  question: 'What makes recall-by-name (^XF E:LBLCASE.ZPL) safe in production?',
  options: [
    'Nothing extra — the printer always has the latest template',
    'A CRC readback after every store, and a version check before every packaging order',
    'Re-sending the full template with every single label job',
  ],
  correctIndex: 1,
  correctMsg: '✓ Correct! Verify the CRC when you store, check the version when you run — two lines of integration code. (Re-sending the full template every job works too, but costs bandwidth and still doesn\'t prove what the printer applied.)',
  wrongMsg: '✗ Not quite. "The printer probably has the right one" is exactly how the Case Study\'s 240 cases shipped with last year\'s expiry. Version pinning plus CRC readback makes v13 masquerading as v14 impossible.',
};

// ---- (5) Middleware ↕ ----

export const MIDDLEWARE_EXPLAINER = {
  heading: 'The Pattern Your Plant Probably Runs',
  body: 'Most real MES installations never speak ZPL themselves — they call label software (BarTender Integration Builder, NiceLabel Automation / Loftware) that owns the templates, merges the data, picks a printer from the pool, fails over to the spare, and answers with a real job status. The MES speaks fields; the middleware speaks printer. The price: one more GxP system to validate and govern, and one clear question — who owns the template?',
};

export const MIDDLEWARE_DIAGRAM = [
  { label: 'MES', caption: 'HTTP POST fields', color: 'bg-leaf-100 text-leaf-800' },
  { label: 'INT', caption: 'BarTender Integration', color: 'bg-blue-100 text-blue-800' },
  { label: 'LIB', caption: '.btw templates v14', color: 'bg-purple-100 text-purple-800' },
  { label: 'POOL', caption: 'POOL-CASE + failover', color: 'bg-amber-100 text-amber-800' },
  { label: 'PRN', caption: 'PRN-CP1 / CP1B', color: 'bg-tobacco-100 text-tobacco-700' },
];

export const MIDDLEWARE_SIGNALS: SignalRow[] = [
  { tag: 'jobId', address: 'HTTP body', dataType: 'string', format: 'LBL-YYYYMMDD-####', trigger: 'per job', description: 'The idempotency key — retries with the same jobId must not print twice', trap: true },
  { tag: 'template + version', address: 'HTTP body', dataType: 'reference', format: 'LBL-CASE-STD v14', trigger: 'per job', description: 'The MES pins the version it expects — a mismatch is a refusal, not a silent substitution' },
  { tag: 'data{}', address: 'HTTP body', dataType: 'named fields', format: 'ORDER/BATCH/EXPIRY/SERIAL/GTIN', trigger: 'per job', description: 'The MES never builds ZPL — the template binds the fields' },
  { tag: 'printerPool', address: 'HTTP body', dataType: 'reference', format: 'POOL-CASE', trigger: 'per job', description: 'Middleware picks PRN-CP1, fails over to PRN-CP1B — and reports which one printed' },
  { tag: 'file drop', address: '\\\\labelsvc\\drops\\', dataType: 'legacy trigger', format: 'CSV/XML', trigger: 'watched folder', description: 'The 20-year-old pattern still running half the world\'s labels — retries re-submit files, so idempotency matters twice', trap: true },
];

export const MIDDLEWARE_QUIZ: FlowQuiz = {
  question: 'Where should the case-label template live so that a printer swap can never resurrect an old layout?',
  options: [
    'On each printer\'s flash — that is what E: storage is for',
    'In the label-management system\'s library, under change control, versioned and deployed with a CRC handshake',
    'In the MES database as a ZPL string column',
  ],
  correctIndex: 1,
  correctMsg: '✓ Correct! The library is the single source of truth; printers hold verified COPIES. A swapped printer gets the current version pushed and CRC-checked before it may join the pool — hand-copying is how v13 comes back from the dead.',
  wrongMsg: '✗ Not quite. Printer flash is a cache, not a source of truth — and a ZPL column in the MES marries your MES to one printer language. The label librarian owns templates; everything else holds verified copies.',
};
