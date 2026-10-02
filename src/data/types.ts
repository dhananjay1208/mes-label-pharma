// ---- Overview ----
export interface LearnBullet {
  title: string;
  text: string;
}

export interface TopicCard {
  title: string;
  text: string;
}

export interface StatTile {
  value: string;
  label: string;
  colorClass: string; // literal Tailwind class, e.g. 'text-leaf-700'
}

// ---- Introduction ----
export interface SystemBox {
  name: string;
  subtitle: string;
  description: string;
  functions: string[];
}

export interface LineStation {
  name: string;
  system: string;
}

export interface PainBenefitCard {
  title: string;
  text: string;
}

// ---- Interface Contract flows ----
export interface FlowQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  correctMsg: string;
  wrongMsg: string;
}

// Field tables rendered inside the Interface Contract flows
export interface SignalRow {
  tag: string;        // 'ORDER' | '(01) GTIN' | 'media.status'
  address: string;    // 'tcp://prn-cp1.hp2.local:9100' | '^FN2' | 'SGD getvar'
  dataType: string;   // 'ZPL ^FD' | 'AI (10)' | 'flag'
  format: string;     // 'n14 + check' | 'YYMMDD' | 'alphanumeric ≤20'
  trigger: string;    // 'per case' | 'poll 10 s' | 'on verify'
  description: string;
  trap?: boolean;     // highlighted as a known integration trap
}

// ---- Message exchanges (MessageExchangeViewer) ----
export type MessageType =
  | 'print-job'          // ↓ MES → PRN-CP1, raw ZPL over TCP 9100
  | 'printer-status'     // ↑ ~HS / SGD / SNMP printer health
  | 'verify-result'      // ↑ SCAN-CP1 grade + content event
  | 'template-download'  // ↓ label management → printer, ^DF store + CRC verify
  | 'middleware-trigger';// ↕ MES → BarTender Integration Builder

export interface SignalField {
  field: string;
  value: string;
  description: string;
}

export interface MessageData {
  title: string;
  description: string;
  signalTable: {
    type: string;
    description: string;
    segments: Record<string, SignalField[]>;
  };
  payload: string;          // pre-formatted text: JSON / sequence diagram / frame dump
  payloadCaption: string;
  signalTabLabel?: string;  // defaults to 'Signal / Register Table'
  payloadTabLabel?: string; // defaults to 'Payload Example'
  note: { heading: string; body: string };
}

// ---- Technical Mechanisms ----
export interface Mechanism {
  id: string;
  name: string;
  description: string;
  plantUse: string;   // where it runs at Plant 2
}

export interface PatternCard {
  title: string;
  text: string;
}

// ---- The Live Label Line simulation ----
// Printer/applicator state (grammar mirrors the family state-word idea):
// 1=Ready · 2=Printing · 3=Fault · 4=Starved (no case at the applicator)
export type PrnState = 1 | 2 | 3 | 4;

export interface SimEvent {
  tick: number;
  severity: 'info' | 'warn' | 'alert';
  text: string;
}

export interface TruthSample {
  tick: number;
  prnState: PrnState;
  faultCode: number;        // 0 = none; else 61xx per WORLD.faultCodes
  applied: number;          // labels physically applied (truth)
  printed: number;          // labels printed incl. voided reprints (truth)
  verifiedPass: number;
  verifiedFail: number;
  noReads: number;
  grade: number;            // current ISO 15416 numeric grade at SCAN-CP1
  mesRecords: number;       // verify records the MES has actually received
  contentMismatch: boolean; // stale-template window: grade fine, data wrong
}

// ---- Case Study ----
export interface CaseStep {
  step: number;
  title: string;
  description: string;
  question: string;
  options: string[];
  correct: string; // must be an exact copy of one options[] entry
  explanation: string;
  dataExample: {
    type: string;
    fields: { label: string; value: string }[];
  };
}

// ---- Technical Considerations ----
export interface Challenge {
  id: string;
  title: string;
  description: string;
  solution: string;
  impact: 'Critical' | 'High' | 'Medium';
  category: string;
}

export interface TrueFalseQ {
  id: string;
  question: string;
  answer: boolean;
  explanation: string;
}

// ---- Final Thoughts ----
export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface UniqueCard {
  title: string;
  text: string;
}

// ---- Where Labels Live (label-points section) ----
export interface LabelPoint {
  id: string;
  station: string;          // 'CR3 / CR5 — cartoner serialization stations'
  deviceIds: string[];      // ['SER-CR3', 'SER-CR5']
  marking: string;          // 'Carton UI — printed ON the carton, NOT a label'
  symbology: string;        // 'GS1 DataMatrix (EU FMD)'
  contentExample: string;   // '(01)00359123000108(21)4T7K9DQ2CX41(10)B-CX-2417(17)280630'
  ownedBy: string;          // who supplies the data / who prints
  colorClass: string;       // literal Tailwind class for the card accent
  text: string;
}

// ---- Tools & Technology ----
export interface RealToolRow {
  category: string;
  products: string;
  plantRole: string;      // the concrete Plant 2 role
}

// ---- ZPL Playground ----
export interface ZplPreset {
  id: string;
  name: string;
  zpl: string;                                        // may contain ${VAR} placeholders
  variables: { key: string; label: string; value: string }[];
  note: string;
}

export interface BreakItPrompt {
  id: string;
  title: string;
  prompt: string;       // what to try
  brokenZpl: string;    // the broken variant loaded by "Apply"
  symptom: string;      // what the participant should observe
  lesson: string;       // why it matters on a real line
}

// ---- Configuration checklist (config-and-close section) ----
export interface ConfigChecklistItem {
  id: string;
  title: string;
  what: string;           // what to configure
  why: string;            // the failure it prevents
  plantExample: string;   // the concrete Plant 2 value
}
