export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-chocolate-950 dark:to-chocolate-900 flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-chocolate-300 font-medium">Loading...</p>
      </div>
    </div>
  )
}