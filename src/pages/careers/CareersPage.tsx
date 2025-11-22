import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin, Clock, DollarSign, Building2, Loader2 } from 'lucide-react'
import { JobPosting } from '@/types'
import { supabase } from '@/lib/supabase'
import { JobApplicationForm } from '@/components/careers/JobApplicationForm'

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data: jobPostings, isLoading } = useQuery({
    queryKey: ['job-postings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as JobPosting[]
    },
  })

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedJob(null)
  }
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-3 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Careers
          </h1>
          <p className="text-muted-foreground text-xl font-medium">
            Join our team and help shape the future of professional networking
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : jobPostings && jobPostings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobPostings.map((job) => (
            <Card key={job.id} className="hover:shadow-xl transition-shadow duration-300 border-2 flex flex-col h-full">
              <CardHeader className="space-y-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-2xl font-bold text-card-foreground">{job.title}</CardTitle>
                    <CardDescription className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span>{job.department}</span>
                    </CardDescription>
                  </div>
                  <Briefcase className="h-8 w-8 text-indigo-500 dark:text-indigo-400 flex-shrink-0 ml-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span className={job.is_unpaid ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>{job.salary}</span>
                  </div>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {job.description.split('\n\n').map((paragraph, idx) => {
                      const trimmed = paragraph.trim()
                      if (!trimmed) return null
                      
                      // Normalize heading text (remove all caps, make title case)
                      const normalizeHeading = (text: string) => {
                        const cleaned = text.replace(/^[:\-•]\s*/, '').trim()
                        // If text is all caps, convert to title case
                        if (cleaned === cleaned.toUpperCase() && cleaned.length > 1) {
                          return cleaned
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ')
                        }
                        return cleaned
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ')
                      }
                      
                      // Normalize paragraph text (convert all caps to sentence case)
                      const normalizeText = (text: string) => {
                        // If entire text is uppercase and has multiple words, convert to sentence case
                        if (text === text.toUpperCase() && text.length > 15 && text.split(/\s+/).length > 2) {
                          return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
                        }
                        // If it's a short all-caps phrase, convert to title case
                        if (text === text.toUpperCase() && text.length > 3 && text.length <= 15) {
                          return text.split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ')
                        }
                        return text
                      }
                      
                      // Check if it's a section heading
                      const isHeading = trimmed.match(/^(Company Description|Role Description|Tech Stack|Ideal Candidate|Key Responsibilities|Requirements)/i)
                      
                      if (isHeading) {
                        const lines = paragraph.split('\n')
                        const title = normalizeHeading(lines[0])
                        const content = lines.slice(1).join('\n').trim()
                        
                        return (
                          <div key={idx} className="space-y-3 mb-6 last:mb-0">
                            <h4 className="font-medium text-sm text-card-foreground mb-3">
                              {title}
                            </h4>
                            {content && (
                              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                                {content.split('\n').filter(line => line.trim()).map((line, lineIdx) => {
                                  const trimmedLine = line.trim()
                                  // Check if it's a bullet point or list item
                                  if (trimmedLine.match(/^[•\-\d+\.]\s+/)) {
                                    const bulletText = trimmedLine.replace(/^[•\-\d+\.]\s+/, '')
                                    return (
                                      <div key={lineIdx} className="flex items-start gap-3 pl-1">
                                        <span className="text-indigo-500 dark:text-indigo-400 mt-1 text-xs flex-shrink-0">•</span>
                                        <span className="flex-1 leading-relaxed">{normalizeText(bulletText)}</span>
                                      </div>
                                    )
                                  }
                                  return (
                                    <p key={lineIdx} className="leading-relaxed">
                                      {normalizeText(trimmedLine)}
                                    </p>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      }
                      
                      // Regular paragraph - split into sentences for better readability
                      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim())
                      
                      return (
                        <div key={idx} className="text-sm text-muted-foreground leading-relaxed space-y-3 mb-5 last:mb-0">
                          {paragraph.split('\n').filter(line => line.trim()).map((line, lineIdx) => {
                            const trimmedLine = line.trim()
                            if (!trimmedLine) return null
                            
                            // Check if it's a bullet point
                            if (trimmedLine.match(/^[•\-\d+\.]\s+/)) {
                              const bulletText = trimmedLine.replace(/^[•\-\d+\.]\s+/, '')
                              return (
                                <div key={lineIdx} className="flex items-start gap-3 pl-1">
                                  <span className="text-indigo-500 dark:text-indigo-400 mt-1 text-xs flex-shrink-0">•</span>
                                  <span className="flex-1 leading-relaxed">{normalizeText(bulletText)}</span>
                                </div>
                              )
                            }
                            
                            return (
                              <p key={lineIdx} className="leading-relaxed">
                                {normalizeText(trimmedLine)}
                              </p>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <h4 className="font-semibold text-base text-card-foreground">Key Responsibilities:</h4>
                  <ul className="space-y-2.5">
                    {job.responsibilities.map((responsibility, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                        <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 font-bold">•</span>
                        <span className="leading-relaxed">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <h4 className="font-semibold text-base text-card-foreground">Requirements:</h4>
                  <ul className="space-y-2.5">
                    {job.requirements.map((requirement, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                        <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 font-bold">•</span>
                        <span className="leading-relaxed">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4 space-y-4 border-t border-border">
                  {job.is_unpaid && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
                        <span>⚠️</span>
                        <span>This is an unpaid position</span>
                      </p>
                    </div>
                  )}
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6 text-base"
                    onClick={() => handleApplyClick(job)}
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-card rounded-2xl shadow-xl">
            <div className="max-w-md mx-auto space-y-4">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-card-foreground text-xl font-bold">No job postings available</p>
              <p className="text-muted-foreground text-base">Check back later for new opportunities.</p>
            </div>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobApplicationForm
          job={selectedJob}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

