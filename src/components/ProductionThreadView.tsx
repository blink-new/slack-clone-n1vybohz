import React, { useState, useRef, useEffect } from 'react'
import { useMessages } from '../hooks/useMessages'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { TypingIndicator } from './TypingIndicator'
import { EmojiReactions } from './EmojiReactions'
import { MessageThread } from './MessageThread'
import { NotificationCenter } from './NotificationCenter'
import { OnlineStatus } from './OnlineStatus'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Hash, 
  Lock, 
  Users,
  MoreVertical,
  Reply,
  Heart,
  MessageSquare
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Channel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'dm'
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface ProductionThreadViewProps {
  channel: Channel | null
}

export function ProductionThreadView({ channel }: ProductionThreadViewProps) {
  const { user, userProfile } = useAuth()
  const { messages, isLoading, isConnected, sendMessage, uploadFile } = useMessages(channel?.id || null)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Array<{id: string, displayName: string, avatarUrl?: string}>>([])
  const [messageReactions, setMessageReactions] = useState<Record<string, Array<{emoji: string, count: number, users: string[], hasReacted: boolean}>>>({})
  const [threadMessages, setThreadMessages] = useState<Record<string, any[]>>({})
  const [openThreadId, setOpenThreadId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'message' as const,
      title: 'New message in #general',
      description: 'Sarah: Hey team, the new designs are ready for review!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      channelName: 'general',
      userName: 'Sarah'
    },
    {
      id: '2',
      type: 'mention' as const,
      title: 'You were mentioned',
      description: 'John mentioned you in #product-design',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isRead: false,
      channelName: 'product-design',
      userName: 'John'
    },
    {
      id: '3',
      type: 'meeting' as const,
      title: 'Meeting reminder',
      description: 'Sprint planning starts in 30 minutes',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: true
    }
  ])
  const [onlineUsers] = useState([
    {
      id: '1',
      displayName: 'Sarah Chen',
      avatarUrl: undefined,
      status: 'online' as const
    },
    {
      id: '2',
      displayName: 'John Smith',
      avatarUrl: undefined,
      status: 'online' as const
    },
    {
      id: '3',
      displayName: 'Emily Davis',
      avatarUrl: undefined,
      status: 'online' as const
    },
    {
      id: '4',
      displayName: 'Mike Johnson',
      avatarUrl: undefined,
      status: 'away' as const
    },
    {
      id: '5',
      displayName: 'Lisa Wang',
      avatarUrl: undefined,
      status: 'online' as const
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !channel || isSending) return

    setIsSending(true)
    try {
      await sendMessage(newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !channel) return

    setIsSending(true)
    try {
      const fileData = await uploadFile(file)
      await sendMessage(`Shared a file: ${file.name}`, file.type.startsWith('image/') ? 'image' : 'file', fileData)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsSending(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording
    console.log('Voice recording:', !isRecording)
  }

  const handleEmojiSelect = () => {
    setShowEmojiPicker(!showEmojiPicker)
    // TODO: Implement emoji picker
    console.log('Emoji picker:', !showEmojiPicker)
  }

  // Typing indicator functionality
  const handleTyping = () => {
    // Simulate typing indicator
    if (!user) return
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Add current user to typing users if not already there
    setTypingUsers(prev => {
      const filtered = prev.filter(u => u.id !== user.id)
      return [...filtered, {
        id: user.id,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        avatarUrl: user.avatarUrl
      }]
    })

    // Remove user from typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(prev => prev.filter(u => u.id !== user.id))
    }, 3000)
  }

  // Emoji reactions functionality
  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!user) return

    setMessageReactions(prev => {
      const messageReactions = prev[messageId] || []
      const existingReaction = messageReactions.find(r => r.emoji === emoji)
      
      if (existingReaction) {
        // Add user to existing reaction
        return {
          ...prev,
          [messageId]: messageReactions.map(r => 
            r.emoji === emoji 
              ? {
                  ...r,
                  count: r.count + 1,
                  users: [...r.users, user.displayName || 'User'],
                  hasReacted: true
                }
              : r
          )
        }
      } else {
        // Create new reaction
        return {
          ...prev,
          [messageId]: [
            ...messageReactions,
            {
              emoji,
              count: 1,
              users: [user.displayName || 'User'],
              hasReacted: true
            }
          ]
        }
      }
    })
  }

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    if (!user) return

    setMessageReactions(prev => {
      const messageReactions = prev[messageId] || []
      
      return {
        ...prev,
        [messageId]: messageReactions.map(r => 
          r.emoji === emoji 
            ? {
                ...r,
                count: Math.max(0, r.count - 1),
                users: r.users.filter(u => u !== (user.displayName || 'User')),
                hasReacted: false
              }
            : r
        ).filter(r => r.count > 0)
      }
    })
  }

  // Thread functionality
  const handleOpenThread = (messageId: string) => {
    setOpenThreadId(messageId)
  }

  const handleSendReply = async (messageId: string, content: string) => {
    if (!user) return

    const newReply = {
      id: `reply_${Date.now()}`,
      content,
      userId: user.id,
      user: {
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        avatarUrl: user.avatarUrl
      },
      createdAt: new Date().toISOString(),
      parentMessageId: messageId
    }

    setThreadMessages(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), newReply]
    }))
  }

  // Notification handlers
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a channel</h3>
          <p className="text-gray-600">Choose a channel from the sidebar to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {channel.type === 'private' ? (
                <Lock className="h-5 w-5 text-gray-500" />
              ) : (
                <Hash className="h-5 w-5 text-gray-500" />
              )}
              <h1 className="text-lg font-semibold text-gray-900">{channel.name}</h1>
            </div>
            
            {channel.description && (
              <span className="text-sm text-gray-600">• {channel.description}</span>
            )}
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <OnlineStatus users={onlineUsers} maxVisible={3} />
            
            <div className="flex items-center gap-1">
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
              />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View members</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="ml-2 text-gray-600">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">Be the first to send a message in #{channel.name}</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null
            const isSameUser = prevMessage?.userId === message.userId
            const timeDiff = prevMessage ? new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() : 0
            const isGrouped = isSameUser && timeDiff < 5 * 60 * 1000 // Group messages within 5 minutes
            
            return (
              <div key={message.id} className={`flex gap-3 group hover:bg-gray-50 -mx-4 px-4 py-1 rounded ${isGrouped ? 'mt-1' : 'mt-4'}`}>
                {!isGrouped ? (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={message.user?.avatarUrl} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                      {message.user?.displayName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 flex justify-center">
                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {!isGrouped && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {message.user?.displayName || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.type !== 'text' && (
                        <Badge variant="secondary" className="text-xs">
                          {message.type}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="text-gray-900 text-sm leading-relaxed">
                    {message.type === 'text' ? (
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    ) : message.type === 'image' && message.fileUrl ? (
                      <div>
                        <p className="mb-2">{message.content}</p>
                        <img 
                          src={message.fileUrl} 
                          alt={message.fileName || 'Image'}
                          className="max-w-sm max-h-96 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(message.fileUrl, '_blank')}
                        />
                      </div>
                    ) : message.type === 'file' && message.fileUrl ? (
                      <div>
                        <p className="mb-2">{message.content}</p>
                        <a 
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors max-w-sm"
                        >
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 block truncate">{message.fileName}</span>
                            {message.fileSize && (
                              <span className="text-xs text-gray-500">
                                {(message.fileSize / 1024 / 1024).toFixed(1)} MB
                              </span>
                            )}
                          </div>
                        </a>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>

                  {/* Emoji Reactions */}
                  <EmojiReactions
                    messageId={message.id}
                    reactions={messageReactions[message.id] || []}
                    onAddReaction={handleAddReaction}
                    onRemoveReaction={handleRemoveReaction}
                    currentUserId={user?.id || ''}
                  />

                  {/* Message Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-gray-500 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleAddReaction(message.id, '❤️')}
                            >
                              <Heart className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add reaction</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <MessageThread
                        message={{
                          ...message,
                          threadCount: threadMessages[message.id]?.length || 0,
                          threadMessages: threadMessages[message.id] || []
                        }}
                        onSendThreadMessage={handleSendReply}
                        currentUserId={user?.id || ''}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-end gap-3 bg-gray-50 rounded-lg border border-gray-200 p-3 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  placeholder={`Message #${channel.name}`}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-500"
                  disabled={isSending || !isConnected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
              </div>

              {/* Message Controls */}
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Attach file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleEmojiSelect}
                        disabled={isSending}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add emoji</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleVoiceRecording}
                        disabled={isSending}
                        className={`h-8 w-8 p-0 ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isRecording ? 'Stop recording' : 'Voice message'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim() || isSending || !isConnected}
                  className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isSending ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Connection Status */}
            {!isConnected && (
              <div className="absolute -top-8 left-0 right-0 text-center">
                <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  Disconnected - trying to reconnect...
                </span>
              </div>
            )}
          </form>

          {/* Typing indicator */}
          <div className="mt-2 min-h-[16px] flex items-center">
            <TypingIndicator typingUsers={typingUsers.filter(u => u.id !== user?.id)} />
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="*/*"
        />
      </div>


    </div>
  )
}