import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { ScrollArea } from './ui/scroll-area'
import { MessageSquare, Send, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ThreadMessage {
  id: string
  content: string
  userId: string
  user?: {
    displayName: string
    avatarUrl?: string
  }
  createdAt: string
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
}

interface Message {
  id: string
  content: string
  userId: string
  user?: {
    displayName: string
    avatarUrl?: string
  }
  createdAt: string
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  threadCount?: number
  threadMessages?: ThreadMessage[]
}

interface MessageThreadProps {
  message: Message
  onSendThreadMessage: (messageId: string, content: string) => void
  currentUserId: string
}

export function MessageThread({ message, onSendThreadMessage, currentUserId }: MessageThreadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newReply, setNewReply] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newReply.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendThreadMessage(message.id, newReply.trim())
      setNewReply('')
    } catch (error) {
      console.error('Error sending thread reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const threadMessages = message.threadMessages || []
  const threadCount = message.threadCount || threadMessages.length

  if (threadCount === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            <span className="text-xs">Reply in thread</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <ThreadContent 
            message={message}
            threadMessages={threadMessages}
            newReply={newReply}
            setNewReply={setNewReply}
            handleSendReply={handleSendReply}
            isSending={isSending}
            currentUserId={currentUserId}
          />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="mt-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
            <MessageSquare className="h-3 w-3" />
            <span className="font-medium">
              {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
            </span>
            {threadMessages.length > 0 && (
              <span className="text-gray-500">
                Last reply {formatDistanceToNow(new Date(threadMessages[threadMessages.length - 1].createdAt), { addSuffix: true })}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <ThreadContent 
            message={message}
            threadMessages={threadMessages}
            newReply={newReply}
            setNewReply={setNewReply}
            handleSendReply={handleSendReply}
            isSending={isSending}
            currentUserId={currentUserId}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface ThreadContentProps {
  message: Message
  threadMessages: ThreadMessage[]
  newReply: string
  setNewReply: (value: string) => void
  handleSendReply: (e: React.FormEvent) => void
  isSending: boolean
  currentUserId: string
}

function ThreadContent({ 
  message, 
  threadMessages, 
  newReply, 
  setNewReply, 
  handleSendReply, 
  isSending,
  currentUserId 
}: ThreadContentProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Thread
        </SheetTitle>
        <SheetDescription>
          Reply to this message in a thread to keep the conversation organized.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col h-full mt-6">
        {/* Original Message */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.user?.avatarUrl} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                {message.user?.displayName?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 text-sm">
                  {message.user?.displayName || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Original message
                </Badge>
              </div>
              <div className="text-gray-900 text-sm leading-relaxed">
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thread Messages */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4">
            {threadMessages.map((threadMessage) => (
              <div key={threadMessage.id} className="flex gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={threadMessage.user?.avatarUrl} />
                  <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">
                    {threadMessage.user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {threadMessage.user?.displayName || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(threadMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-gray-900 text-sm leading-relaxed">
                    <p className="whitespace-pre-wrap break-words">{threadMessage.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {threadMessages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No replies yet. Start the conversation!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Reply Input */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <form onSubmit={handleSendReply} className="flex gap-2">
            <div className="flex-1">
              <Input
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Reply to thread..."
                disabled={isSending}
                className="text-sm"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!newReply.trim() || isSending}
              className="px-3"
            >
              {isSending ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}