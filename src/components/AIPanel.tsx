import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Brain, 
  Search, 
  Lightbulb, 
  TrendingUp,
  MessageSquare,
  Sparkles,
  Bot,
  Zap
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import type { Thread, Message } from '../lib/blink'

interface AIPanelProps {
  thread: Thread | null
  messages: Message[]
  onClose: () => void
  onSendMessage: (content: string, isAIInvoked?: boolean) => void
}

export function AIPanel({ thread, messages, onClose, onSendMessage }: AIPanelProps) {
  const [aiQuery, setAiQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return
    
    setIsAnalyzing(true)
    onSendMessage(aiQuery, true)
    setAiQuery('')
    setIsAnalyzing(false)
  }

  const getThreadInsights = () => {
    const totalMessages = messages.length
    const aiMessages = messages.filter(m => m.type === 'ai_response').length
    const userMessages = totalMessages - aiMessages
    
    return {
      totalMessages,
      aiMessages,
      userMessages,
      topics: extractTopics(messages),
      sentiment: analyzeSentiment(messages)
    }
  }

  const extractTopics = (messages: Message[]) => {
    // Simple keyword extraction (in a real app, this would use NLP)
    const words = messages
      .map(m => m.content.toLowerCase())
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    const wordCount: Record<string, number> = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }))
  }

  const analyzeSentiment = (messages: Message[]) => {
    // Simple sentiment analysis (in a real app, this would use ML)
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'like', 'happy']
    const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated']
    
    let positive = 0
    let negative = 0
    
    messages.forEach(message => {
      const content = message.content.toLowerCase()
      positiveWords.forEach(word => {
        if (content.includes(word)) positive++
      })
      negativeWords.forEach(word => {
        if (content.includes(word)) negative++
      })
    })
    
    if (positive > negative) return 'positive'
    if (negative > positive) return 'negative'
    return 'neutral'
  }

  const insights = getThreadInsights()

  const suggestedQueries = [
    "Summarize this conversation",
    "What are the key action items?",
    "Find relevant research on this topic",
    "Generate follow-up questions",
    "Analyze the main themes discussed"
  ]

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-96 bg-card border-l border-border flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary neural-glow" />
            <h3 className="font-semibold">AI Copilot</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="insights" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="flex-1 p-4 space-y-4">
            <ScrollArea className="flex-1">
              {/* Thread Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Thread Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Messages</span>
                    <span className="font-medium">{insights.totalMessages}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">AI Responses</span>
                    <span className="font-medium">{insights.aiMessages}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sentiment</span>
                    <Badge 
                      variant={
                        insights.sentiment === 'positive' ? 'default' : 
                        insights.sentiment === 'negative' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {insights.sentiment}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Key Topics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Key Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.topics.map((topic, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="capitalize">{topic.word}</span>
                        <Badge variant="outline" className="text-xs">
                          {topic.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestedQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => onSendMessage(query, true)}
                    >
                      <Zap className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-xs">{query}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="query" className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  Ask AI Anything
                </h4>
                <div className="space-y-2">
                  <Input
                    placeholder="What would you like to know?"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                  />
                  <Button 
                    onClick={handleAIQuery}
                    disabled={!aiQuery.trim() || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground">Quick Actions</h5>
                {suggestedQueries.slice(0, 3).map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onSendMessage(query, true)}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="flex-1 p-4">
            <div className="space-y-4">
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4 neural-glow" />
                <h4 className="font-medium mb-2">Semantic Memory</h4>
                <p className="text-sm text-muted-foreground">
                  AI is building a knowledge graph from your conversations. 
                  This feature will surface relevant memories and connections.
                </p>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <MessageSquare className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Memory clusters will appear here as you chat more
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}