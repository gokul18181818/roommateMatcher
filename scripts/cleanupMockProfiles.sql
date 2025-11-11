-- SQL Script to remove mock profiles from the database
-- Run this in Supabase SQL Editor
-- This deletes profiles with the mock UUIDs that were used for testing

-- List of mock profile IDs from the deleted mock data files
DELETE FROM profiles
WHERE id IN (
  '00000000-0000-0000-0000-000000000001', -- Sarah Chen
  '00000000-0000-0000-0000-000000000002', -- Michael Rodriguez
  '00000000-0000-0000-0000-000000000003', -- Emily Park
  '00000000-0000-0000-0000-000000000004', -- David Kim
  '00000000-0000-0000-0000-000000000005', -- Jessica Martinez
  '00000000-0000-0000-0000-000000000006', -- Alex Thompson
  '00000000-0000-0000-0000-000000000007', -- Maya Patel
  '00000000-0000-0000-0000-000000000008'  -- Ryan Wilson
);

-- Also delete any profiles with fake LinkedIn IDs (pattern: name-number)
-- This catches any other mock profiles that might have been created
DELETE FROM profiles
WHERE linkedin_id ~ '^[a-z]+-[a-z]+-[0-9]+$'
  AND id NOT IN (
    SELECT id FROM auth.users
  );

-- Verify deletion (optional - run this to see what was deleted)
-- SELECT id, full_name, linkedin_id FROM profiles WHERE id IN (
--   '00000000-0000-0000-0000-000000000001',
--   '00000000-0000-0000-0000-000000000002',
--   '00000000-0000-0000-0000-000000000003',
--   '00000000-0000-0000-0000-000000000004',
--   '00000000-0000-0000-0000-000000000005',
--   '00000000-0000-0000-0000-000000000006',
--   '00000000-0000-0000-0000-000000000007',
--   '00000000-0000-0000-0000-000000000008'
-- );

