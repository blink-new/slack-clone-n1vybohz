import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface TypingUser {
  id: string
  displayName: string
  avatarUrl?: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].displayName} is typing...`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing...`
    } else {
      return `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing...`
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
      <div className="flex -space-x-1">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="h-5 w-5 border border-white">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {user.displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      
      <span className="text-xs italic">{getTypingText()}</span>
      
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}