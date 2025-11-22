import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { JobApplication, JobPosting } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Mail, FileText, Calendar, Lock, ArrowLeft, Briefcase, Star, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

const ADMIN_PASSWORD = 'flash1818$'

export default function ApplicationsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<(JobApplication & { job: JobPosting | null })[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated')
    const savedJobId = sessionStorage.getItem('admin_selected_job_id')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      loadJobPostings()
      if (savedJobId) {
        setSelectedJobId(savedJobId)
        loadApplications(savedJobId)
      }
    }
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_authenticated', 'true')
      setPasswordError('')
      loadJobPostings()
    } else {
      setPasswordError('Incorrect password')
      setPassword('')
    }
  }

  const loadJobPostings = async () => {
    setLoadingJobs(true)
    try {
      const { data: jobs, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setJobPostings(jobs || [])
      setError(null)
    } catch (error) {
      console.error('Error loading job postings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setLoadingJobs(false)
    }
  }

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId)
    sessionStorage.setItem('admin_selected_job_id', jobId)
    loadApplications(jobId)
  }

  const handleBackToJobs = () => {
    setSelectedJobId(null)
    setApplications([])
    sessionStorage.removeItem('admin_selected_job_id')
  }

  const loadApplications = async (jobId: string) => {
    setLoading(true)
    try {
      const { data: apps, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_postings (*)
        `)
        .eq('job_posting_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Loaded applications:', apps)

      if (!apps || apps.length === 0) {
        setApplications([])
        setError(null)
        return
      }

      // Handle the relationship - job_postings might be an array or object
      const mappedApps = (apps || []).map((app: any) => {
        // job_postings relationship might return as array or single object
        const jobPosting = Array.isArray(app.job_postings) 
          ? app.job_postings[0] || null
          : app.job_postings || null

        return {
          ...app,
          job: jobPosting,
        }
      })

      console.log('Mapped applications:', mappedApps)
      setApplications(mappedApps)
      setError(null)
    } catch (error) {
      console.error('Error loading applications:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      console.error('Full error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Application ID',
      'Job Title',
      'Applicant Name',
      'Applicant Email',
      'Knows Unpaid',
      'Graduated High School',
      'Why Want Job',
      'Previous Experience',
      'Resume URL',
      'Status',
      'Applied Date',
    ]

    const rows = applications.map((app) => [
      app.id,
      app.job?.title || 'N/A',
      app.applicant_name,
      app.applicant_email,
      app.knows_unpaid ? 'Yes' : 'No',
      app.graduated_highschool ? 'Yes' : 'No',
      app.why_want_job,
      app.previous_experience,
      app.resume_url ? `https://${import.meta.env.VITE_SUPABASE_URL?.replace('https://', '').split('.')[0]}.supabase.co/storage/v1/object/public/resumes/${app.resume_url}` : 'N/A',
      app.status,
      new Date(app.created_at).toLocaleString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `job-applications-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getResumeUrl = (resumeUrl: string | null) => {
    if (!resumeUrl) return null
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const projectRef = supabaseUrl?.replace('https://', '').split('.')[0]
    return `https://${projectRef}.supabase.co/storage/v1/object/public/resumes/${resumeUrl}`
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    setUpdatingStatus(applicationId)
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      )
    } catch (error) {
      console.error('Error updating status:', error)
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
            <p className="text-muted-foreground text-center">
              Enter password to view job applications
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                className="w-full"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-500">{passwordError}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Access Admin Panel
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  // Job selection screen
  if (!selectedJobId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Select a Job Posting</h1>
            <p className="text-muted-foreground">
              Choose which job's applications you want to view
            </p>
          </div>

          {error && (
            <Card className="p-6 mb-4 border-red-500 bg-red-50 dark:bg-red-950">
              <p className="text-red-600 dark:text-red-400 font-medium">Error:</p>
              <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
            </Card>
          )}

          {loadingJobs ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading job postings...</p>
            </div>
          ) : jobPostings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No job postings found.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobPostings.map((job) => (
                <Card
                  key={job.id}
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleJobSelect(job.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium">Department:</span> {job.department}</p>
                        <p><span className="font-medium">Location:</span> {job.location}</p>
                        <p><span className="font-medium">Type:</span> {job.type}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Applications
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Applications list screen
  const selectedJob = jobPostings.find(j => j.id === selectedJobId)

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToJobs}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {selectedJob?.title || 'Job Applications'}
            </h1>
            <p className="text-muted-foreground">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {applications.length > 0 && (
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        )}
      </div>

      {error && (
        <Card className="p-6 mb-4 border-red-500 bg-red-50 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400 font-medium">Error loading applications:</p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No applications for this job yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {app.applicant_name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {app.applicant_email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    app.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500' :
                    app.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                    app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                {app.status !== 'reviewed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateApplicationStatus(app.id, 'reviewed')}
                    disabled={updatingStatus === app.id}
                    className="flex items-center gap-2"
                  >
                    <Star className={`h-4 w-4 ${app.status === 'reviewed' ? 'fill-current' : ''}`} />
                    Shortlist
                  </Button>
                )}
                {app.status !== 'accepted' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateApplicationStatus(app.id, 'accepted')}
                    disabled={updatingStatus === app.id}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:border-green-500"
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                )}
                {app.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateApplicationStatus(app.id, 'rejected')}
                    disabled={updatingStatus === app.id}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-500"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                )}
                {app.status === 'reviewed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateApplicationStatus(app.id, 'pending')}
                    disabled={updatingStatus === app.id}
                    className="flex items-center gap-2"
                  >
                    Remove from Shortlist
                  </Button>
                )}
                {updatingStatus === app.id && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Knows Position is Unpaid:</p>
                  <p className="text-muted-foreground">{app.knows_unpaid ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Graduated High School:</p>
                  <p className="text-muted-foreground">{app.graduated_highschool ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-1">Why they want this job:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{app.why_want_job}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-1">Previous Experience:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{app.previous_experience}</p>
              </div>

              {app.resume_url && (
                <div>
                  <a
                    href={getResumeUrl(app.resume_url) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
