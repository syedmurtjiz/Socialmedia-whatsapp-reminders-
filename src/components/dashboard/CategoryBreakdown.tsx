'use client'

import React from 'react'
import { FiPieChart } from 'react-icons/fi'
import Link from 'next/link'
import { formatCurrency } from '@/utils'

interface CategoryData {
  name: string
  count: number
  total: number
  color: string
}

interface CategoryBreakdownProps {
  categoryData: CategoryData[]
  total: number
}

export default function CategoryBreakdown({ categoryData, total }: CategoryBreakdownProps) {
  if (categoryData.length === 0) {
    return (
      <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Spending by Category</h3>
          <Link href="/dashboard/analytics" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            View Details
          </Link>
        </div>
        <div className="text-center py-8">
          <FiPieChart className="w-12 h-12 text-gray-400 dark:text-chocolate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-chocolate-400">No subscriptions to analyze</p>
          <Link 
            href="/dashboard/subscriptions" 
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
          >
            Add your first subscription
          </Link>
        </div>
      </div>
    )
  }

  // Sort categories by total spending
  const sortedCategories = [...categoryData].sort((a, b) => b.total - a.total)
  
  // Take top 4 categories, group the rest as "Other"
  const topCategories = sortedCategories.slice(0, 4)
  const otherCategories = sortedCategories.slice(4)
  
  const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.total, 0)
  const otherCount = otherCategories.reduce((sum, cat) => sum + cat.count, 0)
  
  const displayCategories = otherTotal > 0 
    ? [...topCategories, { name: 'Other', count: otherCount, total: otherTotal, color: '#6B7280' }] 
    : topCategories

  return (
    <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Spending by Category</h3>
        <Link href="/dashboard/analytics" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
          View Details
        </Link>
      </div>
      
      <div className="flex items-center justify-center">
        {/* Pie Chart Container */}
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 42 42">
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth="3"
              className="dark:stroke-chocolate-700"
            />
            {(() => {
              let cumulativePercentage = 0
              return displayCategories.map((category, index) => {
                const percentage = (category.total / total) * 100
                const strokeDasharray = `${percentage} ${100 - percentage}`
                const strokeDashoffset = -cumulativePercentage
                cumulativePercentage += percentage
                
                return (
                  <circle
                    key={category.name}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={category.color}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                )
              })
            })()}
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-chocolate-100">
                {formatCurrency(total)}
              </div>
              <div className="text-xs text-gray-500 dark:text-chocolate-400">Total</div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="ml-6 space-y-2">
          {displayCategories.map((category) => (
            <div key={category.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-chocolate-100 truncate">
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-chocolate-300 ml-2">
                    {formatCurrency(category.total)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-chocolate-400">
                  {category.count} subscription{category.count !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}