'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  supabase: typeof supabase
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run auth logic in browser environment
    if (typeof window !== 'undefined') {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Listen for auth changes
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } else {
      // In SSR environment, set loading to false to prevent hanging
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        return { error: 'Authentication is only available in browser environment' }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        return { error: 'Authentication is only available in browser environment' }
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      // If user needs email confirmation
      if (data.user && !data.session) {
        return { error: 'Please check your email for verification link' }
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        return { error: 'Authentication is only available in browser environment' }
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  // Provide safe defaults for SSR
  const value = {
    user,
    session,
    loading,
    supabase,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return safe defaults during SSR instead of throwing an error
    // This prevents ChunkLoadError during server-side rendering
    if (typeof window === 'undefined') {
      return {
        user: null,
        session: null,
        loading: true,
        supabase,
        signIn: async () => ({ error: 'Authentication not available during server-side rendering' }),
        signUp: async () => ({ error: 'Authentication not available during server-side rendering' }),
        signOut: async () => {},
        resetPassword: async () => ({ error: 'Authentication not available during server-side rendering' })
      }
    }
    // In client-side, throw error as before
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}