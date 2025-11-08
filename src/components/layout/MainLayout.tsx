import { Outlet } from 'react-router-dom'
import TabNavigation from './TabNavigation'
import Header from './Header'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Header />
      <main className="container mx-auto px-4 pb-20 pt-4">
        <Outlet />
      </main>
      <TabNavigation />
    </div>
  )
}

