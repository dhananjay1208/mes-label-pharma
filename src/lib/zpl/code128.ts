// Code 128 / GS1-128 encoder — real, scannable output.
// Pure TS, vitest-covered (checksum + module-sum tests catch table typos).
//
// The width table is standard Code 128 reference data: values 0–106, each a
// bar/space width string (bar first). Values 0–105 sum to 11 modules; the
// STOP pattern (106) is 13 modules including the termination bar.

export const CODE128_WIDTHS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', // 0-7
  '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222', // 8-15
  '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131', // 16-23
  '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321', // 24-31
  '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 32-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', // 40-47
  '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321', // 48-55
  '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224', // 56-63
  '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114', // 64-71
  '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 72-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', // 80-87
  '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113', // 88-95
  '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412', // 96-103
  '211214', '211232',                                                             // 104-105 (Start B, Start C)
  '2331112',                                                                      // 106 STOP (13 modules)
];

export const CODE_B_SWITCH = 100;
export const CODE_C_SWITCH = 99;
export const FNC1 = 102;
export const START_B = 104;
export const START_C = 105;
export const STOP = 106;

type Item = { kind: 'fnc1' } | { kind: 'char'; c: string };

export interface Code128Result {
  values: number[];   // full symbol sequence incl. start, checksum, stop
  widths: string[];   // one width string per value
  human: string;      // human-readable line (FNC1s dropped)
  error?: string;
}

/** How many contiguous digit chars start at items[i]. */
function digitRun(items: Item[], i: number): number {
  let n = 0;
  while (i + n < items.length) {
    const it = items[i + n];
    if (it.kind !== 'char' || !/\d/.test(it.c)) break;
    n++;
  }
  return n;
}

function encodeItems(items: Item[]): Code128Result {
  const values: number[] = [];
  const human = items.map((it) => (it.kind === 'char' ? it.c : '')).join('');

  // Start subset: C when the payload opens with (FNC1 +) >= 4 digits.
  let j = 0;
  while (j < items.length && items[j].kind === 'fnc1') j++;
  let subset: 'B' | 'C' = digitRun(items, j) >= 4 ? 'C' : 'B';
  values.push(subset === 'C' ? START_C : START_B);

  let i = 0;
  while (i < items.length) {
    const it = items[i];
    if (it.kind === 'fnc1') {
      values.push(FNC1);
      i++;
      continue;
    }
    if (subset === 'C') {
      const run = digitRun(items, i);
      if (run >= 2) {
        const a = (items[i] as { c: string }).c;
        const b = (items[i + 1] as { c: string }).c;
        values.push(Number(a) * 10 + Number(b));
        i += 2;
        continue;
      }
      subset = 'B';
      values.push(CODE_B_SWITCH);
      continue;
    }
    // subset B
    const run = digitRun(items, i);
    if (run >= 4) {
      subset = 'C';
      values.push(CODE_C_SWITCH);
      continue;
    }
    const code = it.c.charCodeAt(0) - 32;
    if (code < 0 || code > 94) {
      return { values: [], widths: [], human, error: `Character "${it.c}" cannot be encoded in Code 128 subset B` };
    }
    values.push(code);
    i++;
  }

  // Checksum: start value + Σ position·value, mod 103.
  let sum = values[0];
  for (let p = 1; p < values.length; p++) sum += values[p] * p;
  values.push(sum % 103);
  values.push(STOP);

  return { values, widths: values.map((v) => CODE128_WIDTHS[v]), human };
}

/**
 * Encode a GS1 element string in paren form, e.g.
 * "(00)003591230800127456" or "(01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31".
 * FNC1 leads the symbol and separates variable-length AIs (10, 21, 37…)
 * from a following AI. Parens are presentation only — they are not encoded.
 */
export function encodeGs1_128(elementString: string): Code128Result {
  const VARIABLE_AIS = new Set(['10', '21', '37']);
  const items: Item[] = [{ kind: 'fnc1' }];
  const re = /\((\d{2,4})\)([^(]*)/g;
  const groups: { ai: string; value: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(elementString)) !== null) groups.push({ ai: m[1], value: m[2] });
  if (groups.length === 0) {
    // Not a GS1 element string — encode as plain Code 128 (no leading FNC1).
    return encodeItems(elementString.split('').map((c) => ({ kind: 'char', c })));
  }
  groups.forEach((g, idx) => {
    for (const c of g.ai + g.value) items.push({ kind: 'char', c });
    if (VARIABLE_AIS.has(g.ai) && idx < groups.length - 1) items.push({ kind: 'fnc1' });
  });
  return encodeItems(items);
}

/**
 * Encode the data of a ZPL ^FD field for a ^BC barcode.
 * Honours ZPL's invocation escapes by mapping them onto the auto-encoder:
 * ">8" → FNC1 · ">;" (subset C) and ">6" (subset B) are hints the auto
 * subset logic reproduces, so they are consumed and ignored.
 */
export function encodeZplFd(fd: string): Code128Result {
  const items: Item[] = [];
  let i = 0;
  while (i < fd.length) {
    if (fd[i] === '>' && i + 1 < fd.length) {
      const esc = fd[i + 1];
      if (esc === '8') items.push({ kind: 'fnc1' });
      // ';' ':' '6' '7' '5' are subset-control hints — consumed, auto-handled.
      i += 2;
      continue;
    }
    items.push({ kind: 'char', c: fd[i] });
    i++;
  }
  return encodeItems(items);
}
