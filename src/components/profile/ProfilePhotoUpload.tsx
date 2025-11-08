import { useRef, useState, useCallback } from 'react'
import { Upload, Camera, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
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
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const displayUrl = previewUrl || currentPhotoUrl

  const validateFile = useCallback((file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, or GIF)'
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'Image is too large. Maximum size is 5MB'
    }

    return null
  }, [])

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null)
      setSuccess(false)

      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
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
        setSuccess(true)
        // Clear preview after successful upload (component will re-render with new URL)
        setTimeout(() => {
          setPreviewUrl(null)
          setSuccess(false)
        }, 2000)
      } catch (error) {
        console.error('Upload error:', error)
        setError('Failed to upload photo. Please try again.')
        setPreviewUrl(null)
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload, validateFile]
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isUploading) {
      setIsDragging(true)
    }
  }, [disabled, isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [disabled, isUploading, handleFileSelect])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative w-full transition-all duration-200',
          isDragging && 'scale-105'
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              onClick={handleAvatarClick}
              className={cn(
                'relative cursor-pointer transition-all duration-200',
                (disabled || isUploading) && 'cursor-not-allowed opacity-50',
                !disabled && !isUploading && 'hover:scale-105',
                isDragging && 'ring-4 ring-primary/50 ring-offset-2'
              )}
            >
              <Avatar
                src={displayUrl || undefined}
                fallback={fallbackName}
                className="h-36 w-36 border-4 border-background shadow-2xl ring-2 ring-border"
              />
              
              {/* Upload overlay on hover */}
              {!disabled && !isUploading && !isDragging && (
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Camera className="h-10 w-10 text-white" />
                </div>
              )}

              {/* Drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 rounded-full bg-primary/80 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-white animate-bounce" />
                </div>
              )}

              {/* Upload indicator */}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
              )}

              {/* Success indicator */}
              {success && !isUploading && (
                <div className="absolute inset-0 rounded-full bg-green-500/90 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="h-10 w-10 text-white" />
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

          <div className="text-center space-y-3 w-full">
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            
            <p className="text-xs text-muted-foreground px-4">
              Drag and drop an image here, or click to browse • Max 5MB • JPG, PNG, or GIF
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="w-full max-w-md p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success message */}
      {success && !isUploading && (
        <div className="w-full max-w-md p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-500 text-sm font-medium">Photo uploaded successfully!</p>
        </div>
      )}
    </div>
  )
}
