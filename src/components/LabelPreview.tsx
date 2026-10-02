import type { LabelModel, LabelElement } from '@/lib/zpl/renderer';

// SVG rendering of a parsed ZPL label at 0.5 scale (dots → px/2).
// Code 128 bars are real (from the encoder); DataMatrix is an illustrative
// placeholder pattern, clearly labeled.

const SCALE = 0.5;

const BarcodeBars = ({ el }: { el: Extract<LabelElement, { kind: 'barcode128' }> }) => {
  const bars: JSX.Element[] = [];
  let x = el.x;
  el.code.widths.forEach((widthStr, symbolIdx) => {
    let isBar = true;
    for (const ch of widthStr) {
      const w = Number(ch) * el.moduleWidth;
      if (isBar) {
        bars.push(
          <rect
            key={`${symbolIdx}-${x}`}
            x={x * SCALE}
            y={el.y * SCALE}
            width={w * SCALE}
            height={el.height * SCALE}
            fill="#111"
          />,
        );
      }
      x += w;
      isBar = !isBar;
    }
  });
  const totalWidth = x - el.x;
  return (
    <>
      {bars}
      {el.printHuman && (
        <text
          x={(el.x + totalWidth / 2) * SCALE}
          y={(el.y + el.height + 28) * SCALE}
          textAnchor="middle"
          fontSize={22 * SCALE}
          fontFamily="ui-monospace, monospace"
          fill="#111"
        >
          {el.code.human}
        </text>
      )}
    </>
  );
};

const MatrixPlaceholder = ({ el }: { el: Extract<LabelElement, { kind: 'datamatrix' }> }) => {
  const cells = 16;
  const cell = el.size / cells;
  const charSum = el.data.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const rects: JSX.Element[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const finder = c === 0 || r === cells - 1 || (r === 0 && c % 2 === 0) || (c === cells - 1 && r % 2 === 0);
      const filled = finder || (charSum + r * 31 + c * 17) % 3 === 0;
      if (filled) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={(el.x + c * cell) * SCALE}
            y={(el.y + r * cell) * SCALE}
            width={cell * SCALE + 0.5}
            height={cell * SCALE + 0.5}
            fill="#111"
          />,
        );
      }
    }
  }
  return <>{rects}</>;
};

const LabelPreview = ({ model }: { model: LabelModel }) => {
  return (
    <div className="space-y-2">
      <div className="inline-block rounded border-2 border-slate-300 bg-white shadow-sm">
        <svg
          width={model.width * SCALE}
          height={model.height * SCALE}
          viewBox={`0 0 ${model.width * SCALE} ${model.height * SCALE}`}
          className="max-w-full h-auto"
        >
          {model.elements.map((el, i) => {
            switch (el.kind) {
              case 'box':
                return (
                  <rect
                    key={i}
                    x={el.x * SCALE}
                    y={el.y * SCALE}
                    width={el.w * SCALE}
                    height={el.h * SCALE}
                    fill="none"
                    stroke="#111"
                    strokeWidth={el.thickness * SCALE}
                  />
                );
              case 'text':
                return (
                  <text
                    key={i}
                    x={el.x * SCALE}
                    y={(el.y + el.fontH) * SCALE}
                    fontSize={el.fontH * SCALE}
                    fontFamily="Arial, Helvetica, sans-serif"
                    fontWeight={600}
                    fill="#111"
                  >
                    {el.text}
                  </text>
                );
              case 'barcode128':
                return <BarcodeBars key={i} el={el} />;
              case 'datamatrix':
                return <MatrixPlaceholder key={i} el={el} />;
              default:
                return null;
            }
          })}
        </svg>
      </div>
      {model.storedFormat && (
        <p className="text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded px-2 py-1 inline-block">
          ^DF template store → {model.storedFormat} (nothing prints; the layout is being saved to printer flash)
        </p>
      )}
      {model.recalledFormat && (
        <p className="text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded px-2 py-1 inline-block">
          ^XF recall of {model.recalledFormat} — ‹FN#› chips mark the merge slots the stored layout fills
        </p>
      )}
      {model.warnings.map((w) => (
        <p key={w} className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">{w}</p>
      ))}
    </div>
  );
};

export default LabelPreview;
