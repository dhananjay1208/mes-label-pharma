import { describe, it, expect } from 'vitest';
import { initialState, step, type LabelSimState } from '../labelLineSim';
import { SIM } from '@/data/liveLine';

function run(ticks: number, mode: Parameters<typeof initialState>[0] = 'event'): LabelSimState[] {
  const states: LabelSimState[] = [];
  let s = initialState(mode);
  for (let i = 0; i < ticks; i++) {
    s = step(s);
    states.push(s);
  }
  return states;
}

describe('labelLineSim', () => {
  it('is deterministic — two full loops are identical', () => {
    const a = run(240);
    const b = run(240);
    expect(a[239]).toEqual(b[239]);
    expect(a.map((s) => s.grade)).toEqual(b.map((s) => s.grade));
  });

  it('faults with 6101 during the ribbon-out window', () => {
    const states = run(70);
    const at60 = states[59]; // tick 60, inside 52..64
    expect(at60.prnState).toBe(3);
    expect(at60.faultCode).toBe(6101);
    // Cases queue up while the printer is down.
    expect(at60.queue).toBeGreaterThan(0);
  });

  it('reprints on no-reads: printed pulls ahead of applied', () => {
    const states = run(120);
    const end = states[119];
    expect(end.noReads).toBeGreaterThan(0);
    expect(end.printed).toBeGreaterThan(end.applied);
    // Before the duplicate-serial incident (tick 133), every extra print is a void+reprint.
    expect(end.printed - end.applied).toBe(end.voided);
  });

  it('flags content mismatch ONLY inside the stale-template window', () => {
    const states = run(240);
    for (const s of states) {
      const lt = s.tick % 240;
      const inWindow = lt >= 168 && lt < 202;
      expect(s.contentMismatch, `tick ${s.tick}`).toBe(inWindow);
    }
  });

  it('never lets the MES know more than the verifier passed (batch mode)', () => {
    const states = run(240, 'batch-15s');
    for (const s of states) {
      expect(s.mesRecords, `tick ${s.tick}`).toBeLessThanOrEqual(s.verifiedPass);
    }
    // And it genuinely lags between flushes.
    const lagging = states.some((s) => s.mesRecords < s.verifiedPass);
    expect(lagging).toBe(true);
  });

  it('event mode reconciles every tick (dup ghost cancelled immediately)', () => {
    const states = run(240, 'event');
    for (const s of states) {
      expect(s.mesRecords, `tick ${s.tick}`).toBe(s.verifiedPass);
      expect(s.dupExtraRecords).toBe(0);
    }
  });

  it('closes a 48-case pallet within one 240-tick loop (canon: 48 cases/pallet)', () => {
    expect(SIM.palletCases).toBe(48);
    const end = run(240)[239];
    expect(end.pallets).toBeGreaterThanOrEqual(1);
    expect(end.events.some((e) => /Pallet 1 closed — 48 cases/.test(e.text))).toBe(true);
  });
});
