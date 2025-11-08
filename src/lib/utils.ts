import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(d)
}

/**
 * Get company logo URL from Clearbit Logo API
 * Falls back to a placeholder if logo not found
 */
export function getCompanyLogoUrl(companyName: string): string {
  if (!companyName) return ''
  
  // Normalize company name for URL
  const normalized = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .replace(/inc|llc|corp|corporation|ltd|limited|company|co|technologies|tech|systems|solutions|group|holdings/g, '')
    .trim()
  
  // Common company domain mappings (exact matches)
  const domainMap: Record<string, string> = {
    'google': 'google.com',
    'meta': 'meta.com',
    'facebook': 'meta.com',
    'apple': 'apple.com',
    'microsoft': 'microsoft.com',
    'amazon': 'amazon.com',
    'netflix': 'netflix.com',
    'stripe': 'stripe.com',
    'airbnb': 'airbnb.com',
    'figma': 'figma.com',
    'uber': 'uber.com',
    'lyft': 'lyft.com',
    'twitter': 'twitter.com',
    'x': 'x.com',
    'linkedin': 'linkedin.com',
    'salesforce': 'salesforce.com',
    'oracle': 'oracle.com',
    'ibm': 'ibm.com',
    'adobe': 'adobe.com',
    'nvidia': 'nvidia.com',
    'tesla': 'tesla.com',
    'spotify': 'spotify.com',
    'snapchat': 'snapchat.com',
    'pinterest': 'pinterest.com',
    'reddit': 'reddit.com',
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'atlassian': 'atlassian.com',
    'slack': 'slack.com',
    'zoom': 'zoom.us',
    'dropbox': 'dropbox.com',
    'box': 'box.com',
    'shopify': 'shopify.com',
    'square': 'square.com',
    'paypal': 'paypal.com',
    'visa': 'visa.com',
    'mastercard': 'mastercard.com',
    'intel': 'intel.com',
    'amd': 'amd.com',
    'qualcomm': 'qualcomm.com',
    'cisco': 'cisco.com',
    'vmware': 'vmware.com',
    'redhat': 'redhat.com',
    'mongodb': 'mongodb.com',
    'databricks': 'databricks.com',
    'snowflake': 'snowflake.com',
    'palantir': 'palantir.com',
    'datadog': 'datadog.com',
    'splunk': 'splunk.com',
    'elastic': 'elastic.co',
    'cloudflare': 'cloudflare.com',
    'akamai': 'akamai.com',
    'fastly': 'fastly.com',
    'twilio': 'twilio.com',
    'sendgrid': 'sendgrid.com',
    'mailchimp': 'mailchimp.com',
    'hubspot': 'hubspot.com',
    'zendesk': 'zendesk.com',
    'servicenow': 'servicenow.com',
    'workday': 'workday.com',
    'okta': 'okta.com',
    'auth0': 'auth0.com',
    'vercel': 'vercel.com',
    'netlify': 'netlify.com',
    'heroku': 'heroku.com',
    'digitalocean': 'digitalocean.com',
    'linode': 'linode.com',
    'vultr': 'vultr.com',
    'ovh': 'ovh.com',
    'rackspace': 'rackspace.com',
    'godaddy': 'godaddy.com',
    'namecheap': 'namecheap.com',
    'squarespace': 'squarespace.com',
    'wix': 'wix.com',
    'wordpress': 'wordpress.com',
    'medium': 'medium.com',
    'substack': 'substack.com',
    'ghost': 'ghost.org',
    'notion': 'notion.so',
  }
  
  // Try to find domain in map first
  const domain = domainMap[normalized] || `${normalized}.com`
  
  return `https://logo.clearbit.com/${domain}`
}

/**
 * Get job title icon component name from Lucide
 * Returns icon name as string for dynamic import
 */
