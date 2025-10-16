'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { FiPlus, FiCreditCard, FiTrendingUp, FiCalendar, FiPieChart } from 'react-icons/fi'
import { formatCurrency, formatDatePakistani as formatDate, getDaysUntilPayment } from '@/utils'
import Link from 'next/link'
import DashboardHeader from '@/components/ui/DashboardHeader'
import StatsCard from '@/components/ui/StatsCard'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown'
import LoadingState from '@/components/ui/LoadingState'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const {
    subscriptions,
    getActiveSubscriptions,
    getUpcomingPayments,
    getTotalMonthlyCost,
    getTotalYearlyCost
  } = useSubscriptions()
  const router = useRouter()

  // Calculate dashboard statistics
  const activeSubscriptions = getActiveSubscriptions()
  const upcomingPayments = getUpcomingPayments(7) // Next 7 days
  const monthlyTotal = getTotalMonthlyCost()
  const yearlyTotal = getTotalYearlyCost()
  const recentSubscriptions = subscriptions.slice(0, 5)

  // Group subscriptions by category for pie chart data
  const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
    const categoryName = sub.category?.name || 'Other'
    if (!acc[categoryName]) {
      acc[categoryName] = { count: 0, total: 0 }
    }
    acc[categoryName].count++
    
    // Convert to monthly cost for consistent comparison
    let monthlyCost = sub.cost
    if (sub.billing_cycle === 'yearly') {
      monthlyCost = sub.cost / 12
    } else if (sub.billing_cycle === 'weekly') {
      monthlyCost = sub.cost * 4.33
    }
    
    acc[categoryName].total += monthlyCost
    return acc
  }, {} as Record<string, { count: number; total: number }>)

  // Prepare category data for the component
  const categoryData = Object.entries(categoryBreakdown).map(([name, data], index) => {
    // Define colors for categories
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16', '#6B7280']
    return {
      name,
      count: data.count,
      total: data.total,
      color: colors[index % colors.length]
    }
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingState message="Loading dashboard..." fullscreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 transition-colors duration-300">
      {/* Header */}
      <DashboardHeader activePage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-chocolate-100 mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'User'}!
          </h2>
          <p className="text-gray-600 dark:text-chocolate-300">
            Here&apos;s an overview of your subscriptions and spending.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            title="Due This Week" 
            value={upcomingPayments.length} 
            icon={<FiCalendar className="w-6 h-6" />} 
            color="yellow" 
          />
          <StatsCard 
            title="Yearly Cost" 
            value={formatCurrency(yearlyTotal)} 
            icon={<FiTrendingUp className="w-6 h-6" />} 
            color="purple" 
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl mb-8 transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-chocolate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Category Breakdown & Upcoming Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown */}
          <CategoryBreakdown categoryData={categoryData} total={monthlyTotal} />
          
          {/* Upcoming Payments */}
          <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-chocolate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Upcoming Payments</h3>
            </div>
            <div className="p-6">
              {upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map((subscription) => {
                    const daysUntil = getDaysUntilPayment(subscription.next_payment_date)
                    return (
                      <div key={subscription.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-chocolate-600 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <FiCalendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-chocolate-100">{subscription.service_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-chocolate-100">{formatCurrency(subscription.cost)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(subscription.next_payment_date)}</p>
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

        {/* Recent Subscriptions */}
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-chocolate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Recent Subscriptions</h3>
          </div>
          <div className="p-6">
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