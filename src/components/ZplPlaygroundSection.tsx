import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Wand2, Bug, Calculator, CheckCircle2, XCircle } from 'lucide-react';
import { ZPL_PRESETS, BREAK_IT_PROMPTS, PLAYGROUND_INTRO, CHECKDIGIT_WIDGET } from '@/data/zplPresets';
import { tokenize, substitute } from '@/lib/zpl/tokenizer';
import { render } from '@/lib/zpl/renderer';
import { parseElementString, gs1CheckDigit } from '@/lib/gs1';
import LabelPreview from './LabelPreview';

interface ZplPlaygroundSectionProps {
  onNext: () => void;
  onPrev: () => void;
}

const ZplPlaygroundSection = ({ onNext, onPrev }: ZplPlaygroundSectionProps) => {
  const preset0 = ZPL_PRESETS[0];
  const [presetId, setPresetId] = useState(preset0.id);
  const [zpl, setZpl] = useState(preset0.zpl);
  const [vars, setVars] = useState<Record<string, string>>(
    Object.fromEntries(preset0.variables.map((v) => [v.key, v.value])),
  );
  const [openBreak, setOpenBreak] = useState<string | null>(null);
  const [cdInput, setCdInput] = useState(CHECKDIGIT_WIDGET.example);

  const activePreset = ZPL_PRESETS.find((p) => p.id === presetId) ?? preset0;

  const loadPreset = (id: string) => {
    const p = ZPL_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setZpl(p.zpl);
    setVars(Object.fromEntries(p.variables.map((v) => [v.key, v.value])));
    setOpenBreak(null);
  };

  const merged = useMemo(() => substitute(zpl, vars), [zpl, vars]);
  const tokenized = useMemo(() => tokenize(merged), [merged]);
  const model = useMemo(() => render(tokenized.commands), [tokenized]);

  // The GS1 panel parses the human-readable element string on the label —
  // the same read a scanner's decode would hand to downstream systems.
  const elementText = useMemo(() => {
    const texts = model.elements.filter((e) => e.kind === 'text') as { text: string }[];
    const paren = texts.find((t) => t.text.trim().startsWith('('));
    if (paren) return paren.text.trim();
    const bare = texts.find((t) => /^\d{20,}/.test(t.text.trim()));
    return bare ? bare.text.trim() : null;
  }, [model]);
  const gs1Parsed = useMemo(() => (elementText ? parseElementString(elementText) : []), [elementText]);

  // Check-digit widget arithmetic (shown, not just computed).
  const cdDigits = cdInput.replace(/\D/g, '');
  const cdValid = cdDigits.length >= 7 && cdDigits.length <= 17;
  const cdW3 = cdDigits.split('').reverse().filter((_, i) => i % 2 === 0).reduce((s, d) => s + Number(d), 0);
  const cdW1 = cdDigits.split('').reverse().filter((_, i) => i % 2 === 1).reduce((s, d) => s + Number(d), 0);
  const cdCheck = cdValid ? gs1CheckDigit(cdDigits) : null;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">Section 5</Badge>
        <h2 className="text-3xl font-bold text-slate-900">ZPL Playground</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">{PLAYGROUND_INTRO.body}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left column — editor & exercises */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">The ZPL</CardTitle>
              <CardDescription>What your MES streams to tcp://prn-cp1.hp2.local:9100 — edit it live</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {ZPL_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadPreset(p.id)}
                    className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                      presetId === p.id
                        ? 'bg-leaf-700 text-white border-leaf-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <Textarea
                value={zpl}
                onChange={(e) => setZpl(e.target.value)}
                spellCheck={false}
                className="font-mono text-xs min-h-[300px] leading-relaxed"
              />
              <p className="text-xs text-slate-500">{activePreset.note}</p>
              {tokenized.unsupported.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  Not rendered by this playground (real printers support them): {tokenized.unsupported.map((u) => `^${u}`).join(' · ')}
                </p>
              )}
            </CardContent>
          </Card>

          {activePreset.variables.length > 0 && (
            <Card className="border-leaf-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Wand2 className="h-5 w-5 text-leaf-700" />
                  <span>MES Fields — the Merge</span>
                </CardTitle>
                <CardDescription>
                  The ${'{'}VAR{'}'} placeholders above are the template; these fields are the variable data. The MES does this merge for every case.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                {activePreset.variables.map((v) => (
                  <div key={v.key}>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      {v.label} <span className="font-mono text-slate-400">${'{'}{v.key}{'}'}</span>
                    </label>
                    <Input
                      value={vars[v.key] ?? ''}
                      onChange={(e) => setVars((prev) => ({ ...prev, [v.key]: e.target.value }))}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-tobacco-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Bug className="h-5 w-5 text-tobacco-600" />
                <span>Break It — Three Guided Failures</span>
              </CardTitle>
              <CardDescription>Each one is a real integration bug. Apply it, watch the preview and the GS1 panel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {BREAK_IT_PROMPTS.map((b) => (
                <div key={b.id} className="rounded border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-900">{b.title}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setZpl(b.brokenZpl);
                        setPresetId('broken');
                        setOpenBreak(b.id);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-slate-600">{b.prompt}</p>
                  {openBreak === b.id && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                        <span className="font-semibold">Symptom: </span>{b.symptom}
                      </p>
                      <p className="text-xs text-leaf-800 bg-leaf-50 border border-leaf-200 rounded px-2 py-1.5">
                        <span className="font-semibold">Lesson: </span>{b.lesson}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column — preview & analysis */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Label Preview</CardTitle>
              <CardDescription>{model.width}×{model.height} dots at 203 dpi (case label 6×4" landscape, pallet 4×6" portrait), rendered at half scale — the Code 128 bars are real and scannable</CardDescription>
            </CardHeader>
            <CardContent>
              <LabelPreview model={model} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">What a Scanner Reads — GS1 Parse</CardTitle>
              <CardDescription>The human-readable element string on the label, decoded the way downstream systems will believe it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {!elementText && (
                <p className="text-sm text-slate-500">No element string found on this label — add a human-readable line like (01)…(10)…(21)…</p>
              )}
              {elementText && (
                <p className="font-mono text-xs bg-slate-50 border rounded px-2 py-1.5 break-all">{elementText}</p>
              )}
              {gs1Parsed.map((p, i) => (
                <div
                  key={`${p.ai}-${i}`}
                  className={`flex items-start gap-2 rounded border px-2 py-1.5 text-xs ${
                    p.error ? 'bg-red-50 border-red-200' : 'bg-leaf-50 border-leaf-200'
                  }`}
                >
                  {p.error
                    ? <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                    : <CheckCircle2 className="h-3.5 w-3.5 text-leaf-700 shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-mono font-semibold">({p.ai})</span>{' '}
                    <span className="font-semibold">{p.label}</span>
                    {' = '}<span className="font-mono">{p.value}</span>
                    {p.error && <div className="text-red-700 mt-0.5">{p.error}</div>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Calculator className="h-5 w-5 text-slate-700" />
                <span>{CHECKDIGIT_WIDGET.heading}</span>
              </CardTitle>
              <CardDescription>{CHECKDIGIT_WIDGET.body}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={cdInput}
                onChange={(e) => setCdInput(e.target.value)}
                className="font-mono text-sm"
                placeholder="17-digit SSCC payload or 13-digit GTIN payload"
              />
              {cdValid && cdCheck !== null && (
                <div className="text-sm space-y-1">
                  <p className="font-mono text-xs text-slate-600">
                    weight-3 digits sum = {cdW3} → ×3 = {cdW3 * 3} · weight-1 digits sum = {cdW1}
                  </p>
                  <p className="font-mono text-xs text-slate-600">
                    total {cdW3 * 3 + cdW1} → next multiple of 10 needs{' '}
                    <span className="font-bold text-leaf-800 text-base">check digit {cdCheck}</span>
                  </p>
                  <p className="font-mono text-xs bg-white border rounded px-2 py-1 inline-block">
                    full code: {cdDigits}<span className="font-bold text-leaf-800">{cdCheck}</span>
                  </p>
                </div>
              )}
              {!cdValid && <p className="text-xs text-slate-500">Enter 7–17 digits.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Tools &amp; Technology
        </Button>
        <Button onClick={onNext} size="lg" className="bg-leaf-700 hover:bg-leaf-800">
          The Live Label Line
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ZplPlaygroundSection;
