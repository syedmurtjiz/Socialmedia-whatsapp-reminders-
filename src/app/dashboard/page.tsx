'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useNotifications } from '@/hooks/useNotifications'
import { FiPlus, FiCreditCard, FiTrendingUp, FiCalendar, FiPieChart, FiBell, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { formatCurrency, formatDatePakistani as formatDate, getDaysUntilPayment } from '@/utils'
import Link from 'next/link'
import DashboardHeader from '@/components/ui/DashboardHeader'
import StatsCard from '@/components/ui/StatsCard'

 function DashboardSkeleton() {
   return (
     <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 transition-colors duration-300">
       <DashboardHeader activePage="dashboard" />
       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="mb-6 sm:mb-8 animate-pulse">
           <div className="h-8 w-64 bg-gray-200 dark:bg-chocolate-800 rounded mb-3"></div>
           <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-chocolate-800 rounded"></div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-pulse">
           <div className="h-24 bg-white dark:bg-chocolate-900 border border-gray-200 dark:border-chocolate-700 rounded-lg"></div>
           <div className="h-24 bg-white dark:bg-chocolate-900 border border-gray-200 dark:border-chocolate-700 rounded-lg"></div>
           <div className="h-24 bg-white dark:bg-chocolate-900 border border-gray-200 dark:border-chocolate-700 rounded-lg"></div>
           <div className="h-24 bg-white dark:bg-chocolate-900 border border-gray-200 dark:border-chocolate-700 rounded-lg"></div>
         </div>

         <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl mb-6 sm:mb-8 transition-colors duration-300 animate-pulse">
           <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-chocolate-700">
             <div className="h-5 w-40 bg-gray-200 dark:bg-chocolate-800 rounded"></div>
           </div>
           <div className="p-4 sm:p-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
               <div className="h-14 border-2 border-dashed border-gray-200 dark:border-chocolate-700 rounded-lg"></div>
               <div className="h-14 border-2 border-dashed border-gray-200 dark:border-chocolate-700 rounded-lg"></div>
               <div className="h-14 border-2 border-dashed border-gray-200 dark:border-chocolate-700 rounded-lg"></div>
             </div>
           </div>
         </div>

         <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300 animate-pulse">
           <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-chocolate-700">
             <div className="h-5 w-44 bg-gray-200 dark:bg-chocolate-800 rounded"></div>
           </div>
           <div className="p-4 sm:p-6 space-y-4">
             <div className="h-16 bg-gray-100 dark:bg-chocolate-800 rounded-lg"></div>
             <div className="h-16 bg-gray-100 dark:bg-chocolate-800 rounded-lg"></div>
             <div className="h-16 bg-gray-100 dark:bg-chocolate-800 rounded-lg"></div>
           </div>
         </div>
       </main>
     </div>
   )
 }

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const {
    subscriptions,
    loading: subscriptionsLoading,
    getActiveSubscriptions,
    getUpcomingPayments,
    getTotalMonthlyCost,
    getTotalYearlyCost
  } = useSubscriptions()
  const { notifications, getUnreadCount, loading: notificationsLoading } = useNotifications()
  const router = useRouter()

  // Calculate dashboard statistics
  const activeSubscriptions = getActiveSubscriptions()
  const upcomingPayments = getUpcomingPayments(7) // Next 7 days
  const monthlyTotal = getTotalMonthlyCost()
  const yearlyTotal = getTotalYearlyCost()
  const recentSubscriptions = subscriptions.slice(0, 5)
  
  // WhatsApp notification stats
  const whatsappNotifications = notifications.filter(n => n.type === 'whatsapp_reminder')
  const sentReminders = whatsappNotifications.filter(n => n.status === 'sent').length
  const failedReminders = whatsappNotifications.filter(n => n.status === 'failed').length
  const recentNotifications = notifications.slice(0, 5)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  if (authLoading || subscriptionsLoading || notificationsLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 transition-colors duration-300">
      {/* Header */}
      <DashboardHeader activePage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-chocolate-100 mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'User'}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-chocolate-300">
            Here&apos;s an overview of your subscriptions and spending.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard 
            title="Monthly Cost" 
            value={formatCurrency(monthlyTotal)} 
            icon={<FiCreditCard className="w-6 h-6" />} 
            color="blue" 
          />
          <StatsCard 
            title="Active Subscriptions" 
            value={activeSubscriptions.length} 
            icon={<FiTrendingUp className="w-6 h-6" />} 
            color="green" 
          />
          <StatsCard 
            title="WhatsApp Reminders" 
            value={sentReminders} 
            icon={<FiBell className="w-6 h-6" />} 
            color="purple" 
            description="sent successfully"
          />
          <StatsCard 
            title="Due This Week" 
            value={upcomingPayments.length} 
            icon={<FiCalendar className="w-6 h-6" />} 
            color="yellow" 
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl mb-6 sm:mb-8 transition-colors duration-300">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-chocolate-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-chocolate-100">Quick Actions</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link href="/dashboard/subscriptions?add=true" className="flex items-center p-4 border-2 border-dashed border-gray-300 dark:border-chocolate-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
                <FiPlus className="w-5 h-5 text-gray-400 dark:text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-chocolate-300 font-medium">Add Subscription</span>
              </Link>
              
              <Link href="/dashboard/subscriptions" className="flex items-center p-4 border-2 border-dashed border-gray-300 dark:border-chocolate-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
                <FiCreditCard className="w-5 h-5 text-gray-400 dark:text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-chocolate-300 font-medium">Manage Subscriptions</span>
              </Link>
              
              <Link href="/dashboard/analytics" className="flex items-center p-4 border-2 border-dashed border-gray-300 dark:border-chocolate-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
                <FiPieChart className="w-5 h-5 text-gray-400 dark:text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-chocolate-300 font-medium">View Analytics</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="mb-6 sm:mb-8">
          {/* Upcoming Payments */}
          <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-chocolate-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-chocolate-100">Upcoming Payments</h3>
            </div>
            <div className="p-4 sm:p-6">
              {upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map((subscription) => {
                    const daysUntil = getDaysUntilPayment(subscription.next_payment_date)
                    return (
                      <div key={subscription.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 dark:border-chocolate-600 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300 gap-3 sm:gap-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-chocolate-100 truncate">{subscription.service_name}</p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right pl-11 sm:pl-0">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-chocolate-100">{formatCurrency(subscription.cost)}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(subscription.next_payment_date)}</p>
                        </div>
                      </div>
                    )
                  })}
                  <Link href="/dashboard/subscriptions" className="block text-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                    View all subscriptions →
                  </Link>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <FiCalendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-chocolate-600" />
                  <p className="text-lg font-medium mb-2">No upcoming payments</p>
                  <p className="text-sm">Add subscriptions to see payment schedules</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        {recentNotifications.length > 0 && (
          <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300 mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-chocolate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-chocolate-100">Recent Notifications</h3>
                <span className="text-xs sm:text-sm px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-medium">
                  {getUnreadCount()} unread
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className={`flex items-start p-3 rounded-lg border ${
                    notification.status === 'read' 
                      ? 'bg-gray-50 dark:bg-chocolate-800 border-gray-200 dark:border-chocolate-600' 
                      : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                  }`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {notification.status === 'sent' ? (
                        <FiCheckCircle className="w-5 h-5 text-green-500" />
                      ) : notification.status === 'failed' ? (
                        <FiXCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <FiBell className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-chocolate-100">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-chocolate-300 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          notification.status === 'sent' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : notification.status === 'failed'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.status}
                        </span>
                        {notification.whatsapp_number && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            📱 {notification.whatsapp_number}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.created_at).toLocaleDateString('en-PK', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Subscriptions */}
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-chocolate-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-chocolate-100">Recent Subscriptions</h3>
          </div>
          <div className="p-4 sm:p-6">
            {recentSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {recentSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <FiCreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-chocolate-100">{subscription.service_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.start_date 
                            ? `Started ${formatDate(subscription.start_date)}` 
                            : `Added ${formatDate(subscription.created_at)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-chocolate-100">{formatCurrency(subscription.cost)}</p>
                      <p className={`text-xs font-medium px-2 py-1 rounded-full ${
                        subscription.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-chocolate-300'
                      }`}>
                        {subscription.status}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/subscriptions" className="block text-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                  Manage all subscriptions →
                </Link>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <FiCreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-chocolate-600" />
                <p className="text-lg font-medium mb-2">No subscriptions yet</p>
                <p className="text-sm mb-4">Start by adding your first subscription</p>
                <Link href="/dashboard/subscriptions?add=true" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  Add Subscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}