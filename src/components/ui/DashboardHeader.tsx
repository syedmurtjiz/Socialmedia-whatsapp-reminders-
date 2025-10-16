'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import NotificationBell from '@/components/ui/NotificationBell'
import Image from 'next/image'
import { FiSettings, FiLogOut } from 'react-icons/fi'

interface DashboardHeaderProps {
  activePage: 'dashboard' | 'subscriptions' | 'analytics' | 'settings'
}

export default function DashboardHeader({ activePage }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const router = useRouter()

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
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'subscriptions', label: 'Subscriptions', href: '/dashboard/subscriptions' },
    { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics' },
  ]

  return (
    <header className="bg-white dark:bg-chocolate-900 shadow-sm border-b border-gray-200 dark:border-chocolate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Image src="/logo.png" alt="Logo" width={100} height={32} className="rounded-full"/>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.id}
                href={item.href}
                className={`${
                  activePage === item.id
                    ? 'text-gray-900 dark:text-chocolate-100 font-medium'
                    : 'text-gray-500 dark:text-chocolate-400 hover:text-gray-900 dark:hover:text-chocolate-100 transition-colors'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <ThemeToggle />
            <button 
              onClick={handleSettings}
              className="p-2 text-gray-400 dark:text-chocolate-400 hover:text-gray-600 dark:hover:text-chocolate-200 transition-colors"
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 dark:text-chocolate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}