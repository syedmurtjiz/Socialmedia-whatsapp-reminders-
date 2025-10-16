import React from 'react'

interface LoadingStateProps {
  message?: string
  fullscreen?: boolean
}

export default function LoadingState({ message = 'Loading...', fullscreen = false }: LoadingStateProps) {
  if (fullscreen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full border-2 border-gray-300 dark:border-chocolate-600 border-t-blue-600 dark:border-t-blue-400 w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-chocolate-300">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full border-2 border-gray-300 dark:border-chocolate-600 border-t-blue-600 dark:border-t-blue-400 w-6 h-6 mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-chocolate-300 text-sm">{message}</p>
      </div>
    </div>
  )
}