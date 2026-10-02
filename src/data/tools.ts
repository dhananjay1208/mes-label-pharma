import type { Mechanism, PatternCard, RealToolRow } from './types';

// Drag-drop matcher: six label-domain technologies vs their Plant 2 use.
export const MECHANISMS: Mechanism[] = [
  {
    id: 'zpl',
    name: 'ZPL',
    description: 'Zebra\'s text label language — ^XA…^XZ formats streamed to the printer, diffable and version-controllable',
    plantUse: 'Every bundle, case and pallet label at Plant 2 crosses the wire as ZPL to the ZD621, ZE511 and ZT411 engines',
  },
  {
    id: 'sbpl',
    name: 'SBPL',
    description: 'SATO\'s printer language — same idea as ZPL, different dialect; middleware translates between them',
    plantUse: 'The reason POOL-CASE could mix vendors: the middleware speaks the dialect, the MES never does',
  },
  {
    id: 'raw9100',
    name: 'Raw TCP 9100',
    description: 'The "raw port": bytes in, labels out, no acknowledgement — fast, universal, and blind',
    plantUse: 'tcp://prn-cp1.hp2.local:9100 — the print path the status and verify loops must compensate for',
  },
  {
    id: 'sgd',
    name: 'SGD / ~HS status',
    description: 'Zebra\'s Set-Get-Do variables and host-status query — the printer\'s self-report channel',
    plantUse: 'media.status "ribbon low" ten minutes before fault 6101 — the difference between a reel change and a line stop',
  },
  {
    id: 'gs1128',
    name: 'GS1-128',
    description: 'Code 128 in GS1 mode: FNC1-led element strings with Application Identifiers — the logistics workhorse',
    plantUse: 'The case label (01)(17)(10)(21) and the pallet SSCC (00) — what SCAN-CP1, the warehouse and the wholesaler read',
  },
  {
    id: 'datamatrix',
    name: 'GS1 DataMatrix',
    description: '2D matrix symbology (ECC200) for small spaces and dense data — the mandated carrier of the FMD unique identifier',
    plantUse: 'Carton UIs at 200 cartons/min on CR3/CR5 — printed on the carton by the serialization station, verified by camera, not this app\'s printers',
  },
];

export const REQUIREMENT_CARDS: PatternCard[] = [
  {
    title: 'Print is a three-loop contract',
    text: 'Job down, status across, verify back. An integration with only the print path is a third of an integration — and the missing two-thirds are where labels get lost and batch records go wrong.',
  },
  {
    title: 'Templates are controlled documents',
    text: 'The moment serialization or GMP touches a label, its layout needs change control, versions, QA approval and a deployment handshake — not a USB stick and good intentions.',
  },
  {
    title: 'Serials need one owner',
    text: 'L4 provider ranges for carton UIs (the law), MES sequences for bundles/cases/SSCCs (the prefix). Two authorities, zero overlap, no gaps, no duplicates — configured, not hoped for.',
  },
];

export const PATTERN_CARDS: PatternCard[] = [
  {
    title: 'Direct where fast, middleware where governed',
    text: 'Carton coding at 200/min stays on the serialization station\'s direct path; bundle, case and pallet labels ride the middleware where templates, pools and audit live.',
  },
  {
    title: 'Verify content, not just quality',
    text: 'Grade thresholds catch a dying printhead; decode-and-compare catches a lying expiry. You need both, and they are different configurations.',
  },
  {
    title: 'Reconcile counts continuously',
    text: 'Printed, applied, verified, voided, reprinted — five counters that must agree per pallet and per packaging order. Event-driven reconciliation finds the duplicate in seconds; batch finds it at pallet close; the QP finds it at review — and stops.',
  },
];

// The real-world tools table — the plant is fictional, these are not.
export const REAL_TOOLS: RealToolRow[] = [
  {
    category: 'Label printers & print engines',
    products: 'Zebra (ZE511, ZT411, ZD621), SATO (S84NX), Honeywell (PX940)',
    plantRole: 'PRN-CP1/CP1B case print & apply engines; PRN-PZ1 pallet printer; PRN-BN3 bundle printer',
  },
  {
    category: 'Print & apply applicators',
    products: 'Zebra print engines inside applicators from Loveshaw, ID Technology, Weber',
    plantRole: 'The tamp unit around PRN-CP1 that puts the label on the case',
  },
  {
    category: 'Inkjet / laser coders',
    products: 'Videojet, Domino, Markem-Imaje (CIJ, TIJ, laser)',
    plantRole: 'The class of device printing the FMD carton UI at SER-CR3/CR5 — printing without labels',
  },
  {
    category: 'Serialization systems (line + L3/L4)',
    products: 'Antares Vision, OPTEL, Systech (Markem-Imaje); L4: TraceLink, rfxcel',
    plantRole: 'SER-CR3/CR5 print-and-verify stations, HP2-SER site manager, the L4 provider allocating serial ranges and talking to the EU Hub',
  },
  {
    category: 'Verification & vision',
    products: 'Cognex (DataMan, In-Sight), Omron Microscan (LVS-95XX), SICK',
    plantRole: 'SER-CR3 carton camera verify; SCAN-CP1 case grade + content check; SCAN-BN3 / SCAN-PZ1 aggregation reads',
  },
  {
    category: 'Label design & middleware',
    products: 'BarTender (Seagull Scientific), NiceLabel / Loftware, ZebraDesigner, CODESOFT',
    plantRole: 'labelsvc.hp2.local — template library under change control, integration triggers, printer pools',
  },
  {
    category: 'Standards & regulations',
    products: 'GS1 (GTIN/SSCC/AIs/GS1-128/GS1 DataMatrix), ISO/IEC 15416 & 15415 (grading), EU FMD 2011/62/EU + DR (EU) 2016/161, EU GMP Annex 11 / 21 CFR Part 11',
    plantRole: 'The grammar of every label, the law behind every carton UI, and the rules that make templates and verify events controlled records',
  },
];

export const REAL_TOOLS_NOTE =
  'Helvion Pharma, Plant 2 Lakeworth, Cardexil and ForgeMES are fictional. Every product, standard and regulation in this table is real — these are the names you will meet in your own plant\'s labeling and serialization projects.';
