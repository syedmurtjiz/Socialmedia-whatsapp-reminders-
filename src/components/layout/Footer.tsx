'use client'

import React from 'react'
import Link from 'next/link'
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'

export default function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-chocolate-950 border-t border-gray-200 dark:border-chocolate-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    {/* Brand & Copyright */}
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">DuePilot</h3>
                        <p className="text-sm text-gray-500 dark:text-chocolate-400 mt-1">
                            &copy; {new Date().getFullYear()} DuePilot. All rights reserved.
                        </p>
                    </div>

                    {/* Simple Links */}
                    <div className="flex flex-wrap justify-center space-x-6">
                        <Link href="/contact" className="text-sm font-medium text-gray-600 dark:text-chocolate-200 hover:text-primary-600 transition-colors">
                            Contact
                        </Link>
                        <Link href="/terms" className="text-sm font-medium text-gray-600 dark:text-chocolate-200 hover:text-primary-600 transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-sm font-medium text-gray-600 dark:text-chocolate-200 hover:text-primary-600 transition-colors">
                            Privacy
                        </Link>
                    </div>

                    {/* Socials */}
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <FaFacebook size={18} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <FaTwitter size={18} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <FaLinkedin size={18} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <FaInstagram size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
