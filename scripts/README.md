# Scripts Directory

This directory contains utility scripts for development and testing.

## Populate Mock Profiles

### Option 1: Using SQL (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `populateMockProfiles.sql`
3. Run the script
4. Done! You should now see 8 mock profiles in your Explore page

### Option 2: Using Browser Console

1. Open your app in the browser (while logged in)
2. Open browser console (F12)
3. Import and run the script:

```javascript
// Copy the populateMockProfiles function from populateMockProfiles.ts
// Or import it if you have a build setup

// Then run:
await populateMockProfiles()
```

### Option 3: Create a Dev Page

You can create a dev page that calls the function:

```typescript
import { populateMockProfiles } from '@/scripts/populateMockProfiles'

// In a component:
const handlePopulate = async () => {
  try {
    await populateMockProfiles()
    alert('Mock profiles created!')
  } catch (error) {
    console.error(error)
    alert('Error creating profiles')
  }
}
```

## Mock Profiles Included

1. **Sarah Chen** - Product Designer at Meta
2. **Michael Rodriguez** - Data Scientist at Netflix
3. **Emily Park** - Software Engineer at Apple
4. **David Kim** - Product Manager at Google
5. **Jessica Martinez** - UX Researcher at Airbnb
6. **Alex Thompson** - Backend Engineer at Stripe
7. **Maya Patel** - Frontend Engineer at Figma
8. **Ryan Wilson** - DevOps Engineer at Amazon

All profiles are located in San Francisco, CA and have:
- LinkedIn profile URLs
- Profile photos (using pravatar.cc)
- Complete bios
- Budget ranges
- Move-in dates
- Work schedules

## Notes

- These profiles use fake UUIDs (`00000000-...`)
- In production, profiles must be linked to real `auth.users`
- RLS is temporarily disabled during SQL insertion
- Profiles are set as `is_active = true` and `profile_completed = true`

