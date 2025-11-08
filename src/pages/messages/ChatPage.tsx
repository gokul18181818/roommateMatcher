import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Message, Conversation, Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react'

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const queryClient = useQueryClient()

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (error) throw error
      return data as Conversation
    },
    enabled: !!conversationId,
  })

  const { data: otherUser } = useQuery({
    queryKey: ['profile', conversation ? (conversation.participant_1_id === user?.id ? conversation.participant_2_id : conversation.participant_1_id) : null],
    queryFn: async () => {
      if (!conversation || !user) return null
      const otherUserId = conversation.participant_1_id === user.id ? conversation.participant_2_id : conversation.participant_1_id
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!conversation && !!user,
  })

  const { data: messages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Message[]
    },
    enabled: !!conversationId,
    refetchInterval: 2000,
  })

  // Typing indicator handler
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      // Broadcast typing status (simplified - in production use Supabase realtime)
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }

  // Realtime subscriptions
  useEffect(() => {
    if (conversationId && user) {
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [conversationId, user, queryClient])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (messages && user) {
      const unreadMessages = messages.filter(
        (m) => m.receiver_id === user.id && !m.is_read
      )

      if (unreadMessages.length > 0) {
        supabase
          .from('messages')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in('id', unreadMessages.map((m) => m.id))
      }
    }
  }, [messages, user])

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !conversation) throw new Error('Not authenticated')
      
      const otherUserId = conversation.participant_1_id === user.id 
        ? conversation.participant_2_id 
        : conversation.participant_1_id

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          receiver_id: otherUserId,
          content,
        })
        .select()
        .single()

      if (error) throw error

      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: content.substring(0, 100),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversation.id)

      return message as Message
    },
    onSuccess: () => {
      setMessage('')
      setIsTyping(false)
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      sendMessage.mutate(message.trim())
    }
  }

  const getMessageStatus = (msg: Message) => {
    if (!user || msg.sender_id !== user.id) return null
    
    if (msg.is_read && msg.read_at) {
      return 'read'
    }
    // Message exists in DB = delivered
    return 'delivered'
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 1440) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const formatFullTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (!conversation || !otherUser) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem-5.5rem)] bg-gradient-to-b from-background to-muted/20 flex flex-col -mx-4 -mt-6 -mb-24">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/messages')}
            className="h-9 w-9 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link
            to={`/profile/${otherUser.id}`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <Avatar
              src={otherUser.profile_photo_url || undefined}
              fallback={otherUser.full_name}
              className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/20"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground text-base truncate">
                {otherUser.full_name}
              </h2>
              {otherUserTyping && (
                <p className="text-xs text-muted-foreground animate-pulse">typing...</p>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-1">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => {
              const isOwn = msg.sender_id === user?.id
              const prevMessage = index > 0 ? messages[index - 1] : null
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null
              const showTime = !prevMessage || 
                new Date(msg.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000 // 5 minutes
              const isConsecutive = prevMessage && prevMessage.sender_id === msg.sender_id && 
                new Date(msg.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 60000
              const status = getMessageStatus(msg)
              
              return (
                <div key={msg.id}>
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/40">
                        {new Date(msg.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}>
                    {!isOwn && !isConsecutive && (
                      <Avatar
                        src={otherUser.profile_photo_url || undefined}
                        fallback={otherUser.full_name}
                        className="h-8 w-8 flex-shrink-0"
                      />
                    )}
                    {!isOwn && isConsecutive && <div className="w-8" />}
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[65%] sm:max-w-[55%]`}>
                      <div className="flex items-end gap-1.5">
                        {!isOwn && (
                          <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap pb-0.5">
                            {formatFullTime(msg.created_at)}
                          </span>
                        )}
                        <div
                          className={`rounded-2xl px-3.5 py-2 shadow-sm ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted/80 text-foreground rounded-bl-sm'
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                        {isOwn && (
                          <div className="flex items-center gap-1 pb-0.5">
                            <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                              {formatFullTime(msg.created_at)}
                            </span>
                            {status === 'read' ? (
                              <CheckCheck className="h-3.5 w-3.5 text-primary" />
                            ) : status === 'delivered' ? (
                              <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/70" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-muted-foreground/50" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No messages yet</p>
              <p className="text-muted-foreground/70 text-xs mt-1">Start the conversation!</p>
            </div>
          )}
          {otherUserTyping && (
            <div className="flex items-end gap-2">
              <Avatar
                src={otherUser.profile_photo_url || undefined}
                fallback={otherUser.full_name}
                className="h-6 w-6 flex-shrink-0"
              />
              <div className="bg-background border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-background/95 backdrop-blur-sm border-t border-border/40 pb-safe">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-h-[44px] max-h-32 bg-muted/60 rounded-2xl px-4 py-2.5 flex items-end overflow-y-auto border border-border/30 focus-within:border-primary/50 focus-within:bg-background transition-all">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  handleTyping()
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (message.trim()) {
                      handleSubmit(e)
                    }
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-[15px] text-foreground placeholder:text-muted-foreground/60 leading-relaxed"
                style={{ maxHeight: '128px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || sendMessage.isPending}
              className={`h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
                message.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {sendMessage.isPending ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
