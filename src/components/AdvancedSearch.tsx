import React, { useState, useRef, useEffect } from 'react'
import { Search, Filter, Calendar, User, Hash, FileText, Image, Video, Mic, X, Clock, Star } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface SearchResult {
  id: string
  type: 'message' | 'file' | 'channel' | 'user'
  title: string
  content: string
  author?: {
    name: string
    avatar?: string
  }
  channel?: string
  timestamp: string
  fileType?: string
  fileSize?: number
  relevanceScore: number
}

interface SearchFilter {
  type: 'all' | 'messages' | 'files' | 'channels' | 'users'
  dateRange: 'all' | 'today' | 'week' | 'month'
  author?: string
  channel?: string
  fileType?: string
}

interface AdvancedSearchProps {
  onResultSelect: (result: SearchResult) => void
  placeholder?: string
  className?: string
}

export function AdvancedSearch({ onResultSelect, placeholder = "Search everything...", className = "" }: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    dateRange: 'all'
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'project timeline',
    'design review',
    'api documentation',
    'meeting notes'
  ])
  const [showFilters, setShowFilters] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'message',
      title: 'API Documentation Update',
      content: 'Updated the REST API documentation with new endpoints for user management and authentication flows...',
      author: { name: 'John Smith', avatar: undefined },
      channel: 'development',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      relevanceScore: 95
    },
    {
      id: '2',
      type: 'file',
      title: 'Design_System_v2.figma',
      content: 'Latest design system with updated components and color palette',
      author: { name: 'Sarah Chen', avatar: undefined },
      channel: 'design',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      fileType: 'figma',
      fileSize: 2.4,
      relevanceScore: 88
    },
    {
      id: '3',
      type: 'message',
      title: 'Sprint Planning Notes',
      content: 'Key decisions from today\'s sprint planning: Focus on user authentication, API optimization, and mobile responsiveness...',
      author: { name: 'Emily Davis', avatar: undefined },
      channel: 'product',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      relevanceScore: 82
    },
    {
      id: '4',
      type: 'channel',
      title: '#product-design',
      content: 'Design discussions and feedback for product features',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      relevanceScore: 75
    },
    {
      id: '5',
      type: 'file',
      title: 'meeting_recording_2024.mp4',
      content: 'Sprint retrospective meeting recording',
      author: { name: 'Mike Johnson', avatar: undefined },
      channel: 'general',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      fileType: 'video',
      fileSize: 45.2,
      relevanceScore: 70
    },
    {
      id: '6',
      type: 'user',
      title: 'Lisa Wang',
      content: 'Senior Frontend Developer • Available',
      timestamp: new Date().toISOString(),
      relevanceScore: 65
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Filter results based on query and filters
    const filteredResults = mockResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = filters.type === 'all' || 
                         (filters.type === 'messages' && result.type === 'message') ||
                         (filters.type === 'files' && result.type === 'file') ||
                         (filters.type === 'channels' && result.type === 'channel') ||
                         (filters.type === 'users' && result.type === 'user')
      
      return matchesQuery && matchesType
    })

    // Sort by relevance score
    filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
    
    setResults(filteredResults)
    setIsLoading(false)
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    setIsOpen(true)
    performSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result)
    setIsOpen(false)
    
    // Add to recent searches
    if (!recentSearches.includes(query) && query.trim()) {
      setRecentSearches(prev => [query, ...prev.slice(0, 3)])
    }
  }

  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    performSearch(search)
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const getResultIcon = (type: string, fileType?: string) => {
    switch (type) {
      case 'message':
        return <Hash className="h-4 w-4 text-blue-500" />
      case 'file':
        if (fileType === 'image') return <Image className="h-4 w-4 text-green-500" />
        if (fileType === 'video') return <Video className="h-4 w-4 text-purple-500" />
        if (fileType === 'audio') return <Mic className="h-4 w-4 text-orange-500" />
        return <FileText className="h-4 w-4 text-gray-500" />
      case 'channel':
        return <Hash className="h-4 w-4 text-indigo-500" />
      case 'user':
        return <User className="h-4 w-4 text-pink-500" />
      default:
        return <Search className="h-4 w-4 text-gray-400" />
    }
  }

  const getFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`
    return `${sizeInMB.toFixed(1)} MB`
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-gray-200"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <Filter className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Search Filters</h4>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Content Type</label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'messages', 'files', 'channels', 'users'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={filters.type === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, type }))}
                        className="text-xs capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Date Range</label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'today', 'week', 'month'] as const).map((range) => (
                      <Button
                        key={range}
                        variant={filters.dateRange === range ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                        className="text-xs capitalize"
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden shadow-lg border-0">
          <CardContent className="p-0">
            {query.trim() === '' ? (
              // Recent searches and suggestions
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Recent Searches</h4>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-700">{search}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-600">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No results found for "{query}"</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-medium text-gray-600">
                      {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {filters.type !== 'all' ? filters.type : 'all types'}
                    </Badge>
                  </div>
                  
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(result.type, result.fileType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">{result.relevanceScore}%</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {result.content}
                          </p>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {result.author && (
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={result.author.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {result.author.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{result.author.name}</span>
                              </div>
                            )}
                            
                            {result.channel && (
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {result.channel}
                              </span>
                            )}
                            
                            {result.fileSize && (
                              <span>{getFileSize(result.fileSize)}</span>
                            )}
                            
                            <span>{formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}