import type { MessageData, MessageType } from './types';

// The five MES ↔ labeling exchanges demonstrated in the workshop.
// Values are simplified-but-realistic; device IDs, GS1 values and templates
// match the labeling canon in world.ts (SSCC 003591230800127456, case GTIN
// 20359123000317, batch B-CX-2417, expiry 2028-06 → (17)280630, case
// CS-2417-31, template LBL-CASE-STD v14).
export const MESSAGES: Record<MessageType, MessageData> = {
  'print-job': {
    title: 'Case Label Print Job (MES → PRN-CP1, raw ZPL over TCP 9100) ↓',
    description: 'The workhorse write path: the MES merges batch data into ZPL and streams it to the print engine\'s raw port',
    signalTabLabel: 'Field / AI Table',
    payloadTabLabel: 'ZPL Payload',
    signalTable: {
      type: 'Raw TCP print job',
      description: 'One case, one job — opened, streamed and closed against tcp://prn-cp1.hp2.local:9100',
      segments: {
        jobHeader: [
          { field: 'Order', value: 'PO-77231', description: 'The packaging order this case belongs to — every label field traces back here and into the batch record' },
          { field: 'SKU', value: 'CDX-10', description: 'Cardexil 10 mg film-coated tablets, domestic market' },
          { field: 'Template', value: 'LBL-CASE-STD v14', description: 'The layout this job was merged into — version recorded on the print-job record (GMP change-controlled document)' },
          { field: 'Printer', value: 'PRN-CP1 (pool POOL-CASE)', description: 'Selected by the MES/middleware; PRN-CP1B is the hot spare' },
        ],
        variableData: [
          { field: '(01) GTIN', value: '20359123000317', description: 'GTIN-14 of the case: indicator 2 + prefix 0359123 + item ref 00031 + check digit 7' },
          { field: '(17) Expiry', value: '280630', description: 'YYMMDD — 2028-06 expressed as the last day of the month. Fixed 6 digits, so no FNC1 needed after it' },
          { field: '(10) Batch', value: 'B-CX-2417', description: 'Variable length — needs an FNC1 separator before the next AI' },
          { field: '(21) Serial', value: 'CS-2417-31', description: 'The case serial the MES generated — the same CS- id the aggregation scan will report' },
          { field: 'Qty text', value: '20 BUNDLES - 200 CARTONS - 4,000 TABLETS', description: 'Human-readable content — 20 bundles = 200 cartons = 4,000 tablets' },
        ],
        transport: [
          { field: 'Endpoint', value: 'tcp://prn-cp1.hp2.local:9100', description: 'Zebra raw port — bytes in, labels out. No session, no login, no schema' },
          { field: 'Acknowledgement', value: 'NONE', description: 'TRAP: TCP accepting the bytes proves NOTHING — not printed, not applied. That is why the verify-result exchange exists' },
          { field: 'Retry behaviour', value: 'connection retry', description: 'TRAP: a network blip + naive retry queues the SAME job twice → two labels, one case, duplicate serial (fault 6220). Jobs need idempotency' },
        ],
      },
    },
    payload: `^XA
^CI28^PW1218^LL812
^FO40,40^GB1138,120,3^FS
^FO60,60^A0N,36,36^FDHELVION PHARMA - PLANT 2 LAKEWORTH^FS
^FO60,106^A0N,28,28^FDCARDEXIL 10 MG FILM-COATED TABLETS - 20 BUNDLES^FS
^FO60,200^A0N,28,28^FDORDER: PO-77231   SKU: CDX-10^FS
^FO60,240^A0N,28,28^FDBATCH: B-CX-2417   EXP: 06/2028   CASE: CS-2417-31^FS
^BY2,3,160
^FO60,300^BCN,160,Y,N,N^FD>;>801203591230003171728063010>6B-CX-2417>821CS-2417-31^FS
^FO60,530^A0N,24,24^FD(01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31^FS
^FO40,590^GB1138,2,2^FS
^FO60,620^A0N,24,24^FD20 BUNDLES - 200 CARTONS - 4,000 TABLETS^FS
^FO60,660^A0N,24,24^FDSTATUS: QUARANTINE UNTIL QP RELEASE^FS
^XZ

// ZPL escapes inside the ^FD barcode data:
//   >;  switch to subset C (digit pairs)     >8  FNC1 (GS1 mode / separator)
//   >6  switch to subset B (letters, "B-CX-")
// (01) and (17) are fixed-length, so they run straight into each other; (10)
// is variable, so the >8 after the batch is what tells a scanner where the
// batch ends and the (21) serial begins. The trailing text line is the
// human-readable interpretation — a warehouse worker with a dead scanner
// still needs to read the expiry.`,
    payloadCaption: 'A complete case label as it crosses the wire (6×4" landscape) — try this exact ZPL in the Playground section',
    note: {
      heading: 'Fire-and-Forget Is the Original Sin',
      body: 'Port 9100 confirms only that a socket accepted bytes. The printer may be paused, out of ribbon, or printing onto a jammed web — the MES\'s job record says "sent" either way. Every reliable labeling integration adds two more loops: printer status (know the device can print BEFORE sending) and verify results (know the label was applied and correct AFTER). Under GMP that second loop is not optional: the label reconciliation in the batch record has to be built from what was proven, not from what was sent.',
    },
  },

  'printer-status': {
    title: 'Printer Health (~HS + SGD, PRN-CP1 → MES) ↑',
    description: 'The status back-channel: host status, settable-get-do variables and SNMP — how the MES knows the printer can actually print',
    signalTabLabel: 'Status Field Table',
    payloadTabLabel: 'Status Payloads',
    signalTable: {
      type: 'Polled status (10 s) + on-alarm events',
      description: 'Same host as the print path — ~HS and SGD ride the 9100 socket; SNMP watches from the network side',
      segments: {
        hostStatusHS: [
          { field: 'paper out', value: '0', description: 'String 1, field 2 — labels present (fault 6102 when it flips to 1)' },
          { field: 'pause', value: '0', description: 'String 1, field 3 — someone pressed PAUSE and your jobs queue silently' },
          { field: 'buffer full', value: '0', description: 'String 1, field 5 — jobs arriving faster than printing' },
          { field: 'ribbon out', value: '0', description: 'String 2, field 8 — THE mid-run killer for thermal transfer (fault 6101)' },
          { field: 'labels remaining', value: '—', description: 'String 3 — batch progress on stored-batch jobs' },
          { field: 'Field positions', value: 'POSITIONAL', description: 'TRAP: ~HS replies are three comma-separated strings with POSITIONAL fields. An off-by-one parser reads "paused" where "ribbon out" should be — and your MES reports the wrong problem all shift' },
        ],
        sgdVariables: [
          { field: 'device.status', value: '"ready"', description: 'The one-word summary: ready · paused · error' },
          { field: 'media.status', value: '"ok"', description: '"out" = labels gone; the warning fires BEFORE the fault stops the line' },
          { field: 'ribbon.status', value: '"ok"', description: 'Ribbon state — pair with a labels-remaining odometer for proactive reels' },
          { field: 'head.latch', value: '"ok"', description: '"open" after a cleaning that nobody closed properly' },
          { field: 'odometer.total_print_length', value: '48,211 cm', description: 'Wear proxy — printhead life is measured in printed centimetres; feeds the equipment logbook' },
        ],
        snmp: [
          { field: 'OID .1.3.6.1.2.1.25.3.5.1.1', value: '2 (idle)', description: 'Standard Printer-MIB device status — works across vendors' },
          { field: 'Poll', value: '10 s', description: 'Network-side watchdog independent of the print path' },
        ],
      },
    },
    payload: `# MES sends (on the 9100 socket):
~HS

# PRN-CP1 replies — three strings, POSITIONAL fields:
014,0,0,0645,000,0,0,0,000,0,0,0
000,0,0,0,0,2,4,0,00000000,1,000
1234,0

# Decoded (the fields that matter to an MES):
#   string 1, f2  paper out        = 0   OK
#   string 1, f3  pause            = 0   not paused
#   string 1, f5  buffer full      = 0   keeping up
#   string 2, f8  ribbon out       = 0   OK
#   string 3, f1  labels remaining = 1234 (stored batch)

# SGD query/reply on the same socket:
! U1 getvar "media.status"
"ok"
! U1 getvar "ribbon.status"
"ok"`,
    payloadCaption: 'A ~HS host-status exchange plus two SGD getvars — the MES\'s eyes on the print engine',
    note: {
      heading: 'Status Is How You Front-Run the Fault',
      body: 'Ribbon-out at case 31 of a 48-case pallet means a line stop, a queue at the applicator, and a supervisor asking why. The same event as a "ribbon low" SGD warning ten minutes earlier means a reel change at the next pallet break and nobody notices. Poll status every 10 seconds, alarm on the warnings, and stop feeding jobs to a printer that cannot print — the Live Label Line section shows both versions of this story.',
    },
  },

  'verify-result': {
    title: 'Verify & Grade (SCAN-CP1 → MES) ↑',
    description: 'The loop-closer: every applied label is read back, graded, content-checked — and the MES decides pass, void or reprint',
    signalTabLabel: 'Verify Field Table',
    payloadTabLabel: 'Verify Event',
    signalTable: {
      type: 'Event per label (published on apply)',
      description: 'SCAN-CP1 reads the case label as the case leaves the applicator; one event per read reaches the MES and becomes a batch-record entry',
      segments: {
        readResult: [
          { field: 'Symbology', value: 'GS1-128', description: 'What the scanner actually saw — a Code 128 with FNC1 in GS1 mode' },
          { field: 'Decoded data', value: '(01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31', description: 'The element string as decoded — this is what the wholesaler and every downstream system will believe' },
          { field: 'Case serial', value: 'CS-2417-31', description: 'Extracted AI (21) — joins the verify event to the MES case record' },
        ],
        grading: [
          { field: 'Overall grade', value: '2.9 (B)', description: 'ISO/IEC 15416: lowest parameter wins. Plant 2 policy: pass ≥ C (1.5), warn < B (2.5)' },
          { field: 'Symbol contrast', value: '3.1', description: 'Ink vs substrate — drops with ribbon wrinkle or low darkness' },
          { field: 'Modulation', value: '2.9', description: 'Local contrast consistency' },
          { field: 'Decodability', value: '3.4', description: 'Bar-width accuracy — the first casualty of a worn printhead' },
          { field: 'Grade vs content', value: 'INDEPENDENT', description: 'TRAP: the grade proves PRINT QUALITY only. A stale template prints a grade-A label with WRONG expiry — content must be verified separately' },
        ],
        disposition: [
          { field: 'contentMatch', value: 'true', description: 'Decoded AIs compared against MES-expected values for THIS case (GTIN, expiry, batch, serial) — the check the grade cannot do' },
          { field: 'disposition', value: 'PASS', description: 'PASS · FAIL (< C or content mismatch) · NO-READ' },
          { field: 'On FAIL / NO-READ', value: 'auto-void + reprint', description: 'The MES voids the label record, issues a reprint, and reconciles the count — the operator never decides this at the line. A content FAIL additionally opens a deviation' },
        ],
      },
    },
    payload: `// Verify event as received by the MES (one per applied label)
{
  "device": "SCAN-CP1",
  "event": "LABEL_VERIFY",
  "caseSerial": "CS-2417-31",
  "orderId": "PO-77231",
  "batch": "B-CX-2417",
  "symbology": "GS1-128",
  "decoded": "(01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31",
  "grade": { "numeric": 2.9, "letter": "B" },
  "parameters": {
    "symbolContrast": 3.1,
    "modulation": 2.9,
    "decodability": 3.4,
    "defects": 3.6
  },
  "contentMatch": true,
  "disposition": "PASS",
  "sourceTimestamp": "2026-09-22T09:14:31.480Z"
}`,
    payloadCaption: 'One label, fully judged: what it said, how well it was printed, and whether it told the truth',
    note: {
      heading: 'The MES Owns the Disposition',
      body: 'The scanner reports; the MES decides. Centralising the void/reprint policy in the MES means every void is a record, every reprint is reconciled, and no line operator ever "just prints another one" outside the system — which is exactly how duplicate serials and label reconciliations that do not add up happen. Grade thresholds catch a dying printhead days early; content verification catches a lying label on the FIRST case — and in GMP a wrong expiry that ships is a recall, so that first case is the whole game.',
    },
  },

  'template-download': {
    title: 'Template Store & Version Handshake (Label Management → PRN-CP1) ↓',
    description: 'How a layout becomes printer-resident — and how version pinning plus CRC readback keeps v13 from masquerading as v14',
    signalTabLabel: 'Handshake Table',
    payloadTabLabel: 'ZPL Store + Recall',
    signalTable: {
      type: 'Stored format (^DF) + verified recall (^XF)',
      description: 'The template travels once; per-case jobs then send only the variable data — faster, and versionable',
      segments: {
        store: [
          { field: '^DF target', value: 'E:LBLCASE.ZPL', description: 'Stored on the printer\'s E: flash — survives power cycles' },
          { field: 'Template', value: 'LBL-CASE-STD', description: 'The library identity of this layout — a GMP-controlled document with an approved change record' },
          { field: 'Version', value: 'v14', description: 'Current release; v13 is last year\'s — and still on any printer nobody re-flashed' },
          { field: 'Numbered fields', value: '^FN1…^FN5', description: 'ORDER+SKU, BATCH+EXP+CASE, BARCODE, HUMAN LINE, QTY — the merge slots the recall job fills' },
        ],
        versionControl: [
          { field: 'CRC32 (library)', value: '0x5C3E91A7', description: 'Recorded per version in the label-management system' },
          { field: 'CRC32 (printer)', value: 'SGD file.crc32 readback', description: 'Read back AFTER download — must equal the library value before the template is enabled' },
          { field: 'Flash persistence', value: 'SURVIVES EVERYTHING', description: 'TRAP: E: flash survives power cycles, head swaps and service visits. A printer can carry v13 forever — and recall-by-name will happily use it' },
        ],
        recallAtPrintTime: [
          { field: '^XF', value: 'E:LBLCASE.ZPL', description: 'The per-case job recalls the stored format by name' },
          { field: '^FN + ^FD', value: 'variable data only', description: 'The job carries just the merge fields — bytes drop ~80%, and the layout cannot drift per job' },
        ],
      },
    },
    payload: `# 1) Store the template (sent once per approved version rollout):
^XA
^DFE:LBLCASE.ZPL^FS
^CI28^PW1218^LL812
^FO40,40^GB1138,120,3^FS
^FO60,60^A0N,36,36^FDHELVION PHARMA - PLANT 2 LAKEWORTH^FS
^FO60,200^A0N,28,28^FN1^FS      // ORDER + SKU line
^FO60,240^A0N,28,28^FN2^FS      // BATCH + EXP + CASE line
^BY2,3,160
^FO60,300^BCN,160,Y,N,N^FN3^FS  // GS1-128 data
^FO60,530^A0N,24,24^FN4^FS      // human-readable line
^FO60,620^A0N,24,24^FN5^FS      // quantity line
^XZ

# 2) Verify what actually landed (SGD readback):
! U1 getvar "file.crc32" "E:LBLCASE.ZPL"
"5C3E91A7"        → matches library v14 → template ENABLED for POOL-CASE

# 3) Per-case recall job (what now crosses the wire each case):
^XA
^XFE:LBLCASE.ZPL^FS
^FN1^FDORDER: PO-77231   SKU: CDX-10^FS
^FN2^FDBATCH: B-CX-2417   EXP: 06/2028   CASE: CS-2417-31^FS
^FN3^FD>;>801203591230003171728063010>6B-CX-2417>821CS-2417-31^FS
^FN4^FD(01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31^FS
^FN5^FD20 BUNDLES - 200 CARTONS - 4,000 TABLETS^FS
^XZ`,
    payloadCaption: 'Store once, verify the CRC, then recall by name with variable data — the same readback-verify law as a PLC recipe download',
    note: {
      heading: 'A Template Accepted Is Not a Template Applied',
      body: 'This is the recipe-download lesson one level up: never trust that what you sent is what the device holds. The CRC readback after every store, and a version check before every packaging order, are two lines of integration code — and the entire difference between this exchange and the Case Study section\'s 240 cases of grade-A lies about the expiry date. Under Annex 11 the template is part of the validated system: the printer\'s flash is an uncontrolled copy until the readback proves otherwise.',
    },
  },

  'middleware-trigger': {
    title: 'Middleware Print Request (ForgeMES → BarTender Integration Builder) ↕',
    description: 'The pattern most real plants run: the MES asks the label software to merge and print — and gets a job status back',
    signalTabLabel: 'Request / Response Table',
    payloadTabLabel: 'HTTP Exchange',
    signalTable: {
      type: 'HTTP POST + JSON response (file-drop as the legacy alternative)',
      description: 'labelsvc.hp2.local runs BarTender Integration Builder: it owns templates, merges data, picks printers, reports back — and, as a GxP system, keeps the audit trail of who changed what',
      segments: {
        trigger: [
          { field: 'Endpoint', value: 'http://labelsvc.hp2.local:8080/Integration/CaseLabel', description: 'One integration per label type — bundle, case, pallet, rework' },
          { field: 'Alternative', value: '\\\\labelsvc\\drops\\ watched folder', description: 'The 20-year-old pattern that still runs half the world\'s labels: MES writes a CSV/XML file, middleware picks it up' },
          { field: 'Idempotency', value: 'jobId required', description: 'TRAP: watched-folder retries re-submit the same file after a timeout — without a client jobId the middleware prints it twice. Fault 6220 starts here as often as at the printer' },
        ],
        merge: [
          { field: 'Template', value: 'LBL-CASE-STD.btw v14', description: 'The .btw lives in the middleware\'s librarian — versioned, QA-approved, audited (Annex 11 / Part 11)' },
          { field: 'Data record', value: 'order/sku/batch/expiry/serial/gtin', description: 'The MES sends named fields; the template binds them — no ZPL knowledge needed in the MES' },
          { field: 'Printer selection', value: 'POOL-CASE', description: 'Middleware picks PRN-CP1; on error/failover it reroutes to PRN-CP1B and SAYS SO in the response' },
        ],
        response: [
          { field: 'jobId', value: 'LBL-20260922-0912-031', description: 'The handle both sides log — status, reprint and audit all key on it' },
          { field: 'status', value: 'PRINTED', description: 'QUEUED · PRINTED · FAILED (with reason) — richer than anything port 9100 will ever tell you' },
          { field: 'printerUsed', value: 'PRN-CP1', description: 'Which pool member actually printed — matters when reconciling engine odometers and label lots' },
        ],
      },
    },
    payload: `POST /Integration/CaseLabel HTTP/1.1
Host: labelsvc.hp2.local:8080
Content-Type: application/json

{
  "jobId": "LBL-20260922-0912-031",
  "template": "LBL-CASE-STD",
  "templateVersion": 14,
  "printerPool": "POOL-CASE",
  "data": {
    "ORDER": "PO-77231",
    "SKU": "CDX-10",
    "BATCH": "B-CX-2417",
    "EXPIRY": "280630",
    "EXPIRY_TEXT": "06/2028",
    "SERIAL": "CS-2417-31",
    "GTIN": "20359123000317",
    "QTY_TEXT": "20 BUNDLES - 200 CARTONS - 4,000 TABLETS"
  }
}

HTTP/1.1 200 OK
Content-Type: application/json

{
  "jobId": "LBL-20260922-0912-031",
  "status": "PRINTED",
  "printerUsed": "PRN-CP1",
  "templateVersion": 14,
  "timestamp": "2026-09-22T09:12:31.882Z"
}`,
    payloadCaption: 'The MES speaks fields, the middleware speaks ZPL — and the response is a real acknowledgement at last',
    note: {
      heading: 'Who Owns the Template?',
      body: 'The moment middleware enters, the template stops being the printer\'s problem and becomes a governed asset: designed in BarTender or NiceLabel Designer, approved through change control, versioned, deployed by the librarian — never hand-copied to a printer again. In a GMP plant that governance question ("who may change a label layout, who approves it, and how does a change reach forty validated printers?") is a quality-system question before it is a technical one — and it is the first question to settle in your own plant\'s integration.',
    },
  },
};
