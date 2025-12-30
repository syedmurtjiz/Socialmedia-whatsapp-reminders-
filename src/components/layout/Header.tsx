'use client'

import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Header() {
    return (
        <header className="bg-white/80 dark:bg-chocolate-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-chocolate-700 transition-colors duration-300 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={120}
                                height={10}
                                className="mx-auto"
                            />
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <Link
                            href="/auth"
                            className="text-gray-600 dark:text-chocolate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
