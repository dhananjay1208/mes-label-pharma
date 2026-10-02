
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Eye, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { MESSAGES } from '@/data/messages';
import type { MessageType } from '@/data/types';

interface MessageExchangeViewerProps {
  messageType: MessageType;
}

const MessageExchangeViewer = ({ messageType }: MessageExchangeViewerProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderField = (field: string, value: string, description: string, fieldId: string) => (
    <div key={fieldId} className="flex items-center justify-between p-3 bg-slate-50 rounded border hover:bg-slate-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm font-medium text-leaf-700">{field}:</span>
          <span className="font-mono text-sm text-slate-900">{value}</span>
        </div>
        <div className="text-xs text-slate-600 mt-1">{description}</div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => copyToClipboard(`${field}: ${value}`, fieldId)}
        className="h-8 w-8 p-0"
      >
        {copiedField === fieldId ? (
          <span className="text-xs text-green-600">✓</span>
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );

  const renderCollapsibleSection = (title: string, sectionId: string, children: React.ReactNode) => (
    <div className="border border-slate-200 rounded-lg">
      <button
        onClick={() => toggleSection(sectionId)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-900">{title}</span>
        {expandedSections[sectionId] ? (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-500" />
        )}
      </button>
      {expandedSections[sectionId] && (
        <div className="p-4 pt-0 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  const messageData = MESSAGES[messageType];
  const signalTabLabel = messageData.signalTabLabel ?? 'Signal / Register Table';
  const payloadTabLabel = messageData.payloadTabLabel ?? 'Payload Example';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-900">{messageData.title}</h3>
        <p className="text-slate-600">{messageData.description}</p>
      </div>

      <Tabs defaultValue="signals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signals" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>{signalTabLabel}</span>
          </TabsTrigger>
          <TabsTrigger value="payload" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>{payloadTabLabel}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-leaf-700" />
                <span>Exchange Type: {messageData.signalTable.type}</span>
              </CardTitle>
              <CardDescription>{messageData.signalTable.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(messageData.signalTable.segments).map(([segmentName, fields]) => (
                renderCollapsibleSection(
                  `${segmentName.charAt(0).toUpperCase() + segmentName.slice(1).replace(/([A-Z0-9])/g, ' $1')}`,
                  segmentName,
                  <div className="space-y-2">
                    {fields.map((fieldData, index) =>
                      renderField(
                        fieldData.field,
                        fieldData.value,
                        fieldData.description,
                        `${segmentName}-${index}`
                      )
                    )}
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span>{payloadTabLabel}</span>
              </CardTitle>
              <CardDescription>{messageData.payloadCaption}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="text-xs bg-slate-50 p-4 rounded border overflow-x-auto">
                  <code className="text-slate-800">{messageData.payload}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(messageData.payload, 'payload')}
                >
                  {copiedField === 'payload' ? '✓' : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-tobacco-50 border-tobacco-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-tobacco-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-tobacco-600 text-xs font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-tobacco-700 mb-1">{messageData.note.heading}</h4>
              <p className="text-slate-700 text-sm">{messageData.note.body}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageExchangeViewer;
