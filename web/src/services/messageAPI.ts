import apiClient from '../api/client'
import type { 
  Message, 
  MessageThread, 
  MessageFilters, 
  SendMessageRequest, 
  CreateThreadRequest 
} from '../types/message'

export const messageAPI = {
  // Get all message threads
  getThreads: async () => {
    try {
      const response = await apiClient.get('/messages/threads')
      return response.data as MessageThread[]
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockThreads
    }
  },

  // Get thread by ID
  getThread: async (threadId: string) => {
    try {
      const response = await apiClient.get(`/messages/threads/${threadId}`)
      return response.data as MessageThread
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockThreads.find(t => t.id === threadId) || mockThreads[0]
    }
  },

  // Get messages in a thread
  getMessages: async (threadId: string) => {
    try {
      const response = await apiClient.get(`/messages/threads/${threadId}/messages`)
      return response.data as Message[]
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockMessages.filter(m => m.threadId === threadId)
    }
  },

  // Send a message
  send: async (request: SendMessageRequest) => {
    try {
      const formData = new FormData()
      formData.append('recipientId', request.recipientId)
      formData.append('content', request.content)
      if (request.threadId) formData.append('threadId', request.threadId)
      if (request.attachments) {
        request.attachments.forEach(file => formData.append('attachments', file))
      }

      const response = await apiClient.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data as Message
    } catch (error) {
      console.warn('API not available, simulating send:', error)
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        threadId: request.threadId || `thread-${Date.now()}`,
        senderId: 'current-user',
        senderName: 'You',
        senderRole: 'carrier',
        recipientId: request.recipientId,
        recipientName: 'Recipient',
        content: request.content,
        createdAt: new Date().toISOString()
      }
      return newMessage
    }
  },

  // Create a new thread
  createThread: async (request: CreateThreadRequest) => {
    try {
      const response = await apiClient.post('/messages/threads', request)
      return response.data as MessageThread
    } catch (error) {
      console.warn('API not available, simulating thread creation:', error)
      const newThread: MessageThread = {
        id: `thread-${Date.now()}`,
        participants: request.participantIds.map(id => ({
          id,
          name: 'User',
          role: 'carrier' as const
        })),
        subject: request.subject,
        lastMessage: request.initialMessage,
        lastMessageAt: new Date().toISOString(),
        lastMessageSender: 'You',
        unreadCount: 0,
        totalMessages: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return newThread
    }
  },

  // Mark message as read
  markAsRead: async (messageId: string) => {
    try {
      const response = await apiClient.patch(`/messages/${messageId}/read`)
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Mark thread as read
  markThreadAsRead: async (threadId: string) => {
    try {
      const response = await apiClient.patch(`/messages/threads/${threadId}/read`)
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Delete message
  delete: async (messageId: string) => {
    try {
      await apiClient.delete(`/messages/${messageId}`)
      return { success: true }
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/messages/unread-count')
      return response.data.count as number
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return 3
    }
  }
}

// Mock data for development
const mockThreads: MessageThread[] = [
  {
    id: 'thread-1',
    participants: [
      { id: 'driver-1', name: 'John Driver', role: 'driver', online: true },
      { id: 'user', name: 'You', role: 'carrier' }
    ],
    subject: 'Load LT-1234 Updates',
    lastMessage: 'Arrived at pickup location. Waiting for loading.',
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastMessageSender: 'John Driver',
    unreadCount: 2,
    totalMessages: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'thread-2',
    participants: [
      { id: 'customer-1', name: 'ABC Logistics', role: 'customer', online: false },
      { id: 'user', name: 'You', role: 'carrier' }
    ],
    subject: 'Rate Negotiation',
    lastMessage: 'Load LT-1234 is ready for assignment.',
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    lastMessageSender: 'ABC Logistics',
    unreadCount: 1,
    totalMessages: 5,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'thread-3',
    participants: [
      { id: 'dispatcher-1', name: 'Sarah Dispatcher', role: 'dispatcher', online: true },
      { id: 'user', name: 'You', role: 'carrier' }
    ],
    lastMessage: 'Can you confirm ETA for load LT-1235?',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastMessageSender: 'Sarah Dispatcher',
    unreadCount: 0,
    totalMessages: 12,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
]

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: 'user',
    senderName: 'You',
    senderRole: 'carrier',
    recipientId: 'driver-1',
    recipientName: 'John Driver',
    content: 'Hey John, are you on the way to the pickup location?',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderId: 'driver-1',
    senderName: 'John Driver',
    senderRole: 'driver',
    recipientId: 'user',
    recipientName: 'You',
    content: 'Yes, ETA 15 minutes.',
    readAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-3',
    threadId: 'thread-1',
    senderId: 'driver-1',
    senderName: 'John Driver',
    senderRole: 'driver',
    recipientId: 'user',
    recipientName: 'You',
    content: 'Arrived at pickup location. Waiting for loading.',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
]

export { mockThreads, mockMessages }






