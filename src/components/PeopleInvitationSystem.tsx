import { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Send, 
  Copy, 
  Check,
  Search,
  Filter,
  MoreVertical,
  Crown,
  Shield,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  Trash2,
  Edit,
  MessageCircle,
  Phone,
  Video
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Alert, AlertDescription } from './ui/alert'

interface TeamMember {
  id: string
  email: string
  displayName: string
  avatar?: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  status: 'active' | 'invited' | 'pending' | 'inactive'
  joinedAt: string
  lastActive: string
  permissions: {
    canInvite: boolean
    canManageThreads: boolean
    canManageMembers: boolean
    canAccessAnalytics: boolean
  }
  department?: string
  title?: string
  threads: string[]
}

interface Invitation {
  id: string
  email: string
  invitedBy: string
  invitedAt: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  role: 'admin' | 'member' | 'guest'
  message?: string
  threads?: string[]
}

interface PeopleInvitationSystemProps {
  threadId?: string
  onInviteMember: (invitation: Omit<Invitation, 'id'>) => void
  onUpdateMemberRole: (memberId: string, role: TeamMember['role']) => void
  onRemoveMember: (memberId: string) => void
  className?: string
}

export function PeopleInvitationSystem({
  threadId,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  className = ''
}: PeopleInvitationSystemProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentTab, setCurrentTab] = useState('members')
  const [invitationSent, setInvitationSent] = useState(false)
  
  // Invite form state
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'guest'>('member')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteToThreads, setInviteToThreads] = useState<string[]>([])
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [copyInviteLink, setCopyInviteLink] = useState(false)

  // Initialize with current user only
  useEffect(() => {
    const currentUser: TeamMember = {
      id: 'current_user',
      email: 'you@thread.ai',
      displayName: 'You',
      role: 'owner',
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: {
        canInvite: true,
        canManageThreads: true,
        canManageMembers: true,
        canAccessAnalytics: true
      },
      department: 'Product',
      title: 'Owner',
      threads: []
    }

    setMembers([currentUser])
    setInvitations([])
  }, [])

  const handleSendInvitations = async () => {
    if (!inviteEmails.trim()) return

    const emails = inviteEmails.split(',').map(email => email.trim()).filter(Boolean)
    
    try {
      // Send invitation emails using Blink SDK
      for (const email of emails) {
        const invitation: Omit<Invitation, 'id'> = {
          email,
          invitedBy: 'current_user', // Current user
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          status: 'pending',
          role: inviteRole,
          message: inviteMessage || undefined,
          threads: inviteToThreads.length > 0 ? inviteToThreads : undefined
        }

        // Generate invitation link
        const invitationId = `inv_${Date.now()}_${Math.random()}`
        const inviteLink = `${window.location.origin}/invite/${invitationId}`

        // Send invitation email
        if (sendWelcomeEmail) {
          const emailResult = await blink.notifications.email({
            to: email,
            subject: 'You\'re invited to join THREAD',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563EB, #1E40AF); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited to THREAD</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                    Join our team collaboration platform
                  </p>
                </div>
                
                <div style="padding: 40px 20px; background: white;">
                  <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                    Hi there! You've been invited to join our team on THREAD as a <strong>${inviteRole}</strong>.
                  </p>
                  
                  ${inviteMessage ? `
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #374151; font-style: italic;">
                        "${inviteMessage}"
                      </p>
                    </div>
                  ` : ''}
                  
                  <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                    THREAD is a unified communication platform that brings together your team's conversations, 
                    projects, and tools in one place. Get ready to streamline your workflow!
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLink}" 
                       style="background: linear-gradient(135deg, #2563EB, #1E40AF); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: bold; 
                              display: inline-block;">
                      Accept Invitation
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #6B7280; text-align: center; margin-top: 30px;">
                    This invitation will expire in 7 days. If you have any questions, 
                    feel free to reach out to the person who invited you.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                  
                  <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 0;">
                    If you can't click the button above, copy and paste this link into your browser:<br>
                    <span style="word-break: break-all;">${inviteLink}</span>
                  </p>
                </div>
              </div>
            `,
            text: `
You're invited to join THREAD!

Hi there! You've been invited to join our team on THREAD as a ${inviteRole}.

${inviteMessage ? `Personal message: "${inviteMessage}"` : ''}

THREAD is a unified communication platform that brings together your team's conversations, projects, and tools in one place.

To accept your invitation, visit: ${inviteLink}

This invitation will expire in 7 days.

If you have any questions, feel free to reach out to the person who invited you.
            `
          })

          console.log('Invitation email sent:', emailResult)
        }

        onInviteMember(invitation)
        
        // Add to local state
        setInvitations(prev => [...prev, { ...invitation, id: invitationId }])
      }

      // Show success message
      setInvitationSent(true)
      setTimeout(() => setInvitationSent(false), 3000)

      // Reset form
      setInviteEmails('')
      setInviteMessage('')
      setInviteToThreads([])
      setShowInviteDialog(false)
      
    } catch (error) {
      console.error('Failed to send invitation emails:', error)
      alert('Failed to send invitation emails. Please try again.')
    }
  }

  const handleCopyInviteLink = (invitationId: string) => {
    const link = `https://thread.ai/invite/${invitationId}`
    navigator.clipboard.writeText(link)
    setCopyInviteLink(true)
    setTimeout(() => setCopyInviteLink(false), 2000)
  }

  const handleResendInvitation = (invitationId: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, invitedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
        : inv
    ))
  }

  const handleCancelInvitation = (invitationId: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId ? { ...inv, status: 'cancelled' as const } : inv
    ))
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.department?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />
      case 'member': return <User className="w-4 h-4 text-green-500" />
      case 'guest': return <User className="w-4 h-4 text-gray-500" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: TeamMember['status'] | Invitation['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'invited':
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'expired': return <XCircle className="w-4 h-4 text-red-500" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />
      case 'inactive': return <AlertCircle className="w-4 h-4 text-gray-500" />
      default: return <User className="w-4 h-4" />
    }
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Success Message */}
      <AnimatePresence>
        {invitationSent && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Invitation(s) sent successfully! Recipients will receive an email with instructions to join.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Team Members</h3>
            <Badge variant="secondary">{members.length} members</Badge>
          </div>
          
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="neural-glow">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite People
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-emails">Email addresses</Label>
                  <Textarea
                    id="invite-emails"
                    placeholder="Enter email addresses separated by commas..."
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple emails with commas
                  </p>
                </div>

                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="invite-message">Personal message (optional)</Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Add a personal welcome message..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="welcome-email"
                    checked={sendWelcomeEmail}
                    onCheckedChange={setSendWelcomeEmail}
                  />
                  <Label htmlFor="welcome-email">Send welcome email</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvitations} disabled={!inviteEmails.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invitations
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="invitations">
                Invitations ({invitations.filter(inv => inv.status === 'pending').length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="members" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.displayName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium truncate">{member.displayName}</p>
                              {getRoleIcon(member.role)}
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                            {member.title && member.department && (
                              <p className="text-sm text-muted-foreground">
                                {member.title} • {member.department}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(member.status)}
                                <span>{member.status}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Last active {formatLastActive(member.lastActive)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{member.threads.length} threads</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Send message</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Video className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Start video call</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {member.id !== 'current_user' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit role
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Manage permissions
                                </DropdownMenuItem>
                                <Separator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex flex-wrap gap-2">
                          {member.permissions.canInvite && (
                            <Badge variant="secondary" className="text-xs">Can invite</Badge>
                          )}
                          {member.permissions.canManageThreads && (
                            <Badge variant="secondary" className="text-xs">Manage threads</Badge>
                          )}
                          {member.permissions.canManageMembers && (
                            <Badge variant="secondary" className="text-xs">Manage members</Badge>
                          )}
                          {member.permissions.canAccessAnalytics && (
                            <Badge variant="secondary" className="text-xs">Analytics</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredMembers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No members found</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="invitations" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {filteredInvitations.map((invitation) => (
                  <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Mail className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium truncate">{invitation.email}</p>
                              {getRoleIcon(invitation.role)}
                              <Badge variant="outline" className="text-xs">
                                {invitation.role}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(invitation.status)}
                                <span>{invitation.status}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Invited {formatLastActive(invitation.invitedAt)}</span>
                              </div>
                              {invitation.status === 'pending' && (
                                <div className="flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Expires {formatLastActive(invitation.expiresAt)}</span>
                                </div>
                              )}
                            </div>
                            {invitation.message && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                "{invitation.message}"
                              </p>
                            )}
                            <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                              <span>Invited by You</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {invitation.status === 'pending' && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleCopyInviteLink(invitation.id)}
                                    >
                                      {copyInviteLink ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy invite link</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleResendInvitation(invitation.id)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Resend
                              </Button>
                            </>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {invitation.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Resend invitation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCopyInviteLink(invitation.id)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy invite link
                                  </DropdownMenuItem>
                                  <Separator />
                                </>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleCancelInvitation(invitation.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel invitation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredInvitations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No invitations found</p>
                    <p className="text-sm mt-2">Invite people to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}