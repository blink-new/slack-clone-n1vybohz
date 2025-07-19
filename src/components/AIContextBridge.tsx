import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Link2, 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  Mail,
  X,
  Zap,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getBlink } from '../lib/blink'
import type { Thread, Message, User } from '../lib/blink'
import type { EmailData } from '../data/demoData'
import { demoUsers, demoEmails, demoMessages } from '../data/demoData'

interface AIContextBridgeProps {
  currentThread?: Thread | null
  currentMessages?: Message[]
  user: User
  onNavigateToThread: (threadId: string) => void
  onNavigateToEmail: (emailId: string) => void
  className?: string
}

interface ContextConnection {
  id: string
  type: 'thread' | 'email' | 'message'
  title: string
  description: string
  relevanceScore: number
  connectionReason: string
  timestamp: string
  participants?: string[]
  preview?: string
  metadata?: {
    threadId?: string
    emailId?: string
    messageId?: string
    senderName?: string
    threadName?: string
  }
}

interface AIInsight {
  id: string
  type: 'pattern' | 'suggestion' | 'summary' | 'prediction'
  title: string
  content: string
  confidence: number
  actionable: boolean
  relatedConnections: string[]
}

export function AIContextBridge({ 
  currentThread, 
  currentMessages = [], 
  user, 
  onNavigateToThread, 
  onNavigateToEmail,
  className = '' 
}: AIContextBridgeProps) {
  const [connections, setConnections] = useState<ContextConnection[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<ContextConnection | null>(null)

  // Generate demo connections function
  const generateDemoConnections = useCallback(() => {
    // Generate demo connections based on current thread
    const demoConnections: ContextConnection[] = []

    if (currentThread?.name === 'Product Strategy') {
      demoConnections.push(
        {
          id: 'conn_1',
          type: 'email',
          title: 'Q1 Product Roadmap Review',
          description: 'Sarah\'s email about semantic search prioritization aligns with current discussion',
          relevanceScore: 95,
          connectionReason: 'Both discuss semantic search feature prioritization and Q1 roadmap',
          timestamp: '2024-01-18T09:30:00Z',
          preview: 'Sarah supports prioritizing semantic search feature based on user research...',
          metadata: {
            emailId: 'email_1',
            senderName: 'Sarah Martinez'
          }
        },
        {
          id: 'conn_2',
          type: 'thread',
          title: 'Engineering',
          description: 'Technical implementation discussion for semantic search feature',
          relevanceScore: 88,
          connectionReason: 'Engineering team discussing technical feasibility of semantic search',
          timestamp: '2024-01-17T09:00:00Z',
          preview: 'Mike discussing WebSocket scaling and Redis Streams implementation...',
          metadata: {
            threadId: 'demo_engineering',
            threadName: 'Engineering'
          }
        }
      )
    } else if (currentThread?.name === 'Engineering') {
      demoConnections.push(
        {
          id: 'conn_3',
          type: 'email',
          title: 'Weekly Engineering Standup Notes',
          description: 'Mike\'s standup notes mention Redis Streams implementation progress',
          relevanceScore: 92,
          connectionReason: 'Direct follow-up to Redis Streams discussion in this thread',
          timestamp: '2024-01-17T16:45:00Z',
          preview: 'Engineering update: WebSocket scaling completed, Redis Streams in progress...',
          metadata: {
            emailId: 'email_2',
            senderName: 'Mike Johnson'
          }
        }
      )
    }

    // Add some general connections
    demoConnections.push(
      {
        id: 'conn_4',
        type: 'thread',
        title: 'Design System',
        description: 'Neural aesthetics discussion relates to AI-native platform design',
        relevanceScore: 75,
        connectionReason: 'Design philosophy aligns with AI-native messaging approach',
        timestamp: '2024-01-16T14:00:00Z',
        preview: 'Lisa discussing neural-inspired design language and organic animations...',
        metadata: {
          threadId: 'demo_design_system',
          threadName: 'Design System'
        }
      }
    )

    setConnections(demoConnections)

    // Generate demo insights
    const demoInsights: AIInsight[] = [
      {
        id: 'insight_1',
        type: 'pattern',
        title: 'Cross-team Alignment Pattern',
        content: 'Product, Engineering, and Design teams are converging on AI-native features. This suggests strong organizational alignment on the strategic direction.',
        confidence: 87,
        actionable: true,
        relatedConnections: ['conn_1', 'conn_2', 'conn_4']
      },
      {
        id: 'insight_2',
        type: 'suggestion',
        title: 'Consolidate Technical Discussions',
        content: 'Consider creating a dedicated technical architecture thread to centralize Redis Streams, semantic search, and scaling discussions.',
        confidence: 82,
        actionable: true,
        relatedConnections: ['conn_2', 'conn_3']
      },
      {
        id: 'insight_3',
        type: 'prediction',
        title: 'Implementation Timeline Acceleration',
        content: 'Based on current momentum and cross-team engagement, semantic search implementation could be completed 2-3 weeks ahead of schedule.',
        confidence: 74,
        actionable: false,
        relatedConnections: ['conn_1', 'conn_2']
      }
    ]

    setInsights(demoInsights)
  }, [currentThread?.name])

  // Generate context connections using AI
  useEffect(() => {
    if (!currentThread || currentMessages.length === 0) return

    const generateContextConnections = async () => {
      setIsLoading(true)
      try {
        const blink = await getBlink()
        if (!blink?.ai) {
          console.warn('AI service not available for context bridge')
          // Use demo data fallback
          generateDemoConnections()
          return
        }

        // Prepare context for AI analysis
        const recentMessages = currentMessages.slice(-10).map(msg => ({
          content: msg.content,
          timestamp: msg.timestamp,
          userId: msg.userId,
          type: msg.type
        }))

        const threadContext = {
          threadName: currentThread.name,
          threadType: currentThread.type,
          description: currentThread.description,
          recentMessages
        }

        // Use AI to find semantic connections
        const { object: analysis } = await blink.ai.generateObject({
          prompt: `Analyze this thread context and find semantic connections to other conversations:
          
          Current Thread: ${JSON.stringify(threadContext, null, 2)}
          
          Based on the content, topics, and context, identify potential connections to:
          1. Related email conversations
          2. Similar thread discussions
          3. Follow-up conversations
          4. Cross-referenced topics
          
          For each connection, provide:
          - Relevance score (0-100)
          - Connection reason
          - Suggested action
          
          Focus on meaningful semantic relationships, not just keyword matches.`,
          schema: {
            type: 'object',
            properties: {
              connections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['thread', 'email', 'message'] },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    relevanceScore: { type: 'number' },
                    connectionReason: { type: 'string' },
                    suggestedAction: { type: 'string' }
                  },
                  required: ['type', 'title', 'description', 'relevanceScore', 'connectionReason']
                }
              },
              insights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['pattern', 'suggestion', 'summary', 'prediction'] },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    confidence: { type: 'number' },
                    actionable: { type: 'boolean' }
                  },
                  required: ['type', 'title', 'content', 'confidence', 'actionable']
                }
              }
            },
            required: ['connections', 'insights']
          }
        })

        // Transform AI analysis to our format
        const contextConnections: ContextConnection[] = analysis.connections.map((conn, index) => ({
          id: `conn_${index}`,
          type: conn.type as ContextConnection['type'],
          title: conn.title,
          description: conn.description,
          relevanceScore: conn.relevanceScore,
          connectionReason: conn.connectionReason,
          timestamp: new Date().toISOString(),
          preview: conn.description.slice(0, 100) + '...'
        }))

        const aiInsights: AIInsight[] = analysis.insights.map((insight, index) => ({
          id: `insight_${index}`,
          type: insight.type as AIInsight['type'],
          title: insight.title,
          content: insight.content,
          confidence: insight.confidence,
          actionable: insight.actionable,
          relatedConnections: []
        }))

        setConnections(contextConnections)
        setInsights(aiInsights)

      } catch (error) {
        console.error('Error generating context connections:', error)
        generateDemoConnections()
      } finally {
        setIsLoading(false)
      }
    }

    generateContextConnections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentThread?.id, currentMessages.length, generateDemoConnections])

  const handleConnectionClick = (connection: ContextConnection) => {
    if (connection.type === 'thread' && connection.metadata?.threadId) {
      onNavigateToThread(connection.metadata.threadId)
    } else if (connection.type === 'email' && connection.metadata?.emailId) {
      onNavigateToEmail(connection.metadata.emailId)
    }
    setSelectedConnection(connection)
  }

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'thread': return <MessageCircle className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'message': return <MessageCircle className="w-4 h-4" />
      default: return <Link2 className="w-4 h-4" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-4 h-4" />
      case 'suggestion': return <Zap className="w-4 h-4" />
      case 'summary': return <Brain className="w-4 h-4" />
      case 'prediction': return <Clock className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 75) return 'text-yellow-500'
    return 'text-blue-500'
  }

  if (!currentThread) {
    return null
  }

  return (
    <div className={`bg-card border-l border-border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary neural-glow" />
            <div>
              <h3 className="font-semibold">AI Context Bridge</h3>
              <p className="text-xs text-muted-foreground">
                Intelligent conversation connections
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <X className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ScrollArea className="h-96">
              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-primary animate-pulse" />
                      <span className="text-sm text-muted-foreground">
                        Analyzing connections...
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                {insights.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-sm">AI Insights</h4>
                    </div>
                    {insights.map((insight) => (
                      <Card key={insight.id} className="bg-primary/5 border-primary/20">
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-0.5">
                              {getInsightIcon(insight.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-medium text-sm">{insight.title}</h5>
                                <Badge variant="secondary" className="text-xs">
                                  {insight.confidence}% confident
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {insight.content}
                              </p>
                              {insight.actionable && (
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Actionable
                                </Badge>
                              )}\n                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}\n                  </div>
                )}

                {/* Context Connections */}
                {connections.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="flex items-center space-x-2">
                      <Link2 className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-sm">Related Conversations</h4>
                    </div>
                    {connections
                      .sort((a, b) => b.relevanceScore - a.relevanceScore)
                      .map((connection) => (
                        <Card 
                          key={connection.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleConnectionClick(connection)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getConnectionIcon(connection.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="font-medium text-sm truncate">
                                    {connection.title}
                                  </h5>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getRelevanceColor(connection.relevanceScore)}`}
                                  >
                                    {connection.relevanceScore}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {connection.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {connection.connectionReason}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}\n                  </div>
                )}

                {/* Empty State */}
                {!isLoading && connections.length === 0 && insights.length === 0 && (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No connections found yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Continue the conversation to discover related content
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact View */}
      {!isExpanded && connections.length > 0 && (
        <div className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {connections.length} connection{connections.length > 1 ? 's' : ''} found
              </span>
              <Badge variant="secondary" className="text-xs neural-glow">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Active
              </Badge>
            </div>
            
            {/* Top connection preview */}
            {connections[0] && (
              <Card 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleConnectionClick(connections[0])}
              >
                <CardContent className="p-2">
                  <div className="flex items-center space-x-2">
                    {getConnectionIcon(connections[0].type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {connections[0].title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {connections[0].relevanceScore}% relevant
                      </p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}