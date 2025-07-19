import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MessageCircle,
  Brain,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ConversationalEmailView } from './ConversationalEmailView';
import { TraditionalEmailView } from './TraditionalEmailView';
import { EmailConnectionFlow } from './EmailConnectionFlow';
import { cn } from '../lib/utils';

interface EmailViewProps {
  isDemoMode?: boolean;
}

export function EmailView({ isDemoMode = false }: EmailViewProps) {
  const [viewMode, setViewMode] = useState<'traditional' | 'conversational'>('conversational');
  const [showIntro, setShowIntro] = useState(true);
  const [showConnectionFlow, setShowConnectionFlow] = useState(!isDemoMode); // Only show connection flow in production mode
  const [hasEmailConnection, setHasEmailConnection] = useState(isDemoMode); // Demo mode has connection by default

  const handleEmailConnectionComplete = (provider: string, config: any) => {
    console.log('Email connection completed:', provider, config);
    setHasEmailConnection(true);
    setShowConnectionFlow(false);
  };

  const handleEmailConnectionCancel = () => {
    setShowConnectionFlow(false);
  };

  // Show connection flow if no email connection
  if (showConnectionFlow && !hasEmailConnection) {
    return (
      <div className="h-full bg-background">
        <EmailConnectionFlow 
          onComplete={handleEmailConnectionComplete}
          onCancel={handleEmailConnectionCancel}
        />
      </div>
    );
  }

  console.log('EmailView rendering with mode:', viewMode);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* AI-First Email Introduction */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary neural-glow" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">AI-First Email Experience</h2>
                      <p className="text-muted-foreground">Transform your email into intelligent conversations</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageCircle className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">Chat-like Threads</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Email conversations displayed as natural chat threads with AI insights
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">Smart Analysis</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI extracts sentiment, action items, and relationship insights automatically
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">AI Compose</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Generate context-aware replies with tone adjustment and voice input
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIntro(false)}
                  className="self-start"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Toggle */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold flex items-center">
              <Mail className="w-6 h-6 mr-2 text-primary neural-glow" />
              Email
            </h1>
            {isDemoMode && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Demo Mode
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'conversational' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('conversational')}
                    className={viewMode === 'conversational' ? 'neural-glow' : ''}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Conversational
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI-powered conversational email view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'traditional' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('traditional')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Traditional
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Traditional email view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Email Interface */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'conversational' && (
            <motion.div
              key="conversational"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ConversationalEmailView isDemoMode={isDemoMode} />
            </motion.div>
          )}
          
          {viewMode === 'traditional' && (
            <motion.div
              key="traditional"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <TraditionalEmailView isDemoMode={isDemoMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}