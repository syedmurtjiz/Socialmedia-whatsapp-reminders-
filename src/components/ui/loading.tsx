interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 ${sizeClasses[size]} ${className}`}></div>
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-chocolate-300">{message}</p>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  show: boolean
  message?: string
}

export function LoadingOverlay({ show, message = 'Loading...' }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-chocolate-900 rounded-lg p-6 text-center transition-colors duration-300">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-chocolate-300">{message}</p>
      </div>
    </div>
  )
}