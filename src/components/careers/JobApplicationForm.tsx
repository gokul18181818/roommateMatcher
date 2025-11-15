import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { JobPosting } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Upload, Loader2 } from 'lucide-react'

interface JobApplicationFormProps {
  job: JobPosting
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function JobApplicationForm({ job, open, onOpenChange, onSuccess }: JobApplicationFormProps) {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    applicant_name: user?.user_metadata?.full_name || '',
    applicant_email: user?.email || '',
    knows_unpaid: false,
    graduated_highschool: false,
    why_want_job: '',
    previous_experience: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all required fields
    if (!formData.applicant_name.trim()) {
      alert('Please enter your full name.')
      return
    }
    if (!formData.applicant_email.trim()) {
      alert('Please enter your email address.')
      return
    }
    if (!formData.knows_unpaid) {
      alert('Please confirm that you understand this is an unpaid position.')
      return
    }
    if (!formData.graduated_highschool) {
      alert('Please confirm that you have graduated high school.')
      return
    }
    if (!formData.why_want_job.trim()) {
      alert('Please explain why you want this job.')
      return
    }
    if (!formData.previous_experience.trim()) {
      alert('Please describe how your previous experience relates to this position.')
      return
    }
    if (!resumeFile) {
      alert('Please attach your resume. All fields including resume are required.')
      return
    }
    
    setLoading(true)

    try {
      // Upload resume (required)
      const fileExt = resumeFile.name.split('.').pop()
      const uniqueId = user?.id || `anonymous-${Date.now()}-${Math.random().toString(36).substring(7)}`
      const fileName = `${uniqueId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Failed to upload resume: ${uploadError.message}`)
      }

      // Store the file path
      const resumeUrl = fileName

      // Submit application
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_posting_id: job.id,
          applicant_id: user?.id || null,
          applicant_name: formData.applicant_name.trim(),
          applicant_email: formData.applicant_email.trim(),
          knows_unpaid: formData.knows_unpaid,
          graduated_highschool: formData.graduated_highschool,
          why_want_job: formData.why_want_job.trim(),
          previous_experience: formData.previous_experience.trim(),
          resume_url: resumeUrl,
        })

      if (insertError) {
        throw insertError
      }

      // Reset form
      setFormData({
        applicant_name: user?.user_metadata?.full_name || '',
        applicant_email: user?.email || '',
        knows_unpaid: false,
        graduated_highschool: false,
        why_want_job: '',
        previous_experience: '',
      })
      setResumeFile(null)
      
      onOpenChange(false)
      onSuccess?.()
      alert('Application submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting application:', error)
      alert(`Failed to submit application: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for {job.title}</DialogTitle>
          <DialogDescription>
            Please fill out the application form below. All fields including resume are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="applicant_name">Full Name *</Label>
            <Input
              id="applicant_name"
              value={formData.applicant_name}
              onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicant_email">Email *</Label>
            <Input
              id="applicant_email"
              type="email"
              value={formData.applicant_email}
              onChange={(e) => setFormData({ ...formData, applicant_email: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="knows_unpaid"
                checked={formData.knows_unpaid}
                onChange={(e) => setFormData({ ...formData, knows_unpaid: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
                required
              />
              <Label htmlFor="knows_unpaid" className="font-normal cursor-pointer">
                Do you know this is an unpaid position? *
              </Label>
            </div>
            {job.is_unpaid && !formData.knows_unpaid && (
              <p className="text-sm text-amber-600 dark:text-amber-400 ml-6">
                Note: This position is unpaid. Please confirm you understand this.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="graduated_highschool"
                checked={formData.graduated_highschool}
                onChange={(e) => setFormData({ ...formData, graduated_highschool: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
                required
              />
              <Label htmlFor="graduated_highschool" className="font-normal cursor-pointer">
                Have you graduated high school? *
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="why_want_job">Why do you want this job? *</Label>
            <Textarea
              id="why_want_job"
              value={formData.why_want_job}
              onChange={(e) => setFormData({ ...formData, why_want_job: e.target.value })}
              required
              rows={4}
              className="w-full"
              placeholder="Tell us why you're interested in this position..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previous_experience">How does your previous experience relate to this position? *</Label>
            <Textarea
              id="previous_experience"
              value={formData.previous_experience}
              onChange={(e) => setFormData({ ...formData, previous_experience: e.target.value })}
              required
              rows={4}
              className="w-full"
              placeholder="Describe your relevant experience..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Attach Your Resume *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                required
                className="w-full"
              />
              {resumeFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {resumeFile.name}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, DOC, DOCX (Max 10MB) - Required
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

