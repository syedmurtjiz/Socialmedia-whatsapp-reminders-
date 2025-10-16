import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  description?: string
}

export default function StatsCard({ title, value, icon, color, description }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  }

  return (
    <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl p-6 transition-colors duration-300">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-chocolate-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-chocolate-100">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-chocolate-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}