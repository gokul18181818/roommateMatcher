import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Conversation, Profile } from '@/types'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default function MessagesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const userId = searchParams.get('user')

  useEffect(() => {
    if (userId && user) {
      // Create or get conversation
      createOrGetConversation(userId)
    }
  }, [userId, user])

  const createOrGetConversation = async (otherUserId: string) => {
    if (!user) return

    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`)
      .single()

    if (existing) {
      navigate(`/messages/${existing.id}`)
      return
    }

    // Create new conversation
    const participant1 = user.id < otherUserId ? user.id : otherUserId
    const participant2 = user.id < otherUserId ? otherUserId : user.id

    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: participant1,
        participant_2_id: participant2,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return
    }

    navigate(`/messages/${newConv.id}`)
  }

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Get profile info for each conversation
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv: Conversation) => {
          const otherUserId = conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single()

          return { ...conv, otherUser: profile as Profile }
        })
      )

      return conversationsWithProfiles
    },
    enabled: !!user,
  })

  const filteredConversations = conversations?.filter((conv: any) => {
    if (!searchQuery) return true
    const name = conv.otherUser?.full_name || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-muted-foreground">Your conversations</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredConversations && filteredConversations.length > 0 ? (
        <div className="space-y-2">
          {filteredConversations.map((conv: any) => (
            <Card
              key={conv.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm"
              onClick={() => navigate(`/messages/${conv.id}`)}
            >
              <div className="flex items-center gap-4">
                <Avatar
                  src={conv.otherUser?.profile_photo_url || null}
                  fallback={conv.otherUser?.full_name || '?'}
                  className="h-12 w-12"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.otherUser?.full_name || 'Unknown'}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatRelativeTime(conv.updated_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message_preview || 'No messages yet'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start a conversation from someone's profile
          </p>
        </div>
      )}
    </div>
  )
}

