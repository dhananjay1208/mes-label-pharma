
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, CheckCircle, ArrowDown, Tags } from 'lucide-react';
import { SCENARIO, LINE_STATIONS, CASE_STEPS, INSIGHT_CARDS, COMPLETION } from '@/data/caseStudy';

interface CaseStudySectionProps {
  onNext: () => void;
  onPrev: () => void;
}

const CaseStudySection = ({ onNext, onPrev }: CaseStudySectionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  const steps = CASE_STEPS;

  const handleAnswer = (stepIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [stepIndex]: answer }));
    setShowResults(prev => ({ ...prev, [stepIndex]: true }));
  };

  const resetStep = (stepIndex: number) => {
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[stepIndex];
      return newAnswers;
    });
    setShowResults(prev => ({ ...prev, [stepIndex]: false }));
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">Section 7</Badge>
        <h2 className="text-3xl font-bold text-slate-900">Labeling Case Study</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          One real incident, end to end: 240 shipped cases, a certified batch record, every label grade A — and every expiry wrong
        </p>
      </div>

      {/* Scenario Introduction */}
      <Card className="bg-gradient-to-r from-leaf-50 to-tobacco-50 border-leaf-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tags className="h-6 w-6 text-leaf-700" />
            <span>{SCENARIO.title}</span>
          </CardTitle>
          <CardDescription>{SCENARIO.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {SCENARIO.stats.map((stat) => (
              <div key={stat.label} className="text-center p-3 bg-white rounded-lg border">
                <div className={`text-lg font-bold ${stat.colorClass}`}>{stat.value}</div>
                <div className="text-xs text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Flow Visualization */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>The Journey of the Lying Label</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto py-4">
            <div className="flex items-center space-x-4 min-w-max">
              {LINE_STATIONS.map((station, index) => (
                <div key={station} className="flex items-center">
                  <div className={`px-4 py-3 rounded-lg text-center ${
                    currentStep >= index ? 'bg-leaf-100 border-leaf-300' : 'bg-slate-100 border-slate-300'
                  } border`}>
                    <div className={`text-sm font-semibold ${currentStep >= index ? 'text-leaf-800' : 'text-slate-600'}`}>
                      {station}
                    </div>
                  </div>
                  {index < LINE_STATIONS.length - 1 && (
                    <ArrowRight className={`h-5 w-5 mx-2 ${currentStep > index ? 'text-leaf-600' : 'text-slate-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex justify-center space-x-2 mb-6">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`w-10 h-10 rounded-full font-semibold transition-all ${
              currentStep === index
                ? 'bg-leaf-700 text-white'
                : index <= currentStep
                ? 'bg-green-500 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current Step */}
      <Card className="border-leaf-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="w-8 h-8 bg-leaf-100 rounded-full flex items-center justify-center text-leaf-700 font-bold">
              {steps[currentStep].step}
            </span>
            <span>{steps[currentStep].title}</span>
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-3">{steps[currentStep].question}</h4>
            <div className="grid grid-cols-2 gap-3">
              {steps[currentStep].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentStep, option)}
                  disabled={showResults[currentStep]}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    userAnswers[currentStep] === option
                      ? userAnswers[currentStep] === steps[currentStep].correct
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-red-500 bg-red-50 text-red-800'
                      : showResults[currentStep] && option === steps[currentStep].correct
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {option}
                  {showResults[currentStep] && option === steps[currentStep].correct && (
                    <CheckCircle className="h-4 w-4 text-green-600 float-right mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {showResults[currentStep] && (
            <div className="space-y-4">
              <div className="p-4 bg-leaf-50 border border-leaf-200 rounded-lg">
                <h5 className="font-semibold text-leaf-900 mb-2">Explanation</h5>
                <p className="text-leaf-800">{steps[currentStep].explanation}</p>
              </div>

              {/* Data Example */}
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <h5 className="font-semibold text-slate-900 mb-3">
                  Example Data: {steps[currentStep].dataExample.type}
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {steps[currentStep].dataExample.fields.map((field, index) => (
                    <div key={index} className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="font-medium text-slate-700">{field.label}:</span>
                      <span className="text-slate-900 text-right">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={() => resetStep(currentStep)} variant="outline" size="sm">
                  Try Again
                </Button>
                {currentStep < steps.length - 1 && (
                  <Button onClick={() => setCurrentStep(currentStep + 1)} size="sm" className="bg-leaf-700 hover:bg-leaf-800">
                    Next Step
                    <ArrowDown className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Labeling Insights */}
      {currentStep >= 2 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Labeling Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {INSIGHT_CARDS.map((card) => (
                <div key={card.title} className="p-4 bg-white rounded-lg border">
                  <h5 className="font-semibold text-slate-900 mb-2">{card.title}</h5>
                  <p className="text-sm text-slate-600">{card.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Results */}
      {currentStep === steps.length - 1 && showResults[currentStep] && (
        <Card className="bg-gradient-to-r from-green-50 to-leaf-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-center">🎉 Case Study Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold text-slate-900">
                Score: {Object.entries(userAnswers).filter(([key, value]) => value === steps[parseInt(key)].correct).length} / {steps.length}
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-slate-900 mb-2">The Result</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {COMPLETION.checklist.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-leaf-100 rounded-lg border border-leaf-200">
                <p className="text-leaf-800 font-medium">{COMPLETION.closing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          The Live Label Line
        </Button>
        <Button onClick={onNext} size="lg" className="bg-leaf-700 hover:bg-leaf-800">
          Configuration &amp; Glossary
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CaseStudySection;
