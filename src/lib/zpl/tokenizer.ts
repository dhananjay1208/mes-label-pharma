// A deliberately small ZPL tokenizer — enough for the workshop presets.
// Supported: ^XA ^XZ ^FO ^FS ^FD ^FN ^CF ^A0 ^BY ^BC ^BX ^GB ^PW ^LL ^CI ^DF ^XF
// Everything else is collected in `unsupported` and surfaced honestly in the
// preview ("this playground renders a subset of ZPL"). ^FB is a declared
// non-goal. Pure TS, vitest-covered.

export interface ZplCommand {
  cmd: string;      // 'FO', 'FD', 'A0', …
  params: string[]; // comma-split, except FD/FN/DF/XF where [0] is the raw rest
  raw: string;      // the full source chunk incl. the caret
}

export interface TokenizeResult {
  commands: ZplCommand[];
  unsupported: string[]; // unique unknown command mnemonics, in order seen
}

const KNOWN = new Set([
  'XA', 'XZ', 'FO', 'FS', 'FD', 'FN', 'CF', 'A0', 'BY', 'BC', 'BX', 'GB',
  'PW', 'LL', 'CI', 'DF', 'XF',
]);

// Commands whose payload is raw text (not comma parameters).
const RAW_PAYLOAD = new Set(['FD', 'DF', 'XF']);

/** Replace ${VAR} placeholders with values (the MES merge step, made visible). */
export function substitute(zpl: string, vars: Record<string, string>): string {
  return zpl.replace(/\$\{([A-Z0-9_]+)\}/g, (whole, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : whole,
  );
}

export function tokenize(zpl: string): TokenizeResult {
  const commands: ZplCommand[] = [];
  const unsupported: string[] = [];

  // Split into chunks that each start with ^ or ~ (leading text is ignored —
  // real printers do the same outside a format).
  const chunks = zpl.split(/(?=[\^~])/g);
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed.startsWith('^') && !trimmed.startsWith('~')) continue;
    const body = trimmed.slice(1);
    if (body.length < 2) continue;
    const cmd = body.slice(0, 2).toUpperCase();
    const rest = body.slice(2).replace(/\r?\n/g, '');
    if (!KNOWN.has(cmd)) {
      if (!unsupported.includes(cmd)) unsupported.push(cmd);
      continue;
    }
    const params = RAW_PAYLOAD.has(cmd)
      ? [rest]
      : rest.length > 0
        ? rest.split(',').map((p) => p.trim())
        : [];
    commands.push({ cmd, params, raw: trimmed });
  }
  return { commands, unsupported };
}
