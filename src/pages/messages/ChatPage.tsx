import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Message, Conversation, Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ArrowLeft, Send } from 'lucide-react'

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  if (!conversation || !otherUser) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem-5.5rem)] bg-background flex flex-col -mx-4 -mt-6 -mb-24">
      {/* iOS-style Header */}
      <div className="bg-background border-b border-border/40 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/messages')}
            className="h-8 w-8 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link
            to={`/profile/${otherUser.id}`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <Avatar
              src={otherUser.profile_photo_url || null}
              fallback={otherUser.full_name}
              className="h-10 w-10 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground text-base truncate">
                {otherUser.full_name}
              </h2>
            </div>
          </Link>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-2">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => {
              const isOwn = msg.sender_id === user?.id
              const prevMessage = index > 0 ? messages[index - 1] : null
              const showTime = !prevMessage || 
                new Date(msg.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000 // 5 minutes
              
              return (
                <div key={msg.id}>
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
                        {new Date(msg.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-background text-foreground rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <p className="text-muted-foreground text-sm">No messages yet</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* iOS-style Input Area */}
      <div className="bg-background border-t border-border/40 pb-safe">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-h-[36px] max-h-32 bg-muted/50 rounded-3xl px-4 py-2 flex items-end overflow-y-auto">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
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
                placeholder="Message"
                rows={1}
                className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-[15px] text-foreground placeholder:text-muted-foreground leading-relaxed"
                style={{ maxHeight: '128px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || sendMessage.isPending}
              className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                message.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

