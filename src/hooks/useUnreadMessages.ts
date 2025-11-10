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
        .select('id')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)

      if (convError) throw convError

      if (!conversations || conversations.length === 0) return 0

      const conversationIds = conversations.map((c) => c.id)

      // Count unread messages where user is the receiver
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      return count || 0
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds to keep badge updated
  })
}

