import React, { createContext, useCallback, useEffect, useState } from 'react'
import { blink } from '../blink/client'

interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
}

interface UserProfile {
  id: string
  userId: string
  displayName?: string
  title?: string
  phone?: string
  timezone?: string
  avatarUrl?: string
  status: string
  statusMessage?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const profiles = await blink.db.userProfiles.list({
        where: { userId: user.id },
        limit: 1
      })
      
      if (profiles.length > 0) {
        setUserProfile(profiles[0] as UserProfile)
      } else {
        // Create default profile
        const newProfile = await blink.db.userProfiles.create({
          id: `profile_${Date.now()}`,
          userId: user.id,
          displayName: user.displayName || user.email.split('@')[0],
          status: 'active'
        })
        setUserProfile(newProfile as UserProfile)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }, [user])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return
    
    try {
      await blink.db.userProfiles.update(userProfile.id, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      setUserProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setIsLoading(state.isLoading)
      
      if (state.user) {
        refreshProfile()
      } else {
        setUserProfile(null)
      }
    })

    return unsubscribe
  }, [refreshProfile])

  const value = {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }