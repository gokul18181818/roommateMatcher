import { supabase } from './supabase'

/**
 * Upload a profile photo to Supabase Storage
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns The public URL of the uploaded photo
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<string> {
  // Create a unique file name
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('profile-photos').getPublicUrl(data.path)

  return publicUrl
}

/**
 * Delete a profile photo from Supabase Storage
 * @param photoUrl - The full URL of the photo to delete
 */
export async function deleteProfilePhoto(photoUrl: string): Promise<void> {
  // Extract the file path from the URL
  const url = new URL(photoUrl)
  const path = url.pathname.split('/profile-photos/')[1]

  if (!path) {
    throw new Error('Invalid photo URL')
  }

  const { error } = await supabase.storage.from('profile-photos').remove([path])

  if (error) {
    throw new Error(`Failed to delete photo: ${error.message}`)
  }
}

/**
 * Update profile photo URL in the database
 * @param userId - The user's ID
 * @param photoUrl - The new photo URL
 */
export async function updateProfilePhotoUrl(
  userId: string,
  photoUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ profile_photo_url: photoUrl })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update profile photo URL: ${error.message}`)
  }
}

/**
 * Complete profile photo upload process
 * Uploads the file and updates the database
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @param oldPhotoUrl - Optional URL of the old photo to delete
 * @returns The public URL of the uploaded photo
 */
export async function completeProfilePhotoUpload(
  userId: string,
  file: File,
  oldPhotoUrl?: string
): Promise<string> {
  // Upload new photo
  const newPhotoUrl = await uploadProfilePhoto(userId, file)

  // Update database
  await updateProfilePhotoUrl(userId, newPhotoUrl)

  // Delete old photo if it exists
  if (oldPhotoUrl) {
    try {
      await deleteProfilePhoto(oldPhotoUrl)
    } catch (error) {
      // Don't fail if old photo deletion fails
      console.warn('Failed to delete old photo:', error)
    }
  }

  return newPhotoUrl
}
