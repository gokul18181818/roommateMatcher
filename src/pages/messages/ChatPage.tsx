import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Message, Conversation, Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { ArrowLeft, Send } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

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
    queryKey: ['profile', conversation?.participant_1_id === user?.id ? conversation.participant_2_id : conversation?.participant_1_id],
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
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  })

  useEffect(() => {
    if (conversationId && user) {
      // Subscribe to real-time messages
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

  // Mark messages as read
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

      // Update conversation
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="flex items-center gap-4 p-4 border-b bg-white rounded-t-lg">
        <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Link to={`/profile/${otherUser.id}`} className="flex items-center gap-3 flex-1">
          <Avatar
            src={otherUser.profile_photo_url || null}
            fallback={otherUser.full_name}
            className="h-10 w-10"
          />
          <div>
            <h2 className="font-semibold">{otherUser.full_name}</h2>
            <p className="text-sm text-muted-foreground">{otherUser.job_title} at {otherUser.company}</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatRelativeTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

