// GS1 helpers — check digits and Application Identifier parsing.
// Pure TS, vitest-covered. Used by the playground, the flows and the tests.

/** GS1 mod-10 check digit: weight 3 on the rightmost payload digit, alternating. */
export function gs1CheckDigit(payload: string): number {
  if (!/^\d+$/.test(payload)) return NaN;
  let sum = 0;
  const digits = payload.split('').reverse();
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i]);
    sum += d * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}

export interface Sscc18Parts {
  extension: string;
  companyPrefix: string;
  serialRef: string;
  check: string;
}

/** Validate an 18-digit SSCC (extension + 7-digit GS1 company prefix + 9-digit serial ref + check). */
export function validateSscc18(s: string): { ok: boolean; error?: string; parts?: Sscc18Parts } {
  if (!/^\d{18}$/.test(s)) return { ok: false, error: 'An SSCC is exactly 18 digits' };
  const check = gs1CheckDigit(s.slice(0, 17));
  if (check !== Number(s[17])) {
    return { ok: false, error: `Check digit should be ${check}, found ${s[17]}` };
  }
  return {
    ok: true,
    parts: {
      extension: s[0],
      companyPrefix: s.slice(1, 8),
      serialRef: s.slice(8, 17),
      check: s[17],
    },
  };
}

export interface AiSpec {
  ai: string;
  label: string;
  fixedLength?: number; // length of the VALUE (not counting the AI digits)
  numeric: boolean;
  hasCheckDigit?: boolean;
}

// The subset of Application Identifiers this workshop teaches.
export const AI_TABLE: AiSpec[] = [
  { ai: '00', label: 'SSCC (Serial Shipping Container Code)', fixedLength: 18, numeric: true, hasCheckDigit: true },
  { ai: '01', label: 'GTIN of trade item', fixedLength: 14, numeric: true, hasCheckDigit: true },
  { ai: '02', label: 'GTIN of contained trade items', fixedLength: 14, numeric: true, hasCheckDigit: true },
  { ai: '10', label: 'Batch / lot number', numeric: false },
  { ai: '11', label: 'Production date (YYMMDD)', fixedLength: 6, numeric: true },
  { ai: '17', label: 'Expiration date (YYMMDD)', fixedLength: 6, numeric: true },
  { ai: '21', label: 'Serial number', numeric: false },
  { ai: '37', label: 'Count of contained trade items', numeric: true },
];

export interface ParsedAi {
  ai: string;
  label: string;
  value: string;
  error?: string;
}

/**
 * Parse a human-readable GS1 element string in paren form, e.g.
 * "(01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31".
 * Returns one entry per AI, with per-entry errors (unknown AI, wrong fixed
 * length, failed check digit) — never throws; broken input is a lesson.
 */
export function parseElementString(s: string): ParsedAi[] {
  const out: ParsedAi[] = [];
  const re = /\((\d{2,4})\)([^(]*)/g;
  let match: RegExpExecArray | null;
  let any = false;
  while ((match = re.exec(s)) !== null) {
    any = true;
    const [, ai, value] = match;
    const spec = AI_TABLE.find((a) => a.ai === ai);
    if (!spec) {
      out.push({ ai, label: 'Unknown AI', value, error: `AI (${ai}) is not in this workshop's table — a scanner would still decode it, and a downstream system would misinterpret the value.` });
      continue;
    }
    const entry: ParsedAi = { ai, label: spec.label, value };
    if (spec.fixedLength != null && value.length !== spec.fixedLength) {
      entry.error = `${spec.label} must be exactly ${spec.fixedLength} characters — found ${value.length}`;
    } else if (spec.numeric && !/^\d+$/.test(value)) {
      entry.error = `${spec.label} must be numeric`;
    } else if (spec.hasCheckDigit) {
      const check = gs1CheckDigit(value.slice(0, -1));
      if (check !== Number(value[value.length - 1])) {
        entry.error = `Check digit should be ${check}, found ${value[value.length - 1]}`;
      }
    }
    out.push(entry);
  }
  if (!any && s.trim().length > 0) {
    out.push({ ai: '—', label: 'Not a GS1 element string', value: s.trim(), error: 'No (AI) groups found — without FNC1 separators and AI structure a scanner reads one opaque blob.' });
  }
  return out;
}
