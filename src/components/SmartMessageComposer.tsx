import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  Sparkles, 
  Wand2, 
  MessageSquare,
  Lightbulb,
  Zap,
  RefreshCw,
  Check,
  X,
  Volume2,
  Mic,
  Languages
} from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { getBlink } from '../lib/blink'
import type { Thread, Message, User } from '../lib/blink'

interface SmartMessageComposerProps {
  thread: Thread
  messages: Message[]
  user: User
  onSendMessage: (content: string, isAIInvoked?: boolean) => void
  placeholder?: string
  className?: string
}

interface AISuggestion {
  id: string
  type: 'tone' | 'clarity' | 'completion' | 'translation' | 'summary'
  title: string
  content: string
  confidence: number
  originalText?: string
}

interface MessageAnalysis {
  tone: 'professional' | 'casual' | 'friendly' | 'urgent' | 'neutral'
  clarity: number
  sentiment: 'positive' | 'negative' | 'neutral'
  suggestions: string[]
  wordCount: number
  readingLevel: string
}

export function SmartMessageComposer({
  thread,
  messages,
  user,
  onSendMessage,
  placeholder,
  className = ''
}: SmartMessageComposerProps) {
  const [messageInput, setMessageInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [analysis, setAnalysis] = useState<MessageAnalysis | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedTone, setSelectedTone] = useState<string>('auto')
  const [isRecording, setIsRecording] = useState(false)
  const [showAIInvoke, setShowAIInvoke] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [messageInput])

  // Analyze message with AI (debounced)
  useEffect(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current)
    }

    if (messageInput.trim().length > 10) {
      analysisTimeoutRef.current = setTimeout(() => {
        analyzeMessage(messageInput)
      }, 1000) // 1 second debounce
    } else {
      setAnalysis(null)
      setSuggestions([])
    }

    // Show AI invoke option when typing @ai or mentioning AI
    setShowAIInvoke(messageInput.toLowerCase().includes('@ai') || messageInput.toLowerCase().includes('ai'))

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
    }
  }, [messageInput, analyzeMessage])

  const analyzeMessage = useCallback(async (text: string) => {
    setIsAnalyzing(true)
    try {
      const blink = await getBlink()
      if (!blink?.ai) {
        console.warn('AI service not available for message analysis')
        return
      }

      // Get context from recent messages
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.userId === user.id ? 'user' : 'assistant',
        content: msg.content
      }))

      // Analyze the message
      const { object: messageAnalysis } = await blink.ai.generateObject({
        prompt: `Analyze this message for a ${thread.type === 'ai_chat' ? 'AI chat' : 'team communication'} context:

        Message: "${text}"
        
        Thread context: ${thread.name} - ${thread.description || 'No description'}
        Recent conversation: ${JSON.stringify(recentMessages.slice(-3))}
        
        Provide analysis and suggestions for:
        1. Tone and professionalism
        2. Clarity and conciseness  
        3. Potential improvements
        4. Auto-completion suggestions
        5. Translation if needed
        
        Consider the thread type and context when making suggestions.`,
        schema: {
          type: 'object',
          properties: {
            analysis: {
              type: 'object',
              properties: {
                tone: { type: 'string', enum: ['professional', 'casual', 'friendly', 'urgent', 'neutral'] },
                clarity: { type: 'number' },
                sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
                wordCount: { type: 'number' },
                readingLevel: { type: 'string' },
                suggestions: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['tone', 'clarity', 'sentiment', 'wordCount', 'readingLevel', 'suggestions']
            },
            aiSuggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['tone', 'clarity', 'completion', 'translation', 'summary'] },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  confidence: { type: 'number' }
                },
                required: ['type', 'title', 'content', 'confidence']
              }
            }
          },
          required: ['analysis', 'aiSuggestions']
        }
      })

      setAnalysis(messageAnalysis.analysis)
      
      const aiSuggestions: AISuggestion[] = messageAnalysis.aiSuggestions.map((suggestion, index) => ({
        id: `suggestion_${index}`,
        type: suggestion.type as AISuggestion['type'],
        title: suggestion.title,
        content: suggestion.content,
        confidence: suggestion.confidence,
        originalText: text
      }))

      setSuggestions(aiSuggestions)
      setShowSuggestions(aiSuggestions.length > 0)

    } catch (error) {
      console.error('Error analyzing message:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [messages, user.id, thread.type, thread.name, thread.description])

  const handleSendMessage = (isAIInvoked = false) => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim(), isAIInvoked)
      setMessageInput('')
      setAnalysis(null)
      setSuggestions([])
      setShowSuggestions(false)
      setShowAIInvoke(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const applySuggestion = (suggestion: AISuggestion) => {
    setMessageInput(suggestion.content)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const adjustTone = async (targetTone: string) => {
    if (!messageInput.trim()) return

    setIsAnalyzing(true)
    try {
      const blink = await getBlink()
      if (!blink?.ai) return

      const { text } = await blink.ai.generateText({
        prompt: `Rewrite this message in a ${targetTone} tone while preserving the core meaning:

        Original message: "${messageInput}"
        Target tone: ${targetTone}
        Context: ${thread.type === 'ai_chat' ? 'AI chat conversation' : 'team communication'}
        
        Return only the rewritten message, no explanations.`,
        model: 'gpt-4o-mini'
      })

      if (text) {
        setMessageInput(text.trim())
      }
    } catch (error) {
      console.error('Error adjusting tone:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'tone': return <Wand2 className="w-4 h-4" />
      case 'clarity': return <Lightbulb className="w-4 h-4" />
      case 'completion': return <MessageSquare className="w-4 h-4" />
      case 'translation': return <Languages className="w-4 h-4" />
      case 'summary': return <Zap className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500'
    if (confidence >= 60) return 'text-yellow-500'
    return 'text-blue-500'
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Message Analysis */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="bg-muted/50 border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Message Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {analysis.tone}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {analysis.wordCount} words
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Clarity:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex-1 bg-muted rounded-full h-1">
                        <div 
                          className="bg-primary h-1 rounded-full transition-all"
                          style={{ width: `${analysis.clarity}%` }}
                        />
                      </div>
                      <span className="text-xs">{analysis.clarity}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Sentiment:</span>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          analysis.sentiment === 'positive' ? 'text-green-500' :
                          analysis.sentiment === 'negative' ? 'text-red-500' :
                          'text-gray-500'
                        }`}
                      >
                        {analysis.sentiment}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Reading Level:</span>
                    <div className="mt-1">
                      <span className="text-xs">{analysis.readingLevel}</span>
                    </div>
                  </div>
                </div>

                {analysis.suggestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Quick tips:</span>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      {analysis.suggestions.slice(0, 2).map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span>•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Composer */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder || `Message ${thread.name}...`}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[80px] max-h-[200px] resize-none pr-12"
          disabled={isAnalyzing}
        />

        {/* AI Invoke Button */}
        <AnimatePresence>
          {showAIInvoke && thread.type !== 'ai_chat' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-3"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 neural-glow"
                      onClick={() => handleSendMessage(true)}
                    >
                      <Bot className="w-4 h-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Invoke AI Assistant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isAnalyzing && (
          <div className="absolute right-3 bottom-3">
            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="bg-card border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Suggestions</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{suggestion.title}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                          >
                            {suggestion.confidence}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {suggestion.content}
                        </p>
                      </div>
                      <Check className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Tone Selector */}
          <Select value={selectedTone} onValueChange={setSelectedTone}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto Tone</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          {/* Tone Adjustment */}
          {selectedTone !== 'auto' && messageInput.trim() && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustTone(selectedTone)}
                    disabled={isAnalyzing}
                  >
                    <Wand2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adjust tone to {selectedTone}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Voice Recording */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={isRecording ? 'text-red-500 border-red-500' : ''}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? 'Stop recording' : 'Voice message'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Send Button */}
        <Button 
          onClick={() => handleSendMessage()}
          disabled={!messageInput.trim() || isAnalyzing}
          className="neural-glow"
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>

      {/* AI Hint */}
      {thread.aiEnabled && thread.type !== 'ai_chat' && (
        <p className="text-xs text-muted-foreground flex items-center">
          <Sparkles className="w-3 h-3 mr-1" />
          Type @ai to invoke the AI assistant • AI analysis helps improve your messages
        </p>
      )}
    </div>
  )
}