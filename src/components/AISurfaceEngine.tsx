import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  Users, 
  MessageCircle,
  Lightbulb,
  ArrowRight,
  X,
  Sparkles,
  Search,
  Filter,
  Calendar,
  Tag
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import type { Thread, Message } from '../lib/blink'
import { demoUsers } from '../data/demoData'

interface SurfacedInsight {
  id: string
  type: 'forgotten_thread' | 'trending_topic' | 'action_needed' | 'knowledge_gap' | 'connection_opportunity'
  title: string
  description: string
  threadId?: string
  threadName?: string
  participants?: string[]
  lastActivity: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  aiReasoning: string
  suggestedActions: string[]
  relatedThreads?: string[]
  keywords: string[]
  confidence: number
}

interface AISurfaceEngineProps {
  threads: Thread[]
  messages: Record<string, Message[]>
  onThreadSelect: (threadId: string) => void
  onInsightDismiss: (insightId: string) => void
  className?: string
}

export function AISurfaceEngine({
  threads,
  messages,
  onThreadSelect,
  onInsightDismiss,
  className = ''
}: AISurfaceEngineProps) {
  const [insights, setInsights] = useState<SurfacedInsight[]>([])
  const [filteredInsights, setFilteredInsights] = useState<SurfacedInsight[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Generate AI insights from threads and messages
  const generateInsights = useCallback(async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const generatedInsights: SurfacedInsight[] = []
    const now = new Date()
    
    // Analyze each thread for insights
    threads.forEach(thread => {
      const threadMessages = messages[thread.id] || []
      const lastActivity = new Date(thread.updatedAt)
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      
      // Forgotten threads (no activity in 3+ days)
      if (daysSinceActivity >= 3 && threadMessages.length > 0) {
        generatedInsights.push({
          id: `forgotten_${thread.id}`,
          type: 'forgotten_thread',
          title: `Forgotten Thread: ${thread.name}`,
          description: `No activity for ${daysSinceActivity} days. Last message discussed important topics that may need follow-up.`,
          threadId: thread.id,
          threadName: thread.name,
          participants: thread.participants,
          lastActivity: thread.updatedAt,
          priority: daysSinceActivity > 7 ? 'high' : 'medium',
          aiReasoning: `Thread has been inactive for ${daysSinceActivity} days despite containing ${threadMessages.length} messages with actionable content.`,
          suggestedActions: [
            'Review last conversation',
            'Send follow-up message',
            'Schedule check-in meeting',
            'Archive if no longer relevant'
          ],
          keywords: ['follow-up', 'inactive', 'review'],
          confidence: 0.85
        })
      }
      
      // Trending topics (high message volume recently)
      const recentMessages = threadMessages.filter(msg => {
        const msgDate = new Date(msg.timestamp)
        const hoursSinceMessage = (now.getTime() - msgDate.getTime()) / (1000 * 60 * 60)
        return hoursSinceMessage <= 24
      })
      
      if (recentMessages.length >= 5) {
        generatedInsights.push({
          id: `trending_${thread.id}`,
          type: 'trending_topic',
          title: `Trending: ${thread.name}`,
          description: `High activity with ${recentMessages.length} messages in the last 24 hours. Key discussions around important decisions.`,
          threadId: thread.id,
          threadName: thread.name,
          participants: thread.participants,
          lastActivity: thread.updatedAt,
          priority: 'high',
          aiReasoning: `Unusual spike in activity suggests important developments or decisions being made.`,
          suggestedActions: [
            'Review recent decisions',
            'Summarize key points',
            'Identify action items',
            'Share updates with stakeholders'
          ],
          keywords: ['trending', 'active', 'decisions'],
          confidence: 0.92
        })
      }
      
      // Action needed (messages with questions or requests)
      const actionMessages = threadMessages.filter(msg => 
        msg.content.includes('?') || 
        msg.content.toLowerCase().includes('need') ||
        msg.content.toLowerCase().includes('can you') ||
        msg.content.toLowerCase().includes('please')
      )
      
      if (actionMessages.length > 0 && daysSinceActivity <= 2) {
        const latestActionMessage = actionMessages[actionMessages.length - 1]
        generatedInsights.push({
          id: `action_${thread.id}`,
          type: 'action_needed',
          title: `Action Required: ${thread.name}`,
          description: `Pending responses to questions or requests. Latest: "${latestActionMessage.content.substring(0, 100)}..."`,
          threadId: thread.id,
          threadName: thread.name,
          participants: thread.participants,
          lastActivity: thread.updatedAt,
          priority: 'urgent',
          aiReasoning: `Detected ${actionMessages.length} messages requiring responses or actions.`,
          suggestedActions: [
            'Respond to pending questions',
            'Assign action items',
            'Set deadlines',
            'Follow up with team'
          ],
          keywords: ['action', 'response', 'urgent'],
          confidence: 0.88
        })
      }
    })
    
    // Knowledge gaps (topics mentioned but not fully explored)
    const allMessages = Object.values(messages).flat()
    const topicMentions = new Map<string, number>()
    
    // Count mentions of key topics
    const keyTopics = ['AI', 'semantic search', 'architecture', 'design', 'user experience', 'performance', 'security']
    keyTopics.forEach(topic => {
      const mentions = allMessages.filter(msg => 
        msg.content.toLowerCase().includes(topic.toLowerCase())
      ).length
      if (mentions > 0) {
        topicMentions.set(topic, mentions)
      }
    })
    
    // Find topics with few mentions (potential knowledge gaps)
    topicMentions.forEach((mentions, topic) => {
      if (mentions >= 2 && mentions <= 4) {
        generatedInsights.push({
          id: `knowledge_gap_${topic}`,
          type: 'knowledge_gap',
          title: `Knowledge Gap: ${topic}`,
          description: `Topic mentioned ${mentions} times but lacks deep discussion. May benefit from dedicated exploration.`,
          lastActivity: new Date().toISOString(),
          priority: 'medium',
          aiReasoning: `Topic "${topic}" appears in conversations but lacks comprehensive coverage.`,
          suggestedActions: [
            'Schedule deep-dive session',
            'Research best practices',
            'Invite subject matter expert',
            'Create knowledge base entry'
          ],
          keywords: [topic.toLowerCase(), 'research', 'knowledge'],
          confidence: 0.75
        })
      }
    })
    
    // Connection opportunities (similar discussions in different threads)
    const threadTopics = new Map<string, string[]>()
    threads.forEach(thread => {
      const threadMessages = messages[thread.id] || []
      const topics = keyTopics.filter(topic =>
        threadMessages.some(msg => msg.content.toLowerCase().includes(topic.toLowerCase()))
      )
      if (topics.length > 0) {
        threadTopics.set(thread.id, topics)
      }
    })
    
    // Find threads with overlapping topics
    const threadIds = Array.from(threadTopics.keys())
    for (let i = 0; i < threadIds.length; i++) {
      for (let j = i + 1; j < threadIds.length; j++) {
        const thread1Topics = threadTopics.get(threadIds[i]) || []
        const thread2Topics = threadTopics.get(threadIds[j]) || []
        const commonTopics = thread1Topics.filter(topic => thread2Topics.includes(topic))
        
        if (commonTopics.length >= 2) {
          const thread1 = threads.find(t => t.id === threadIds[i])
          const thread2 = threads.find(t => t.id === threadIds[j])
          
          if (thread1 && thread2) {
            generatedInsights.push({
              id: `connection_${thread1.id}_${thread2.id}`,
              type: 'connection_opportunity',
              title: `Connection Opportunity`,
              description: `"${thread1.name}" and "${thread2.name}" are discussing similar topics: ${commonTopics.join(', ')}`,
              lastActivity: new Date().toISOString(),
              priority: 'low',
              aiReasoning: `Detected overlapping discussions that could benefit from coordination.`,
              suggestedActions: [
                'Cross-reference discussions',
                'Merge related threads',
                'Share insights between teams',
                'Coordinate efforts'
              ],
              relatedThreads: [thread1.id, thread2.id],
              keywords: commonTopics.map(t => t.toLowerCase()),
              confidence: 0.70
            })
          }
        }
      }
    }
    
    // Sort by priority and confidence
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    generatedInsights.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.confidence - a.confidence
    })
    
    setInsights(generatedInsights)
    setIsAnalyzing(false)
  }, [threads, messages])
  
  // Filter insights based on search and filters
  useEffect(() => {
    let filtered = insights
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(insight =>
        insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(insight => insight.type === filterType)
    }
    
    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === filterPriority)
    }
    
    setFilteredInsights(filtered)
  }, [insights, searchQuery, filterType, filterPriority])
  
  // Generate insights on component mount
  useEffect(() => {
    generateInsights()
  }, [threads, messages, generateInsights])
  
  const getInsightIcon = (type: SurfacedInsight['type']) => {
    switch (type) {
      case 'forgotten_thread': return <Clock className="w-5 h-5 text-orange-500" />
      case 'trending_topic': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'action_needed': return <MessageCircle className="w-5 h-5 text-red-500" />
      case 'knowledge_gap': return <Lightbulb className="w-5 h-5 text-blue-500" />
      case 'connection_opportunity': return <Users className="w-5 h-5 text-purple-500" />
      default: return <Brain className="w-5 h-5 text-primary" />
    }
  }
  
  const getPriorityColor = (priority: SurfacedInsight['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-950'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950'
      case 'medium': return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
      case 'low': return 'border-gray-500 bg-gray-50 dark:bg-gray-950'
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950'
    }
  }
  
  const handleInsightClick = (insight: SurfacedInsight) => {
    if (insight.threadId) {
      onThreadSelect(insight.threadId)
    }
  }
  
  const handleDismiss = (insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId))
    onInsightDismiss(insightId)
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary neural-glow" />
            <h3 className="font-semibold">AI Surface Engine</h3>
            <Badge variant="secondary" className="neural-glow">
              <Sparkles className="w-3 h-3 mr-1" />
              {filteredInsights.length} insights
            </Badge>
          </div>
          <Button
            onClick={generateInsights}
            disabled={isAnalyzing}
            size="sm"
            className="neural-glow"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
        
        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="forgotten_thread">Forgotten Threads</SelectItem>
                <SelectItem value="trending_topic">Trending Topics</SelectItem>
                <SelectItem value="action_needed">Action Needed</SelectItem>
                <SelectItem value="knowledge_gap">Knowledge Gaps</SelectItem>
                <SelectItem value="connection_opportunity">Connections</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Insights List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <AnimatePresence>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Brain className="w-12 h-12 mx-auto text-primary animate-pulse neural-glow" />
                  <div>
                    <p className="font-medium">AI is analyzing your conversations...</p>
                    <p className="text-sm text-muted-foreground">Discovering patterns and surfacing insights</p>
                  </div>
                </div>
              </div>
            ) : filteredInsights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No insights found</p>
                <p className="text-sm mt-2">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              filteredInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${getPriorityColor(insight.priority)} border-l-4`}
                    onClick={() => handleInsightClick(insight)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base">{insight.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDismiss(insight.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                        {insight.threadName && (
                          <Badge variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {insight.threadName}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* AI Reasoning */}
                      <div className="mb-3 p-3 bg-primary/5 rounded-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">AI Reasoning</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{insight.aiReasoning}</p>
                      </div>
                      
                      {/* Suggested Actions */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Suggested Actions:</p>
                        <div className="flex flex-wrap gap-1">
                          {insight.suggestedActions.slice(0, 3).map((action, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                          {insight.suggestedActions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{insight.suggestedActions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Participants */}
                      {insight.participants && insight.participants.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-2">Participants:</p>
                          <div className="flex -space-x-2">
                            {insight.participants.slice(0, 4).map((participantId) => {
                              const participant = demoUsers[participantId]
                              return (
                                <Avatar key={participantId} className="w-6 h-6 border-2 border-background">
                                  <AvatarImage src={participant?.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {participant?.displayName?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              )
                            })}
                            {insight.participants.length > 4 && (
                              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs">+{insight.participants.length - 4}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Last Activity */}
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Last activity: {new Date(insight.lastActivity).toLocaleDateString()}</span>
                        </div>
                        {insight.threadId && (
                          <div className="flex items-center space-x-1 text-primary">
                            <span>View thread</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}