import type { ZplPreset, BreakItPrompt } from './types';

// The playground presets. ${VAR} placeholders are filled by the MES-fields
// panel (lib/zpl/tokenizer.ts substitute()) — the template-vs-variable-data
// split made physical. Every ${KEY} used in a preset's zpl has a matching
// entry in its variables[] (the playground builds its fields from that list).

export const ZPL_PRESETS: ZplPreset[] = [
  {
    id: 'case',
    name: 'Case GS1-128 label',
    zpl: `^XA
^CI28^PW1218^LL812
^FO40,40^GB1138,120,3^FS
^FO60,60^A0N,36,36^FDHELVION PHARMA - PLANT 2 LAKEWORTH^FS
^FO60,106^A0N,28,28^FD\${SKU_TEXT}^FS
^FO60,200^A0N,28,28^FDORDER: \${ORDER}   SKU: \${SKU}^FS
^FO60,240^A0N,28,28^FDBATCH: \${BATCH}   EXP: \${EXP_HUMAN}   CASE: \${SERIAL}^FS
^BY2,3,160
^FO60,300^BCN,160,Y,N,N^FD>;>801\${GTIN}17\${EXP}10>6\${BATCH}>821\${SERIAL}^FS
^FO60,530^A0N,24,24^FD(01)\${GTIN}(17)\${EXP}(10)\${BATCH}(21)\${SERIAL}^FS
^FO40,590^GB1138,2,2^FS
^FO60,620^A0N,24,24^FD20 BUNDLES - 200 CARTONS - 4,000 TABLETS^FS
^FO60,660^A0N,24,24^FDSTATUS: QUARANTINE UNTIL QP RELEASE^FS
^XZ`,
    variables: [
      { key: 'ORDER', label: 'Packaging order', value: 'PO-77231' },
      { key: 'SKU', label: 'SKU code', value: 'CDX-10' },
      { key: 'SKU_TEXT', label: 'SKU description', value: 'CARDEXIL 10 MG FILM-COATED TABLETS - 20 BUNDLES' },
      { key: 'BATCH', label: 'Batch (AI 10)', value: 'B-CX-2417' },
      { key: 'EXP', label: 'Expiry YYMMDD (AI 17)', value: '280630' },
      { key: 'EXP_HUMAN', label: 'Expiry, human form', value: '06/2028' },
      { key: 'SERIAL', label: 'Case serial (AI 21)', value: 'CS-2417-31' },
      { key: 'GTIN', label: 'Case GTIN-14 (AI 01)', value: '20359123000317' },
    ],
    note: 'The exact job from the Interface Contract section — a 6×4" landscape case label. The barcode is a real, scannable GS1-128 with four AIs: point a scanner app at your screen. Edit a field and watch the merge; change EXP to 270630 and notice that nothing on the label complains.',
  },
  {
    id: 'pallet',
    name: 'Pallet SSCC label',
    zpl: `^XA
^CI28^PW812^LL1218
^FO40,40^GB732,120,3^FS
^FO60,64^A0N,40,40^FDPALLET - PLANT 2 LAKEWORTH^FS
^FO60,200^A0N,28,28^FDSSCC: \${SSCC}^FS
^FO60,240^A0N,28,28^FDCONTAINS: 48 CASES \${SKU}   BATCH: \${BATCH}^FS
^BY4,3,180
^FO60,320^BCN,180,Y,N,N^FD>;>800\${SSCC}^FS
^FO60,560^A0N,24,24^FD(00)\${SSCC}^FS
^FO60,620^A0N,24,24^FD(02)\${GTIN}(37)48(10)\${BATCH}^FS
^FO60,720^A0N,28,28^FDSTATUS: QUARANTINE - QP RELEASE PENDING^FS
^XZ`,
    variables: [
      { key: 'SSCC', label: 'SSCC-18', value: '003591230800127456' },
      { key: 'SKU', label: 'SKU code', value: 'CDX-10' },
      { key: 'GTIN', label: 'Contained case GTIN-14', value: '20359123000317' },
      { key: 'BATCH', label: 'Batch', value: 'B-CX-2417' },
    ],
    note: 'The pallet\'s license plate: AI (00) with the full 18-digit SSCC — extension 0, prefix 0359123, serial reference 080012745, check digit 6. Below it, (02)+(37) say what and how many is inside, (10) says which batch — and the status line reminds the warehouse that a labeled pallet is still not a sellable one.',
  },
  {
    id: 'bundle',
    name: 'Bundle label (PRN-BN3)',
    zpl: `^XA
^CI28^PW812^LL406
^FO30,30^A0N,32,32^FDHELVION PHARMA - \${SKU_TEXT}^FS
^FO30,80^A0N,28,28^FDBATCH: \${BATCH}   EXP: \${EXP_HUMAN}   10 CARTONS^FS
^BY3,3,120
^FO30,140^BCN,120,Y,N,N^FD\${BUNDLE}^FS
^FO30,320^A0N,24,24^FDBUNDLE \${BUNDLE} - LBL-BUNDLE v3 - PRN-BN3^FS
^XZ`,
    variables: [
      { key: 'BUNDLE', label: 'Bundle id (MES-generated)', value: 'BN-2417-88' },
      { key: 'SKU_TEXT', label: 'SKU description', value: 'CARDEXIL 10 MG' },
      { key: 'BATCH', label: 'Batch', value: 'B-CX-2417' },
      { key: 'EXP_HUMAN', label: 'Expiry, human form', value: '06/2028' },
    ],
    note: 'A 4×2" desktop-printer label for the bundler: plain Code 128 (no FNC1, no AIs) carrying the MES-generated bundle id. It is an internal aggregation identity, not a GS1 trade item — the ten carton UIs behind it live in the MES aggregation record, not on the label.',
  },
  {
    id: 'blank',
    name: 'Blank 4×6 canvas',
    zpl: `^XA
^CI28^PW812^LL1218
^FO60,60^A0N,32,32^FDYour label here^FS
^XZ`,
    variables: [],
    note: 'A clean 812×1218-dot canvas (4×6" at 203 dpi). Try ^FO to position, ^A0N,h,w for text, ^GB for boxes, ^BY + ^BCN + ^FD for a Code 128.',
  },
];

