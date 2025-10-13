import React, { useState, useEffect, useRef } from 'react'
import { colors, shadows, borders, spacing, gradients } from '../styles/design-system'

interface Message {
  id: string
  sender: string
  senderType: 'carrier' | 'customer' | 'system'
  recipient: string
  content: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  attachments?: Attachment[]
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message
  unreadCount: number
  isActive: boolean
}

const RealTimeMessaging = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data
  const conversations: Conversation[] = [
    {
      id: 'CONV001',
      participants: ['John Smith', 'Mike Johnson'],
      lastMessage: {
        id: 'MSG001',
        sender: 'Mike Johnson',
        senderType: 'customer',
        recipient: 'John Smith',
        content: 'Load LD-2024-001 is running 30 minutes behind schedule. ETA updated to 14:30.',
        timestamp: '2024-01-08 13:45',
        status: 'read',
        priority: 'high'
      },
      unreadCount: 0,
      isActive: true
    },
    {
      id: 'CONV002',
      participants: ['Sarah Wilson', 'Dispatch Team'],
      lastMessage: {
        id: 'MSG002',
        sender: 'Sarah Wilson',
        senderType: 'carrier',
        recipient: 'Dispatch Team',
        content: 'Delivery completed successfully. Customer signed off at 17:45.',
        timestamp: '2024-01-08 17:50',
        status: 'delivered',
        priority: 'normal'
      },
      unreadCount: 2,
      isActive: false
    },
    {
      id: 'CONV003',
      participants: ['System', 'All Users'],
      lastMessage: {
        id: 'MSG003',
        sender: 'System',
        senderType: 'system',
        recipient: 'All Users',
        content: 'Weather alert: Heavy rain expected on Route 95. Drive safely.',
        timestamp: '2024-01-08 12:30',
        status: 'read',
        priority: 'urgent'
      },
      unreadCount: 0,
      isActive: false
    }
  ]

  const messages: Message[] = [
    {
      id: 'MSG001',
      sender: 'Mike Johnson',
      senderType: 'customer',
      recipient: 'John Smith',
      content: 'Load LD-2024-001 is running 30 minutes behind schedule. ETA updated to 14:30.',
      timestamp: '2024-01-08 13:45',
      status: 'read',
      priority: 'high'
    },
    {
      id: 'MSG004',
      sender: 'John Smith',
      senderType: 'carrier',
      recipient: 'Mike Johnson',
      content: 'Understood. I\'ll update the system and notify the delivery team.',
      timestamp: '2024-01-08 13:47',
      status: 'delivered',
      priority: 'normal'
    },
    {
      id: 'MSG005',
      sender: 'Mike Johnson',
      senderType: 'customer',
      recipient: 'John Smith',
      content: 'Thank you for the quick response. Please keep us posted on any further updates.',
      timestamp: '2024-01-08 13:48',
      status: 'sent',
      priority: 'normal'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'normal': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getSenderTypeIcon = (senderType: string) => {
    switch (senderType) {
      case 'carrier': return 'fas fa-truck'
      case 'customer': return 'fas fa-building'
      case 'system': return 'fas fa-cog'
      default: return 'fas fa-user'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return 'fas fa-paper-plane'
      case 'delivered': return 'fas fa-check'
      case 'read': return 'fas fa-check-double'
      default: return 'fas fa-question'
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeConversation])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send to the backend
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(participant =>
      participant.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div style={{
      background: colors.background.secondary,
      borderRadius: borders.radius.xl,
      padding: spacing.xl,
      border: `${borders.thin} ${colors.border.primary}`,
      boxShadow: shadows.card,
      marginBottom: spacing.xl,
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.text.primary,
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: gradients.primary,
              borderRadius: borders.radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadows.soft
            }}>
              <i className="fas fa-comments" style={{ color: 'white', fontSize: '18px' }}></i>
            </div>
            Real-Time Messaging
          </h2>
          <p style={{ color: colors.text.secondary, margin: 0, fontSize: '14px' }}>
            Instant communication with carriers, customers, and dispatch team
          </p>
        </div>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            onClick={() => setShowCompose(!showCompose)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              background: gradients.primary,
              color: 'white',
              border: 'none',
              borderRadius: borders.radius.sm,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: shadows.soft
            }}
          >
            <i className="fas fa-plus" style={{ marginRight: spacing.xs }}></i>
            New Message
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: spacing.lg, overflow: 'hidden' }}>
        {/* Conversations List */}
        <div style={{
          width: '320px',
          background: colors.background.tertiary,
          borderRadius: borders.radius.lg,
          border: `${borders.thin} ${colors.border.secondary}`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Search */}
          <div style={{ padding: spacing.md, borderBottom: `${borders.thin} ${colors.border.secondary}` }}>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-search" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.text.tertiary,
                fontSize: '14px'
              }}></i>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  backgroundColor: colors.background.primary,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  borderRadius: borders.radius.sm,
                  color: colors.text.primary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation.id)}
                style={{
                  padding: spacing.md,
                  borderBottom: `${borders.thin} ${colors.border.secondary}`,
                  cursor: 'pointer',
                  backgroundColor: activeConversation === conversation.id ? colors.primary[500] : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeConversation !== conversation.id) {
                    (e.target as HTMLDivElement).style.backgroundColor = colors.background.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeConversation !== conversation.id) {
                    (e.target as HTMLDivElement).style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: activeConversation === conversation.id ? 'white' : colors.text.primary,
                      fontSize: '14px',
                      fontWeight: '600',
                      margin: '0 0 4px 0'
                    }}>
                      {conversation.participants.join(', ')}
                    </h3>
                    <p style={{
                      color: activeConversation === conversation.id ? 'rgba(255,255,255,0.8)' : colors.text.secondary,
                      fontSize: '12px',
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: spacing.xs }}>
                    <span style={{
                      color: activeConversation === conversation.id ? 'rgba(255,255,255,0.7)' : colors.text.tertiary,
                      fontSize: '11px'
                    }}>
                      {conversation.lastMessage.timestamp.split(' ')[1]}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <div style={{
                        backgroundColor: activeConversation === conversation.id ? 'rgba(255,255,255,0.2)' : colors.primary[500],
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        minWidth: '16px',
                        textAlign: 'center'
                      }}>
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <i className={getSenderTypeIcon(conversation.lastMessage.senderType)} style={{
                    color: activeConversation === conversation.id ? 'rgba(255,255,255,0.7)' : colors.text.tertiary,
                    fontSize: '10px'
                  }}></i>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: getPriorityColor(conversation.lastMessage.priority),
                    borderRadius: '50%'
                  }}></div>
                  <span style={{
                    color: activeConversation === conversation.id ? 'rgba(255,255,255,0.7)' : colors.text.tertiary,
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {conversation.lastMessage.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          background: colors.background.tertiary,
          borderRadius: borders.radius.lg,
          border: `${borders.thin} ${colors.border.secondary}`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: spacing.md,
                borderBottom: `${borders.thin} ${colors.border.secondary}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
                    {conversations.find(c => c.id === activeConversation)?.participants.join(', ')}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ color: colors.text.secondary, fontSize: '12px' }}>Online</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: spacing.xs }}>
                  <button style={{
                    padding: '8px',
                    backgroundColor: colors.background.primary,
                    border: `${borders.thin} ${colors.border.secondary}`,
                    borderRadius: borders.radius.sm,
                    cursor: 'pointer'
                  }}>
                    <i className="fas fa-phone" style={{ color: colors.text.secondary, fontSize: '14px' }}></i>
                  </button>
                  <button style={{
                    padding: '8px',
                    backgroundColor: colors.background.primary,
                    border: `${borders.thin} ${colors.border.secondary}`,
                    borderRadius: borders.radius.sm,
                    cursor: 'pointer'
                  }}>
                    <i className="fas fa-video" style={{ color: colors.text.secondary, fontSize: '14px' }}></i>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                padding: spacing.md,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.md
              }}>
                {messages.map(message => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: message.senderType === 'carrier' ? 'flex-end' : 'flex-start',
                      marginBottom: spacing.sm
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: spacing.md,
                      borderRadius: borders.radius.lg,
                      backgroundColor: message.senderType === 'carrier' ? colors.primary[500] : colors.background.primary,
                      border: message.senderType === 'carrier' ? 'none' : `${borders.thin} ${colors.border.secondary}`,
                      position: 'relative'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs,
                        marginBottom: spacing.xs
                      }}>
                        <i className={getSenderTypeIcon(message.senderType)} style={{
                          color: message.senderType === 'carrier' ? 'rgba(255,255,255,0.8)' : colors.text.secondary,
                          fontSize: '12px'
                        }}></i>
                        <span style={{
                          color: message.senderType === 'carrier' ? 'rgba(255,255,255,0.9)' : colors.text.primary,
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {message.sender}
                        </span>
                        <div style={{
                          width: '4px',
                          height: '4px',
                          backgroundColor: getPriorityColor(message.priority),
                          borderRadius: '50%'
                        }}></div>
                      </div>
                      <p style={{
                        color: message.senderType === 'carrier' ? 'white' : colors.text.primary,
                        fontSize: '14px',
                        margin: '0 0 8px 0',
                        lineHeight: 1.4
                      }}>
                        {message.content}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px'
                      }}>
                        <span style={{
                          color: message.senderType === 'carrier' ? 'rgba(255,255,255,0.7)' : colors.text.tertiary
                        }}>
                          {message.timestamp}
                        </span>
                        <i className={getStatusIcon(message.status)} style={{
                          color: message.senderType === 'carrier' ? 'rgba(255,255,255,0.7)' : colors.text.tertiary,
                          fontSize: '10px'
                        }}></i>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{
                padding: spacing.md,
                borderTop: `${borders.thin} ${colors.border.secondary}`,
                display: 'flex',
                gap: spacing.sm,
                alignItems: 'flex-end'
              }}>
                <button style={{
                  padding: '10px',
                  backgroundColor: colors.background.primary,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  borderRadius: borders.radius.sm,
                  cursor: 'pointer'
                }}>
                  <i className="fas fa-paperclip" style={{ color: colors.text.secondary, fontSize: '14px' }}></i>
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                      width: '100%',
                      minHeight: '40px',
                      maxHeight: '120px',
                      padding: '10px 12px',
                      backgroundColor: colors.background.primary,
                      border: `${borders.thin} ${colors.border.secondary}`,
                      borderRadius: borders.radius.sm,
                      color: colors.text.primary,
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '10px 16px',
                    background: newMessage.trim() ? gradients.primary : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: borders.radius.sm,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fas fa-paper-plane" style={{ marginRight: spacing.xs }}></i>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: colors.text.secondary
            }}>
              <i className="fas fa-comments" style={{ fontSize: '48px', marginBottom: spacing.md, color: colors.text.tertiary }}></i>
              <h3 style={{ fontSize: '18px', marginBottom: spacing.sm, color: colors.text.primary }}>Select a Conversation</h3>
              <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px' }}>
                Choose a conversation from the list to start messaging, or create a new message to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RealTimeMessaging
