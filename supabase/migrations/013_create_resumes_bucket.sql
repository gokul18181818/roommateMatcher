-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete resumes" ON storage.objects;

-- Storage policy: Anyone can upload resumes (for job applications)
CREATE POLICY "Anyone can upload resumes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'resumes');

-- Storage policy: Anyone can view resumes (public bucket)
CREATE POLICY "Anyone can view resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Storage policy: Allow deletion of resumes (for admin cleanup)
CREATE POLICY "Anyone can delete resumes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'resumes');

