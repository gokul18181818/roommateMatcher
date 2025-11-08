-- Remove instagram_handle column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS instagram_handle;

-- Drop index if it exists
DROP INDEX IF EXISTS idx_profiles_instagram_handle;

