import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Star,
  Trash2,
  Edit,
  MoreHorizontal,
  Shield,
  Key,
  Globe,
  Database,
  MessageSquare,
  BarChart3,
  GitBranch,
  Figma,
  Slack,
  Calendar,
  FileText,
  Mail,
  Phone,
  Camera,
  Headphones,
  Monitor,
  Smartphone,
  Wifi,
  Cloud,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: 'pm' | 'design' | 'communication' | 'analytics' | 'development' | 'productivity' | 'storage'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  lastSync?: string
  features: string[]
  color: string
  setupType: 'oauth' | 'api-key' | 'webhook' | 'manual'
  isPopular?: boolean
  isPremium?: boolean
  config?: {
    apiKey?: string
    webhookUrl?: string
    permissions?: string[]
    syncFrequency?: string
  }
}

interface IntegrationManagementFlowProps {
  isDemoMode?: boolean
}

const availableIntegrations: Integration[] = [
  // Project Management
  {
    id: 'jira',
    name: 'Jira',
    description: 'Atlassian project management and issue tracking',
    icon: BarChart3,
    category: 'pm',
    status: 'disconnected',
    features: ['Issue tracking', 'Sprint planning', 'Reporting', 'Workflows'],
    color: 'bg-blue-500',
    setupType: 'oauth',
    isPopular: true
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Team task and project management platform',
    icon: CheckCircle,
    category: 'pm',
    status: 'disconnected',
    features: ['Task management', 'Team collaboration', 'Timeline view', 'Goals'],
    color: 'bg-pink-500',
    setupType: 'oauth',
    isPopular: true
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Modern issue tracking for software teams',
    icon: GitBranch,
    category: 'pm',
    status: 'disconnected',
    features: ['Issue tracking', 'Roadmaps', 'Cycles', 'Triage'],
    color: 'bg-purple-500',
    setupType: 'api-key',
    isPopular: true
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Visual project management with boards and cards',
    icon: BarChart3,
    category: 'pm',
    status: 'disconnected',
    features: ['Kanban boards', 'Cards', 'Lists', 'Power-ups'],
    color: 'bg-blue-600',
    setupType: 'oauth'
  },
  
  // Design
  {
    id: 'figma',
    name: 'Figma',
    description: 'Collaborative design and prototyping platform',
    icon: Figma,
    category: 'design',
    status: 'disconnected',
    features: ['Design files', 'Comments', 'Version history', 'Prototypes'],
    color: 'bg-orange-500',
    setupType: 'oauth',
    isPopular: true
  },
  {
    id: 'miro',
    name: 'Miro',
    description: 'Online collaborative whiteboard platform',
    icon: FileText,
    category: 'design',
    status: 'disconnected',
    features: ['Whiteboarding', 'Mind maps', 'Flowcharts', 'Templates'],
    color: 'bg-yellow-500',
    setupType: 'oauth'
  },
  {
    id: 'sketch',
    name: 'Sketch',
    description: 'Digital design toolkit for Mac',
    icon: Monitor,
    category: 'design',
    status: 'disconnected',
    features: ['Vector editing', 'Symbols', 'Libraries', 'Plugins'],
    color: 'bg-orange-400',
    setupType: 'api-key',
    isPremium: true
  },
  
  // Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and messaging platform',
    icon: Slack,
    category: 'communication',
    status: 'disconnected',
    features: ['Channels', 'Direct messages', 'File sharing', 'Apps'],
    color: 'bg-green-500',
    setupType: 'oauth',
    isPopular: true
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Voice, video and text communication',
    icon: MessageSquare,
    category: 'communication',
    status: 'disconnected',
    features: ['Voice channels', 'Text chat', 'Screen sharing', 'Bots'],
    color: 'bg-indigo-500',
    setupType: 'webhook'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Microsoft collaboration platform',
    icon: Phone,
    category: 'communication',
    status: 'disconnected',
    features: ['Video calls', 'Chat', 'File sharing', 'Apps'],
    color: 'bg-blue-700',
    setupType: 'oauth'
  },
  
  // Development
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and collaboration platform',
    icon: GitBranch,
    category: 'development',
    status: 'disconnected',
    features: ['Repositories', 'Pull requests', 'Issues', 'Actions'],
    color: 'bg-gray-800',
    setupType: 'oauth',
    isPopular: true
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'DevOps platform with Git repository management',
    icon: GitBranch,
    category: 'development',
    status: 'disconnected',
    features: ['Git repos', 'CI/CD', 'Issue tracking', 'Wiki'],
    color: 'bg-orange-600',
    setupType: 'oauth'
  },
  
  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes and docs',
    icon: FileText,
    category: 'productivity',
    status: 'disconnected',
    features: ['Documentation', 'Databases', 'Templates', 'Collaboration'],
    color: 'bg-gray-500',
    setupType: 'oauth',
    isPopular: true
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Cloud collaboration service with spreadsheet-database hybrid',
    icon: Database,
    category: 'productivity',
    status: 'disconnected',
    features: ['Databases', 'Views', 'Automations', 'Apps'],
    color: 'bg-yellow-600',
    setupType: 'api-key'
  },
  
  // Storage
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud storage and file synchronization',
    icon: Cloud,
    category: 'storage',
    status: 'disconnected',
    features: ['File storage', 'Sync', 'Sharing', 'Backup'],
    color: 'bg-blue-400',
    setupType: 'oauth'
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    description: 'Google cloud storage and productivity suite',
    icon: Cloud,
    category: 'storage',
    status: 'disconnected',
    features: ['File storage', 'Docs', 'Sheets', 'Slides'],
    color: 'bg-green-600',
    setupType: 'oauth',
    isPopular: true
  }
]

