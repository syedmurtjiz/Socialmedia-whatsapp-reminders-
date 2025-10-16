'use client'

import React from 'react'
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error | null; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl p-8 transition-colors duration-300">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-chocolate-100 mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 dark:text-chocolate-300 mb-6">
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-gray-100 dark:bg-chocolate-800 rounded-lg p-4 mb-6 text-left transition-colors duration-300">
              <p className="text-sm font-medium text-gray-900 dark:text-chocolate-100 mb-2">Error Details:</p>
              <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetError}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-chocolate-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center"
            >
              <FiHome className="w-4 h-4 mr-2" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary