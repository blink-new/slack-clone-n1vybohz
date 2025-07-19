import { useCallback, useEffect, useState } from 'react'
import { blink } from '../blink/client'
import { useAuth } from './useAuth'

interface Message {
  id: string
  channelId: string
  userId: string
  content: string
  type: 'text' | 'file' | 'image' | 'system'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  threadId?: string
  replyCount: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    displayName?: string
    avatarUrl?: string
  }
}

export function useMessages(channelId: string | null) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const loadMessages = useCallback(async () => {
    if (!channelId || !user?.id) return

    setIsLoading(true)
    try {
      const messageData = await blink.db.messages.list({
        where: { channelId },
        orderBy: { createdAt: 'asc' },
        limit: 100
      })

      // Get user profiles for message authors
      const userIds = [...new Set(messageData.map((m: any) => m.userId))]
      let userProfiles: any[] = []
      
      if (userIds.length > 0) {
        userProfiles = await blink.db.userProfiles.list({
          where: {
            userId: { in: userIds }
          }
        })
      }

      const userMap = new Map()
      userProfiles.forEach((profile: any) => {
        userMap.set(profile.userId, {
          id: profile.userId,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl
        })
      })

      const messagesWithUsers = messageData.map((message: any) => ({
        ...message,
        user: userMap.get(message.userId)
      }))

      setMessages(messagesWithUsers as Message[])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [channelId, user?.id])

  const sendMessage = useCallback(async (content: string, type: 'text' | 'file' | 'image' = 'text', fileData?: { url: string, name: string, size: number }) => {
    if (!channelId || !user?.id || !content.trim()) return

    try {
      const messageData: any = {
        id: `message_${Date.now()}`,
        channelId,
        userId: user.id,
        content: content.trim(),
        type,
        replyCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (fileData) {
        messageData.fileUrl = fileData.url
        messageData.fileName = fileData.name
        messageData.fileSize = fileData.size
      }

      const newMessage = await blink.db.messages.create(messageData)

      // Publish real-time message
      await blink.realtime.publish(`channel_${channelId}`, 'message', {
        ...newMessage,
        user: {
          id: user.id,
          displayName: user.displayName || user.email?.split('@')[0],
          avatarUrl: user.avatarUrl
        }
      })

      // Optimistically add to local state
      setMessages(prev => [...prev, {
        ...newMessage,
        user: {
          id: user.id,
          displayName: user.displayName || user.email?.split('@')[0],
          avatarUrl: user.avatarUrl
        }
      } as Message])

      return newMessage
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }, [channelId, user])

  const uploadFile = useCallback(async (file: File): Promise<{ url: string, name: string, size: number }> => {
    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `messages/${channelId}/${Date.now()}_${file.name}`,
        { upsert: true }
      )

      return {
        url: publicUrl,
        name: file.name,
        size: file.size
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }, [channelId])

  // Real-time message subscription
  useEffect(() => {
    if (!channelId || !user?.id) return

    let unsubscribe: (() => void) | null = null

    const setupRealtime = async () => {
      try {
        setIsConnected(false)
        
        unsubscribe = await blink.realtime.subscribe(`channel_${channelId}`, (message) => {
          if (message.type === 'message' && message.data.userId !== user.id) {
            // Add new message from other users
            setMessages(prev => {
              const exists = prev.find(m => m.id === message.data.id)
              if (exists) return prev
              return [...prev, message.data as Message]
            })
          }
        })

        setIsConnected(true)
      } catch (error) {
        console.error('Error setting up real-time messaging:', error)
        setIsConnected(false)
      }
    }

    setupRealtime()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
      setIsConnected(false)
    }
  }, [channelId, user?.id])

  // Load messages when channel changes
  useEffect(() => {
    if (channelId) {
      loadMessages()
    } else {
      setMessages([])
    }
  }, [channelId, loadMessages])

  return {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    uploadFile,
    refreshMessages: loadMessages
  }
}