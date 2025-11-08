import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'
import { completeProfilePhotoUpload } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'

const COMMON_INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Consulting',
  'Marketing',
  'Education',
  'Engineering',
  'Sales',
  'Design',
  'Legal',
  'Other'
]

const COMMON_JOB_TITLES = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'Financial Analyst',
  'Consultant',
  'Marketing Manager',
  'Sales Representative',
  'UX/UI Designer',
  'Project Manager',
  'Business Analyst',
  'Other'
]

const COMMON_CITIES = [
  'San Francisco',
  'New York',
  'Los Angeles',
  'Seattle',
  'Austin',
  'Boston',
  'Chicago',
  'Denver',
  'Washington DC',
  'Atlanta',
  'Other'
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  city: z.string().min(1, 'City is required'),
  city_other: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  job_title: z.string().min(1, 'Job title is required'),
  job_title_other: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  employment_type: z.enum(['intern', 'new_grad']).optional().nullable(),
  bio: z.string().min(150, 'Bio must be at least 150 characters').max(500, 'Bio must be less than 500 characters'),
  budget_min: z.number().optional().nullable(),
  budget_max: z.number().optional().nullable(),
  move_in_date: z.string().optional().nullable(),
  move_in_flexible: z.boolean().default(false),
  industry: z.string().min(1, 'Industry is required'),
  industry_other: z.string().optional(),
  work_schedule: z.enum(['remote', 'hybrid', 'in-office']).optional().nullable(),
  linkedin_profile_url: z.string().url('Please enter a valid LinkedIn URL').min(1, 'LinkedIn profile URL is required'),
  instagram_handle: z.string().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.city === 'Other' && (!data.city_other || data.city_other.trim() === '')) {
      return false
    }
    return true
  },
  { message: 'Please specify your city', path: ['city_other'] }
).refine(
  (data) => {
    if (data.job_title === 'Other' && (!data.job_title_other || data.job_title_other.trim() === '')) {
      return false
    }
    return true
  },
  { message: 'Please specify your job title', path: ['job_title_other'] }
).refine(
  (data) => {
    if (data.industry === 'Other' && (!data.industry_other || data.industry_other.trim() === '')) {
      return false
    }
    return true
  },
  { message: 'Please specify your industry', path: ['industry_other'] }
)

