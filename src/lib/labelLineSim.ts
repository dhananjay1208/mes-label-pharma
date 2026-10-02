// The Live Label Line engine — a pure, deterministic tick simulation of the
// case print-&-apply + verify station (PRN-CP1 → applicator → SCAN-CP1).
// Extracted from the section component (deliberate family deviation) so
// vitest can assert determinism, fault windows and reconciliation behaviour.
// The component owns ONLY the setInterval; this file owns the physics.
import { SIM, type ReconMode, type SimIncident } from '@/data/liveLine';
import type { PrnState, SimEvent, TruthSample } from '@/data/types';

export const HISTORY_LEN = 120;

export interface LabelSimState {
  tick: number;
  running: boolean;
  reconMode: ReconMode;
  prnState: PrnState;
  faultCode: number;
  queue: number;          // cases waiting at the applicator
  printed: number;        // labels printed (incl. voided reprints) — truth
  applied: number;        // labels applied to cases — truth
  verifiedPass: number;
  verifiedFail: number;
  noReads: number;
  voided: number;
  grade: number;
  mesRecords: number;     // verify records received by the MES
  pendingRecords: number; // produced but not yet flushed (batch/pallet modes)
  dupExtraRecords: number;// duplicate-serial records awaiting reconciliation
  palletCount: number;    // verified cases on the current pallet
  pallets: number;
  contentMismatch: boolean;
  history: TruthSample[];
  events: SimEvent[];
}

export function initialState(reconMode: ReconMode = 'event'): LabelSimState {
  return {
    tick: 0,
    running: false,
    reconMode,
    prnState: 1,
    faultCode: 0,
    queue: 0,
    printed: 0,
    applied: 0,
    verifiedPass: 0,
    verifiedFail: 0,
    noReads: 0,
    voided: 0,
    grade: SIM.grade.base,
    mesRecords: 0,
    pendingRecords: 0,
    dupExtraRecords: 0,
    palletCount: 0,
    pallets: 0,
    contentMismatch: false,
    history: [],
    events: [],
  };
}

function activeIncident(lt: number): SimIncident | null {
  return SIM.script.find((s) => lt >= s.at && lt < s.at + s.dur) ?? null;
}

