import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Reply, 
  Forward, 
  Archive, 
  Star,
  Clock,
  User,
  Paperclip,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Bot,
  Sparkles
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Card, CardContent, CardHeader } from './ui/card'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import type { EmailData } from '../data/demoData'
import { demoEmails } from '../data/demoData'

interface EmailIntegrationProps {
  threadId: string
  onEmailReply: (emailId: string, content: string) => void
  onEmailForward: (emailId: string, recipients: string[], content: string) => void
  onEmailArchive: (emailId: string) => void
  className?: string
}

export function EmailIntegration({
  threadId,
  onEmailReply,
  onEmailForward,
  onEmailArchive,
  className = ''
}: EmailIntegrationProps) {
  const [emails, setEmails] = useState<EmailData[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set())
  const [isComposing, setIsComposing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  // Load emails related to this thread
  useEffect(() => {
    // In a real app, this would fetch emails from the backend
    const threadEmails = demoEmails.filter(email => 
      email.threadId === threadId || 
      email.content.toLowerCase().includes('thread') ||
      email.content.toLowerCase().includes('semantic search') ||
      email.content.toLowerCase().includes('product')
    )
    setEmails(threadEmails)
  }, [threadId])

  // Generate AI reply suggestions
  const generateAISuggestions = async (email: EmailData) => {
    const suggestions = [
      `Thanks for the update, ${email.senderName}. I'll review this and get back to you.`,
      `Great insights! Let's schedule a follow-up meeting to discuss this further.`,
      `I agree with your assessment. Let me loop in the team for their thoughts.`,
      `This aligns perfectly with our current roadmap. Let's move forward with this approach.`
    ]
    setAiSuggestions(suggestions)
  }

  const handleEmailSelect = (email: EmailData) => {
    setSelectedEmail(email)
    setShowReplyBox(false)
    generateAISuggestions(email)
    
    // Mark as read
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, isRead: true } : e
    ))
  }

  const handleReply = () => {
    if (selectedEmail && replyContent.trim()) {
      onEmailReply(selectedEmail.id, replyContent)
      setReplyContent('')
      setShowReplyBox(false)
      
      // Mark as replied
      setEmails(prev => prev.map(e => 
        e.id === selectedEmail.id ? { ...e, isReplied: true } : e
      ))
    }
  }

  const handleQuickReply = (suggestion: string) => {
    setReplyContent(suggestion)
    setShowReplyBox(true)
  }

  const toggleEmailExpansion = (emailId: string) => {
    setExpandedEmails(prev => {
      const newSet = new Set(prev)
      if (newSet.has(emailId)) {
        newSet.delete(emailId)
      } else {
        newSet.add(emailId)
      }
      return newSet
    })
  }

  const getPriorityColor = (priority: EmailData['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'normal': return 'text-blue-500'
      case 'low': return 'text-gray-500'
      default: return 'text-blue-500'
    }
  }

  const getPriorityBadge = (priority: EmailData['priority']) => {
    switch (priority) {
      case 'urgent': return <Badge variant="destructive" className="text-xs">Urgent</Badge>
      case 'high': return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>
      case 'normal': return null
      case 'low': return <Badge variant="outline" className="text-xs">Low</Badge>
      default: return null
    }
  }

  if (emails.length === 0) {
    return (
      <div className={`p-6 text-center text-muted-foreground ${className}`}>
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No emails found for this thread</p>
        <p className="text-sm mt-2">Emails will appear here when they're related to this conversation</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Related Emails</h3>
            <Badge variant="secondary">{emails.length}</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsComposing(true)}
          >
            <Send className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Email List */}
        <div className="w-1/2 border-r border-border">
          <ScrollArea className="h-full">
            <div className="p-2">
              {emails.map((email) => (
                <Card
                  key={email.id}
                  className={`mb-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedEmail?.id === email.id ? 'ring-2 ring-primary' : ''
                  } ${!email.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => handleEmailSelect(email)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {email.senderName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm truncate">
                              {email.senderName}
                            </p>
                            {!email.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {email.senderEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getPriorityBadge(email.priority)}
                        <div className="text-xs text-muted-foreground">
                          {new Date(email.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium text-sm truncate">{email.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {email.content.substring(0, 100)}...
                      </p>
                    </div>
                    {email.aiSummary && (
                      <div className="mt-2 p-2 bg-primary/10 rounded-md">
                        <div className="flex items-center space-x-1 mb-1">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">AI Summary</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{email.aiSummary}</p>
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Email Detail */}
        <div className="flex-1 flex flex-col">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {selectedEmail.senderName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedEmail.senderName}</p>
                      <p className="text-sm text-muted-foreground">{selectedEmail.senderEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(selectedEmail.priority)}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Star className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Star email</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEmailArchive(selectedEmail.id)}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archive email</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">{selectedEmail.subject}</h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>To: {selectedEmail.recipientEmails.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{selectedEmail.content}</div>
                </div>

                {/* AI Context */}
                {selectedEmail.aiContext && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center space-x-2 mb-3">
                      <Bot className="w-4 h-4 text-primary" />
                      <span className="font-medium text-primary">AI Analysis</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Sentiment:</p>
                        <Badge variant="outline" className="text-xs">
                          {selectedEmail.aiContext.sentiment}
                        </Badge>
                      </div>
                      {selectedEmail.aiContext.actionItems.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Action Items:</p>
                          <ul className="text-sm space-y-1">
                            {selectedEmail.aiContext.actionItems.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Action Buttons */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setShowReplyBox(!showReplyBox)}
                      className="neural-glow"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline">
                      <Forward className="w-4 h-4 mr-2" />
                      Forward
                    </Button>
                  </div>
                  
                  {selectedEmail.aiContext?.suggestedReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickReply(selectedEmail.aiContext!.suggestedReply)}
                      className="text-primary"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Use AI Suggestion
                    </Button>
                  )}
                </div>

                {/* AI Quick Replies */}
                {aiSuggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(suggestion)}
                          className="text-xs"
                        >
                          {suggestion.substring(0, 30)}...
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Box */}
                <AnimatePresence>
                  {showReplyBox && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Reply to {selectedEmail.senderName}</p>
                        <Textarea
                          placeholder="Type your reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Paperclip className="w-4 h-4 mr-2" />
                            Attach
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowReplyBox(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleReply}
                            disabled={!replyContent.trim()}
                            className="neural-glow"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an email to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}