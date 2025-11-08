import { useRef, useState, useCallback } from 'react'
import { Upload, X, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

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

      setIsUploading(true)

      try {
        await onUpload(file)
        setPreviewUrl(null) // Clear preview after successful upload
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [disabled, handleFileSelect]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect]
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative group',
          isDragging && 'scale-105'
        )}
      >
        <Avatar
          src={displayUrl || undefined}
          fallback={fallbackName}
          className={cn(
            'h-32 w-32 border-4 border-white shadow-xl transition-all',
            isDragging && 'border-indigo-400 ring-4 ring-indigo-200',
            disabled && 'opacity-50'
          )}
        />

        {/* Upload overlay on hover */}
        {!disabled && (
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      <div className="text-center space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
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

