'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, ShieldCheck, Database } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-chocolate-900 shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-chocolate-800"
                >
                    {/* Hero Branding */}
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-8 py-16 text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-3xl mb-8 backdrop-blur-md">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="mt-6 text-primary-100 max-w-xl mx-auto text-lg">
                            Your privacy is our priority. Learn how DuePilot protects your information and ensures data security.
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="px-8 sm:px-12 py-16 space-y-16">
                        {/* Section 1 */}
                        <section className="relative pl-12">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                                <Database className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
                            <div className="prose prose-md text-gray-600 dark:text-chocolate-200">
                                <p>
                                    We collect information that you provide directly to us when you create an account, update your profile, or use our services. This may include:
                                </p>
                                <ul className="list-disc space-y-2 mt-4 marker:text-primary-500">
                                    <li><strong>Account Data:</strong> Name, email address, and encrypted passwords.</li>
                                    <li><strong>Subscription Data:</strong> Information about your recurring payments, bills, and payment dates to provide reminders.</li>
                                    <li><strong>Usage Data:</strong> Information about how you interact with our application.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="relative pl-12">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Data</h2>
                            <div className="prose prose-md text-gray-600 dark:text-chocolate-200">
                                <p>
                                    DuePilot uses the collected data for various purposes:
                                </p>
                                <ul className="list-disc space-y-2 mt-4 marker:text-green-500">
                                    <li>To provide and maintain our Service.</li>
                                    <li>To notify you about changes to our Service.</li>
                                    <li>To provide intelligent reminders and cost analysis.</li>
                                    <li>To monitor the usage of the Service and detect technical issues.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="relative pl-12">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Eye className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Sharing & Third Parties</h2>
                            <div className="prose prose-md text-gray-600 dark:text-chocolate-200">
                                <p>
                                    We do not sell, trade, or otherwise transfer your personal information to third parties. This does not include trusted third parties who assist us in operating our website or conducting our business, so long as those parties agree to keep this information confidential.
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="relative pl-12">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Security of Your Data</h2>
                            <div className="prose prose-md text-gray-600 dark:text-chocolate-200">
                                <p>
                                    The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Bottom CTA */}
                    <div className="bg-gray-50 dark:bg-chocolate-800/50 px-8 py-10 border-t border-gray-100 dark:border-chocolate-700 text-center">
                        <p className="text-gray-500 dark:text-chocolate-400 mb-4">
                            Need more information about your data?
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-chocolate-700 border border-gray-200 dark:border-chocolate-600 rounded-2xl text-gray-900 dark:text-white font-bold hover:shadow-lg transition-all"
                        >
                            <span>Contact Our Data Officer</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
