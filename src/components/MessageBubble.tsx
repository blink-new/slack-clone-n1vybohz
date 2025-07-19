import { motion } from 'framer-motion'
import { Bot, User, Sparkles, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import type { User as UserType, Message } from '../lib/blink'
import { demoUsers } from '../data/demoData'

interface MessageBubbleProps {
  message: Message
  user: UserType
  isConsecutive: boolean
  isDemoMode?: boolean
}

export function MessageBubble({ message, user, isConsecutive, isDemoMode = false }: MessageBubbleProps) {
  const isCurrentUser = message.userId === user.id
  const isAI = message.userId === 'ai_assistant'
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  // Get message author info (for demo mode)
  const messageAuthor = isDemoMode && demoUsers[message.userId] 
    ? demoUsers[message.userId] 
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
        isConsecutive ? 'mt-1' : 'mt-4'
      }`}
    >
      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[80%]`}>
        {/* Avatar */}
        {!isConsecutive && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            {isAI ? (
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center neural-glow">
                <Bot className="w-4 h-4 text-white" />
              </div>
            ) : (
              <>
                <AvatarImage src={
                  isCurrentUser 
                    ? user.avatar 
                    : messageAuthor?.avatar
                } />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {/* Username and timestamp */}
          {!isConsecutive && (
            <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <span className="text-sm font-medium">
                {isAI 
                  ? 'Thread AI' 
                  : isCurrentUser 
                    ? 'You' 
                    : messageAuthor?.displayName || 'User'
                }
              </span>
              {isAI && (
                <Badge variant="secondary" className="text-xs neural-glow">
                  <Sparkles className="w-2 h-2 mr-1" />
                  AI
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`
              message-bubble
              ${isCurrentUser ? 'message-user' : isAI ? 'message-ai' : 'message-other'}
              ${isAI ? 'neural-glow' : ''}
            `}
          >
            {/* Message content */}
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* AI Context */}
            {message.aiContext?.searchResults && message.aiContext.searchResults.length > 0 && (
              <div className="mt-3 pt-3 border-t border-primary/20">
                <div className="flex items-center space-x-1 mb-2">
                  <ExternalLink className="w-3 h-3" />
                  <span className="text-xs font-medium">Sources</span>
                </div>
                <div className="space-y-1">
                  {message.aiContext.searchResults.slice(0, 3).map((source: any, index: number) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-2 text-left justify-start w-full"
                      onClick={() => window.open(source.url, '_blank')}
                    >
                      <div className="text-xs">
                        <div className="font-medium truncate">{source.title}</div>
                        <div className="text-muted-foreground truncate">{source.url}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Edited indicator */}
            {message.editedAt && (
              <div className="text-xs text-muted-foreground mt-1 opacity-70">
                (edited)
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex space-x-1 mt-1">
              {message.reactions.map((reaction, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  {reaction.emoji} {reaction.users.length}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}