import { useRef, useState, useCallback } from 'react'
import { Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ProfilePhotoUploadProps {
  currentPhotoUrl: string | null
  onUpload: (file: File) => Promise<void>
  disabled?: boolean
  fallbackName?: string
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  onUpload,
  disabled = false,
  fallbackName = 'User',
}: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const displayUrl = previewUrl || currentPhotoUrl

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Maximum size is 5MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload the file
      setIsUploading(true)
      try {
        await onUpload(file)
        // Clear preview after successful upload (component will re-render with new URL)
        setTimeout(() => {
          setPreviewUrl(null)
        }, 500)
      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to upload photo. Please try again.')
        setPreviewUrl(null)
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
      // Reset input value so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [handleFileSelect]
  )

  const handleButtonClick = useCallback(() => {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }, [disabled, isUploading])

  const handleAvatarClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || isUploading) return
      e.preventDefault()
      e.stopPropagation()
      fileInputRef.current?.click()
    },
    [disabled, isUploading]
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          onClick={handleAvatarClick}
          className={cn(
            'relative cursor-pointer transition-all',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50',
            !disabled && !isUploading && 'hover:opacity-90'
          )}
        >
          <Avatar
            src={displayUrl || undefined}
            fallback={fallbackName}
            className="h-32 w-32 border-4 border-white shadow-xl"
          />
          
          {/* Upload overlay on hover */}
          {!disabled && !isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <Camera className="h-8 w-8 text-white" />
            </div>
          )}

          {/* Upload indicator */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Upload className="h-8 w-8 text-white animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
        className="hidden"
        id="profile-photo-input"
      />

      <div className="text-center space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={disabled || isUploading}
          className="text-sm"
        >
          {isUploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-pulse" />
              Uploading...
            </>
          ) : displayUrl ? (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Drag and drop or click to upload • Max 5MB • JPG, PNG, or GIF
        </p>
      </div>
    </div>
  )
}
