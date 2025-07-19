import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Video, 
  Phone, 
  Clock, 
  Users, 
  Plus,
  MapPin,
  Link,
  Mic,
  MicOff,
  VideoOff,
  PhoneCall,
  PhoneOff,
  Settings,
  Share,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Bell,
  Repeat,
  User
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
import { Calendar } from './ui/calendar'
import { demoUsers } from '../data/demoData'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees: string[]
  location?: string
  meetingLink?: string
  type: 'meeting' | 'call' | 'event'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  threadId?: string
  isRecurring?: boolean
  recurrenceRule?: string
}

interface CallSession {
  id: string
  title: string
  participants: string[]
  startTime: string
  duration: number
  status: 'scheduled' | 'ongoing' | 'ended'
  type: 'video' | 'audio'
  meetingLink: string
  recordingUrl?: string
  transcript?: string
  summary?: string
  threadId?: string
}

interface CalendarCallIntegrationProps {
  threadId?: string
  onScheduleMeeting: (event: Omit<CalendarEvent, 'id'>) => void
  onStartCall: (callData: Omit<CallSession, 'id'>) => void
  className?: string
}

export function CalendarCallIntegration({
  threadId,
  onScheduleMeeting,
  onStartCall,
  className = ''
}: CalendarCallIntegrationProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [activeCalls, setActiveCalls] = useState<CallSession[]>([])
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [currentView, setCurrentView] = useState<'calendar' | 'calls' | 'upcoming'>('upcoming')
  
  // Form states
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventDate, setEventDate] = useState<Date>(new Date())
  const [eventTime, setEventTime] = useState('09:00')
  const [eventDuration, setEventDuration] = useState('60')
  const [eventAttendees, setEventAttendees] = useState<string[]>([])
  const [eventLocation, setEventLocation] = useState('')
  const [eventType, setEventType] = useState<'meeting' | 'call' | 'event'>('meeting')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState('weekly')

  // Demo data
  useEffect(() => {
    const demoEvents: CalendarEvent[] = [
      {
        id: 'event_1',
        title: 'Product Strategy Review',
        description: 'Quarterly review of product roadmap and priorities',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        attendees: ['demo_user_1', 'sarah_pm', 'mike_eng'],
        location: 'Conference Room A',
        meetingLink: 'https://meet.thread.ai/product-strategy-review',
        type: 'meeting',
        status: 'scheduled',
        threadId: 'demo_product_team'
      },
      {
        id: 'event_2',
        title: 'Engineering Standup',
        description: 'Daily engineering team sync',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        attendees: ['mike_eng', 'david_senior', 'emma_fullstack'],
        meetingLink: 'https://meet.thread.ai/eng-standup',
        type: 'meeting',
        status: 'scheduled',
        threadId: 'demo_engineering',
        isRecurring: true,
        recurrenceRule: 'DAILY'
      },
      {
        id: 'event_3',
        title: 'Client Demo Call',
        description: 'Demo Thread platform to BigCorp client',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        attendees: ['demo_user_1', 'sarah_pm'],
        meetingLink: 'https://meet.thread.ai/client-demo',
        type: 'call',
        status: 'scheduled'
      }
    ]

    const demoCalls: CallSession[] = [
      {
        id: 'call_1',
        title: 'Design Review Session',
        participants: ['demo_user_1', 'lisa_design', 'tom_ui'],
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 min ago
        duration: 45,
        status: 'ongoing',
        type: 'video',
        meetingLink: 'https://meet.thread.ai/design-review',
        threadId: 'demo_design_system'
      }
    ]

    setEvents(demoEvents)
    setActiveCalls(demoCalls)
  }, [])

  const handleScheduleEvent = () => {
    if (!eventTitle.trim()) return

    const startDateTime = new Date(eventDate)
    const [hours, minutes] = eventTime.split(':').map(Number)
    startDateTime.setHours(hours, minutes, 0, 0)
    
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(eventDuration))

    const newEvent: Omit<CalendarEvent, 'id'> = {
      title: eventTitle,
      description: eventDescription,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      attendees: eventAttendees,
      location: eventLocation,
      meetingLink: `https://meet.thread.ai/${eventTitle.toLowerCase().replace(/\s+/g, '-')}`,
      type: eventType,
      status: 'scheduled',
      threadId,
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceType.toUpperCase() : undefined
    }

    onScheduleMeeting(newEvent)
    
    // Add to local state for demo
    setEvents(prev => [...prev, { ...newEvent, id: `event_${Date.now()}` }])
    
    // Reset form
    setEventTitle('')
    setEventDescription('')
    setEventDate(new Date())
    setEventTime('09:00')
    setEventDuration('60')
    setEventAttendees([])
    setEventLocation('')
    setIsRecurring(false)
    setShowScheduleDialog(false)
  }

  const handleStartCall = (type: 'video' | 'audio') => {
    const callData: Omit<CallSession, 'id'> = {
      title: `${type === 'video' ? 'Video' : 'Audio'} Call`,
      participants: threadId ? ['demo_user_1'] : ['demo_user_1'],
      startTime: new Date().toISOString(),
      duration: 0,
      status: 'ongoing',
      type,
      meetingLink: `https://meet.thread.ai/instant-${type}-${Date.now()}`,
      threadId
    }

    onStartCall(callData)
    
    // Add to local state for demo
    setActiveCalls(prev => [...prev, { ...callData, id: `call_${Date.now()}` }])
    setShowCallDialog(false)
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(event => new Date(event.startTime) > now && event.status === 'scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5)
  }

  const getTodayEvents = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= today && eventDate < tomorrow
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />
      case 'meeting': return <Video className="w-4 h-4" />
      default: return <CalendarIcon className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500'
      case 'scheduled': return 'bg-blue-500'
      case 'completed': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Calendar & Calls</h3>
            {activeCalls.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {activeCalls.length} active call{activeCalls.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Quick Call
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Instant Call</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Start an instant call and invite participants
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleStartCall('video')}
                      className="flex-1"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Video Call
                    </Button>
                    <Button 
                      onClick={() => handleStartCall('audio')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Audio Call
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="neural-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Title</Label>
                    <Input
                      id="event-title"
                      placeholder="Meeting title..."
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Meeting description..."
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Date</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventDate.toISOString().split('T')[0]}
                        onChange={(e) => setEventDate(new Date(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-time">Time</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-duration">Duration (min)</Label>
                      <Select value={eventDuration} onValueChange={setEventDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="event-type">Type</Label>
                      <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="event-location">Location (optional)</Label>
                    <Input
                      id="event-location"
                      placeholder="Conference room or address..."
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                    />
                    <Label htmlFor="recurring">Recurring meeting</Label>
                  </div>

                  {isRecurring && (
                    <div>
                      <Label htmlFor="recurrence">Repeat</Label>
                      <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleEvent} disabled={!eventTitle.trim()}>
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={currentView === 'upcoming' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('upcoming')}
            className="flex-1"
          >
            Upcoming
          </Button>
          <Button
            variant={currentView === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('calendar')}
            className="flex-1"
          >
            Calendar
          </Button>
          <Button
            variant={currentView === 'calls' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('calls')}
            className="flex-1"
          >
            Calls
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {currentView === 'upcoming' && (
            <div className="space-y-4">
              {/* Active Calls */}
              {activeCalls.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                    Active Calls
                  </h4>
                  <div className="space-y-2">
                    {activeCalls.map((call) => (
                      <Card key={call.id} className="border-green-200 bg-green-50 dark:bg-green-950">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                                {call.type === 'video' ? (
                                  <Video className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Phone className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{call.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Started {formatTime(call.startTime)} • {call.participants.length} participants
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Join
                              </Button>
                              <Button size="sm" variant="ghost">
                                <PhoneOff className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              <div>
                <h4 className="font-medium mb-3">Upcoming Events</h4>
                <div className="space-y-3">
                  {getUpcomingEvents().map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium truncate">{event.title}</p>
                                {event.isRecurring && (
                                  <Repeat className="w-3 h-3 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(event.startTime)} at {formatTime(event.startTime)}</span>
                                </div>
                                {event.attendees.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3" />
                                    <span>{event.attendees.length} attendees</span>
                                  </div>
                                )}
                              </div>
                              {event.location && (
                                <div className="flex items-center space-x-1 mt-1 text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Attendees */}
                        {event.attendees.length > 0 && (
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="flex -space-x-2">
                              {event.attendees.slice(0, 4).map((attendeeId) => {
                                const attendee = demoUsers[attendeeId]
                                return (
                                  <Avatar key={attendeeId} className="w-6 h-6 border-2 border-background">
                                    <AvatarImage src={attendee?.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {attendee?.displayName?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                )
                              })}
                              {event.attendees.length > 4 && (
                                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-xs">+{event.attendees.length - 4}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {event.meetingLink && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy meeting link</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <Button size="sm" variant="outline">
                                <Link className="w-4 h-4 mr-2" />
                                Join
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {getUpcomingEvents().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming events</p>
                      <p className="text-sm mt-2">Schedule a meeting to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentView === 'calendar' && (
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
              
              <div>
                <h4 className="font-medium mb-3">
                  Events for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <div className="space-y-2">
                  {getTodayEvents().map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getEventIcon(event.type)}
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'calls' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Recent Calls</h4>
                <div className="space-y-3">
                  {activeCalls.concat([
                    {
                      id: 'call_demo_1',
                      title: 'Team Standup',
                      participants: ['demo_user_1', 'sarah_pm', 'mike_eng'],
                      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                      duration: 25,
                      status: 'ended' as const,
                      type: 'video' as const,
                      meetingLink: 'https://meet.thread.ai/team-standup',
                      recordingUrl: 'https://recordings.thread.ai/team-standup-recording',
                      transcript: 'Meeting transcript available',
                      summary: 'Discussed Q1 priorities and sprint planning',
                      threadId: 'demo_product_team'
                    }
                  ]).map((call) => (
                    <Card key={call.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${
                              call.status === 'ongoing' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-900'
                            }`}>
                              {call.type === 'video' ? (
                                <Video className={`w-4 h-4 ${
                                  call.status === 'ongoing' ? 'text-green-600' : 'text-gray-600'
                                }`} />
                              ) : (
                                <Phone className={`w-4 h-4 ${
                                  call.status === 'ongoing' ? 'text-green-600' : 'text-gray-600'
                                }`} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{call.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(call.startTime)} at {formatTime(call.startTime)}
                                {call.status === 'ended' && ` • ${call.duration} min`}
                              </p>
                              {call.summary && (
                                <p className="text-sm text-muted-foreground mt-1">{call.summary}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={call.status === 'ongoing' ? 'default' : 'secondary'}>
                              {call.status}
                            </Badge>
                            {call.recordingUrl && (
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}