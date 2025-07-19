import React, { createContext, useCallback, useEffect, useState } from 'react'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'

interface Workspace {
  id: string
  name: string
  description?: string
  avatarUrl?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

interface Channel {
  id: string
  workspaceId: string
  name: string
  description?: string
  type: 'public' | 'private' | 'dm'
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  channels: Channel[]
  isLoading: boolean
  createWorkspace: (name: string, description?: string) => Promise<Workspace>
  joinWorkspace: (workspaceId: string) => Promise<void>
  setCurrentWorkspace: (workspace: Workspace) => void
  createChannel: (name: string, description?: string, type?: 'public' | 'private') => Promise<Channel>
  refreshWorkspaces: () => Promise<void>
  refreshChannels: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshWorkspaces = useCallback(async () => {
    if (!user?.id) return

    try {
      // Get workspaces where user is a member
      const membershipData = await blink.db.workspaceMembers.list({
        where: { userId: user.id }
      })

      const workspaceIds = membershipData.map((m: any) => m.workspaceId)
      
      if (workspaceIds.length > 0) {
        // Use IN clause instead of OR for better performance and simpler syntax
        const workspaceData = await blink.db.workspaces.list({
          where: {
            id: { in: workspaceIds }
          }
        })
        setWorkspaces(workspaceData as Workspace[])
        
        // Set first workspace as current if none selected
        if (!currentWorkspace && workspaceData.length > 0) {
          setCurrentWorkspace(workspaceData[0] as Workspace)
        }
      } else {
        setWorkspaces([])
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    }
  }, [user?.id, currentWorkspace])

  const refreshChannels = useCallback(async () => {
    console.log('refreshChannels called with:', { workspaceId: currentWorkspace?.id, userId: user?.id })
    
    if (!currentWorkspace?.id || !user?.id) {
      console.log('refreshChannels: Missing workspace or user, skipping')
      return
    }

    try {
      console.log('Fetching channel memberships for user...')
      // Get channels in current workspace where user is a member
      const membershipData = await blink.db.channelMembers.list({
        where: { userId: user.id }
      })

      console.log('Channel memberships found:', membershipData)
      const channelIds = membershipData.map((m: any) => m.channelId)
      console.log('Channel IDs:', channelIds)
      
      if (channelIds.length > 0) {
        console.log('Fetching channel details...')
        const channelData = await blink.db.channels.list({
          where: {
            AND: [
              { workspaceId: currentWorkspace.id },
              { id: { in: channelIds } }
            ]
          }
        })
        console.log('Channel data fetched:', channelData)
        setChannels(channelData as Channel[])
      } else {
        console.log('No channel memberships found, setting empty channels')
        setChannels([])
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }, [currentWorkspace?.id, user?.id])

  const createWorkspace = async (name: string, description?: string): Promise<Workspace> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const workspace = await blink.db.workspaces.create({
        id: `workspace_${Date.now()}`,
        name,
        description,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Add user as owner to workspace
      await blink.db.workspaceMembers.create({
        id: `member_${Date.now()}`,
        workspaceId: workspace.id,
        userId: user.id,
        role: 'owner',
        joinedAt: new Date().toISOString()
      })

      // Create default general channel
      const generalChannel = await blink.db.channels.create({
        id: `channel_${Date.now()}`,
        workspaceId: workspace.id,
        name: 'general',
        description: 'General discussion',
        type: 'public',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Add user to general channel
      await blink.db.channelMembers.create({
        id: `channelmember_${Date.now()}`,
        channelId: generalChannel.id,
        userId: user.id,
        joinedAt: new Date().toISOString()
      })

      await refreshWorkspaces()
      return workspace as Workspace
    } catch (error) {
      console.error('Error creating workspace:', error)
      throw error
    }
  }

  const joinWorkspace = async (workspaceId: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      await blink.db.workspaceMembers.create({
        id: `member_${Date.now()}`,
        workspaceId,
        userId: user.id,
        role: 'member',
        joinedAt: new Date().toISOString()
      })

      await refreshWorkspaces()
    } catch (error) {
      console.error('Error joining workspace:', error)
      throw error
    }
  }

  const createChannel = async (name: string, description?: string, type: 'public' | 'private' = 'public'): Promise<Channel> => {
    console.log('createChannel called with:', { name, description, type, userId: user?.id, workspaceId: currentWorkspace?.id })
    
    if (!user?.id || !currentWorkspace?.id) {
      const error = new Error('User not authenticated or no workspace selected')
      console.error('createChannel validation failed:', error.message)
      throw error
    }

    try {
      console.log('Creating channel in database...')
      const channel = await blink.db.channels.create({
        id: `channel_${Date.now()}`,
        workspaceId: currentWorkspace.id,
        name,
        description,
        type,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      console.log('Channel created in database:', channel)

      // Add user to channel
      console.log('Adding user to channel...')
      await blink.db.channelMembers.create({
        id: `channelmember_${Date.now()}`,
        channelId: channel.id,
        userId: user.id,
        joinedAt: new Date().toISOString()
      })

      console.log('User added to channel, refreshing channels list...')
      await refreshChannels()
      console.log('Channels refreshed successfully')
      
      return channel as Channel
    } catch (error) {
      console.error('Error creating channel:', error)
      throw error
    }
  }

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true)
      refreshWorkspaces().finally(() => setIsLoading(false))
    } else {
      setWorkspaces([])
      setChannels([])
      setCurrentWorkspace(null)
      setIsLoading(false)
    }
  }, [user?.id, refreshWorkspaces])

  useEffect(() => {
    if (currentWorkspace?.id) {
      refreshChannels()
    } else {
      setChannels([])
    }
  }, [currentWorkspace?.id, refreshChannels])

  const value = {
    currentWorkspace,
    workspaces,
    channels,
    isLoading,
    createWorkspace,
    joinWorkspace,
    setCurrentWorkspace,
    createChannel,
    refreshWorkspaces,
    refreshChannels
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export { WorkspaceContext }