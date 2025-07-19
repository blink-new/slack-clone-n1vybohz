import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hash, 
  MessageCircle, 
  Plus, 
  Brain, 
  Search,
  Settings,
  User,
  Bot,
  Sparkles
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import type { User, Thread } from '../lib/blink'
import { demoUser } from '../data/demoData'

interface ThreadSidebarProps {
  threads: Thread[]
  activeThread: Thread | null
  onThreadSelect: (thread: Thread) => void
  onCreateThread: (name: string, type?: 'channel' | 'dm') => void
  onToggleNeuralNetwork: () => void
  user: User
  isDemoMode?: boolean
}

export function ThreadSidebar({
  threads,
  activeThread,
  onThreadSelect,
  onCreateThread,
  onToggleNeuralNetwork,
  user,
  isDemoMode = false
}: ThreadSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [newThreadName, setNewThreadName] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredThreads = (Array.isArray(threads) ? threads : []).filter(thread =>
    thread.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateThread = () => {
    if (newThreadName.trim()) {
      onCreateThread(newThreadName.trim())
      setNewThreadName('')
      setShowCreateDialog(false)
    }
  }

  const getThreadIcon = (thread: Thread) => {
    switch (thread.type) {
      case 'ai_chat':
        return <Bot className="w-4 h-4 text-blue-600" />
      case 'dm':
        return <MessageCircle className="w-4 h-4 text-gray-500" />
      default:
        return <Hash className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              THREAD
            </div>
            <Sparkles className="w-4 h-4 text-primary neural-glow" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleNeuralNetwork}
              className="neural-glow"
            >
              <Brain className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
          <Avatar className="w-8 h-8">
            <AvatarImage src={isDemoMode ? demoUser.avatar : user.avatar} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {isDemoMode 
                ? demoUser.displayName 
                : (user.displayName || user.email)
              }
            </p>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">
                {isDemoMode ? 'Demo Mode' : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Create Thread Button */}
      <div className="p-4 border-b border-gray-200">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Thread
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Thread</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="thread-name">Thread Name</Label>
                <Input
                  id="thread-name"
                  placeholder="Enter thread name..."
                  value={newThreadName}
                  onChange={(e) => setNewThreadName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateThread()}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateThread}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Threads List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence>
            {filteredThreads.map((thread) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant={activeThread?.id === thread.id ? "secondary" : "ghost"}
                  className={`w-full justify-start mb-1 h-auto p-3 ${
                    activeThread?.id === thread.id 
                      ? 'bg-blue-50 border-blue-200 border' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onThreadSelect(thread)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    {getThreadIcon(thread)}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium truncate">
                          {thread.name}
                        </span>
                        {thread.aiEnabled && (
                          <Badge variant="secondary" className="text-xs">
                            AI
                          </Badge>
                        )}
                      </div>
                      {thread.description && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {thread.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredThreads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No threads found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}