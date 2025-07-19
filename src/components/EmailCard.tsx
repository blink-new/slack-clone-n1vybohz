import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Reply, 
  Forward, 
  Archive, 
  Star,
  MoreVertical,
  Clock,
  User,
  Sparkles,
  Brain,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import type { EmailData } from '../data/demoData'

interface EmailCardProps {
  email: EmailData
  isInThread?: boolean
  onReply?: (emailId: string, content: string) => void
  onMarkRead?: (emailId: string) => void
  onArchive?: (emailId: string) => void
  className?: string
}

export function EmailCard({ 
  email, 
  isInThread = false, 
  onReply, 
  onMarkRead, 
  onArchive,
  className = '' 
}: EmailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  const handleReply = async () => {
    if (!replyContent.trim() || !onReply) return
    
    setIsReplying(true)
    try {
      await onReply(email.id, replyContent.trim())
      setReplyContent('')
      setShowReply(false)
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setIsReplying(false)
    }
  }

  const handleMarkRead = () => {
    if (onMarkRead && !email.isRead) {
      onMarkRead(email.id)
    }
  }

  const handleArchive = () => {
    if (onArchive) {
      onArchive(email.id)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500/50 bg-red-500/5'
      case 'high': return 'border-orange-500/50 bg-orange-500/5'
      case 'low': return 'border-blue-500/50 bg-blue-500/5'
      default: return 'border-border bg-card'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'high': return <Clock className="w-4 h-4 text-orange-500" />
      default: return null
    }
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md min-h-[120px] ${
        !email.isRead ? 'ring-2 ring-primary/20' : ''
      } ${getPriorityColor(email.priority)} ${className}`}
      onClick={() => {
        setIsExpanded(!isExpanded)
        handleMarkRead()
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Sender Avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>

            {/* Email Header Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`font-medium truncate ${
                  !email.isRead ? 'font-semibold' : ''
                }`}>
                  {email.senderName}
                </h4>
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  {email.senderEmail}
                </span>
                {getPriorityIcon(email.priority)}
              </div>
              
              <h3 className={`text-sm mb-2 ${
                !email.isRead ? 'font-semibold' : 'text-muted-foreground'
              } ${isExpanded ? '' : 'truncate'}`}>
                {email.subject}
              </h3>

              {/* AI Summary */}
              {email.aiSummary && (
                <div className="flex items-start space-x-2 mb-2 p-2 bg-primary/5 rounded-md border border-primary/20">
                  <Brain className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary">
                    <span className="font-medium">AI Summary:</span> {email.aiSummary}
                  </p>
                </div>
              )}

              {/* Email Preview */}
              {!isExpanded && (
                <p className="text-sm text-muted-foreground line-clamp-3 max-h-16 overflow-hidden">
                  {email.content}
                </p>
              )}
            </div>
          </div>

          {/* Email Actions & Metadata */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatTime(email.timestamp)}
            </span>
            
            {email.priority !== 'normal' && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  email.priority === 'urgent' ? 'border-red-500 text-red-500' :
                  email.priority === 'high' ? 'border-orange-500 text-orange-500' :
                  'border-blue-500 text-blue-500'
                }`}
              >
                {email.priority}
              </Badge>
            )}

            {email.isReplied && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Replied</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {!email.isRead && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Expanded Email Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              
              {/* Full Email Content */}
              <div className="prose prose-sm max-w-none mb-4">
                <div className="whitespace-pre-wrap text-sm">
                  {email.content}
                </div>
              </div>

              {/* AI Context */}
              {email.aiContext && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Insights</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Sentiment:</span> {email.aiContext.sentiment}
                    </div>
                    
                    {email.aiContext.actionItems.length > 0 && (
                      <div>
                        <span className="font-medium">Action Items:</span>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {email.aiContext.actionItems.map((item, index) => (
                            <li key={index} className="text-muted-foreground">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {email.aiContext.suggestedReply && (
                      <div>
                        <span className="font-medium">Suggested Reply:</span>
                        <p className="text-muted-foreground italic mt-1">
                          "{email.aiContext.suggestedReply}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowReply(!showReply)
                    }}
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleArchive()
                    }}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                </div>

                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Reply Interface */}
              <AnimatePresence>
                {showReply && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Reply className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Reply to {email.senderName}</span>
                      </div>
                      
                      {/* AI Suggested Reply */}
                      {email.aiContext?.suggestedReply && (
                        <div className="p-2 bg-primary/5 rounded border border-primary/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-primary">AI Suggested Reply</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => setReplyContent(email.aiContext!.suggestedReply)}
                            >
                              Use suggestion
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            "{email.aiContext.suggestedReply}"
                          </p>
                        </div>
                      )}
                      
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleReply}
                            disabled={!replyContent.trim() || isReplying}
                            className="neural-glow"
                          >
                            {isReplying ? 'Sending...' : 'Send Reply'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowReply(false)
                              setReplyContent('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                        
                        <span className="text-xs text-muted-foreground">
                          {replyContent.length} characters
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}