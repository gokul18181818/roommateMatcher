# LinkedIn OAuth Setup Guide

## Step-by-Step Instructions

### Step 1: Create a LinkedIn Developer Account & App

1. **Go to LinkedIn Developers**
   - Visit: https://www.linkedin.com/developers/
   - Sign in with your LinkedIn account

2. **Create a New App**
   - Click **"Create app"** button
   - Fill in the required information:
     - **App name**: `InternMatcher` (or your preferred name)
     - **LinkedIn Page**: Select your company page or create one
     - **App logo**: Upload a logo (optional but recommended)
     - **App usage**: Select "Sign in with LinkedIn using OpenID Connect"
     - **App description**: "Roommate matching platform for interns and new grads"
     - **Website URL**: `http://localhost:5173` (for development)
     - **Business email**: Your email address
     - **Privacy policy URL**: (optional for now, can add later)
   - Check the terms and conditions
   - Click **"Create app"**

### Step 2: Configure OAuth Settings

1. **Go to Auth tab**
   - In your app dashboard, click on the **"Auth"** tab (left sidebar)

2. **Add Redirect URLs**
   - Under **"Redirect URLs"**, click **"Add redirect URL"**
   - Add these URLs (one at a time):
     - `http://localhost:5173/auth/callback` (for local development)
     - `https://yourdomain.com/auth/callback` (for production - replace with your actual domain)
   - Click **"Update"** after adding each URL

3. **Note Your Credentials**
   - You'll see:
     - **Client ID** (copy this)
     - **Client Secret** (click "Show" to reveal, then copy it)
   - Keep these safe - you'll need them for Supabase

### Step 3: Request API Products (Scopes)

1. **Go to Products tab**
   - Click on **"Products"** tab in the left sidebar

2. **Request Access**
   - Find **"Sign In with LinkedIn using OpenID Connect"**
   - Click **"Request access"**
   - Fill out the form explaining your use case:
     - "We need to authenticate users and access their basic profile information (name, email, profile photo) to create user profiles in our roommate matching platform"
   - Submit the request
   - **Note**: Approval can take a few hours to a few days

3. **Required Scopes** (once approved):
   - `openid` (automatically included)
   - `profile` (for name, photo)
   - `email` (for email address)

### Step 4: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your **InternMatcher** project

2. **Navigate to Authentication Settings**
   - Click **"Authentication"** in the left sidebar
   - Click **"Providers"** tab

3. **Enable LinkedIn Provider**
   - Scroll down to find **"LinkedIn"**
   - Toggle it **ON**

4. **Enter LinkedIn Credentials**
   - **Client ID (OAuth 2.0 Client ID)**: Paste your LinkedIn Client ID
   - **Client Secret (OAuth 2.0 Client Secret)**: Paste your LinkedIn Client Secret
   - **Redirect URL**: Copy the URL shown (it will be something like `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`)

5. **Save the Redirect URL**
   - Copy the Supabase redirect URL
   - Go back to LinkedIn Developer Portal → Auth tab
   - Add this Supabase redirect URL to your LinkedIn app's redirect URLs list
   - Click **"Update"**

6. **Save in Supabase**
   - Click **"Save"** in Supabase dashboard

### Step 5: Update Your .env File

1. **Open your .env file** in the project root

2. **Add LinkedIn credentials** (optional, for reference):
   ```env
   VITE_LINKEDIN_CLIENT_ID=your-client-id-here
   VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

   **Note**: The actual OAuth flow uses Supabase's redirect URL, but you can store these for reference.

### Step 6: Test the Integration

1. **Start your dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Test the Login**
   - Go to `http://localhost:5173`
   - Click **"Continue with LinkedIn"**
   - You should be redirected to LinkedIn login
   - After logging in, you'll be redirected back to your app

3. **Check for Errors**
   - If you see errors, check:
     - LinkedIn redirect URLs match exactly
     - Client ID and Secret are correct in Supabase
     - API products are approved
     - Supabase redirect URL is added to LinkedIn

### Common Issues & Solutions

**Issue: "Redirect URI mismatch"**
- **Solution**: Make sure the Supabase redirect URL is added to LinkedIn's redirect URLs list

**Issue: "Invalid client"**
- **Solution**: Double-check Client ID and Secret in Supabase match LinkedIn app

**Issue: "Insufficient permissions"**
- **Solution**: Make sure you've requested and been approved for the required API products

**Issue: OAuth works but no user data**
- **Solution**: Make sure you've been approved for `profile` and `email` scopes

### Production Checklist

Before going to production:

- [ ] Update redirect URLs in LinkedIn app to include production domain
- [ ] Update redirect URLs in Supabase to include production domain
- [ ] Add privacy policy URL to LinkedIn app
- [ ] Add terms of service URL to LinkedIn app
- [ ] Test the full flow in production environment
- [ ] Ensure all API products are approved for production use

### Quick Reference

**LinkedIn Developer Portal**: https://www.linkedin.com/developers/
**Supabase Dashboard**: https://supabase.com/dashboard
**Your Project ID**: `anwkkoecmsobccibnysf`

### Need Help?

- LinkedIn API Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
- Supabase Auth Docs: https://supabase.com/docs/guides/auth/social-login/auth-linkedin

