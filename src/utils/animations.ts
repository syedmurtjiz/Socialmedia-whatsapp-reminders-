// Safe GSAP imports with fallbacks
let gsap: any = null
let ScrollTrigger: any = null

// Dynamic import state
let gsapImportAttempted = false

// Dynamically import GSAP to handle cases where it might not be installed yet
const initializeGSAP = () => {
  if (gsapImportAttempted) return
  gsapImportAttempted = true
  
  try {
    gsap = require('gsap').gsap
    try {
      ScrollTrigger = require('gsap/ScrollTrigger').ScrollTrigger
      if (typeof window !== 'undefined' && gsap) {
        gsap.registerPlugin(ScrollTrigger)
      }
    } catch (scrollTriggerError) {
      // ScrollTrigger plugin not available - this is fine for basic animations
    }
  } catch (gsapError) {
    // GSAP not available - animations will gracefully degrade
  }
}

// Initialize GSAP on first use
initializeGSAP()

// Animation configurations
export const animations = {
  // Page entrance animations
  pageEnter: {
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1
  },
  
  // Card animations
  cardHover: {
    duration: 0.3,
    ease: 'power2.out',
    scale: 1.02,
    y: -5
  },
  
  // Chart animations
  chartReveal: {
    duration: 1.2,
    ease: 'power3.out',
    stagger: 0.15
  },
  
  // Navigation animations
  navSlide: {
    duration: 0.5,
    ease: 'power3.out'
  },
  
  // Number counter animations
  counter: {
    duration: 2,
    ease: 'power2.out'
  }
}

// Safe animation wrapper
const safeAnimate = (animationFn: () => any) => {
  if (!gsap) {
    // Silently skip animation if GSAP is not available
    return null
  }
  try {
    return animationFn()
  } catch (error) {
    // Animation failed - return null for graceful degradation
    return null
  }
}

// Page entrance animation
export const animatePageEnter = (elements: string | Element | NodeList) => {
  return safeAnimate(() => {
    const tl = gsap.timeline()
    
    tl.from(elements, {
      opacity: 0,
      y: 30,
      duration: animations.pageEnter.duration,
      ease: animations.pageEnter.ease,
      stagger: animations.pageEnter.stagger
    })
    
    return tl
  })
}

// Fade in from bottom animation
export const animateFadeInUp = (elements: string | Element | NodeList | HTMLCollection, delay = 0) => {
  return safeAnimate(() => {
    const elementsArray = typeof elements === 'string' 
      ? document.querySelectorAll(elements)
      : elements instanceof NodeList 
      ? Array.from(elements)
      : elements instanceof HTMLCollection
      ? Array.from(elements)
      : [elements]
      
    return gsap.from(elementsArray, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out',
      delay,
      stagger: 0.1
    })
  })
}

// Scale in animation
export const animateScaleIn = (elements: string | Element | NodeList | HTMLCollection, delay = 0) => {
  return safeAnimate(() => {
    const elementsArray = typeof elements === 'string' 
      ? document.querySelectorAll(elements)
      : elements instanceof NodeList 
      ? Array.from(elements)
      : elements instanceof HTMLCollection
      ? Array.from(elements)
      : [elements]
      
    return gsap.from(elementsArray, {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'back.out(1.7)',
      delay,
      stagger: 0.1
    })
  })
}

// Slide in from left
export const animateSlideInLeft = (elements: string | Element | NodeList, delay = 0) => {
  return safeAnimate(() => {
    return gsap.from(elements, {
      opacity: 0,
      x: -100,
      duration: 0.8,
      ease: 'power3.out',
      delay,
      stagger: 0.1
    })
  })
}

// Slide in from right
export const animateSlideInRight = (elements: string | Element | NodeList, delay = 0) => {
  return safeAnimate(() => {
    return gsap.from(elements, {
      opacity: 0,
      x: 100,
      duration: 0.8,
      ease: 'power3.out',
      delay,
      stagger: 0.1
    })
  })
}

// Card hover animation
export const animateCardHover = (element: Element) => {
  return safeAnimate(() => {
    const tl = gsap.timeline({ paused: true })
    
    tl.to(element, {
      scale: animations.cardHover.scale,
      y: animations.cardHover.y,
      duration: animations.cardHover.duration,
      ease: animations.cardHover.ease,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    })
    
    return tl
  })
}

