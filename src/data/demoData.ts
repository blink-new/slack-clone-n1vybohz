import type { Thread, Message } from '../lib/blink'

// Email data type
export interface EmailData {
  id: string
  threadId?: string
  subject: string
  senderEmail: string
  senderName: string
  recipientEmails: string[]
  content: string
  timestamp: string
  isRead: boolean
  isReplied: boolean
  isStarred?: boolean
  hasAttachments?: boolean
  isArchived?: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  aiSummary?: string
  aiContext?: {
    sentiment: string
    actionItems: string[]
    relatedThreads: string[]
    suggestedReply: string
  }
}

// Demo user data
export const demoUser = {
  id: 'demo_user_1',
  email: 'demo@thread.ai',
  displayName: 'Alex Chen',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
}

// Demo threads with various types and scenarios
export const demoThreads: Thread[] = [
  {
    id: 'demo_ai_chat',
    name: 'Thread AI Assistant',
    description: 'Your personal AI-powered assistant',
    type: 'ai_chat',
    participants: ['demo_user_1', 'ai_assistant'],
    createdBy: 'demo_user_1',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    isPrivate: true,
    aiEnabled: true
  },
  {
    id: 'demo_product_team',
    name: 'Product Strategy',
    description: 'Discussing Q1 product roadmap and feature priorities',
    type: 'channel',
    participants: ['demo_user_1', 'sarah_pm', 'mike_eng', 'lisa_design'],
    createdBy: 'demo_user_1',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    isPrivate: false,
    aiEnabled: true
  },
  {
    id: 'demo_engineering',
    name: 'Engineering',
    description: 'Technical discussions and architecture decisions',
    type: 'channel',
    participants: ['demo_user_1', 'mike_eng', 'david_senior', 'emma_fullstack'],
    createdBy: 'mike_eng',
    createdAt: '2024-01-08T08:00:00Z',
    updatedAt: '2024-01-18T15:20:00Z',
    isPrivate: false,
    aiEnabled: true
  },
  {
    id: 'demo_design_system',
    name: 'Design System',
    description: 'UI/UX components and design guidelines',
    type: 'channel',
    participants: ['demo_user_1', 'lisa_design', 'tom_ui'],
    createdBy: 'lisa_design',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-18T13:15:00Z',
    isPrivate: false,
    aiEnabled: true
  },
  {
    id: 'demo_dm_sarah',
    name: 'Sarah Martinez',
    description: 'Direct message with Product Manager',
    type: 'dm',
    participants: ['demo_user_1', 'sarah_pm'],
    createdBy: 'demo_user_1',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-18T12:30:00Z',
    isPrivate: true,
    aiEnabled: false
  },
  {
    id: 'demo_random',
    name: 'Random',
    description: 'Casual conversations and team bonding',
    type: 'channel',
    participants: ['demo_user_1', 'sarah_pm', 'mike_eng', 'lisa_design', 'david_senior', 'emma_fullstack'],
    createdBy: 'sarah_pm',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-18T17:00:00Z',
    isPrivate: false,
    aiEnabled: false
  }
]

