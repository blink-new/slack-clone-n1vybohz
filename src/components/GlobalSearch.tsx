import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  MessageSquare, 
  Users, 
  FileText, 
  Mail, 
  Brain,
  Hash,
  Clock,
  Star,
  X
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface SearchResult {
  id: string
  type: 'thread' | 'message' | 'person' | 'file' | 'email' | 'ai_insight'
  title: string
  content: string
  timestamp?: string
  relevance: number
  metadata?: any
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onResult?: (result: SearchResult) => void
}

export function GlobalSearch({ isOpen, onClose, onResult }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Demo search results
    const demoResults: SearchResult[] = [
      {
        id: '1',
        type: 'thread',
        title: 'Marketing Campaign Q4',
        content: 'Discussion about the upcoming Q4 marketing initiatives and budget allocation',
        timestamp: '2 hours ago',
        relevance: 0.95
      },
      {
        id: '2',
        type: 'message',
        title: 'Sarah Johnson',
        content: 'Can we schedule a meeting to discuss the project timeline?',
        timestamp: '1 day ago',
        relevance: 0.87
      },
      {
        id: '3',
        type: 'email',
        title: 'Client Proposal Review',
        content: 'Please review the attached proposal and provide feedback by Friday',
        timestamp: '3 days ago',
        relevance: 0.82
      },
      {
        id: '4',
        type: 'person',
        title: 'Alex Chen',
        content: 'Product Manager • Available • Last seen 5 minutes ago',
        timestamp: 'Online',
        relevance: 0.78
      },
      {
        id: '5',
        type: 'file',
        title: 'Q4_Budget_Analysis.xlsx',
        content: 'Financial analysis and projections for Q4 2024',
        timestamp: '1 week ago',
        relevance: 0.75
      },
      {
        id: '6',
        type: 'ai_insight',
        title: 'AI Insight: Forgotten Thread',
        content: 'You have an unresolved discussion about the mobile app redesign from 2 weeks ago',
        timestamp: '2 weeks ago',
        relevance: 0.70
      }
    ]
    
    // Filter demo results based on query
    const filteredResults = demoResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.content.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.relevance - a.relevance)
    
    setResults(filteredResults)
    setSelectedIndex(0)
    setIsSearching(false)
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  const handleResultClick = useCallback((result: SearchResult) => {
    onResult?.(result)
    onClose()
    setQuery('')
    setResults([])
  }, [onResult, onClose])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose, handleResultClick])

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'thread':
        return <Hash className="w-4 h-4" />
      case 'message':
        return <MessageSquare className="w-4 h-4" />
      case 'person':
        return <Users className="w-4 h-4" />
      case 'file':
        return <FileText className="w-4 h-4" />
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'ai_insight':
        return <Brain className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getResultTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'thread':
        return 'bg-blue-500/10 text-blue-500'
      case 'message':
        return 'bg-green-500/10 text-green-500'
      case 'person':
        return 'bg-purple-500/10 text-purple-500'
      case 'file':
        return 'bg-orange-500/10 text-orange-500'
      case 'email':
        return 'bg-red-500/10 text-red-500'
      case 'ai_insight':
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-muted/10 text-muted-foreground'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Global Search</span>
            <Badge variant="secondary" className="ml-auto">
              ⌘K
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads, messages, people, files..."
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => {
                  setQuery('')
                  setResults([])
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className="mt-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {isSearching ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                </motion.div>
              ) : results.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                          index === selectedIndex ? 'bg-muted/50 ring-2 ring-primary/50' : ''
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getResultTypeColor(result.type)}`}>
                              {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium truncate">{result.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {result.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {result.content}
                              </p>
                              {result.timestamp && (
                                <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{result.timestamp}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(result.relevance * 100)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : query && !isSearching ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-1">Try different keywords or check spelling</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Start typing to search across all your content</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Badge variant="outline">Threads</Badge>
                    <Badge variant="outline">Messages</Badge>
                    <Badge variant="outline">People</Badge>
                    <Badge variant="outline">Files</Badge>
                    <Badge variant="outline">Emails</Badge>
                    <Badge variant="outline">AI Insights</Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Tips */}
          {!query && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑↓</kbd> Navigate</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> Select</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> Close</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}