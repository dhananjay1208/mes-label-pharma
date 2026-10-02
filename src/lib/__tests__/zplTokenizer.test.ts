import { describe, it, expect } from 'vitest';
import { tokenize, substitute } from '../zpl/tokenizer';
import { render } from '../zpl/renderer';

const CASE_ZPL = `^XA
^CI28^PW1218^LL812
^FO40,40^GB1138,120,3^FS
^FO60,60^A0N,36,36^FDHELVION PHARMA - PLANT 2 LAKEWORTH^FS
^FO60,240^A0N,28,28^FDBATCH: \${BATCH}   CASE: \${SERIAL}^FS
^BY2,3,160
^FO60,300^BCN,160,Y,N,N^FD>;>801203591230003171728063010>6B-CX-2417>821CS-2417-31^FS
^XZ`;

describe('zpl tokenizer + renderer', () => {
  it('tokenizes the case label into the expected command stream', () => {
    const { commands, unsupported } = tokenize(substitute(CASE_ZPL, { BATCH: 'B-CX-2417', SERIAL: 'CS-2417-31' }));
    expect(unsupported).toEqual([]);
    const cmds = commands.map((c) => c.cmd);
    expect(cmds).toEqual(['XA', 'CI', 'PW', 'LL', 'FO', 'GB', 'FS', 'FO', 'A0', 'FD', 'FS', 'FO', 'A0', 'FD', 'FS', 'BY', 'FO', 'BC', 'FD', 'FS', 'XZ']);
    const fd = commands.filter((c) => c.cmd === 'FD');
    expect(fd[1].params[0]).toBe('BATCH: B-CX-2417   CASE: CS-2417-31');
  });

  it('leaves unknown ${VARS} in place so the gap is visible', () => {
    expect(substitute('^FD${NOPE}^FS', { BATCH: 'x' })).toBe('^FD${NOPE}^FS');
  });

  it('collects unsupported commands honestly', () => {
    const { unsupported } = tokenize('^XA^FB400,2^FDwrapped^FS^XZ');
    expect(unsupported).toEqual(['FB']);
  });

  it('renders text, box and a real barcode element on the landscape case canvas', () => {
    const model = render(tokenize(substitute(CASE_ZPL, { BATCH: 'B-CX-2417', SERIAL: 'CS-2417-31' })).commands);
    expect(model.width).toBe(1218);
    expect(model.height).toBe(812);
    const kinds = model.elements.map((e) => e.kind);
    expect(kinds).toContain('box');
    expect(kinds).toContain('text');
    expect(kinds).toContain('barcode128');
    const bc = model.elements.find((e) => e.kind === 'barcode128');
    expect(bc && bc.kind === 'barcode128' && bc.code.values.length).toBeGreaterThan(10);
    expect(bc && bc.kind === 'barcode128' && bc.moduleWidth).toBe(2);
    // Four AIs at ^BY2 must fit inside the 1218-dot landscape canvas from x = 60.
    const modules = bc && bc.kind === 'barcode128'
      ? bc.code.widths.reduce((s, w) => s + w.split('').reduce((a, c) => a + Number(c), 0), 0)
      : 0;
    expect(60 + modules * 2).toBeLessThanOrEqual(1218);
  });
});
