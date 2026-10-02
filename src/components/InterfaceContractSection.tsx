
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Printer, Gauge, ScanLine, Download, Layers, MessageSquare } from 'lucide-react';
import MessageExchangeViewer from './MessageExchangeViewer';
import SignalTable from './SignalTable';
import {
  JOB_EXPLAINER,
  JOB_DIAGRAM,
  JOB_SIGNALS,
  JOB_QUIZ,
  STATUS_EXPLAINER,
  STATUS_DIAGRAM,
  STATUS_SIGNALS,
  STATUS_QUIZ,
  VERIFY_EXPLAINER,
  VERIFY_DIAGRAM,
  VERIFY_SIGNALS,
  VERIFY_QUIZ,
  TEMPLATE_EXPLAINER,
  TEMPLATE_DIAGRAM,
  TEMPLATE_SIGNALS,
  TEMPLATE_QUIZ,
  MIDDLEWARE_EXPLAINER,
  MIDDLEWARE_DIAGRAM,
  MIDDLEWARE_SIGNALS,
  MIDDLEWARE_QUIZ,
} from '@/data/flows';
import type { FlowQuiz, SignalRow, MessageType } from '@/data/types';

interface InterfaceContractSectionProps {
  onNext: () => void;
  onPrev: () => void;
}

interface FlowDef {
  id: string;
  title: string;
  icon: typeof Printer;
  description: string;
  explainer: { heading: string; body: string };
  diagram: { label: string; caption: string; color: string }[];
  diagramTitle: string;
  signals?: SignalRow[];
  signalsCaption?: string;
  quiz: FlowQuiz;
  messageType: MessageType;
  // literal Tailwind classes for the flow's accent
  explainerBox: string;
  explainerHeading: string;
  explainerBody: string;
  iconClass: string;
  quizAccent: string;
}

const FLOWS: FlowDef[] = [
  {
    id: 'print-job',
    title: 'Print Job ↓',
    icon: Printer,
    description: 'Raw ZPL over TCP 9100 — bytes in, labels out, no acknowledgement',
    explainer: JOB_EXPLAINER,
    diagram: JOB_DIAGRAM,
    diagramTitle: 'The Print Path',
    signals: JOB_SIGNALS,
    signalsCaption: 'The case-label print job — field by field (⚠ = known trap)',
    quiz: JOB_QUIZ,
    messageType: 'print-job',
    explainerBox: 'bg-leaf-50 border-leaf-200',
    explainerHeading: 'text-leaf-900',
    explainerBody: 'text-leaf-800',
    iconClass: 'text-leaf-700',
    quizAccent: 'bg-leaf-50 border-leaf-200',
  },
  {
    id: 'printer-status',
    title: 'Printer Status ↑',
    icon: Gauge,
    description: '~HS, SGD and SNMP — know a printer CAN print before you send',
    explainer: STATUS_EXPLAINER,
    diagram: STATUS_DIAGRAM,
    diagramTitle: 'The Status Back-Channel',
    signals: STATUS_SIGNALS,
    signalsCaption: 'PRN-CP1 — the status signals the MES polls (⚠ = known trap)',
    quiz: STATUS_QUIZ,
    messageType: 'printer-status',
    explainerBox: 'bg-purple-50 border-purple-200',
    explainerHeading: 'text-purple-900',
    explainerBody: 'text-purple-800',
    iconClass: 'text-purple-600',
    quizAccent: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'verify-result',
    title: 'Verify & Grade ↑',
    icon: ScanLine,
    description: 'ISO 15416 grades plus content-compare — the loop-closer at SCAN-CP1',
    explainer: VERIFY_EXPLAINER,
    diagram: VERIFY_DIAGRAM,
    diagramTitle: 'The Verify Loop',
    signals: VERIFY_SIGNALS,
    signalsCaption: 'The verify event — grade, content, disposition (⚠ = known trap)',
    quiz: VERIFY_QUIZ,
    messageType: 'verify-result',
    explainerBox: 'bg-green-50 border-green-200',
    explainerHeading: 'text-green-900',
    explainerBody: 'text-green-800',
    iconClass: 'text-green-600',
    quizAccent: 'bg-green-50 border-green-200',
  },
  {
    id: 'template-download',
    title: 'Template Download ↓',
    icon: Download,
    description: '^DF stores, CRC readback, version pinning — the printer as a data store',
    explainer: TEMPLATE_EXPLAINER,
    diagram: TEMPLATE_DIAGRAM,
    diagramTitle: 'The Template Deployment Handshake',
    signals: TEMPLATE_SIGNALS,
    signalsCaption: 'Stored-format governance — what gets pinned and verified (⚠ = known trap)',
    quiz: TEMPLATE_QUIZ,
    messageType: 'template-download',
    explainerBox: 'bg-amber-50 border-amber-200',
    explainerHeading: 'text-amber-900',
    explainerBody: 'text-amber-800',
    iconClass: 'text-amber-600',
    quizAccent: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'middleware-trigger',
    title: 'Middleware ↕',
    icon: Layers,
    description: 'BarTender / NiceLabel patterns — MES fields in, governed printing out',
    explainer: MIDDLEWARE_EXPLAINER,
    diagram: MIDDLEWARE_DIAGRAM,
    diagramTitle: 'The Middleware Print Request',
    signals: MIDDLEWARE_SIGNALS,
    signalsCaption: 'The middleware request — what the MES actually sends (⚠ = known trap)',
    quiz: MIDDLEWARE_QUIZ,
    messageType: 'middleware-trigger',
    explainerBox: 'bg-blue-50 border-blue-200',
    explainerHeading: 'text-blue-900',
    explainerBody: 'text-blue-800',
    iconClass: 'text-blue-600',
    quizAccent: 'bg-blue-50 border-blue-200',
  },
];

