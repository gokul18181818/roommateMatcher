import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'gokulpremkumar03@gmail.com'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    
    // Handle both webhook format and direct call format
    const record = payload.record || payload

    // Get job posting details
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', record.job_posting_id)
      .single()

    if (jobError) {
      console.error('Error fetching job:', jobError)
    }

    // Create PDF content (HTML that will be converted to PDF)
    const pdfHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #666; }
            .value { margin-top: 5px; }
            .checkbox { margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Job Application</h1>
          
          <div class="section">
            <div class="label">Job Position:</div>
            <div class="value">${job?.title || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="label">Applicant Name:</div>
            <div class="value">${record.applicant_name}</div>
          </div>

          <div class="section">
            <div class="label">Applicant Email:</div>
            <div class="value">${record.applicant_email}</div>
          </div>

          <div class="section">
            <div class="checkbox">
              <div class="label">Knows Position is Unpaid:</div>
              <div class="value">${record.knows_unpaid ? 'Yes' : 'No'}</div>
            </div>
            <div class="checkbox">
              <div class="label">Graduated High School:</div>
              <div class="value">${record.graduated_highschool ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div class="section">
            <div class="label">Why they want this job:</div>
            <div class="value">${record.why_want_job.replace(/\n/g, '<br>')}</div>
          </div>

          <div class="section">
            <div class="label">Previous Experience:</div>
            <div class="value">${record.previous_experience.replace(/\n/g, '<br>')}</div>
          </div>

          <div class="section">
            <div class="label">Resume:</div>
            <div class="value">${record.resume_url ? 'Resume attached separately' : 'No resume'}</div>
          </div>

          <div class="section">
            <div class="label">Application Date:</div>
            <div class="value">${new Date(record.created_at).toLocaleString()}</div>
          </div>
        </body>
      </html>
    `

    // Convert HTML to PDF using a service or library
    // For now, we'll send HTML email with option to print as PDF
    // Or use a service like html-pdf-node, pdfkit, etc.

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CareerCrib <noreply@career-crib.com>',
        to: [ADMIN_EMAIL],
        subject: `New Job Application: ${record.applicant_name} - ${job?.title || 'Position'}`,
        html: `
          <h2>New Job Application Received</h2>
          
          <h3>Job Position:</h3>
          <p>${job?.title || 'N/A'}</p>

          <h3>Applicant Information:</h3>
          <p><strong>Name:</strong> ${record.applicant_name}</p>
          <p><strong>Email:</strong> ${record.applicant_email}</p>

          <h3>Application Details:</h3>
          <p><strong>Knows Position is Unpaid:</strong> ${record.knows_unpaid ? 'Yes' : 'No'}</p>
          <p><strong>Graduated High School:</strong> ${record.graduated_highschool ? 'Yes' : 'No'}</p>

          <h3>Why they want this job:</h3>
          <p>${record.why_want_job.replace(/\n/g, '<br>')}</p>

          <h3>Previous Experience:</h3>
          <p>${record.previous_experience.replace(/\n/g, '<br>')}</p>

          ${record.resume_url ? `
            <h3>Resume:</h3>
            <p><a href="https://anwkkoecmsobccibnysf.supabase.co/storage/v1/object/public/resumes/${record.resume_url}">Download Resume</a></p>
          ` : ''}

          <p><small>Application submitted: ${new Date(record.created_at).toLocaleString()}</small></p>
          
          <hr>
          <p><em>You can print this email as PDF or view in Supabase Dashboard</em></p>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      throw new Error(`Email failed: ${error}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

