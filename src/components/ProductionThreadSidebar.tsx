import React, { useState } from 'react'
import { useWorkspace } from '../hooks/useWorkspace'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { 
  Hash, 
  Lock, 
  Plus, 
  Search, 
  Users, 
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Channel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'dm'
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface ProductionThreadSidebarProps {
  selectedChannelId: string | null
  onChannelSelect: (channelId: string) => void
}

export function ProductionThreadSidebar({ selectedChannelId, onChannelSelect }: ProductionThreadSidebarProps) {
  const { user } = useAuth()
  const { currentWorkspace, channels, createChannel } = useWorkspace()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public')
  const [isCreating, setIsCreating] = useState(false)
  const [showChannels, setShowChannels] = useState(true)
  const [showDMs, setShowDMs] = useState(true)

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const publicChannels = filteredChannels.filter(c => c.type === 'public')
  const privateChannels = filteredChannels.filter(c => c.type === 'private')
  const dmChannels = filteredChannels.filter(c => c.type === 'dm')

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newChannelName.trim()) return

    setIsCreating(true)
    try {
      await createChannel(
        newChannelName.trim(),
        newChannelDescription.trim() || undefined,
        newChannelType
      )
      
      setNewChannelName('')
      setNewChannelDescription('')
      setNewChannelType('public')
      setIsCreateChannelOpen(false)
    } catch (error) {
      console.error('Error creating channel:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const ChannelItem = ({ channel }: { channel: Channel }) => (
    <button
      onClick={() => onChannelSelect(channel.id)}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all group ${
        selectedChannelId === channel.id 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {channel.type === 'private' ? (
        <Lock className={`h-4 w-4 flex-shrink-0 ${
          selectedChannelId === channel.id ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-600'
        }`} />
      ) : channel.type === 'dm' ? (
        <MessageSquare className={`h-4 w-4 flex-shrink-0 ${
          selectedChannelId === channel.id ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-600'
        }`} />
      ) : (
        <Hash className={`h-4 w-4 flex-shrink-0 ${
          selectedChannelId === channel.id ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-600'
        }`} />
      )}
      <span className="font-medium truncate text-sm">{channel.name}</span>
      {channel.type === 'private' && (
        <Badge 
          variant="secondary" 
          className={`text-xs ml-auto ${
            selectedChannelId === channel.id 
              ? 'bg-blue-500 text-blue-100 border-blue-400' 
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Private
        </Badge>
      )}
      {/* Unread indicator placeholder */}
      {Math.random() > 0.7 && selectedChannelId !== channel.id && (
        <div className="ml-auto h-2 w-2 bg-red-500 rounded-full" />
      )}
    </button>
  )

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 truncate text-lg">
              {currentWorkspace?.name || 'Workspace'}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Workspace settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8"
          />
        </div>
      </div>

      {/* Channels List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Public Channels */}
          <div>
            <button
              onClick={() => setShowChannels(!showChannels)}
              className="flex items-center gap-1 w-full text-left mb-2 hover:bg-gray-100 rounded px-1 py-1"
            >
              {showChannels ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-700">Channels</span>
              <span className="text-xs text-gray-500 ml-auto">
                {publicChannels.length + privateChannels.length}
              </span>
            </button>
            
            {showChannels && (
              <div className="space-y-1 ml-2">
                {publicChannels.map(channel => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
                {privateChannels.map(channel => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
                
                {/* Create Channel Button */}
                <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-gray-100 transition-colors text-gray-600">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Add channel</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a channel</DialogTitle>
                      <DialogDescription>
                        Channels are where your team communicates. They're best when organized around a topic — #marketing, for example.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleCreateChannel} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Channel name
                        </label>
                        <Input
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          placeholder="e.g. marketing"
                          disabled={isCreating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (optional)
                        </label>
                        <Input
                          value={newChannelDescription}
                          onChange={(e) => setNewChannelDescription(e.target.value)}
                          placeholder="What's this channel about?"
                          disabled={isCreating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visibility
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="public"
                              checked={newChannelType === 'public'}
                              onChange={(e) => setNewChannelType(e.target.value as 'public')}
                              disabled={isCreating}
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <Hash className="h-4 w-4" />
                                <span className="font-medium">Public</span>
                              </div>
                              <p className="text-xs text-gray-500">Anyone in the workspace can join</p>
                            </div>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="private"
                              checked={newChannelType === 'private'}
                              onChange={(e) => setNewChannelType(e.target.value as 'private')}
                              disabled={isCreating}
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <Lock className="h-4 w-4" />
                                <span className="font-medium">Private</span>
                              </div>
                              <p className="text-xs text-gray-500">Only invited members can join</p>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateChannelOpen(false)}
                          disabled={isCreating}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={!newChannelName.trim() || isCreating}
                        >
                          {isCreating ? 'Creating...' : 'Create Channel'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Direct Messages */}
          {dmChannels.length > 0 && (
            <div>
              <button
                onClick={() => setShowDMs(!showDMs)}
                className="flex items-center gap-1 w-full text-left mb-2 hover:bg-gray-100 rounded px-1 py-1"
              >
                {showDMs ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-700">Direct Messages</span>
                <span className="text-xs text-gray-500 ml-auto">{dmChannels.length}</span>
              </button>
              
              {showDMs && (
                <div className="space-y-1 ml-2">
                  {dmChannels.map(channel => (
                    <ChannelItem key={channel.id} channel={channel} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Status */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {(user?.displayName || user?.email?.split('@')[0] || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-green-600">Active</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700">
                  <Settings className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}