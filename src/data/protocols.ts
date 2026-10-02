// "How It Works" deep-dive content (Tools & Technology section).
// Three technology stacks explained mechanically: architecture, a typical
// flow step by step, key concepts, strengths/limits, and Plant 2 usage.

export interface ProtocolConcept {
  term: string;
  text: string;
}

export interface ProtocolDeepDive {
  id: 'zpl' | 'gs1' | 'middleware';
  name: string;
  tagline: string;
  intro: string;
  archBoxes: { label: string; caption: string; color: string }[]; // literal Tailwind classes
  howTitle: string;
  steps: string[];
  concepts: ProtocolConcept[];
  strengths: string[];
  limits: string[];
  plant: string; // where it runs at Plant 2
}

export const PROTOCOL_DEEP_DIVES: ProtocolDeepDive[] = [
  {
    id: 'zpl',
    name: 'ZPL & the Direct Print Path',
    tagline: 'A text language for labels, streamed to a raw socket since the 1980s',
    intro:
      'ZPL (Zebra Programming Language) describes a label as plain text: ^XA starts a format, ^FO positions the cursor in printer DOTS, ^FD carries data, ^BC draws a Code 128, ^XZ prints. The MES (or its middleware) streams that text to TCP port 9100 — the "raw port" — and the printer renders it. SATO\'s SBPL, Honeywell\'s DPL and others are dialects of the same idea. The alternative is a Windows printer driver, which turns your label into an opaque image: it prints, but you can no longer diff it, version it, or prove what was in the barcode — and an inspector will ask.',
    archBoxes: [
      { label: 'MES', caption: 'job builder', color: 'bg-leaf-100 text-leaf-800' },
      { label: 'ZPL', caption: 'text format', color: 'bg-blue-100 text-blue-800' },
      { label: '9100', caption: 'raw TCP', color: 'bg-amber-100 text-amber-800' },
      { label: 'PRN', caption: 'render + print', color: 'bg-tobacco-100 text-tobacco-700' },
      { label: 'SGD', caption: 'status back-channel', color: 'bg-purple-100 text-purple-800' },
    ],
    howTitle: 'How one case label happens (MES → PRN-CP1)',
    steps: [
      'The MES merges batch data (PO-77231, batch B-CX-2417, expiry 280630, serial CS-2417-31) into the ZPL — either into a full format or into ^FN slots of a stored template.',
      'It opens tcp://prn-cp1.hp2.local:9100 and streams the text. The socket accepts bytes; nothing more is promised.',
      'The printer parses ^XA…^XZ, renders the label at its native dpi — the SAME ZPL prints two-thirds size on the 300 dpi ZE511 vs a 203 dpi head, because ^FO coordinates are dots, not millimetres.',
      'The applicator tamps the label onto the case; SCAN-CP1 reads it back (that loop is the verify-result exchange).',
      'In parallel, the MES polls ~HS / SGD status every 10 s — pause, ribbon out, head open — and stops dispatching to a printer that cannot print.',
      'Alternatives on the wire: LPR/LPD (port 515) and IPP where raw 9100 is blocked; a Windows driver via the spooler when someone insists — at the cost of losing the diffable text.',
    ],
    concepts: [
      { term: '^XA … ^XZ envelope', text: 'Everything between them is one label format; multiple formats can be streamed back-to-back on one socket' },
      { term: 'Dots & dpi', text: '^FO60,300 means 60 dots right, 300 down. 203 dpi ≈ 8 dots/mm, 300 dpi ≈ 12 — layouts are per-resolution, which is why template libraries track the target printer model' },
      { term: 'Stored formats ^DF / ^XF', text: 'Store the layout once on the printer, recall by name with only variable data — 80% less traffic, plus the versioning question the template-download exchange answers' },
      { term: 'Drivers vs direct', text: 'A driver rasterises on the PC and hides the content; direct ZPL is deterministic, version-controllable text. Serialized and GMP labeling almost always goes direct (or via middleware that goes direct)' },
    ],
    strengths: [
      'Plain text — diffable, loggable, auditable down to the barcode data',
      'Universally supported by industrial print engines and print-&-apply units',
      'Stored formats make per-label jobs tiny and layouts governable',
    ],
    limits: [
      'No application-level acknowledgement on the raw port — status and verify loops are mandatory',
      'Dialect per vendor (ZPL/SBPL/DPL) — middleware earns its keep translating',
      'Coordinates in dots make templates resolution-specific',
    ],
    plant:
      'PRN-CP1/PRN-CP1B (Zebra ZE511 print engines, 300 dpi) label every case; PRN-PZ1 (ZT411, 203 dpi) prints pallet SSCCs; PRN-BN3 (ZD621, 203 dpi) prints bundle labels. All four listen on port 9100 and answer SGD on the same socket.',
  },
  {
    id: 'gs1',
    name: 'GS1 for Labeling',
    tagline: 'The identifier system that lets a case label mean the same thing everywhere',
    intro:
      'GS1 is why a scanner in your quarantine warehouse, your wholesaler and a hospital pharmacy all read the same case label the same way. Application Identifiers (AIs) prefix every data element — (01) GTIN, (17) expiry, (10) batch, (21) serial, (00) SSCC — and the FNC1 character marks where variable-length values end. The same element string can ride different carriers: GS1-128 (a Code 128 in GS1 mode) on cases and pallets, and GS1 DataMatrix on the carton — the 2D symbology the FMD mandates for the unique identifier, printed on the carton by the serialization station rather than on a label.',
    archBoxes: [
      { label: 'GTIN', caption: 'what the item IS', color: 'bg-leaf-100 text-leaf-800' },
      { label: 'AI', caption: '(01)(17)(10)(21)(00)…', color: 'bg-blue-100 text-blue-800' },
      { label: '128', caption: 'GS1-128 carrier', color: 'bg-amber-100 text-amber-800' },
      { label: 'SSCC', caption: 'the pallet license plate', color: 'bg-tobacco-100 text-tobacco-700' },
      { label: 'HUB', caption: 'EU Hub verifies the UI', color: 'bg-purple-100 text-purple-800' },
    ],
    howTitle: 'Decoding the Plant 2 pallet SSCC, digit by digit',
    steps: [
      'The label says (00)003591230800127456 — AI (00) announces "an SSCC follows", always exactly 18 digits.',
      'Digit 1 is the EXTENSION digit (0) — a free digit the allocator uses to multiply its serial capacity.',
      'Digits 2–8 are Helvion\'s GS1 COMPANY PREFIX: 0359123. Every code the plant issues under GS1 carries it — the carton GTIN 00359123000108, the case GTIN 20359123000317, this SSCC — that is what makes the codes globally unique.',
      'Digits 9–17 are the SERIAL REFERENCE: 080012745 — assigned by the MES when the 48th case closes the pallet. The MES owns this sequence; running it without gaps or duplicates is an MES configuration.',
      'Digit 18 is the CHECK DIGIT: weight the 17 payload digits 3-1-3-1… from the right. The weight-3 digits sum to 27 (→ 81), the weight-1 digits to 23; 81 + 23 = 104, and the check is what lifts the sum to the next multiple of ten: 6. A scanner computes the same arithmetic on every read.',
      'Compare the carton: its UI is a GS1 DataMatrix carrying (01)00359123000108 (21)4T7K9DQ2CX41 (10)B-CX-2417 (17)280630 — same AI grammar, different carrier, different serial authority (the L4 provider, not the MES).',
    ],
    concepts: [
      { term: 'Application Identifier + FNC1', text: '(01) is fixed 14 digits and (17) fixed 6, so they run straight on; (10) batch is variable, so FNC1 must terminate it. Drop that FNC1 and the scanner reads batch+serial as one blob' },
      { term: 'GTIN-14 & the indicator digit', text: 'The case GTIN 20359123000317 starts with indicator 2 = a packaging level of the same product; the carton GTIN 00359123000108 has indicator 0. Same prefix, same check-digit arithmetic as the SSCC' },
      { term: 'Symbology choice', text: 'GS1-128 for linear scanning on cases/pallets; GS1 DataMatrix for the carton UI (mandated by DR (EU) 2016/161) and wherever space is tight — the data model stays identical across both' },
      { term: 'Serial authority', text: 'Carton serials come ONLY from the L4 serialization provider\'s allocated ranges (the MES consumes them via HP2-SER). Bundle/case/SSCC ids are MES-generated under the company prefix. Two different authorities, one label stack' },
    ],
    strengths: [
      'One identifier grammar from carton to pallet to pharmacy',
      'Check digits and FNC1 structure make many data errors machine-detectable',
      'Carrier-independent: the same element string rides GS1-128 or GS1 DataMatrix',
    ],
    limits: [
      'Fixed vs variable length rules must be encoded correctly — tools help, understanding prevents',
      'The AI table is large; a wrong AI is still a syntactically valid label (see the playground\'s (17)→(11) exercise — a date is a date to every parser)',
      'GS1 says nothing about print quality or content truth — that is the verifier\'s job',
    ],
    plant:
      'Cases carry (01)20359123000317 (17)280630 (10)B-CX-2417 (21)CS-####; pallets carry (00)SSCC-18 (02)GTIN (37)48 (10)batch. Carton UIs are GS1 DataMatrix from the L4 provider\'s ranges — a different authority by law.',
  },
  {
    id: 'middleware',
    name: 'Label Software & Middleware',
    tagline: 'BarTender, NiceLabel, Loftware — the governed layer between MES fields and printer dialects',
    intro:
      'Label software began as designers (draw the label, bind named fields) and grew into integration platforms: BarTender\'s Integration Builder and NiceLabel\'s Automation watch for triggers — an HTTP call, a dropped file, a database row — merge the data into an approved template, pick a printer from a pool, and answer with a job status. For the MES this collapses "speak four printer dialects and manage forty flash memories" into "POST these fields to labelsvc". The trade: one more GxP system to validate and govern, and the question of who owns the template.',
    archBoxes: [
      { label: 'MES', caption: 'trigger + fields', color: 'bg-leaf-100 text-leaf-800' },
      { label: 'INT', caption: 'Integration Builder', color: 'bg-blue-100 text-blue-800' },
      { label: 'LIB', caption: 'template librarian', color: 'bg-purple-100 text-purple-800' },
      { label: 'POOL', caption: 'POOL-CASE + spare', color: 'bg-amber-100 text-amber-800' },
      { label: 'PRN', caption: 'ZPL to the engine', color: 'bg-tobacco-100 text-tobacco-700' },
    ],
    howTitle: 'How a middleware print request runs (ForgeMES → labelsvc)',
    steps: [
      'The MES POSTs named fields (ORDER, BATCH, EXPIRY, SERIAL, GTIN) plus a jobId and the template version it expects to http://labelsvc.hp2.local:8080/Integration/CaseLabel.',
      'The integration validates the request — unknown fields, missing serial, version mismatch → refused with a reason, not guessed at.',
      'It merges the data into LBL-CASE-STD.btw v14 from the librarian — the approved, versioned layout with change history and QA sign-off.',
      'It selects a printer from POOL-CASE: PRN-CP1 unless it is in error, then PRN-CP1B — and generates the printer\'s native language (ZPL here; SBPL if the spare were a SATO).',
      'It answers the MES: jobId, status PRINTED/FAILED, printerUsed, templateVersion — a real acknowledgement the raw port never gave, and a record the batch record can cite.',
      'Legacy variant: the MES drops a CSV into a watched folder instead. It still works — but folder retries re-submit files, so the jobId idempotency rule matters twice as much.',
    ],
    concepts: [
      { term: 'Template lifecycle', text: 'Design → QA approve → version → deploy → retire, with an audit trail (Annex 11). The librarian is the single source of truth; printers and integrations hold verified copies' },
      { term: 'Printer pools & failover', text: 'A pool is a policy: which engines are equivalent, what happens on error, and how the answer reports which member actually printed' },
      { term: 'Trigger patterns', text: 'HTTP/REST for new integrations; file drop and database watch for the twenty-year-old ones that still run half the world\'s labels' },
      { term: 'Who owns the template?', text: 'Engineering? Quality? IT? The org question every labeling project must answer — because a label layout is a controlled document the moment serialization or GMP touches it' },
    ],
    strengths: [
      'MES speaks fields, not printer dialects — and gets real job status back',
      'Templates become governed assets with versions, approvals and audit',
      'Pools, failover and multi-vendor fleets handled in one place',
    ],
    limits: [
      'One more critical, validated system — cluster it, monitor it, back up the library',
      'Idempotency is still YOUR job — the jobId contract prevents duplicate labels',
      'Latency-sensitive stations (carton serialization at 200/min) stay direct; middleware suits bundle/case/pallet rates',
    ],
    plant:
      'labelsvc.hp2.local runs BarTender Integration Builder owning LBL-CASE-STD, LBL-PLT-SSCC and LBL-BUNDLE, printing to POOL-CASE (PRN-CP1 → PRN-CP1B failover), PRN-PZ1 and PRN-BN3. Carton-UI printing stays on the serialization station\'s direct path — 200 cartons/min does not wait for HTTP.',
  },
];
