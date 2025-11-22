# Email Setup for Job Applications

## Quick Setup (5 minutes)

### Step 1: Get Resend API Key (Free)
1. Go to https://resend.com
2. Sign up (free tier: 3,000 emails/month)
3. Go to API Keys → Create API Key
4. Copy the key (starts with `re_...`)

### Step 2: Deploy Edge Function
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy send-application-email
```

### Step 3: Set Environment Variables
1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add secrets:
   - `RESEND_API_KEY` = your Resend API key
   - `ADMIN_EMAIL` = gokulpremkumar2003@gmail.com (optional, defaults to this)

### Step 4: Update Migration
1. Open `supabase/migrations/012_setup_email_webhook.sql`
2. Replace `YOUR_PROJECT_REF` with your actual project ref
3. Run migration: `supabase db push`

### Step 5: Test
Submit a test job application → Check your email!

## What You'll Get

- **Email Subject:** "New Job Application: [Name] - [Job Title]"
- **Email Content:** All application details formatted nicely
- **Resume Link:** Direct link to download resume
- **Print as PDF:** You can print the email to save as PDF

## Alternative: Use Supabase Built-in Email

If Resend doesn't work, we can use:
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 5,000 emails/month)
- Or just Supabase Dashboard notifications

## Cost
- **Resend:** Free (3,000 emails/month)
- **SendGrid:** Free (100 emails/day)
- **Mailgun:** Free (5,000 emails/month)

All free tiers are plenty for job applications!

