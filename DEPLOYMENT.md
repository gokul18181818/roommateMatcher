# Netlify Deployment Guide

## Required Environment Variables

Add these in Netlify Dashboard → Site Settings → Environment Variables:

1. **VITE_SUPABASE_URL** - Your Supabase project URL
2. **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous/public key

## Fix Secrets Scanning Error

Netlify's secrets scanning will detect environment variables in the build output (which is normal for Vite apps). To fix this:

### Option 1: Disable Secrets Scanning (Recommended)
Add this environment variable in Netlify:
- **Key**: `SECRETS_SCAN_ENABLED`
- **Value**: `false`

### Option 2: Allow Specific Keys and Paths
Add these environment variables:
- **Key**: `SECRETS_SCAN_OMIT_PATHS`
- **Value**: `dist/**,*.md`

- **Key**: `SECRETS_SCAN_OMIT_KEYS`
- **Value**: `VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY`

## Steps to Deploy

1. Push code to GitHub (main branch)
2. Netlify will auto-deploy
3. If secrets scanning fails, add the environment variables above
4. Redeploy or wait for next push

## Build Configuration

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: Auto-detected (or set to 18+)

## LinkedIn OAuth Configuration for Production

After deploying to Netlify, you need to add your production redirect URLs:

### 1. LinkedIn Developer Portal

1. Go to: https://www.linkedin.com/developers/apps
2. Select your app
3. Go to **Auth** tab
4. Under **Redirect URLs**, add:
   - `https://careercrib.netlify.app/auth/callback`
   - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback` (your Supabase redirect URL)
5. Click **Update**

### 2. Supabase Configuration

1. Go to your Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://careercrib.netlify.app/auth/callback`
3. Save

### Important Notes

- The code automatically uses `window.location.origin`, so it will work on both localhost and Netlify
- Make sure BOTH LinkedIn and Supabase have the production redirect URLs added
- The Supabase redirect URL (`https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`) must be added to LinkedIn's allowed redirect URLs

