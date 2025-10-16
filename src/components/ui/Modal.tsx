'use client'

import { useEffect, useRef } from 'react'
import { FiX } from 'react-icons/fi'

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          ref={modalRef}
          className="relative bg-white dark:bg-chocolate-900 rounded-lg shadow-xl dark:shadow-2xl border border-gray-200 dark:border-chocolate-700 w-full max-w-md transform transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-chocolate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-chocolate-200 transition-colors"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}