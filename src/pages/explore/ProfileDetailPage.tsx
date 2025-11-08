import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, DollarSign, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CompanyLogo from '@/components/ui/CompanyLogo'
import JobTitleIcon from '@/components/ui/JobTitleIcon'

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

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
        className="mb-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Explore
      </Button>

      <Card className="border shadow-lg overflow-hidden bg-card">
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
              <h1 className="text-4xl font-bold text-card-foreground tracking-tight">{profile.full_name}</h1>
              <p className="text-xl text-muted-foreground">{profile.age} years old</p>
              <div className="flex flex-col items-center gap-2 mt-2">
                {profile.linkedin_profile_url && (
                  <a
                    href={profile.linkedin_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <img src="/linkedin-logo.svg" alt="LinkedIn" className="h-5 w-5" />
                    <span className="text-sm">View LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-8">
            <Link to={`/messages?user=${profile.id}`}>
              <Button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-sm hover:shadow-md transition-all">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4 p-4 bg-muted rounded-xl">
              <div className="p-2 bg-card rounded-lg shadow-sm">
                <JobTitleIcon jobTitle={profile.job_title} className="text-muted-foreground" size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Job Title</p>
                <p className="text-base font-semibold text-card-foreground">{profile.job_title}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted rounded-xl">
              <div className="p-2 bg-card rounded-lg shadow-sm flex items-center justify-center">
                <CompanyLogo companyName={profile.company} size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Company</p>
                <p className="text-base font-semibold text-card-foreground">{profile.company}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted rounded-xl">
              <div className="p-2 bg-card rounded-lg shadow-sm">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Location</p>
                <p className="text-base font-semibold text-card-foreground">{profile.city}, {profile.state}</p>
              </div>
            </div>
            {profile.employment_type && (
              <div className="flex items-start gap-4 p-4 bg-muted rounded-xl">
                <div className="p-2 bg-card rounded-lg shadow-sm">
                  <Badge variant="outline" className="font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {profile.employment_type === 'intern' ? 'Intern' : 'New Grad'}
                  </Badge>
                </div>
              </div>
            )}
            {profile.industry && (
              <div className="flex items-start gap-4 p-4 bg-muted rounded-xl">
                <div className="p-2 bg-card rounded-lg shadow-sm">
                  <Badge variant="outline" className="font-medium">{profile.industry}</Badge>
                </div>
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">About</h2>
              <p className="text-card-foreground/90 leading-relaxed text-base">{profile.bio}</p>
            </div>
          )}

          <div className="space-y-6">
            {(profile.budget_min || profile.budget_max) && (
              <div className="p-5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h2 className="text-lg font-semibold text-card-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Budget
                </h2>
                <p className="text-card-foreground/90 text-base">
                  ${profile.budget_min || 'Any'} - ${profile.budget_max || 'Any'} / month
                </p>
              </div>
            )}

            {profile.move_in_date && (
              <div className="p-5 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/30">
                <h2 className="text-lg font-semibold text-card-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Move-in Date
                </h2>
                <p className="text-card-foreground/90 text-base">
                  {formatDate(profile.move_in_date)}
                  {profile.move_in_flexible && ' (Flexible)'}
                </p>
              </div>
            )}

            {profile.work_schedule && (
              <div className="p-5 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <h2 className="text-lg font-semibold text-card-foreground mb-2">Work Schedule</h2>
                <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
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


