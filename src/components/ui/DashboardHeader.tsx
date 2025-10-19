'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import NotificationBell from '@/components/ui/NotificationBell'
import Image from 'next/image'
import { FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi'

interface DashboardHeaderProps {
  activePage: 'dashboard' | 'subscriptions' | 'analytics' | 'settings'
}

export default function DashboardHeader({ activePage }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSettings = () => {
    router.push('/dashboard/settings')
    setMobileMenuOpen(false)
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'subscriptions', label: 'Subscriptions', href: '/dashboard/subscriptions' },
    { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics' },
  ]

  return (
    <header className="bg-white dark:bg-chocolate-900 shadow-sm border-b border-gray-200 dark:border-chocolate-700 transition-colors duration-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard">
              <Image src="/logo.png" alt="Logo" width={100} height={32} className="rounded-full cursor-pointer"/>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.id}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'text-gray-900 dark:text-chocolate-100'
                    : 'text-gray-500 dark:text-chocolate-400 hover:text-gray-900 dark:hover:text-chocolate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
            <NotificationBell />
            <ThemeToggle />
            <button 
              onClick={handleSettings}
              className="p-2 text-gray-400 dark:text-chocolate-400 hover:text-gray-600 dark:hover:text-chocolate-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-chocolate-800"
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 dark:text-chocolate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-chocolate-800"
              title="Sign Out"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <NotificationBell />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 dark:text-chocolate-400 hover:text-gray-600 dark:hover:text-chocolate-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-chocolate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-chocolate-700 bg-white dark:bg-chocolate-900">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-chocolate-300 hover:bg-gray-100 dark:hover:bg-chocolate-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button 
              onClick={handleSettings}
              className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-chocolate-300 hover:bg-gray-100 dark:hover:bg-chocolate-800 transition-colors flex items-center"
            >
              <FiSettings className="w-5 h-5 mr-3" />
              Settings
            </button>
            <button
              onClick={() => {
                handleSignOut()
                setMobileMenuOpen(false)
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}