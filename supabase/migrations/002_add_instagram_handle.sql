-- Add instagram_handle column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Add index for searching by Instagram handle
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_handle ON profiles(instagram_handle) WHERE instagram_handle IS NOT NULL;

