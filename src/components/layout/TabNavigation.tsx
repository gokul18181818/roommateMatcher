import { Compass, MessageSquare, User, MessageCircle } from 'lucide-react'
import { TubelightNavBar } from '@/components/ui/tubelight-navbar'
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessages'

export default function TabNavigation() {
  const { data: unreadCount = 0 } = useUnreadMessagesCount()

  const navItems = [
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Messages', url: '/messages', icon: MessageSquare, badgeCount: unreadCount },
    { name: 'Feedback', url: '/feedback', icon: MessageCircle },
    { name: 'Profile', url: '/my-profile', icon: User },
  ]

  return <TubelightNavBar items={navItems} />
}

