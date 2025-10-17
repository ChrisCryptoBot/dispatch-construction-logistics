import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageAPI } from '../services/messageAPI'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { 
  MessageSquare, Send, Search, Plus, MoreVertical, 
  Paperclip, Image, File, X, Check, CheckCheck, CheckCircle,
  Phone, Video, Info, Archive, Trash2, Filter, ArrowLeft
} from 'lucide-react'
import type { Message, MessageThread, SendMessageRequest } from '../types/message'
import { formatDate } from '../utils'

const MessagesPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const messageEndRef = useRef<HTMLDivElement>(null)
  
  // State
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [showContactList, setShowContactList] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'active-loads' | 'dispatch' | 'customers' | 'system-alerts'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'priority' | 'unread'>('recent')
  const [selectedContacts, setSelectedContacts] = useState<any[]>([])
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock contacts data
  const contacts = [
    { id: '1', name: 'John Smith', role: 'driver', email: 'john@example.com', phone: '(555) 123-4567', online: true },
    { id: '2', name: 'Sarah Johnson', role: 'dispatcher', email: 'sarah@example.com', phone: '(555) 234-5678', online: false },
    { id: '3', name: 'Mike Wilson', role: 'customer', email: 'mike@example.com', phone: '(555) 345-6789', online: true },
    { id: '4', name: 'Lisa Brown', role: 'driver', email: 'lisa@example.com', phone: '(555) 456-7890', online: false },
    { id: '5', name: 'David Miller', role: 'customer', email: 'david@example.com', phone: '(555) 567-8901', online: true },
    { id: '6', name: 'Emily Davis', role: 'dispatcher', email: 'emily@example.com', phone: '(555) 678-9012', online: false }
  ]

  // Fetch threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['message-threads'],
    queryFn: messageAPI.getThreads
  })

  // Fetch messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedThread?.id],
    queryFn: () => selectedThread ? messageAPI.getMessages(selectedThread.id) : Promise.resolve([]),
    enabled: !!selectedThread
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (request: SendMessageRequest) => messageAPI.send(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['message-threads'] })
      setMessageInput('')
      setAttachments([])
    }
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (threadId: string) => messageAPI.markThreadAsRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] })
    }
  })

  // Filter and sort threads
  const filteredThreads = useMemo(() => {
    let filtered = threads.filter(thread => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        thread.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Category filter
      let matchesCategory = true
      if (selectedCategory === 'active-loads') {
        matchesCategory = thread.type === 'load' || thread.lastMessage.toLowerCase().includes('load')
      } else if (selectedCategory === 'dispatch') {
        matchesCategory = thread.type === 'dispatch' || thread.participants.some(p => p.role === 'dispatcher')
      } else if (selectedCategory === 'customers') {
        matchesCategory = thread.type === 'customer' || thread.participants.some(p => p.role === 'customer')
      } else if (selectedCategory === 'system-alerts') {
        matchesCategory = thread.type === 'system'
      }
      
      return matchesSearch && matchesCategory
    })
    
    // Sort threads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'priority':
          return b.unreadCount - a.unreadCount
        case 'unread':
          return b.unreadCount - a.unreadCount
        default:
          return 0
      }
    })
    
    return filtered
  }, [threads, searchTerm, selectedCategory, sortBy])

  // Handle thread selection
  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread)
    if (thread.unreadCount > 0) {
      markAsReadMutation.mutate(thread.id)
    }
  }

  // Handle send message
  const handleSendMessage = () => {
    if (!messageInput.trim() && attachments.length === 0) return
    if (!selectedThread) return

    const otherParticipant = selectedThread.participants.find(p => p.id !== user?.id)
    if (!otherParticipant) return

    const request: SendMessageRequest = {
      recipientId: otherParticipant.id,
      content: messageInput,
      threadId: selectedThread.id,
      attachments: attachments.length > 0 ? attachments : undefined
    }

    sendMessageMutation.mutate(request)
  }

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  // Handle new message flow
  const handleNewMessage = () => {
    setShowContactList(true)
  }

  const handleContactSelect = (contact: any) => {
    if (!selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(prev => [...prev, contact])
    }
  }

  const handleContactRemove = (contactId: string) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contactId))
  }

  const handleStartConversation = () => {
    if (selectedContacts.length === 0) return
    
    // Create new thread with selected contacts
    const newThread = {
      id: `thread-${Date.now()}`,
      participants: [...selectedContacts, { id: user?.id, name: user?.name || 'You', role: 'user' }],
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      lastMessageSender: 'You',
      unreadCount: 0,
      type: 'custom',
      loadId: null,
      updatedAt: new Date().toISOString()
    }
    
    setSelectedThread(newThread)
    setShowContactList(false)
    setShowNewMessageModal(false)
    setSelectedContacts([])
    setContactSearchTerm('')
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
    return formatDate(dateString)
  }

  const headerAction = (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '8px 12px',
          background: 'transparent',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          color: theme.colors.textSecondary,
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.colors.backgroundCardHover
          e.currentTarget.style.color = theme.colors.textPrimary
          e.currentTarget.style.borderColor = theme.colors.textSecondary
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = theme.colors.textSecondary
          e.currentTarget.style.borderColor = theme.colors.border
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
      
      <button
        onClick={handleNewMessage}
        style={{
          padding: '12px 20px',
          background: 'transparent',
          color: theme.colors.textSecondary,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.colors.backgroundCardHover
          e.currentTarget.style.color = theme.colors.textPrimary
          e.currentTarget.style.borderColor = theme.colors.textSecondary
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = theme.colors.textSecondary
          e.currentTarget.style.borderColor = theme.colors.border
        }}
      >
        <Plus size={18} />
        New Message
      </button>
    </div>
  )

  return (
    <PageContainer
      title="Messages"
      subtitle="Communicate with drivers, dispatchers, and customers"
      icon={MessageSquare}
      headerAction={headerAction}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        gap: '20px',
        height: 'calc(100vh - 200px)'
      }}>
        {/* Threads List */}
        <Card padding="0" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search */}
          <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}` }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: theme.colors.textTertiary 
                }} 
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  background: theme.colors.inputBg,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border}` }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {[
                { key: 'all', label: 'All', count: threads.length },
                { key: 'active-loads', label: 'Active Loads', count: threads.filter(t => t.type === 'load').length },
                { key: 'dispatch', label: 'Dispatch', count: threads.filter(t => t.type === 'dispatch').length },
                { key: 'customers', label: 'Customers', count: threads.filter(t => t.type === 'customer').length },
                { key: 'system-alerts', label: 'System', count: threads.filter(t => t.type === 'system').length }
              ].map(category => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key as any)}
                  style={{
                    padding: '6px 12px',
                    background: selectedCategory === category.key ? theme.colors.backgroundCardHover : 'transparent',
                    border: `1px solid ${selectedCategory === category.key ? theme.colors.textSecondary : theme.colors.border}`,
                    borderRadius: '6px',
                    color: selectedCategory === category.key ? theme.colors.textPrimary : theme.colors.textSecondary,
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {category.label}
                  {category.count > 0 && (
                    <span style={{
                      background: selectedCategory === category.key ? theme.colors.textSecondary : theme.colors.textTertiary,
                      color: selectedCategory === category.key ? theme.colors.backgroundCard : theme.colors.textSecondary,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      {category.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Sort Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '4px 8px',
                  background: theme.colors.inputBg,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  borderRadius: '4px',
                  color: theme.colors.textPrimary,
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="priority">Priority</option>
                <option value="unread">Unread Count</option>
              </select>
            </div>
          </div>

          {/* Thread List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredThreads.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: theme.colors.textSecondary
              }}>
                <MessageSquare size={48} color={theme.colors.textTertiary} style={{ marginBottom: '12px' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>No conversations yet</p>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const otherParticipant = thread.participants.find(p => p.id !== user?.id)
                const isSelected = selectedThread?.id === thread.id

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: `1px solid ${theme.colors.border}`,
                      cursor: 'pointer',
                      background: isSelected ? theme.colors.backgroundHover : 'transparent',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = `${theme.colors.primary}05`
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {/* Avatar */}
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: theme.colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}
                        >
                          {otherParticipant?.name.charAt(0).toUpperCase()}
                        </div>
                        {otherParticipant?.online && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: theme.colors.success,
                              border: `2px solid ${theme.colors.backgroundCard}`
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <span style={{
                              fontSize: '15px',
                              fontWeight: thread.unreadCount > 0 ? '600' : '500',
                              color: theme.colors.textPrimary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {otherParticipant?.name}
                            </span>
                            {/* Role badge */}
                            {otherParticipant?.role && (
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                background: otherParticipant.role === 'dispatcher' ? theme.colors.primary + '20' : 
                                           otherParticipant.role === 'driver' ? theme.colors.success + '20' : 
                                           otherParticipant.role === 'customer' ? theme.colors.warning + '20' : 
                                           theme.colors.textTertiary + '20',
                                color: otherParticipant.role === 'dispatcher' ? theme.colors.primary : 
                                       otherParticipant.role === 'driver' ? theme.colors.success : 
                                       otherParticipant.role === 'customer' ? theme.colors.warning : 
                                       theme.colors.textSecondary,
                                textTransform: 'uppercase'
                              }}>
                                {otherParticipant.role}
                              </span>
                            )}
                            {/* Status badge */}
                            {thread.type === 'system' && (
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                background: theme.colors.error + '20',
                                color: theme.colors.error,
                                textTransform: 'uppercase'
                              }}>
                                SYSTEM
                              </span>
                            )}
                          </div>
                          <span style={{
                            fontSize: '12px',
                            color: theme.colors.textSecondary,
                            flexShrink: 0,
                            marginLeft: '8px'
                          }}>
                            {formatTime(thread.lastMessageAt)}
                          </span>
                        </div>

                        <p style={{
                          fontSize: '13px',
                          color: thread.unreadCount > 0 ? theme.colors.textPrimary : theme.colors.textSecondary,
                          fontWeight: thread.unreadCount > 0 ? '500' : '400',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {thread.lastMessageSender === 'You' ? 'You: ' : ''}{thread.lastMessage}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {thread.unreadCount > 0 && (
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: theme.colors.primary,
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {thread.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Message View */}
        <Card padding="0" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {(() => {
                    const otherParticipant = selectedThread.participants.find(p => p.id !== user?.id)
                    return (
                      <>
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: theme.colors.primary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            {otherParticipant?.name.charAt(0).toUpperCase()}
                          </div>
                          {otherParticipant?.online && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                background: theme.colors.success,
                                border: `2px solid ${theme.colors.backgroundCard}`
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {otherParticipant?.name}
                          </h3>
                          <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textSecondary }}>
                            {otherParticipant?.online ? 'Online' : 'Offline'} • {otherParticipant?.role}
                          </p>
                          {/* Load reference if applicable */}
                          {selectedThread.type === 'load' && selectedThread.loadId && (
                            <div style={{ marginTop: '4px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: theme.colors.primary + '20',
                                color: theme.colors.primary,
                                textDecoration: 'none',
                                cursor: 'pointer'
                              }}>
                                Load #{selectedThread.loadId}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Load-related quick actions */}
                  {selectedThread.type === 'load' && selectedThread.loadId && (
                    <>
                      <button
                        onClick={() => navigate(`/loads/${selectedThread.loadId}`)}
                        style={{
                          background: 'transparent',
                          border: `1px solid ${theme.colors.border}`,
                          color: theme.colors.textSecondary,
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.colors.backgroundCardHover
                          e.currentTarget.style.borderColor = theme.colors.textSecondary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = theme.colors.border
                        }}
                      >
                        📄 View Load
                      </button>
                      <button
                        style={{
                          background: 'transparent',
                          border: `1px solid ${theme.colors.border}`,
                          color: theme.colors.textSecondary,
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.colors.backgroundCardHover
                          e.currentTarget.style.borderColor = theme.colors.textSecondary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = theme.colors.border
                        }}
                      >
                        📍 Navigate
                      </button>
                    </>
                  )}
                  
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.textSecondary,
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Phone size={20} />
                  </button>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.textSecondary,
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Video size={20} />
                  </button>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.textSecondary,
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Info size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user?.id || message.senderName === 'You'
                  const isSystem = message.type === 'system'
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId

                  // System message formatting
                  if (isSystem) {
                    return (
                      <div
                        key={message.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          margin: '16px 0'
                        }}
                      >
                        <div
                          style={{
                            background: theme.colors.backgroundHover,
                            color: theme.colors.textSecondary,
                            padding: '8px 16px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: `1px solid ${theme.colors.border}`,
                            maxWidth: '80%',
                            textAlign: 'center',
                            fontStyle: 'italic'
                          }}
                        >
                          {message.content}
                          <div style={{
                            fontSize: '10px',
                            color: theme.colors.textTertiary,
                            marginTop: '4px'
                          }}>
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-end',
                        gap: '8px'
                      }}
                    >
                      {!isOwn && showAvatar && (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: theme.colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}
                        >
                          {message.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {!isOwn && !showAvatar && <div style={{ width: '32px', flexShrink: 0 }} />}

                      <div style={{ maxWidth: '65%' }}>
                        <div
                          style={{
                            background: isOwn
                              ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                              : theme.colors.backgroundHover,
                            color: isOwn ? 'white' : theme.colors.textPrimary,
                            padding: '12px 16px',
                            borderRadius: isOwn 
                              ? '16px 16px 4px 16px'
                              : '16px 16px 16px 4px',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            wordWrap: 'break-word',
                            boxShadow: isOwn ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {message.content}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '4px',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start'
                        }}>
                          <span style={{
                            fontSize: '11px',
                            color: theme.colors.textTertiary
                          }}>
                            {formatTime(message.createdAt)}
                          </span>
                          {isOwn && message.readAt && (
                            <CheckCheck size={14} color={theme.colors.primary} />
                          )}
                          {isOwn && !message.readAt && (
                            <Check size={14} color={theme.colors.textTertiary} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messageEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '20px 24px',
                borderTop: `1px solid ${theme.colors.border}`
              }}>
                {attachments.length > 0 && (
                  <div style={{
                    marginBottom: '12px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '8px 12px',
                          background: theme.colors.backgroundHover,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px'
                        }}
                      >
                        <File size={16} color={theme.colors.primary} />
                        <span>{file.name}</span>
                        <button
                          onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            color: theme.colors.textSecondary
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    multiple
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      color: theme.colors.textSecondary,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundHover
                      e.currentTarget.style.borderColor = theme.colors.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = theme.colors.border
                    }}
                  >
                    <Paperclip size={20} />
                  </button>

                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
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
                      background: theme.colors.inputBg,
                      border: `1px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      color: theme.colors.textPrimary,
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
                    disabled={!messageInput.trim() && attachments.length === 0}
                    style={{
                      padding: '12px',
                      background: 'transparent',
                      color: messageInput.trim() || attachments.length > 0 ? theme.colors.textSecondary : theme.colors.textTertiary,
                      border: `1px solid ${messageInput.trim() || attachments.length > 0 ? theme.colors.border : theme.colors.textTertiary}`,
                      borderRadius: '8px',
                      cursor: messageInput.trim() || attachments.length > 0 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (messageInput.trim() || attachments.length > 0) {
                        e.currentTarget.style.background = theme.colors.backgroundCardHover
                        e.currentTarget.style.color = theme.colors.textPrimary
                        e.currentTarget.style.borderColor = theme.colors.textSecondary
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (messageInput.trim() || attachments.length > 0) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                        e.currentTarget.style.borderColor = theme.colors.border
                      }
                    }}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '16px',
              color: theme.colors.textSecondary
            }}>
              <MessageSquare size={64} color={theme.colors.textTertiary} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary }}>
                  Select a conversation
                </h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowNewMessageModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              border: `1px solid ${theme.colors.border}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: theme.colors.textPrimary }}>
                New Message
              </h2>
              <button
                onClick={() => setShowNewMessageModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: theme.colors.textSecondary
            }}>
              <MessageSquare size={48} color={theme.colors.textTertiary} style={{ marginBottom: '16px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                Contact search and new conversation creation coming soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact List Modal */}
      {showContactList && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowContactList(false)
              setSelectedContacts([])
              setContactSearchTerm('')
            }
          }}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '12px',
              width: '600px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary }}>
                  New Message
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                  Select contacts to start a conversation
                </p>
              </div>
              <button
                onClick={() => {
                  setShowContactList(false)
                  setSelectedContacts([])
                  setContactSearchTerm('')
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundHover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Contacts */}
            {selectedContacts.length > 0 && (
              <div style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${theme.colors.border}`,
                background: theme.colors.background
              }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedContacts.map(contact => (
                    <div
                      key={contact.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: theme.colors.backgroundCardHover,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}
                    >
                      <span style={{ color: theme.colors.textPrimary }}>{contact.name}</span>
                      <button
                        onClick={() => handleContactRemove(contact.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: theme.colors.textTertiary,
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.error}
                        onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textTertiary}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.colors.border}` }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: theme.colors.textTertiary 
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={contactSearchTerm}
                  onChange={(e) => setContactSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: theme.colors.inputBg,
                    border: `1px solid ${theme.colors.inputBorder}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Contact List */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
              {contacts
                .filter(contact => 
                  contactSearchTerm === '' || 
                  contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                  contact.email.toLowerCase().includes(contactSearchTerm.toLowerCase())
                )
                .map(contact => {
                  const isSelected = selectedContacts.find(c => c.id === contact.id)
                  return (
                    <div
                      key={contact.id}
                      onClick={() => isSelected ? handleContactRemove(contact.id) : handleContactSelect(contact)}
                      style={{
                        padding: '16px 24px',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        cursor: 'pointer',
                        background: isSelected ? theme.colors.backgroundCardHover : 'transparent',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = theme.colors.background
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: theme.colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        >
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        {contact.online && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: theme.colors.success,
                              border: `2px solid ${theme.colors.backgroundCard}`
                            }}
                          />
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '2px'
                        }}>
                          <span style={{
                            fontSize: '15px',
                            fontWeight: '500',
                            color: theme.colors.textPrimary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {contact.name}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            background: contact.role === 'dispatcher' ? theme.colors.primary + '20' : 
                                       contact.role === 'driver' ? theme.colors.success + '20' : 
                                       theme.colors.warning + '20',
                            color: contact.role === 'dispatcher' ? theme.colors.primary : 
                                   contact.role === 'driver' ? theme.colors.success : 
                                   theme.colors.warning,
                            textTransform: 'uppercase'
                          }}>
                            {contact.role}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: theme.colors.textSecondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {contact.email}
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle size={20} color={theme.colors.success} />
                      )}
                    </div>
                  )
                })}
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setShowContactList(false)
                  setSelectedContacts([])
                  setContactSearchTerm('')
                }}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.borderColor = theme.colors.textSecondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStartConversation}
                disabled={selectedContacts.length === 0}
                style={{
                  padding: '10px 20px',
                  background: selectedContacts.length > 0 ? 'transparent' : theme.colors.backgroundHover,
                  color: selectedContacts.length > 0 ? theme.colors.textSecondary : theme.colors.textTertiary,
                  border: `1px solid ${selectedContacts.length > 0 ? theme.colors.border : theme.colors.textTertiary}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: selectedContacts.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedContacts.length > 0) {
                    e.currentTarget.style.background = theme.colors.backgroundCardHover
                    e.currentTarget.style.color = theme.colors.textPrimary
                    e.currentTarget.style.borderColor = theme.colors.textSecondary
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedContacts.length > 0) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = theme.colors.textSecondary
                    e.currentTarget.style.borderColor = theme.colors.border
                  }
                }}
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default MessagesPage




