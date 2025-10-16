'use client'

import Link from 'next/link'
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-chocolate-950 dark:to-chocolate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow-lg dark:shadow-2xl p-8 transition-colors duration-300">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiSearch className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-chocolate-100 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-chocolate-200 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 dark:text-chocolate-300 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 inline-flex items-center justify-center"
            >
              <FiHome className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-chocolate-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 inline-flex items-center justify-center"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}