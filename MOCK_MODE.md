# Mock Mode - Development Without Authentication

The app is currently running in **MOCK MODE** which bypasses all authentication and uses mock data.

## What's Mocked

- ✅ User authentication (always logged in as mock user)
- ✅ User profile data
- ✅ Explore page profiles (3 sample profiles)
- ✅ Profile viewing and editing

## Mock User

- **Name**: Alex Johnson
- **Job**: Software Engineer at Google
- **Location**: San Francisco, CA
- **Age**: 26

## Mock Profiles Available

1. **Sarah Chen** - Product Designer at Meta
2. **Michael Rodriguez** - Data Scientist at Netflix  
3. **Emily Park** - Software Engineer at Apple

## How to Enable Real Auth

To switch back to real authentication:

1. Find `const MOCK_MODE = true` in these files:
   - `src/stores/authStore.ts`
   - `src/hooks/useAuth.ts`
   - `src/hooks/useProfile.ts`
   - `src/app/router.tsx`
   - `src/pages/explore/ExplorePage.tsx`

2. Change `MOCK_MODE` to `false` in all files

3. Uncomment the real auth code (it's marked with comments)

4. Make sure your `.env` file has valid Supabase credentials

## Testing the App

With mock mode enabled, you can:
- Navigate to `/explore` to see sample profiles
- Click on profiles to view details
- Go to `/my-profile` to see your mock profile
- Edit your profile (changes are simulated, not saved)
- Test all UI features without setting up auth

## Notes

- Messages/Chat features still need real Supabase connection
- Profile updates are simulated (not saved to database)
- Sign out button will clear the mock user (refresh to restore)

