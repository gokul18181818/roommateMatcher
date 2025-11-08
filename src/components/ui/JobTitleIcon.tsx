import {
  Briefcase,
  Code,
  Server,
  Layers,
  Settings,
  Smartphone,
  Cpu,
  Palette,
  Image,
  PenTool,
  Brain,
  Database,
  BarChart,
  Package,
  Users,
  Megaphone,
  TrendingUp,
  Search,
  DollarSign,
  UserPlus,
  Headphones,
  Scale,
  Lightbulb,
  Shield,
  CheckCircle,
  LucideIcon,
} from 'lucide-react'
import { getJobTitleIcon } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface JobTitleIconProps {
  jobTitle: string
  className?: string
  size?: number
}

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Code,
  Server,
  Layers,
  Settings,
  Smartphone,
  Cpu,
  Palette,
  Image,
  PenTool,
  Brain,
  Database,
  BarChart,
  Package,
  Users,
  Megaphone,
  TrendingUp,
  Search,
  DollarSign,
  UserPlus,
  Headphones,
  Scale,
  Lightbulb,
  Shield,
  CheckCircle,
}

export default function JobTitleIcon({ jobTitle, className, size = 20 }: JobTitleIconProps) {
  const iconName = getJobTitleIcon(jobTitle)
  const Icon = iconMap[iconName] || Briefcase

  return (
    <Icon 
      className={cn("flex-shrink-0", className)} 
      size={size}
    />
  )
}

