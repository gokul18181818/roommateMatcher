import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useProfilePhoto() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `profile-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      const photoUrl = urlData.publicUrl

      // Update profile photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: photoUrl })
        .eq('id', user.id)

      if (updateError) {
        // If update fails, try to delete the uploaded file
        await supabase.storage.from('profile-photos').remove([fileName])
        throw updateError
      }

      return photoUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })

  const deletePhoto = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      // Get current photo URL
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('profile_photo_url')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      if (!profile.profile_photo_url) {
        return // No photo to delete
      }

      // Extract file path from URL
      try {
        const url = new URL(profile.profile_photo_url)
        const pathParts = url.pathname.split('/')
        const profilePhotosIndex = pathParts.indexOf('profile-photos')
        if (profilePhotosIndex !== -1 && profilePhotosIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(profilePhotosIndex + 1).join('/')
          
          // Delete from storage
          await supabase.storage
            .from('profile-photos')
            .remove([filePath])
        }
      } catch (error) {
        console.error('Error parsing photo URL:', error)
        // Continue with DB update even if URL parsing fails
      }

      // Clear profile photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: null })
        .eq('id', user.id)

      if (updateError) throw updateError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })

  return {
    uploadPhoto,
    deletePhoto,
  }
}

