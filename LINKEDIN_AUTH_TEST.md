# LinkedIn OAuth - Testing Guide

## ✅ What We Just Did

1. ✅ Updated LoginPage to use `linkedin_oidc` provider
2. ✅ AuthCallback properly handles session and redirects
3. ✅ Disabled mock mode in router (`MOCK_MODE = false`)
4. ✅ Enabled real authentication with protected routes
5. ✅ Updated ExplorePage to fetch real data from Supabase

---

## 🧪 How to Test

### Step 1: Start Your Dev Server

```bash
cd /Users/gokul/Desktop/InternMatch
npm run dev
```

### Step 2: Open Your Browser

Navigate to:
```
http://localhost:5173
```

You should be **automatically redirected to `/login`** (because you're not authenticated)

### Step 3: Test LinkedIn Sign-In

1. You'll see the **InternMatcher login page** with:
   - Logo
   - "Continue with LinkedIn" button (blue, with LinkedIn icon)

2. Click **"Continue with LinkedIn"**

3. You'll be redirected to **LinkedIn's authorization page**

4. LinkedIn will ask you to authorize "Test" app to access:
   - ✅ Use your name and photo
   - ✅ Use the primary email address

5. Click **"Allow"** or **"Authorize"**

6. You'll be redirected back to:
   ```
   http://localhost:5173/auth/callback
   ```

7. You should see **"Completing sign in..."** spinner briefly

8. Then you'll be redirected to **one of two places**:

   **Option A: `/onboarding`** (if you're a new user)
   - First-time users need to complete their profile
   - Currently shows placeholder onboarding page

   **Option B: `/explore`** (if your profile already exists)
   - Existing users go straight to explore page
   - Will show "No profiles found" initially (empty database)

---

## 🎯 Expected Flow

### First-Time User Flow:
```
http://localhost:5173
  ↓ (not authenticated)
/login
  ↓ (click "Continue with LinkedIn")
LinkedIn authorization page
  ↓ (user authorizes)
/auth/callback
  ↓ (checks if profile exists)
/onboarding (NEW USER)
```

### Returning User Flow:
```
http://localhost:5173
  ↓ (not authenticated)
/login
  ↓ (click "Continue with LinkedIn")
LinkedIn authorization page
  ↓ (user authorizes)
/auth/callback
  ↓ (checks if profile exists)
/explore (EXISTING USER)
```

---

## 🔍 What to Check

### 1. Check Browser Console

After successful login, open DevTools (F12) and check:
- No error messages
- Look for successful auth logs

### 2. Check Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/anwkkoecmsobccibnysf/auth/users
2. You should see **your user** in the Users table with:
   - Email from LinkedIn
   - LinkedIn user metadata
   - Created timestamp

### 3. Check Your User Data

In Supabase SQL Editor, run:
```sql
SELECT
  id,
  email,
  user_metadata->>'name' as name,
  user_metadata->>'picture' as avatar,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

You should see your LinkedIn data!

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch" error

**Cause:** LinkedIn redirect URL doesn't match

**Fix:**
1. Go to LinkedIn Developer Portal → Auth
2. Verify redirect URL is **exactly**:
   ```
   https://anwkkoecmsobccibnysf.supabase.co/auth/v1/callback
   ```
3. No trailing slash, no extra parameters

---

### Issue: "Failed to sign in with LinkedIn"

**Cause:** Incorrect credentials in Supabase

**Fix:**
1. Go to Supabase → Authentication → Providers → LinkedIn (OIDC)
2. Verify:
   - ✅ Enabled = ON
   - ✅ Client ID = `78e2cdiv3fjpes`
   - ✅ Client Secret = correct secret from LinkedIn
3. Click Save again

---

### Issue: Stuck on "Completing sign in..."

**Cause:** AuthCallback error

**Fix:**
1. Open browser console (F12)
2. Look for errors
3. Check Network tab for failed requests
4. Verify Supabase connection

---

### Issue: Redirected to `/explore` but shows loading forever

**Cause:** Auth state not updating

**Fix:**
1. Check if user is in Supabase auth.users table
2. Clear browser localStorage and cookies
3. Try signing in again

---

### Issue: "No profiles found" on Explore page

**This is NORMAL!** Your database is empty. After successful login:

1. You should be redirected to `/onboarding` (first time)
2. Complete your profile (we'll build this next)
3. Your profile will be saved to `profiles` table
4. Other users will appear on Explore page

---

## ✅ Success Criteria

LinkedIn OAuth is working if you can:

- [x] See the login page at `/login`
- [x] Click "Continue with LinkedIn"
- [x] Authorize on LinkedIn
- [x] See "Completing sign in..." spinner
- [x] Get redirected to `/onboarding` or `/explore`
- [x] See your user in Supabase Users table
- [x] No console errors

---

## 🎉 What's Next?

After confirming LinkedIn OAuth works:

1. **Build Onboarding Form** - Collect user profile data
2. **Create Profile** - Save to `profiles` table
3. **Photo Upload** - Add profile photos to Supabase Storage
4. **Build Profile Pages** - View and edit your profile
5. **Populate Explore** - Add more users to test

---

## 📝 Quick Test Checklist

Run through this checklist:

- [ ] Dev server running (`npm run dev`)
- [ ] Navigate to `http://localhost:5173`
- [ ] Redirected to `/login` automatically
- [ ] See "Continue with LinkedIn" button
- [ ] Click button → redirected to LinkedIn
- [ ] Authorize app on LinkedIn
- [ ] Redirected back to app
- [ ] See "Completing sign in..." message
- [ ] Redirected to `/onboarding` or `/explore`
- [ ] Check Supabase Users table - user exists
- [ ] No errors in browser console

---

## 🔧 Debug Commands

If you need to debug:

### Check Supabase Connection
```bash
# In browser console:
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data)
console.log('Error:', error)
```

### Check Auth State
```bash
# In browser console:
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
```

### Clear Auth State (if stuck)
```bash
# In browser console:
await supabase.auth.signOut()
localStorage.clear()
location.reload()
```

---

**Ready to test?** Start your dev server and let me know what happens! 🚀
