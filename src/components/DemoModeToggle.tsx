import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Sparkles, Users, ArrowDown } from 'lucide-react'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface DemoModeToggleProps {
  isDemoMode: boolean
  onToggle: (enabled: boolean) => void
}

export function DemoModeToggle({ isDemoMode, onToggle }: DemoModeToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Show hint for new users after a delay
  useEffect(() => {
    if (!isDemoMode) {
      const timer = setTimeout(() => {
        setShowHint(true)
      }, 3000) // Show hint after 3 seconds

      const hideTimer = setTimeout(() => {
        setShowHint(false)
      }, 8000) // Hide hint after 8 seconds

      return () => {
        clearTimeout(timer)
        clearTimeout(hideTimer)
      }
    }
  }, [isDemoMode])

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isDemoMode ? [1, 1.05, 1] : 1
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: isDemoMode ? Infinity : 0,
            repeatType: "reverse"
          }
        }}
        className={`bg-card/95 backdrop-blur-sm border rounded-lg shadow-lg ${
          isDemoMode 
            ? 'border-primary/50 shadow-primary/20' 
            : !isExpanded 
              ? 'border-border hover:border-primary/30 transition-colors' 
              : 'border-border'
        }`}
      >
        {/* Collapsed State */}
        {!isExpanded && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="h-10 w-10 p-0"
                >
                  {isDemoMode ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDemoMode ? 'Demo Mode Active' : 'Enable Demo Mode'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <motion.div
            initial={{ width: 40, opacity: 0.8 }}
            animate={{ width: 'auto', opacity: 1 }}
            className="p-3 space-y-3"
          >
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {isDemoMode ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Demo Mode</span>
                </div>
                {isDemoMode && (
                  <Badge variant="secondary" className="text-xs neural-glow">
                    <Sparkles className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                checked={isDemoMode}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-primary"
              />
              <div className="text-xs text-muted-foreground">
                {isDemoMode ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>Rich demo data active</span>
                    </div>
                    <div className="text-primary font-medium">
                      Perfect for prospect demos!
                    </div>
                  </div>
                ) : (
                  <div>
                    Show realistic demo data
                    <br />
                    <span className="text-primary">Great for presentations</span>
                  </div>
                )}
              </div>
            </div>

            {isDemoMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2 border-t border-border"
              >
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-medium text-foreground">Demo includes:</div>
                  <div>• AI-powered email conversations</div>
                  <div>• Project management with tasks</div>
                  <div>• Team collaboration & messaging</div>
                  <div>• Connected integrations (Jira, Figma, etc.)</div>
                  <div>• Smart notifications & insights</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Onboarding Hint */}
      <AnimatePresence>
        {showHint && !isDemoMode && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-12 right-0 bg-primary text-primary-foreground rounded-lg p-3 shadow-lg max-w-xs"
          >
            <div className="flex items-start space-x-2">
              <ArrowDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium mb-1">Try Demo Mode!</div>
                <div className="text-xs opacity-90">
                  See THREAD in action with sample data and AI features
                </div>
              </div>
            </div>
            <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-primary"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}