import { Compass, MessageSquare, User } from 'lucide-react'
import { TubelightNavBar } from '@/components/ui/tubelight-navbar'

export default function TabNavigation() {
  const navItems = [
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Messages', url: '/messages', icon: MessageSquare },
    { name: 'Profile', url: '/my-profile', icon: User },
  ]

  return <TubelightNavBar items={navItems} />
}

