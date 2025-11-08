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
  full_name: z.string().min(2, 'Please enter your full name'),
  date_of_birth: z.string().min(1, 'Please select your date of birth'),
  city: z.string().min(1, 'Please select your city'),
  city_other: z.string().optional(),
  state: z.string().min(1, 'Please select your state'),
  job_title: z.string().min(1, 'Please select your job title'),
  job_title_other: z.string().optional(),
  company: z.string().min(1, 'Please enter the company you work for'),
  employment_type: z.enum(['intern', 'new_grad'], { 
    required_error: 'Please select whether you are an intern or new grad',
    invalid_type_error: 'Please select whether you are an intern or new grad'
  }),
  linkedin_profile_url: z.string().url('Please enter a valid LinkedIn profile URL').min(1, 'Please enter your LinkedIn profile URL'),
  bio: z.string().min(100, 'Please tell us more about yourself (at least 100 characters)').max(500, 'Your bio is too long (maximum 500 characters)'),
  budget_min: z.number({ required_error: 'Please enter your minimum budget', invalid_type_error: 'Please enter a valid number for your minimum budget' }),
  budget_max: z.number({ required_error: 'Please enter your maximum budget', invalid_type_error: 'Please enter a valid number for your maximum budget' }),
  move_in_date: z.string().min(1, 'Please select your preferred move-in date'),
  move_in_flexible: z.boolean().default(false),
  industry: z.string().min(1, 'Please select your industry'),
  industry_other: z.string().optional(),
  work_schedule: z.enum(['remote', 'hybrid', 'in-office'], {
    required_error: 'Please select your work schedule preference',
    invalid_type_error: 'Please select your work schedule preference'
  }),
}).refine(
  (data) => {
    if (data.city === 'Other' && (!data.city_other || data.city_other.trim() === '')) {
      return false
    }
    return true
  },
  { message: 'Please enter your city name', path: ['city_other'] }
).refine(
  (data) => {
    if (data.job_title === 'Other' && (!data.job_title_other || data.job_title_other.trim() === '')) {
      return false
    }
    return true
  },
  { message: 'Please enter your job title', path: ['job_title_other'] }
).refine(
  (data) => {
    if (data.industry === 'Other' && (!data.industry_other || data.industry_other.trim() === '')) {
      return false
    }
    return true
  },
  { message: 'Please enter your industry', path: ['industry_other'] }
).refine(
  (data) => {
    if (data.budget_min && data.budget_max && data.budget_min > data.budget_max) {
      return false
    }
    return true
  },
  { message: 'Your minimum budget cannot be higher than your maximum budget', path: ['budget_max'] }
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
        employment_type: data.employment_type,
        bio: data.bio,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        move_in_date: data.move_in_date,
        move_in_flexible: data.move_in_flexible,
        industry: finalIndustry,
        work_schedule: data.work_schedule,
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
    
    // Create user-friendly error messages mapping
    const errorMessages: Record<string, string> = {
      full_name: 'Please enter your full name',
      date_of_birth: 'Please select your date of birth',
      city: 'Please select your city',
      city_other: 'Please enter your city name',
      state: 'Please select your state',
      job_title: 'Please select your job title',
      job_title_other: 'Please enter your job title',
      company: 'Please enter the company you work for',
      employment_type: 'Please select whether you are an intern or new grad',
      linkedin_profile_url: 'Please enter your LinkedIn profile URL',
      industry: 'Please select your industry',
      industry_other: 'Please enter your industry',
      bio: 'Please tell us more about yourself (at least 100 characters)',
      budget_min: 'Please enter your minimum budget',
      budget_max: 'Please enter your maximum budget',
      move_in_date: 'Please select your preferred move-in date',
      work_schedule: 'Please select your work schedule preference',
    }
    
    // Get the first error field
    const firstErrorField = Object.keys(errors)[0]
    const errorMessage = errorMessages[firstErrorField] || errors[firstErrorField]?.message || 'Please fill in all required fields'
    
    setErrorMessage(errorMessage)
    setErrorDialogOpen(true)
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
                  <label className="text-sm font-medium mb-2 block">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input {...register('full_name')} placeholder="John Doe" />
                  {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Date of Birth <span className="text-destructive">*</span>
                  </label>
                  <Input type="date" {...register('date_of_birth')} />
                  {errors.date_of_birth && <p className="text-sm text-destructive mt-1">{errors.date_of_birth.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      City <span className="text-destructive">*</span>
                    </label>
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
                    <label className="text-sm font-medium mb-2 block">
                      State <span className="text-destructive">*</span>
                    </label>
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
                  <label className="text-sm font-medium mb-2 block">
                    Job Title <span className="text-destructive">*</span>
                  </label>
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
                  <label className="text-sm font-medium mb-2 block">
                    Company <span className="text-destructive">*</span>
                  </label>
                  <Input {...register('company')} placeholder="Google" />
                  {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Employment Type <span className="text-destructive">*</span>
                  </label>
                  <select {...register('employment_type')} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select...</option>
                    <option value="intern">Intern</option>
                    <option value="new_grad">New Grad</option>
                  </select>
                  {errors.employment_type && <p className="text-sm text-destructive mt-1">{errors.employment_type.message}</p>}
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Industry <span className="text-destructive">*</span>
                  </label>
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
                    const isValid = await trigger(['full_name', 'date_of_birth', 'city', 'city_other', 'state', 'job_title', 'job_title_other', 'company', 'employment_type', 'linkedin_profile_url', 'industry', 'industry_other'])
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
                    Bio <span className="text-destructive">*</span> <span className="text-muted-foreground">({bioLength}/500)</span>
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
                    <label className="text-sm font-medium mb-2 block">
                      Budget Min ($) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      {...register('budget_min', { valueAsNumber: true })}
                      placeholder="1000"
                    />
                    {errors.budget_min && <p className="text-sm text-destructive mt-1">{errors.budget_min.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Budget Max ($) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      {...register('budget_max', { valueAsNumber: true })}
                      placeholder="2000"
                    />
                    {errors.budget_max && <p className="text-sm text-destructive mt-1">{errors.budget_max.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Move-in Date <span className="text-destructive">*</span>
                  </label>
                  <Input type="date" {...register('move_in_date')} />
                  {errors.move_in_date && <p className="text-sm text-destructive mt-1">{errors.move_in_date.message}</p>}
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
                  <label className="text-sm font-medium mb-2 block">
                    Work Schedule <span className="text-destructive">*</span>
                  </label>
                  <select {...register('work_schedule')} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select...</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="in-office">In-Office</option>
                  </select>
                  {errors.work_schedule && <p className="text-sm text-destructive mt-1">{errors.work_schedule.message}</p>}
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

