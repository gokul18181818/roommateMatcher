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
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/explore')} 
        className="mb-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Explore
      </Button>

      <Card className="border border-gray-200 shadow-lg overflow-hidden bg-white">
        <CardContent className="p-8">
          {/* Profile Header with Circular Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <Avatar
                src={profile.profile_photo_url || null}
                fallback={profile.full_name}
                className="h-36 w-36 border-4 border-white shadow-xl"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white shadow-md text-xs px-3 py-1 font-medium">
                    ✓ Verified
                  </Badge>
                </div>
              )}
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{profile.full_name}</h1>
              <p className="text-xl text-gray-500">{profile.age} years old</p>
              {profile.linkedin_profile_url && (
                <a
                  href={profile.linkedin_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mt-2 font-medium"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="text-sm">View LinkedIn Profile</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <Button
              onClick={() => bookmarkMutation.mutate()}
              variant="outline"
              className="px-6 py-2.5 border-gray-200 hover:bg-gray-50 rounded-lg font-medium"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
            <Link to={`/messages?user=${profile.id}`}>
              <Button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Briefcase className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Job Title</p>
                <p className="text-base font-semibold text-gray-900">{profile.job_title}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company</p>
                <p className="text-base font-semibold text-gray-900">{profile.company}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                <p className="text-base font-semibold text-gray-900">{profile.city}, {profile.state}</p>
              </div>
            </div>
            {profile.industry && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Badge variant="outline" className="border-gray-300 text-gray-700 font-medium">{profile.industry}</Badge>
                </div>
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed text-base">{profile.bio}</p>
            </div>
          )}

          <div className="space-y-6">
            {(profile.budget_min || profile.budget_max) && (
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Budget
                </h2>
                <p className="text-gray-700 text-base">
                  ${profile.budget_min || 'Any'} - ${profile.budget_max || 'Any'} / month
                </p>
              </div>
            )}

            {profile.move_in_date && (
              <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Move-in Date
                </h2>
                <p className="text-gray-700 text-base">
                  {formatDate(profile.move_in_date)}
                  {profile.move_in_flexible && ' (Flexible)'}
                </p>
              </div>
            )}

            {profile.work_schedule && (
              <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Work Schedule</h2>
                <Badge variant="secondary" className="capitalize text-sm px-3 py-1 bg-white border-gray-200">
                  {profile.work_schedule}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


