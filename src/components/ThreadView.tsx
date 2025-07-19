import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  Mic, 
  Paperclip, 
  Smile,
  MoreVertical,
  Brain,
  Search,
  Sparkles,
  UserPlus,
  Users
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import type { User, Thread, Message } from '../lib/blink'
import { MessageBubble } from './MessageBubble'
import { AIContextBridge } from './AIContextBridge'
import { demoUsers } from '../data/demoData'

interface ThreadViewProps {
  thread: Thread | null
  messages: Message[]
  onSendMessage: (content: string, isAIInvoked?: boolean) => void
  onToggleAI: () => void
  onAddPeople?: (threadId: string, emails: string[], message?: string) => void
  onNavigateToThread?: (threadId: string) => void
  onNavigateToEmail?: (emailId: string) => void
  user: User
  isDemoMode?: boolean
}

export function ThreadView({
  thread,
  messages,
  onSendMessage,
  onToggleAI,
  onAddPeople,
  onNavigateToThread,
  onNavigateToEmail,
  user,
  isDemoMode = false
}: ThreadViewProps) {
  const [messageInput, setMessageInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showAIInvoke, setShowAIInvoke] = useState(false)
  const [showAddPeopleDialog, setShowAddPeopleDialog] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    const messagesContainer = messagesEndRef.current?.parentElement?.parentElement
    if (messagesContainer && messagesEndRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      
      // Only auto-scroll if user is near the bottom or it's the first message
      if (isNearBottom || messages.length === 1) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    }
  }, [messages])

  // Focus input when thread changes
  useEffect(() => {
    if (thread) {
      inputRef.current?.focus()
    }
  }, [thread])

  const handleSendMessage = (isAIInvoked = false) => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim(), isAIInvoked)
      setMessageInput('')
      setShowAIInvoke(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessageInput(value)
    
    // Show AI invoke option when typing @ai or mentioning AI
    setShowAIInvoke(value.toLowerCase().includes('@ai') || value.toLowerCase().includes('ai'))
  }

  const handleAddPeople = () => {
    if (!thread || !onAddPeople || !inviteEmails.trim()) return

    const emails = inviteEmails.split(',').map(email => email.trim()).filter(Boolean)
    onAddPeople(thread.id, emails, inviteMessage || undefined)
    
    // Reset form
    setInviteEmails('')
    setInviteMessage('')
    setShowAddPeopleDialog(false)
  }

  const handleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      // TODO: Implement actual voice recording stop logic
      console.log('Voice recording stopped')
    } else {
      // Start recording
      setIsRecording(true)
      // TODO: Implement actual voice recording start logic
      console.log('Voice recording started')
    }
  }

  const handleAttachment = () => {
    setShowAttachmentMenu(!showAttachmentMenu)
    // TODO: Implement file attachment logic
    console.log('Attachment menu toggled')
  }

  const handleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
    // TODO: Implement emoji picker logic
    console.log('Emoji picker toggled')
  }

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Welcome to THREAD</h3>
            <p className="text-muted-foreground">Select a thread to start messaging</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex bg-white h-full">
      {/* Main Thread Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Thread Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {thread.type === 'ai_chat' ? (
                  <Bot className="w-5 h-5 text-primary neural-glow" />
                ) : (
                  <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {thread.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">{thread.name}</h2>
                  {thread.description && (
                    <p className="text-sm text-muted-foreground">{thread.description}</p>
                  )}
                </div>
              </div>
              
              {thread.aiEnabled && (
                <Badge variant="secondary" className="neural-glow">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Enabled
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Participants */}
              {thread.participants && thread.participants.length > 0 && (
                <div className="flex items-center space-x-2 mr-4">
                  <div className="flex -space-x-2">
                    {thread.participants.slice(0, 3).map((participantId) => {
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
                    {thread.participants.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs">+{thread.participants.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {thread.participants.length} member{thread.participants.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Add People Button */}
              {onAddPeople && thread.type !== 'ai_chat' && (
                <Dialog open={showAddPeopleDialog} onOpenChange={setShowAddPeopleDialog}>
                  <DialogTrigger asChild>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add people to thread</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add People to {thread.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invite-emails">Email addresses</Label>
                        <Textarea
                          id="invite-emails"
                          placeholder="Enter email addresses separated by commas..."
                          value={inviteEmails}
                          onChange={(e) => setInviteEmails(e.target.value)}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate multiple emails with commas
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="invite-message">Welcome message (optional)</Label>
                        <Textarea
                          id="invite-message"
                          placeholder="Add a welcome message for new members..."
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddPeopleDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddPeople} disabled={!inviteEmails.trim()}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add People
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={onToggleAI}>
                      <Brain className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open AI Panel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  user={user}
                  isDemoMode={isDemoMode}
                  isConsecutive={
                    index > 0 && 
                    messages[index - 1].userId === message.userId &&
                    new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() < 300000 // 5 minutes
                  }
                />
              ))}
            </AnimatePresence>
            
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  {thread.type === 'ai_chat' ? (
                    <Bot className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {thread.type === 'ai_chat' ? 'Chat with AI' : 'Start the conversation'}
                </h3>
                <p className="text-gray-500">
                  {thread.type === 'ai_chat' 
                    ? 'Ask me anything! I can help with research, analysis, and creative tasks.'
                    : 'Send a message to get the conversation started.'
                  }
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input - Fixed to bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder={
                  thread.type === 'ai_chat' 
                    ? "Ask AI anything..." 
                    : `Message ${thread.name}...`
                }
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="pr-12 resize-none"
              />
              
              {/* AI Invoke Button */}
              <AnimatePresence>
                {showAIInvoke && thread.type !== 'ai_chat' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 neural-glow"
                            onClick={() => handleSendMessage(true)}
                          >
                            <Bot className="w-4 h-4 text-primary" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Invoke AI Assistant</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={isRecording ? 'text-red-500 bg-red-50' : ''}
                      onClick={handleVoiceRecording}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRecording ? 'Stop recording' : 'Record voice message'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleAttachment}
                      className={showAttachmentMenu ? 'bg-muted' : ''}
                    >
                      <Paperclip className="w-4 h-4" />
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
                      variant="ghost" 
                      size="sm"
                      onClick={handleEmojiPicker}
                      className={showEmojiPicker ? 'bg-muted' : ''}
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add emoji</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button 
                onClick={() => handleSendMessage()}
                disabled={!messageInput.trim()}
                className="neural-glow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* AI Hint */}
          {thread.aiEnabled && thread.type !== 'ai_chat' && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Type @ai to invoke the AI assistant in this thread
            </p>
          )}
        </div>
      </div>

      {/* AI Context Bridge */}
      {onNavigateToThread && onNavigateToEmail && (
        <AIContextBridge
          currentThread={thread}
          currentMessages={messages}
          user={user}
          onNavigateToThread={onNavigateToThread}
          onNavigateToEmail={onNavigateToEmail}
          className="w-80"
        />
      )}
    </div>
  )
}