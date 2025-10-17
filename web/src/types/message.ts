export interface Message {
  id: string
  threadId: string
  senderId: string
  senderName: string
  senderRole: 'admin' | 'carrier' | 'customer' | 'driver' | 'dispatcher'
  recipientId: string
  recipientName: string
  content: string
  attachments?: MessageAttachment[]
  readAt?: string
  createdAt: string
  updatedAt?: string
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface MessageThread {
  id: string
  participants: ThreadParticipant[]
  subject?: string
  lastMessage: string
  lastMessageAt: string
  lastMessageSender: string
  unreadCount: number
  totalMessages: number
  createdAt: string
  updatedAt: string
}

export interface ThreadParticipant {
  id: string
  name: string
  role: 'admin' | 'carrier' | 'customer' | 'driver' | 'dispatcher'
  avatar?: string
  online?: boolean
}

export interface MessageFilters {
  threadId?: string
  senderId?: string
  recipientId?: string
  unreadOnly?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface SendMessageRequest {
  recipientId: string
  content: string
  threadId?: string
  attachments?: File[]
}

export interface CreateThreadRequest {
  participantIds: string[]
  subject?: string
  initialMessage: string
}






