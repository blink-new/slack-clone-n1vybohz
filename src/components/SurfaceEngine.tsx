import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Sparkles, 
  Clock, 
  TrendingUp,
  MessageCircle,
  Mail,
  Calendar,
  Users,
  ArrowRight,
  X,
  Zap,
  Eye,
  AlertCircle
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import type { User, Thread, Message } from '../lib/blink'

interface SurfacedItem {
  id: string
  type: 'thread' | 'email' | 'message' | 'meeting' | 'context'
  title: string
  subtitle?: string
  content: string
  timestamp: string
  relevanceScore: number
  surfaceReason: string
  aiInsight: string
  actionSuggestion?: string
  relatedItems?: string[]
  metadata?: {
    participants?: string[]
    threadId?: string
    emailId?: string
    meetingId?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  }
}

interface SurfaceEngineProps {
  user: User
  threads: Thread[]
  messages: Message[]
  isDemoMode?: boolean
  onNavigate: (type: string, id: string) => void
  onDismiss?: (itemId: string) => void
}

// Demo surfaced items
const demoSurfacedItems: SurfacedItem[] = [
  {
    id: 'surface_1',
    type: 'thread',
    title: 'Product Strategy Discussion',
    subtitle: '#product-strategy • 3 days ago',
    content: 'Sarah mentioned semantic search ROI analysis - this aligns with current BigCorp client interest',
    timestamp: '2024-01-16T11:00:00Z',
    relevanceScore: 0.95,
    surfaceReason: 'High relevance to current client discussions',
    aiInsight: 'This thread contains valuable ROI data that directly supports your BigCorp pitch. The 15% user engagement increase metric could be compelling.',
    actionSuggestion: 'Share ROI analysis with sales team',
    relatedItems: ['email_4', 'meeting_3'],
    metadata: {
      threadId: 'demo_product_team',
      priority: 'high',
      participants: ['sarah_pm', 'mike_eng', 'demo_user_1']
    }
  },
  {
    id: 'surface_2',
    type: 'email',
    title: 'Voice Control User Testing Results',
    subtitle: 'from Emma Thompson • 4 days ago',
    content: '85% positive feedback on voice commands - perfect timing for client demo preparation',
    timestamp: '2024-01-14T10:15:00Z',
    relevanceScore: 0.88,
    surfaceReason: 'Relevant to upcoming client presentations',
    aiInsight: 'The voice control testing data shows strong user adoption. This could be a key differentiator in your BigCorp presentation.',
    actionSuggestion: 'Include in demo script',
    relatedItems: ['meeting_3'],
    metadata: {
      emailId: 'email_5',
      priority: 'medium'
    }
  },
  {
    id: 'surface_3',
    type: 'context',
    title: 'Neural Design System Evolution',
    subtitle: 'Cross-thread pattern • Last week',
    content: 'Design discussions across multiple threads show emerging consensus on neural aesthetics approach',
    timestamp: '2024-01-12T00:00:00Z',
    relevanceScore: 0.82,
    surfaceReason: 'Pattern detected across multiple conversations',
    aiInsight: 'Your team is converging on a unique design language. This could become a major competitive advantage and brand differentiator.',
    actionSuggestion: 'Document design principles',
    relatedItems: ['demo_design_system', 'demo_random'],
    metadata: {
      priority: 'medium'
    }
  },
  {
    id: 'surface_4',
    type: 'message',
    title: 'Redis Streams Implementation',
    subtitle: 'Mike in #engineering • 2 hours ago',
    content: 'Proof of concept ready for review - could impact client scalability discussions',
    timestamp: '2024-01-18T15:20:00Z',
    relevanceScore: 0.75,
    surfaceReason: 'Technical progress relevant to client requirements',
    aiInsight: 'The Redis Streams implementation addresses scalability concerns that BigCorp raised. This shows concrete progress on their requirements.',
    actionSuggestion: 'Schedule technical review',
    relatedItems: ['meeting_3'],
    metadata: {
      threadId: 'demo_engineering',
      priority: 'medium'
    }
  },
  {
    id: 'surface_5',
    type: 'meeting',
    title: 'Design Thinking Workshop Follow-up',
    subtitle: 'Action items from Friday workshop',
    content: 'Several innovative ideas emerged that could enhance the Thread platform uniqueness',
    timestamp: '2024-01-19T16:00:00Z',
    relevanceScore: 0.70,
    surfaceReason: 'Unaddressed action items from recent meeting',
    aiInsight: 'The workshop generated actionable ideas for platform enhancement. Following up could accelerate innovation.',
    actionSuggestion: 'Review workshop notes',
    relatedItems: ['demo_design_system'],
    metadata: {
      meetingId: 'meeting_4',
      priority: 'low'
    }
  }
]

