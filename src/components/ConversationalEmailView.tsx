import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Mail, 
  Brain, 
  Sparkles, 
  Send, 
  Reply, 
  Forward, 
  Archive,
  Star,
  MoreHorizontal,
  Clock,
  User,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Smile,
  Briefcase,
  Target,
  TrendingUp,
  Users,
  Link2,
  Paperclip,
  Image,
  FileText,
  Calendar,
  Phone,
  Video
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AIEmailAssistant } from './AIEmailAssistant';
import { demoEmails, demoUsers, type EmailData } from '../data/demoData';
import { cn } from '../lib/utils';

interface ConversationalEmailViewProps {
  threadId?: string;
  className?: string;
  isDemoMode?: boolean;
}

interface EmailThread {
  id: string;
  participants: string[];
  subject: string;
  emails: EmailData[];
  lastActivity: string;
  isAiEnabled: boolean;
  threadInsights?: {
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    keyTopics: string[];
    actionItems: string[];
    relationshipScore: number;
    communicationPattern: string;
  };
}

interface ConversationalMessage {
  id: string;
  type: 'email' | 'ai_insight' | 'thread_summary' | 'action_item';
  emailData?: EmailData;
  content: string;
  timestamp: string;
  sender: string;
  isFromUser: boolean;
  aiContext?: {
    confidence: number;
    reasoning: string;
    suggestedActions: string[];
  };
}

// Helper function to generate thread insights
const generateThreadInsights = (emails: EmailData[]) => {
  const sentiments = emails.map(e => e.aiContext?.sentiment || 'neutral');
  const allTopics = emails.flatMap(e => e.aiContext?.actionItems || []);
  const actionItems = emails.flatMap(e => e.aiContext?.actionItems || []);
  
  return {
    sentiment: sentiments.includes('positive') && sentiments.includes('negative') ? 'mixed' as const :
              sentiments.includes('positive') ? 'positive' as const :
              sentiments.includes('negative') ? 'negative' as const : 'neutral' as const,
    keyTopics: Array.from(new Set(allTopics)).slice(0, 5),
    actionItems: Array.from(new Set(actionItems)),
    relationshipScore: Math.random() * 0.4 + 0.6, // 0.6-1.0
    communicationPattern: emails.length > 3 ? 'frequent' : emails.length > 1 ? 'regular' : 'occasional'
  };
};

// Helper function to group emails into threads
const groupEmailsIntoThreads = (emails: EmailData[]): EmailThread[] => {
  const threadMap = new Map<string, EmailData[]>();
  
  // Group emails by subject (simplified threading)
  emails.forEach(email => {
    const normalizedSubject = email.subject.replace(/^(Re:|Fwd?:)\s*/i, '').trim();
    if (!threadMap.has(normalizedSubject)) {
      threadMap.set(normalizedSubject, []);
    }
    threadMap.get(normalizedSubject)!.push(email);
  });

  return Array.from(threadMap.entries()).map(([subject, threadEmails]) => {
    const sortedEmails = threadEmails.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const participants = Array.from(new Set([
      ...sortedEmails.map(e => e.senderEmail),
      ...sortedEmails.flatMap(e => e.recipientEmails)
    ]));

    return {
      id: `thread_${subject.replace(/\s+/g, '_').toLowerCase()}`,
      participants,
      subject,
      emails: sortedEmails,
      lastActivity: sortedEmails[sortedEmails.length - 1].timestamp,
      isAiEnabled: true,
      threadInsights: generateThreadInsights(sortedEmails)
    };
  });
};

