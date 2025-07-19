import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Video, 
  Phone,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bell,
  Repeat,
  X,
  Bot,
  Sparkles
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import type { User } from '../lib/blink'

interface Meeting {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees: string[]
  location?: string
  type: 'video' | 'phone' | 'in-person'
  isRecurring?: boolean
  threadId?: string
  aiSummary?: string
  callAnalysis?: {
    duration: number
    participants: string[]
    keyTopics: string[]
    actionItems: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    transcript?: string
  }
}

interface CalendarProps {
  user: User
  isDemoMode?: boolean
  onCreateMeeting?: (meeting: Omit<Meeting, 'id'>) => void
  onJoinMeeting?: (meetingId: string) => void
}

// Demo meetings data
const demoMeetings: Meeting[] = [
  {
    id: 'meeting_1',
    title: 'Product Strategy Sync',
    description: 'Weekly sync on Q1 roadmap and feature prioritization',
    startTime: '2024-01-19T10:00:00Z',
    endTime: '2024-01-19T11:00:00Z',
    attendees: ['demo_user_1', 'sarah_pm', 'mike_eng'],
    type: 'video',
    isRecurring: true,
    threadId: 'demo_product_team',
    callAnalysis: {
      duration: 58,
      participants: ['Alex Chen', 'Sarah Martinez', 'Mike Johnson'],
      keyTopics: ['Semantic Search', 'Q1 Priorities', 'User Research'],
      actionItems: [
        'Create technical spec for semantic search',
        'Schedule user testing sessions',
        'Review competitive analysis'
      ],
      sentiment: 'positive'
    }
  },
  {
    id: 'meeting_2',
    title: 'Engineering Standup',
    description: 'Daily engineering team sync',
    startTime: '2024-01-19T09:00:00Z',
    endTime: '2024-01-19T09:30:00Z',
    attendees: ['mike_eng', 'david_senior', 'emma_fullstack'],
    type: 'video',
    isRecurring: true,
    threadId: 'demo_engineering'
  },
  {
    id: 'meeting_3',
    title: 'Client Demo - BigCorp',
    description: 'Technical deep-dive and pilot program discussion',
    startTime: '2024-01-19T14:00:00Z',
    endTime: '2024-01-19T15:30:00Z',
    attendees: ['demo_user_1', 'sarah_pm'],
    location: 'Conference Room A',
    type: 'video'
  },
  {
    id: 'meeting_4',
    title: 'Design Thinking Workshop',
    description: 'AI as a design material - exploring neural aesthetics',
    startTime: '2024-01-19T14:00:00Z',
    endTime: '2024-01-19T16:00:00Z',
    attendees: ['lisa_design', 'tom_ui', 'demo_user_1', 'david_senior'],
    location: 'Design Studio',
    type: 'in-person',
    threadId: 'demo_design_system'
  }
]