export function SurfaceEngine({ 
  user, 
  threads, 
  messages, 
  isDemoMode = false, 
  onNavigate, 
  onDismiss 
}: SurfaceEngineProps) {
  const [surfacedItems, setSurfacedItems] = useState<SurfacedItem[]>(isDemoMode ? demoSurfacedItems : [])
  const [selectedItem, setSelectedItem] = useState<SurfacedItem | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null)

  // Simulate AI analysis in demo mode
  useEffect(() => {
    if (isDemoMode) {
      setLastAnalysis(new Date())
    }
  }, [isDemoMode])

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'thread':
        return <MessageCircle className="w-4 h-4" />
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'message':
        return <MessageCircle className="w-4 h-4" />
      case 'meeting':
        return <Calendar className="w-4 h-4" />
      case 'context':
        return <Brain className="w-4 h-4 text-primary" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const handleItemClick = (item: SurfacedItem) => {
    setSelectedItem(item)
  }

  const handleNavigateToItem = (item: SurfacedItem) => {
    if (item.metadata?.threadId) {
      onNavigate('thread', item.metadata.threadId)
    } else if (item.metadata?.emailId) {
      onNavigate('email', item.metadata.emailId)
    } else if (item.metadata?.meetingId) {
      onNavigate('meeting', item.metadata.meetingId)
    } else {
      onNavigate(item.type, item.id)
    }
    setSelectedItem(null)
  }

  const handleDismissItem = (item: SurfacedItem) => {
    setSurfacedItems(prev => prev.filter(i => i.id !== item.id))
    onDismiss?.(item.id)
    setSelectedItem(null)
  }

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (isDemoMode) {
      // In demo mode, shuffle and potentially add new items
      const shuffled = [...demoSurfacedItems].sort(() => Math.random() - 0.5)
      setSurfacedItems(shuffled.slice(0, Math.max(3, Math.floor(Math.random() * 6))))
    } else {
      // Real analysis would happen here
      // Analyze threads, messages, emails for patterns and relevance
    }
    
    setLastAnalysis(new Date())
    setIsAnalyzing(false)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Surface Engine</h1>
              <p className="text-muted-foreground">AI-powered context resurfacing</p>
            </div>
          </div>
          
          <Button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="neural-glow"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        {lastAnalysis && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Last analysis: {lastAnalysis.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-6">
        {surfacedItems.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Resurfaced Context</h2>
              <Badge variant="secondary" className="neural-glow">
                {surfacedItems.length} items
              </Badge>
            </div>

            {surfacedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getItemIcon(item.type)}
                        <h3 className="font-medium">{item.title}</h3>
                        {item.metadata?.priority && (
                          <AlertCircle className={`w-4 h-4 ${getPriorityColor(item.metadata.priority)}`} />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(item.relevanceScore * 100)}% relevant
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDismissItem(item)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground mb-2">{item.subtitle}</p>
                    )}

                    <p className="text-sm mb-3">{item.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>{item.surfaceReason}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Surface Engine Ready</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                The AI will analyze your conversations, emails, and meetings to surface relevant context when you need it most.
              </p>
              <Button onClick={runAnalysis} className="neural-glow">
                <Zap className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Item Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center space-x-2">
                    {getItemIcon(selectedItem.type)}
                    <span>{selectedItem.title}</span>
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Relevance Score */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Relevance Score</span>
                  </div>
                  <Badge variant="secondary" className="neural-glow">
                    {Math.round(selectedItem.relevanceScore * 100)}%
                  </Badge>
                  {selectedItem.metadata?.priority && (
                    <Badge variant={
                      selectedItem.metadata.priority === 'urgent' ? 'destructive' :
                      selectedItem.metadata.priority === 'high' ? 'default' : 'secondary'
                    }>
                      {selectedItem.metadata.priority} priority
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <p className="text-sm text-muted-foreground">{selectedItem.content}</p>
                </div>

                {/* AI Insight */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">AI Insight</h4>
                  </div>
                  <p className="text-sm">{selectedItem.aiInsight}</p>
                </div>

                {/* Surface Reason */}
                <div>
                  <h4 className="font-medium mb-2">Why This Was Surfaced</h4>
                  <p className="text-sm text-muted-foreground">{selectedItem.surfaceReason}</p>
                </div>

                {/* Action Suggestion */}
                {selectedItem.actionSuggestion && (
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <h4 className="font-medium">Suggested Action</h4>
                    </div>
                    <p className="text-sm">{selectedItem.actionSuggestion}</p>
                  </div>
                )}

                {/* Related Items */}
                {selectedItem.relatedItems && selectedItem.relatedItems.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Related Items</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.relatedItems.map((relatedId, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {relatedId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {selectedItem.metadata?.participants && (
                  <div>
                    <h4 className="font-medium mb-2">Participants</h4>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedItem.metadata.participants.length} people involved</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleNavigateToItem(selectedItem)}
                    className="flex-1 neural-glow"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Item
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDismissItem(selectedItem)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}