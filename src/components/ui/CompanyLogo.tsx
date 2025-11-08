import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { getCompanyLogoUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CompanyLogoProps {
  companyName: string
  className?: string
  size?: number
}

export default function CompanyLogo({ companyName, className, size = 24 }: CompanyLogoProps) {
  const [logoError, setLogoError] = useState(false)
  const logoUrl = getCompanyLogoUrl(companyName)

  if (!companyName) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-lg", className)} style={{ width: size, height: size }}>
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  if (logoError || !logoUrl) {
    return (
      <div className={cn("flex items-center justify-center bg-gradient-to-br from-indigo-100 dark:from-indigo-900/30 to-purple-100 dark:to-purple-900/30 rounded-lg", className)} style={{ width: size, height: size }}>
        <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={`${companyName} logo`}
      className={cn("rounded-lg object-contain bg-card", className)}
      style={{ width: size, height: size }}
      onError={() => setLogoError(true)}
    />
  )
}

