import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  job_title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  bio: z.string().min(150, 'Bio must be at least 150 characters').max(500, 'Bio must be less than 500 characters'),
  budget_min: z.number().optional().nullable(),
  budget_max: z.number().optional().nullable(),
  move_in_date: z.string().optional().nullable(),
  move_in_flexible: z.boolean().default(false),
  industry: z.string().optional().nullable(),
  work_schedule: z.enum(['remote', 'hybrid', 'in-office']).optional().nullable(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      full_name: profile.full_name,
      date_of_birth: profile.date_of_birth,
      city: profile.city,
      state: profile.state,
      job_title: profile.job_title,
      company: profile.company,
      bio: profile.bio,
      budget_min: profile.budget_min,
      budget_max: profile.budget_max,
      move_in_date: profile.move_in_date || '',
      move_in_flexible: profile.move_in_flexible,
      industry: profile.industry || '',
      work_schedule: profile.work_schedule,
    } : undefined,
  })

  const bioLength = watch('bio')?.length || 0

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        navigate('/my-profile')
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <Input {...register('city')} placeholder="San Francisco" />
                {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Input {...register('state')} placeholder="CA" />
                {errors.state && <p className="text-sm text-destructive mt-1">{errors.state.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Job Title</label>
                <Input {...register('job_title')} placeholder="Software Engineer" />
                {errors.job_title && <p className="text-sm text-destructive mt-1">{errors.job_title.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Input {...register('company')} placeholder="Google" />
                {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Industry (Optional)</label>
              <Input {...register('industry')} placeholder="Technology" />
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

