'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/loading'
import { FiSave, FiMessageSquare, FiClock, FiGlobe, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface UserProfile {
  id: string
  whatsapp_number?: string
  reminder_time?: string
  timezone: string
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [timezone, setTimezone] = useState('Asia/Karachi')

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setWhatsappNumber(data.whatsapp_number || '')
        setTimezone(data.timezone || 'Asia/Karachi')
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user, loadProfile])

  async function saveProfile() {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Validate WhatsApp number format
      if (whatsappNumber && !/^\+\d{10,15}$/.test(whatsappNumber)) {
        setError('WhatsApp number must start with + and contain 10-15 digits (e.g., +923001234567)')
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          whatsapp_number: whatsappNumber || null,
          timezone: timezone
        })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-chocolate-100">
            Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your notification preferences and account settings
          </p>
        </div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-chocolate-900 rounded-xl shadow-lg p-6 space-y-6"
        >
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Settings saved successfully!
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          {/* WhatsApp Number */}
          <div>
            <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center">
                <FiMessageSquare className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                WhatsApp Number
              </div>
            </label>
            <input
              type="tel"
              id="whatsapp_number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+923001234567"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Format: +92 followed by 10 digits (e.g., +923001234567). This number will be used for all subscription reminders.
            </p>
          </div>


          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center">
                <FiGlobe className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                Timezone
              </div>
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
            >
              <option value="Asia/Karachi">Pakistan (UTC+5)</option>
              <option value="Asia/Dubai">Dubai (UTC+4)</option>
              <option value="Asia/Riyadh">Saudi Arabia (UTC+3)</option>
              <option value="Europe/London">London (UTC+0)</option>
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your local timezone for displaying dates and times.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex">
            <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">About WhatsApp Reminders</p>
              <p>
                Your WhatsApp number will be used to send reminders for all your subscriptions. 
                You can set reminder time and days before payment for each subscription individually.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
