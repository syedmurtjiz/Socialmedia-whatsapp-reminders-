'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Safe GSAP import
let gsap: any = null
try {
  gsap = require('gsap').gsap
} catch (error) {
  console.warn('GSAP not available for page transitions')
}

export default function PageTransition() {
  const pathname = usePathname()

  useEffect(() => {
    if (!gsap) return
    
    // Page transition animation
    const tl = gsap.timeline()
    
    tl.set('.page-transition', {
      scaleY: 0,
      transformOrigin: 'bottom'
    })
    .to('.page-transition', {
      scaleY: 1,
      duration: 0.3,
      ease: 'power3.inOut'
    })
    .to('.page-transition', {
      scaleY: 0,
      duration: 0.3,
      ease: 'power3.inOut',
      transformOrigin: 'top',
      delay: 0.1
    })
  }, [pathname])

  return (
    <div 
      className="page-transition fixed inset-0 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-chocolate-900 dark:to-chocolate-950 z-50 pointer-events-none"
      style={{ transform: 'scaleY(0)' }}
    />
  )
}