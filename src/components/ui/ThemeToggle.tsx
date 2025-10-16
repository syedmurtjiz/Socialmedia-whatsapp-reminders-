'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import { motion } from 'framer-motion'

// Safe GSAP import
let gsap: any = null
try {
  gsap = require('gsap').gsap
} catch (error) {
  console.warn('GSAP not available, using Framer Motion fallback')
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  
  // Always call the hook - React hooks must be called in the same order
  const { theme, toggleTheme } = useTheme()
  
  const buttonRef = useRef<HTMLButtonElement>(null)
  const sunRef = useRef<HTMLDivElement>(null)
  const moonRef = useRef<HTMLDivElement>(null)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!gsap || !buttonRef.current || !sunRef.current || !moonRef.current || !mounted) return
    
    const tl = gsap.timeline()
    
    if (theme === 'dark') {
      tl.to(sunRef.current, {
        scale: 0,
        rotation: 180,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      })
      .to(moonRef.current, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'back.out(1.7)'
      }, 0.1)
    } else {
      tl.to(moonRef.current, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      })
      .to(sunRef.current, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'back.out(1.7)'
      }, 0.1)
    }
  }, [theme])

  const handleClick = () => {
    // Add click animation if GSAP is available
    if (gsap && buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.9,
        duration: 0.1,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      })
    }
    toggleTheme()
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-12 h-12 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
        <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      className="relative p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group dark:bg-amber-900/20 dark:border-amber-700/30 dark:hover:bg-amber-900/30 overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        {gsap ? (
          // GSAP-powered icons
          <>
            <div
              ref={sunRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: theme === 'light' ? 1 : 0 }}
            >
              <FiSun className="w-6 h-6 text-amber-500" />
            </div>
            
            <div
              ref={moonRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: theme === 'dark' ? 1 : 0 }}
            >
              <FiMoon className="w-6 h-6 text-amber-200" />
            </div>
          </>
        ) : (
          // Framer Motion fallback
          <>
            <motion.div
              initial={false}
              animate={{
                scale: theme === 'light' ? 1 : 0,
                rotate: theme === 'light' ? 0 : 180,
                opacity: theme === 'light' ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiSun className="w-6 h-6 text-amber-500" />
            </motion.div>
            
            <motion.div
              initial={false}
              animate={{
                scale: theme === 'dark' ? 1 : 0,
                rotate: theme === 'dark' ? 0 : -180,
                opacity: theme === 'dark' ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiMoon className="w-6 h-6 text-amber-200" />
            </motion.div>
          </>
        )}
      </div>
      
      {/* Enhanced Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-amber-600/20 dark:to-orange-600/20" />
      
      {/* Particle effect */}
      <div className="absolute inset-0 rounded-xl">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100"
            style={{
              left: `${20 + i * 20}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    </motion.button>
  )
}