const InterfaceContractSection = ({ onNext, onPrev }: InterfaceContractSectionProps) => {
  const [activeFlow, setActiveFlow] = useState('print-job');
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const flow = FLOWS.find((f) => f.id === activeFlow) ?? FLOWS[0];
  const FlowIcon = flow.icon;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">Section 3</Badge>
        <h2 className="text-3xl font-bold text-slate-900">The Interface Contract</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          The five exchange types between the MES and the marking layer — job by job, status by status, label by label
        </p>
      </div>

      {/* Flow Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {FLOWS.map((f) => {
          const Icon = f.icon;
          const isActive = activeFlow === f.id;
          return (
            <Card
              key={f.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isActive ? 'border-leaf-600 bg-leaf-50' : 'hover:bg-slate-50'
              }`}
              onClick={() => {
                setActiveFlow(f.id);
                setQuizAnswer(null);
              }}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-3 ${
                  isActive ? 'text-leaf-700' : 'text-slate-400'
                }`} />
                <h3 className={`font-semibold mb-2 text-sm ${
                  isActive ? 'text-leaf-900' : 'text-slate-900'
                }`}>
                  {f.title}
                </h3>
                <p className="text-xs text-slate-600">{f.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Flow Content */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <FlowIcon className={`h-6 w-6 ${flow.iconClass}`} />
            <h3 className="text-2xl font-bold text-slate-900">{flow.title}</h3>
          </div>

          {/* Explainer */}
          <div className={`${flow.explainerBox} border rounded-lg p-4 mb-6`}>
            <h4 className={`font-semibold ${flow.explainerHeading} mb-2`}>{flow.explainer.heading}</h4>
            <p className={`${flow.explainerBody} text-sm`}>{flow.explainer.body}</p>
          </div>

          {/* Arch-box diagram */}
          <Card className="bg-gradient-to-r from-slate-50 to-leaf-50">
            <CardContent className="p-6">
              <h4 className="font-semibold text-slate-900 mb-4 text-center">{flow.diagramTitle}</h4>
              <div className="flex items-center justify-center space-x-4 overflow-x-auto py-2">
                {flow.diagram.map((box, index) => (
                  <div key={box.label} className="flex items-center min-w-max">
                    <div className="text-center min-w-max">
                      <div className={`w-16 h-16 ${box.color} rounded-lg flex items-center justify-center mb-2`}>
                        <span className="font-bold text-xs">{box.label}</span>
                      </div>
                      <div className="text-xs text-slate-600 max-w-[8.5rem]">{box.caption}</div>
                    </div>
                    {index < flow.diagram.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-slate-400 ml-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Signal table */}
          {flow.signals && (
            <SignalTable rows={flow.signals} caption={flow.signalsCaption} />
          )}

          {/* Message exchange */}
          <MessageExchangeViewer messageType={flow.messageType} />

          {/* Quiz */}
          <FlowQuizCard
            quiz={flow.quiz}
            quizAnswer={quizAnswer}
            setQuizAnswer={setQuizAnswer}
            accentClass={flow.quizAccent}
            iconClass={flow.iconClass}
            title="Quick Check"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Where Labels Live
        </Button>
        <Button onClick={onNext} size="lg" className="bg-leaf-700 hover:bg-leaf-800">
          Tools &amp; Technology
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

interface QuizProps {
  quizAnswer: string | null;
  setQuizAnswer: (answer: string) => void;
}

const FlowQuizCard = ({
  quiz,
  quizAnswer,
  setQuizAnswer,
  accentClass,
  iconClass,
  title,
}: QuizProps & { quiz: FlowQuiz; accentClass: string; iconClass: string; title: string }) => (
  <Card className={accentClass}>
    <CardHeader>
      <CardTitle className="text-lg flex items-center space-x-2">
        <MessageSquare className={`h-5 w-5 ${iconClass}`} />
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-slate-900 mb-4">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setQuizAnswer(index.toString())}
            className={`w-full text-left p-3 rounded border transition-colors ${
              quizAnswer === index.toString()
                ? index === quiz.correctIndex
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'bg-red-100 border-red-300 text-red-800'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            {String.fromCharCode(65 + index)}. {option}
          </button>
        ))}
      </div>
      {quizAnswer && (
        <div className={`mt-4 p-3 rounded ${
          quizAnswer === quiz.correctIndex.toString()
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {quizAnswer === quiz.correctIndex.toString() ? quiz.correctMsg : quiz.wrongMsg}
        </div>
      )}
    </CardContent>
  </Card>
);

export default InterfaceContractSection;
