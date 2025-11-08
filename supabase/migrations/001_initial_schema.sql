-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create profiles table
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
  interests TEXT[],
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

-- Create profile_photos table
CREATE TABLE profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_order INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(profile_id, photo_order)
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  participant_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_preview TEXT,

  UNIQUE(participant_1_id, participant_2_id),
  CHECK (participant_1_id < participant_2_id)
);

-- Create messages table
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

-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bookmarked_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, bookmarked_profile_id)
);

-- Create blocks table
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,

  UNIQUE(blocker_id, blocked_id)
);

-- Create reports table
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

-- Create indexes
CREATE INDEX idx_profiles_location ON profiles(city, state);
CREATE INDEX idx_profiles_company ON profiles(company);
CREATE INDEX idx_profiles_industry ON profiles(industry);
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_search ON profiles USING GIN(search_vector);
CREATE INDEX idx_profiles_coordinates ON profiles(latitude, longitude);

CREATE INDEX idx_profile_photos_profile ON profile_photos(profile_id);

CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = false;

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported ON reports(reported_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (
  is_active = true
  AND id NOT IN (
    SELECT blocked_id FROM blocks WHERE blocker_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- RLS Policies for profile_photos
CREATE POLICY "Profile photos are viewable by authenticated users"
ON profile_photos FOR SELECT
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE is_active = true
  )
);

CREATE POLICY "Users can insert their own photos"
ON profile_photos FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid()
);

CREATE POLICY "Users can update their own photos"
ON profile_photos FOR UPDATE
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own photos"
ON profile_photos FOR DELETE
TO authenticated
USING (profile_id = auth.uid());

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  participant_1_id = auth.uid() OR participant_2_id = auth.uid()
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (
  participant_1_id = auth.uid() OR participant_2_id = auth.uid()
);

CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
TO authenticated
USING (
  participant_1_id = auth.uid() OR participant_2_id = auth.uid()
);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

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

CREATE POLICY "Users can update their sent messages"
ON messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id);

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their bookmarks"
ON bookmarks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create bookmarks"
ON bookmarks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their bookmarks"
ON bookmarks FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for blocks
CREATE POLICY "Users can view their blocks"
ON blocks FOR SELECT
TO authenticated
USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks"
ON blocks FOR INSERT
TO authenticated
WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can delete their blocks"
ON blocks FOR DELETE
TO authenticated
USING (blocker_id = auth.uid());

-- RLS Policies for reports
CREATE POLICY "Users can view their reports"
ON reports FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports"
ON reports FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

