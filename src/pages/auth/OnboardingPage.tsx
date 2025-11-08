import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { fetchLinkedInProfileUrl } from '@/lib/linkedin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  city: z.string().min(1, 'City is required'),
  city_other: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  job_title: z.string().min(1, 'Job title is required'),
  job_title_other: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  linkedin_profile_url: z.string().url('Please enter a valid LinkedIn URL').min(1, 'LinkedIn profile URL is required'),
  bio: z.string().min(100, 'Bio must be at least 100 characters').max(500, 'Bio must be less than 500 characters'),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  move_in_date: z.string().optional(),
  move_in_flexible: z.boolean().default(false),
  industry: z.string().min(1, 'Industry is required'),
  industry_other: z.string().optional(),
  work_schedule: z.enum(['remote', 'hybrid', 'in-office']).optional(),
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

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange', // Validate on change to show errors immediately
  })

  const bioLength = watch('bio')?.length || 0
  const selectedCity = watch('city')
  const selectedJobTitle = watch('job_title')
  const selectedIndustry = watch('industry')

  // Auto-populate from LinkedIn user metadata
  useEffect(() => {
    const loadLinkedInData = async () => {
      if (!user) return
      
      // Get fresh user data from Supabase to ensure we have latest metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return
      
      const metadata = currentUser.user_metadata || {}
      const appMetadata = currentUser.app_metadata || {}
      
      // Extract LinkedIn data - LinkedIn OAuth provides data in user_metadata
      const linkedinData = appMetadata.provider === 'linkedin' ? metadata : metadata
      
      // Auto-fill name from LinkedIn (LinkedIn provides 'name' or 'full_name')
      const name = linkedinData.name || 
                   linkedinData.full_name || 
                   metadata.name || 
                   metadata.full_name ||
                   currentUser.email?.split('@')[0] || // Fallback to email username
                   ''
      if (name) {
        setValue('full_name', name)
      }
      
      // Auto-fill job title from LinkedIn (might be in 'job_title' or 'headline')
      const jobTitle = linkedinData.job_title || 
                       linkedinData.headline || 
                       metadata.job_title || 
                       metadata.headline || 
                       ''
      if (jobTitle) {
        setValue('job_title', jobTitle)
      }
      
      // Auto-fill company from LinkedIn
      const company = linkedinData.company || 
                      linkedinData.company_name || 
                      metadata.company || 
                      metadata.company_name || 
                      ''
      if (company) {
        setValue('company', company)
      }
      
      // Auto-fill location if available (LinkedIn provides 'location' or 'locality')
      const location = linkedinData.location || 
                       linkedinData.locality || 
                       metadata.location || 
                       metadata.locality || 
                       ''
      if (location) {
        // Try to parse city and state from location string
        const parts = location.split(',').map((p: string) => p.trim())
        if (parts.length >= 2) {
          setValue('city', parts[0])
          setValue('state', parts[1])
        } else if (parts.length === 1) {
          setValue('city', parts[0])
        }
      }
      
      // Auto-fill industry if available
      const industry = linkedinData.industry || 
                       metadata.industry || 
                       ''
      if (industry) {
        setValue('industry', industry)
      }
      
      // Auto-fill LinkedIn profile URL if available
      const linkedinUrl = linkedinData.profile_url || 
                          linkedinData.linkedin_url || 
                          linkedinData.url ||
                          metadata.profile_url || 
                          metadata.linkedin_url ||
                          metadata.url ||
                          ''
      if (linkedinUrl) {
        setValue('linkedin_profile_url', linkedinUrl)
      }
    }
    
    loadLinkedInData()
  }, [user, setValue])
  
  // Check if step 2 is valid (currently not used but kept for future use)
  // const isStep2Valid = () => {
  //   const bio = watch('bio')
  //   return bio && bio.length >= 150 && bio.length <= 500
  // }

  const createProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Get current user from session to ensure we have the latest auth state
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        throw new Error('Not authenticated. Please sign in again.')
      }

      // Calculate age from date of birth
      const birthDate = new Date(data.date_of_birth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      const calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age

      // Extract LinkedIn data from user metadata
      const metadata = currentUser.user_metadata || {}
      const appMetadata = currentUser.app_metadata || {}
      const linkedinData = appMetadata.provider === 'linkedin' ? metadata : {}
      
      // Get LinkedIn profile photo if available
      const profilePhotoUrl = linkedinData.avatar_url || 
                              linkedinData.picture || 
                              metadata.avatar_url || 
                              metadata.picture || 
                              currentUser.user_metadata?.avatar_url ||
                              null

      // Get LinkedIn profile URL
      // LinkedIn OAuth with OIDC provides 'sub' which is a numeric ID, not a username
      // We need to fetch the vanityName from LinkedIn API using the access token
      const linkedinId = linkedinData.sub || 
                        linkedinData.id || 
                        metadata.sub || 
                        metadata.linkedin_id ||
                        currentUser.id // Fallback to user ID if no LinkedIn ID
      
      // Use the LinkedIn URL from the form if provided, otherwise try to get it from various sources
      let linkedinProfileUrl = data.linkedin_profile_url?.trim() || null
      
      if (!linkedinProfileUrl) {
        // Try to get the actual LinkedIn profile URL from various sources first
        linkedinProfileUrl = linkedinData.profile_url || 
                            linkedinData.linkedin_url || 
                            linkedinData.url ||
                            metadata.profile_url || 
                            metadata.linkedin_url ||
                            metadata.url ||
                            null
        
        // If we don't have a URL, try to fetch it from LinkedIn API using the access token
        if (!linkedinProfileUrl) {
          console.log('Attempting to fetch LinkedIn profile URL from API...')
          const fetchedUrl = await fetchLinkedInProfileUrl()
          if (fetchedUrl) {
            linkedinProfileUrl = fetchedUrl
          }
        }
      }

      // Use "Other" field values if "Other" was selected
      const finalCity = data.city === 'Other' ? data.city_other : data.city
      const finalJobTitle = data.job_title === 'Other' ? data.job_title_other : data.job_title
      const finalIndustry = data.industry === 'Other' ? data.industry_other : data.industry

      const profileData = {
        id: currentUser.id,
        linkedin_id: linkedinId || currentUser.id,
        linkedin_profile_url: linkedinProfileUrl,
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        age: calculatedAge,
        profile_photo_url: profilePhotoUrl,
        city: finalCity,
        state: data.state,
        job_title: finalJobTitle,
        company: data.company,
        bio: data.bio,
        budget_min: data.budget_min || null,
        budget_max: data.budget_max || null,
        move_in_date: data.move_in_date || null,
        move_in_flexible: data.move_in_flexible,
        industry: finalIndustry || null,
        work_schedule: data.work_schedule || null,
        profile_completed: true,
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Profile creation error:', error)
        throw new Error(error.message || 'Failed to create profile')
      }
      return profile
    },
    onSuccess: () => {
      navigate('/explore')
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    console.log('Form submitted with data:', data)
    createProfile.mutate(data, {
      onError: (error: any) => {
        console.error('Profile creation failed:', error)
        const message = error instanceof Error ? error.message : 'Failed to create profile. Please try again.'
        setErrorMessage(message)
        setErrorDialogOpen(true)
      },
    })
  }

  const handleFormError = (errors: any) => {
    console.log('Form validation errors:', errors)
    // Get the first error message to display
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      setErrorMessage(firstError.message)
      setErrorDialogOpen(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Step {step} of 2: Tell us about yourself
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, handleFormError)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
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
                    LinkedIn Profile URL <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...register('linkedin_profile_url')}
                    type="url"
                    placeholder="https://www.linkedin.com/in/yourprofile"
                  />
                  {errors.linkedin_profile_url && <p className="text-sm text-destructive mt-1">{errors.linkedin_profile_url.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Required - Your LinkedIn profile URL
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

                <Button
                  type="button"
                  onClick={async () => {
                    const isValid = await trigger(['full_name', 'date_of_birth', 'city', 'city_other', 'state', 'job_title', 'job_title_other', 'company', 'linkedin_profile_url', 'industry', 'industry_other'])
                    if (isValid) {
                      setStep(2)
                    }
                  }}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
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
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={createProfile.isPending}
                    onClick={async () => {
                      // Trigger validation to show errors
                      await trigger()
                      console.log('Submit button clicked, errors:', errors, 'bioLength:', bioLength)
                    }}
                  >
                    {createProfile.isPending ? 'Creating Profile...' : 'Complete Profile'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-lg">Oops! Something's missing</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-relaxed">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setErrorDialogOpen(false)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg rounded-xl py-5"
            >
              Got it, let me fix that
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