export function IntegrationManagementFlow({ isDemoMode = false }: IntegrationManagementFlowProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(availableIntegrations)
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  // Setup form data
  const [setupData, setSetupData] = useState({
    apiKey: '',
    webhookUrl: '',
    permissions: [] as string[],
    syncFrequency: '5'
  })

  const categories = [
    { id: 'all', name: 'All Integrations', count: integrations.length },
    { id: 'pm', name: 'Project Management', count: integrations.filter(i => i.category === 'pm').length },
    { id: 'design', name: 'Design', count: integrations.filter(i => i.category === 'design').length },
    { id: 'communication', name: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'development', name: 'Development', count: integrations.filter(i => i.category === 'development').length },
    { id: 'productivity', name: 'Productivity', count: integrations.filter(i => i.category === 'productivity').length },
    { id: 'storage', name: 'Storage', count: integrations.filter(i => i.category === 'storage').length }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const errorCount = integrations.filter(i => i.status === 'error').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>
      case 'error': return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Connecting</Badge>
      default: return <Badge variant="outline">Available</Badge>
    }
  }

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsSetupDialogOpen(true)
    setSetupData({
      apiKey: '',
      webhookUrl: '',
      permissions: [],
      syncFrequency: '5'
    })
  }

  const handleSetupComplete = async () => {
    if (!selectedIntegration) return
    
    setIsConnecting(true)
    
    try {
      // Validate setup based on integration type
      if (selectedIntegration.setupType === 'api-key') {
        if (!setupData.apiKey || setupData.apiKey.length < 10) {
          throw new Error('Please enter a valid API key')
        }
        
        // Simulate API key validation
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Basic API key format validation
            const isValidApiKey = setupData.apiKey.match(/^[a-zA-Z0-9_-]{20,}$/) || 
                                setupData.apiKey.startsWith('sk_') || 
                                setupData.apiKey.startsWith('xoxb-') ||
                                setupData.apiKey.startsWith('pat_')
            
            if (isValidApiKey) {
              resolve(true)
            } else {
              reject(new Error('Invalid API key format. Please check your credentials.'))
            }
          }, 2000)
        })
      } else if (selectedIntegration.setupType === 'oauth') {
        // Simulate OAuth flow
        const authWindow = window.open(
          `https://api.${selectedIntegration.id}.com/oauth/authorize?client_id=thread_app&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback`,
          'oauth',
          'width=500,height=600'
        )
        
        await new Promise((resolve, reject) => {
          const checkClosed = setInterval(() => {
            if (authWindow?.closed) {
              clearInterval(checkClosed)
              resolve(true)
            }
          }, 1000)
          
          // Timeout after 30 seconds
          setTimeout(() => {
            if (!authWindow?.closed) {
              authWindow?.close()
              clearInterval(checkClosed)
              reject(new Error('OAuth authorization was cancelled or timed out'))
            }
          }, 30000)
        })
      } else if (selectedIntegration.setupType === 'webhook') {
        // For webhook, just validate the URL format
        if (!setupData.webhookUrl) {
          throw new Error('Webhook URL is required')
        }
      }
      
      // If we get here, connection was successful
      setIntegrations(prev => prev.map(integration => 
        integration.id === selectedIntegration.id 
          ? { 
              ...integration, 
              status: 'connected' as const, 
              lastSync: 'Just now',
              config: setupData
            }
          : integration
      ))
      setIsConnecting(false)
      setIsSetupDialogOpen(false)
      setSelectedIntegration(null)
      
    } catch (error) {
      console.error('Integration setup failed:', error)
      setIsConnecting(false)
      // Show error to user (you could add error state here)
      alert(error instanceof Error ? error.message : 'Connection failed. Please try again.')
    }
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'disconnected' as const, lastSync: undefined, config: undefined }
        : integration
    ))
  }

  const renderSetupDialog = () => {
    if (!selectedIntegration) return null

    return (
      <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-8 h-8 ${selectedIntegration.color} rounded-lg flex items-center justify-center`}>
                <selectedIntegration.icon className="h-4 w-4 text-white" />
              </div>
              Connect {selectedIntegration.name}
            </DialogTitle>
            <DialogDescription>
              Set up your {selectedIntegration.name} integration to sync data with THREAD
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Features */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">What you'll get:</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedIntegration.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Setup based on type */}
            {selectedIntegration.setupType === 'oauth' && (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    We'll redirect you to {selectedIntegration.name} to authorize access. 
                    Your credentials are never stored on our servers.
                  </AlertDescription>
                </Alert>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Permissions we'll request:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Read your {selectedIntegration.name} data</li>
                    <li>• Create and update items on your behalf</li>
                    <li>• Access your profile information</li>
                    <li>• Receive notifications about changes</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedIntegration.setupType === 'api-key' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="Enter your API key"
                      value={setupData.apiKey}
                      onChange={(e) => setSetupData(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    You can find your API key in your {selectedIntegration.name} account settings. 
                    <Button variant="link" className="p-0 h-auto text-blue-600">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View instructions
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {selectedIntegration.setupType === 'webhook' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value="https://api.thread.com/webhooks/discord"
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-600">
                    Copy this URL to your {selectedIntegration.name} webhook settings
                  </p>
                </div>

                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Configure this webhook URL in your {selectedIntegration.name} server settings 
                    to receive real-time updates in THREAD.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="syncFrequency">Sync Frequency</Label>
                  <Select
                    value={setupData.syncFrequency}
                    onValueChange={(value) => setSetupData(prev => ({ ...prev, syncFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every minute</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsSetupDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSetupComplete}
                disabled={isConnecting || (selectedIntegration.setupType === 'api-key' && !setupData.apiKey)}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Connect {selectedIntegration.name}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Integration Marketplace
            {isDemoMode && (
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Demo Mode
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">Connect your favorite tools to streamline your workflow</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-green-600">{connectedCount}</span> connected
            {errorCount > 0 && (
              <>
                <span className="mx-2">•</span>
                <span className="font-medium text-red-600">{errorCount}</span> errors
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{category.name}</span>
            <Badge variant="secondary" className="bg-white/20 text-current border-0">
              {category.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon
          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {integration.name}
                        {integration.isPopular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                        {integration.isPremium && (
                          <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500">Premium</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(integration.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Star className="w-4 h-4 mr-2" />
                          Add to favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View documentation
                        </DropdownMenuItem>
                        {integration.status === 'connected' && (
                          <DropdownMenuItem 
                            onClick={() => handleDisconnect(integration.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status and Last Sync */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(integration.status)}
                  {integration.lastSync && (
                    <span className="text-xs text-gray-500">
                      Synced {integration.lastSync}
                    </span>
                  )}
                </div>

                {/* Features */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {integration.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{integration.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Setup Type */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {integration.setupType === 'oauth' && <Shield className="w-3 h-3" />}
                    {integration.setupType === 'api-key' && <Key className="w-3 h-3" />}
                    {integration.setupType === 'webhook' && <Globe className="w-3 h-3" />}
                    <span className="capitalize">{integration.setupType.replace('-', ' ')} setup</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  {integration.status === 'connected' ? (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(integration)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Setup Dialog */}
      {renderSetupDialog()}
    </div>
  )
}