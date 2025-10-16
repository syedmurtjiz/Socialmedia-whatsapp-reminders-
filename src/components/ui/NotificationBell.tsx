'use client'

import { useState, useRef, useEffect } from 'react'
import { FiBell, FiX, FiCheck, FiClock, FiMessageSquare, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { useNotifications } from '@/hooks/useNotifications'
import { format } from 'date-fns'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, loading, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const unreadCount = getUnreadCount()

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
                      notification.status !== 'read' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-chocolate-800 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          {/* Status Icon */}
                          {notification.status === 'sent' && (
                            <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          {notification.status === 'failed' && (
                            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          {notification.status === 'pending' && (
                            <FiClock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          )}
                          {notification.type === 'whatsapp_reminder' && (
                            <FiMessageSquare className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            {/* Subscription name as title */}
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-chocolate-100 text-base">
                                {notification.title.replace('Reminder: ', '').replace('Failed: ', '')}
                              </h4>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                notification.status === 'sent' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : notification.status === 'failed'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {notification.status === 'sent' ? '✓' : notification.status === 'failed' ? '✗' : '⏳'}
                              </span>
                            </div>
                            
                            {/* WhatsApp Message - Exact same as sent */}
                            <div className="bg-green-50 dark:bg-green-900/10 border-l-3 border-green-500 p-2 rounded mb-2">
                              <p className="text-sm text-gray-800 dark:text-chocolate-200 whitespace-pre-wrap">
                                {notification.message}
                              </p>
                            </div>
                            
                            {/* Time sent */}
                            {notification.sent_at && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-chocolate-300">
                                <FiClock className="w-3 h-3" />
                                <span>Sent at {new Date(notification.sent_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true
                                })}</span>
                              </div>
                            )}
                            
                            {notification.error_message && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                ❌ {notification.error_message}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {notification.status !== 'read' && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-chocolate-200 flex-shrink-0"
                            title="Mark as read"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-chocolate-700 text-xs text-gray-500 dark:text-chocolate-400">
                        <span>
                          {notification.sent_at 
                            ? formatDate(notification.sent_at)
                            : formatDate(notification.created_at)
                          }
                        </span>
                        {notification.status !== 'read' && (
                          <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                            <FiClock className="w-3 h-3 mr-1" />
                            New
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