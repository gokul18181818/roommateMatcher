import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Briefcase, Building2, Calendar, DollarSign, MessageSquare, Bookmark, Linkedin } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Profile
    },
  })

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, bookmarked_profile_id: id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
        <Button onClick={() => navigate('/explore')} className="mt-4">
          Back to Explore
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/explore')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          {/* Profile Header with Circular Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <Avatar
                src={profile.profile_photo_url || null}
                fallback={profile.full_name}
                className="h-32 w-32 border-4 border-white shadow-lg"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="bg-blue-600">Verified</Badge>
                </div>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.full_name}</h1>
              <p className="text-lg text-muted-foreground mb-3">{profile.age} years old</p>
              {profile.linkedin_profile_url && (
                <a
                  href={profile.linkedin_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="text-sm font-medium">View LinkedIn Profile</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Button
              onClick={() => bookmarkMutation.mutate()}
              variant="outline"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
            <Link to={`/messages?user=${profile.id}`}>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Job Title</p>
                <p className="font-medium">{profile.job_title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">{profile.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{profile.city}, {profile.state}</p>
              </div>
            </div>
            {profile.industry && (
              <div className="flex items-center gap-3">
                <Badge variant="outline">{profile.industry}</Badge>
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {(profile.budget_min || profile.budget_max) && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget
              </h2>
              <p className="text-gray-700">
                ${profile.budget_min || 'Any'} - ${profile.budget_max || 'Any'} / month
              </p>
            </div>
          )}

          {profile.move_in_date && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Move-in Date
              </h2>
              <p className="text-gray-700">
                {formatDate(profile.move_in_date)}
                {profile.move_in_flexible && ' (Flexible)'}
              </p>
            </div>
          )}

          {profile.work_schedule && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Work Schedule</h2>
              <Badge variant="secondary" className="capitalize">
                {profile.work_schedule}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

