'use client'

import { useEffect } from 'react'
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Global error occurred
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong!
              </h1>
              
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please try again.
              </p>

              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-gray-900 mb-2">Error Details:</p>
                  <p className="text-xs text-red-600 font-mono break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-500 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={reset}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center"
                >
                  <FiHome className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}