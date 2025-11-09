import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LinkedInDebugPage() {
  const { user } = useAuthStore()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error fetching user:', error)
          setLoading(false)
          return
        }

        if (currentUser) {
          setUserData({
            id: currentUser.id,
            email: currentUser.email,
            user_metadata: currentUser.user_metadata,
            app_metadata: currentUser.app_metadata,
            raw: currentUser,
          })
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return <div className="p-8">Please sign in first</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn OAuth Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User ID:</h3>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-auto">
              {userData?.id || 'N/A'}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Email:</h3>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-auto">
              {userData?.email || 'N/A'}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">User Metadata (user_metadata):</h3>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(userData?.user_metadata || {}, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">App Metadata (app_metadata):</h3>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(userData?.app_metadata || {}, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Raw User Object:</h3>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(userData?.raw || {}, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Extracted Fields:</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div><strong>Name:</strong> {userData?.user_metadata?.name || 'Not found'}</div>
              <div><strong>Full Name:</strong> {userData?.user_metadata?.full_name || 'Not found'}</div>
              <div><strong>Picture:</strong> {userData?.user_metadata?.picture ? 'Found' : 'Not found'}</div>
              <div><strong>Sub (LinkedIn ID):</strong> {userData?.user_metadata?.sub || 'Not found'}</div>
              <div><strong>Job Title:</strong> {userData?.user_metadata?.job_title || userData?.user_metadata?.headline || 'Not found'}</div>
              <div><strong>Company:</strong> {userData?.user_metadata?.company || userData?.user_metadata?.company_name || 'Not found'}</div>
              <div><strong>Location:</strong> {userData?.user_metadata?.location || userData?.user_metadata?.locality || 'Not found'}</div>
              <div><strong>City:</strong> {userData?.user_metadata?.city || 'Not found'}</div>
              <div><strong>State:</strong> {userData?.user_metadata?.state || userData?.user_metadata?.region || 'Not found'}</div>
              <div><strong>Industry:</strong> {userData?.user_metadata?.industry || 'Not found'}</div>
              <div><strong>LinkedIn URL:</strong> {userData?.user_metadata?.profile_url || userData?.user_metadata?.linkedin_url || 'Not found'}</div>
            </div>
          </div>

          <Button 
            onClick={() => {
              console.log('Full user data:', userData)
              alert('Check browser console for full user data')
            }}
          >
            Log Full Data to Console
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

