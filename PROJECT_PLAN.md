# CareerCrib - Project Plan & Architecture

## 🎯 Project Overview

**CareerCrib** is a roommate matching platform for professionals to find like-minded roommates based on career fields, companies, and professional interests.

### Core Value Proposition
- LinkedIn-based authentication for verified professionals
- Career-focused matching (similar fields, companies, industries)
- Open messaging system (no swipe/match barrier)
- Young professional community building

---

## 📋 Feature Specification

### 1. Authentication & Onboarding

#### LinkedIn OAuth Integration
- **Sign in with LinkedIn** button
- Auto-populate profile data:
  - Name, profile photo
  - Current company/position
  - Education background
  - Location
- Privacy controls for LinkedIn data usage

#### Profile Setup Flow
1. LinkedIn auth → Auto-populate basic info
2. Complete profile form:
   - **Required Fields:**
     - Bio (150-500 characters)
     - Age/DOB
     - Current career/job title
     - Company/Employer
     - Location (city, state)
     - Budget range for rent
     - Move-in date (flexible/specific)
   - **Optional Fields:**
     - Industry/Field
     - Interests/Hobbies
     - Lifestyle preferences (cleanliness, noise, pets, etc.)
     - Work schedule (remote, hybrid, in-office)
     - Profile photos (up to 5 additional photos)

### 2. Core Features - Three Main Tabs

#### Tab 1: Explore (Discovery)
- **User Cards Display:**
  - Grid/List view toggle
  - Profile photo, name, age
  - Current job title + company
  - Location + distance from user
  - Quick bio snippet (first 100 chars)

- **Filtering & Search:**
  - Location (city, radius)
  - Industry/Career field
  - Company (search by employer)
  - Age range
  - Budget range
  - Move-in date range
  - Work schedule type

- **Sorting Options:**
  - Recently joined
  - Nearest location
  - Similar industry
  - Similar company
  - Similar age

- **Actions:**
  - Click card → View full profile
  - "Message" button on each card
  - "Save/Bookmark" for later

#### Tab 2: Messages
- **Conversation List:**
  - Most recent message first
  - Unread indicator badge
  - Last message preview
  - Timestamp
  - User profile photo

- **Chat Interface:**
  - Real-time messaging (Supabase Realtime)
  - Text messages only (v1)
  - Message timestamp
  - Read receipts
  - Typing indicators

- **Features:**
  - Search conversations
  - Archive conversations
  - Report/Block users
  - Delete conversations

#### Tab 3: Profile
- **Own Profile View:**
  - Edit profile button
  - Preview mode (see how others see you)
  - Profile completion percentage

- **Profile Sections:**
  - Photos gallery (up to 6 photos)
  - Basic info (name, age, location)
  - Career info (job, company, industry)
  - Bio
  - Looking for (roommate preferences)
  - Lifestyle (preferences, habits)

- **Account Settings:**
  - Notification preferences
  - Privacy settings
  - Account visibility (active/paused)
  - Delete account
  - Logout

### 3. Additional Features

#### Safety & Trust
- LinkedIn verification badge
- Report user functionality
- Block user functionality
- Privacy controls (who can message you)
- Photo verification (future)

#### Notifications
- New message alerts
- Profile view notifications (optional)
- Match suggestions (similar field/company)

---

## 🏗️ System Architecture

### Tech Stack

#### Frontend (React)
```
React 18+
├── TypeScript
├── Vite (build tool)
├── React Router (navigation)
├── TanStack Query (server state)
├── Zustand (client state)
├── Tailwind CSS (styling)
├── Shadcn/ui (component library)
└── React Hook Form + Zod (forms + validation)
```

#### Backend (Supabase)
```
Supabase
├── PostgreSQL (database)
├── Auth (LinkedIn OAuth)
├── Realtime (chat, presence)
├── Storage (profile photos)
├── Row Level Security (RLS)
└── Edge Functions (serverless APIs)
```

#### Additional Services
- LinkedIn OAuth API (authentication)
- Cloudflare Images (optional, image optimization)

---

## 🗄️ Database Schema (Supabase)

### Tables

#### 1. `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- LinkedIn Data
  linkedin_id TEXT UNIQUE NOT NULL,
  linkedin_profile_url TEXT,

  -- Basic Info
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(date_of_birth))) STORED,
  profile_photo_url TEXT,

  -- Location
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Career Info
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  industry TEXT,
  work_schedule TEXT CHECK (work_schedule IN ('remote', 'hybrid', 'in-office')),

  -- Bio & Preferences
  bio TEXT NOT NULL CHECK (char_length(bio) >= 150 AND char_length(bio) <= 500),
  budget_min INTEGER,
  budget_max INTEGER,
  move_in_date DATE,
  move_in_flexible BOOLEAN DEFAULT false,

  -- Lifestyle
  interests TEXT[], -- array of interest tags
  cleanliness_level INTEGER CHECK (cleanliness_level >= 1 AND cleanliness_level <= 5),
  noise_tolerance INTEGER CHECK (noise_tolerance >= 1 AND noise_tolerance <= 5),
  has_pets BOOLEAN DEFAULT false,
  pet_friendly BOOLEAN DEFAULT false,
  smoking_friendly BOOLEAN DEFAULT false,

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  profile_completed BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(full_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(company, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(job_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(bio, '')), 'C')
  ) STORED
);

