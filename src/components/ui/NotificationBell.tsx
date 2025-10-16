'use client'

import { useState, useRef, useEffect } from 'react'
import { FiBell, FiX, FiCheck, FiClock } from 'react-icons/fi'
import { useNotifications } from '@/contexts/NotificationContext'
import { format } from 'date-fns'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'MMM d, yyyy h:mm a')
  }

  // Handle marking a notification as read
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 dark:text-chocolate-400 hover:text-gray-600 dark:hover:text-chocolate-200 transition-colors relative"
        title="Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-chocolate-900 rounded-lg shadow-xl dark:shadow-2xl border border-gray-200 dark:border-chocolate-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-chocolate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-chocolate-100">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <FiBell className="w-8 h-8 mx-auto text-gray-400 dark:text-chocolate-500 mb-2" />
                <p className="text-gray-500 dark:text-chocolate-400">No notifications</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`border-b border-gray-100 dark:border-chocolate-700 last:border-0 ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-chocolate-800 transition-colors">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-chocolate-100">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-chocolate-200"
                            title="Mark as read"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-chocolate-300 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-chocolate-400">
                          {formatDate(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <FiClock className="w-3 h-3 mr-1" />
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-chocolate-700 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 dark:text-chocolate-400 hover:text-gray-700 dark:hover:text-chocolate-200 flex items-center justify-center w-full"
            >
              <FiX className="w-4 h-4 mr-1" />
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}