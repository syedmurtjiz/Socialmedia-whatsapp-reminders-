
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FiUser, FiBell, FiCreditCard, FiSave, FiCheck, FiAlertCircle, FiX } from 'react-icons/fi'
import Link from 'next/link'
import DashboardHeader from '@/components/ui/DashboardHeader'
import LoadingState from '@/components/ui/LoadingState'
import Modal from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'

export default function Settings() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' })
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    whatsapp_number: ''
  })

  // Load WhatsApp number from user_profiles
  const loadWhatsAppNumber = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('whatsapp_number')
        .eq('id', user.id)
        .single()

      if (data && !error) {
        setNotificationSettings(prev => ({
          ...prev,
          whatsapp_number: data.whatsapp_number || ''
        }))
      }
    } catch (error) {
      console.error('Error loading WhatsApp number:', error)
    }
  }, [user])

  // Initialize form data
  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        timezone: user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      loadWhatsAppNumber()
    }
  }, [user, loadWhatsAppNumber])

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle notification settings changes
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Save WhatsApp number
  const saveWhatsAppNumber = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Validate WhatsApp number format
      if (notificationSettings.whatsapp_number && !/^\+\d{10,15}$/.test(notificationSettings.whatsapp_number)) {
        setModalContent({
          title: 'Invalid Format',
          message: 'WhatsApp number must start with + and contain 10-15 digits (e.g., +923001234567)',
          type: 'error'
        })
        setShowModal(true)
        setSaving(false)
        return
      }

      const { error } = await (supabase as any)
        .from('user_profiles')
        .upsert({
          id: user.id,
          whatsapp_number: notificationSettings.whatsapp_number || null,
          timezone: profileForm.timezone
        })

      if (error) throw error

      setModalContent({
        title: 'Success',
        message: 'WhatsApp number updated successfully',
        type: 'success'
      })
      setShowModal(true)
    } catch (error: any) {
      setModalContent({
        title: 'Error',
        message: error.message || 'Failed to update WhatsApp number',
        type: 'error'
      })
      setShowModal(true)
    } finally {
      setSaving(false)
    }
  }

  // Save profile changes
  const saveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      // @ts-ignore - Temporary workaround for Supabase type issues
      const { error } = await (supabase as any)
        .from('users')
        .update({
          full_name: profileForm.full_name,
          timezone: profileForm.timezone
        })
        .eq('id', user.id)

      if (error) throw error

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.full_name,
          timezone: profileForm.timezone
        }
      })

      if (authError) throw authError

      setModalContent({
        title: 'Success',
        message: 'Profile updated successfully',
        type: 'success'
      })
      setShowModal(true)
    } catch (error: any) {
      setModalContent({
        title: 'Error',
        message: error.message || 'Failed to update profile',
        type: 'error'
      })
      setShowModal(true)
    } finally {
      setSaving(false)
    }
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      // Error signing out
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingState message="Loading settings..." fullscreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 transition-colors duration-300">
      {/* Alert Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={closeModal} 
        title={modalContent.title}
      >
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
            modalContent.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {modalContent.type === 'success' ? (
              <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <FiAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div className="mt-3 text-center">
            <p className="text-gray-600 dark:text-chocolate-300">
              {modalContent.message}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-chocolate-900 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <DashboardHeader activePage="settings" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-chocolate-100">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-chocolate-300 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Navigation */}
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl mb-6 sm:mb-8 transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-chocolate-700">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-chocolate-400 dark:hover:text-chocolate-300'
                }`}
              >
                <FiUser className="w-4 h-4 mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-chocolate-400 dark:hover:text-chocolate-300'
                }`}
              >
                <FiBell className="w-4 h-4 mr-2" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'billing'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-chocolate-400 dark:hover:text-chocolate-300'
                }`}
              >
                <FiCreditCard className="w-4 h-4 mr-2" />
                Billing
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-chocolate-100 mb-4 sm:mb-6">Profile Settings</h3>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-chocolate-300 mb-1.5 sm:mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-chocolate-300 mb-1.5 sm:mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-gray-50 dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm sm:text-base"
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-chocolate-400">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-chocolate-300 mb-1.5 sm:mb-1">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      id="timezone"
                      value={profileForm.timezone}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm sm:text-base"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Karachi">Asia/Karachi (Pakistan)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 sm:py-2 px-4 sm:px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50 text-sm sm:text-base"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 w-4 h-4 mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-chocolate-100 mb-4 sm:mb-6">Notification Preferences</h3>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* WhatsApp Number */}
                  <div className="p-3 sm:p-4 border border-gray-200 dark:border-chocolate-700 rounded-lg">
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-chocolate-100 mb-2">WhatsApp Reminders</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-chocolate-400 mb-3 sm:mb-4">
                        Enter your WhatsApp number to receive subscription reminders
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <input
                          type="tel"
                          name="whatsapp_number"
                          value={notificationSettings.whatsapp_number}
                          onChange={handleNotificationChange}
                          placeholder="+923001234567"
                          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm sm:text-base"
                        />
                        <button
                          onClick={saveWhatsAppNumber}
                          disabled={saving}
                          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 sm:py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50 whitespace-nowrap text-sm sm:text-base"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 w-4 h-4 mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FiSave className="w-4 h-4 mr-2" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-chocolate-400 mt-2">
                        Format: +92 followed by 10 digits. This number will be used for all subscription reminders.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 border border-gray-200 dark:border-chocolate-700 rounded-lg">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-chocolate-100">Email Notifications</h4>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-chocolate-400">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="email_notifications"
                          checked={notificationSettings.email_notifications}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 border border-gray-200 dark:border-chocolate-700 rounded-lg">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-chocolate-100">Push Notifications</h4>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-chocolate-400">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="push_notifications"
                          checked={notificationSettings.push_notifications}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiBell className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Notification Schedule
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                          <p>
                            You will receive payment reminders:
                          </p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>2 days before payment is due</li>
                            <li>1 day before payment is due</li>
                            <li>On the day payment is due</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-chocolate-100 mb-4 sm:mb-6">Billing Information</h3>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-6 bg-gray-50 dark:bg-chocolate-800 rounded-lg">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-chocolate-100 mb-2">Current Plan</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-chocolate-100">Free Plan</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-chocolate-400">No credit card required</p>
                      </div>
                      <span className="px-3 py-1 text-xs sm:text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full self-start sm:self-auto">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-chocolate-100 mb-3">Plan Features</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-600 dark:text-chocolate-300">Track up to 10 subscriptions</span>
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-600 dark:text-chocolate-300">Email notifications</span>
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-600 dark:text-chocolate-300">Basic analytics</span>
                      </li>
                      <li className="flex items-center text-gray-400 dark:text-chocolate-500">
                        <FiX className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base">Priority support</span>
                      </li>
                      <li className="flex items-center text-gray-400 dark:text-chocolate-500">
                        <FiX className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base">Advanced analytics</span>
                      </li>
                      <li className="flex items-center text-gray-400 dark:text-chocolate-500">
                        <FiX className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base">Unlimited subscriptions</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-chocolate-700 pt-4 sm:pt-6">
                    <button
                      disabled
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      Upgrade to Pro Plan (Coming Soon)
                    </button>
                    <p className="mt-2 text-center text-xs sm:text-sm text-gray-500 dark:text-chocolate-400">
                      Pro Plan will include advanced features
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-chocolate-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-chocolate-100">Danger Zone</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-chocolate-100">Sign Out</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-chocolate-400">
                  Sign out of your account on this device
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 sm:py-2 px-4 sm:px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm sm:text-base whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}