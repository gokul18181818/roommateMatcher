import { Link } from 'react-router-dom'
import { Profile } from '@/types'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, Building2 } from 'lucide-react'
import { truncateText } from '@/lib/utils'

interface UserCardProps {
  profile: Profile
  currentUserId?: string
}

export default function UserCard({ profile, currentUserId }: UserCardProps) {
  if (profile.id === currentUserId) return null

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md overflow-hidden">
      <Link to={`/profile/${profile.id}`} className="block">
        <div className="relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
            {profile.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={profile.full_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar
                  src={null}
                  fallback={profile.full_name}
                  className="h-24 w-24"
                />
              </div>
            )}
          </div>
          {profile.is_verified && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="bg-blue-600">
                Verified
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{profile.full_name}</h3>
            <p className="text-sm text-muted-foreground">{profile.age} years old</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{profile.job_title}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{profile.company}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{profile.city}, {profile.state}</span>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {truncateText(profile.bio, 100)}
            </p>
          )}

          {profile.industry && (
            <Badge variant="outline" className="text-xs">
              {profile.industry}
            </Badge>
          )}
        </div>
      </Link>

      <div className="px-4 pb-4 flex gap-2">
        <Link 
          to={`/messages?user=${profile.id}`} 
          className="flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button className="w-full">Message</Button>
        </Link>
      </div>
    </Card>
  )
}

