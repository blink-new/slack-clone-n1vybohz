import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Brain, Zap, MessageCircle, Bot } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import type { Message } from '../lib/blink'

interface NeuralNetworkProps {
  messages: Message[]
  onClose: () => void
}

interface NetworkNode {
  id: string
  x: number
  y: number
  size: number
  type: 'message' | 'topic' | 'ai'
  content: string
  connections: string[]
  color: string
}

export function NeuralNetwork({ messages, onClose }: NeuralNetworkProps) {
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)

  useEffect(() => {
    const extractTopics = () => {
      const words = messages
        .map(m => m.content.toLowerCase())
        .join(' ')
        .split(/\s+/)
        .filter(word => word.length > 4)
      
      const wordCount: Record<string, number> = {}
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1
      })
      
      return Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([word, count]) => ({ word, count }))
    }

    const findConnections = (message: Message, allMessages: Message[]) => {
      const messageWords = message.content.toLowerCase().split(/\s+/)
      const connections: string[] = []
      
      allMessages.forEach(otherMessage => {
        if (otherMessage.id !== message.id) {
          const otherWords = otherMessage.content.toLowerCase().split(/\s+/)
          const sharedWords = messageWords.filter(word => 
            otherWords.includes(word) && word.length > 3
          )
          
          if (sharedWords.length > 2) {
            connections.push(otherMessage.id)
          }
        }
      })
      
      return connections.slice(0, 3)
    }

    const generateNetworkNodes = () => {
      const networkNodes: NetworkNode[] = []
      const topics = extractTopics()
      
      // Create topic nodes
      topics.forEach((topic, index) => {
        const angle = (index / topics.length) * 2 * Math.PI
        const radius = 200
        networkNodes.push({
          id: `topic_${index}`,
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
          size: Math.min(60, 30 + topic.count * 2),
          type: 'topic',
          content: topic.word,
          connections: [],
          color: 'hsl(239 84% 67%)'
        })
      })

      // Create message nodes
      messages.slice(-20).forEach((message, index) => {
        const angle = Math.random() * 2 * Math.PI
        const radius = 100 + Math.random() * 150
        networkNodes.push({
          id: message.id,
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
          size: message.type === 'ai_response' ? 25 : 20,
          type: message.type === 'ai_response' ? 'ai' : 'message',
          content: message.content.slice(0, 50) + '...',
          connections: findConnections(message, messages),
          color: message.type === 'ai_response' ? 'hsl(271 91% 65%)' : 'hsl(239 84% 67%)'
        })
      })

      setNodes(networkNodes)
    }

    generateNetworkNodes()
  }, [messages])

  const getNodeIcon = (node: NetworkNode) => {
    switch (node.type) {
      case 'ai':
        return <Bot className="w-3 h-3" />
      case 'topic':
        return <Brain className="w-3 h-3" />
      default:
        return <MessageCircle className="w-3 h-3" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex"
    >
      {/* Neural Network Visualization */}
      <div className="flex-1 relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-primary neural-glow" />
            <h2 className="text-xl font-bold">Neural Network View</h2>
            <Badge variant="secondary">
              {nodes.length} nodes
            </Badge>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Network Canvas */}
        <div className="w-full h-full relative">
          <svg className="w-full h-full">
            {/* Connections */}
            {nodes.map(node => 
              node.connections.map(connectionId => {
                const targetNode = nodes.find(n => n.id === connectionId)
                if (!targetNode) return null
                
                return (
                  <motion.line
                    key={`${node.id}-${connectionId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="hsl(239 84% 67% / 0.3)"
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: Math.random() }}
                  />
                )
              })
            )}
          </svg>

          {/* Nodes */}
          <AnimatePresence>
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ 
                  left: node.x, 
                  top: node.y,
                  width: node.size,
                  height: node.size
                }}
                onClick={() => setSelectedNode(node)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white font-medium text-xs neural-glow"
                  style={{ backgroundColor: node.color }}
                >
                  {getNodeIcon(node)}
                </div>
                
                {/* Node label */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-center max-w-20 truncate">
                  {node.type === 'topic' ? node.content : ''}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: Math.random() * 800,
                top: Math.random() * 600
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 bg-card border-l border-border p-4 space-y-4">
        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Network Insights
          </h3>
          <p className="text-sm text-muted-foreground">
            This visualization shows the semantic connections between your messages and topics.
          </p>
        </div>

        {selectedNode && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                {getNodeIcon(selectedNode)}
                <span className="font-medium capitalize">{selectedNode.type}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedNode.content}
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {selectedNode.connections.length} connections
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Topics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span>AI Messages</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
              <span>User Messages</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            Nodes are sized by relevance and connected by semantic similarity. 
            This helps visualize the flow of ideas in your conversations.
          </p>
        </div>
      </div>
    </motion.div>
  )
}