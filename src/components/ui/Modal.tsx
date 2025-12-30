'use client'

import { useEffect, useRef } from 'react'
import { FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  showCloseButton?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-3xl min-h-[500px] bg-white dark:bg-chocolate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-chocolate-700 flex flex-col overflow-hidden z-20"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-400/20 relative overflow-hidden">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')]"></div>

              <h3 className="text-2xl font-bold text-white tracking-tight relative z-10 drop-shadow-sm">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="relative z-10 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  aria-label="Close"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}