// Demo messages for each thread
export const demoMessages: Record<string, Message[]> = {
  demo_ai_chat: [
    {
      id: 'ai_msg_1',
      threadId: 'demo_ai_chat',
      userId: 'ai_assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with research, analysis, creative tasks, and much more. What would you like to work on today?',
      type: 'ai_response',
      timestamp: '2024-01-15T09:00:00Z',
      aiContext: {
        isAiMessage: true,
        reasoning: 'Welcome message for new AI chat'
      }
    },
    {
      id: 'user_msg_1',
      threadId: 'demo_ai_chat',
      userId: 'demo_user_1',
      content: 'Can you help me analyze the latest trends in AI-powered messaging platforms?',
      type: 'text',
      timestamp: '2024-01-15T09:05:00Z'
    },
    {
      id: 'ai_msg_2',
      threadId: 'demo_ai_chat',
      userId: 'ai_assistant',
      content: 'Absolutely! Here are the key trends I\'m seeing in AI-powered messaging:\n\n**1. Contextual Intelligence**\n- Platforms are moving beyond simple chatbots to context-aware assistants\n- Memory persistence across conversations\n- Understanding of user intent and workflow\n\n**2. Semantic Organization**\n- Automatic categorization of messages by topic\n- Thread clustering based on content similarity\n- Knowledge graph generation from conversations\n\n**3. Proactive Assistance**\n- AI surfacing relevant information before you ask\n- Predictive text and smart suggestions\n- Automated task creation from conversations\n\n**4. Multi-modal Integration**\n- Voice, text, and visual content processing\n- Real-time transcription and translation\n- Image and document analysis within chats\n\nWould you like me to dive deeper into any of these areas?',
      type: 'ai_response',
      timestamp: '2024-01-15T09:06:00Z',
      aiContext: {
        isAiMessage: true,
        searchResults: ['https://techcrunch.com/ai-messaging-trends', 'https://venturebeat.com/conversational-ai'],
        reasoning: 'Comprehensive analysis of AI messaging trends with web search'
      }
    },
    {
      id: 'user_msg_2',
      threadId: 'demo_ai_chat',
      userId: 'demo_user_1',
      content: 'This is really helpful! Can you create a competitive analysis comparing Thread to other platforms?',
      type: 'text',
      timestamp: '2024-01-18T14:25:00Z'
    },
    {
      id: 'ai_msg_3',
      threadId: 'demo_ai_chat',
      userId: 'ai_assistant',
      content: '# Competitive Analysis: Thread vs. Other Platforms\n\n## Thread\'s Unique Advantages\n\n**🧠 Neural-Inspired Architecture**\n- Semantic message clustering (unique)\n- Living knowledge graph generation\n- Memory threads that evolve over time\n\n**🤖 AI-Native Design**\n- Built from ground up for AI integration\n- Contextual memory surfacing\n- Proactive insight generation\n\n## Comparison Matrix\n\n| Feature | Thread | Slack | Discord | Teams |\n|---------|--------|-------|---------|-------|\n| AI Integration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |\n| Semantic Organization | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐ |\n| Knowledge Persistence | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ |\n| Real-time Collaboration | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |\n| Enterprise Features | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |\n\n**Key Differentiator**: Thread transforms conversations into persistent, searchable knowledge while others treat messages as ephemeral.',
      type: 'ai_response',
      timestamp: '2024-01-18T14:30:00Z',
      aiContext: {
        isAiMessage: true,
        reasoning: 'Competitive analysis with structured comparison'
      }
    }
  ],

  demo_product_team: [
    {
      id: 'sarah_msg_1',
      threadId: 'demo_product_team',
      userId: 'sarah_pm',
      content: 'Team, I\'ve been analyzing our Q1 user feedback. The top request is better search functionality. Thoughts on prioritizing semantic search?',
      type: 'text',
      timestamp: '2024-01-16T10:00:00Z'
    },
    {
      id: 'mike_msg_1',
      threadId: 'demo_product_team',
      userId: 'mike_eng',
      content: 'From a technical standpoint, semantic search would require vector embeddings. We could use OpenAI\'s embedding API. Estimated 2-3 sprint effort.',
      type: 'text',
      timestamp: '2024-01-16T10:15:00Z'
    },
    {
      id: 'lisa_msg_1',
      threadId: 'demo_product_team',
      userId: 'lisa_design',
      content: 'I love this direction! I\'ve been sketching some concepts for a more intelligent search interface. Should we also consider visual search for images and files?',
      type: 'text',
      timestamp: '2024-01-16T10:30:00Z'
    },
    {
      id: 'alex_msg_1',
      threadId: 'demo_product_team',
      userId: 'demo_user_1',
      content: '@ai Can you analyze the ROI of implementing semantic search based on our user engagement metrics?',
      type: 'text',
      timestamp: '2024-01-16T11:00:00Z'
    },
    {
      id: 'ai_msg_4',
      threadId: 'demo_product_team',
      userId: 'ai_assistant',
      content: '# Semantic Search ROI Analysis\n\n## Projected Impact\n\n**User Engagement**\n- 40% reduction in search time (industry benchmark)\n- 25% increase in information discovery\n- 60% improvement in search satisfaction scores\n\n**Business Metrics**\n- Estimated 15% increase in daily active users\n- 20% reduction in support tickets (better self-service)\n- 30% improvement in user retention (better UX)\n\n**Implementation Cost**\n- Development: 2-3 sprints (as Mike noted)\n- Infrastructure: ~$200/month for embedding API\n- Maintenance: 0.5 FTE ongoing\n\n**Break-even**: Approximately 3 months post-launch\n\n**Recommendation**: High-impact, medium-effort feature. Should be prioritized for Q1.',
      type: 'ai_response',
      timestamp: '2024-01-16T11:05:00Z',
      aiContext: {
        isAiMessage: true,
        reasoning: 'ROI analysis based on user engagement data and industry benchmarks'
      }
    },
    {
      id: 'sarah_msg_2',
      threadId: 'demo_product_team',
      userId: 'sarah_pm',
      content: 'This analysis is spot on! Let\'s move forward with semantic search as our Q1 flagship feature. Mike, can you create the technical spec by Friday?',
      type: 'text',
      timestamp: '2024-01-18T16:45:00Z'
    }
  ],

  demo_engineering: [
    {
      id: 'mike_eng_1',
      threadId: 'demo_engineering',
      userId: 'mike_eng',
      content: 'We need to discuss our real-time architecture. Current WebSocket implementation is hitting scaling limits at 10k concurrent users.',
      type: 'text',
      timestamp: '2024-01-17T09:00:00Z'
    },
    {
      id: 'david_msg_1',
      threadId: 'demo_engineering',
      userId: 'david_senior',
      content: 'I\'ve been researching this. We should consider moving to a pub/sub model with Redis Streams. It\'ll handle horizontal scaling much better.',
      type: 'text',
      timestamp: '2024-01-17T09:15:00Z'
    },
    {
      id: 'emma_msg_1',
      threadId: 'demo_engineering',
      userId: 'emma_fullstack',
      content: 'What about using Server-Sent Events for one-way communication and WebSockets only for bidirectional? Could reduce connection overhead.',
      type: 'text',
      timestamp: '2024-01-17T09:30:00Z'
    },
    {
      id: 'alex_eng_1',
      threadId: 'demo_engineering',
      userId: 'demo_user_1',
      content: 'Great points. Let\'s also consider edge computing. Cloudflare Workers could handle message routing closer to users.',
      type: 'text',
      timestamp: '2024-01-17T10:00:00Z'
    },
    {
      id: 'mike_eng_2',
      threadId: 'demo_engineering',
      userId: 'mike_eng',
      content: 'I\'ll create a proof of concept with Redis Streams this week. Emma, can you benchmark the SSE approach?',
      type: 'text',
      timestamp: '2024-01-18T15:20:00Z'
    }
  ],

  demo_design_system: [
    {
      id: 'lisa_design_1',
      threadId: 'demo_design_system',
      userId: 'lisa_design',
      content: 'I\'ve been working on our neural-inspired design language. Here are the core principles I\'m thinking about:',
      type: 'text',
      timestamp: '2024-01-16T14:00:00Z'
    },
    {
      id: 'lisa_design_2',
      threadId: 'demo_design_system',
      userId: 'lisa_design',
      content: '🧠 **Neural Aesthetics**\n- Organic, flowing connections between elements\n- Subtle animations that mimic neural firing\n- Gradient overlays suggesting synaptic activity\n\n✨ **Intelligent Interactions**\n- Contextual micro-animations\n- Predictive UI states\n- Adaptive layouts based on content\n\n🌊 **Fluid Information Architecture**\n- Content that morphs based on relationships\n- Dynamic clustering of related items\n- Seamless transitions between views',
      type: 'text',
      timestamp: '2024-01-16T14:05:00Z'
    },
    {
      id: 'tom_ui_1',
      threadId: 'demo_design_system',
      userId: 'tom_ui',
      content: 'This is brilliant! The neural firing animations could be subtle CSS transforms. I\'m thinking about implementing the "neural glow" effect we discussed.',
      type: 'text',
      timestamp: '2024-01-16T14:30:00Z'
    },
    {
      id: 'alex_design_1',
      threadId: 'demo_design_system',
      userId: 'demo_user_1',
      content: 'Love the direction! How do we ensure accessibility while maintaining the neural aesthetic?',
      type: 'text',
      timestamp: '2024-01-18T13:15:00Z'
    }
  ],

  demo_dm_sarah: [
    {
      id: 'sarah_dm_1',
      threadId: 'demo_dm_sarah',
      userId: 'sarah_pm',
      content: 'Hey Alex! Quick question about the user research findings. Do you have the raw data from the semantic search interviews?',
      type: 'text',
      timestamp: '2024-01-17T11:00:00Z'
    },
    {
      id: 'alex_dm_1',
      threadId: 'demo_dm_sarah',
      userId: 'demo_user_1',
      content: 'Absolutely! I\'ll share the Notion doc with all the transcripts and key insights. The pattern around "information discovery" was really interesting.',
      type: 'text',
      timestamp: '2024-01-17T11:15:00Z'
    },
    {
      id: 'sarah_dm_2',
      threadId: 'demo_dm_sarah',
      userId: 'sarah_pm',
      content: 'Perfect! Also, great job on the competitive analysis presentation yesterday. The board was really impressed with the Thread positioning.',
      type: 'text',
      timestamp: '2024-01-18T12:30:00Z'
    }
  ],

  demo_random: [
    {
      id: 'random_1',
      threadId: 'demo_random',
      userId: 'emma_fullstack',
      content: 'Anyone else excited about the new office coffee machine? ☕️',
      type: 'text',
      timestamp: '2024-01-18T08:30:00Z'
    },
    {
      id: 'random_2',
      threadId: 'demo_random',
      userId: 'mike_eng',
      content: 'Finally! No more instant coffee disasters 😅',
      type: 'text',
      timestamp: '2024-01-18T08:45:00Z'
    },
    {
      id: 'random_3',
      threadId: 'demo_random',
      userId: 'lisa_design',
      content: 'I\'m organizing a design thinking workshop next Friday. Who\'s interested? We\'ll be exploring "AI as a design material"',
      type: 'text',
      timestamp: '2024-01-18T15:00:00Z'
    },
    {
      id: 'random_4',
      threadId: 'demo_random',
      userId: 'david_senior',
      content: 'Count me in! Always curious about the intersection of AI and design.',
      type: 'text',
      timestamp: '2024-01-18T15:30:00Z'
    },
    {
      id: 'random_5',
      threadId: 'demo_random',
      userId: 'demo_user_1',
      content: 'Sounds amazing! Let\'s also invite some folks from the product team.',
      type: 'text',
      timestamp: '2024-01-18T17:00:00Z'
    }
  ]
}

