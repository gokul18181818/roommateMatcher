# Domain Migration to career-crib.com

## Overview
This document outlines all the backend changes needed when migrating to `career-crib.com`.

## ✅ Code Changes (Already Done)
The codebase uses `window.location.origin` which automatically adapts to the new domain:
- `src/pages/auth/LoginPage.tsx` - OAuth redirect uses `${window.location.origin}/auth/callback`
- No code changes needed!

## 🔧 Backend Configuration Changes Required

### 1. Supabase Dashboard - Site URL
**Location:** Project Settings → Authentication → URL Configuration

**Update:**
- **Site URL:** `https://career-crib.com`
- **Redirect URLs:** Add these:
  - `https://career-crib.com/auth/callback`
  - `https://www.career-crib.com/auth/callback` (if using www)

### 2. Supabase Dashboard - LinkedIn OAuth Provider
**Location:** Authentication → Providers → LinkedIn

**Update Authorized redirect URIs:**
- `https://career-crib.com/auth/callback`
- `https://www.career-crib.com/auth/callback` (if using www)

### 3. LinkedIn Developer Portal
**Location:** https://www.linkedin.com/developers/apps → Your App → Auth tab

**Update Authorized redirect URLs for OAuth 2.0:**
- `https://career-crib.com/auth/callback`
- `https://www.career-crib.com/auth/callback` (if using www)

**Note:** LinkedIn may require you to verify domain ownership before allowing redirect URLs.

### 4. Deployment Platform Settings

#### If using Netlify:
- Go to: Site Settings → Domain Management
- Add custom domain: `career-crib.com`
- Add `www.career-crib.com` if using www
- Update DNS records as instructed

#### If using Vercel:
- Go to: Project Settings → Domains
- Add domain: `career-crib.com`
- Add `www.career-crib.com` if using www
- Update DNS records as instructed

### 5. DNS Configuration
Update your DNS records to point to your hosting provider:
- **A Record** or **CNAME** for `career-crib.com`
- **CNAME** for `www.career-crib.com` (if using www)

## ✅ Verification Checklist

After making changes, verify:
- [ ] Supabase Site URL updated
- [ ] Supabase redirect URLs include new domain
- [ ] LinkedIn OAuth redirect URLs updated
- [ ] LinkedIn app verified (if required)
- [ ] Deployment platform domain configured
- [ ] DNS records updated and propagated
- [ ] Test OAuth login flow on new domain
- [ ] Test callback URL redirects correctly

## 🧪 Testing

1. Visit `https://career-crib.com/login`
2. Click "Continue with LinkedIn"
3. Complete OAuth flow
4. Verify redirect to `https://career-crib.com/auth/callback`
5. Verify successful authentication

## 📝 Notes

- The code uses `window.location.origin` so it automatically works with any domain
- OAuth redirect URLs must match exactly (including https:// and trailing slashes)
- LinkedIn may take a few minutes to update redirect URLs
- DNS propagation can take up to 48 hours (usually much faster)

