import { Link, useLocation } from 'react-router-dom'
import { Compass, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TabNavigation() {
  const location = useLocation()

  const tabs = [
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/my-profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-around px-4 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = location.pathname.startsWith(tab.path)
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

