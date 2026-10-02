import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Settings, Zap, Globe, CheckCircle, XCircle, Cpu, Network, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MECHANISMS, REQUIREMENT_CARDS, PATTERN_CARDS, REAL_TOOLS, REAL_TOOLS_NOTE } from '@/data/tools';
import { PROTOCOL_DEEP_DIVES } from '@/data/protocols';

interface ToolsTechSectionProps {
  onNext: () => void;
  onPrev: () => void;
}

const ToolsTechSection = ({ onNext, onPrev }: ToolsTechSectionProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleDragStart = (mechanismId: string) => {
    setDraggedItem(mechanismId);
  };

  const handleDrop = (descriptionId: string) => {
    if (draggedItem) {
      setDropZones(prev => ({
        ...prev,
        [descriptionId]: draggedItem
      }));
      setDraggedItem(null);
    }
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetGame = () => {
    setDropZones({});
    setShowResults(false);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">Section 4</Badge>
        <h2 className="text-3xl font-bold text-slate-900">Tools &amp; Technology</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          The languages, standards and products that move labels — and the real tools you will meet in your own plant
        </p>
      </div>

      {/* Key Requirements */}
      <Card className="bg-gradient-to-r from-leaf-50 to-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-leaf-700" />
            <span>Label Integration Requirements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {REQUIREMENT_CARDS.map((card) => (
              <div key={card.title} className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-slate-900 mb-2">{card.title}</h4>
                <p className="text-sm text-slate-600">{card.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Matching Game */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-orange-600" />
            <span>Technology Matching Challenge</span>
          </CardTitle>
          <CardDescription>
            Drag each technology to match it with the correct description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Technology Items to Drag */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Technologies:</h4>
              <div className="flex flex-wrap gap-3">
                {MECHANISMS.map((mechanism) => (
                  <div
                    key={mechanism.id}
                    draggable={!showResults}
                    onDragStart={() => handleDragStart(mechanism.id)}
                    className={`px-4 py-2 bg-leaf-100 border border-leaf-300 rounded-lg cursor-move transition-colors hover:bg-leaf-200 ${
                      Object.values(dropZones).includes(mechanism.id) ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="font-medium text-leaf-800">{mechanism.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop Zones */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Descriptions:</h4>
              <div className="space-y-3">
                {MECHANISMS.map((mechanism) => (
                  <div
                    key={mechanism.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(mechanism.id)}
                    className={`p-4 border-2 border-dashed rounded-lg min-h-[60px] flex items-center justify-between ${
                      dropZones[mechanism.id]
                        ? showResults
                          ? dropZones[mechanism.id] === mechanism.id
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                          : 'border-leaf-300 bg-leaf-50'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{mechanism.description}</p>
                    </div>
                    <div className="ml-4">
                      {dropZones[mechanism.id] && (
                        <div className="px-3 py-1 bg-white border rounded">
                          {MECHANISMS.find(m => m.id === dropZones[mechanism.id])?.name}
                        </div>
                      )}
                    </div>
                    {showResults && (
                      <div className="ml-2">
                        {dropZones[mechanism.id] === mechanism.id ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!showResults ? (
                <Button
                  onClick={checkAnswers}
                  disabled={Object.keys(dropZones).length !== MECHANISMS.length}
                  className="bg-leaf-700 hover:bg-leaf-800"
                >
                  Check Answers
                </Button>
              ) : (
                <Button onClick={resetGame} variant="outline">
                  Try Again
                </Button>
              )}
            </div>

            {/* Results */}
            {showResults && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="font-semibold text-slate-900">
                    Score: {Object.entries(dropZones).filter(([key, value]) => key === value).length} / {MECHANISMS.length}
                  </p>
                  {Object.entries(dropZones).every(([key, value]) => key === value) && (
                    <p className="text-green-700 mt-2">🎉 Perfect! You understand the key labeling technologies.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technology Deep Dive */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MECHANISMS.map((mechanism) => (
          <Card key={mechanism.id} className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Globe className="h-5 w-5 text-leaf-700" />
                <h4 className="font-semibold text-slate-900">{mechanism.name}</h4>
              </div>
              <p className="text-sm text-slate-600 mb-3">{mechanism.description}</p>
              <div className="text-xs text-slate-500">{mechanism.plantUse}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How the Technologies Work — deep dive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-6 w-6 text-leaf-700" />
            <span>How ZPL, GS1 &amp; Label Middleware Actually Work</span>
          </CardTitle>
          <CardDescription>
            The three technology stacks your labeling integration lives on — mechanics, not marketing. Pick a tab and follow one real exchange step by step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="zpl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {PROTOCOL_DEEP_DIVES.map((p) => (
                <TabsTrigger key={p.id} value={p.id}>{p.name}</TabsTrigger>
              ))}
            </TabsList>
            {PROTOCOL_DEEP_DIVES.map((p) => (
              <TabsContent key={p.id} value={p.id} className="space-y-5 pt-4">
                {/* Intro */}
                <div className="bg-leaf-50 border border-leaf-200 rounded-lg p-4">
                  <h4 className="font-semibold text-leaf-900 mb-1">{p.tagline}</h4>
                  <p className="text-leaf-800 text-sm">{p.intro}</p>
                </div>

                {/* Architecture strip */}
                <div className="flex items-center justify-center space-x-3 overflow-x-auto py-2">
                  {p.archBoxes.map((box, index) => (
                    <div key={box.label} className="flex items-center min-w-max">
                      <div className="text-center min-w-max">
                        <div className={`w-16 h-16 ${box.color} rounded-lg flex items-center justify-center mb-2`}>
                          <span className="font-bold text-xs">{box.label}</span>
                        </div>
                        <div className="text-xs text-slate-600 max-w-[8.5rem]">{box.caption}</div>
                      </div>
                      {index < p.archBoxes.length - 1 && (
                        <ArrowRight className="h-5 w-5 text-slate-400 ml-3" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step-by-step exchange */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">{p.howTitle}</h4>
                  <ol className="space-y-2">
                    {p.steps.map((step, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <span className="w-6 h-6 bg-leaf-100 text-leaf-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Key concepts */}
                <div className="grid md:grid-cols-2 gap-3">
                  {p.concepts.map((c) => (
                    <div key={c.term} className="p-3 bg-slate-50 rounded-lg border">
                      <div className="font-mono text-sm font-semibold text-leaf-700 mb-1">{c.term}</div>
                      <p className="text-xs text-slate-600">{c.text}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths / limits */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-semibold text-green-900 mb-2">Strengths</h5>
                    <ul className="space-y-1">
                      {p.strengths.map((s) => (
                        <li key={s} className="text-sm text-green-800">✓ {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-semibold text-red-900 mb-2">Limits</h5>
                    <ul className="space-y-1">
                      {p.limits.map((l) => (
                        <li key={l} className="text-sm text-red-800">✗ {l}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Where it runs at Plant 2 */}
                <div className="p-4 bg-tobacco-50 border border-tobacco-200 rounded-lg">
                  <h5 className="font-semibold text-tobacco-700 mb-1">Where it runs at Plant 2</h5>
                  <p className="text-sm text-slate-700">{p.plant}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* The Real Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-6 w-6 text-tobacco-600" />
            <span>The Real Tools</span>
          </CardTitle>
          <CardDescription>
            The plant is fictional — these products and standards are not
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-600">
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">Products</th>
                  <th className="px-3 py-2 font-semibold">Role at Plant 2</th>
                </tr>
              </thead>
              <tbody>
                {REAL_TOOLS.map((row) => (
                  <tr key={row.category} className="border-t border-slate-100 bg-white">
                    <td className="px-3 py-2 font-medium text-slate-900">{row.category}</td>
                    <td className="px-3 py-2 text-slate-700">{row.products}</td>
                    <td className="px-3 py-2 text-slate-600">{row.plantRole}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">{REAL_TOOLS_NOTE}</p>
        </CardContent>
      </Card>

      {/* Labeling Integration Patterns */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-blue-600" />
            <span>Integration Patterns for the Label Line</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {PATTERN_CARDS.map((pattern) => (
              <div key={pattern.title} className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-slate-900 mb-2">{pattern.title}</h4>
                <p className="text-sm text-slate-600">{pattern.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          The Interface Contract
        </Button>
        <Button onClick={onNext} size="lg" className="bg-leaf-700 hover:bg-leaf-800">
          ZPL Playground
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ToolsTechSection;
