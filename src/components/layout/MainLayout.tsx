import { Outlet } from 'react-router-dom'
import TabNavigation from './TabNavigation'
import Header from './Header'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pb-24 pt-6">
        <Outlet />
      </main>
      <TabNavigation />
    </div>
  )
}

