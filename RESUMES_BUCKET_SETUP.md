# Resumes Bucket Setup

The `resumes` storage bucket needs to be created manually in the Supabase Dashboard.

## Steps to Create the Bucket:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name:** `resumes`
   - **Public bucket:** ✅ Yes (check this)
   - **File size limit:** 10 MB (optional)
   - **Allowed MIME types:** (optional, but recommended)
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
6. Click **Create bucket**

## After Creating the Bucket:

The migration `013_create_resumes_bucket.sql` will set up the RLS policies automatically. If you've already run the migration, the policies should be in place.

## Verify the Bucket Exists:

You can verify by:
1. Going to Storage in the Dashboard
2. You should see a bucket named `resumes`
3. Try uploading a test file to confirm it works

## Troubleshooting:

If you still get "Bucket not found" errors:
1. Make sure the bucket name is exactly `resumes` (lowercase)
2. Make sure it's marked as **Public**
3. Check that the RLS policies were created (Storage > Policies)
4. Try refreshing the page or clearing browser cache

