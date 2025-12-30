'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
                        <button onClick={() => handleOpenModal('contact')} className="text-sm font-medium text-gray-600 dark:text-chocolate-200 hover:text-primary-600 transition-colors">
                            Contact
                        </button>
                        <button onClick={() => handleOpenModal('terms')} className="text-sm font-medium text-gray-600 dark:text-chocolate-200 hover:text-primary-600 transition-colors">
                            Terms
                        </button>
                        <button onClick={() => handleOpenModal('privacy')} className="text-sm font-medium text-gray-600 dark:text-chocolate-200 hover:text-primary-600 transition-colors">
                            Privacy
                        </button>
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

            {/* Modals */}
            <Modal
                isOpen={openModal === 'contact'}
                onClose={handleCloseModal}
                title="Contact Us"
            >
                <div className="space-y-4 py-4 dark:text-chocolate-100 text-gray-600">
                    <p>For support or any inquiries, please contact us at:</p>
                    <div className="space-y-2">
                        <p><strong>Email:</strong> support@duepilot.com</p>
                        <p><strong>Support:</strong> help.duepilot.com</p>
                    </div>
                    <p className="text-sm text-gray-500">We usually respond within 24 hours.</p>
                </div>
            </Modal>

            <Modal
                isOpen={openModal === 'terms'}
                onClose={handleCloseModal}
                title="Terms of Service"
            >
                <div className="space-y-4 py-4 dark:text-chocolate-100 text-gray-600 max-h-[60vh] overflow-y-auto pr-2">
                    <h4 className="font-bold">1. Agreement to Terms</h4>
                    <p className="text-sm">By using DuePilot, you agree to these terms in full.</p>
                    <h4 className="font-bold">2. Use License</h4>
                    <p className="text-sm">We grant you a personal, non-exclusive license to use our services.</p>
                    <h4 className="font-bold">3. Account Security</h4>
                    <p className="text-sm">You are responsible for your account&apos;s security and activities.</p>
                </div>
            </Modal>

            <Modal
                isOpen={openModal === 'privacy'}
                onClose={handleCloseModal}
                title="Privacy Policy"
            >
                <div className="space-y-4 py-4 dark:text-chocolate-100 text-gray-600 max-h-[60vh] overflow-y-auto pr-2">
                    <h4 className="font-bold">1. Data Collection</h4>
                    <p className="text-sm">We collect only necessary information to provide our services.</p>
                    <h4 className="font-bold">2. Data Security</h4>
                    <p className="text-sm">Your data is stored securely using industry-standard measures.</p>
                    <h4 className="font-bold">3. Third Parties</h4>
                    <p className="text-sm">We never sell your personal information to third parties.</p>
                </div>
            </Modal>
        </footer>
    )
}
