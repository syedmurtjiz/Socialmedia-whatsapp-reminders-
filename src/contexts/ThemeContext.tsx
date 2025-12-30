'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment before accessing window
    if (typeof window !== 'undefined') {
      // Get theme from localStorage or system preference
      const savedTheme = localStorage.getItem('theme') as Theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      const initialTheme = savedTheme || systemTheme
      console.log('Initial theme:', initialTheme, 'Saved:', savedTheme, 'System:', systemTheme)
      setThemeState(initialTheme)
      applyTheme(initialTheme)
    }
    setMounted(true)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const root = document.documentElement
      // Remove both classes first to ensure clean state
      root.classList.remove('light', 'dark')
      // Add the new theme class
      root.classList.add(newTheme)

      // Update meta theme color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#2d1f1a' : '#ffffff')
      }

      // Debug: Log the current classes
      console.log('Theme applied:', newTheme, 'Classes:', root.classList.toString())
    }
  }

  const setTheme = (newTheme: Theme) => {
    console.log('Setting theme:', newTheme)
    setThemeState(newTheme)
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('Toggling theme from', theme, 'to', newTheme)
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {!mounted ? (
        <div style={{ visibility: 'hidden' }}>{children}</div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return a safe default value during SSR instead of throwing an error
    // This prevents the ChunkLoadError during server-side rendering
    if (typeof window === 'undefined') {
      return {
        theme: 'light' as Theme,
        toggleTheme: () => { },
        setTheme: () => { }
      }
    }
    // In client-side, throw error as before
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}