export const BREAK_IT_PROMPTS: BreakItPrompt[] = [
  {
    id: 'by-width',
    title: 'Break the module width (^BY)',
    prompt: 'Change ^BY2,3,160 to ^BY1,3,160 and watch the barcode shrink to half its width.',
    brokenZpl: `^XA
^CI28^PW1218^LL812
^FO60,200^A0N,28,28^FDORDER: PO-77231   BATCH: B-CX-2417   EXP: 06/2028^FS
^BY1,3,160
^FO60,300^BCN,160,Y,N,N^FD>;>801203591230003171728063010>6B-CX-2417>821CS-2417-31^FS
^XZ`,
    symptom: 'The bars are now 1 dot wide. On screen it still "scans"; on a real line, ribbon wrinkle, dust and applicator distance eat 1-dot bars alive — decodability collapses and the verifier grade drops toward F.',
    lesson: 'Module width is a physics decision, not a styling choice: it trades label real estate against scan reliability. Four AIs make a long symbol, which is why this playground canvas runs the case label landscape at ^BY2; Plant 2\'s production template for the 300 dpi ZE511 uses a wider ^BY so the X-dimension lands inside the GS1 logistics window.',
  },
  {
    id: 'fnc1',
    title: 'Drop the FNC1 separator',
    prompt: 'Remove the >8 between the batch and the (21) serial — the single most common GS1-128 integration bug.',
    brokenZpl: `^XA
^CI28^PW1218^LL812
^FO60,200^A0N,28,28^FDORDER: PO-77231   BATCH: B-CX-2417   EXP: 06/2028^FS
^BY2,3,160
^FO60,300^BCN,160,Y,N,N^FD>;>801203591230003171728063010>6B-CX-241721CS-2417-31^FS
^FO60,530^A0N,24,24^FD01203591230003171728063010B-CX-241721CS-2417-31^FS
^XZ`,
    symptom: 'The barcode still prints and still grades well — but a scanner now reads (10) as "B-CX-241721CS-2417-31": the batch has swallowed the serial. The GS1 check panel below the preview shows the parse failing.',
    lesson: 'AI (10) is variable-length, so only FNC1 tells the scanner where it ends. Without it, downstream systems inherit a corrupted batch and no serial at all — and every check digit still passes, because structure and content are separate layers. (01) and (17) never needed a separator: they are fixed-length. That asymmetry is where the bug hides.',
  },
  {
    id: 'wrong-ai',
    title: 'Type the wrong AI: (17) → (11)',
    prompt: 'One keystroke in the template: the expiry field\'s AI becomes (11), which means PRODUCTION DATE.',
    brokenZpl: `^XA
^CI28^PW1218^LL812
^FO60,200^A0N,28,28^FDORDER: PO-77231   BATCH: B-CX-2417   EXP: 06/2028^FS
^BY2,3,160
^FO60,300^BCN,160,Y,N,N^FD>;>801203591230003171128063010>6B-CX-2417>821CS-2417-31^FS
^FO60,530^A0N,24,24^FD(01)20359123000317(11)280630(10)B-CX-2417(21)CS-2417-31^FS
^XZ`,
    symptom: 'Everything scans — and this time the GS1 panel shows NO error at all: 280630 is a perfectly valid YYMMDD production date. The only tell is the label text: "Production date" where "Expiration date" should be. The case now has no expiry in its barcode, and a production date two years in the future.',
    lesson: 'A wrong AI is still a syntactically valid label, and a date is a date to every parser. The receiving system believes the label, so your expiry becomes their production date — quiet data corruption with no error anywhere. Only content verification against MES-expected values (AI by AI) reliably catches it; in GMP a case without an expiry in the supply chain is a recall-class labeling error.',
  },
];

export const PLAYGROUND_INTRO = {
  heading: 'Edit ZPL, watch the label change',
  body: 'This is the exact text your MES (or its middleware) streams to port 9100. The preview renders a real Code 128 — the bars are computed by the same encoder your tests freeze, and the GS1 panel parses the human-readable line the way a scanner would. The DataMatrix (^BX) placeholder is illustrative — the FMD carton UI is not this app\'s job; everything else is real.',
};

export const CHECKDIGIT_WIDGET = {
  heading: 'GS1 check-digit calculator',
  body: 'Paste any 17-digit SSCC payload (or 13-digit GTIN payload) and see the 3-1 weighting, the sum, and the check digit — the arithmetic every scanner runs on every read. The default is the Plant 2 pallet SSCC without its last digit.',
  example: '00359123080012745',
};
