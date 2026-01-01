'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Clock, ShieldCheck, Headphones, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-chocolate-900 shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-chocolate-800"
                >
                    {/* Header Section - Matching Terms/Privacy Pages */}
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-8 py-16 text-center relative overflow-hidden">
                        {/* Subtle Background Pattern */}
                        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%2523ffffff%27%20fill-opacity%3D%270.1%27%3E%3Ccircle%20cx%3D%2730%27%20cy%3D%2730%27%20r%3D%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-3xl mb-8 backdrop-blur-md border border-white/20">
                                <Headphones className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight">
                                Contact Us
                            </h1>
                            <p className="mt-6 text-primary-50 text-lg leading-relaxed max-w-xl mx-auto opacity-90">
                                Have questions or need help? Our team is dedicated to providing you with the best experience.
                            </p>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="px-8 sm:px-12 py-16 space-y-16">
                        {/* Contact info grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Left Side: Direct Contact Details */}
                            <div className="space-y-10">
                                <section className="flex items-start space-x-5 group">
                                    <div className="flex-shrink-0 w-14 h-14 bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center rounded-2xl text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary-200 dark:border-primary-800">
                                        <Mail className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Email Inquiry</h3>
                                        <a href="mailto:info@duepilot.com" className="text-lg text-gray-600 dark:text-chocolate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold">
                                            info@duepilot.com
                                        </a>
                                        <p className="text-sm text-gray-400 dark:text-chocolate-400 mt-1 italic">For general questions and collaborations.</p>
                                    </div>
                                </section>

                                <section className="flex items-start space-x-5 group">
                                    <div className="flex-shrink-0 w-14 h-14 bg-green-100 dark:bg-green-900/40 flex items-center justify-center rounded-2xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-green-200 dark:border-green-800">
                                        <MessageSquare className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Dedicated Support</h3>
                                        <a href="mailto:support@duepilot.com" className="text-lg text-gray-600 dark:text-chocolate-200 hover:text-green-600 dark:hover:text-green-400 transition-colors font-semibold">
                                            support@duepilot.com
                                        </a>
                                        <p className="text-sm text-gray-400 dark:text-chocolate-400 mt-1 italic">For technical issues and account help.</p>
                                    </div>
                                </section>

                                <section className="flex items-start space-x-5 group">
                                    <div className="flex-shrink-0 w-14 h-14 bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-200 dark:border-blue-800">
                                        <Clock className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Business Hours</h3>
                                        <p className="text-lg text-gray-600 dark:text-chocolate-200 font-semibold">
                                            Monday - Friday: 9am - 6pm
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-chocolate-400 mt-1 italic">We respond within 24 hours.</p>
                                    </div>
                                </section>
                            </div>

                            {/* Right Side: Trust Card */}
                            <div className="h-full">
                                <div className="h-full bg-gray-50 dark:bg-chocolate-800/20 p-10 rounded-[2.5rem] border border-gray-100 dark:border-chocolate-700 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                                    <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ShieldCheck className="w-32 h-32 text-primary-500" />
                                    </div>
                                    <div className="flex items-center space-x-3 mb-6 relative z-10">
                                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                                            <ShieldCheck className="w-7 h-7" />
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Our Commitment</h4>
                                    </div>
                                    <p className="text-lg text-gray-600 dark:text-chocolate-200 leading-relaxed italic relative z-10 blockquote border-l-4 border-primary-200 dark:border-chocolate-600 pl-6">
                                        "Our team is dedicated to providing you with the best subscription management experience. We constantly strive to improve our services based on your valuable feedback."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Section */}
                    <div className="bg-gray-50/50 dark:bg-chocolate-800/40 px-8 py-12 border-t border-gray-100 dark:border-chocolate-700 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-black text-lg hover:text-primary-700 dark:hover:text-primary-300 transition-colors group"
                        >
                            <span>Back to Explore Services</span>
                            <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
