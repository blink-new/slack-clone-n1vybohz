import React, { useState, useRef, useEffect } from 'react';
import { Search, Command, Filter, Clock, FileText, MessageSquare, Users, Calendar, Zap } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'message' | 'file' | 'person' | 'meeting' | 'task' | 'integration';
  source: string;
  timestamp: string;
  url?: string;
}

interface UniversalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({ onResultSelect, className }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Product Roadmap Q2 2024',
      description: 'Updated roadmap with new feature priorities and timeline adjustments',
      type: 'file',
      source: 'Notion',
      timestamp: '2 hours ago',
      url: '#'
    },
    {
      id: '2',
      title: 'Sarah Chen',
      description: 'Product Designer • Available • Last active 5 minutes ago',
      type: 'person',
      source: 'Team Directory',
      timestamp: 'Online',
      url: '#'
    },
    {
      id: '3',
      title: 'Sprint Planning Meeting',
      description: 'Weekly sprint planning with development team',
      type: 'meeting',
      source: 'Calendar',
      timestamp: 'Tomorrow 10:00 AM',
      url: '#'
    },
    {
      id: '4',
      title: 'API Documentation Update',
      description: 'John completed the REST API documentation for v2.0',
      type: 'task',
      source: 'Jira',
      timestamp: '1 hour ago',
      url: '#'
    },
    {
      id: '5',
      title: 'Design System Discussion',
      description: 'Team discussion about updating our design system components',
      type: 'message',
      source: '#design-system',
      timestamp: '30 minutes ago',
      url: '#'
    },
    {
      id: '6',
      title: 'Figma Integration',
      description: 'Connected Figma workspace for design file synchronization',
      type: 'integration',
      source: 'Integrations',
      timestamp: '3 hours ago',
      url: '#'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'file': return FileText;
      case 'person': return Users;
      case 'meeting': return Calendar;
      case 'task': return Clock;
      case 'integration': return Zap;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-800';
      case 'file': return 'bg-green-100 text-green-800';
      case 'person': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-orange-100 text-orange-800';
      case 'task': return 'bg-yellow-100 text-yellow-800';
      case 'integration': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock results based on query
    const filteredResults = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setResults(filteredResults);
    setSelectedIndex(0);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    performSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    setQuery(result.title);
    setIsOpen(false);
    onResultSelect?.(result);
  };

  const handleFocus = () => {
    if (query) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow for result clicks
    setTimeout(() => setIsOpen(false), 200);
  };

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search messages, files, people, and more..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-12 pr-20 h-12 text-base bg-white border-gray-200 focus:border-primary focus:ring-primary rounded-xl shadow-sm"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
            <Command className="h-3 w-3 mr-1" />
            K
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = getTypeIcon(result.type);
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start space-x-3",
                      index === selectedIndex && "bg-primary/5 border-r-2 border-primary"
                    )}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getTypeColor(result.type))}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {result.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {result.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {result.source}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", getTypeColor(result.type))}>
                          {result.type}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Searches</h4>
              <div className="space-y-2">
                {['Product roadmap', 'Team meeting notes', 'API documentation'].map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(term);
                      performSearch(term);
                    }}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;