-- Indexes
CREATE INDEX idx_profiles_location ON profiles(city, state);
CREATE INDEX idx_profiles_company ON profiles(company);
CREATE INDEX idx_profiles_industry ON profiles(industry);
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_search ON profiles USING GIN(search_vector);
CREATE INDEX idx_profiles_coordinates ON profiles(latitude, longitude);
```

#### 2. `profile_photos`
```sql
CREATE TABLE profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_order INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(profile_id, photo_order)
);

CREATE INDEX idx_profile_photos_profile ON profile_photos(profile_id);
```

#### 3. `conversations`
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  participant_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_preview TEXT,

  -- Ensure unique conversation between two users
  UNIQUE(participant_1_id, participant_2_id),
  CHECK (participant_1_id < participant_2_id) -- enforce ordering
);

CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
```

#### 4. `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = false;
```

#### 5. `bookmarks`
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bookmarked_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, bookmarked_profile_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
```

#### 6. `blocks`
```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,

  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);
```

#### 7. `reports`
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'fake_profile', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),

  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported ON reports(reported_id);
```

---

## 🔐 Row Level Security (RLS) Policies

### Profiles Table
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view active profiles (except blocked users)
CREATE POLICY "Public profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (
  is_active = true
  AND id NOT IN (
    SELECT blocked_id FROM blocks WHERE blocker_id = auth.uid()
  )
);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

### Messages Table
```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND sender_id != receiver_id
  AND NOT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = receiver_id AND blocked_id = sender_id)
    OR (blocker_id = sender_id AND blocked_id = receiver_id)
  )
);
```

---

## 🎨 UI/UX Design System

### Design Principles
- **Clean & Professional**: Reflects career-focused nature
- **Mobile-First**: Optimized for on-the-go browsing
- **Trust & Safety**: Clear verification badges, privacy controls
- **Accessibility**: WCAG 2.1 AA compliant

### Color Palette
```css
Primary: #3B82F6 (LinkedIn Blue-inspired)
Secondary: #8B5CF6 (Purple accent)
Success: #10B981 (Green)
Warning: #F59E0B (Amber)
Error: #EF4444 (Red)

Neutrals:
- Background: #FFFFFF
- Surface: #F9FAFB
- Border: #E5E7EB
- Text Primary: #111827
- Text Secondary: #6B7280
```

### Typography
```css
Font Family: Inter (sans-serif)

Headings:
- H1: 32px / Bold
- H2: 24px / Semibold
- H3: 20px / Semibold
- H4: 18px / Medium

Body:
- Large: 16px / Regular
- Base: 14px / Regular
- Small: 12px / Regular
```

### Component Library (Shadcn/ui)
- Button (Primary, Secondary, Ghost, Outline)
- Card (Profile cards, Message cards)
- Input (Text, Select, Textarea, Date picker)
- Avatar (User photos with fallback)
- Badge (Verified, Industry tags)
- Dialog/Modal (Profile edit, Confirmations)
- Tabs (Main navigation)
- Toast (Notifications)
- Skeleton (Loading states)

---

## 🗂️ Frontend Architecture

### Folder Structure
```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── OnboardingPage.tsx
│   ├── explore/
│   │   ├── ExplorePage.tsx
│   │   └── ProfileDetailPage.tsx
│   ├── messages/
│   │   ├── MessagesPage.tsx
│   │   └── ChatPage.tsx
│   └── profile/
│       ├── ProfilePage.tsx
│       └── EditProfilePage.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── layout/
│   │   ├── MainLayout.tsx
│   │   ├── Header.tsx
│   │   └── TabNavigation.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileGallery.tsx
│   │   └── ProfileInfo.tsx
│   ├── messages/
│   │   ├── ConversationList.tsx
│   │   ├── ConversationItem.tsx
│   │   ├── ChatWindow.tsx
│   │   └── MessageBubble.tsx
│   └── explore/
│       ├── UserGrid.tsx
│       ├── UserCard.tsx
│       └── FilterPanel.tsx
├── lib/
│   ├── supabase.ts (client setup)
│   ├── linkedin-auth.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useProfile.ts
│   ├── useMessages.ts
│   └── useExplore.ts
├── stores/
│   ├── authStore.ts
│   └── chatStore.ts
├── types/
│   ├── database.types.ts (generated from Supabase)
│   └── index.ts
└── styles/
    └── globals.css (Tailwind)
```

### Key React Patterns
- **Server State**: TanStack Query for data fetching
- **Client State**: Zustand for auth, UI state
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6 with protected routes
- **Real-time**: Supabase Realtime subscriptions

---

## 🔄 User Flows

### 1. Onboarding Flow
```
Landing Page
  ↓
