import { createClient } from '@blinkdotnew/sdk'

// Global client instance
let blinkClient: any = null
let initPromise: Promise<any> | null = null
let initializationAttempted = false

// Safe initialization function
export const initializeBlink = async (): Promise<any> => {
  // Return existing client if already initialized
  if (blinkClient) return blinkClient
  
  // Return existing promise if initialization is in progress
  if (initPromise) return initPromise

  // Mark that we've attempted initialization
  initializationAttempted = true

  initPromise = (async () => {
    try {
      // Add a delay to ensure modules are loaded and avoid race conditions
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const client = createClient({
        projectId: 'slack-clone-n1vybohz',
        authRequired: true
      })
      
      // Validate client has required methods
      if (client && typeof client.auth === 'object' && typeof client.auth.onAuthStateChanged === 'function') {
        blinkClient = client
        console.log('Blink client initialized successfully')
        return client
      } else {
        console.warn('Blink client not properly initialized - missing required methods')
        return null
      }
    } catch (error) {
      console.warn('Blink client initialization failed:', error)
      return null
    }
  })()

  return initPromise
}

// Export getter function (async only)
export const getBlink = async () => {
  return await initializeBlink()
}

// Safe synchronous getter - returns null if not initialized
export const getBlinkSync = () => {
  return blinkClient
}

// Check if initialization has been attempted
export const isInitializationAttempted = () => {
  return initializationAttempted
}

// Safe wrapper for blink operations
export const safeBlinkCall = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    const client = await getBlink()
    if (!client) {
      console.warn('Blink client not available, using fallback')
      return fallback
    }
    return await operation()
  } catch (error) {
    console.error('Blink operation failed:', error)
    return fallback
  }
}

// Type definitions
export type User = {
  id: string
  email: string
  displayName?: string
  avatar?: string
  status?: 'online' | 'away' | 'busy' | 'offline'
}

export type Thread = {
  id: string
  name: string
  description?: string
  type: 'channel' | 'dm' | 'ai_chat'
  participants: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  isPrivate: boolean
  aiEnabled: boolean
}

export type Message = {
  id: string
  threadId: string
  userId: string
  content: string
  type: 'text' | 'ai_response' | 'system' | 'voice_note'
  timestamp: string
  editedAt?: string
  replyTo?: string
  reactions?: { emoji: string; users: string[] }[]
  aiContext?: {
    isAiMessage: boolean
    searchResults?: any[]
    reasoning?: string
  }
}

export type SemanticCluster = {
  id: string
  name: string
  description: string
  messageIds: string[]
  keywords: string[]
  createdAt: string
  connections: string[] // IDs of related clusters
}

// Database record types (snake_case)
export type ThreadRecord = {
  id: string
  name: string
  description?: string
  type: string
  participants: string // JSON string
  created_by: string
  created_at: string
  updated_at: string
  is_private: number // SQLite boolean as 0/1
  ai_enabled: number // SQLite boolean as 0/1
  user_id: string
}

export type MessageRecord = {
  id: string
  thread_id: string
  user_id: string
  content: string
  type: string
  timestamp: string
  edited_at?: string
  reply_to?: string
  reactions?: string // JSON string
  ai_context?: string // JSON string
}

// Transformation functions
export function transformThreadRecord(record: ThreadRecord): Thread {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    type: record.type as Thread['type'],
    participants: JSON.parse(record.participants || '[]'),
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    isPrivate: Number(record.is_private) > 0,
    aiEnabled: Number(record.ai_enabled) > 0
  }
}

export function transformMessageRecord(record: MessageRecord): Message {
  return {
    id: record.id,
    threadId: record.thread_id,
    userId: record.user_id,
    content: record.content,
    type: record.type as Message['type'],
    timestamp: record.timestamp,
    editedAt: record.edited_at,
    replyTo: record.reply_to,
    reactions: record.reactions ? JSON.parse(record.reactions) : undefined,
    aiContext: record.ai_context ? JSON.parse(record.ai_context) : undefined
  }
}