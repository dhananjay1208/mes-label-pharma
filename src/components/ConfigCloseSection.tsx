
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Home, BookOpen, CheckCircle, XCircle, Star, Pill, Search, Settings, AlertTriangle, Lightbulb, Scale, Zap, GitBranch } from 'lucide-react';
import { SUCCESS_FACTORS, CONFIG_CHECKLIST, CHALLENGES, QUIZ_QUESTIONS } from '@/data/challenges';
import { KEY_TAKEAWAYS, UNIQUE_CARDS, GLOSSARY_TERMS, NEXT_STEPS } from '@/data/glossary';

interface ConfigCloseSectionProps {
  onPrev: () => void;
  onHome: () => void;
}

const FACTOR_ICONS: Record<string, typeof Scale> = {
  Scale,
  Zap,
  GitBranch,
};

// External links attached to NEXT_STEPS cards (matched by title; data stays link-free)
const NEXT_STEP_LINKS: Record<string, string> = {
  'ForgeMES Studio': 'https://forgemes-pharma.netlify.app',
};

const ConfigCloseSection = ({ onPrev, onHome }: ConfigCloseSectionProps) => {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean | null>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleQuizAnswer = (questionId: string, answer: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const checkQuizAnswers = () => {
    setShowQuizResults(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const filteredTerms = GLOSSARY_TERMS.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">Section 8</Badge>
        <h2 className="text-3xl font-bold text-slate-900">Configuration &amp; Glossary</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          The eight configurations every MES-labeling integration needs, the challenges they answer, and the reference material to take home
        </p>
      </div>

      {/* (a) The Required Configurations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-leaf-700" />
            <span>The Required Configurations</span>
          </CardTitle>
          <CardDescription>
            The checklist to take back to your plant — expand each item for what, why, and the Plant 2 example
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {CONFIG_CHECKLIST.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left font-semibold text-slate-900">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">What to configure</h5>
                      <p className="text-sm text-slate-700">{item.what}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <h5 className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">Why</h5>
                      <p className="text-sm text-amber-900">{item.why}</p>
                    </div>
                    <div className="p-3 bg-leaf-50 rounded-lg border border-leaf-200">
                      <h5 className="text-xs font-semibold uppercase tracking-wide text-leaf-700 mb-1">At Plant 2</h5>
                      <p className="text-sm text-leaf-900">{item.plantExample}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* (b) Success Factors */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <span>Integration Success Factors</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {SUCCESS_FACTORS.map((factor) => {
              const Icon = FACTOR_ICONS[factor.icon] ?? Scale;
              return (
                <div key={factor.title} className="text-center p-4 bg-white rounded-lg border">
                  <div className={`w-12 h-12 ${factor.iconBgClass} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`h-6 w-6 ${factor.iconTextClass}`} />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">{factor.title}</h4>
                  <p className="text-sm text-slate-600">{factor.text}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* (c) Challenge & Solution Explorer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            <span>Labeling Challenge &amp; Solution Explorer</span>
          </CardTitle>
          <CardDescription>
            Click on each challenge to explore common label-integration issues and their solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {CHALLENGES.map((challenge) => (
              <Card
                key={challenge.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedChallenge === challenge.id ? 'border-leaf-600 bg-leaf-50' : 'hover:bg-slate-50'
                }`}
                onClick={() => setSelectedChallenge(selectedChallenge === challenge.id ? null : challenge.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{challenge.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getImpactColor(challenge.impact)}`}>
                          {challenge.impact}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {challenge.category}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{challenge.description}</p>

                      {selectedChallenge === challenge.id && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2">💡 Solution</h5>
                          <p className="text-green-800 text-sm">{challenge.solution}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* (d) True/False Quiz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>Knowledge Check: True or False</span>
          </CardTitle>
          <CardDescription>
            Test your understanding of labeling-specific integration considerations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {QUIZ_QUESTIONS.map((question, index) => (
              <div key={question.id} className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">
                  {index + 1}. {question.question}
                </h4>
                <div className="flex space-x-3 mb-3">
                  <Button
                    variant={quizAnswers[question.id] === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuizAnswer(question.id, true)}
                    disabled={showQuizResults}
                    className={
                      showQuizResults && question.answer === true
                        ? "bg-green-600 hover:bg-green-700"
                        : showQuizResults && quizAnswers[question.id] === true && question.answer !== true
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                    }
                  >
                    True
                    {showQuizResults && question.answer === true && (
                      <CheckCircle className="ml-2 h-4 w-4" />
                    )}
                    {showQuizResults && quizAnswers[question.id] === true && question.answer !== true && (
                      <XCircle className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant={quizAnswers[question.id] === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuizAnswer(question.id, false)}
                    disabled={showQuizResults}
                    className={
                      showQuizResults && question.answer === false
                        ? "bg-green-600 hover:bg-green-700"
                        : showQuizResults && quizAnswers[question.id] === false && question.answer !== false
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                    }
                  >
                    False
                    {showQuizResults && question.answer === false && (
                      <CheckCircle className="ml-2 h-4 w-4" />
                    )}
                    {showQuizResults && quizAnswers[question.id] === false && question.answer !== false && (
                      <XCircle className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </div>
                {showQuizResults && (
                  <div className="p-3 bg-leaf-50 border border-leaf-200 rounded text-sm">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))}

            <div className="flex space-x-3">
              {!showQuizResults ? (
                <Button
                  onClick={checkQuizAnswers}
                  disabled={Object.keys(quizAnswers).length !== QUIZ_QUESTIONS.length}
                  className="bg-leaf-700 hover:bg-leaf-800"
                >
                  Check Answers
                </Button>
              ) : (
                <Button onClick={resetQuiz} variant="outline">
                  Try Again
                </Button>
              )}
            </div>

            {showQuizResults && (
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="font-semibold text-slate-900">
                  Score: {Object.entries(quizAnswers).filter(([key, value]) => {
                    const question = QUIZ_QUESTIONS.find(q => q.id === key);
                    return question && value === question.answer;
                  }).length} / {QUIZ_QUESTIONS.length}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* (e) Key Takeaways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <span>Key Takeaways for Labeling</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {KEY_TAKEAWAYS.map((takeaway, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <span className="w-6 h-6 bg-leaf-100 text-leaf-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-slate-700">{takeaway}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pharma vs Other Industries */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="h-6 w-6 text-blue-600" />
            <span>What Makes Pharma Labeling Unique?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {UNIQUE_CARDS.map((card) => (
              <div key={card.title} className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-slate-900 mb-2">{card.title}</h4>
                <p className="text-sm text-slate-600">{card.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* (f) Glossary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-leaf-700" />
            <span>MES-Labeling Integration Glossary</span>
          </CardTitle>
          <CardDescription>
            Reference guide for the label languages, GS1 identifiers and verify terms used in this workshop
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf-600"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {filteredTerms.map((item, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors">
                <div className="flex items-start space-x-3">
                  <Badge variant="secondary" className="bg-leaf-100 text-leaf-800 font-mono text-xs">
                    {item.term}
                  </Badge>
                  <p className="text-slate-700 text-sm">{item.definition}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* (g) Next Steps */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {NEXT_STEPS.map((step) => (
              <div key={step.title} className="p-4 bg-white rounded-lg border text-center">
                <div className="text-3xl mb-2">{step.emoji}</div>
                <h4 className="font-semibold text-slate-900 mb-1">{step.title}</h4>
                <p className="text-sm text-slate-600">{step.text}</p>
                {NEXT_STEP_LINKS[step.title] && (
                  <a
                    href={NEXT_STEP_LINKS[step.title]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-sm font-semibold text-leaf-700 underline hover:text-leaf-800"
                  >
                    Open →
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-4">
            Companion workshop: the machine-signal layer these labels ride on is covered in the MES-PLC Integration
            Workshop at{' '}
            <a
              href="https://mesplcpharma.netlify.app"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-leaf-700 underline hover:text-leaf-800"
            >
              mesplcpharma.netlify.app
            </a>
            .
          </p>
        </CardContent>
      </Card>

      {/* (h) Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Case Study
        </Button>
        <Button onClick={onHome} size="lg" className="bg-leaf-700 hover:bg-leaf-800">
          <Home className="mr-2 h-5 w-5" />
          Back to Overview
        </Button>
      </div>
    </div>
  );
};

export default ConfigCloseSection;
