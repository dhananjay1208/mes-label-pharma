import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Play, Pause, RotateCcw, Activity, Printer, ScanBarcode } from 'lucide-react';
import { SIM, STATE_LABELS, TRUTH_CELLS, LIVE_BENEFIT_TILES, LIVE_CALLOUT, type ReconMode } from '@/data/liveLine';
import { initialState, step, HISTORY_LEN, type LabelSimState } from '@/lib/labelLineSim';

interface LiveLineSectionProps {
  onNext: () => void;
  onPrev: () => void;
}

const fmtClock = (tick: number) => {
  const m = Math.floor(tick / 60);
  const s = tick % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const RECON_LABELS: Record<ReconMode, string> = {
  event: 'Event (per label)',
  'batch-15s': 'Batch (15 s)',
  'pallet-close': 'Pallet close',
};

const LiveLineSection = ({ onNext, onPrev }: LiveLineSectionProps) => {
  const [sim, setSim] = useState<LabelSimState>(() => initialState('event'));

  // The component owns ONLY this interval — physics live in lib/labelLineSim.
  useEffect(() => {
    if (!sim.running) return;
    const id = setInterval(() => setSim(step), SIM.tickMs);
    return () => clearInterval(id);
  }, [sim.running]);

  const strip = sim.history.slice(-HISTORY_LEN);

  // Truth cells: what physically happened each tick.
  const truthCellClass = (i: number): string => {
    const h = strip[i];
    const prev = i > 0 ? strip[i - 1] : undefined;
    if (h.prnState === 3) return TRUTH_CELLS.fault;
    const appliedTick = prev ? h.applied > prev.applied : h.applied > 0;
    if (!appliedTick) return TRUTH_CELLS.idle;
    const reprintTick = prev ? h.noReads + h.verifiedFail > prev.noReads + prev.verifiedFail : false;
    if (reprintTick) return TRUTH_CELLS.reprint;
    if (h.contentMismatch) return TRUTH_CELLS.mismatch;
    return TRUTH_CELLS.ok;
  };

  // MES cells: did a verify record actually reach the MES this tick?
  const mesCellClass = (i: number): string => {
    const h = strip[i];
    const prev = i > 0 ? strip[i - 1] : undefined;
    const gained = prev ? h.mesRecords > prev.mesRecords : h.mesRecords > 0;
    return gained ? 'bg-leaf-600' : 'bg-gray-200';
  };

  // Grade sparkline with the B (2.5) and C (1.5) policy thresholds.
  const gradePoints = strip
    .map((h, i) => {
      const x = (i / Math.max(1, HISTORY_LEN - 1)) * 300;
      const y = 40 - (h.grade / 4) * 40;
      return `${x.toFixed(1)},${Math.min(40, Math.max(0, y)).toFixed(1)}`;
    })
    .join(' ');

  const prnChip = STATE_LABELS[sim.prnState];
  const gradeLetter = sim.grade >= 3.5 ? 'A' : sim.grade >= 2.5 ? 'B' : sim.grade >= 1.5 ? 'C' : sim.grade >= 0.5 ? 'D' : 'F';

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">Section 6</Badge>
        <h2 className="text-3xl font-bold text-slate-900">The Live Label Line</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          PRN-CP1 print &amp; apply → SCAN-CP1 verify, tick by tick — watch what the station does and what your MES records.
          Time-compressed: a case every {SIM.caseEveryTicks} s (the real CP1 closes one case a minute), a {SIM.palletCases}-case pallet per loop.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              {!sim.running ? (
                <Button onClick={() => setSim((s) => ({ ...s, running: true }))} className="bg-leaf-700 hover:bg-leaf-800">
                  <Play className="h-4 w-4 mr-2" /> Start Station
                </Button>
              ) : (
                <Button onClick={() => setSim((s) => ({ ...s, running: false }))} variant="outline">
                  <Pause className="h-4 w-4 mr-2" /> Pause
                </Button>
              )}
              <Button onClick={() => setSim((s) => initialState(s.reconMode))} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">Verify reconciliation:</span>
              {SIM.reconOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => setSim((s) => ({ ...s, reconMode: m }))}
                  className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                    sim.reconMode === m
                      ? 'bg-leaf-700 text-white border-leaf-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {RECON_LABELS[m]}
                </button>
              ))}
              <Badge variant="secondary" className="font-mono text-sm">{fmtClock(sim.tick)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Station strip */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4 overflow-x-auto">
            <div className="text-center min-w-max">
              <div className="px-4 py-3 rounded-lg border bg-slate-100 text-slate-700">
                <div className="font-semibold text-sm">Case Queue</div>
                <div className="text-xs mt-1 font-mono">{sim.queue} waiting</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">from CP1</div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <div className="text-center min-w-max">
              <div className={`px-4 py-3 rounded-lg border ${prnChip.chipClass}`}>
                <div className="font-semibold text-sm">PRN-CP1</div>
                <div className="text-xs mt-1">{prnChip.label}{sim.faultCode ? ` · ${sim.faultCode}` : ''}</div>
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">{sim.printed} printed</div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <div className="text-center min-w-max">
              <div className="px-4 py-3 rounded-lg border bg-slate-100 text-slate-700">
                <div className="font-semibold text-sm">Applicator</div>
                <div className="text-xs mt-1 font-mono">{sim.applied} applied</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">tamp</div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <div className="text-center min-w-max">
              <div className="px-4 py-3 rounded-lg border bg-slate-100 text-slate-700">
                <div className="font-semibold text-sm">SCAN-CP1</div>
                <div className="text-xs mt-1 font-mono">grade {sim.grade.toFixed(1)} ({gradeLetter})</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{sim.noReads} no-reads</div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <div className="text-center min-w-max">
              <div className="px-4 py-3 rounded-lg border bg-leaf-100 text-leaf-800">
                <div className="font-semibold text-sm">Pallet</div>
                <div className="text-xs mt-1 font-mono">{sim.palletCount} / {SIM.palletCases}</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{sim.pallets} closed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Truth vs MES view */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-tobacco-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Printer className="h-5 w-5 text-tobacco-600" />
              <span>Line Truth — Applied &amp; Graded</span>
            </CardTitle>
            <CardDescription>Every label the station physically handled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between p-2 bg-slate-50 rounded border">
              <span className="text-sm font-medium">Labels printed</span>
              <span className="font-mono text-sm">{sim.printed}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded border">
              <span className="text-sm font-medium">Labels applied to cases</span>
              <span className="font-mono text-sm">{sim.applied}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded border">
              <span className="text-sm font-medium">Voided + reprinted</span>
              <span className="font-mono text-sm">{sim.voided}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded border">
              <span className="text-sm font-medium">Content mismatch</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${sim.contentMismatch ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>
                {sim.contentMismatch ? 'ACTIVE — labels lie' : 'none'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded border">
              <div className="text-xs text-slate-600 mb-1">Verifier grade — printhead wear across the loop (dashed: B 2.5 · C 1.5)</div>
              <svg viewBox="0 0 300 40" className="w-full h-10">
                <line x1="0" y1="15" x2="300" y2="15" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
                <line x1="0" y1="25" x2="300" y2="25" stroke="#fca5a5" strokeWidth="1" strokeDasharray="4 3" />
                <polyline points={gradePoints} fill="none" stroke="#0f766e" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card className="border-leaf-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <ScanBarcode className="h-5 w-5 text-leaf-700" />
              <span>What the MES Recorded — Level 3</span>
            </CardTitle>
            <CardDescription>Verify records received under "{RECON_LABELS[sim.reconMode]}" reconciliation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between p-2 bg-slate-50 rounded border">
              <span className="text-sm font-medium">Verify records in the MES</span>
              <span className="font-mono text-sm">{sim.mesRecords}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded border">
              <span className="text-sm font-medium">Pending (not yet posted)</span>
              <span className="font-mono text-sm">{sim.pendingRecords}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded border">
              <span className="text-sm font-medium">Duplicate-serial ghosts</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${sim.dupExtraRecords > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                {sim.dupExtraRecords > 0 ? `${sim.dupExtraRecords} unreconciled` : 'none'}
              </span>
            </div>
            <div className="p-3 bg-leaf-50 rounded border border-leaf-200 text-sm text-leaf-800">
              The gap between "applied" and "records" is your reconciliation design. Event mode closes it every
              second; batch closes it every 15 s; pallet-close leaves the duplicate at :133 invisible until case {SIM.palletCases}.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline strips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Label Timeline — Truth vs MES Records</CardTitle>
          <CardDescription>
            Last {HISTORY_LEN} s · cases labeled: truth {sim.applied} / MES {sim.mesRecords}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs text-slate-600 mb-1">Station truth (every tick)</div>
            <div className="flex h-4 rounded overflow-hidden border border-slate-200">
              {strip.map((h, i) => (
                <div key={h.tick} className={`flex-1 ${truthCellClass(i)}`} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Verify records reaching the MES ({RECON_LABELS[sim.reconMode]})</div>
            <div className="flex h-4 rounded overflow-hidden border border-slate-200">
              {strip.map((h, i) => (
                <div key={h.tick} className={`flex-1 ${mesCellClass(i)}`} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600"><div className={`w-3 h-3 rounded-sm ${TRUTH_CELLS.ok}`} /><span>label OK</span></div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600"><div className={`w-3 h-3 rounded-sm ${TRUTH_CELLS.reprint}`} /><span>void + reprint</span></div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600"><div className={`w-3 h-3 rounded-sm ${TRUTH_CELLS.fault}`} /><span>printer fault</span></div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600"><div className={`w-3 h-3 rounded-sm ${TRUTH_CELLS.mismatch}`} /><span>grade A, WRONG content</span></div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600"><div className={`w-3 h-3 rounded-sm ${TRUTH_CELLS.idle}`} /><span>no case</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Event log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Activity className="h-5 w-5 text-leaf-700" />
            <span>MES Event Log</span>
          </CardTitle>
          <CardDescription>Faults, warnings and reconciliations — transitions only, newest first</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {sim.events.length === 0 && (
              <div className="text-sm text-slate-500 p-3 text-center">Start the station — events appear when states change.</div>
            )}
            {sim.events.map((e, i) => (
              <div
                key={`${e.tick}-${i}`}
                className={`px-3 py-2 rounded text-sm font-mono ${
                  e.severity === 'alert'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : e.severity === 'warn'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                {fmtClock(e.tick)} · {e.text}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Try this */}
      <Card className="bg-tobacco-50 border-tobacco-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-tobacco-700 mb-1">{LIVE_CALLOUT.heading}</h4>
          <p className="text-slate-700 text-sm">{LIVE_CALLOUT.body}</p>
        </CardContent>
      </Card>

      {/* Why this matters */}
      <div className="grid md:grid-cols-3 gap-4">
        {LIVE_BENEFIT_TILES.map((tile) => (
          <Card key={tile.title} className="bg-white">
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-900 mb-2">{tile.title}</h4>
              <p className="text-sm text-slate-600">{tile.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          ZPL Playground
        </Button>
        <Button onClick={onNext} size="lg" className="bg-leaf-700 hover:bg-leaf-800">
          Case Study
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default LiveLineSection;