[Sign in with LinkedIn]
  ↓
LinkedIn OAuth → Redirect back with token
  ↓
Auto-populate profile from LinkedIn
  ↓
Complete Profile Form
  ↓
Upload additional photos (optional)
  ↓
Review & Submit
  ↓
→ Explore Page (Main App)
```

### 2. Exploration Flow
```
Explore Page (Grid of users)
  ↓
Apply filters (location, industry, company, etc.)
  ↓
Click on user card
  ↓
View Full Profile
  ↓
[Message] or [Bookmark] or [Back to Explore]
  ↓
If Message → Opens chat in Messages tab
```

### 3. Messaging Flow
```
Messages Tab
  ↓
See list of conversations (sorted by recent)
  ↓
Click conversation → Opens chat
  ↓
Real-time chat interface
  ↓
Send message → Updates instantly
  ↓
[Back to conversation list] or [View profile]
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Vite + React + TypeScript)
- [ ] Supabase project creation
- [ ] Database schema implementation
- [ ] RLS policies setup
- [ ] LinkedIn OAuth integration
- [ ] Basic authentication flow
- [ ] Design system setup (Tailwind + Shadcn)

### Phase 2: Core Features (Week 3-4)
- [ ] Profile creation & editing
- [ ] Explore page with user cards
- [ ] Filtering & search functionality
- [ ] Profile detail view
- [ ] Photo upload to Supabase Storage

### Phase 3: Messaging (Week 5-6)
- [ ] Conversation creation
- [ ] Real-time chat interface
- [ ] Message list/history
- [ ] Unread indicators
- [ ] Typing indicators
- [ ] Real-time subscriptions

### Phase 4: Polish & Safety (Week 7-8)
- [ ] Bookmark functionality
- [ ] Block/Report users
- [ ] Notifications
- [ ] Profile completion tracking
- [ ] Privacy settings
- [ ] Mobile responsive refinement
- [ ] Performance optimization
- [ ] Testing & bug fixes

### Phase 5: Launch Prep (Week 9-10)
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Error tracking (Sentry)
- [ ] User onboarding tutorials
- [ ] Terms of Service / Privacy Policy
- [ ] Beta testing
- [ ] Deployment (Vercel/Netlify)

---

## 🔧 Development Tools & Setup

### Required Accounts
- [x] Supabase account (backend)
- [ ] LinkedIn Developer account (OAuth)
- [ ] Vercel/Netlify (hosting)
- [ ] Sentry (error tracking)

### Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# LinkedIn OAuth
VITE_LINKEDIN_CLIENT_ID=your-client-id
VITE_LINKEDIN_REDIRECT_URI=your-redirect-uri

# Optional
VITE_SENTRY_DSN=your-sentry-dsn
```

### Commands
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Generate Supabase types
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

---

## 📊 Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Profile completion rate (target: >80%)
- Message response rate
- Average messages per conversation

### Growth
- New user signups per week
- Retention rate (D1, D7, D30)
- LinkedIn conversion rate

### Quality
- Report rate (target: <1%)
- Block rate
- User satisfaction (feedback surveys)

---

## 🔒 Privacy & Safety Considerations

### Data Privacy
- Only store necessary LinkedIn data
- Allow users to control visibility
- Clear data retention policies
- GDPR/CCPA compliance

### Safety Features
- LinkedIn verification required
- Report/block functionality
- Moderation system (future)
- Content filtering
- Rate limiting on messages

### Terms of Service
- Age requirement (18+)
- Acceptable use policy
- Data usage transparency
- Account termination conditions

---

## 🎯 Future Enhancements (Post-MVP)

### V2 Features
- [ ] Advanced matching algorithm (ML-based suggestions)
- [ ] Group chats for multiple roommate searches
- [ ] Apartment listings integration
- [ ] Video/voice chat
- [ ] Verified move-in date tracking
- [ ] Roommate reviews/ratings
- [ ] Event hosting (meetups for people in same city)

### V3 Features
- [ ] Mobile app (React Native)
- [ ] Premium features (boost profile, advanced filters)
- [ ] Integration with apartment platforms (Zillow, Apartments.com)
- [ ] Background checks (optional)
- [ ] Lease co-signing assistance

---

## 📝 Notes & Assumptions

1. **LinkedIn OAuth**: Requires app review for production access to certain profile fields
2. **Real-time**: Supabase Realtime is included in free tier with limitations
3. **Storage**: Profile photos stored in Supabase Storage (free tier: 1GB)
4. **Database**: PostgreSQL on Supabase (free tier: 500MB)
5. **Scaling**: Plan for paid tiers as user base grows

---

## 🤝 Team Roles (If Applicable)

- **Frontend Developer**: React, UI components, state management
- **Backend/Database**: Supabase schema, RLS policies, functions
- **UI/UX Designer**: Design system, user flows, prototypes
- **Product Manager**: Feature prioritization, user research

---

**Next Steps:** Review this plan, confirm features, then proceed with implementation Phase 1! 🚀
