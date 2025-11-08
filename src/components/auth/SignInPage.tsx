import React, { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// --- HELPER COMPONENTS (ICONS) ---
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="#0077B5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

// --- TYPE DEFINITIONS ---
export interface Testimonial {
  avatarSrc: string
  name: string
  handle: string
  text: string
}

interface SignInPageProps {
  title?: React.ReactNode
  description?: React.ReactNode
  heroImageSrc?: string
  testimonials?: Testimonial[]
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void
  onLinkedInSignIn?: () => void
  onResetPassword?: () => void
  onCreateAccount?: () => void
}

// --- MAIN COMPONENT ---
export const SignInPage: React.FC<SignInPageProps> = ({
  title: _title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description: _description = "Access your account and continue your journey with us",
  heroImageSrc: _heroImageSrc,
  testimonials: _testimonials = [],
  onSignIn: _onSignIn,
  onLinkedInSignIn,
  onResetPassword: _onResetPassword,
  onCreateAccount: _onCreateAccount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const linkedInButtonRef = useRef<HTMLButtonElement>(null)
  const mousePosRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)

  const resolvedCanvasColorsRef = useRef({
    strokeStyle: { r: 128, g: 128, b: 128 },
  })

  // Parse RGB color helper
  const parseRgbColor = (colorString: string | null) => {
    if (!colorString) return null
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      }
    }
    return null
  }

  // Update resolved colors based on theme
  useEffect(() => {
    const tempElement = document.createElement('div')
    tempElement.style.display = 'none'
    document.body.appendChild(tempElement)

    const updateResolvedColors = () => {
      tempElement.style.color = 'var(--foreground)'
      const computedFgColor = getComputedStyle(tempElement).color
      const parsedFgColor = parseRgbColor(computedFgColor)

      if (parsedFgColor) {
        resolvedCanvasColorsRef.current.strokeStyle = parsedFgColor
      } else {
        const isDarkMode = document.documentElement.classList.contains('dark')
        resolvedCanvasColorsRef.current.strokeStyle = isDarkMode
          ? { r: 250, g: 250, b: 250 }
          : { r: 10, g: 10, b: 10 }
      }
    }

    updateResolvedColors()

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          updateResolvedColors()
          break
        }
      }
    })

    observer.observe(document.documentElement, { attributes: true })

    return () => {
      observer.disconnect()
      if (tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement)
      }
    }
  }, [])

  // Draw arrow from mouse to LinkedIn button
  const drawArrow = useCallback(() => {
    if (!canvasRef.current || !linkedInButtonRef.current || !ctxRef.current) return

    const targetEl = linkedInButtonRef.current
    const ctx = ctxRef.current
    const mouse = mousePosRef.current
    const x0 = mouse.x
    const y0 = mouse.y

    if (x0 === null || y0 === null) return

    const rect = targetEl.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const a = Math.atan2(cy - y0, cx - x0)
    const x1 = cx - Math.cos(a) * (rect.width / 2 + 12)
    const y1 = cy - Math.sin(a) * (rect.height / 2 + 12)

    const midX = (x0 + x1) / 2
    const midY = (y0 + y1) / 2
    const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5)
    const t = Math.max(-1, Math.min(1, (y0 - y1) / 200))
    const controlX = midX
    const controlY = midY + offset * t

    const r = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2)
    const opacity = Math.min(1.0, (r - Math.max(rect.width, rect.height) / 2) / 500)

    const arrowColor = resolvedCanvasColorsRef.current.strokeStyle
    ctx.strokeStyle = `rgba(${arrowColor.r}, ${arrowColor.g}, ${arrowColor.b}, ${opacity})`
    ctx.lineWidth = 2

    // Draw curve
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.quadraticCurveTo(controlX, controlY, x1, y1)
    ctx.setLineDash([10, 5])
    ctx.stroke()
    ctx.restore()

    // Draw arrowhead
    const angle = Math.atan2(y1 - controlY, x1 - controlX)
    const headLength = 10 * (ctx.lineWidth / 1.5)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(
      x1 - headLength * Math.cos(angle - Math.PI / 6),
      y1 - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(x1, y1)
    ctx.lineTo(
      x1 - headLength * Math.cos(angle + Math.PI / 6),
      y1 - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }, [])

  // Setup canvas and mouse tracking
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !linkedInButtonRef.current) return

    ctxRef.current = canvas.getContext('2d')
    const ctx = ctxRef.current
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('resize', updateCanvasSize)
    window.addEventListener('mousemove', handleMouseMove)
    updateCanvasSize()

    const animateLoop = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawArrow()
      }
      animationFrameIdRef.current = requestAnimationFrame(animateLoop)
    }

    animateLoop()

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [drawArrow])

  return (
    <div className="bg-white dark:bg-background text-gray-900 dark:text-foreground min-h-screen flex flex-col relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>


      {/* Main Hero Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <img src="/logo.svg" alt="CareerCrib" className="h-40 w-40 md:h-48 md:w-48 mx-auto" />
        </motion.div>

        {/* Heading */}
        <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center px-4"
          >
            <span className="text-[#1e3a8a] dark:text-[#3b82f6]">Find Your</span>{' '}
            <span className="text-[#9333ea] dark:text-[#a855f7]">Perfect Roommate Match</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-4 block text-gray-700 dark:text-muted-foreground text-center text-base sm:text-lg px-4 max-w-2xl"
          >
            Connect with professionals in your field. CareerCrib matches you with roommates based on shared career fields, companies, and professional interests.
          </motion.p>
        </div>

        {/* LinkedIn Sign In Button */}
        <div className="mt-8 flex justify-center">
          <motion.button
            ref={linkedInButtonRef}
            onClick={onLinkedInSignIn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center justify-center gap-3 py-3 px-8 rounded-xl border border-[#60A5FA] bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] transition-all focus:outline-none focus:ring-2 focus:ring-[#60A5FA] shadow-md hover:shadow-lg group"
          >
            <div className="group-hover:scale-110 transition-transform">
              <LinkedInIcon />
            </div>
            <span className="font-semibold text-base">Continue with LinkedIn</span>
          </motion.button>
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 lg:mt-16 w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 px-4"
        >
          <div className="p-6 rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border shadow-sm text-center">
            <h3 className="font-semibold text-gray-900 dark:text-card-foreground mb-2">Career Matching</h3>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              Connect with professionals in similar fields
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border shadow-sm text-center">
            <h3 className="font-semibold text-gray-900 dark:text-card-foreground mb-2">Verified Profiles</h3>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              LinkedIn authentication ensures real professionals
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border shadow-sm text-center">
            <h3 className="font-semibold text-gray-900 dark:text-card-foreground mb-2">Safe & Secure</h3>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              Privacy and safety as top priorities
            </p>
          </div>
        </motion.div>
      </main>

      <div className="h-12 sm:h-16 md:h-24"></div>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10"></canvas>
    </div>
  )
}

