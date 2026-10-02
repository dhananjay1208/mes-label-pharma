// Walks tokenized ZPL into a renderable label model. The canvas is measured
// in printer dots (default 812 × 1218 ≈ 4 × 6" at 203 dpi); LabelPreview
// renders the model as SVG at 0.5 scale. Pure TS, deterministic.
import type { ZplCommand } from './tokenizer';
import { encodeZplFd, type Code128Result } from './code128';

export interface TextElement {
  kind: 'text';
  x: number; y: number;
  text: string;
  fontH: number; fontW: number;
}

export interface BoxElement {
  kind: 'box';
  x: number; y: number;
  w: number; h: number; thickness: number;
}

export interface Barcode128Element {
  kind: 'barcode128';
  x: number; y: number;
  height: number;
  moduleWidth: number;
  printHuman: boolean;
  code: Code128Result;
}

export interface DataMatrixElement {
  kind: 'datamatrix';
  x: number; y: number;
  size: number;      // rendered square size in dots
  data: string;      // illustrative only — NOT a real DataMatrix encode
}

export type LabelElement = TextElement | BoxElement | Barcode128Element | DataMatrixElement;

export interface LabelModel {
  width: number;
  height: number;
  elements: LabelElement[];
  storedFormat: string | null; // ^DF target, when the ZPL is a template store
  recalledFormat: string | null; // ^XF target
  warnings: string[];
}

export function render(commands: ZplCommand[]): LabelModel {
  const model: LabelModel = {
    width: 812,
    height: 1218,
    elements: [],
    storedFormat: null,
    recalledFormat: null,
    warnings: [],
  };

  let x = 0;
  let y = 0;
  let fontH = 24;
  let fontW = 24;
  let byModule = 2;
  let byHeight = 100;
  let pendingBarcode: { height: number; printHuman: boolean } | null = null;
  let pendingMatrix: { size: number } | null = null;

  const num = (v: string | undefined, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) && v !== undefined && v !== '' ? n : fallback;
  };

  for (const c of commands) {
    switch (c.cmd) {
      case 'XA': case 'XZ': case 'CI': case 'FS':
        if (c.cmd === 'FS') { pendingBarcode = null; pendingMatrix = null; }
        break;
      case 'PW': model.width = num(c.params[0], model.width); break;
      case 'LL': model.height = num(c.params[0], model.height); break;
      case 'FO':
        x = num(c.params[0], 0);
        y = num(c.params[1], 0);
        break;
      case 'CF':
        fontH = num(c.params[1], fontH);
        fontW = num(c.params[2], fontH);
        break;
      case 'A0':
        // ^A0N,h,w — params[0] is orientation (N only in this subset)
        fontH = num(c.params[1], fontH);
        fontW = num(c.params[2], fontH);
        break;
      case 'BY':
        byModule = num(c.params[0], byModule);
        byHeight = num(c.params[2], byHeight);
        break;
      case 'BC':
        // ^BCo,h,f,g,e — orientation, height, print human readable
        pendingBarcode = {
          height: num(c.params[1], byHeight),
          printHuman: (c.params[2] ?? 'Y').toUpperCase() !== 'N',
        };
        break;
      case 'BX':
        // ^BXo,h,s — rendered as an illustrative matrix, not a real encode
        pendingMatrix = { size: Math.max(80, num(c.params[1], 10) * 16) };
        break;
      case 'GB':
        model.elements.push({
          kind: 'box', x, y,
          w: num(c.params[0], 100), h: num(c.params[1], 100),
          thickness: num(c.params[2], 1),
        });
        break;
      case 'DF': model.storedFormat = c.params[0] ?? null; break;
      case 'XF': model.recalledFormat = c.params[0] ?? null; break;
      case 'FN':
        // Numbered template field — rendered as a placeholder chip.
        model.elements.push({ kind: 'text', x, y, text: `‹FN${c.params[0] ?? '?'}›`, fontH, fontW });
        break;
      case 'FD': {
        const data = c.params[0] ?? '';
        if (pendingBarcode) {
          const code = encodeZplFd(data);
          if (code.error) model.warnings.push(code.error);
          model.elements.push({
            kind: 'barcode128', x, y,
            height: pendingBarcode.height,
            moduleWidth: byModule,
            printHuman: pendingBarcode.printHuman,
            code,
          });
          pendingBarcode = null;
        } else if (pendingMatrix) {
          model.elements.push({ kind: 'datamatrix', x, y, size: pendingMatrix.size, data });
          pendingMatrix = null;
        } else {
          model.elements.push({ kind: 'text', x, y, text: data, fontH, fontW });
        }
        break;
      }
    }
  }
  return model;
}
