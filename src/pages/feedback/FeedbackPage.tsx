import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import emailjs from '@emailjs/browser'
import { Button } from '@/components/ui/button'
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const feedbackSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

// EmailJS configuration - these will need to be set in environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

export default function FeedbackPage() {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      subject: '',
      message: '',
      email: user?.email || '',
    },
  })

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true)
    setShowSuccess(false)
    setError(null)

    try {
      // Check if EmailJS is configured
      const missingVars = []
      if (!EMAILJS_SERVICE_ID) missingVars.push('VITE_EMAILJS_SERVICE_ID')
      if (!EMAILJS_TEMPLATE_ID) missingVars.push('VITE_EMAILJS_TEMPLATE_ID')
      if (!EMAILJS_PUBLIC_KEY) missingVars.push('VITE_EMAILJS_PUBLIC_KEY')
      
      if (missingVars.length > 0) {
        throw new Error(`Email service configuration missing: ${missingVars.join(', ')}. Please ensure environment variables are set and the site has been redeployed.`)
      }

      // Prepare email template parameters
      const templateParams = {
        to_email: 'gokulpremkumar03@gmail.com',
        from_name: data.email || user?.email || 'Anonymous User',
        from_email: data.email || user?.email || 'noreply@careercrib.com',
        subject: `CareerCrib Feedback: ${data.subject}`,
        message: data.message,
        user_id: user?.id || 'Not provided',
        user_email: data.email || user?.email || 'Not provided',
        reply_to: data.email || user?.email || 'noreply@careercrib.com',
      }

      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )

      // Show success message
      setShowSuccess(true)
      reset()
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (err: any) {
      console.error('Error sending feedback:', err)
      setError(err.text || err.message || 'Failed to send feedback. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          We'd love to hear your thoughts! Your feedback helps us improve CareerCrib.
        </p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-500 font-medium text-sm mb-1">Feedback sent successfully!</p>
            <p className="text-green-500/80 text-sm">
              Thank you for your feedback. We'll review it and get back to you if needed.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-500 font-medium text-sm mb-1">Error sending feedback</p>
            <p className="text-red-500/80 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            {...register('subject')}
            placeholder="What's your feedback about?"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
            disabled={isSubmitting}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
            Message
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={8}
            placeholder="Tell us what you think, what you'd like to see improved, or any issues you've encountered..."
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground resize-none"
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Your Email (optional)
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder={user?.email || 'your.email@example.com'}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            We'll use this to follow up if needed. If left empty, we'll use your account email.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Send Feedback
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Your feedback will be sent directly to our team
          </p>
        </div>
      </form>
    </div>
  )
}
