'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Image from 'next/image'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(formData.email, formData.password)
        
        if (error) {
          setError(error)
        } else {
          router.push('/dashboard')
        }
      } else {
        // Sign up
        if (!formData.fullName.trim()) {
          setError('Full name is required')
          return
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName)
        
        if (error) {
          setError(error)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-chocolate-900 dark:to-chocolate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={200}
            height={10}
            className="mx-auto"
          />
          <p className="text-gray-600 dark:text-chocolate-300">
            {isLogin ? 'Welcome back!' : 'Start managing your subscriptions'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl p-8 transition-colors duration-300">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-chocolate-100 mb-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-center text-gray-600 dark:text-chocolate-300">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Fill in your information to get started'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 dark:text-chocolate-400 hover:text-gray-600 dark:hover:text-chocolate-200 transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 dark:text-chocolate-400 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full border-2 border-gray-300 dark:border-chocolate-600 border-t-blue-600 dark:border-t-blue-400 w-5 h-5 mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Form */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-chocolate-300">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setFormData({ email: '', password: '', fullName: '' })
                }}
                className="text-primary-600 dark:text-chocolate-400 hover:text-primary-600 dark:hover:text-chocolate-300 font-semibold transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="mt-4 text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-chocolate-400 dark:text-chocolate-400 hover:text-primary-600 dark:hover:text-chocolate-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-chocolate-400">
          <p>
            By {isLogin ? 'signing in' : 'creating an account'}, you agree to our{' '}
            <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}