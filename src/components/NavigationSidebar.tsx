import React, { useState } from 'react';
import { 
  Home, 
  MessageCircle, 
  Bell, 
  Layout, 
  MoreHorizontal,
  Plus,
  User,
  Search,
  Brain,
  Calendar,
  FileText,
  Settings,
  Zap,
  Mail,
  Phone,
  Target
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '../lib/utils';

interface NavigationSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationItems = [
  { id: 'ai-insights', icon: Brain, label: 'AI Insights', isHome: true },
  { id: 'dms', icon: MessageCircle, label: 'Inbox' },
  { id: 'email', icon: Mail, label: 'Email' },
  { id: 'calls', icon: Phone, label: 'Calls' },
  { id: 'projects', icon: Target, label: 'Projects' },
  { id: 'people', icon: User, label: 'People' },
  { id: 'activity', icon: Bell, label: 'Activity' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'files', icon: FileText, label: 'Files' },
  { id: 'integrations', icon: Zap, label: 'Integrations' },
];

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed = true,
  onToggleCollapse
}) => {
  // Always keep sidebar collapsed
  const isExpanded = false;

  return (
    <TooltipProvider>
      <div className={cn(
        "h-full bg-[hsl(var(--sidebar-bg))] text-white flex flex-col transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-semibold text-lg">THREAD</span>
              </div>
            )}
            {!isExpanded && (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">T</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            const buttonContent = (
              <Button
                variant="ghost"
                size={isExpanded ? "default" : "icon"}
                className={cn(
                  "w-full justify-start text-white/70 hover:text-white hover:bg-[hsl(var(--sidebar-hover))] transition-colors",
                  isActive && "bg-[hsl(var(--sidebar-active))] text-white hover:bg-[hsl(var(--sidebar-active))]/90",
                  !isExpanded && "justify-center"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className={cn("h-5 w-5", isExpanded && "mr-3")} />
                {isExpanded && <span>{item.label}</span>}
                {item.isHome && isExpanded && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                )}
              </Button>
            );

            if (!isExpanded) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={item.id}>
                {buttonContent}
              </div>
            );
          })}

          {/* More Section */}
          <div className="pt-4 border-t border-white/10 mt-4">
            {isExpanded ? (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-start text-white/70 hover:text-white hover:bg-[hsl(var(--sidebar-hover))]"
                  onClick={() => onViewChange('settings')}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span>Settings</span>
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-start text-white/70 hover:text-white hover:bg-[hsl(var(--sidebar-hover))]"
                >
                  <MoreHorizontal className="h-5 w-5 mr-3" />
                  <span>More</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full justify-center text-white/70 hover:text-white hover:bg-[hsl(var(--sidebar-hover))]"
                      onClick={() => onViewChange('settings')}
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    Settings
                  </TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full justify-center text-white/70 hover:text-white hover:bg-[hsl(var(--sidebar-hover))]"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    More
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-2 border-t border-white/10">
          {/* Add New Button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  "w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-white mb-3",
                  isExpanded ? "mx-auto" : "mx-auto"
                )}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isExpanded ? "top" : "right"} className={!isExpanded ? "ml-2" : ""}>
              New Thread
            </TooltipContent>
          </Tooltip>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-[hsl(var(--sidebar-bg))] rounded-full"></div>
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">You</p>
                <p className="text-xs text-white/60 truncate">Online</p>
              </div>
            )}
          </div>
        </div>


      </div>
    </TooltipProvider>
  );
};

export default NavigationSidebar;