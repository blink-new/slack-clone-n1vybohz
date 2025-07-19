import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Video, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed,
  Search, 
  Plus,
  Clock,
  User,
  Users,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Volume2,
  Settings,
  Calendar,
  MessageCircle,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { demoUsers } from '../data/demoData';
import { cn } from '../lib/utils';

interface CallRecord {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'audio' | 'video';
  participantId: string;
  participantName: string;
  participantEmail: string;
  duration?: number; // in seconds
  timestamp: string;
  isGroup?: boolean;
  groupName?: string;
  participants?: string[];
}

interface CallsViewProps {
  isDemoMode?: boolean;
}

const demoCallRecords: CallRecord[] = [
  {
    id: 'call_1',
    type: 'incoming',
    callType: 'video',
    participantId: 'sarah_pm',
    participantName: 'Sarah Martinez',
    participantEmail: 'sarah@thread.ai',
    duration: 1847, // 30:47
    timestamp: '2024-01-18T14:30:00Z'
  },
  {
    id: 'call_2',
    type: 'outgoing',
    callType: 'audio',
    participantId: 'mike_eng',
    participantName: 'Mike Johnson',
    participantEmail: 'mike@thread.ai',
    duration: 623, // 10:23
    timestamp: '2024-01-18T11:15:00Z'
  },
  {
    id: 'call_3',
    type: 'missed',
    callType: 'video',
    participantId: 'lisa_design',
    participantName: 'Lisa Wang',
    participantEmail: 'lisa@thread.ai',
    timestamp: '2024-01-18T09:45:00Z'
  },
  {
    id: 'call_4',
    type: 'incoming',
    callType: 'video',
    participantId: 'group_product',
    participantName: 'Product Team',
    participantEmail: 'product@thread.ai',
    duration: 2734, // 45:34
    timestamp: '2024-01-17T16:00:00Z',
    isGroup: true,
    groupName: 'Product Team Sync',
    participants: ['sarah_pm', 'demo_user_1', 'lisa_design']
  },
  {
    id: 'call_5',
    type: 'outgoing',
    callType: 'audio',
    participantId: 'david_senior',
    participantName: 'David Rodriguez',
    participantEmail: 'david@thread.ai',
    duration: 456, // 7:36
    timestamp: '2024-01-17T13:20:00Z'
  }
];

