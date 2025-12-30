'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header Navigation */}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-chocolate-800 dark:to-chocolate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%2523ffffff%27%20fill-opacity%3D%270.1%27%3E%3Ccircle%20cx%3D%2730%27%20cy%3D%2730%27%20r%3D%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Take Control of Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-amber-300 dark:to-orange-400">
                Subscriptions
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 dark:text-amber-100 max-w-3xl mx-auto">
              Track, manage, and optimize your online subscriptions with intelligent alerts
              and detailed cost analysis. Never miss a payment or waste money again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-primary-600 dark:hover:text-chocolate-900 transition-all duration-200 text-center backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-chocolate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-chocolate-100 mb-4">
              Everything You Need to Manage Subscriptions
            </h2>
            <p className="text-xl text-gray-600 dark:text-chocolate-300 max-w-2xl mx-auto">
              Our comprehensive platform helps you stay on top of all your subscriptions
              with powerful tracking and analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-chocolate-900/50 hover:bg-gray-100 dark:hover:bg-chocolate-900/70 transition-all duration-200 group hover:shadow-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                📊
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-chocolate-100">Smart Dashboard</h3>
              <p className="text-gray-600 dark:text-chocolate-300">
                Get a clear overview of your spending with interactive charts and analytics
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-chocolate-900/50 hover:bg-gray-100 dark:hover:bg-chocolate-900/70 transition-all duration-200 group hover:shadow-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                🔔
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-chocolate-100">Smart Management</h3>
              <p className="text-gray-600 dark:text-chocolate-300">
                Easily track and manage all your subscriptions in one place
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-chocolate-900/50 hover:bg-gray-100 dark:hover:bg-chocolate-900/70 transition-all duration-200 group hover:shadow-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                🏷️
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-chocolate-100">Category Organization</h3>
              <p className="text-gray-600 dark:text-chocolate-300">
                Organize subscriptions by category for better visibility and control
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-chocolate-900/50 hover:bg-gray-100 dark:hover:bg-chocolate-900/70 transition-all duration-200 group hover:shadow-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                💰
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-chocolate-100">Cost Analysis</h3>
              <p className="text-gray-600 dark:text-chocolate-300">
                Track your spending patterns and identify opportunities to save money
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-chocolate-900/50 hover:bg-gray-100 dark:hover:bg-chocolate-900/70 transition-all duration-200 group hover:shadow-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                🔒
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-chocolate-100">Secure & Private</h3>
              <p className="text-gray-600 dark:text-chocolate-300">
                Your data is encrypted and secure with industry-standard security measures
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-chocolate-900/50 hover:bg-gray-100 dark:hover:bg-chocolate-900/70 transition-all duration-200 group hover:shadow-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                📱
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-chocolate-100">Multi-Platform</h3>
              <p className="text-gray-600 dark:text-chocolate-300">
                Access your subscriptions from anywhere with our responsive web app
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 dark:bg-chocolate-950 text-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-transparent dark:from-amber-900/20" />

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-xl text-gray-300 dark:text-chocolate-300 mb-8">
            Join thousands of users who have already optimized their subscription spending.
          </p>
          <Link
            href="/auth"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 inline-block"
          >
            Start Managing Subscriptions
          </Link>
        </div>
      </section>
    </main>
  )
}