import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import LoginPage from '@/pages/auth/LoginPage'
import OnboardingPage from '@/pages/auth/OnboardingPage'
import AuthCallback from '@/pages/auth/AuthCallback'
import MainLayout from '@/components/layout/MainLayout'
import ExplorePage from '@/pages/explore/ExplorePage'
import ProfileDetailPage from '@/pages/explore/ProfileDetailPage'
import MessagesPage from '@/pages/messages/MessagesPage'
import ChatPage from '@/pages/messages/ChatPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import EditProfilePage from '@/pages/profile/EditProfilePage'
import FeedbackPage from '@/pages/feedback/FeedbackPage'
import LinkedInDebugPage from '@/pages/dev/LinkedInDebugPage'
import { useAuth } from '@/hooks/useAuth'

// MOCK MODE: Set to false to enable real authentication
// const MOCK_MODE = false // Currently not used

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  useAuth() // Initialize auth state
  const { user, loading } = useAuthStore()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/explore" replace />,
      },
      {
        path: 'explore',
        element: <ExplorePage />,
      },
      {
        path: 'profile/:id',
        element: <ProfileDetailPage />,
      },
      {
        path: 'messages',
        element: <MessagesPage />,
      },
      {
        path: 'messages/:conversationId',
        element: <ChatPage />,
      },
      {
        path: 'my-profile',
        element: <ProfilePage />,
      },
      {
        path: 'my-profile/edit',
        element: <EditProfilePage />,
      },
      {
        path: 'feedback',
        element: <FeedbackPage />,
      },
      {
        path: 'debug/linkedin',
        element: <LinkedInDebugPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

