import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface OnlineUser {
  id: string
  displayName: string
  avatarUrl?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: string
}

interface OnlineStatusProps {
  users: OnlineUser[]
  maxVisible?: number
}

export function OnlineStatus({ users, maxVisible = 5 }: OnlineStatusProps) {
  const onlineUsers = users.filter(u => u.status === 'online')
  const visibleUsers = onlineUsers.slice(0, maxVisible)
  const remainingCount = Math.max(0, onlineUsers.length - maxVisible)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  if (onlineUsers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="h-2 w-2 bg-gray-400 rounded-full" />
        <span>No one online</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                      {user.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${getStatusColor(user.status)} border-2 border-white rounded-full`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.displayName} • {user.status}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">+{remainingCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{remainingCount} more online</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">{onlineUsers.length}</span> online
      </div>
    </div>
  )
}