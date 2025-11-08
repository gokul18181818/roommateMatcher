-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload their own photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policy: Users can update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policy: Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policy: Anyone can view photos (public bucket)
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- RLS policies for profile_photos table
CREATE POLICY "Users can view all profile photos"
ON profile_photos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own photos"
ON profile_photos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own photos"
ON profile_photos FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own photos"
ON profile_photos FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

