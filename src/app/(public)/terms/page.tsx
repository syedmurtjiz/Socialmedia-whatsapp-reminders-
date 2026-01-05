'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Shield, UserCheck, AlertCircle } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-chocolate-900 shadow-xl rounded-3xl overflow-hidden border border-gray-100 dark:border-chocolate-800"
                >
                    {/* Header Section */}
                    <div className="bg-primary-600 px-8 py-12 text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Terms of Service
                        </h1>
                        <p className="mt-4 text-primary-100 max-w-2xl mx-auto">
                            Last updated: January 1, 2026. Please read these terms carefully before using Our Service.
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="px-8 py-12 space-y-12">
                        {/* Section 1 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-primary-600 dark:text-primary-400 font-bold">
                                <Shield className="w-6 h-6" />
                                <h2 className="text-2xl">1. Agreement to Terms</h2>
                            </div>
                            <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-chocolate-200">
                                <p>
                                    By accessing or using DuePilot, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-primary-600 dark:text-primary-400 font-bold">
                                <UserCheck className="w-6 h-6" />
                                <h2 className="text-2xl">2. Use License</h2>
                            </div>
                            <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-chocolate-200">
                                <p>
                                    Permission is granted to temporarily download one copy of the materials (information or software) on DuePilot{`'`}s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li>Modify or copy the materials.</li>
                                    <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial).</li>
                                    <li>Attempt to decompile or reverse engineer any software contained on DuePilot{`'`}s website.</li>
                                    <li>Remove any copyright or other proprietary notations from the materials.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-primary-600 dark:text-primary-400 font-bold">
                                <AlertCircle className="w-6 h-6" />
                                <h2 className="text-2xl">3. Account Security</h2>
                            </div>
                            <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-chocolate-200">
                                <p>
                                    You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-primary-600 dark:text-primary-400 font-bold">
                                <Shield className="w-6 h-6" />
                                <h2 className="text-2xl">4. Disclaimer</h2>
                            </div>
                            <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-chocolate-200">
                                <p>
                                    The materials on DuePilot{`'`}s website are provided on an {`'`}as is{`'`} basis. DuePilot makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-gray-50 dark:bg-chocolate-800/50 px-8 py-6 border-t border-gray-100 dark:border-chocolate-700">
                        <p className="text-sm text-center text-gray-500 dark:text-chocolate-400">
                            Questions about the Terms of Service? <a href="/contact" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Contact us</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
