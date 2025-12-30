'use client'

import React, { useState } from 'react'
import { FiMail, FiClock, FiHelpCircle } from 'react-icons/fi'
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'
import Modal from '@/components/ui/Modal'

type ModalType = 'contact' | 'terms' | 'privacy' | null

export default function Footer() {
    const [openModal, setOpenModal] = useState<ModalType>(null)

    const handleOpenModal = (type: ModalType) => {
        setOpenModal(type)
    }

    const handleCloseModal = () => {
        setOpenModal(null)
    }

    return (
        <footer className="bg-gray-50 dark:bg-chocolate-950 border-t border-gray-200 dark:border-chocolate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">

                    {/* Left: Logo & Tagline */}
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center space-x-2">
                            {/* Placeholder Logo Icon if needed, or just text */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">DuePilot</h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Optimize your subscriptions.
                        </p>
                    </div>

                    {/* Center: Legal Links */}
                    <div className="flex items-center space-x-8">
                        <button
                            onClick={() => handleOpenModal('contact')}
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative group"
                        >
                            <span>Contact</span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all group-hover:w-full"></span>
                        </button>
                        <button
                            onClick={() => handleOpenModal('terms')}
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative group"
                        >
                            <span>Terms of Service</span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all group-hover:w-full"></span>
                        </button>
                        <button
                            onClick={() => handleOpenModal('privacy')}
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative group"
                        >
                            <span>Privacy Policy</span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all group-hover:w-full"></span>
                        </button>
                    </div>

                    {/* Right: Socials & Copyright */}
                    <div className="flex flex-col items-center md:items-end space-y-2">
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                <FaFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                <FaTwitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                <FaLinkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                <FaInstagram className="w-5 h-5" />
                            </a>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            &copy; {new Date().getFullYear()} DuePilot. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={openModal === 'contact'}
                onClose={handleCloseModal}
                title="Contact Us"
            >
                <div className="space-y-8 text-gray-600 dark:text-chocolate-300">
                    <p className="text-lg leading-relaxed">
                        For any inquiries, collaborations, or support, please feel free to reach out to us. We are here to help you optimize your subscription management.
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-chocolate-800/50 border border-gray-100 dark:border-chocolate-700">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                    <FiMail className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-chocolate-100">Email</span>
                            </div>
                            <p className="text-sm">info@duepilot.com</p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-chocolate-800/50 border border-gray-100 dark:border-chocolate-700">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                    <FiHelpCircle className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-chocolate-100">Support</span>
                            </div>
                            <p className="text-sm">support@duepilot.com</p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-chocolate-800/50 border border-gray-100 dark:border-chocolate-700 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                    <FiClock className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-chocolate-100">Business Hours</span>
                            </div>
                            <p className="text-sm">Monday - Friday: 9:00 AM - 6:00 PM (EST)</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-chocolate-800">
                        <p className="text-sm italic text-gray-500 text-center">
                            Our team is dedicated to providing you with the best experience. We typically respond within 24 hours.
                        </p>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={openModal === 'terms'}
                onClose={handleCloseModal}
                title="Terms of Service"
            >
                <div className="space-y-6 text-gray-600 dark:text-chocolate-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-lg leading-relaxed border-b border-gray-100 dark:border-chocolate-800 pb-4">
                        Welcome to DuePilot. By accessing or using our website, you agree to be bound by these Terms of Service.
                    </p>

                    <div className="space-y-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-chocolate-100 flex items-center">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm mr-3">1</span>
                            Acceptance of Terms
                        </h4>
                        <p className="pl-9 text-sm leading-relaxed">By using this service, you accept these terms in full. If you disagree with these terms and conditions or any part of these terms and conditions, you must not use this website.</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-chocolate-100 flex items-center">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm mr-3">2</span>
                            Use of Service
                        </h4>
                        <p className="pl-9 text-sm leading-relaxed">You agree to use this service only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-chocolate-100 flex items-center">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm mr-3">3</span>
                            Account Security
                        </h4>
                        <p className="pl-9 text-sm leading-relaxed">You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer to prevent unauthorized access to your account.</p>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={openModal === 'privacy'}
                onClose={handleCloseModal}
                title="Privacy Policy"
            >
                <div className="space-y-4 text-gray-600 dark:text-chocolate-300 max-h-[60vh] overflow-y-auto">
                    <p>At DuePilot, we take your privacy seriously.</p>
                    <h4 className="font-bold text-gray-900 dark:text-chocolate-100">1. Information Collection</h4>
                    <p>We collect information you provide directly to us.</p>
                    <h4 className="font-bold text-gray-900 dark:text-chocolate-100">2. Data Usage</h4>
                    <p>We use your data to provide and improve our services.</p>
                    <h4 className="font-bold text-gray-900 dark:text-chocolate-100">3. Data Protection</h4>
                    <p>We implement security measures to protect your personal information.</p>
                </div>
            </Modal>
        </footer>
    )
}
