import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ConsoleCleanup } from '@/components/ConsoleCleanup'
import Footer from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DuePilot - Manage Your Subscriptions',
  description: 'Track, manage, and optimize your online subscriptions with intelligent alerts and cost analysis.',
  keywords: 'subscription tracker, subscription management, cost optimization, budget tracker',
  authors: [{ name: 'Subscription Tracker Team' }],
  icons: {
    icon: ['/favicon.svg', '/favicon.ico'],
    shortcut: ['/favicon.svg', '/favicon.ico'],
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ConsoleCleanup>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <div className="min-h-screen flex flex-col transition-colors duration-300">
                  <div className="flex-grow">
                    {children}
                  </div>
                  <Footer />
                </div>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ConsoleCleanup>
      </body>
    </html>
  )
}