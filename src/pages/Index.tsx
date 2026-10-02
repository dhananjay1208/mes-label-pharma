
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Building2, Tags, Cable, Wrench, Code2, Activity, Pill, BookOpen, CheckCircle, Printer } from 'lucide-react';
import LabelPointsSection from '@/components/LabelPointsSection';
import InterfaceContractSection from '@/components/InterfaceContractSection';
import ToolsTechSection from '@/components/ToolsTechSection';
import ZplPlaygroundSection from '@/components/ZplPlaygroundSection';
import LiveLineSection from '@/components/LiveLineSection';
import CaseStudySection from '@/components/CaseStudySection';
import ConfigCloseSection from '@/components/ConfigCloseSection';
import { HERO, LEARN_BULLETS_LEFT, LEARN_BULLETS_RIGHT, TOPIC_CARDS, STAT_TILES } from '@/data/overview';

const Index = () => {
  const [currentSection, setCurrentSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: Building2 },
    { id: 'label-points', title: 'Where Labels Live', icon: Tags },
    { id: 'interface-contract', title: 'The Interface Contract', icon: Cable },
    { id: 'tools-and-tech', title: 'Tools & Technology', icon: Wrench },
    { id: 'zpl-playground', title: 'ZPL Playground', icon: Code2 },
    { id: 'live-line', title: 'The Live Label Line', icon: Activity },
    { id: 'case-study', title: 'Case Study', icon: Pill },
    { id: 'config-and-close', title: 'Configuration & Glossary', icon: BookOpen },
  ];

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'label-points':
        return <LabelPointsSection onNext={() => setCurrentSection('interface-contract')} onPrev={() => setCurrentSection('overview')} />;
      case 'interface-contract':
        return <InterfaceContractSection onNext={() => setCurrentSection('tools-and-tech')} onPrev={() => setCurrentSection('label-points')} />;
      case 'tools-and-tech':
        return <ToolsTechSection onNext={() => setCurrentSection('zpl-playground')} onPrev={() => setCurrentSection('interface-contract')} />;
      case 'zpl-playground':
        return <ZplPlaygroundSection onNext={() => setCurrentSection('live-line')} onPrev={() => setCurrentSection('tools-and-tech')} />;
      case 'live-line':
        return <LiveLineSection onNext={() => setCurrentSection('case-study')} onPrev={() => setCurrentSection('zpl-playground')} />;
      case 'case-study':
        return <CaseStudySection onNext={() => setCurrentSection('config-and-close')} onPrev={() => setCurrentSection('live-line')} />;
      case 'config-and-close':
        return <ConfigCloseSection onPrev={() => setCurrentSection('case-study')} onHome={() => setCurrentSection('overview')} />;
      default:
        return <OverviewSection onStartLearning={() => setCurrentSection('label-points')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-leaf-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Pill className="h-8 w-8 text-leaf-700" />
                <h1 className="text-2xl font-bold text-slate-900">MES-Labeling Integration Workshop</h1>
                <Badge variant="secondary" className="bg-tobacco-100 text-tobacco-700">Pharma</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="hidden md:inline text-sm text-slate-500">Helvion Pharma · Plant 2 Lakeworth</span>
              <Badge variant="secondary" className="text-sm">Interactive Learning App</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-3 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                    currentSection === section.id
                      ? 'bg-leaf-700 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentSection()}
      </main>
    </div>
  );
};

const OverviewSection = ({ onStartLearning }: { onStartLearning: () => void }) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-leaf-700 to-leaf-900 rounded-full flex items-center justify-center">
          <Tags className="h-12 w-12 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            {HERO.heading}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {HERO.bodyLead}
            <span className="font-semibold text-leaf-700">{HERO.bodyHighlight}</span>
            {HERO.bodyTail}
          </p>
        </div>
        <Button
          onClick={onStartLearning}
          size="lg"
          className="bg-leaf-700 hover:bg-leaf-800 text-white px-8 py-3 text-lg"
        >
          Start Learning Journey
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* What You'll Learn */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-900">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>What You'll Learn</span>
          </CardTitle>
          <CardDescription>
            Built for the team connecting the MES to the printers, coders and verifiers that mark every unit leaving the plant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {LEARN_BULLETS_LEFT.map((bullet) => (
                <div key={bullet.title} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-leaf-700 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{bullet.title}</h4>
                    <p className="text-slate-600 text-sm">{bullet.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {LEARN_BULLETS_RIGHT.map((bullet) => (
                <div key={bullet.title} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-tobacco-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{bullet.title}</h4>
                    <p className="text-slate-600 text-sm">{bullet.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic cards */}
      <Card className="bg-gradient-to-r from-leaf-50 to-tobacco-50 border-leaf-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Printer className="h-6 w-6 text-leaf-700" />
            <span>What This Workshop Covers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {TOPIC_CARDS.map((card) => (
              <div key={card.title} className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-slate-900 mb-2">{card.title}</h4>
                <p className="text-sm text-slate-600">{card.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_TILES.map((tile) => (
          <Card key={tile.label} className="text-center p-6 bg-white/80 backdrop-blur-sm">
            <div className={`text-2xl font-bold ${tile.colorClass}`}>{tile.value}</div>
            <div className="text-sm text-slate-600">{tile.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
