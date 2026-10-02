import { describe, it, expect } from 'vitest';
import { gs1CheckDigit, validateSscc18, parseElementString } from '../gs1';
import { WORLD } from '@/data/world';

describe('gs1', () => {
  it('computes the canonical SSCC check digit (the worked example)', () => {
    // Payload 00359123080012745, weights 3/1 from the right:
    // weight-3 digits 5+7+1+0+0+2+9+3+0 = 27 → 81 · weight-1 digits 4+2+0+8+3+1+5+0 = 23
    // 81 + 23 = 104 → (10 - 4) mod 10 = 6
    expect(gs1CheckDigit('00359123080012745')).toBe(6);
  });

  it('validates the full canonical SSCC-18 and its parts', () => {
    const r = validateSscc18(WORLD.labels.ssccFull);
    expect(r.ok).toBe(true);
    expect(r.parts).toEqual({
      extension: '0',
      companyPrefix: '0359123',
      serialRef: '080012745',
      check: '6',
    });
    expect(validateSscc18('003591230800127457').ok).toBe(false);
    expect(validateSscc18('003591230800127').ok).toBe(false); // a 15-char display truncation is NOT a valid SSCC
  });

  it('validates the case and carton GTIN-14 check digits', () => {
    // Case 2035912300031 → 3×17 + 12 = 63 → 7 · Carton 0035912300010 → 3×14 + 10 = 52 → 8
    expect(gs1CheckDigit(WORLD.labels.caseGtin14.slice(0, 13))).toBe(Number(WORLD.labels.caseGtin14[13]));
    expect(gs1CheckDigit(WORLD.labels.cartonGtin14.slice(0, 13))).toBe(Number(WORLD.labels.cartonGtin14[13]));
  });

  it('parses the canonical case element string cleanly', () => {
    const parsed = parseElementString(WORLD.labels.caseElementString);
    expect(parsed.map((p) => p.ai)).toEqual(['01', '17', '10', '21']);
    expect(parsed.every((p) => !p.error)).toBe(true);
    expect(parsed[1].value).toBe('280630');
    expect(parsed[3].value).toBe('CS-2417-31');
  });

  it('parses the pallet element string incl. SSCC and count', () => {
    const parsed = parseElementString(WORLD.labels.palletElementString);
    expect(parsed.map((p) => p.ai)).toEqual(['00', '02', '37', '10']);
    expect(parsed.every((p) => !p.error)).toBe(true);
  });

  it('flags a non-GS1 blob (the missing-FNC1 lesson)', () => {
    const parsed = parseElementString('01203591230003171728063010B-CX-241721CS-2417-31');
    expect(parsed).toHaveLength(1);
    expect(parsed[0].error).toMatch(/No \(AI\) groups/);
  });

  it('flags the wrong-AI trap — and shows why (17)→(11) passes silently', () => {
    // A batch typed under (11) fails the date rules…
    const bad = parseElementString('(01)20359123000317(11)B-CX-2417');
    const badEleven = bad.find((p) => p.ai === '11');
    expect(badEleven?.label).toMatch(/Production date/);
    expect(badEleven?.error).toMatch(/exactly 6/); // B-CX-2417 is not a valid YYMMDD
    // …but the expiry typed under (11) is a perfectly valid date: no error anywhere.
    const quiet = parseElementString('(01)20359123000317(11)280630(10)B-CX-2417');
    const quietEleven = quiet.find((p) => p.ai === '11');
    expect(quietEleven?.label).toMatch(/Production date/);
    expect(quietEleven?.error).toBeUndefined();
  });
});
