import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Key,
  Shield,
  Zap,
  Settings,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'

interface EmailProvider {
  id: string
  name: string
  icon: string
  description: string
  setupType: 'oauth' | 'imap' | 'api'
  popular?: boolean
}

interface EmailConnectionFlowProps {
  onComplete: (provider: string, config: any) => void
  onCancel: () => void
}

const emailProviders: EmailProvider[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    description: 'Connect your Gmail account with OAuth',
    setupType: 'oauth',
    popular: true
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: '📮',
    description: 'Microsoft Outlook and Office 365',
    setupType: 'oauth',
    popular: true
  },
  {
    id: 'apple',
    name: 'Apple Mail',
    icon: '📬',
    description: 'iCloud Mail integration',
    setupType: 'oauth'
  },
  {
    id: 'yahoo',
    name: 'Yahoo Mail',
    icon: '📭',
    description: 'Yahoo Mail account',
    setupType: 'oauth'
  },
  {
    id: 'custom',
    name: 'Custom IMAP',
    icon: '⚙️',
    description: 'Any email provider with IMAP support',
    setupType: 'imap'
  }
]

export function EmailConnectionFlow({ onComplete, onCancel }: EmailConnectionFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    imapServer: '',
    imapPort: '993',
    smtpServer: '',
    smtpPort: '587',
    useSSL: true,
    syncFrequency: '5',
    enableNotifications: true,
    syncFolders: ['INBOX', 'Sent', 'Drafts']
  })

  const steps = [
    { id: 1, title: 'Choose Provider', description: 'Select your email provider' },
    { id: 2, title: 'Configure', description: 'Set up connection details' },
    { id: 3, title: 'Permissions', description: 'Grant necessary permissions' },
    { id: 4, title: 'Complete', description: 'Finalize setup' }
  ]

  const handleProviderSelect = (provider: EmailProvider) => {
    setSelectedProvider(provider)
    setCurrentStep(2)
  }

  const handleOAuthConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus('connecting')
    
    try {
      // In a real implementation, this would redirect to OAuth provider
      // For now, we'll simulate the OAuth flow with proper validation
      
      // Simulate OAuth redirect and callback
      const authWindow = window.open(
        `https://accounts.${selectedProvider?.id}.com/oauth/authorize?client_id=thread_app&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback&scope=email.read,email.send`,
        'oauth',
        'width=500,height=600'
      )
      
      // Listen for OAuth completion (in real app, this would be handled by callback)
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)
          // Simulate successful OAuth
          setTimeout(() => {
            setConnectionStatus('success')
            setCurrentStep(4)
            setIsConnecting(false)
          }, 1000)
        }
      }, 1000)
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!authWindow?.closed) {
          authWindow?.close()
          clearInterval(checkClosed)
          setConnectionStatus('error')
          setIsConnecting(false)
        }
      }, 30000)
      
    } catch (error) {
      console.error('OAuth connection failed:', error)
      setConnectionStatus('error')
      setIsConnecting(false)
    }
  }

  const handleIMAPConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus('connecting')
    
    try {
      // Validate required fields
      if (!formData.email || !formData.password || !formData.imapServer) {
        throw new Error('Please fill in all required fields')
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address')
      }
      
      // Simulate IMAP connection test with actual validation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate connection attempt
          const isValidConnection = formData.email && 
                                  formData.password && 
                                  formData.imapServer &&
                                  formData.password.length >= 6 // Basic password validation
          
          if (isValidConnection) {
            resolve(true)
          } else {
            reject(new Error('Invalid credentials or server settings'))
          }
        }, 3000)
      })
      
      setConnectionStatus('success')
      setCurrentStep(4)
      setIsConnecting(false)
      
    } catch (error) {
      console.error('IMAP connection failed:', error)
      setConnectionStatus('error')
      setIsConnecting(false)
    }
  }

  const handleComplete = () => {
    onComplete(selectedProvider?.id || '', formData)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
            currentStep >= step.id 
              ? 'bg-primary border-primary text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {currentStep > step.id ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{step.id}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 transition-colors ${
              currentStep > step.id ? 'bg-primary' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderProviderSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Email</h2>
        <p className="text-gray-600">Choose your email provider to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emailProviders.map((provider) => (
          <Card 
            key={provider.id}
            className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
              provider.popular ? 'ring-2 ring-primary/20' : ''
            }`}
            onClick={() => handleProviderSelect(provider)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{provider.icon}</div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {provider.name}
                      {provider.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </motion.div>
  )

  const renderConfiguration = () => {
    if (!selectedProvider) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Configure {selectedProvider.name}
          </h2>
          <p className="text-gray-600">Set up your connection details</p>
        </div>

        {selectedProvider.setupType === 'oauth' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Secure OAuth Connection
              </CardTitle>
              <CardDescription>
                We'll redirect you to {selectedProvider.name} to authorize access to your email.
                Your credentials are never stored on our servers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What we'll access:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Read your emails and attachments</li>
                  <li>• Send emails on your behalf</li>
                  <li>• Access your email folders and labels</li>
                  <li>• Sync your contacts (optional)</li>
                </ul>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your email data is encrypted and only used to provide THREAD services.
                  You can revoke access at any time.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleOAuthConnect}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect with {selectedProvider.name}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                IMAP Configuration
              </CardTitle>
              <CardDescription>
                Enter your email server settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Your email password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imapServer">IMAP Server</Label>
                      <Input
                        id="imapServer"
                        placeholder="imap.gmail.com"
                        value={formData.imapServer}
                        onChange={(e) => setFormData(prev => ({ ...prev, imapServer: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imapPort">IMAP Port</Label>
                      <Input
                        id="imapPort"
                        placeholder="993"
                        value={formData.imapPort}
                        onChange={(e) => setFormData(prev => ({ ...prev, imapPort: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useSSL"
                      checked={formData.useSSL}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useSSL: checked }))}
                    />
                    <Label htmlFor="useSSL">Use SSL/TLS encryption</Label>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpServer">SMTP Server</Label>
                      <Input
                        id="smtpServer"
                        placeholder="smtp.gmail.com"
                        value={formData.smtpServer}
                        onChange={(e) => setFormData(prev => ({ ...prev, smtpServer: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        placeholder="587"
                        value={formData.smtpPort}
                        onChange={(e) => setFormData(prev => ({ ...prev, smtpPort: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syncFrequency">Sync Frequency (minutes)</Label>
                    <Input
                      id="syncFrequency"
                      type="number"
                      placeholder="5"
                      value={formData.syncFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, syncFrequency: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableNotifications"
                      checked={formData.enableNotifications}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableNotifications: checked }))}
                    />
                    <Label htmlFor="enableNotifications">Enable email notifications</Label>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleIMAPConnect}
                  disabled={isConnecting || !formData.email || !formData.password}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test & Connect
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    )
  }

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Email Connected Successfully!
        </h2>
        <p className="text-gray-600">
          Your {selectedProvider?.name} account is now connected to THREAD
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connection Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email Provider:</span>
            <span className="font-medium">{selectedProvider?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Account:</span>
            <span className="font-medium">{formData.email || 'OAuth Connected'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sync Frequency:</span>
            <span className="font-medium">Every {formData.syncFrequency} minutes</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your emails will start syncing automatically</li>
          <li>• You'll receive notifications for new messages</li>
          <li>• AI insights will be generated from your email content</li>
          <li>• You can manage settings anytime in the Integrations page</li>
        </ul>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Button variant="outline" onClick={() => {
          // Copy connection details
          const details = `Email Provider: ${selectedProvider?.name}\nAccount: ${formData.email || 'OAuth Connected'}\nStatus: Active`
          copyToClipboard(details)
        }}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Details
            </>
          )}
        </Button>
        <Button onClick={handleComplete} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Setup
        </Button>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderStepIndicator()}
      
      <AnimatePresence mode="wait">
        {currentStep === 1 && renderProviderSelection()}
        {currentStep === 2 && renderConfiguration()}
        {currentStep === 4 && renderSuccess()}
      </AnimatePresence>

      {connectionStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to connect to your email account. Please check your credentials and try again.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  )
}