import { Link } from 'react-router-dom'
import { Profile } from '@/types'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, DollarSign } from 'lucide-react'
import { truncateText } from '@/lib/utils'
import CompanyLogo from '@/components/ui/CompanyLogo'
import JobTitleIcon from '@/components/ui/JobTitleIcon'

interface UserCardProps {
  profile: Profile
  currentUserId?: string
}

export default function UserCard({ profile, currentUserId }: UserCardProps) {
  if (profile.id === currentUserId) return null

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden bg-card shadow-md hover:shadow-xl rounded-2xl">
      <Link to={`/profile/${profile.id}`} className="block">
        <div className="pt-8 pb-5 px-6 flex flex-col items-center relative bg-gradient-to-br from-indigo-50/50 dark:from-indigo-950/30 via-purple-50/50 dark:via-purple-950/30 to-pink-50/50 dark:to-pink-950/30">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <Avatar
              src={profile.profile_photo_url || null}
              fallback={profile.full_name}
              className="h-28 w-28 border-4 border-white shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-300"
            />
            {profile.is_verified && (
              <div className="absolute -bottom-1 right-0 z-20">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg text-[10px] px-2.5 py-1 font-semibold rounded-full border-2 border-white">
                  ✓
                </Badge>
              </div>
            )}
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-xl text-card-foreground leading-tight">{profile.full_name}</h3>
            <p className="text-sm text-muted-foreground font-medium">{profile.age} years old</p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2.5 text-sm">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <JobTitleIcon jobTitle={profile.job_title} className="text-indigo-600 dark:text-indigo-400" size={16} />
              </div>
              <span className="text-card-foreground font-semibold leading-relaxed text-center">{profile.job_title}</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm">
              <CompanyLogo companyName={profile.company} size={20} className="p-0.5" />
              <span className="text-muted-foreground leading-relaxed text-center font-medium">{profile.company}</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm">
              <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <MapPin className="h-4 w-4 text-pink-600 dark:text-pink-400 flex-shrink-0" />
              </div>
              <span className="text-muted-foreground leading-relaxed text-center font-medium">{profile.city}, {profile.state}</span>
            </div>
            {(profile.budget_min || profile.budget_max) && (
              <div className="flex items-center justify-center gap-2.5 text-sm">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                </div>
                <span className="text-muted-foreground leading-relaxed text-center font-medium">
                  ${profile.budget_min || '?'} - ${profile.budget_max || '?'} / month
                </span>
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 text-center pt-2">
              {truncateText(profile.bio, 80)}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {profile.industry && (
              <Badge className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0 rounded-full">
                {profile.industry}
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="px-6 pb-6 pt-0 space-y-3">
        {profile.linkedin_profile_url && (
          <a
            href={profile.linkedin_profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors text-sm font-semibold text-primary hover:text-primary/80"
          >
            <img src="/linkedin-logo.svg" alt="LinkedIn" className="h-4 w-4" />
            <span>View LinkedIn Profile</span>
          </a>
        )}
        <Link
          to={`/messages?user=${profile.id}`}
          className="block"
        >
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 text-base">
            Message
          </Button>
        </Link>
      </div>
    </Card>
  )
}