export function CallsView({ isDemoMode = false }: CallsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const [showNewCall, setShowNewCall] = useState(false);
  const [newCallData, setNewCallData] = useState({
    participant: '',
    type: 'audio' as 'audio' | 'video'
  });
  const [callState, setCallState] = useState({
    isMuted: false,
    isVideoOff: false,
    isConnected: false,
    duration: 0
  });

  // Use demo data only when in demo mode, otherwise empty
  const callRecords = isDemoMode ? demoCallRecords : [];
  const filteredCalls = callRecords.filter(call =>
    call.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.participantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (call.groupName && call.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: CallRecord) => {
    if (call.type === 'missed') return PhoneMissed;
    if (call.type === 'incoming') return PhoneIncoming;
    return PhoneOutgoing;
  };

  const getCallTypeColor = (call: CallRecord) => {
    if (call.type === 'missed') return 'text-red-500';
    if (call.type === 'incoming') return 'text-green-500';
    return 'text-blue-500';
  };

  const handleStartCall = (call: CallRecord) => {
    setActiveCall(call);
    setCallState({
      isMuted: false,
      isVideoOff: call.callType === 'audio',
      isConnected: true,
      duration: 0
    });
    
    // Simulate call duration counter
    const interval = setInterval(() => {
      setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);

    // Auto-end call after demo
    setTimeout(() => {
      clearInterval(interval);
      handleEndCall();
    }, 10000); // End after 10 seconds for demo
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setCallState({
      isMuted: false,
      isVideoOff: false,
      isConnected: false,
      duration: 0
    });
  };

  const handleNewCall = () => {
    if (!newCallData.participant) return;
    
    const newCall: CallRecord = {
      id: `call_${Date.now()}`,
      type: 'outgoing',
      callType: newCallData.type,
      participantId: 'new_contact',
      participantName: newCallData.participant,
      participantEmail: `${newCallData.participant.toLowerCase().replace(' ', '.')}@example.com`,
      timestamp: new Date().toISOString()
    };

    handleStartCall(newCall);
    setShowNewCall(false);
    setNewCallData({ participant: '', type: 'audio' });
  };

  return (
    <div className="h-full flex bg-background">
      {/* Calls List Sidebar */}
      <div className="w-96 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Phone className="w-6 h-6 mr-2 text-primary" />
              Calls
              {isDemoMode && (
                <Badge variant="outline" className="text-xs ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </h1>
            <Dialog open={showNewCall} onOpenChange={setShowNewCall}>
              <DialogTrigger asChild>
                <Button className="neural-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  New Call
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Call</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="participant">Contact Name or Email</Label>
                    <Input
                      id="participant"
                      placeholder="Enter name or email..."
                      value={newCallData.participant}
                      onChange={(e) => setNewCallData(prev => ({ ...prev, participant: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Call Type</Label>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant={newCallData.type === 'audio' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewCallData(prev => ({ ...prev, type: 'audio' }))}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Audio
                      </Button>
                      <Button
                        variant={newCallData.type === 'video' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewCallData(prev => ({ ...prev, type: 'video' }))}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Video
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowNewCall(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleNewCall} disabled={!newCallData.participant.trim()}>
                      Start Call
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Call History */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredCalls.length === 0 && !isDemoMode ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No call history</h3>
                <p className="text-xs text-gray-500 mb-4">Your call history will appear here</p>
                <Button size="sm" onClick={() => setShowNewCall(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Make First Call
                </Button>
              </div>
            ) : (
              filteredCalls.map((call) => {
                const CallIcon = getCallIcon(call);
                const participant = demoUsers[call.participantId];
                
                return (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 mb-2 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={participant?.avatar} />
                          <AvatarFallback>
                            {call.isGroup ? (
                              <Users className="w-6 h-6" />
                            ) : (
                              call.participantName.split(' ').map(n => n[0]).join('')
                            )}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Call Type Indicator */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border-2 border-background">
                          {call.callType === 'video' ? (
                            <Video className="w-3 h-3 text-primary" />
                          ) : (
                            <Phone className="w-3 h-3 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">
                            {call.isGroup ? call.groupName : call.participantName}
                          </p>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleStartCall({ ...call, callType: 'audio' })}
                                  >
                                    <Phone className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Audio Call</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleStartCall({ ...call, callType: 'video' })}
                                  >
                                    <Video className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Video Call</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <CallIcon className={cn("w-3 h-3", getCallTypeColor(call))} />
                          <span>{new Date(call.timestamp).toLocaleDateString()}</span>
                          <span>{new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {call.duration && (
                            <>
                              <span>•</span>
                              <span>{formatDuration(call.duration)}</span>
                            </>
                          )}
                        </div>
                        
                        {call.isGroup && call.participants && (
                          <div className="flex -space-x-1 mt-2">
                            {call.participants.slice(0, 3).map((participantId) => {
                              const p = demoUsers[participantId];
                              return (
                                <Avatar key={participantId} className="w-5 h-5 border border-background">
                                  <AvatarImage src={p?.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {p?.displayName?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                            {call.participants.length > 3 && (
                              <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
                                <span className="text-xs">+{call.participants.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {activeCall ? (
          /* Active Call Interface */
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 relative">
            {/* Call Info */}
            <div className="text-center mb-8">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={demoUsers[activeCall.participantId]?.avatar} />
                <AvatarFallback className="text-2xl">
                  {activeCall.isGroup ? (
                    <Users className="w-16 h-16" />
                  ) : (
                    activeCall.participantName.split(' ').map(n => n[0]).join('')
                  )}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-semibold mb-2">
                {activeCall.isGroup ? activeCall.groupName : activeCall.participantName}
              </h2>
              
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                {activeCall.callType === 'video' ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                <span>
                  {callState.isConnected ? formatDuration(callState.duration) : 'Connecting...'}
                </span>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={callState.isMuted ? "destructive" : "secondary"}
                      size="lg"
                      className="w-14 h-14 rounded-full"
                      onClick={() => setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
                    >
                      {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{callState.isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {activeCall.callType === 'video' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={callState.isVideoOff ? "destructive" : "secondary"}
                        size="lg"
                        className="w-14 h-14 rounded-full"
                        onClick={() => setCallState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }))}
                      >
                        {callState.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{callState.isVideoOff ? 'Turn on camera' : 'Turn off camera'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-14 h-14 rounded-full"
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Speaker</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-14 h-14 rounded-full"
                      onClick={handleEndCall}
                    >
                      <PhoneOff className="w-6 h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>End Call</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Additional Actions */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* No Active Call */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No active calls</h3>
                <p className="text-muted-foreground">Start a new call or select from your call history</p>
              </div>
              <Button onClick={() => setShowNewCall(true)} className="neural-glow">
                <Plus className="w-4 h-4 mr-2" />
                Start New Call
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}