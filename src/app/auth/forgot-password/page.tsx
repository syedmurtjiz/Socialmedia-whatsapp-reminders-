'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Email address is required')
      setLoading(false)
      return
    }

    const { error } = await resetPassword(email)
    
    if (error) {
      setError(error)
    } else {
      setMessage('Check your email for password reset instructions')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={200}
            height={10}
            className="mx-auto"
          />
          <p className="text-gray-600">
            Reset your password
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
              Forgot Password?
            </h2>
            <p className="text-center text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                    if (message) setMessage('')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 pl-10"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
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
                  <div className="animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 w-5 h-5 mr-2"></div>
                  Sending Reset Email...
                </div>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Remember your password?{' '}
            <Link href="/auth" className="text-primary-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}