// Demo user profiles for message attribution
export const demoUsers: Record<string, any> = {
  demo_user_1: {
    id: 'demo_user_1',
    displayName: 'Alex Chen',
    email: 'alex@thread.ai',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  ai_assistant: {
    id: 'ai_assistant',
    displayName: 'Thread AI',
    email: 'ai@thread.ai',
    avatar: null
  },
  sarah_pm: {
    id: 'sarah_pm',
    displayName: 'Sarah Martinez',
    email: 'sarah@thread.ai',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  mike_eng: {
    id: 'mike_eng',
    displayName: 'Mike Johnson',
    email: 'mike@thread.ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  lisa_design: {
    id: 'lisa_design',
    displayName: 'Lisa Wang',
    email: 'lisa@thread.ai',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  david_senior: {
    id: 'david_senior',
    displayName: 'David Rodriguez',
    email: 'david@thread.ai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  emma_fullstack: {
    id: 'emma_fullstack',
    displayName: 'Emma Thompson',
    email: 'emma@thread.ai',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
  },
  tom_ui: {
    id: 'tom_ui',
    displayName: 'Tom Kim',
    email: 'tom@thread.ai',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }
}

// Demo notifications for smart notifications
export interface NotificationData {
  id: string
  type: 'email' | 'message' | 'mention' | 'meeting' | 'system'
  title: string
  content: string
  timestamp: string
  isRead: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  actionUrl?: string
  threadId?: string
  emailId?: string
  userId?: string
  metadata?: {
    senderName?: string
    threadName?: string
    emailSubject?: string
  }
}

export const demoNotifications: NotificationData[] = [
  {
    id: 'notif_1',
    type: 'email',
    title: 'New Email from Sarah Martinez',
    content: 'Q1 Product Roadmap Review - needs your input on semantic search prioritization',
    timestamp: '2024-01-18T09:30:00Z',
    isRead: false,
    priority: 'high',
    emailId: 'email_1',
    metadata: {
      senderName: 'Sarah Martinez',
      emailSubject: 'Q1 Product Roadmap Review'
    }
  },
  {
    id: 'notif_2',
    type: 'mention',
    title: 'Mentioned in Product Strategy',
    content: '@alex Can you analyze the ROI of implementing semantic search?',
    timestamp: '2024-01-16T11:00:00Z',
    isRead: false,
    priority: 'normal',
    threadId: 'demo_product_team',
    metadata: {
      threadName: 'Product Strategy'
    }
  },
  {
    id: 'notif_3',
    type: 'message',
    title: 'New message in Engineering',
    content: 'Mike: I\'ll create a proof of concept with Redis Streams this week',
    timestamp: '2024-01-18T15:20:00Z',
    isRead: true,
    priority: 'normal',
    threadId: 'demo_engineering',
    metadata: {
      threadName: 'Engineering'
    }
  },
  {
    id: 'notif_4',
    type: 'email',
    title: 'Client Feedback: Thread Platform Demo',
    content: 'BigCorp client wants technical deep-dive and pilot program for 50 users',
    timestamp: '2024-01-15T14:30:00Z',
    isRead: false,
    priority: 'urgent',
    emailId: 'email_4',
    metadata: {
      senderName: 'Jennifer Adams',
      emailSubject: 'Client Feedback: Thread Platform Demo'
    }
  },
  {
    id: 'notif_5',
    type: 'meeting',
    title: 'Design Thinking Workshop',
    content: 'Lisa is organizing a workshop on "AI as a design material" - Friday 2PM',
    timestamp: '2024-01-18T15:00:00Z',
    isRead: true,
    priority: 'normal',
    metadata: {
      senderName: 'Lisa Wang'
    }
  }
]

// Demo voice commands for voice control
export const demoVoiceCommands = [
  {
    command: "Reply to Sarah's email about the product roadmap",
    intent: 'reply_email',
    parameters: { emailId: 'email_1', content: 'I agree with prioritizing semantic search. Let me schedule a deep dive session.' }
  },
  {
    command: "Create a new thread called Marketing Strategy",
    intent: 'create_thread',
    parameters: { threadName: 'Marketing Strategy', type: 'channel' }
  },
  {
    command: "Send message to the engineering team about the Redis implementation",
    intent: 'send_message',
    parameters: { threadId: 'demo_engineering', content: 'Great progress on Redis Streams! Let me know if you need any resources.' }
  },
  {
    command: "Search for messages about semantic search",
    intent: 'search_messages',
    parameters: { searchQuery: 'semantic search' }
  },
  {
    command: "Schedule a meeting with the product team for tomorrow",
    intent: 'schedule_meeting',
    parameters: { title: 'Product Team Sync', participants: ['sarah_pm', 'demo_user_1'], date: 'tomorrow' }
  }
]

// Demo emails for unified inbox
export const demoEmails: EmailData[] = [
  {
    id: 'email_1',
    threadId: 'demo_product_team',
    subject: 'Q1 Product Roadmap Review',
    senderEmail: 'sarah.martinez@company.com',
    senderName: 'Sarah Martinez',
    recipientEmails: ['alex.chen@company.com', 'team@company.com'],
    content: 'Hi Alex,\n\nI\'ve reviewed the Q1 product roadmap and have some thoughts on the semantic search feature. The user research data shows this could be a game-changer for our platform.\n\nKey points:\n- 40% of users struggle with finding relevant information\n- Semantic search could reduce support tickets by 25%\n- Implementation timeline looks realistic\n\nLet\'s discuss this in our next product sync. I think we should prioritize this over the mobile app updates.\n\nBest,\nSarah',
    timestamp: '2024-01-18T09:30:00Z',
    isRead: false,
    isReplied: false,
    isStarred: true,
    hasAttachments: false,
    isArchived: false,
    priority: 'high',
    aiSummary: 'Sarah supports prioritizing semantic search feature based on user research showing 40% struggle with information discovery.',
    aiContext: {
      sentiment: 'positive and supportive',
      actionItems: ['Schedule product sync meeting', 'Review semantic search implementation timeline', 'Deprioritize mobile app updates'],
      relatedThreads: ['demo_product_team'],
      suggestedReply: 'Agree on semantic search priority. Let\'s schedule a deep dive session to discuss implementation details.'
    }
  },
  {
    id: 'email_2',
    subject: 'Weekly Engineering Standup Notes',
    senderEmail: 'mike.johnson@company.com',
    senderName: 'Mike Johnson',
    recipientEmails: ['engineering@company.com'],
    content: 'Team,\n\nHere are the key updates from this week\'s engineering standup:\n\n**Completed:**\n- WebSocket scaling improvements (handles 10k+ concurrent users)\n- Database optimization for message queries\n- Initial semantic search API design\n\n**In Progress:**\n- Redis Streams implementation for real-time messaging\n- AI integration for smart notifications\n- Performance testing for new architecture\n\n**Blockers:**\n- Need product requirements for email integration feature\n- Waiting on design mockups for unified inbox\n\n**Next Week:**\n- Complete Redis Streams migration\n- Start semantic search backend implementation\n- Performance benchmarking\n\nLet me know if you have any questions!\n\nMike',
    timestamp: '2024-01-17T16:45:00Z',
    isRead: true,
    isReplied: false,
    isStarred: false,
    hasAttachments: true,
    isArchived: false,
    priority: 'normal',
    aiSummary: 'Engineering update: WebSocket scaling completed, Redis Streams in progress, needs product requirements for email integration.',
    aiContext: {
      sentiment: 'informative and organized',
      actionItems: ['Provide product requirements for email integration', 'Review design mockups for unified inbox', 'Schedule performance benchmarking'],
      relatedThreads: ['demo_engineering'],
      suggestedReply: 'Thanks for the update. I\'ll get you the email integration requirements by Friday.'
    }
  },
  {
    id: 'email_3',
    subject: 'Design System Updates - Neural Aesthetics',
    senderEmail: 'lisa.wang@company.com',
    senderName: 'Lisa Wang',
    recipientEmails: ['design@company.com', 'alex.chen@company.com'],
    content: 'Hi everyone,\n\nI\'ve been working on our neural-inspired design language and wanted to share the latest updates:\n\n🧠 **Neural Aesthetics Principles:**\n- Organic, flowing connections between UI elements\n- Subtle animations that mimic neural firing patterns\n- Gradient overlays suggesting synaptic activity\n- Contextual micro-animations based on user behavior\n\n✨ **New Components:**\n- Neural glow effects for active states\n- Flowing connection lines for related content\n- Adaptive layouts that respond to content relationships\n- Smart color transitions based on message sentiment\n\n🎨 **Implementation Status:**\n- Core CSS animations: 90% complete\n- React components: 70% complete\n- Documentation: 50% complete\n\nThe goal is to make the interface feel alive and intelligent, reflecting the AI-native nature of our platform.\n\nI\'d love to get feedback from the team, especially on the accessibility aspects of the neural glow effects.\n\nBest,\nLisa',
    timestamp: '2024-01-16T11:20:00Z',
    isRead: true,
    isReplied: true,
    isStarred: false,
    hasAttachments: false,
    isArchived: false,
    priority: 'normal',
    aiSummary: 'Lisa shares neural-inspired design system updates with organic animations and AI-responsive UI elements.',
    aiContext: {
      sentiment: 'creative and enthusiastic',
      actionItems: ['Review accessibility of neural glow effects', 'Complete React components implementation', 'Finish design documentation'],
      relatedThreads: ['demo_design_system'],
      suggestedReply: 'Love the neural aesthetic direction! The organic animations will really set us apart. Let\'s review accessibility together.'
    }
  },
  {
    id: 'email_4',
    subject: 'Client Feedback: Thread Platform Demo',
    senderEmail: 'client@bigcorp.com',
    senderName: 'Jennifer Adams',
    recipientEmails: ['alex.chen@company.com', 'sales@company.com'],
    content: 'Alex,\n\nThank you for the comprehensive demo of the Thread platform yesterday. Our team was impressed with the AI-native approach and the unified communication concept.\n\n**What we loved:**\n- The semantic message clustering is exactly what we need\n- Voice control integration could be a game-changer for our remote teams\n- Email integration within threads would solve our context-switching problem\n- The neural network visualization is visually stunning\n\n**Questions/Concerns:**\n- How does the platform handle enterprise security requirements?\n- What\'s the learning curve for non-technical users?\n- Can we integrate with our existing Slack workspace during transition?\n- Pricing for 500+ users?\n\n**Next Steps:**\nWe\'d like to schedule a technical deep-dive with our IT team and discuss a pilot program for our product team (50 users).\n\nWhen would be a good time for a follow-up call?\n\nBest regards,\nJennifer Adams\nHead of Product, BigCorp',
    timestamp: '2024-01-15T14:30:00Z',
    isRead: false,
    isReplied: false,
    isStarred: true,
    hasAttachments: false,
    isArchived: false,
    priority: 'urgent',
    aiSummary: 'BigCorp client loved the demo, wants technical deep-dive and pilot program for 50 users. Has security and integration questions.',
    aiContext: {
      sentiment: 'positive and interested',
      actionItems: ['Schedule technical deep-dive with IT team', 'Prepare enterprise security documentation', 'Create pilot program proposal', 'Prepare Slack integration timeline'],
      relatedThreads: [],
      suggestedReply: 'Thrilled you loved the demo! I\'ll set up a technical session with our security team and prepare a pilot program proposal.'
    }
  },
  {
    id: 'email_5',
    subject: 'Voice Control Feature - User Testing Results',
    senderEmail: 'research@company.com',
    senderName: 'Emma Thompson',
    recipientEmails: ['alex.chen@company.com', 'product@company.com'],
    content: 'Hi Alex,\n\nI\'ve completed the user testing for our voice control feature. Here are the key findings:\n\n**Positive Feedback:**\n- 85% of users found voice commands intuitive\n- "Reply to Sarah\'s email" worked flawlessly in 90% of tests\n- Users loved the always-on listening with visual feedback\n- Voice-to-email transcription accuracy was impressive\n\n**Areas for Improvement:**\n- Some confusion with complex commands (multiple recipients)\n- Need better error handling for misunderstood commands\n- Privacy concerns about always-on listening (need clear indicators)\n- Accent recognition could be improved\n\n**Recommendations:**\n1. Add command confirmation for complex actions\n2. Implement privacy mode toggle\n3. Improve accent training data\n4. Add voice command tutorial for new users\n\n**Usage Patterns:**\n- Most common: "Send message to [person]" (45%)\n- Second: "Reply to [person\'s] email" (30%)\n- Third: "Create new thread" (15%)\n\nOverall, users are excited about the feature and see it as a major differentiator.\n\nLet me know if you need the detailed report!\n\nEmma',
    timestamp: '2024-01-14T10:15:00Z',
    isRead: true,
    isReplied: false,
    isStarred: false,
    hasAttachments: true,
    isArchived: false,
    priority: 'normal',
    aiSummary: 'Voice control testing shows 85% positive feedback, needs privacy improvements and better error handling.',
    aiContext: {
      sentiment: 'analytical and constructive',
      actionItems: ['Add command confirmation for complex actions', 'Implement privacy mode toggle', 'Improve accent recognition', 'Create voice command tutorial'],
      relatedThreads: [],
      suggestedReply: 'Great insights! Let\'s prioritize the privacy toggle and command confirmation. Can you share the detailed report?'
    }
  }
]