export function getJobTitleIcon(jobTitle: string): string {
  if (!jobTitle) return 'Briefcase'
  
  const title = jobTitle.toLowerCase()
  
  // Engineering & Development
  if (title.includes('engineer') || title.includes('developer') || title.includes('programmer') || title.includes('coder')) {
    if (title.includes('frontend') || title.includes('front-end') || title.includes('ui')) return 'Code'
    if (title.includes('backend') || title.includes('back-end') || title.includes('server')) return 'Server'
    if (title.includes('fullstack') || title.includes('full-stack') || title.includes('full stack')) return 'Layers'
    if (title.includes('devops') || title.includes('sre') || title.includes('infrastructure')) return 'Settings'
    if (title.includes('mobile') || title.includes('ios') || title.includes('android')) return 'Smartphone'
    if (title.includes('embedded') || title.includes('firmware') || title.includes('hardware')) return 'Cpu'
    return 'Code'
  }
  
  // Design
  if (title.includes('designer') || title.includes('design')) {
    if (title.includes('ui') || title.includes('ux') || title.includes('interface')) return 'Palette'
    if (title.includes('graphic') || title.includes('visual')) return 'Image'
    if (title.includes('product')) return 'PenTool'
    return 'Palette'
  }
  
  // Data & Analytics
  if (title.includes('analyst') || title.includes('analytics') || title.includes('data')) {
    if (title.includes('scientist') || title.includes('ml') || title.includes('machine learning') || title.includes('ai')) return 'Brain'
    if (title.includes('engineer') || title.includes('architect')) return 'Database'
    return 'BarChart'
  }
  
  // Product & Management
  if (title.includes('product') || title.includes('pm')) {
    if (title.includes('manager')) return 'Briefcase'
    return 'Package'
  }
  
  if (title.includes('manager') || title.includes('lead') || title.includes('director') || title.includes('head')) {
    if (title.includes('engineering') || title.includes('tech')) return 'Users'
    if (title.includes('product')) return 'Package'
    if (title.includes('marketing')) return 'Megaphone'
    if (title.includes('sales')) return 'TrendingUp'
    return 'Briefcase'
  }
  
  // Research
  if (title.includes('researcher') || title.includes('research') || title.includes('scientist')) {
    return 'Search'
  }
  
  // Marketing & Sales
  if (title.includes('marketing') || title.includes('marketer')) {
    return 'Megaphone'
  }
  
  if (title.includes('sales') || title.includes('account executive') || title.includes('ae')) {
    return 'TrendingUp'
  }
  
  // Finance & Accounting
  if (title.includes('finance') || title.includes('financial') || title.includes('accountant') || title.includes('cfo')) {
    return 'DollarSign'
  }
  
  // Operations
  if (title.includes('operations') || title.includes('ops') || title.includes('operations')) {
    return 'Settings'
  }
  
  // HR & Recruiting
  if (title.includes('recruiter') || title.includes('recruiting') || title.includes('hr') || title.includes('talent')) {
    return 'UserPlus'
  }
  
  // Customer Success & Support
  if (title.includes('support') || title.includes('success') || title.includes('customer')) {
    return 'Headphones'
  }
  
  // Legal
  if (title.includes('lawyer') || title.includes('attorney') || title.includes('legal') || title.includes('counsel')) {
    return 'Scale'
  }
  
  // Consulting
  if (title.includes('consultant') || title.includes('consulting') || title.includes('advisor')) {
    return 'Lightbulb'
  }
  
  // Security
  if (title.includes('security') || title.includes('cyber') || title.includes('infosec')) {
    return 'Shield'
  }
  
  // QA & Testing
  if (title.includes('qa') || title.includes('quality') || title.includes('test') || title.includes('tester')) {
    return 'CheckCircle'
  }
  
  // Content & Writing
  if (title.includes('writer') || title.includes('content') || title.includes('editor') || title.includes('copy')) {
    return 'PenTool'
  }
  
  // Default
  return 'Briefcase'
}

