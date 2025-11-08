import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function Header() {
  const { signOut } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/explore" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <img src="/logo-icon.svg" alt="CareerCrib" className="h-12 w-12" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CareerCrib
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link to="/my-profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}

