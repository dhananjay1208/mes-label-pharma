import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, ArrowUpDown, AlertCircle, CheckCircle, Zap, XCircle, Server, Printer, Tags, ExternalLink } from 'lucide-react';
import { MES_BOX, MARKING_BOX, LABEL_POINTS, PAIN_CARDS, BENEFIT_CARDS, CROSSLINK_CALLOUT } from '@/data/labelPoints';

interface LabelPointsSectionProps {
  onNext: () => void;
  onPrev: () => void;
}

const LabelPointsSection = ({ onNext, onPrev }: LabelPointsSectionProps) => {
  const [showDefinitions, setShowDefinitions] = useState<string | null>(null);
  const [beforeAfterView, setBeforeAfterView] = useState<'before' | 'after'>('before');

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">Section 2</Badge>
        <h2 className="text-3xl font-bold text-slate-900">Where Labels Live in Plant 2</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Six marking points from the serialization station to the palletizer — which marks are printed, which are applied or consumed, from which data, verified by which device
        </p>
      </div>

      {/* Interactive Diagram */}
      <Card className="bg-gradient-to-r from-leaf-50 to-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowUpDown className="h-6 w-6 text-leaf-700" />
            <span>The Two Layers of Every Label</span>
          </CardTitle>
          <CardDescription>
            Click each layer to learn its role — the MES owns the data, the marking layer owns the ink
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-8 py-8">
            {/* MES (Level 3) */}
            <div
              className={`relative cursor-pointer transition-all duration-200 ${
                showDefinitions === 'mes' ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setShowDefinitions(showDefinitions === 'mes' ? null : 'mes')}
            >
              <div className="bg-leaf-700 text-white p-6 rounded-lg shadow-lg flex items-center space-x-4 min-w-[300px]">
                <Server className="h-10 w-10" />
                <div>
                  <h3 className="text-xl font-bold">{MES_BOX.name}</h3>
                  <p className="text-leaf-100">{MES_BOX.subtitle}</p>
                </div>
              </div>
              {showDefinitions === 'mes' && (
                <Card className="absolute top-full mt-4 left-0 w-96 z-10 bg-white border-leaf-200 shadow-xl">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">{MES_BOX.name} — {MES_BOX.subtitle}</h4>
                    <p className="text-slate-600 text-sm mb-3">{MES_BOX.description}</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      {MES_BOX.functions.map((fn) => (
                        <li key={fn} className="flex items-start space-x-2">
                          <span className="text-leaf-700 mt-0.5">•</span>
                          <span>{fn}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Bi-directional Arrow */}
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-green-500"></div>
                <ArrowUpDown className="h-8 w-8 text-green-600 animate-pulse" />
                <div className="w-8 h-0.5 bg-green-500"></div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Jobs Down · Status &amp; Verify Up
              </Badge>
              <p className="text-sm text-slate-600 text-center max-w-xs">
                Print jobs and templates stream down; printer status, grades and verify results come back — three loops, always
              </p>
            </div>

            {/* Marking & Verify Layer (Level 2/1) */}
            <div
              className={`relative cursor-pointer transition-all duration-200 ${
                showDefinitions === 'marking' ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setShowDefinitions(showDefinitions === 'marking' ? null : 'marking')}
            >
              <div className="bg-tobacco-600 text-white p-6 rounded-lg shadow-lg flex items-center space-x-4 min-w-[300px]">
                <Printer className="h-10 w-10" />
                <div>
                  <h3 className="text-xl font-bold">{MARKING_BOX.name}</h3>
                  <p className="text-tobacco-100">{MARKING_BOX.subtitle}</p>
                </div>
              </div>
              {showDefinitions === 'marking' && (
                <Card className="absolute bottom-full mb-4 left-0 w-96 z-10 bg-white border-tobacco-200 shadow-xl">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">{MARKING_BOX.name} — {MARKING_BOX.subtitle}</h4>
                    <p className="text-slate-600 text-sm mb-3">{MARKING_BOX.description}</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      {MARKING_BOX.functions.map((fn) => (
                        <li key={fn} className="flex items-start space-x-2">
                          <span className="text-tobacco-600 mt-0.5">•</span>
                          <span>{fn}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The five marking points */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tags className="h-6 w-6 text-tobacco-600" />
            <span>The Marking Map — Serialization Station to Palletizer</span>
          </CardTitle>
          <CardDescription>
            Every mark on product leaving Plant 2, in line order — and who supplies the data behind it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {LABEL_POINTS.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-lg border border-slate-200 border-l-4 ${p.colorClass} p-5 shadow-sm`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-semibold text-slate-900">{p.marking}</Badge>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">{p.symbology}</Badge>
                </div>
                <div className="font-mono text-sm text-slate-700 mb-2">
                  {p.station} · {p.deviceIds.join(' · ')}
                </div>
                <div className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-xs text-slate-800 mb-3">
                  {p.contentExample}
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-semibold text-slate-900">Owned by: </span>
                  {p.ownedBy}
                </p>
                <p className="text-sm text-slate-700">{p.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Before & After Integration */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>The Transformation: Manual Labeling vs MES-Driven Labeling</CardTitle>
          <CardDescription>
            What proper label integration changes for the team running these five marking points
          </CardDescription>
          <div className="flex space-x-2">
            <Button
              variant={beforeAfterView === 'before' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBeforeAfterView('before')}
              className="flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
              <span>Without Integration</span>
            </Button>
            <Button
              variant={beforeAfterView === 'after' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBeforeAfterView('after')}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>MES-Driven Labeling</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {beforeAfterView === 'before' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h4 className="font-semibold text-red-800">Life With Hand-Managed Labels</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {PAIN_CARDS.map((card) => (
                  <div key={card.title} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-medium text-red-800 mb-2">{card.title}</h5>
                    <p className="text-red-700 text-sm">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-green-800">What the Integration Buys You</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {BENEFIT_CARDS.map((card) => (
                  <div key={card.title} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 mb-2">{card.title}</h5>
                    <p className="text-green-700 text-sm">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ForgeMES cross-link */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <ExternalLink className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">{CROSSLINK_CALLOUT.heading}</h4>
              <p className="text-sm text-slate-700 mb-2">{CROSSLINK_CALLOUT.body}</p>
              <a
                href="https://forgemes-pharma.netlify.app"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-leaf-700 underline hover:text-leaf-800"
              >
                Open ForgeMES Studio — Pharma Edition →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Overview
        </Button>
        <Button onClick={onNext} size="lg" className="bg-leaf-700 hover:bg-leaf-800">
          Explore the Interface Contract
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default LabelPointsSection;
