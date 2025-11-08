import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { MessageSquare, Mail, Send } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const feedbackSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

export default function FeedbackPage() {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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

    try {
      // Create mailto link with pre-filled content
      const recipient = 'gokulpremkumar03@gmail.com'
      const subject = encodeURIComponent(data.subject)
      const body = encodeURIComponent(
        `Feedback from CareerCrib:\n\n${data.message}\n\n---\nUser Email: ${data.email || user?.email || 'Not provided'}\nUser ID: ${user?.id || 'Not provided'}`
      )
      
      const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`
      
      // Open email client
      window.location.href = mailtoLink
      
      // Show success message
      setShowSuccess(true)
      reset()
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to open email client. Please send your feedback directly to gokulpremkumar03@gmail.com')
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
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <Mail className="h-5 w-5 text-green-500" />
          <p className="text-green-500 text-sm">
            Your email client should open shortly. If it doesn't, please send your feedback directly to{' '}
            <a href="mailto:gokulpremkumar03@gmail.com" className="underline font-medium">
              gokulpremkumar03@gmail.com
            </a>
          </p>
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
                Opening email...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Feedback
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Your email client will open with a pre-filled message
          </p>
        </div>
      </form>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> If your email client doesn't open automatically, please send your feedback directly to{' '}
          <a href="mailto:gokulpremkumar03@gmail.com" className="text-primary hover:underline font-medium">
            gokulpremkumar03@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}

