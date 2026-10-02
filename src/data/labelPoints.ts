import type { SystemBox, LabelPoint, PainBenefitCard } from './types';

export const MES_BOX: SystemBox = {
  name: 'ForgeMES',
  subtitle: 'The data authority (Level 3)',
  description:
    'Every correct label starts as MES data. The MES knows which order runs, which SKU, which batch and expiry, which serial comes next — and records what the verifiers saw, as batch-record entries.',
  functions: [
    'Consumes carton serial ranges allocated by the L4 serialization provider (via HP2-SER); generates BN-/CS-/SSCC ids under GS1 company prefix 0359123',
    'Owns label templates and their versions under GMP change control (LBL-CASE-STD v14, CRC-checked)',
    'Merges order / SKU / batch / expiry / serial data into print jobs and picks the printer from the pool',
    'Records verify results, owns the void/reprint policy, reconciles printed vs used vs destroyed labels for the batch record',
    'Feeds commissioning and aggregation events to HP2-SER → L4 EPCIS / EU Hub',
  ],
};

export const MARKING_BOX: SystemBox = {
  name: 'The Marking & Verify Layer',
  subtitle: 'Printers, coders, applicators, cameras (Level 2/1)',
  description:
    'The devices that put marks on product and read them back. They know print quality and media state — and nothing about orders, batches, expiry dates or markets.',
  functions: [
    'SER-CR3 / SER-CR5 serialization stations print the FMD DataMatrix UI on every carton at 200 cartons/min and camera-verify it',
    'PRN-BN3 prints bundle labels; PRN-CP1 print & apply engine labels every case; PRN-PZ1 prints pallet SSCCs',
    'SCAN-BN3, SCAN-CP1 and SCAN-PZ1 read every aggregation level back',
    'Report status upward: ribbon low, head open, media out, verify grades',
    'Never invent data — a printer prints what it is sent (or what it has stored…)',
  ],
};

// The six marking points along the line, serialization station → palletizer.
export const LABEL_POINTS: LabelPoint[] = [
  {
    id: 'carton-ui',
    station: 'CR3 / CR5 — cartoner serialization stations',
    deviceIds: ['SER-CR3', 'SER-CR5'],
    marking: 'Carton UI — printed ON the carton, NOT a label',
    symbology: 'GS1 DataMatrix (EU FMD)',
    contentExample: '(01)00359123000108(21)4T7K9DQ2CX41(10)B-CX-2417(17)280630',
    ownedBy: 'Serial from the L4 serialization provider\'s allocated range (randomised, ≤20 alphanumeric), commissioned via HP2-SER — the MES consumes ranges, it never invents carton serials',
    colorClass: 'border-leaf-700',
    text: 'The serialization station\'s thermal-inkjet head prints the unique identifier directly on the carton flap at 200 cartons/min; the camera reads every code back and rejects failures. Printhead wear is fault 2205. This is Delegated Regulation (EU) 2016/161 territory: a UI that was never verified or never uploaded is a pharmacy-counter alert later — not a warehouse problem.',
  },
  {
    id: 'tamper-seal',
    station: 'CR3 / CR5 — anti-tamper device',
    deviceIds: ['CR3', 'CR5'],
    marking: 'Anti-tamper seal — applied, NOT printed',
    symbology: 'None (tamper-evident label / sealed flap)',
    contentExample: 'Presence checked by camera · no data content · material lot in the batch record',
    ownedBy: 'A consumed packaging material on the packaging BOM; the MES records its lot and the camera confirms presence — nothing is printed',
    colorClass: 'border-amber-500',
    text: 'The second FMD safety feature. It looks like labeling — it is a material and a presence check. Its lot goes into the batch record like the leaflet and the carton blank; its absence is a carton reject, not a print fault. Knowing which marks are printed and which are applied is the first line of the marking map.',
  },
  {
    id: 'bundle',
    station: 'BN3 — bundler',
    deviceIds: ['PRN-BN3', 'SCAN-BN3'],
    marking: 'Bundle label',
    symbology: 'Code 128',
    contentExample: 'BN-2417-88 · B-CX-2417 · EXP 06/2028 · 10 cartons',
    ownedBy: 'MES-generated aggregation id printed from template LBL-BUNDLE v3 on PRN-BN3 (Zebra ZD621); SCAN-BN3 confirms which 10 carton UIs entered which bundle',
    colorClass: 'border-tobacco-600',
    text: 'The first aggregation level. FMD does not mandate aggregation — Helvion builds it (bundle → case → pallet) for warehouse efficiency and DSCSA-readiness, so the bundle id is an internal MES identity, not a GS1 trade item. That scan is what lets a recall walk down from a pallet to ten specific carton serials.',
  },
  {
    id: 'case',
    station: 'CP1 — case packer',
    deviceIds: ['PRN-CP1', 'PRN-CP1B', 'SCAN-CP1'],
    marking: 'Case label — THE CENTERPIECE',
    symbology: 'GS1-128',
    contentExample: '(01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31',
    ownedBy: 'MES merges order data into template LBL-CASE-STD v14; PRN-CP1 (Zebra ZE511, pool POOL-CASE) prints & applies; SCAN-CP1 grades and content-checks',
    colorClass: 'border-tobacco-600',
    text: 'This station is what this workshop is about: a raw ZPL job over TCP 9100, an applicator tamp, a verifier read, and a result event back to the MES. Twenty bundles — 200 serialized cartons, 4,000 tablets — stand behind every one of these labels, and the batch and expiry it carries are GMP-controlled statements about the product inside.',
  },
  {
    id: 'pallet',
    station: 'PZ1 — palletizer',
    deviceIds: ['PRN-PZ1', 'SCAN-PZ1'],
    marking: 'Pallet logistic label',
    symbology: 'GS1-128 (SSCC)',
    contentExample: '(00)003591230800127456 (02)20359123000317 (37)48 (10)B-CX-2417',
    ownedBy: 'MES assigns the SSCC under GS1 prefix 0359123 when the 48th case closes the pallet',
    colorClass: 'border-tobacco-600',
    text: 'The pallet\'s license plate. The quarantine warehouse scans it, the wholesaler scans it against the despatch advice, and the aggregation event names it as parent of 48 cases. Note what it does NOT do: the pallet is not sellable until the QP certifies the batch — status QUARANTINE until then, whatever the label says.',
  },
  {
    id: 'vignette',
    station: 'CR3 — export runs (CDX-10-EXP, Italian market)',
    deviceIds: ['CR3'],
    marking: 'Vignette (bollino) — NOT a printed label',
    symbology: 'Pre-printed, serial-numbered state sticker',
    contentExample: 'Material VIG-IT-CDX10 · reel lot per shift · AIC code + progressive number',
    ownedBy: 'A lot-tracked FISCAL MATERIAL consumed at CR3 on export runs — the MES verifies the right reel is loaded for the market and reconciles issued vs used vs destroyed every shift',
    colorClass: 'border-red-400',
    text: 'The trap everyone eventually meets: the reimbursement vignette is not printed by your printers — it is a state-issued document on a reel. Load it on a domestic run, or lose count of one, and you have a fiscal discrepancy to report and a deviation to close, not scrap. Every regulated industry has a mark like this; know yours.',
  },
];

