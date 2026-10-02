import type { GlossaryTerm, UniqueCard } from './types';

export const KEY_TAKEAWAYS = [
  'Labeling is a three-loop contract: print job down, printer status across, verify result back — any missing loop loses labels silently',
  'Grade proves print quality; content-compare proves truth — they are different checks with different configurations, and under GMP you need both',
  'Templates are controlled documents: one library, change control, versions, CRC readback on every store, version pin on every recall',
  'Two serial authorities, never confused: L4 serialization-provider ranges for carton UIs (the law), MES sequences under the GS1 prefix for bundles, cases and SSCCs',
  'Reconcile continuously: printed = applied + voided, one verify record per physical unit — duplicates are voted out in seconds, not found at batch-record review',
  'The status channel is your early warning: ribbon-low handled at the pallet break is invisible; ribbon-out at case 31 is a line stop',
];

export const UNIQUE_CARDS: UniqueCard[] = [
  {
    title: 'The Carton UI Is Not a Label',
    text: 'The FMD unique identifier is printed ON the carton by the serialization station\'s inkjet head and camera-verified per carton — no label stock, no ribbon, no applicator. Its serial comes from the L4 provider\'s range. The marking map starts by separating printed-on from printed-and-applied.',
  },
  {
    title: 'Two Serial Grammars, One Line',
    text: 'Carton UIs follow the serialization provider\'s grammar (randomised, ≤20 alphanumeric, Delegated Regulation (EU) 2016/161); bundle, case and pallet codes follow GS1 grammar under prefix 0359123. The same MES manages both authorities without ever mixing them.',
  },
  {
    title: 'The Vignette Is Not a Label',
    text: 'It looks like labeling, but the Italian bollino on CDX-10-EXP is a state-issued document on a reel — a lot-tracked MATERIAL reconciled every shift. Wrong reel or wrong count = fiscal report + deviation. Knowing which marks are printed and which are consumed is pharma-specific literacy.',
  },
  {
    title: 'Every Label Is a GMP Record',
    text: 'Batch and expiry on a case label are regulated statements; a wrong one that ships is a recall, not a cosmetic defect. Templates are validated, change-controlled documents; verify events are batch-record entries; label reconciliation is a QP question. Labeling integration errors here have deviation numbers.',
  },
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Languages & transport
  { term: 'ZPL', definition: 'Zebra Programming Language - the text label language (^XA...^XZ) streamed to Zebra printers; diffable, versionable, auditable.' },
  { term: 'SBPL', definition: 'SATO Barcode Printer Language - SATO\'s equivalent of ZPL. Middleware translates between vendor dialects.' },
  { term: 'Raw port 9100', definition: 'The TCP "raw printing" port: bytes in, labels out, no acknowledgement. Fast, universal, and blind - hence status and verify loops.' },
  { term: 'LPR/LPD & IPP', definition: 'Queue-based network printing protocols (ports 515/631) - the alternatives where raw 9100 is blocked by policy.' },
  { term: 'SGD', definition: 'Set-Get-Do - Zebra\'s variable interface (! U1 getvar "media.status") for status and configuration, riding the same socket as print jobs.' },
  { term: '~HS Host Status', definition: 'The classic Zebra status query: three comma-separated strings with POSITIONAL fields - off-by-one parsing reads the wrong flag.' },
  { term: 'SNMP Printer-MIB', definition: 'Network-side printer monitoring via standard OIDs - the vendor-neutral watchdog beside SGD.' },
  { term: 'Stored format (^DF/^XF)', definition: 'ZPL templates stored on printer flash (^DF) and recalled by name (^XF) with only variable data per job - fast, and the versioning trap of the Case Study.' },
  { term: '^FN numbered field', definition: 'A template merge slot - the recall job supplies ^FN1, ^FN2... values, the stored layout supplies everything else.' },
  // Hardware
  { term: 'Print engine', definition: 'A printer built to live inside an applicator (Zebra ZE511, SATO S84NX) - the printing half of a print & apply station.' },
  { term: 'Print & apply (LPA)', definition: 'Label-print-apply: print engine + tamp/blow applicator that labels product in motion - PRN-CP1 at the case packer.' },
  { term: 'Thermal transfer vs direct thermal', definition: 'Ribbon-based printing (durable, needs RIB-WAX-RES) vs heat-sensitive stock (fades, no ribbon). Case labels are thermal transfer.' },
  { term: 'Printhead wear', definition: 'Heads die in printed centimetres - watch odometer.total_print_length and the verifier grade trend, not the calendar.' },
  { term: 'Coder (CIJ/TIJ/laser)', definition: 'Continuous/thermal inkjet or laser markers (Videojet, Domino, Markem-Imaje) coding cartons at line speed - printing without labels. The FMD carton UI is TIJ at SER-CR3.' },
  { term: 'Verifier', definition: 'A camera/scanner that grades barcode quality against ISO standards (Cognex, Omron Microscan LVS) - and, configured properly, checks content too.' },
  // GS1 & identity
  { term: 'GS1', definition: 'The global standards body for supply-chain identification - GTINs, SSCCs, Application Identifiers, and the barcodes that carry them.' },
  { term: 'Application Identifier (AI)', definition: 'The numeric prefix that says what a data element means: (01) GTIN, (17) expiry, (10) batch, (21) serial, (00) SSCC, (37) count.' },
  { term: 'FNC1', definition: 'The special character that puts Code 128 into GS1 mode and terminates variable-length AIs - drop it and the batch swallows the serial.' },
  { term: 'GTIN', definition: 'Global Trade Item Number - what the item IS. The case GTIN-14 20359123000317 = indicator 2 + prefix 0359123 + item ref + check digit; the carton GTIN-14 00359123000108 is the FMD product code.' },
  { term: 'SSCC', definition: 'Serial Shipping Container Code - the 18-digit pallet license plate: extension + GS1 prefix + serial reference + check digit. 003591230800127456 at Plant 2.' },
  { term: 'GS1-128', definition: 'Code 128 in GS1 mode: FNC1-led element strings with AIs - the case and pallet label workhorse.' },
  { term: 'GS1 DataMatrix', definition: '2D matrix symbology (ECC200) for small spaces and 2D scanning - the mandated carrier of the FMD carton UI; graded under ISO/IEC 15415.' },
  { term: 'Unique identifier (UI)', definition: 'The FMD carton code: product code (GTIN) + serial (≤20 alnum) + batch + expiry, in a DataMatrix, printed on the carton and uploaded to the EU Hub. Not a label - a mark.' },
  { term: 'Check digit', definition: 'Mod-10 with 3-1 alternating weights over the payload - the arithmetic every scanner runs and the playground widget demonstrates.' },
  { term: 'Element string', definition: 'The decoded GS1 content of a barcode: (01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31 - what downstream systems believe.' },
  // Quality & process
  { term: 'ISO/IEC 15416 / 15415', definition: 'The barcode print-quality grading standards (linear / 2D): A-F letter grades, lowest parameter wins. Plant 2 policy: pass ≥ C, warn < B.' },
  { term: 'Content verification', definition: 'Decoding every label and comparing against MES-expected values - the only check that catches a perfectly printed wrong expiry.' },
  { term: 'Void / reprint', definition: 'The controlled response to a failed or unreadable label: MES voids the record, issues a reprint, reconciles the counts - never a hand reprint outside the system.' },
  { term: 'Idempotent jobId', definition: 'A unique job key that makes retries safe - the same request twice must not print two labels (fault 6220).' },
  { term: 'Label reconciliation', definition: 'Continuously proving printed = applied + voided and one verify record per unit - and, under EU GMP, the issued/used/destroyed count the batch record must close before the QP signs.' },
  { term: 'Serialization vs aggregation', definition: 'Serialization gives units identity (carton UIs); aggregation records containment (carton→bundle→case→pallet). FMD mandates the first; Helvion builds the second as best practice. This workshop prints and verifies; ForgeMES Studio practices the aggregation.' },
  { term: 'L4 serialization provider / EU Hub', definition: 'The Level 4 system that allocates carton serial ranges to HP2-SER and uploads commissioned UIs to the European Hub (EMVO) for verification at dispense - Delegated Regulation (EU) 2016/161.' },
  { term: 'Vignette (bollino)', definition: 'A state-issued, serial-numbered reimbursement sticker (Italian market) applied at the cartoner on export runs - a lot-tracked fiscal MATERIAL, reconciled per shift, never printed by your printers.' },
  { term: 'Annex 11 / 21 CFR Part 11', definition: 'The GMP rules for computerised systems and electronic records: validated systems, audit trails, e-signatures - the reason label templates and verify events are controlled records, not files on a laptop.' },
  { term: 'Deviation', definition: 'The GMP record opened whenever something departed from the approved process - a content mismatch at SCAN-CP1 opens one; a wrong expiry that ships escalates one to a recall.' },
];

export const NEXT_STEPS = [
  { emoji: '🏷️', title: 'Audit Your Label Points', text: 'Map every marking point in your plant: who prints it, from which data, verified by what, which are printed and which are consumed — the marking map is step one' },
  { emoji: '🧪', title: 'Replay the Playground', text: 'Take the case-label ZPL to your own bench printer — the same text prints on any Zebra; scan it with your phone and check the four AIs' },
  { emoji: '🚀', title: 'ForgeMES Studio', text: 'Practice the aggregation side — track points, serialization config, EPCIS reporting — at forgemes-pharma.netlify.app' },
];
