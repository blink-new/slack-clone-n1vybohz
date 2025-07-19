import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Wand2, 
  MessageSquare, 
  Mail, 
  Send, 
  Mic, 
  MicOff,
  Volume2,
  Copy,
  RefreshCw,
  Zap,
  Target,
  Heart,
  Briefcase,
  Smile,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

interface AIEmailAssistantProps {
  emailContent?: string;
  recipientEmail?: string;
  recipientName?: string;
  context?: string;
  onCompose: (content: string, tone: string, priority: string) => void;
  onAnalyze?: (analysis: EmailAnalysis) => void;
  className?: string;
}

interface EmailAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  actionItems: string[];
  keyTopics: string[];
  urgencyScore: number;
  relationshipInsights: string;
  suggestedResponse: string;
  estimatedReadTime: number;
}

interface ToneOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const toneOptions: ToneOption[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal and business-appropriate',
    icon: <Briefcase className="w-4 h-4" />,
    color: 'text-blue-600'
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm and approachable',
    icon: <Heart className="w-4 h-4" />,
    color: 'text-green-600'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed and informal',
    icon: <Smile className="w-4 h-4" />,
    color: 'text-purple-600'
  },
  {
    id: 'urgent',
    name: 'Urgent',
    description: 'Direct and action-oriented',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-red-600'
  }
];