export const PAIN_CARDS: PainBenefitCard[] = [
  {
    title: 'Hand-Typed Label Data',
    text: 'An operator types the batch and expiry at the case station keyboard. One transposed digit and 48 cases carry an expiry the batch record has never heard of — a GMP deviation before the pallet is wrapped.',
  },
  {
    title: 'Template Nobody Can Trace',
    text: 'Forty printers, each hand-loaded with "the" template over the years. Which version printed last Tuesday\'s cases? Nobody can say — and the batch record cannot say either.',
  },
  {
    title: 'Grade-Only Verification',
    text: 'The verifier checks that the barcode is pretty, not that it is true. A perfectly printed wrong expiry sails through every check and every review-by-exception.',
  },
  {
    title: 'Reprints That Double-Count',
    text: 'A jammed applicator, a hand reprint, and now two verify records claim the same case. Label reconciliation in the batch record does not add up — and the QP will not sign until it does.',
  },
];

export const BENEFIT_CARDS: PainBenefitCard[] = [
  {
    title: 'Variable Data From the Batch',
    text: 'The MES merges order, SKU, batch, expiry and serial into the template — the keyboard is gone, and every field traces to a batch-record transaction.',
  },
  {
    title: 'Version-Pinned Templates',
    text: 'Templates live in the label-management library under change control, versioned and CRC-checked on every download. A printer cannot silently run last year\'s layout.',
  },
  {
    title: 'Content-Verified Labels',
    text: 'The verifier decodes every label and compares it to what the MES expected — grade AND truth, per case, in real time, recorded in the eBR.',
  },
  {
    title: 'A Reconciled Void/Reprint Trail',
    text: 'Every void, reprint and duplicate is an event the MES resolves. Applied labels, verify records and label reconciliation agree — always, and the QP can see it.',
  },
];

export const CROSSLINK_CALLOUT = {
  heading: 'Where this workshop hands over',
  body: 'Aggregation itself — carton → bundle → case → pallet → EPCIS — is ForgeMES Studio\'s Track & Trace module; practice configuring it at forgemes-pharma.netlify.app. This workshop owns the layer underneath: how the marks get printed, verified and reconciled in the first place.',
};
