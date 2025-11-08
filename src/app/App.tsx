import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './router'
import { useAuth } from '@/hooks/useAuth'

function App() {
  useAuth() // Initialize auth state

  return (
    <Providers>
      <RouterProvider 
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </Providers>
  )
}

export default App

