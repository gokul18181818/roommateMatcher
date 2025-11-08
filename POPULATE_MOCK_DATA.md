# How to Populate Mock Profiles

## ✅ Quick Method: Use SQL Script (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the SQL Script**
   - Open `scripts/populateMockProfiles.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **Run**

3. **Done!**
   - You should see 8 mock profiles created
   - Refresh your Explore page to see them

## Alternative: Use Dev Page

1. **Add route** (temporarily) to `src/app/router.tsx`:
```typescript
{
  path: 'dev/populate-mock-data',
  element: <PopulateMockDataPage />,
}
```

2. **Import the component**:
```typescript
import PopulateMockDataPage from '@/pages/dev/PopulateMockDataPage'
```

3. **Navigate to** `/dev/populate-mock-data` and click the button

## What Gets Created?

8 mock profiles with:
- ✅ LinkedIn profile URLs (clickable links)
- ✅ Profile photos
- ✅ Complete bios
- ✅ Budget ranges
- ✅ Move-in dates
- ✅ Work schedules
- ✅ All located in San Francisco, CA

### Profiles:
1. Sarah Chen - Product Designer at Meta
2. Michael Rodriguez - Data Scientist at Netflix
3. Emily Park - Software Engineer at Apple
4. David Kim - Product Manager at Google
5. Jessica Martinez - UX Researcher at Airbnb
6. Alex Thompson - Backend Engineer at Stripe
7. Maya Patel - Frontend Engineer at Figma
8. Ryan Wilson - DevOps Engineer at Amazon

## Notes

- These profiles use fake UUIDs (`00000000-...`)
- They won't be linked to real auth users
- Perfect for testing the Explore page UI
- LinkedIn links are clickable and will open in a new tab

