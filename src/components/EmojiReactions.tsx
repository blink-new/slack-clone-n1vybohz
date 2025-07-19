import React, { useState } from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Plus, Smile } from 'lucide-react'

interface Reaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

interface EmojiReactionsProps {
  messageId: string
  reactions: Reaction[]
  onAddReaction: (messageId: string, emoji: string) => void
  onRemoveReaction: (messageId: string, emoji: string) => void
  currentUserId: string
}

const COMMON_EMOJIS = [
  '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏',
  '✅', '❌', '⭐', '💯', '🚀', '👀', '🤔', '💡', '⚡', '🎯'
]

export function EmojiReactions({ 
  messageId, 
  reactions, 
  onAddReaction, 
  onRemoveReaction, 
  currentUserId 
}: EmojiReactionsProps) {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  const handleReactionClick = (emoji: string, hasReacted: boolean) => {
    if (hasReacted) {
      onRemoveReaction(messageId, emoji)
    } else {
      onAddReaction(messageId, emoji)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    onAddReaction(messageId, emoji)
    setIsEmojiPickerOpen(false)
  }

  if (reactions.length === 0) {
    return (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Smile className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-10 gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {reactions.map((reaction) => (
        <TooltipProvider key={reaction.emoji}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all hover:scale-105 ${
                  reaction.hasReacted
                    ? 'bg-blue-100 border border-blue-300 text-blue-700'
                    : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {reaction.users.length === 1 
                  ? `${reaction.users[0]} reacted with ${reaction.emoji}`
                  : reaction.users.length === 2
                  ? `${reaction.users[0]} and ${reaction.users[1]} reacted with ${reaction.emoji}`
                  : `${reaction.users[0]} and ${reaction.users.length - 1} others reacted with ${reaction.emoji}`
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="grid grid-cols-10 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}