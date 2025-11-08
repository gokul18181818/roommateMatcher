import { Outlet } from 'react-router-dom'
import TabNavigation from './TabNavigation'
import Header from './Header'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <Header />
      <main className="container mx-auto px-4 pb-20 pt-6">
        <Outlet />
      </main>
      <TabNavigation />
    </div>
  )
}

