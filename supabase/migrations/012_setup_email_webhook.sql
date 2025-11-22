-- Setup email notification for job applications
-- This creates a database webhook that sends an email when a new application is submitted

-- Create function to send email via Supabase Edge Function
CREATE OR REPLACE FUNCTION notify_job_application_email()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://anwkkoecmsobccibnysf.supabase.co/functions/v1/send-application-email';
  payload JSONB;
BEGIN
  -- Build payload with application data
  payload := jsonb_build_object(
    'record', jsonb_build_object(
      'id', NEW.id,
      'job_posting_id', NEW.job_posting_id,
      'applicant_id', NEW.applicant_id,
      'applicant_name', NEW.applicant_name,
      'applicant_email', NEW.applicant_email,
      'knows_unpaid', NEW.knows_unpaid,
      'graduated_highschool', NEW.graduated_highschool,
      'why_want_job', NEW.why_want_job,
      'previous_experience', NEW.previous_experience,
      'resume_url', NEW.resume_url,
      'status', NEW.status,
      'created_at', NEW.created_at
    )
  );
  
  -- Call Edge Function (async, won't block insert)
  -- Note: Edge Function will use anon key or service role key from environment
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := payload::text
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send email notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER job_application_email_notification
AFTER INSERT ON job_applications
FOR EACH ROW
EXECUTE FUNCTION notify_job_application_email();

-- Note: You'll need to:
-- 1. Deploy the Edge Function: supabase functions deploy send-application-email
-- 2. Set RESEND_API_KEY in Supabase Dashboard → Settings → Edge Functions → Secrets
-- 3. Update webhook_url above with your project ref
-- 4. Get Resend API key from https://resend.com/api-keys

