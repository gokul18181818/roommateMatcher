# LinkedIn OAuth Quick Start

## Your Exact URLs

**Supabase Project URL**: `https://anwkkoecmsobccibnysf.supabase.co`

**Supabase Redirect URL** (add this to LinkedIn): 
```
https://anwkkoecmsobccibnysf.supabase.co/auth/v1/callback
```

**Local Development Redirect URL** (also add to LinkedIn):
```
http://localhost:5173/auth/callback
```

## 5-Minute Setup

### 1. LinkedIn App Setup (2 minutes)
- Go to: https://www.linkedin.com/developers/
- Click **"Create app"**
- Fill in:
  - App name: `InternMatcher`
  - Website URL: `http://localhost:5173`
  - App usage: "Sign in with LinkedIn using OpenID Connect"
- Click **"Create app"**

### 2. Add Redirect URLs (1 minute)
- In LinkedIn app → **Auth** tab
- Click **"Add redirect URL"**
- Add these TWO URLs:
  1. `http://localhost:5173/auth/callback`
  2. `https://anwkkoecmsobccibnysf.supabase.co/auth/v1/callback`
- Click **"Update"** after each

### 3. Get Credentials (30 seconds)
- Still in **Auth** tab
- Copy **Client ID**
- Click **"Show"** next to Client Secret → Copy it

### 4. Request API Access (1 minute)
- Go to **Products** tab
- Find **"Sign In with LinkedIn using OpenID Connect"**
- Click **"Request access"**
- Submit the form (approval takes 1-2 days, but you can test locally)

### 5. Configure Supabase (1 minute)
- Go to: https://supabase.com/dashboard/project/anwkkoecmsobccibnysf
- Click **Authentication** → **Providers**
- Find **LinkedIn** → Toggle **ON**
- Paste:
  - **Client ID**: (from LinkedIn)
  - **Client Secret**: (from LinkedIn)
- Click **"Save"**

### 6. Test It!
- Go to: http://localhost:5173
- Click **"Continue with LinkedIn"**
- Should redirect to LinkedIn login

## ⚠️ Important Notes

1. **API Approval**: LinkedIn may take 1-2 days to approve API access. You can still test locally during this time.

2. **Redirect URL Must Match Exactly**: The Supabase redirect URL (`https://anwkkoecmsobccibnysf.supabase.co/auth/v1/callback`) MUST be added to LinkedIn's redirect URLs list.

3. **For Production**: When deploying, add your production domain's redirect URL to both LinkedIn and Supabase.

## Troubleshooting

**"Redirect URI mismatch" error?**
→ Make sure you added BOTH redirect URLs to LinkedIn (local + Supabase)

**"Invalid client" error?**
→ Double-check Client ID and Secret in Supabase match LinkedIn exactly

**Not redirecting back?**
→ Make sure the Supabase redirect URL is in LinkedIn's allowed list

## That's It! 🎉

Once LinkedIn approves your API access (usually within 24-48 hours), the full OAuth flow will work end-to-end.

