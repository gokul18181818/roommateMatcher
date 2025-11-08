import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Conversation, Profile } from '@/types'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, MessageSquare, ChevronRight } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default function MessagesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const userId = searchParams.get('user')

  useEffect(() => {
    if (userId && user) {
      createOrGetConversation(userId)
    }
  }, [userId, user])

  const createOrGetConversation = async (otherUserId: string) => {
    if (!user) return

    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`)
      .single()

    if (existing) {
      navigate(`/messages/${existing.id}`)
      return
    }

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
      <div className="h-screen bg-background">
        <div className="max-w-2xl mx-auto bg-background">
          <div className="px-4 py-3 border-b border-border/40">
            <div className="h-8 bg-muted animate-pulse rounded w-32" />
          </div>
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-3 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-24" />
                    <div className="h-3 bg-muted animate-pulse rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* iOS-style Header */}
      <div className="bg-background border-b border-border/40 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-background border-b border-border/40 px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-muted/50 border-0 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {filteredConversations && filteredConversations.length > 0 ? (
            <div className="divide-y divide-border/40">
              {filteredConversations.map((conv: any) => (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 active:bg-muted/50 transition-colors"
                >
                  <Avatar
                    src={conv.otherUser?.profile_photo_url || null}
                    fallback={conv.otherUser?.full_name || '?'}
                    className="h-12 w-12 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-base truncate">
                        {conv.otherUser?.full_name || 'Unknown'}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatRelativeTime(conv.updated_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message_preview || 'No messages yet'}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 px-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">No Messages</p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Start a conversation from someone's profile
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