type ProfileFormData = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      full_name: profile.full_name,
      date_of_birth: profile.date_of_birth,
      city: COMMON_CITIES.includes(profile.city) ? profile.city : 'Other',
      city_other: COMMON_CITIES.includes(profile.city) ? '' : profile.city,
      state: profile.state,
      job_title: COMMON_JOB_TITLES.includes(profile.job_title) ? profile.job_title : 'Other',
      job_title_other: COMMON_JOB_TITLES.includes(profile.job_title) ? '' : profile.job_title,
      company: profile.company,
      employment_type: profile.employment_type || null,
      bio: profile.bio,
      budget_min: profile.budget_min,
      budget_max: profile.budget_max,
      move_in_date: profile.move_in_date || '',
      move_in_flexible: profile.move_in_flexible,
      industry: profile.industry && COMMON_INDUSTRIES.includes(profile.industry) ? profile.industry : (profile.industry ? 'Other' : ''),
      industry_other: profile.industry && !COMMON_INDUSTRIES.includes(profile.industry) ? profile.industry : '',
      work_schedule: profile.work_schedule,
      linkedin_profile_url: profile.linkedin_profile_url || '',
      instagram_handle: profile.instagram_handle || '',
    } : undefined,
  })

  const bioLength = watch('bio')?.length || 0
  const selectedCity = watch('city')
  const selectedJobTitle = watch('job_title')
  const selectedIndustry = watch('industry')

  const handlePhotoUpload = async (file: File) => {
    if (!user) throw new Error('Not authenticated')
    await completeProfilePhotoUpload(user.id, file, profile?.profile_photo_url || undefined)
    // Invalidate profile query to refresh the data
    queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
  }

  const onSubmit = (data: ProfileFormData) => {
    // Use "Other" field values if "Other" was selected
    const finalCity = data.city === 'Other' ? data.city_other : data.city
    const finalJobTitle = data.job_title === 'Other' ? data.job_title_other : data.job_title
    const finalIndustry = data.industry === 'Other' ? data.industry_other : data.industry

    // Process Instagram handle - remove @ symbols and trim, set to null if empty
    const processedInstagramHandle = data.instagram_handle?.trim().replace(/^@+/g, '') || null
    const finalInstagramHandle = processedInstagramHandle && processedInstagramHandle.length > 0 
      ? processedInstagramHandle 
      : null

    const submitData = {
      ...data,
      city: finalCity,
      job_title: finalJobTitle,
      industry: finalIndustry,
      instagram_handle: finalInstagramHandle,
    }

    updateProfile.mutate(submitData, {
      onSuccess: () => {
        // Invalidate and refetch profile data to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        
        // Navigate back to profile page after successful save
        navigate('/my-profile', { replace: true })
      },
      onError: (error) => {
        console.error('Failed to update profile:', error)
        // You could add a toast notification here if needed
      },
    })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Photo Upload */}
            <div className="flex justify-center py-6 border-b border-border/50">
              <ProfilePhotoUpload
                currentPhotoUrl={profile?.profile_photo_url || null}
                onUpload={handlePhotoUpload}
                fallbackName={profile?.full_name || 'User'}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input {...register('full_name')} placeholder="John Doe" />
              {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date of Birth</label>
              <Input type="date" {...register('date_of_birth')} />
              {errors.date_of_birth && <p className="text-sm text-destructive mt-1">{errors.date_of_birth.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <select {...register('city')} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select city...</option>
                  {COMMON_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                {selectedCity === 'Other' && (
                  <div className="mt-2">
                    <Input {...register('city_other')} placeholder="Enter your city" />
                    {errors.city_other && <p className="text-sm text-destructive mt-1">{errors.city_other.message}</p>}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <select {...register('state')} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select state...</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-sm text-destructive mt-1">{errors.state.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Job Title</label>
              <select {...register('job_title')} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select job title...</option>
                {COMMON_JOB_TITLES.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
              {errors.job_title && <p className="text-sm text-destructive mt-1">{errors.job_title.message}</p>}
              {selectedJobTitle === 'Other' && (
                <div className="mt-2">
                  <Input {...register('job_title_other')} placeholder="Enter your job title" />
                  {errors.job_title_other && <p className="text-sm text-destructive mt-1">{errors.job_title_other.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <Input {...register('company')} placeholder="Google" />
              {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Employment Type (Optional)
              </label>
              <select {...register('employment_type')} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="intern">Intern</option>
                <option value="new_grad">New Grad</option>
              </select>
              {errors.employment_type && <p className="text-sm text-destructive mt-1">{errors.employment_type.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Optional - Are you an intern or new grad?
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <select {...register('industry')} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select industry...</option>
                {COMMON_INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && <p className="text-sm text-destructive mt-1">{errors.industry.message}</p>}
              {selectedIndustry === 'Other' && (
                <div className="mt-2">
                  <Input {...register('industry_other')} placeholder="Enter your industry" />
                  {errors.industry_other && <p className="text-sm text-destructive mt-1">{errors.industry_other.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                LinkedIn Profile URL <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('linkedin_profile_url')}
                placeholder="https://www.linkedin.com/in/your-profile/"
                type="url"
              />
              {errors.linkedin_profile_url && (
                <p className="text-sm text-destructive mt-1">{errors.linkedin_profile_url.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Required - Your LinkedIn profile URL
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Instagram Handle (Optional)
              </label>
              <Input
                {...register('instagram_handle')}
                placeholder="@yourhandle"
                type="text"
              />
              {errors.instagram_handle && (
                <p className="text-sm text-destructive mt-1">{errors.instagram_handle.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Optional - Your Instagram handle (without @)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Bio <span className="text-muted-foreground">({bioLength}/500)</span>
              </label>
              <Textarea
                {...register('bio')}
                placeholder="Tell us about yourself, your interests, and what you're looking for in a roommate..."
                rows={6}
                className="resize-none"
              />
              {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 150 characters required
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Budget Min ($)</label>
                <Input
                  type="number"
                  {...register('budget_min', { valueAsNumber: true })}
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Budget Max ($)</label>
                <Input
                  type="number"
                  {...register('budget_max', { valueAsNumber: true })}
                  placeholder="2000"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Move-in Date (Optional)</label>
              <Input type="date" {...register('move_in_date')} />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="flexible"
                {...register('move_in_flexible')}
                className="rounded border-gray-300"
              />
              <label htmlFor="flexible" className="text-sm">
                Flexible on move-in date
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Work Schedule (Optional)</label>
              <select {...register('work_schedule')} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="in-office">In-Office</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/my-profile')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

