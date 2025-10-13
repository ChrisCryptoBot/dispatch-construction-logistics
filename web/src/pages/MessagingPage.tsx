import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingAPI } from '../services/api'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'
import { 
  MessageCircle, Send, Phone, User, Search, Paperclip, Image, File,
  CheckCircle, Clock, Truck, Building, Package, MapPin, X, Download, MoreVertical, Loader
} from 'lucide-react'

interface Message {
  id: string
  from: string
  fromType: 'me' | 'them'
  content: string
  timestamp: string
  isRead: boolean
  attachments?: Array<{
    type: 'image' | 'pdf' | 'doc'
    name: string
    size: string
    url: string
  }>
}

interface Conversation {
  id: string
  name: string
  company: string
  type: 'driver' | 'carrier' | 'customer'
  lastMessage: string
  timestamp: string
  unreadCount: number
  online: boolean
  loadContext?: {
    loadId: string
    commodity: string
    status: string
  }
}

const MessagingPage = () => {
  const { theme } = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  
  // Fetch conversations from API
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        return await messagingAPI.getConversations()
      } catch (error) {
        console.warn('API not available, using mock data:', error)
        // Fallback to mock data
        return [
    {
      id: '1',
      name: 'John Smith',
      company: 'Superior Carriers Inc',
      type: 'driver',
      lastMessage: 'Load delivered successfully. Scale ticket uploaded.',
      timestamp: '10:30 AM',
      unreadCount: 0,
      online: true,
      loadContext: {
        loadId: 'load-001',
        commodity: 'Crushed Limestone',
        status: 'COMPLETED'
      }
    },
    {
      id: '2',
      name: 'Mike Johnson',
      company: 'ABC Construction',
      type: 'customer',
      lastMessage: 'Can you send 3 more loads of crushed stone tomorrow?',
      timestamp: '9:15 AM',
      unreadCount: 2,
      online: false,
      loadContext: {
        loadId: 'load-002',
        commodity: 'Concrete Mix',
        status: 'POSTED'
      }
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      company: 'Superior Carriers Inc',
      type: 'driver',
      lastMessage: 'ETA 15 minutes to pickup location',
      timestamp: 'Yesterday',
      unreadCount: 0,
      online: true,
      loadContext: {
        loadId: 'load-003',
        commodity: 'Gravel Base',
        status: 'IN_TRANSIT'
      }
    },
    {
      id: '4',
      name: 'Robert Chen',
      company: 'Texas Haulers LLC',
      type: 'carrier',
      lastMessage: 'Rate approved. Dispatching truck now.',
      timestamp: 'Yesterday',
      unreadCount: 1,
      online: false
    }
        ]
      }
    }
  })
  
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(conversations[0])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'John Smith',
      fromType: 'them',
      content: 'Picked up the load. Heading to destination.',
      timestamp: '9:45 AM',
      isRead: true
    },
    {
      id: '2',
      from: 'You',
      fromType: 'me',
      content: 'Great! Please send updates every hour and let me know if you encounter any issues.',
      timestamp: '9:50 AM',
      isRead: true
    },
    {
      id: '3',
      from: 'John Smith',
      fromType: 'them',
      content: 'Will do. Currently 30 miles from destination. Traffic is light.',
      timestamp: '10:15 AM',
      isRead: true
    },
    {
      id: '4',
      from: 'John Smith',
      fromType: 'them',
      content: 'Load delivered successfully. Scale ticket uploaded.',
      timestamp: '10:30 AM',
      isRead: true,
      attachments: [
        { type: 'pdf', name: 'scale-ticket-001.pdf', size: '245 KB', url: '#' },
        { type: 'image', name: 'delivery-photo.jpg', size: '1.2 MB', url: '#' }
      ]
    }
  ])
  
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const newMsg: Message = {
      id: Date.now().toString(),
      from: 'You',
      fromType: 'me',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isRead: false
    }

    setMessages([...messages, newMsg])
    setNewMessage('')

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        from: selectedConv?.name || 'Unknown',
        fromType: 'them',
        content: 'Thanks for the update! Will keep you posted.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isRead: false
      }
      setMessages(prev => [...prev, response])
    }, 2000)
  }

  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'driver': return Truck
      case 'customer': return Building
      case 'carrier': return Package
      default: return User
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return theme.colors.success
      case 'IN_TRANSIT': return theme.colors.info
      case 'POSTED': return theme.colors.warning
      default: return theme.colors.textSecondary
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageContainer
      title="Messages"
      subtitle="Communicate with drivers, carriers, and customers"
      icon={MessageCircle}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <Card padding="0" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Search */}
          <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}` }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 42px',
                  backgroundColor: theme.colors.backgroundSecondary,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map(conv => {
              const TypeIcon = getTypeIcon(conv.type)
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    backgroundColor: selectedConv?.id === conv.id ? theme.colors.backgroundTertiary : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConv?.id !== conv.id) {
                      e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConv?.id !== conv.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {React.createElement(TypeIcon, { size: 24 })}
                      </div>
                      {conv.online && (
                        <div style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: theme.colors.success,
                          border: `2px solid ${theme.colors.backgroundCard}`,
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.name}
                        </h4>
                        <span style={{ fontSize: '12px', color: theme.colors.textTertiary, whiteSpace: 'nowrap' }}>
                          {conv.timestamp}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                        {conv.company}
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: theme.colors.textSecondary,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <div style={{
                          display: 'inline-block',
                          marginTop: '6px',
                          padding: '2px 8px',
                          backgroundColor: theme.colors.primary,
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {conv.unreadCount} new
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Chat Area */}
        <Card padding="0" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {React.createElement(getTypeIcon(selectedConv.type), { size: 24 })}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 2px 0' }}>
                      {selectedConv.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                      {selectedConv.company} • {selectedConv.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      alert(`📞 Calling ${selectedConv.name}...\n\nPhone integration would connect here.`)
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: theme.colors.backgroundTertiary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.textPrimary,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.backgroundHover || theme.colors.backgroundSecondary
                      e.currentTarget.style.borderColor = theme.colors.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary
                      e.currentTarget.style.borderColor = theme.colors.border
                    }}
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    onClick={() => {
                      alert(`⚙️ More options:\n\n• View Profile\n• Block User\n• Export Chat\n• Delete Conversation\n\nThese options would appear in a dropdown menu.`)
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: theme.colors.backgroundTertiary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.textPrimary,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.backgroundHover || theme.colors.backgroundSecondary
                      e.currentTarget.style.borderColor = theme.colors.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary
                      e.currentTarget.style.borderColor = theme.colors.border
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Load Context Banner */}
              {selectedConv.loadContext && (
                <div style={{
                  padding: '12px 20px',
                  backgroundColor: `${getStatusColor(selectedConv.loadContext.status)}15`,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Package size={18} color={getStatusColor(selectedConv.loadContext.status)} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                      Load #{selectedConv.loadContext.loadId.substring(0, 8)} • {selectedConv.loadContext.commodity}
                    </p>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '2px 0 0 0' }}>
                      Status: <span style={{ color: getStatusColor(selectedConv.loadContext.status), fontWeight: '600' }}>
                        {selectedConv.loadContext.status}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Navigate to load details page
                      alert(`🚛 Opening load details...\n\nLoad ID: ${selectedConv.loadContext?.loadId}\nCommodity: ${selectedConv.loadContext?.commodity}\nStatus: ${selectedConv.loadContext?.status}\n\nWould navigate to load details page.`)
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}40`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    View Load
                  </button>
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.fromType === 'me' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      {msg.fromType === 'them' && (
                        <span style={{ fontSize: '12px', color: theme.colors.textSecondary, marginLeft: '12px' }}>
                          {msg.from}
                        </span>
                      )}
                      <div style={{
                        padding: '12px 16px',
                        backgroundColor: msg.fromType === 'me' ? theme.colors.primary : theme.colors.backgroundTertiary,
                        color: msg.fromType === 'me' ? 'white' : theme.colors.textPrimary,
                        borderRadius: '16px',
                        fontSize: '14px',
                        lineHeight: 1.5
                      }}>
                        {msg.content}
                        
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {msg.attachments.map((att, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '10px 12px',
                                  backgroundColor: msg.fromType === 'me' ? 'rgba(255, 255, 255, 0.1)' : theme.colors.background,
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  cursor: 'pointer'
                                }}
                              >
                                {att.type === 'image' ? <Image size={18} /> : <File size={18} />}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {att.name}
                                  </p>
                                  <p style={{ fontSize: '11px', opacity: 0.7, margin: '2px 0 0 0' }}>
                                    {att.size}
                                  </p>
                                </div>
                                <Download size={16} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: theme.colors.textTertiary,
                        marginLeft: msg.fromType === 'me' ? 'auto' : '12px',
                        marginRight: msg.fromType === 'me' ? '12px' : 'auto'
                      }}>
                        {msg.timestamp}
                        {msg.fromType === 'me' && msg.isRead && (
                          <CheckCircle size={12} style={{ marginLeft: '4px', verticalAlign: 'middle', color: theme.colors.success }} />
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '20px', borderTop: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <button
                    onClick={handleFileAttach}
                    style={{
                      padding: '12px',
                      backgroundColor: theme.colors.backgroundTertiary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.textPrimary
                    }}
                  >
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        alert(`File "${e.target.files[0].name}" would be attached here`)
                      }
                    }}
                  />
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      backgroundColor: theme.colors.backgroundSecondary,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      minHeight: '44px',
                      maxHeight: '120px'
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: newMessage.trim() ? theme.colors.primary : theme.colors.backgroundTertiary,
                      color: newMessage.trim() ? 'white' : theme.colors.textSecondary,
                      border: 'none',
                      borderRadius: '10px',
                      cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      opacity: newMessage.trim() ? 1 : 0.5
                    }}
                  >
                    <Send size={18} />
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <MessageCircle size={64} color={theme.colors.textTertiary} />
              <p style={{ color: theme.colors.textSecondary, fontSize: '16px' }}>
                Select a conversation to start messaging
              </p>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  )
}

export default MessagingPage
