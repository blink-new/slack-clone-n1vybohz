import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Sparkles,
  Brain
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface VoiceControlProps {
  onCommand: (command: string, intent: string, parameters: any) => void
  isEnabled: boolean
  onToggle: () => void
}

export function VoiceControl({ onCommand, isEnabled, onToggle }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  
  // Refs for cleanup
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Process voice command with simple pattern matching
  const processVoiceCommand = useCallback(async (command: string) => {
    setIsProcessing(true)
    setLastCommand(command)

    try {
      let intent = 'unknown'
      const parameters: any = {}

      // Simple command parsing
      const lowerCommand = command.toLowerCase()
      
      if (lowerCommand.includes('reply') && lowerCommand.includes('email')) {
        intent = 'reply_email'
        parameters.content = command
      } else if (lowerCommand.includes('create') && lowerCommand.includes('thread')) {
        intent = 'create_thread'
        parameters.threadName = command.replace(/create|thread/gi, '').trim() || 'New Thread'
      } else if (lowerCommand.includes('send') && lowerCommand.includes('message')) {
        intent = 'send_message'
        parameters.content = command.replace(/send message/gi, '').trim()
      } else if (lowerCommand.includes('search')) {
        intent = 'search_messages'
        parameters.searchQuery = command.replace(/search/gi, '').trim()
      } else if (lowerCommand.includes('schedule') && lowerCommand.includes('meeting')) {
        intent = 'schedule_meeting'
        parameters.meetingTitle = command
      } else {
        // Default to sending as message
        intent = 'send_message'
        parameters.content = command
      }

      // Execute the command
      onCommand(command, intent, parameters)

    } catch (error) {
      console.error('Error processing voice command:', error)
    } finally {
      setIsProcessing(false)
      // Clear after 3 seconds
      setTimeout(() => {
        setTranscript('')
        setLastCommand(null)
      }, 3000)
    }
  }, [onCommand])

  // Audio visualization
  const initAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Clean up existing context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close()
      }
      
      // Create new audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      
      // Resume context if suspended (required for user interaction)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }
      
      analyserRef.current = audioContextRef.current.createAnalyser()
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening && audioContextRef.current?.state === 'running') {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average / 255)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      
      updateAudioLevel()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setAudioLevel(0)
    }
  }, [isListening])

  // Initialize speech recognition
  useEffect(() => {
    if (!isEnabled) return

    let mounted = true
    let recognition: SpeechRecognition | null = null

    const initSpeechRecognition = () => {
      try {
        if (!mounted) return
        
        // Check for speech recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
          console.warn('Speech recognition not supported')
          return
        }

        recognition = new SpeechRecognition()
        recognitionRef.current = recognition
    
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          if (!mounted) return
          setIsListening(true)
          initAudioVisualization().catch(console.error)
        }

        recognition.onresult = (event) => {
          if (!mounted) return
          
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
              setConfidence(event.results[i][0].confidence || 0)
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript || interimTranscript)

          if (finalTranscript.trim()) {
            processVoiceCommand(finalTranscript.trim()).catch(console.error)
          }
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          if (mounted) {
            setIsListening(false)
            setIsProcessing(false)
          }
        }

        recognition.onend = () => {
          if (mounted) {
            setIsListening(false)
            setAudioLevel(0)
          }
          // Clean up audio context
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error)
          }
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
          }
        }
      } catch (error) {
        console.error('Error initializing speech recognition:', error)
      }
    }

    // Initialize with delay to avoid race conditions
    const timeoutId = setTimeout(() => {
      if (mounted) {
        initSpeechRecognition()
      }
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      
      // Clean up recognition
      if (recognition) {
        try {
          recognition.stop()
        } catch (error) {
          console.warn('Error stopping speech recognition:', error)
        }
      }
      
      // Clean up audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close()
        } catch (error) {
          console.warn('Error closing audio context:', error)
        }
      }
      
      // Clean up animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isEnabled, initAudioVisualization, processVoiceCommand])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    try {
      if (isListening) {
        recognitionRef.current.stop()
        setIsListening(false)
        // Clean up audio context
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error)
          audioContextRef.current = null
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      } else {
        recognitionRef.current.start()
      }
    } catch (error) {
      console.error('Error toggling speech recognition:', error)
      setIsListening(false)
    }
  }

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <TooltipProvider>
        <div className="flex flex-col items-end space-y-3">
          {/* Voice Command Status */}
          <AnimatePresence>
            {(transcript || lastCommand || isProcessing) && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="max-w-sm"
              >
                <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {isProcessing ? (
                          <Brain className="w-5 h-5 text-primary animate-pulse" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isProcessing ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Processing command...</p>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        ) : transcript ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Listening...</p>
                            <p className="text-sm text-muted-foreground">{transcript}</p>
                            {confidence > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(confidence * 100)}% confident
                              </Badge>
                            )}
                          </div>
                        ) : lastCommand ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-green-500">Command executed!</p>
                            <p className="text-sm text-muted-foreground">{lastCommand}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Control Toggle */}
          <div className="flex items-center space-x-2">
            {/* Always-on listening indicator */}
            {isEnabled && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2"
              >
                <Badge variant="secondary" className="neural-glow">
                  <Volume2 className="w-3 h-3 mr-1" />
                  Always Listening
                </Badge>
              </motion.div>
            )}

            {/* Main voice control button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className={`relative w-14 h-14 rounded-full shadow-lg border-2 transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 border-red-300 scale-110 shadow-red-200' 
                      : isEnabled 
                        ? 'bg-primary hover:bg-primary/90 border-primary/30 shadow-primary/20' 
                        : 'bg-slate-600 hover:bg-slate-700 border-slate-400 shadow-slate-200'
                  }`}
                  onClick={isEnabled ? toggleListening : onToggle}
                >
                  {/* Audio level visualization */}
                  {isListening && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-white/30"
                      animate={{
                        scale: 1 + audioLevel * 0.3,
                        opacity: 0.7 + audioLevel * 0.3
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  )}
                  
                  {isListening ? (
                    <MicOff className="w-6 h-6" />
                  ) : isEnabled ? (
                    <Mic className="w-6 h-6" />
                  ) : (
                    <VolumeX className="w-6 h-6" />
                  )}
                  
                  {/* Processing indicator */}
                  {isProcessing && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>
                  {isListening 
                    ? 'Stop listening' 
                    : isEnabled 
                      ? 'Start voice command' 
                      : 'Enable voice control'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Voice commands help */}
          {isEnabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground text-right max-w-xs"
            >
              <p>Try: "Reply to Sarah's email", "Schedule meeting with John", "Create new thread"</p>
            </motion.div>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}

// Extend Window interface for speech recognition and audio context
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    AudioContext: any
    webkitAudioContext: any
  }
}