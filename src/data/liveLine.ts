// The Live Label Line — SIM CONFIG for the print-&-apply + verify station
// on CP1 (PRN-CP1 prints, the applicator tamps, SCAN-CP1 grades).
// The engine itself is pure and lives in src/lib/labelLineSim.ts.
//
// Deterministic by law: no RNG, no Date.now — sine ripple + a scripted
// incident timeline. Incident windows deliberately avoid multiples of 15 so
// the batch-15s reconciliation mode visibly lags the truth.
//
// Time compression: the real CP1 closes exactly 1 case/min (4,000 tab/min ÷
// 4,000 tablets per case); the demo runs a case every 5 ticks (1 s/tick) so a
// full 48-case pallet closes once per 240-tick loop.

export type ReconMode = 'event' | 'batch-15s' | 'pallet-close';

export interface SimIncident {
  at: number;        // tick within the loop
  dur: number;       // ticks
  kind: 'ribbon-low' | 'ribbon-out' | 'no-read-burst' | 'dup-serial' | 'stale-template';
  fault: number;     // WORLD.faultCodes key; 0 for warnings
}

export const SIM = {
  tickMs: 1000,
  loopTicks: 240,
  caseEveryTicks: 5,
  palletCases: 48,              // canon: 48 cases per pallet
  caseSerialPrefix: 'CS-2417-', // canon case id family (CS-2417-31)
  grade: { base: 3.8, wearPerTick: 0.004, ripple: 0.15 }, // drifts A → C across a loop
  passMin: 1.5,   // grade C — Plant 2 policy
  warnBelow: 2.5, // grade B
  reconOptions: ['event', 'batch-15s', 'pallet-close'] as ReconMode[],
  batchTicks: 15,
  // Five scripted incidents on CP1: the ribbon-low WARNING (the early-warning
  // pair to 6101 — this pack's "one of your choice"), then the four canon faults.
  script: [
    { at: 28, dur: 10, kind: 'ribbon-low', fault: 0 },
    { at: 52, dur: 12, kind: 'ribbon-out', fault: 6101 },
    { at: 97, dur: 8, kind: 'no-read-burst', fault: 6210 },
    { at: 133, dur: 1, kind: 'dup-serial', fault: 6220 },
    { at: 168, dur: 34, kind: 'stale-template', fault: 6305 },
  ] as SimIncident[],
};

// Printer/applicator state chips — literal Tailwind classes (family law).
export const STATE_LABELS: Record<number, { label: string; chipClass: string; cellClass: string }> = {
  1: { label: 'Ready', chipClass: 'bg-leaf-100 text-leaf-800', cellClass: 'bg-leaf-600' },
  2: { label: 'Printing', chipClass: 'bg-emerald-100 text-emerald-800', cellClass: 'bg-emerald-500' },
  3: { label: 'Fault', chipClass: 'bg-red-100 text-red-700', cellClass: 'bg-red-500' },
  4: { label: 'Starved', chipClass: 'bg-amber-100 text-amber-800', cellClass: 'bg-amber-400' },
};

// Truth-strip cell colors per tick outcome (literal classes).
export const TRUTH_CELLS = {
  ok: 'bg-leaf-600',
  reprint: 'bg-amber-400',
  fault: 'bg-red-500',
  mismatch: 'bg-purple-500',
  idle: 'bg-gray-200',
};

export const FAULT_MAP: Record<number, string> = {
  6101: 'Ribbon out (PRN-CP1) — media alarm from SGD status',
  6102: 'Label media out (PRN-CP1)',
  6210: 'Verifier no-read (SCAN-CP1) — label voided, reprint issued',
  6220: 'Duplicate serial — hand reprint created a second CS- record',
  6305: 'Stale template — printer recalled stored v13: grade A, WRONG expiry',
};

export const LIVE_BENEFIT_TILES = [
  {
    title: 'Truth vs records',
    text: 'The applicator applied N labels; the MES only knows what the verify events told it. The gap between the two strips is your reconciliation design — and the label reconciliation the QP reads in the batch record.',
  },
  {
    title: 'Grade is a trend, not a gate',
    text: 'Watch the verifier grade slide from A toward C as the printhead wears — the warn-below-B threshold buys you a shift of warning before labels start failing.',
  },
  {
    title: 'Content beats cosmetics',
    text: 'In the stale-template window every label grades A and still carries last year\'s expiry. Only decode-and-compare against MES-expected values catches it — the purple cells. In GMP that window is a recall waiting to happen.',
  },
];

export const LIVE_CALLOUT = {
  heading: '🧪 Try this',
  body: 'Switch reconciliation to "pallet-close" and watch the duplicate serial at :133 stay invisible until the pallet closes — then flip back to "event" mode, Reset, and see the MES catch it within a tick. That is the entire argument for event-driven verify feedback — and for a label reconciliation that adds up before the QP ever sees it.',
};