export function ConversationalEmailView({ threadId, className = '', isDemoMode = false }: ConversationalEmailViewProps) {
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [conversationalMessages, setConversationalMessages] = useState<ConversationalMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize email threads from demo data only when in demo mode
  useEffect(() => {
    if (isDemoMode) {
      const threads = groupEmailsIntoThreads(demoEmails);
      setEmailThreads(threads);
      if (threads.length > 0) {
        setSelectedThread(threads[0]);
      }
    } else {
      setEmailThreads([]);
      setSelectedThread(null);
    }
  }, [isDemoMode]);

  // Convert selected thread to conversational format
  useEffect(() => {
    if (selectedThread) {
      const messages = convertThreadToConversational(selectedThread);
      setConversationalMessages(messages);
    }
  }, [selectedThread]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationalMessages]);

  // Show empty state when not in demo mode and no threads
  if (!isDemoMode && emailThreads.length === 0) {
    return (
      <div className={cn("h-full flex bg-background overflow-hidden", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No email conversations yet</h3>
              <p className="text-gray-600 mt-2">
                Connect your email account to start viewing AI-powered conversational email threads.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Mail className="w-4 h-4 mr-2" />
              Connect Email Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const convertThreadToConversational = (thread: EmailThread): ConversationalMessage[] => {
    const messages: ConversationalMessage[] = [];
    
    // Add thread summary
    messages.push({
      id: `summary_${thread.id}`,
      type: 'thread_summary',
      content: `Email thread: "${thread.subject}" with ${thread.participants.length} participants`,
      timestamp: thread.emails[0].timestamp,
      sender: 'Thread AI',
      isFromUser: false,
      aiContext: {
        confidence: 0.95,
        reasoning: 'Thread analysis based on email content and patterns',
        suggestedActions: ['Review all messages', 'Identify action items', 'Schedule follow-up']
      }
    });

    // Convert emails to conversational messages
    thread.emails.forEach((email, index) => {
      const isFromUser = email.senderEmail === 'alex.chen@company.com';
      
      messages.push({
        id: email.id,
        type: 'email',
        emailData: email,
        content: email.content,
        timestamp: email.timestamp,
        sender: email.senderName,
        isFromUser,
        aiContext: email.aiContext ? {
          confidence: 0.85,
          reasoning: `Analyzed email sentiment and extracted key information`,
          suggestedActions: ['Reply', 'Forward', 'Archive']
        } : undefined
      });

      // Add AI insights after important emails
      if (email.aiContext && (email.priority === 'high' || email.priority === 'urgent')) {
        messages.push({
          id: `ai_insight_${email.id}`,
          type: 'ai_insight',
          content: `AI detected ${email.priority} priority email with ${email.aiContext.sentiment} sentiment. Key topics: ${email.aiContext.actionItems.join(', ')}`,
          timestamp: email.timestamp,
          sender: 'Thread AI',
          isFromUser: false,
          aiContext: {
            confidence: 0.9,
            reasoning: 'High-priority email analysis with action item extraction',
            suggestedActions: ['Review urgency', 'Set reminder', 'Delegate task']
          }
        });
      }
    });

    // Add action items summary
    if (thread.threadInsights?.actionItems.length) {
      messages.push({
        id: `actions_${thread.id}`,
        type: 'action_item',
        content: `Outstanding action items: ${thread.threadInsights.actionItems.join(', ')}`,
        timestamp: new Date().toISOString(),
        sender: 'Thread AI',
        isFromUser: false,
        aiContext: {
          confidence: 0.88,
          reasoning: 'Aggregated action items from thread analysis',
          suggestedActions: ['Create tasks', 'Set deadlines', 'Assign owners']
        }
      });
    }

    return messages;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;
    
    setIsComposing(true);
    
    // Add user message
    const userMessage: ConversationalMessage = {
      id: `msg_${Date.now()}`,
      type: 'email',
      content: newMessage,
      timestamp: new Date().toISOString(),
      sender: 'Alex Chen',
      isFromUser: true
    };
    
    setConversationalMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ConversationalMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai_insight',
        content: `I'll help you compose and send that email. Based on the thread context, I recommend a ${selectedThread.threadInsights?.sentiment === 'positive' ? 'friendly' : 'professional'} tone.`,
        timestamp: new Date().toISOString(),
        sender: 'Thread AI',
        isFromUser: false,
        aiContext: {
          confidence: 0.92,
          reasoning: 'Context-aware response based on thread sentiment and communication patterns',
          suggestedActions: ['Send email', 'Schedule follow-up', 'Set reminder']
        }
      };
      
      setConversationalMessages(prev => [...prev, aiResponse]);
      setIsComposing(false);
    }, 1500);
  };

  const handleAICompose = (content: string, tone: string, priority: string) => {
    console.log('AI composed email:', { content, tone, priority });
    setShowAIAssistant(false);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'ai_insight': return <Brain className="w-4 h-4 text-primary" />;
      case 'thread_summary': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'action_item': return <Target className="w-4 h-4 text-orange-500" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'mixed': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={cn("h-full flex bg-background overflow-hidden", className)}>
      {/* Thread List Sidebar */}
      <div className="w-80 border-r border-border flex flex-col h-full">
        <div className="p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-primary neural-glow" />
            Email Conversations
            {isDemoMode && (
              <Badge variant="outline" className="text-xs ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Demo Mode
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered email threads
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {emailThreads.map((thread) => (
                <Card
                  key={thread.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedThread?.id === thread.id ? "ring-2 ring-primary bg-primary/5" : ""
                  )}
                  onClick={() => setSelectedThread(thread)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate mb-1">
                          {thread.subject}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {thread.emails.length} emails
                          </Badge>
                          {thread.threadInsights && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getSentimentColor(thread.threadInsights.sentiment))}
                            >
                              {thread.threadInsights.sentiment}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{thread.participants.length} participants</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{formatTime(thread.lastActivity)}</span>
                        </div>
                      </div>
                      {thread.isAiEnabled && (
                        <Brain className="w-4 h-4 text-primary neural-glow" />
                      )}
                    </div>
                    
                    {thread.threadInsights && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            Relationship: {Math.round(thread.threadInsights.relationshipScore * 100)}%
                          </span>
                        </div>
                        {thread.threadInsights.actionItems.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Target className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-muted-foreground">
                              {thread.threadInsights.actionItems.length} action items
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Conversational View */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-xl font-semibold mb-1">{selectedThread.subject}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{selectedThread.participants.length} participants</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{selectedThread.emails.length} emails</span>
                    </div>
                    {selectedThread.threadInsights && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Relationship: {Math.round(selectedThread.threadInsights.relationshipScore * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAIAssistant(!showAIAssistant)}
                          className={showAIAssistant ? "bg-primary/10" : ""}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          AI Assistant
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle AI Email Assistant</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4 mr-2" />
                    Meet
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Conversation */}
              <div className={cn("flex-1 flex flex-col", showAIAssistant ? "w-2/3" : "w-full")}>
                <ScrollArea className="flex-1">
                  <div className="space-y-4 p-4">
                    {conversationalMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex items-start space-x-3",
                          message.isFromUser ? "flex-row-reverse space-x-reverse" : ""
                        )}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          {message.type === 'ai_insight' || message.type === 'thread_summary' || message.type === 'action_item' ? (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <Brain className="w-4 h-4 text-primary" />
                            </div>
                          ) : (
                            <AvatarFallback>
                              {message.sender.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className={cn(
                          "flex-1 max-w-[80%]",
                          message.isFromUser ? "flex flex-col items-end" : ""
                        )}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{message.sender}</span>
                            {getMessageIcon(message.type)}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          
                          <div className={cn(
                            "rounded-lg p-3 max-w-full",
                            message.isFromUser 
                              ? "bg-primary text-primary-foreground ml-8" 
                              : message.type === 'ai_insight' 
                                ? "bg-primary/5 border border-primary/20" 
                                : message.type === 'action_item'
                                  ? "bg-orange-50 border border-orange-200"
                                  : "bg-muted"
                          )}>
                            <div className="whitespace-pre-wrap text-sm">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isComposing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start space-x-3"
                      >
                        <Avatar className="w-8 h-8">
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-primary animate-pulse" />
                          </div>
                        </Avatar>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-sm text-primary">
                            <Brain className="w-4 h-4 animate-pulse" />
                            <span>AI is analyzing and composing response...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message or email..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="pr-12"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isComposing}
                      className="neural-glow"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Assistant Panel */}
              <AnimatePresence>
                {showAIAssistant && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '33.333333%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-l border-border bg-muted/20 overflow-hidden"
                  >
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        <AIEmailAssistant
                          emailContent={selectedThread.emails[selectedThread.emails.length - 1]?.content}
                          recipientEmail={selectedThread.participants.find(p => p !== 'alex.chen@company.com')}
                          recipientName={selectedThread.participants.find(p => p !== 'alex.chen@company.com')?.split('@')[0]}
                          context={`Email thread: ${selectedThread.subject}`}
                          onCompose={handleAICompose}
                        />
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Select an Email Thread</h3>
                <p className="text-muted-foreground">Choose a conversation to view AI-powered email insights</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}