export function AIEmailAssistant({
  emailContent = '',
  recipientEmail = '',
  recipientName = '',
  context = '',
  onCompose,
  onAnalyze,
  className = ''
}: AIEmailAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [composePrompt, setComposePrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [priority, setPriority] = useState('normal');
  const [creativity, setCreativity] = useState([0.7]);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [generatedContent, setGeneratedContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Auto-analyze email content when it changes
  useEffect(() => {
    if (emailContent && autoAnalyze) {
      analyzeEmail();
    }
  }, [emailContent, autoAnalyze, analyzeEmail]);

  const analyzeEmail = useCallback(async () => {
    if (!emailContent.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis: EmailAnalysis = {
        sentiment: emailContent.toLowerCase().includes('urgent') || emailContent.toLowerCase().includes('asap') ? 'urgent' :
                  emailContent.toLowerCase().includes('thank') || emailContent.toLowerCase().includes('great') ? 'positive' :
                  emailContent.toLowerCase().includes('concern') || emailContent.toLowerCase().includes('issue') ? 'negative' : 'neutral',
        tone: emailContent.includes('Dear') || emailContent.includes('Sincerely') ? 'formal' : 
              emailContent.includes('Hi') || emailContent.includes('Thanks') ? 'friendly' : 'professional',
        actionItems: [
          'Schedule follow-up meeting',
          'Review attached documents',
          'Provide feedback by Friday'
        ],
        keyTopics: ['Product roadmap', 'Semantic search', 'Q1 priorities'],
        urgencyScore: emailContent.toLowerCase().includes('urgent') ? 0.9 : 
                     emailContent.toLowerCase().includes('asap') ? 0.8 : 0.3,
        relationshipInsights: `${recipientName || 'This person'} typically prefers concise, action-oriented communication based on previous interactions.`,
        suggestedResponse: `Thanks for the update, ${recipientName}. I'll review this and get back to you with my thoughts by end of week.`,
        estimatedReadTime: Math.ceil(emailContent.split(' ').length / 200)
      };
      
      setAnalysis(mockAnalysis);
      onAnalyze?.(mockAnalysis);
      setIsAnalyzing(false);
    }, 1500);
  }, [emailContent, recipientName, onAnalyze]);

  const generateEmailContent = async () => {
    if (!composePrompt.trim()) return;
    
    setIsComposing(true);
    
    // Simulate AI composition
    setTimeout(() => {
      const toneStyle = toneOptions.find(t => t.id === selectedTone);
      const creativityLevel = creativity[0];
      
      let content = '';
      
      if (selectedTone === 'professional') {
        content = `Dear ${recipientName || 'Colleague'},\n\nI hope this email finds you well. ${composePrompt}\n\nI look forward to your response.\n\nBest regards,\nAlex Chen`;
      } else if (selectedTone === 'friendly') {
        content = `Hi ${recipientName || 'there'}!\n\nHope you're doing great! ${composePrompt}\n\nLet me know what you think!\n\nCheers,\nAlex`;
      } else if (selectedTone === 'casual') {
        content = `Hey ${recipientName || 'there'},\n\n${composePrompt}\n\nThanks!\nAlex`;
      } else if (selectedTone === 'urgent') {
        content = `${recipientName || 'Hi'},\n\nURGENT: ${composePrompt}\n\nPlease respond ASAP.\n\nThanks,\nAlex`;
      }
      
      setGeneratedContent(content);
      
      // Generate suggestions
      setSuggestions([
        'Make it more concise',
        'Add a call-to-action',
        'Include a deadline',
        'Make it more personal'
      ]);
      
      setIsComposing(false);
    }, 2000);
  };

  const startVoiceInput = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setComposePrompt('Schedule a meeting to discuss the semantic search implementation timeline and resource requirements');
      setIsListening(false);
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const applySuggestion = (suggestion: string) => {
    // Simulate applying suggestion
    let modifiedContent = generatedContent;
    
    if (suggestion.includes('concise')) {
      modifiedContent = generatedContent.replace(/I hope this email finds you well\. /, '');
    } else if (suggestion.includes('call-to-action')) {
      modifiedContent = generatedContent + '\n\nCould you please confirm by tomorrow?';
    } else if (suggestion.includes('deadline')) {
      modifiedContent = generatedContent.replace('Let me know', 'Please let me know by Friday');
    } else if (suggestion.includes('personal')) {
      modifiedContent = generatedContent.replace('Dear Colleague', `Dear ${recipientName}`);
    }
    
    setGeneratedContent(modifiedContent);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'urgent': return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle2 className="w-4 h-4" />;
      case 'negative': return <AlertTriangle className="w-4 h-4" />;
      case 'urgent': return <Zap className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* AI Email Analysis */}
      {emailContent && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary neural-glow" />
                <span>AI Email Analysis</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="auto-analyze" className="text-sm">Auto-analyze</Label>
                <Switch
                  id="auto-analyze"
                  checked={autoAnalyze}
                  onCheckedChange={setAutoAnalyze}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeEmail}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-2 text-sm text-muted-foreground"
                >
                  <Brain className="w-4 h-4 animate-pulse text-primary" />
                  <span>Analyzing email content, sentiment, and context...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Sentiment & Tone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sentiment</Label>
                    <div className={cn("flex items-center space-x-2 p-2 rounded-md", getSentimentColor(analysis.sentiment))}>
                      {getSentimentIcon(analysis.sentiment)}
                      <span className="text-sm font-medium capitalize">{analysis.sentiment}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tone</Label>
                    <div className="flex items-center space-x-2 p-2 rounded-md bg-muted">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{analysis.tone}</span>
                    </div>
                  </div>
                </div>

                {/* Urgency Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Urgency Level</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(analysis.urgencyScore * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        analysis.urgencyScore > 0.7 ? "bg-red-500" :
                        analysis.urgencyScore > 0.4 ? "bg-orange-500" : "bg-green-500"
                      )}
                      style={{ width: `${analysis.urgencyScore * 100}%` }}
                    />
                  </div>
                </div>

                {/* Key Topics */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Key Topics</Label>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyTopics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Action Items</Label>
                  <ul className="space-y-1">
                    {analysis.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Target className="w-3 h-3 mt-0.5 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Relationship Insights */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Relationship Insights</Label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {analysis.relationshipInsights}
                  </p>
                </div>

                {/* Suggested Response */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">AI Suggested Response</Label>
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                    <p className="text-sm italic mb-2">"{analysis.suggestedResponse}"</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setComposePrompt(analysis.suggestedResponse)}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Use as Starting Point
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Email Composer */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-primary neural-glow" />
            <span>AI Email Composer</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Compose Input */}
          <div className="space-y-2">
            <Label htmlFor="compose-prompt">What would you like to say?</Label>
            <div className="relative">
              <Textarea
                id="compose-prompt"
                placeholder="e.g., Schedule a meeting to discuss the project timeline..."
                value={composePrompt}
                onChange={(e) => setComposePrompt(e.target.value)}
                className="min-h-[80px] pr-12"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={startVoiceInput}
                      disabled={isListening}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isListening ? 'Listening...' : 'Voice input'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label>Email Tone</Label>
            <div className="grid grid-cols-2 gap-2">
              {toneOptions.map((tone) => (
                <Button
                  key={tone.id}
                  variant={selectedTone === tone.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTone(tone.id)}
                  className="justify-start"
                >
                  <span className={tone.color}>{tone.icon}</span>
                  <div className="ml-2 text-left">
                    <div className="font-medium">{tone.name}</div>
                    <div className="text-xs text-muted-foreground">{tone.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Priority & Creativity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Creativity Level</Label>
              <div className="px-2">
                <Slider
                  value={creativity}
                  onValueChange={setCreativity}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateEmailContent}
            disabled={!composePrompt.trim() || isComposing}
            className="w-full neural-glow"
          >
            {isComposing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Composing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Email
              </>
            )}
          </Button>

          {/* Generated Content */}
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Generated Email</Label>
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generatedContent)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy to clipboard</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateEmailContent}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md border">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generatedContent}
                    </pre>
                  </div>
                </div>

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">AI Suggestions</Label>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => applySuggestion(suggestion)}
                          className="text-xs"
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Est. read time: {Math.ceil(generatedContent.split(' ').length / 200)} min</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedContent('')}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => onCompose(generatedContent, selectedTone, priority)}
                      className="neural-glow"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Use This Email
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}