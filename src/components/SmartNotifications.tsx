import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  BellRing, 
  X, 
  Mail, 
  MessageCircle, 
  Calendar,
  Sparkles,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { getBlink } from '../lib/blink'
import type { User } from '../lib/blink'
import { demoNotifications, type NotificationData } from '../data/demoData'

interface SmartNotification {
  id: string
  type: 'email' | 'message' | 'mention' | 'ai_insight' | 'consolidated'
  title: string
  content: string
  sourceId?: string
  threadId?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  isRead: boolean
  isConsolidated: boolean
  consolidationGroup?: string
  aiContext?: {
    reasoning: string
    suggestedAction: string
    relatedItems: string[]
  }
  timestamp: string
  children?: SmartNotification[] // For consolidated notifications
}

interface SmartNotificationsProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onNotificationClick: (notification: SmartNotification) => void
  className?: string
}

export function SmartNotifications({ 
  user, 
  isOpen, 
  onClose, 
  onNotificationClick,
  className = '' 
}: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      let notificationRecords: any[] = []
      
      // Get blink client safely
      const blink = await getBlink()
      if (blink?.db?.notifications) {
        try {
          notificationRecords = await blink.db.notifications.list({
            where: { userId: user.id },
            orderBy: { timestamp: 'desc' },
            limit: 50
          })
        } catch (error) {
          console.warn('Database not available, using demo notifications:', error)
          notificationRecords = []
        }
      }
      
      // Use demo data if no database records
      if (notificationRecords.length === 0) {
        const demoTransformed = demoNotifications.map(demo => ({
          id: demo.id,
          type: demo.type,
          title: demo.title,
          content: demo.content,
          source_id: demo.emailId || demo.threadId,
          thread_id: demo.threadId,
          priority: demo.priority,
          is_read: demo.isRead ? 1 : 0,
          is_consolidated: 0,
          consolidation_group: null,
          ai_context: null,
          timestamp: demo.timestamp
        }))
        notificationRecords = demoTransformed
      }

      // Transform notifications directly without circular dependency
      const transformedNotifications = notificationRecords.map(record => ({
        id: record.id,
        type: record.type,
        title: record.title,
        content: record.content,
        sourceId: record.source_id,
        threadId: record.thread_id,
        priority: record.priority,
        isRead: Number(record.is_read) > 0,
        isConsolidated: Number(record.is_consolidated) > 0,
        consolidationGroup: record.consolidation_group,
        aiContext: record.ai_context ? JSON.parse(record.ai_context) : undefined,
        timestamp: record.timestamp
      })).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setNotifications(transformedNotifications)
      
      // Count unread notifications
      const unread = transformedNotifications.filter(n => !n.isRead).length
      setUnreadCount(unread)

    } catch (error) {
      console.error('Error loading notifications:', error)
      // Fallback to demo data on any error
      const demoTransformed = demoNotifications.map(demo => ({
        id: demo.id,
        type: demo.type,
        title: demo.title,
        content: demo.content,
        sourceId: demo.emailId || demo.threadId,
        threadId: demo.threadId,
        priority: demo.priority,
        isRead: demo.isRead,
        isConsolidated: false,
        consolidationGroup: null,
        aiContext: null,
        timestamp: demo.timestamp
      }))
      setNotifications(demoTransformed)
      setUnreadCount(demoTransformed.filter(n => !n.isRead).length)
    } finally {
      setIsLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen, loadNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const blink = await getBlink()
      if (!blink?.db?.notifications) {
        console.warn('Blink database not available for marking as read')
        return
      }
      
      await blink.db.notifications.update(notificationId, {
        isRead: 1,
        updatedAt: new Date().toISOString()
      })

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ))
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const blink = await getBlink()
      if (!blink?.db?.notifications) {
        console.warn('Blink database not available for marking all as read')
        return
      }
      
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
      
      for (const id of unreadIds) {
        await blink.db.notifications.update(id, {
          isRead: 1,
          updatedAt: new Date().toISOString()
        })
      }

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'message': return <MessageCircle className="w-4 h-4" />
      case 'mention': return <Bell className="w-4 h-4" />
      case 'ai_insight': return <Brain className="w-4 h-4" />
      case 'consolidated': return <Sparkles className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 border-red-500/20 bg-red-500/5'
      case 'high': return 'text-orange-500 border-orange-500/20 bg-orange-500/5'
      case 'low': return 'text-blue-500 border-blue-500/20 bg-blue-500/5'
      default: return 'text-muted-foreground border-border bg-card'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed right-4 top-16 w-96 max-h-[80vh] bg-card border border-border rounded-lg shadow-2xl z-50 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Smart Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7 px-2"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-[60vh]">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        !notification.isRead ? 'ring-2 ring-primary/20' : ''
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => {
                        onNotificationClick(notification)
                        if (!notification.isRead) {
                          markAsRead(notification.id)
                        }
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          {/* Notification icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Notification content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`text-sm font-medium truncate ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {notification.content}
                            </p>

                            {/* AI Context */}
                            {notification.aiContext && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Sparkles className="w-3 h-3 text-primary" />
                                <span className="text-xs text-primary">
                                  {notification.aiContext.suggestedAction}
                                </span>
                              </div>
                            )}

                            {/* Consolidated children count */}
                            {notification.children && notification.children.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  +{notification.children.length} more
                                </Badge>
                              </div>
                            )}

                            {/* Priority indicator */}
                            {notification.priority !== 'normal' && (
                              <div className="flex items-center space-x-1 mt-1">
                                {notification.priority === 'urgent' && (
                                  <AlertCircle className="w-3 h-3 text-red-500" />
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Read indicator */}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{notifications.length} total notifications</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                // Open full notifications view
                console.log('Open full notifications view')
              }}
            >
              View all
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}