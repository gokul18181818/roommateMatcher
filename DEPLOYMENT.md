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