export function Calendar({ user, isDemoMode = false, onCreateMeeting, onJoinMeeting }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meetings, setMeetings] = useState<Meeting[]>(isDemoMode ? demoMeetings : [])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'video' as const,
    location: ''
  })

  // Get today's meetings
  const todaysMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime)
    const today = new Date()
    return meetingDate.toDateString() === today.toDateString()
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // Get upcoming meetings (next 7 days)
  const upcomingMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return meetingDate >= today && meetingDate <= nextWeek
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

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

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'phone':
        return <Phone className="w-4 h-4" />
      case 'in-person':
        return <MapPin className="w-4 h-4" />
      default:
        return <CalendarIcon className="w-4 h-4" />
    }
  }

  const handleCreateMeeting = () => {
    if (!newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) return

    const meeting: Omit<Meeting, 'id'> = {
      title: newMeeting.title,
      description: newMeeting.description,
      startTime: newMeeting.startTime,
      endTime: newMeeting.endTime,
      attendees: [user.id],
      type: newMeeting.type,
      location: newMeeting.location || undefined
    }

    if (isDemoMode) {
      const newMeetingWithId: Meeting = {
        ...meeting,
        id: `meeting_${Date.now()}`
      }
      setMeetings(prev => [...prev, newMeetingWithId])
    } else {
      onCreateMeeting?.(meeting)
    }

    setShowCreateDialog(false)
    setNewMeeting({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      type: 'video',
      location: ''
    })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Manage your meetings and schedule</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="neural-glow">
                <Plus className="w-4 h-4 mr-2" />
                New Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Meeting title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="datetime-local"
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                  <Input
                    type="datetime-local"
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
                <Select value={newMeeting.type} onValueChange={(value: any) => setNewMeeting(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
                {newMeeting.type === 'in-person' && (
                  <Input
                    placeholder="Location"
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                  />
                )}
                <Button onClick={handleCreateMeeting} className="w-full">
                  Create Meeting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Today's Meetings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Today's Meetings
            </h2>
            {todaysMeetings.length > 0 ? (
              <div className="space-y-3">
                {todaysMeetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getMeetingIcon(meeting.type)}
                              <h3 className="font-medium">{meeting.title}</h3>
                              {meeting.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  <Repeat className="w-3 h-3 mr-1" />
                                  Recurring
                                </Badge>
                              )}
                              {meeting.callAnalysis && (
                                <Badge variant="secondary" className="text-xs neural-glow">
                                  <Bot className="w-3 h-3 mr-1" />
                                  Analyzed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                            </p>
                            {meeting.description && (
                              <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {meeting.attendees.length} attendees
                              </div>
                              {meeting.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {meeting.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onJoinMeeting?.(meeting.id)
                            }}
                            className="neural-glow"
                          >
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No meetings scheduled for today</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Meetings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
              Upcoming Meetings
            </h2>
            {upcomingMeetings.length > 0 ? (
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getMeetingIcon(meeting.type)}
                              <h3 className="font-medium">{meeting.title}</h3>
                              {meeting.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  <Repeat className="w-3 h-3 mr-1" />
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {formatDate(meeting.startTime)} • {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                            </p>
                            {meeting.description && (
                              <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {meeting.attendees.length} attendees
                              </div>
                              {meeting.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {meeting.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No upcoming meetings</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Meeting Details Dialog */}
      <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMeeting && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center space-x-2">
                    {getMeetingIcon(selectedMeeting.type)}
                    <span>{selectedMeeting.title}</span>
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMeeting(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Meeting Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(selectedMeeting.startTime)} • {formatTime(selectedMeeting.startTime)} - {formatTime(selectedMeeting.endTime)}</span>
                  </div>
                  
                  {selectedMeeting.location && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedMeeting.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedMeeting.attendees.length} attendees</span>
                  </div>
                </div>

                {selectedMeeting.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedMeeting.description}</p>
                  </div>
                )}

                {/* Call Analysis */}
                {selectedMeeting.callAnalysis && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">AI Call Analysis</h4>
                      <Badge variant="secondary" className="neural-glow">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Duration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{selectedMeeting.callAnalysis.duration}m</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Sentiment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant={
                            selectedMeeting.callAnalysis.sentiment === 'positive' ? 'default' :
                            selectedMeeting.callAnalysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                          }>
                            {selectedMeeting.callAnalysis.sentiment}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Key Topics</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeeting.callAnalysis.keyTopics.map((topic, index) => (
                          <Badge key={index} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Action Items</h5>
                      <ul className="space-y-1">
                        {selectedMeeting.callAnalysis.actionItems.map((item, index) => (
                          <li key={index} className="text-sm flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedMeeting.threadId && (
                      <div className="pt-4 border-t">
                        <Button variant="outline" className="w-full">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Link to Thread Discussion
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={() => onJoinMeeting?.(selectedMeeting.id)}
                    className="flex-1 neural-glow"
                  >
                    {selectedMeeting.type === 'video' ? <Video className="w-4 h-4 mr-2" /> : 
                     selectedMeeting.type === 'phone' ? <Phone className="w-4 h-4 mr-2" /> : 
                     <MapPin className="w-4 h-4 mr-2" />}
                    Join Meeting
                  </Button>
                  <Button variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Remind Me
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}