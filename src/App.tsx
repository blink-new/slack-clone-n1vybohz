import React, { useState, useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { useAuth } from './hooks/useAuth'
import { useWorkspace } from './hooks/useWorkspace'
import NavigationSidebar from './components/NavigationSidebar'
import AIInsightsDashboard from './components/AIInsightsDashboard'
import ToolIntegrations from './components/ToolIntegrations'
import UniversalSearch from './components/UniversalSearch'
import { ProductionThreadSidebar } from './components/ProductionThreadSidebar'
import { ProductionThreadView } from './components/ProductionThreadView'
import { Calendar } from './components/Calendar'
import { EmailView } from './components/EmailView'
import { CallsView } from './components/CallsView'
import { VoiceControl } from './components/VoiceControl'
import AIProjectManager from './components/AIProjectManager'
import { WorkspaceSetup } from './components/WorkspaceSetup'
import { LoadingScreen } from './components/LoadingScreen'
import { NotificationCenter } from './components/NotificationCenter'
import { OnlineStatus } from './components/OnlineStatus'
import { DemoModeToggle } from './components/DemoModeToggle'
import { PeopleInvitationSystem } from './components/PeopleInvitationSystem'
import './App.css'

function AppContent() {
  const { user, userProfile, isLoading: authLoading } = useAuth()
  const { currentWorkspace, channels, isLoading: workspaceLoading } = useWorkspace()
  const [currentView, setCurrentView] = useState('ai-insights')
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove the '#'
      if (hash && hash !== currentView) {
        setCurrentView(hash)
      }
    }

    // Set initial view from hash
    handleHashChange()
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentView])

  // Update hash when view changes
  const handleViewChange = (view: string) => {
    setCurrentView(view)
    window.location.hash = view
  }
  
  // Demo data - only shown when demo mode is enabled
  const demoNotifications = [
    {
      id: '1',
      type: 'message' as const,
      title: 'New message in #general',
      description: 'Sarah: Hey team, the new designs are ready for review!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      channelName: 'general',
      userName: 'Sarah',
      avatar: undefined
    },
    {
      id: '2',
      type: 'mention' as const,
      title: 'You were mentioned',
      description: 'John mentioned you in #product-design',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isRead: false,
      channelName: 'product-design',
      userName: 'John',
      avatar: undefined
    },
    {
      id: '3',
      type: 'meeting' as const,
      title: 'Meeting starting soon',
      description: 'Sprint Planning meeting starts in 10 minutes',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: true,
      channelName: undefined,
      userName: undefined,
      avatar: undefined
    }
  ]
  
  const demoOnlineUsers = [
    {
      id: '1',
      displayName: 'Sarah Chen',
      avatarUrl: undefined,
      status: 'online' as const
    },
    {
      id: '2',
      displayName: 'John Smith',
      avatarUrl: undefined,
      status: 'online' as const
    },
    {
      id: '3',
      displayName: 'Emily Davis',
      avatarUrl: undefined,
      status: 'away' as const
    },
    {
      id: '4',
      displayName: 'Mike Johnson',
      avatarUrl: undefined,
      status: 'online' as const
    },
    {
      id: '5',
      displayName: 'Lisa Wang',
      avatarUrl: undefined,
      status: 'busy' as const
    }
  ]
  
  // Production data - empty by default for new users
  const [notifications, setNotifications] = useState<any[]>([])
  const [onlineUsers] = useState<any[]>([])

  const isLoading = authLoading || workspaceLoading

  // Show loading screen while authentication is initializing
  if (isLoading) {
    return <LoadingScreen />
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">THREAD</h1>
            <p className="text-gray-600">Professional team communication platform</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to THREAD</h2>
            <p className="text-gray-600 mb-6">
              Sign in to access your workspace and start collaborating with your team.
            </p>
            <button
              onClick={() => window.location.href = 'https://blink.new/auth'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show workspace setup if user has no workspaces
  if (!currentWorkspace) {
    return <WorkspaceSetup />
  }

  const handleVoiceCommand = (command: string, intent: string, parameters: any) => {
    console.log('🎤 Voice command:', { command, intent, parameters })
    
    switch (intent) {
      case 'create_channel':
        // TODO: Implement channel creation
        console.log('Create channel:', parameters.channelName)
        break
      case 'send_message':
        // TODO: Implement message sending
        console.log('Send message:', parameters.content)
        break
      case 'search_messages':
        // TODO: Implement search
        console.log('Search:', parameters.searchQuery)
        break
      default:
        console.log('Unknown voice command:', command)
    }
  }

  const handleMarkNotificationAsRead = (id: string) => {
    if (isDemoMode) {
      // In demo mode, don't actually modify notifications
      console.log('Demo: Mark notification as read:', id)
      return
    }
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const handleMarkAllNotificationsAsRead = () => {
    if (isDemoMode) {
      console.log('Demo: Mark all notifications as read')
      return
    }
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const handleClearAllNotifications = () => {
    if (isDemoMode) {
      console.log('Demo: Clear all notifications')
      return
    }
    setNotifications([])
  }

  // Get current notifications and users based on demo mode
  const currentNotifications = isDemoMode ? demoNotifications : notifications
  const currentOnlineUsers = isDemoMode ? demoOnlineUsers : onlineUsers

  const renderMainContent = () => {
    switch (currentView) {
      case 'ai-insights':
        return <AIInsightsDashboard 
          isDemoMode={isDemoMode}
          hasAIInsights={isDemoMode} // For now, only demo mode has AI insights
          hasEmailIntegration={isDemoMode} // For now, only demo mode has email integration
          onViewChange={handleViewChange}
        />
      case 'dms':
        return (
          <div className="flex h-full">
            <ProductionThreadSidebar
              selectedChannelId={selectedChannelId}
              onChannelSelect={setSelectedChannelId}
            />
            <ProductionThreadView
              channel={channels.find(c => c.id === selectedChannelId) || null}
            />
          </div>
        )
      case 'activity':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Activity Feed</h1>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Recent activity will appear here...</p>
              </div>
            </div>
          </div>
        )
      case 'email':
        return <EmailView isDemoMode={isDemoMode} />
      case 'calls':
        return <CallsView isDemoMode={isDemoMode} />
      case 'calendar':
        return (
          <Calendar
            user={{
              id: user.id,
              email: user.email,
              displayName: userProfile?.displayName || user.displayName,
              avatarUrl: userProfile?.avatarUrl || user.avatarUrl
            }}
          />
        )
      case 'files':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Files</h1>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Your files will appear here...</p>
              </div>
            </div>
          </div>
        )
      case 'integrations':
        return <ToolIntegrations isDemoMode={isDemoMode} />
      case 'projects':
        return <AIProjectManager isDemoMode={isDemoMode} />
      case 'people':
        return (
          <div className="h-full">
            <PeopleInvitationSystem
              isDemoMode={isDemoMode}
              onInviteMember={(invitation) => {
                console.log('Invite member:', invitation)
              }}
              onUpdateMemberRole={(memberId, role) => {
                console.log('Update member role:', memberId, role)
              }}
              onRemoveMember={(memberId) => {
                console.log('Remove member:', memberId)
              }}
            />
          </div>
        )
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Profile</h3>
                <p className="text-sm text-gray-600">Email: {user.email}</p>
                <p className="text-sm text-gray-600">Display Name: {userProfile?.displayName || 'Not set'}</p>
                <p className="text-sm text-gray-600">Status: {userProfile?.status || 'active'}</p>
              </div>
            </div>
          </div>
        )
      default:
        return <AIInsightsDashboard 
          isDemoMode={isDemoMode}
          hasAIInsights={isDemoMode}
          hasEmailIntegration={isDemoMode}
          onViewChange={handleViewChange}
        />
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Search Bar - Show for all views except email, projects, and people which have their own search */}
        {currentView !== 'email' && currentView !== 'projects' && currentView !== 'people' && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <div className="flex-1">
                <UniversalSearch
                  onResultSelect={(result) => {
                    console.log('Search result selected:', result)
                  }}
                />
              </div>
              <OnlineStatus users={currentOnlineUsers} maxVisible={3} />
              <NotificationCenter
                notifications={currentNotifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                onClearAll={handleClearAllNotifications}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'dms' || currentView === 'projects' || currentView === 'people' ? (
            renderMainContent()
          ) : currentView === 'email' ? (
            <div className="h-full">
              {renderMainContent()}
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <div className="max-w-7xl mx-auto p-6">
                {renderMainContent()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Mode Toggle */}
      <DemoModeToggle
        isDemoMode={isDemoMode}
        onToggle={setIsDemoMode}
      />

      {/* Voice Control */}
      <VoiceControl
        onCommand={handleVoiceCommand}
        isEnabled={isVoiceEnabled}
        onToggle={() => setIsVoiceEnabled(!isVoiceEnabled)}
      />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WorkspaceProvider>
          <AppContent />
        </WorkspaceProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App