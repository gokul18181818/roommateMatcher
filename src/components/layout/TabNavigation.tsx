import { Compass, MessageSquare, User, MessageCircle } from 'lucide-react'
import { TubelightNavBar } from '@/components/ui/tubelight-navbar'

export default function TabNavigation() {
  const navItems = [
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Messages', url: '/messages', icon: MessageSquare },
    { name: 'Feedback', url: '/feedback', icon: MessageCircle },
    { name: 'Profile', url: '/my-profile', icon: User },
  ]

  return <TubelightNavBar items={navItems} />
}