// Number counter animation
export const animateCounter = (element: Element, endValue: number, suffix = '') => {
  return safeAnimate(() => {
    const obj = { value: 0 }
    
    return gsap.to(obj, {
      value: endValue,
      duration: animations.counter.duration,
      ease: animations.counter.ease,
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toLocaleString() + suffix
      }
    })
  })
}

// Chart bar animation
export const animateChartBars = (elements: string | Element | NodeList) => {
  return safeAnimate(() => {
    return gsap.from(elements, {
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 1,
      ease: 'power3.out',
      stagger: 0.1
    })
  })
}

// Progress bar animation
export const animateProgressBar = (element: Element, percentage: number) => {
  return safeAnimate(() => {
    return gsap.to(element, {
      width: `${percentage}%`,
      duration: 1.5,
      ease: 'power3.out'
    })
  })
}

// Pie chart animation
export const animatePieChart = (elements: string | Element | NodeList) => {
  return safeAnimate(() => {
    return gsap.from(elements, {
      rotation: -90,
      transformOrigin: 'center',
      duration: 1.5,
      ease: 'power3.out',
      stagger: 0.2
    })
  })
}

// Floating animation
export const animateFloating = (element: Element) => {
  return safeAnimate(() => {
    return gsap.to(element, {
      y: -10,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    })
  })
}

// Rotate animation
export const animateRotate = (element: Element, rotation = 360) => {
  return safeAnimate(() => {
    return gsap.to(element, {
      rotation,
      duration: 1,
      ease: 'power2.out'
    })
  })
}

// Pulse animation
export const animatePulse = (element: Element) => {
  return safeAnimate(() => {
    return gsap.to(element, {
      scale: 1.1,
      duration: 0.5,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1
    })
  })
}

// Text reveal animation
export const animateTextReveal = (element: Element) => {
  return safeAnimate(() => {
    const tl = gsap.timeline()
    
    // Split text into spans for character animation
    const text = element.textContent || ''
    element.innerHTML = text.split('').map(char => 
      char === ' ' ? '&nbsp;' : `<span>${char}</span>`
    ).join('')
    
    tl.from(element.children, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'back.out(1.7)',
      stagger: 0.02
    })
    
    return tl
  })
}

// Scroll-triggered animation
export const animateOnScroll = (
  elements: string | Element | NodeList,
  animationType: 'fadeInUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight' = 'fadeInUp'
) => {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) {
    // Gracefully handle missing dependencies
    return null
  }
  
  return safeAnimate(() => {
    const elementsArray = typeof elements === 'string' 
      ? document.querySelectorAll(elements)
      : elements instanceof NodeList 
      ? elements 
      : [elements]
    
    elementsArray.forEach((element) => {
      let animation
      
      switch (animationType) {
        case 'scaleIn':
          animation = { opacity: 0, scale: 0.8 }
          break
        case 'slideInLeft':
          animation = { opacity: 0, x: -100 }
          break
        case 'slideInRight':
          animation = { opacity: 0, x: 100 }
          break
        default:
          animation = { opacity: 0, y: 50 }
      }
      
      gsap.from(element as Element, {
        ...animation,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element as Element,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none reverse'
        }
      })
    })
  })
}

// Page transition animation
export const animatePageTransition = () => {
  return safeAnimate(() => {
    const tl = gsap.timeline()
    
    tl.to('.page-transition', {
      scaleY: 1,
      duration: 0.5,
      ease: 'power3.inOut',
      transformOrigin: 'bottom'
    })
    .to('.page-transition', {
      scaleY: 0,
      duration: 0.5,
      ease: 'power3.inOut',
      transformOrigin: 'top',
      delay: 0.2
    })
    
    return tl
  })
}

// Check if GSAP is available
export const isGSAPAvailable = () => {
  initializeGSAP()
  return !!gsap
}

// Check if ScrollTrigger is available
export const isScrollTriggerAvailable = () => {
  initializeGSAP()
  return !!(gsap && ScrollTrigger)
}

const animationsUtil = {
  animations,
  animatePageEnter,
  animateFadeInUp,
  animateScaleIn,
  animateSlideInLeft,
  animateSlideInRight,
  animateCardHover,
  animateCounter,
  animateChartBars,
  animateProgressBar,
  animatePieChart,
  animateFloating,
  animateRotate,
  animatePulse,
  animateTextReveal,
  animateOnScroll,
  animatePageTransition,
  isGSAPAvailable,
  isScrollTriggerAvailable
}

export default animationsUtil