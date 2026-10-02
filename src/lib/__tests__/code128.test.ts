import { describe, it, expect } from 'vitest';
import {
  CODE128_WIDTHS, encodeGs1_128, encodeZplFd, CODE_B_SWITCH, START_C, STOP, FNC1,
} from '../zpl/code128';
import { WORLD } from '@/data/world';

const moduleSum = (w: string) => w.split('').reduce((s, c) => s + Number(c), 0);

describe('code128', () => {
  it('has a structurally valid width table (catches transcription typos)', () => {
    expect(CODE128_WIDTHS).toHaveLength(107);
    for (let v = 0; v <= 105; v++) {
      expect(CODE128_WIDTHS[v], `value ${v}`).toMatch(/^\d{6}$/);
      expect(moduleSum(CODE128_WIDTHS[v]), `value ${v} modules`).toBe(11);
    }
    expect(CODE128_WIDTHS[106]).toMatch(/^\d{7}$/);
    expect(moduleSum(CODE128_WIDTHS[106])).toBe(13);
  });

  it('encodes the pallet SSCC exactly as the frozen vector', () => {
    const r = encodeGs1_128(`(00)${WORLD.labels.ssccFull}`);
    expect(r.error).toBeUndefined();
    // Frozen vector, re-derived by hand for the pharma SSCC 003591230800127456
    // (the canon SSCC differs from the golden master, so its frozen vector was replaced deliberately):
    //   Start C (105) · FNC1 (102) · digit pairs of "00" + "003591230800127456"
    //   = 00 00 35 91 23 08 00 12 74 56 → values 0 0 35 91 23 8 0 12 74 56
    //   checksum = 105 + Σ(position × value) for positions 1..11
    //            = 105 + 102·1 + 0·2 + 0·3 + 35·4 + 91·5 + 23·6 + 8·7 + 0·8 + 12·9 + 74·10 + 56·11
    //            = 105 + 102 + 0 + 0 + 140 + 455 + 138 + 56 + 0 + 108 + 740 + 616 = 2460
    //   2460 mod 103 = 2460 − 103·23 (= 2369) = 91 → check symbol 91 · Stop (106)
    expect(r.values).toEqual([105, 102, 0, 0, 35, 91, 23, 8, 0, 12, 74, 56, 91, 106]);
    expect(r.human).toBe('00003591230800127456');
  });

  it('auto-switches subsets for the mixed case label and stays valid', () => {
    const r = encodeGs1_128(WORLD.labels.caseElementString);
    expect(r.error).toBeUndefined();
    expect(r.values[0]).toBe(START_C);
    expect(r.values[1]).toBe(FNC1);
    expect(r.values).toContain(CODE_B_SWITCH); // 'B-CX-…' forces subset B
    expect(r.values[r.values.length - 1]).toBe(STOP);
    // Verify the checksum symbol independently.
    const body = r.values.slice(0, -2);
    let sum = body[0];
    for (let p = 1; p < body.length; p++) sum += body[p] * p;
    expect(r.values[r.values.length - 2]).toBe(sum % 103);
    // Every emitted width string is a real table entry.
    expect(r.widths.every((w, i) => (r.values[i] === STOP ? moduleSum(w) === 13 : moduleSum(w) === 11))).toBe(true);
  });

  it('encodes ZPL ^FD data with subset escapes (>; >8 >6)', () => {
    const r = encodeZplFd('>;>801203591230003171728063010>6B-CX-2417>821CS-2417-31');
    expect(r.error).toBeUndefined();
    expect(r.human).toBe('01203591230003171728063010B-CX-2417' + '21CS-2417-31');
    expect(r.values[0]).toBe(START_C);
    expect(r.values.filter((v) => v === FNC1)).toHaveLength(2);
  });
});
