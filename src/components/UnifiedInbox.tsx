import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Inbox, 
  Mail, 
  MessageCircle, 
  Phone,
  Calendar,
  Filter,
  Search,
  Sparkles,
  Brain,
  Zap,
  Clock,
  Star,
  Archive
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { EmailCard } from './EmailCard'
import type { EmailData } from '../data/demoData'
import { demoEmails } from '../data/demoData'
import { MessageBubble } from './MessageBubble'
import { getBlink } from '../lib/blink'
import type { Message, User } from '../lib/blink'

interface UnifiedInboxProps {
  user: User
  onEmailReply: (emailId: string, content: string) => void
  onMessageReply: (threadId: string, content: string) => void
  className?: string
}

interface InboxItem {
  id: string
  type: 'email' | 'message' | 'call' | 'meeting'
  timestamp: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  isRead: boolean
  data: EmailData | Message | any
  aiContext?: {
    summary: string
    actionItems: string[]
    relatedItems: string[]
    suggestedActions: string[]
  }
}

export function UnifiedInbox({ user, onEmailReply, onMessageReply, className = '' }: UnifiedInboxProps) {
  const [items, setItems] = useState<InboxItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InboxItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'email' | 'message' | 'call' | 'meeting'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'urgent'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [aiInsights, setAiInsights] = useState<{
    totalUnread: number
    urgentItems: number
    actionItemsCount: number
    suggestedPriorities: string[]
  } | null>(null)

  // Load unified inbox data
  useEffect(() => {
    const loadInboxData = async () => {
      setIsLoading(true)
      try {
        let emailItems: InboxItem[] = []
        let messageItems: InboxItem[] = []

        // Get blink client safely
        const blink = await getBlink()
        if (blink?.db?.emails && blink?.db?.messages) {
          try {
            // Load emails from database
            const emails = await blink.db.emails.list({
              where: { userId: user.id },
              orderBy: { timestamp: 'desc' },
              limit: 50
            })

            // Load recent messages from all threads
            const messages = await blink.db.messages.list({
              where: { userId: user.id },
              orderBy: { timestamp: 'desc' },
              limit: 50
            })

            // Transform to unified inbox items
            emailItems = emails.map(email => ({
              id: `email_${email.id}`,
              type: 'email' as const,
              timestamp: email.timestamp,
              priority: email.priority as any,
              isRead: Number(email.is_read) > 0,
              data: {
                id: email.id,
                threadId: email.thread_id,
                subject: email.subject,
                senderEmail: email.sender_email,
                senderName: email.sender_name,
                recipientEmails: JSON.parse(email.recipient_emails || '[]'),
                content: email.content,
                htmlContent: email.html_content,
                timestamp: email.timestamp,
                isRead: Number(email.is_read) > 0,
                isReplied: Number(email.is_replied) > 0,
                priority: email.priority as any,
                aiSummary: email.ai_summary,
                aiContext: email.ai_context ? JSON.parse(email.ai_context) : undefined
              } as EmailData
            }))

            messageItems = messages.map(message => ({
              id: `message_${message.id}`,
              type: 'message' as const,
              timestamp: message.timestamp,
              priority: 'normal' as const,
              isRead: true, // Messages are typically read when viewed
              data: {
                id: message.id,
                threadId: message.thread_id,
                userId: message.user_id,
                content: message.content,
                type: message.type,
                timestamp: message.timestamp,
                editedAt: message.edited_at,
                replyTo: message.reply_to,
                reactions: message.reactions ? JSON.parse(message.reactions) : undefined,
                aiContext: message.ai_context ? JSON.parse(message.ai_context) : undefined
              } as Message
            }))
          } catch (dbError) {
            console.warn('Database error, using demo data:', dbError)
          }
        }

        // Use demo data if no database items
        if (emailItems.length === 0) {
          emailItems = demoEmails.map(email => ({
            id: `email_${email.id}`,
            type: 'email' as const,
            timestamp: email.timestamp,
            priority: email.priority,
            isRead: email.isRead,
            data: email
          }))
        }

        // Combine and sort by timestamp
        const allItems = [...emailItems, ...messageItems].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        setItems(allItems)
        
        // Generate AI insights
        await generateAIInsights(allItems)
        
      } catch (error) {
        console.error('Error loading inbox data:', error)
        // Fallback to demo data on any error
        const emailItems = demoEmails.map(email => ({
          id: `email_${email.id}`,
          type: 'email' as const,
          timestamp: email.timestamp,
          priority: email.priority,
          isRead: email.isRead,
          data: email
        }))
        setItems(emailItems)
        await generateAIInsights(emailItems)
      } finally {
        setIsLoading(false)
      }
    }

    loadInboxData()
  }, [user.id])

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = items

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => {
        const searchText = searchQuery.toLowerCase()
        if (item.type === 'email') {
          const email = item.data as EmailData
          return email.subject.toLowerCase().includes(searchText) ||
                 email.content.toLowerCase().includes(searchText) ||
                 email.senderName?.toLowerCase().includes(searchText) ||
                 email.senderEmail.toLowerCase().includes(searchText)
        } else if (item.type === 'message') {
          const message = item.data as Message
          return message.content.toLowerCase().includes(searchText)
        }
        return false
      })
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter)
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, filterType, priorityFilter])

  const generateAIInsights = async (inboxItems: InboxItem[]) => {
    try {
      // Get blink client safely
      const blink = await getBlink()
      if (!blink || !blink.ai) {
        console.warn('Blink AI not available for insights')
        return
      }

      const unreadEmails = inboxItems.filter(item => 
        item.type === 'email' && !item.isRead
      ).length

      const urgentItems = inboxItems.filter(item => 
        item.priority === 'urgent' || item.priority === 'high'
      ).length

      // Use AI to analyze the inbox and provide insights
      const { object: insights } = await blink.ai.generateObject({
        prompt: `Analyze this inbox data and provide insights:
        
        Total items: ${inboxItems.length}
        Unread emails: ${unreadEmails}
        Urgent/High priority items: ${urgentItems}
        
        Recent email subjects: ${inboxItems
          .filter(item => item.type === 'email')
          .slice(0, 10)
          .map(item => (item.data as EmailData).subject)
          .join(', ')
        }
        
        Provide actionable insights about what needs attention and suggested priorities.`,
        schema: {
          type: 'object',
          properties: {
            actionItemsCount: { type: 'number' },
            suggestedPriorities: {
              type: 'array',
              items: { type: 'string' }
            },
            keyInsights: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['actionItemsCount', 'suggestedPriorities', 'keyInsights']
        }
      })

      setAiInsights({
        totalUnread: unreadEmails,
        urgentItems,
        actionItemsCount: insights.actionItemsCount,
        suggestedPriorities: insights.suggestedPriorities
      })

    } catch (error) {
      console.error('Error generating AI insights:', error)
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'message': return <MessageCircle className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      case 'meeting': return <Calendar className="w-4 h-4" />
      default: return <Inbox className="w-4 h-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with AI Insights */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Inbox className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Unified Inbox</h1>
              <p className="text-sm text-muted-foreground">
                All your communications in one place
              </p>
            </div>
          </div>

          {aiInsights && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="neural-glow">
                  <Brain className="w-3 h-3 mr-1" />
                  {aiInsights.actionItemsCount} action items
                </Badge>
                {aiInsights.urgentItems > 0 && (
                  <Badge variant="destructive">
                    <Zap className="w-3 h-3 mr-1" />
                    {aiInsights.urgentItems} urgent
                  </Badge>
                )}
                {aiInsights.totalUnread > 0 && (
                  <Badge variant="default">
                    {aiInsights.totalUnread} unread
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search emails, messages, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
              <SelectItem value="call">Calls</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI Suggested Priorities */}
        {aiInsights?.suggestedPriorities && aiInsights.suggestedPriorities.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Suggested Priorities</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiInsights.suggestedPriorities.map((priority, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {priority}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inbox Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Your inbox is empty'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.type === 'email' ? (
                      <EmailCard
                        email={item.data as EmailData}
                        isInThread={true}
                        onReply={onEmailReply}
                        onMarkRead={(emailId) => {
                          // Update read status
                          setItems(prev => prev.map(i => 
                            i.id === `email_${emailId}` 
                              ? { ...i, isRead: true }
                              : i
                          ))
                        }}
                        onArchive={(emailId) => {
                          // Remove from inbox
                          setItems(prev => prev.filter(i => i.id !== `email_${emailId}`))
                        }}
                      />
                    ) : item.type === 'message' ? (
                      <Card className="bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <MessageCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  Thread Message
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(item.timestamp)}
                                </span>
                              </div>
                              <MessageBubble
                                message={item.data as Message}
                                user={user}
                                isConsecutive={false}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            {getItemIcon(item.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(item.timestamp)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}