/** Pure next-state function. Two runs from the same state are identical. */
export function step(prev: LabelSimState): LabelSimState {
  const t = prev.tick + 1;
  const lt = t % SIM.loopTicks;
  const incident = activeIncident(lt);
  const prevIncident = activeIncident(prev.tick % SIM.loopTicks);

  const s: LabelSimState = { ...prev, tick: t, events: prev.events };
  const events: SimEvent[] = [];

  // Verifier grade: printhead wear across the loop + gentle ripple. Resets
  // each loop ("the night shift swapped the head").
  s.grade = Math.max(
    0,
    Math.min(4, SIM.grade.base - SIM.grade.wearPerTick * lt + SIM.grade.ripple * Math.sin(t / 11)),
  );

  const caseArrives = t % SIM.caseEveryTicks === 0;
  if (caseArrives) s.queue = prev.queue + 1;

  s.contentMismatch = incident?.kind === 'stale-template';
  const faulted = incident?.kind === 'ribbon-out';
  s.faultCode = faulted ? 6101 : incident?.kind === 'no-read-burst' ? 6210 : s.contentMismatch ? 6305 : 0;

  let outcome: 'ok' | 'reprint' | 'fault' | 'mismatch' | 'idle' = 'idle';

  if (faulted) {
    s.prnState = 3;
    outcome = 'fault';
  } else if (s.queue > 0) {
    // Print + apply one case this tick.
    s.prnState = 2;
    s.queue -= 1;
    s.applied = prev.applied + 1;

    const noRead = incident?.kind === 'no-read-burst';
    const gradeFail = s.grade < SIM.passMin;

    if (noRead || gradeFail) {
      // Void + reprint: two labels consumed for one case; reprint verifies OK.
      s.printed = prev.printed + 2;
      s.voided = prev.voided + 1;
      if (noRead) s.noReads = prev.noReads + 1;
      else s.verifiedFail = prev.verifiedFail + 1;
      s.verifiedPass = prev.verifiedPass + 1;
      s.pendingRecords = prev.pendingRecords + 1;
      s.palletCount = prev.palletCount + 1;
      outcome = 'reprint';
    } else {
      s.printed = prev.printed + 1;
      s.verifiedPass = prev.verifiedPass + 1;
      s.pendingRecords = prev.pendingRecords + 1;
      s.palletCount = prev.palletCount + 1;
      outcome = s.contentMismatch ? 'mismatch' : 'ok';
    }
  } else {
    s.prnState = 4;
    outcome = 'idle';
  }

  // Duplicate serial: a hand reprint creates a second verify record for the
  // same case — the MES sees one record too many until reconciliation voids it.
  if (incident?.kind === 'dup-serial' && prevIncident?.kind !== 'dup-serial') {
    s.printed += 1;
    s.pendingRecords += 1;
    s.dupExtraRecords = prev.dupExtraRecords + 1;
    events.push({ tick: t, severity: 'warn', text: `Duplicate serial ${SIM.caseSerialPrefix}${31 + s.pallets} — operator reprint created a second verify record (fault 6220)` });
  }

  // Pallet close.
  let palletClosed = false;
  if (s.palletCount >= SIM.palletCases) {
    s.palletCount = 0;
    s.pallets = prev.pallets + 1;
    palletClosed = true;
  }

  // Reconciliation: when do verify records reach the MES?
  const flush =
    s.reconMode === 'event' ||
    (s.reconMode === 'batch-15s' && t % SIM.batchTicks === 0) ||
    (s.reconMode === 'pallet-close' && palletClosed);
  if (flush && s.pendingRecords > 0) {
    s.mesRecords = prev.mesRecords + s.pendingRecords;
    if (s.reconMode !== 'event') {
      events.push({ tick: t, severity: 'info', text: `Reconciliation: ${s.pendingRecords} verify record(s) posted to the MES` });
    }
    s.pendingRecords = 0;
    // Reconciliation also clears duplicate-serial ghosts.
    if (s.dupExtraRecords > 0) {
      s.mesRecords -= s.dupExtraRecords;
      events.push({ tick: t, severity: 'info', text: `Reconciliation voided ${s.dupExtraRecords} duplicate record(s) — MES count matches applied labels again` });
      s.dupExtraRecords = 0;
    }
  }

  // Transition events (enter/exit incidents) — donor pattern.
  if (incident && incident.kind !== prevIncident?.kind) {
    const sev = incident.kind === 'ribbon-low' ? 'warn' : incident.kind === 'dup-serial' ? 'warn' : 'alert';
    const text =
      incident.kind === 'ribbon-low' ? 'SGD media.status: "ribbon low" — order a reel to the platform NOW and nothing stops (warning 6102 family)'
      : incident.kind === 'ribbon-out' ? 'Ribbon out on PRN-CP1 (fault 6101) — printing stops, cases queue at the applicator'
      : incident.kind === 'no-read-burst' ? 'SCAN-CP1 no-read burst (fault 6210) — labels voided and reprinted automatically'
      : incident.kind === 'stale-template' ? 'PRN-CP1 recalled stored template v13 (fault 6305) — labels grade A but carry WRONG content (purple cells)'
      : '';
    if (text && incident.kind !== 'dup-serial') events.push({ tick: t, severity: sev, text });
  }
  if (prevIncident && !incident && prevIncident.kind !== 'dup-serial') {
    const text =
      prevIncident.kind === 'ribbon-out' ? 'Ribbon replaced — PRN-CP1 back to Ready, queue draining'
      : prevIncident.kind === 'no-read-burst' ? 'Verifier reads recovered'
      : prevIncident.kind === 'stale-template' ? 'Template v14 re-pushed with CRC verify — content correct again'
      : prevIncident.kind === 'ribbon-low' ? 'Ribbon-low warning cleared'
      : '';
    if (text) events.push({ tick: t, severity: 'info', text });
  }
  if (palletClosed) {
    events.push({ tick: t, severity: 'info', text: `Pallet ${s.pallets} closed — ${SIM.palletCases} cases, SSCC assigned, ready for PRN-PZ1` });
  }

  if (events.length > 0) s.events = [...events.reverse(), ...prev.events].slice(0, 50);

  const sample: TruthSample = {
    tick: t,
    prnState: s.prnState,
    faultCode: s.faultCode,
    applied: s.applied,
    printed: s.printed,
    verifiedPass: s.verifiedPass,
    verifiedFail: s.verifiedFail,
    noReads: s.noReads,
    grade: s.grade,
    mesRecords: s.mesRecords,
    contentMismatch: s.contentMismatch,
  };
  s.history = [...prev.history, sample].slice(-HISTORY_LEN);
  // Attach the tick outcome for the truth strip (derived, stored on sample via
  // contentMismatch/faultCode/noReads — the strip recomputes from these).
  void outcome;
  return s;
}
