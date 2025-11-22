# Database Webhook Setup Guide

## Step-by-Step Instructions

### Step 1: Get Your Service Role Key
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **InternMatcher**
3. Go to: **Settings** → **API**
4. Under **Project API keys**, find **`service_role`** key
5. **Copy the service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - ⚠️ **Keep this secret!** Don't share it publicly

### Step 2: Create Database Webhook
1. In Supabase Dashboard, go to: **Database** → **Webhooks**
2. Click **"Create a new webhook"** button
3. Fill in the form:

   **Basic Settings:**
   - **Name:** `Job Application Email`
   - **Table:** `job_applications`
   - **Events:** Check ✅ **INSERT** (uncheck others)

   **HTTP Request Settings:**
   - **HTTP Request Method:** `POST`
   - **HTTP Request URL:** 
     ```
     https://anwkkoecmsobccibnysf.supabase.co/functions/v1/send-application-email
     ```

   **HTTP Request Headers:**
   Click **"Add header"** and add these two headers:
   
   Header 1:
   - **Name:** `Authorization`
   - **Value:** `Bearer [PASTE_YOUR_SERVICE_ROLE_KEY_HERE]`
   
   Header 2:
   - **Name:** `apikey`
   - **Value:** `[PASTE_YOUR_SERVICE_ROLE_KEY_HERE]` (same key)

   **HTTP Request Body:**
   - Select: **"Send full event payload"** or **"Send JSON payload"**
   - The body will automatically include the new record data

4. Click **"Create webhook"**

### Step 3: Test It
1. Submit a test job application on your site
2. Check your email: `gokulpremkumar03@gmail.com`
3. You should receive an email within seconds!

## What Gets Sent

The webhook will send a JSON payload like:
```json
{
  "type": "INSERT",
  "table": "job_applications",
  "record": {
    "id": "...",
    "job_posting_id": "...",
    "applicant_name": "...",
    "applicant_email": "...",
    "knows_unpaid": true,
    "graduated_highschool": true,
    "why_want_job": "...",
    "previous_experience": "...",
    "resume_url": "...",
    "status": "pending",
    "created_at": "..."
  }
}
```

The Edge Function will extract `record` and send the email.

## Troubleshooting

**If emails don't arrive:**
1. Check Supabase Dashboard → **Database** → **Webhooks** → Click on your webhook
2. Check **"Recent deliveries"** tab to see if requests are being sent
3. Check Edge Function logs: **Edge Functions** → **send-application-email** → **Logs**
4. Verify Resend API key is set: **Edge Functions** → **Settings** → **Secrets**

**Common Issues:**
- ❌ Wrong URL → Check the function URL is correct
- ❌ Missing headers → Make sure both `Authorization` and `apikey` headers are set
- ❌ Wrong service role key → Copy the key from Settings → API
- ❌ Resend API key not set → Set it in Edge Functions → Settings → Secrets

## That's It!

Once set up, every new job application will automatically trigger an email to `gokulpremkumar03@gmail.com`.

