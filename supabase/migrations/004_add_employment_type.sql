-- Add employment_type column to profiles table
ALTER TABLE profiles
ADD COLUMN employment_type TEXT CHECK (employment_type IN ('intern', 'new_grad')) DEFAULT NULL;

-- Create index for filtering
CREATE INDEX idx_profiles_employment_type ON profiles(employment_type) WHERE employment_type IS NOT NULL;

