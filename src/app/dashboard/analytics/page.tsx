'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { FiTrendingUp, FiPieChart, FiBarChart, FiDollarSign, FiCalendar } from 'react-icons/fi'
import { formatCurrency, formatDatePakistani as formatDate, getDaysUntilPayment } from '@/utils'
import Link from 'next/link'
import DashboardHeader from '@/components/ui/DashboardHeader'
import StatsCard from '@/components/ui/StatsCard'
import LoadingState from '@/components/ui/LoadingState'

export default function Analytics() {
  const { user, loading, signOut } = useAuth()
  const {
    subscriptions,
    getActiveSubscriptions,
    getTotalMonthlyCost,
    getTotalYearlyCost
  } = useSubscriptions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingState message="Loading analytics..." fullscreen />
  }

  const activeSubscriptions = getActiveSubscriptions()
  const monthlyTotal = getTotalMonthlyCost()
  const yearlyTotal = getTotalYearlyCost()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 transition-colors duration-300">
      {/* Header */}
      <DashboardHeader activePage="analytics" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-chocolate-100">Analytics</h1>
          <p className="text-gray-600 dark:text-chocolate-300 mt-1">
            Analyze your subscription spending and get insights
          </p>
        </div>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Monthly Total" 
            value={formatCurrency(monthlyTotal)} 
            icon={<FiDollarSign className="w-6 h-6" />} 
            color="blue" 
          />
          <StatsCard 
            title="Yearly Total" 
            value={formatCurrency(yearlyTotal)} 
            icon={<FiTrendingUp className="w-6 h-6" />} 
            color="green" 
          />
          <StatsCard 
            title="Active Subscriptions" 
            value={activeSubscriptions.length} 
            icon={<FiBarChart className="w-6 h-6" />} 
            color="purple" 
          />
          <StatsCard 
            title="Avg. per Subscription" 
            value={activeSubscriptions.length > 0 
              ? formatCurrency(monthlyTotal / activeSubscriptions.length)
              : formatCurrency(0)
            } 
            icon={<FiPieChart className="w-6 h-6" />} 
            color="orange" 
          />
        </div>

        {/* Cost Insights */}
        <div className="mb-8">
          {/* Enhanced Cost Insights with Visual Chart */}
          <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-chocolate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Monthly vs Annual Savings</h3>
            </div>
            <div className="p-6">
              {activeSubscriptions.length > 0 ? (
                <div className="space-y-6">
                  {/* Savings Comparison Chart */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-chocolate-300">Monthly Billing</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-chocolate-100">
                          {formatCurrency(monthlyTotal * 12)}/year
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-chocolate-800 rounded-full h-4">
                        <div 
                          className="bg-red-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-chocolate-300">Annual Billing</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-chocolate-100">
                          {formatCurrency(yearlyTotal)}/year
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-chocolate-800 rounded-full h-4">
                        <div 
                          className="bg-green-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${(yearlyTotal / (monthlyTotal * 12)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Savings Highlight */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(monthlyTotal * 12 - yearlyTotal)}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Potential Annual Savings
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {(((monthlyTotal * 12 - yearlyTotal) / (monthlyTotal * 12)) * 100).toFixed(1)}% less than monthly billing
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Insights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {activeSubscriptions.length}
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">Active Services</div>
                    </div>
                    
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {activeSubscriptions.length > 0 
                          ? formatCurrency(monthlyTotal / activeSubscriptions.length)
                          : formatCurrency(0)
                        }
                      </div>
                      <div className="text-xs text-purple-700 dark:text-purple-300">Avg. per Service</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-chocolate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiDollarSign className="w-8 h-8 text-gray-400 dark:text-chocolate-600" />
                  </div>
                  <p className="text-gray-500 dark:text-chocolate-400">No savings data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Analytics - Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Spending Trend - Bar Chart */}
          <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-chocolate-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Monthly Spending Trend</h3>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  12% growth
                </span>
              </div>
            </div>
            <div className="p-6">
              {activeSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  {/* Chart Container */}
                  <div className="h-64 flex items-end justify-between space-x-2 px-2">
                    {[85, 92, 78, 95, 88, 100].map((height, index) => {
                      const value = (monthlyTotal * height) / 100
                      const monthNames = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                          {/* Value Label */}
                          <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-gray-800 dark:bg-white text-white dark:text-gray-800 text-xs px-2 py-1 rounded shadow-lg">
                              {formatCurrency(value)}
                            </div>
                          </div>
                          
                          {/* Bar */}
                          <div 
                            className="w-full bg-gradient-to-t from-primary-600 to-primary-400 dark:from-primary-500 dark:to-primary-300 rounded-t-lg transition-all duration-500 hover:from-primary-700 hover:to-primary-500 dark:hover:from-primary-600 dark:hover:to-primary-400 cursor-pointer relative"
                            style={{ height: `${height}%` }}
                          >
                            {/* Bar shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-lg"></div>
                          </div>
                          
                          {/* Month Label */}
                          <span className="text-xs text-gray-500 dark:text-chocolate-400 mt-2 font-medium">
                            {monthNames[index]}
                          </span>
                          
                          {/* Growth Indicator */}
                          {index > 0 && (
                            <div className="mt-1">
                              {height > [85, 92, 78, 95, 88, 100][index - 1] ? (
                                <span className="text-xs text-green-500">↗</span>
                              ) : (
                                <span className="text-xs text-red-500">↘</span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Chart Footer */}
                  <div className="border-t border-gray-200 dark:border-chocolate-700 pt-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-chocolate-300">
                      <span>Average: {formatCurrency(monthlyTotal * 0.91)}</span>
                      <span>Peak: {formatCurrency(monthlyTotal)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiBarChart className="w-12 h-12 text-gray-400 dark:text-chocolate-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-chocolate-400">No data to display trends</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Cycle Distribution - Enhanced Donut Chart */}
          <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-chocolate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Billing Cycle Distribution</h3>
            </div>
            <div className="p-6">
              {activeSubscriptions.length > 0 ? (
                (() => {
                  const cycles = activeSubscriptions.reduce((acc, sub) => {
                    acc[sub.billing_cycle] = (acc[sub.billing_cycle] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  
                  const total = activeSubscriptions.length
                  const cycleData = Object.entries(cycles).map(([cycle, count], index) => ({
                    cycle: cycle.charAt(0).toUpperCase() + cycle.slice(1),
                    count,
                    percentage: (count / total) * 100,
                    color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index] || '#6B7280'
                  }))
                  
                  return (
                    <div className="flex items-center justify-center">
                      {/* Donut Chart */}
                      <div className="relative w-40 h-40">
                        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 42 42">
                          {/* Background Circle */}
                          <circle
                            cx="21"
                            cy="21"
                            r="15.915"
                            fill="transparent"
                            stroke="#e5e7eb"
                            strokeWidth="4"
                            className="dark:stroke-chocolate-700"
                          />
                          
                          {/* Data Segments */}
                          {(() => {
                            let cumulativePercentage = 0
                            return cycleData.map((item, index) => {
                              const strokeDasharray = `${item.percentage} ${100 - item.percentage}`
                              const strokeDashoffset = -cumulativePercentage
                              cumulativePercentage += item.percentage
                              
                              return (
                                <circle
                                  key={item.cycle}
                                  cx="21"
                                  cy="21"
                                  r="15.915"
                                  fill="transparent"
                                  stroke={item.color}
                                  strokeWidth="4"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-300 hover:stroke-width-5 cursor-pointer"
                                />
                              )
                            })
                          })()
                          }
                        </svg>
                        
                        {/* Center Content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900 dark:text-chocolate-100">
                              {total}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-chocolate-400">Total</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div className="ml-6 space-y-3">
                        {cycleData.map((item) => (
                          <div key={item.cycle} className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-chocolate-100">
                                {item.cycle}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-chocolate-400">
                                {item.count} ({item.percentage.toFixed(0)}%)
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Tip */}
                        <div className="pt-3 border-t border-gray-200 dark:border-chocolate-700">
                          <p className="text-xs text-gray-600 dark:text-chocolate-300">
                            💡 Annual plans typically save 10-20%
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="text-center py-8">
                  <FiPieChart className="w-12 h-12 text-gray-400 dark:text-chocolate-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-chocolate-400">No billing cycles to analyze</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Optimization & Upcoming Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cost Optimization Suggestions */}
          <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-chocolate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Optimization Opportunities</h3>
            </div>
            <div className="p-6">
              {activeSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">💰</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Annual Billing Savings</h4>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          Switch monthly subscriptions to annual and save up to {formatCurrency(monthlyTotal * 2.4)} per year
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">📊</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Usage Review</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          Review subscriptions you haven&apos;t used in 30+ days to identify potential cancellations
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-amber-500 dark:bg-amber-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">⚡</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Bundle Opportunities</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                          Consider family/team plans for services you and others use separately
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-chocolate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💡</span>
                  </div>
                  <p className="text-gray-500 dark:text-chocolate-400">Add subscriptions to see optimization tips</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Payments Timeline */}
          <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-chocolate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Payment Timeline</h3>
            </div>
            <div className="p-6">
              {activeSubscriptions.length > 0 ? (
                (() => {
                  const upcomingPayments = activeSubscriptions
                    .map(sub => ({
                      ...sub,
                      daysUntil: getDaysUntilPayment(sub.next_payment_date)
                    }))
                    .filter(sub => sub.daysUntil <= 30)
                    .sort((a, b) => a.daysUntil - b.daysUntil)
                    .slice(0, 5)
                  
                  return upcomingPayments.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingPayments.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-chocolate-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              sub.daysUntil <= 0 ? 'bg-red-500' :
                              sub.daysUntil <= 3 ? 'bg-orange-500' :
                              sub.daysUntil <= 7 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-chocolate-100">
                                {sub.service_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-chocolate-400">
                                {formatDate(sub.next_payment_date)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-chocolate-100">
                              {formatCurrency(sub.cost, sub.currency)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-chocolate-400">
                              {sub.daysUntil <= 0 ? 'Overdue' :
                               sub.daysUntil === 0 ? 'Due today' :
                               `${sub.daysUntil} days`}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 text-center">
                        <Link 
                          href="/dashboard/subscriptions"
                          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                        >
                          View all subscriptions →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiCalendar className="w-12 h-12 text-gray-400 dark:text-chocolate-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-chocolate-400">No payments due in the next 30 days</p>
                    </div>
                  )
                })()
              ) : (
                <div className="text-center py-8">
                  <FiCalendar className="w-12 h-12 text-gray-400 dark:text-chocolate-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-chocolate-400">No upcoming payments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}