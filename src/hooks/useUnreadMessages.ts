import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useUnreadMessagesCount() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['unreadMessagesCount', user?.id],
    queryFn: async () => {
      if (!user) return 0

      // Get all conversations where user is a participant
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, participant_1_id, participant_2_id')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)

      if (convError) throw convError

      if (!conversations || conversations.length === 0) return 0

      let unreadCount = 0

      // Check each conversation
      for (const conv of conversations) {
        const otherUserId = conv.participant_1_id === user.id 
          ? conv.participant_2_id 
          : conv.participant_1_id

        // Get the last message in this conversation
        const { data: lastMessage, error: lastMsgError } = await supabase
          .from('messages')
          .select('sender_id, receiver_id, is_read')
          .eq('conversation_id', conv.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (lastMsgError || !lastMessage) continue

        // Only count if:
        // 1. The last message was sent by the other person (not the current user)
        // 2. The message is unread
        if (lastMessage.sender_id === otherUserId && 
            lastMessage.receiver_id === user.id && 
            !lastMessage.is_read) {
          unreadCount++
        }
      }

      return unreadCount
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds to keep badge updated
  })
}

