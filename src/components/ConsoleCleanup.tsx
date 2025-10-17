'use client'

import { useEffect } from 'react'

/**
 * Component that suppresses browser extension console noise in development
 */
export function ConsoleCleanup({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Browser extension patterns to suppress
    const extensionPatterns = [
      'chrome-extension://',
      'moz-extension://',
      'content-all.js',
      'difoiogjjojoaoomphldepapgpbgkhkb',
      'Fetch finished loading: GET \"chrome-extension://',
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'cz-shortcut-listen',
      '__cf_bm',
      'has been rejected for invalid domain'
    ]

    // Store original console methods
    const originalError = console.error
    const originalWarn = console.warn

    // Helper to check if message should be suppressed
    const shouldSuppress = (message: string) => {
      return extensionPatterns.some(pattern => message.includes(pattern))
    }

    // Filter console methods
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      if (!shouldSuppress(message)) {
        originalError(...args)
      }
    }

    console.warn = (...args: any[]) => {
      const message = args.join(' ')
      if (!shouldSuppress(message)) {
        originalWarn(...args)
      }
    }

    // Cleanup function
    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return <>{children}</>
}