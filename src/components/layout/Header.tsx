'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import DashboardHeader from '@/components/ui/DashboardHeader'

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        if (user) return

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [user])

    if (user) {
        return <DashboardHeader activePage="dashboard" />
    }

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${isScrolled
                    ? 'bg-white dark:bg-chocolate-950 border-b border-gray-200 dark:border-chocolate-800'
                    : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="DuePilot"
                                width={110}
                                height={35}
                                className="h-auto w-auto"
                                priority
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="text-sm font-medium text-gray-600 dark:text-chocolate-200 hover:text-primary-600 dark:hover:text-primary-400">
                                Home
                            </Link>
                            <Link href="/auth" className="text-sm font-medium text-gray-600 dark:text-chocolate-200 hover:text-primary-600 dark:hover:text-primary-400">
                                Sign In
                            </Link>
                            <ThemeToggle />
                        </nav>

                        {/* Mobile Controls */}
                        <div className="flex md:hidden items-center space-x-4">
                            <ThemeToggle />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-600 dark:text-chocolate-200"
                            >
                                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white dark:bg-chocolate-950 px-6 pt-24 md:hidden">
                    <nav className="flex flex-col space-y-6">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-900 dark:text-white">Home</Link>
                        <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-900 dark:text-white">Sign In</Link>
                    </nav>
                </div>
            )}
        </>
    )
}
