import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit, MapPin, Calendar, DollarSign, Trash2 } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { formatDate } from '@/lib/utils'
import CompanyLogo from '@/components/ui/CompanyLogo'
import JobTitleIcon from '@/components/ui/JobTitleIcon'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { data: profile, isLoading } = useProfile()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const deleteAccount = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      // Delete profile data (this will cascade delete related data due to ON DELETE CASCADE)
      // Note: The auth user account itself will remain in Supabase auth.users table
      // but all profile data, messages, conversations, etc. will be deleted
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        throw new Error(profileError.message || 'Failed to delete account')
      }

      // Sign out the user
      await signOut()
      
      return true
    },
    onSuccess: async () => {
      navigate('/login')
    },
    onError: async (error: any) => {
      console.error('Account deletion error:', error)
      // Still try to sign out even if deletion fails
      await signOut()
      navigate('/login')
    },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Profile not found</p>
        <Link to="/onboarding">
          <Button className="w-full">Complete Your Profile</Button>
        </Link>
      </div>
    )
  }

  const completionPercentage = calculateCompletion(profile)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Profile {completionPercentage}% complete
          </p>
        </div>
        <Link to="/my-profile/edit">
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <Avatar
                src={profile.profile_photo_url || undefined}
                fallback={profile.full_name}
                className="h-32 w-32 border-4 border-white shadow-xl"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge variant="default" className="bg-blue-600">Verified</Badge>
                </div>
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-card-foreground mb-1">{profile.full_name}</h2>
              <p className="text-lg text-muted-foreground mb-3">{profile.age} years old</p>
              <div className="flex flex-col items-center gap-2">
                {profile.linkedin_profile_url ? (
                  <a
                    href={profile.linkedin_profile_url.startsWith('http') ? profile.linkedin_profile_url : `https://${profile.linkedin_profile_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      const url = profile.linkedin_profile_url?.startsWith('http') 
                        ? profile.linkedin_profile_url 
                        : `https://${profile.linkedin_profile_url}`
                      console.log('Opening LinkedIn URL:', url)
                      if (!url || url === 'https://' || url === 'http://') {
                        e.preventDefault()
                        console.error('Invalid LinkedIn URL:', profile.linkedin_profile_url)
                        return false
                      }
                    }}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer underline z-[60] relative"
                    style={{ position: 'relative', zIndex: 60 }}
                  >
                    <img src="/linkedin-logo.svg" alt="LinkedIn" className="h-5 w-5" />
                    <span className="text-sm font-medium">View LinkedIn Profile</span>
                  </a>
                ) : (
                  <Link
                    to="/my-profile/edit"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    <span>Add LinkedIn Profile</span>
                  </Link>
                )}
                {profile.instagram_handle && typeof profile.instagram_handle === 'string' && profile.instagram_handle.trim().length > 0 ? (
                  <a
                    href={`https://www.instagram.com/${profile.instagram_handle.replace(/^@+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer underline z-[60] relative"
                    style={{ position: 'relative', zIndex: 60 }}
                  >
                    <InstagramIcon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">@{profile.instagram_handle.replace(/^@+/g, '')}</span>
                  </a>
                ) : (
                  <Link
                    to="/my-profile/edit"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    <InstagramIcon className="h-5 w-5 text-muted-foreground" />
                    <span>Add Instagram</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <JobTitleIcon jobTitle={profile.job_title} className="text-muted-foreground" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Job Title</p>
                <p className="font-medium">{profile.job_title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CompanyLogo companyName={profile.company} size={24} />
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
            {profile.employment_type && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  {profile.employment_type === 'intern' ? 'Intern' : 'New Grad'}
                </Badge>
              </div>
            )}
            {profile.industry && (
              <div className="flex items-center gap-3">
                <Badge variant="outline">{profile.industry}</Badge>
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">About</h3>
              <p className="text-card-foreground/90 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {(profile.budget_min || profile.budget_max) && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-card-foreground">
                <DollarSign className="h-5 w-5" />
                Budget
              </h3>
              <p className="text-card-foreground/90">
                ${profile.budget_min || 'Any'} - ${profile.budget_max || 'Any'} / month
              </p>
            </div>
          )}

          {profile.move_in_date && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-card-foreground">
                <Calendar className="h-5 w-5" />
                Move-in Date
              </h3>
              <p className="text-card-foreground/90">
                {formatDate(profile.move_in_date)}
                {profile.move_in_flexible && ' (Flexible)'}
              </p>
            </div>
          )}

          {profile.work_schedule && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Work Schedule</h3>
              <Badge variant="secondary" className="capitalize">
                {profile.work_schedule}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings Section */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This will permanently delete:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc list-inside text-sm text-muted-foreground mb-4 space-y-1">
            <li>Your profile and all profile information</li>
            <li>All your messages and conversations</li>
            <li>All your bookmarks</li>
            <li>All your account data</li>
          </ul>
          <p className="text-sm font-medium text-destructive mb-4">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteAccount.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteAccount.mutate()}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? 'Deleting...' : 'Yes, Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function calculateCompletion(profile: any): number {
  const fields = [
    'full_name',
    'date_of_birth',
    'city',
    'state',
    'job_title',
    'company',
    'bio',
  ]
  
  const completed = fields.filter(field => profile[field]).length
  return Math.round((completed / fields.length) * 100)
}

