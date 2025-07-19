import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Search, 
  Filter,
  Archive,
  Star,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Inbox,
  Send,
  FileText,
  Clock,
  User,
  Paperclip,
  Flag,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { EmailCard } from './EmailCard';
import { demoEmails, type EmailData } from '../data/demoData';
import { cn } from '../lib/utils';

interface TraditionalEmailViewProps {
  className?: string;
  isDemoMode?: boolean;
}

export function TraditionalEmailView({ className = '', isDemoMode = false }: TraditionalEmailViewProps) {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred' | 'important'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'sender' | 'subject'>('date');
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  // Load emails only when in demo mode
  useEffect(() => {
    if (isDemoMode) {
      setEmails(demoEmails);
    } else {
      setEmails([]);
    }
  }, [isDemoMode]);

  // Show empty state when not in demo mode and no emails
  if (!isDemoMode && emails.length === 0) {
    return (
      <div className={cn("h-full flex bg-background", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No emails yet</h3>
              <p className="text-gray-600 mt-2">
                Connect your email account to start managing your emails with traditional inbox view.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Mail className="w-4 h-4 mr-2" />
              Connect Email Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Filter and sort emails
  const filteredEmails = emails
    .filter(email => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return email.subject.toLowerCase().includes(query) ||
               email.content.toLowerCase().includes(query) ||
               email.senderName?.toLowerCase().includes(query) ||
               email.senderEmail.toLowerCase().includes(query);
      }
      return true;
    })
    .filter(email => {
      // Type filter
      switch (filterType) {
        case 'unread': return !email.isRead;
        case 'starred': return email.isStarred;
        case 'important': return email.priority === 'high' || email.priority === 'urgent';
        default: return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'sender':
          return (a.senderName || '').localeCompare(b.senderName || '');
        case 'subject':
          return a.subject.localeCompare(b.subject);
        case 'date':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  const handleEmailSelect = (email: EmailData) => {
    setSelectedEmail(email);
    // Mark as read
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, isRead: true } : e
    ));
  };

  const handleEmailCheck = (emailId: string, checked: boolean) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(emailId);
      } else {
        newSet.delete(emailId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(new Set(filteredEmails.map(e => e.id)));
    } else {
      setSelectedEmails(new Set());
    }
  };

  const handleBulkAction = (action: 'archive' | 'delete' | 'markRead' | 'markUnread') => {
    setEmails(prev => prev.map(email => {
      if (selectedEmails.has(email.id)) {
        switch (action) {
          case 'markRead':
            return { ...email, isRead: true };
          case 'markUnread':
            return { ...email, isRead: false };
          case 'archive':
            return { ...email, isArchived: true };
          default:
            return email;
        }
      }
      return email;
    }));
    
    if (action === 'delete' || action === 'archive') {
      setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)));
    }
    
    setSelectedEmails(new Set());
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Flag className="w-4 h-4 text-red-500" />;
      case 'high': return <Flag className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <div className={cn("h-full flex bg-background", className)}>
      {/* Email List Sidebar */}
      <div className="w-96 border-r border-border flex flex-col">
        {/* Search and Filters */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <Mail className="w-5 h-5 mr-2 text-primary" />
              Traditional Email
              {isDemoMode && (
                <Badge variant="outline" className="text-xs ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="important">Important</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="sender">Sender</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedEmails.size > 0 && (
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedEmails.size} selected
              </span>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('markRead')}
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Email List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Select All */}
            <div className="flex items-center space-x-2 p-2 mb-2">
              <Checkbox
                checked={selectedEmails.size === filteredEmails.length && filteredEmails.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({filteredEmails.length})
              </span>
            </div>

            {/* Email Items */}
            <div className="space-y-1">
              {filteredEmails.map((email) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                    selectedEmail?.id === email.id ? "bg-primary/10 border border-primary/20" : "",
                    !email.isRead ? "bg-blue-50/50" : ""
                  )}
                  onClick={() => handleEmailSelect(email)}
                >
                  <Checkbox
                    checked={selectedEmails.has(email.id)}
                    onCheckedChange={(checked) => handleEmailCheck(email.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {email.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm truncate",
                        !email.isRead ? "font-semibold" : "font-medium"
                      )}>
                        {email.senderName || email.senderEmail}
                      </span>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {getPriorityIcon(email.priority)}
                        {email.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(email.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className={cn(
                      "text-sm truncate mb-1",
                      !email.isRead ? "font-semibold" : ""
                    )}>
                      {email.subject}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground truncate">
                      {email.content}
                    </p>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      {!email.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                      {email.hasAttachments && (
                        <Paperclip className="w-3 h-3 text-muted-foreground" />
                      )}
                      {email.priority !== 'normal' && (
                        <Badge variant="outline" className="text-xs">
                          {email.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Email Content */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">{selectedEmail.subject}</h1>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {selectedEmail.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{selectedEmail.senderName}</span>
                    <span className="text-sm text-muted-foreground">
                      &lt;{selectedEmail.senderEmail}&gt;
                    </span>
                    {getPriorityIcon(selectedEmail.priority)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>to me</span>
                    <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Star className={cn(
                    "w-4 h-4",
                    selectedEmail.isStarred ? "text-yellow-500 fill-current" : ""
                  )} />
                </Button>
              </div>
            </div>

            {/* Email Body */}
            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">
                  {selectedEmail.content}
                </div>
              </div>
              
              {/* AI Summary */}
              {selectedEmail.aiSummary && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-primary" />
                    AI Summary
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmail.aiSummary}
                  </p>
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Select an Email</h3>
                <p className="text-muted-foreground">
                  Choose an email from the list to read its content
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}