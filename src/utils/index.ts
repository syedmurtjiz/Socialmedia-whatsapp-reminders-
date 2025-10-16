import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, addMonths, addWeeks, addDays, differenceInDays, isAfter, isBefore } from 'date-fns'
import { BillingCycle, Currency } from '@/types'

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting
export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    // Handle YYYY-MM-DD format in local timezone
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number)
      dateObj = new Date(year, month - 1, day)
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = new Date(date)
  }
  
  return format(dateObj, 'dd/MM/yyyy')
}

// Pakistani date formatting (DD/MM/YYYY)
export function formatDatePakistani(date: string | Date): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    // Handle YYYY-MM-DD format in local timezone
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number)
      dateObj = new Date(year, month - 1, day)
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = new Date(date)
  }
  
  return format(dateObj, 'dd/MM/yyyy')
}

// US date formatting (MMM dd, yyyy) for compatibility
export function formatDateUS(date: string | Date): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    // Handle YYYY-MM-DD format in local timezone
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number)
      dateObj = new Date(year, month - 1, day)
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = new Date(date)
  }
  
  return format(dateObj, 'MMM dd, yyyy')
}

export function formatDateShort(date: string | Date): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    // Handle YYYY-MM-DD format in local timezone
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number)
      dateObj = new Date(year, month - 1, day)
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = new Date(date)
  }
  
  return format(dateObj, 'dd/MM')
}

export function formatDateTime(date: string | Date): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    // Handle YYYY-MM-DD format in local timezone
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number)
      dateObj = new Date(year, month - 1, day)
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = new Date(date)
  }
  
  return format(dateObj, 'MMM dd, yyyy h:mm a')
}

export function getRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Calculate next payment date based on billing cycle
export function calculateNextPaymentDate(
  currentDate: Date | string,
  billingCycle: BillingCycle,
  customCycleDays?: number
): Date {
  let date: Date
  
  if (typeof currentDate === 'string') {
    // Parse YYYY-MM-DD format in local timezone
    const [year, month, day] = currentDate.split('-').map(Number)
    date = new Date(year, month - 1, day)
  } else {
    date = new Date(currentDate)
  }
  
  const nextDate = new Date(date)
  
  switch (billingCycle) {
    case 'monthly':
      nextDate.setMonth(date.getMonth() + 1)
      // Handle month-end edge cases (e.g., Jan 31 -> Feb 28)
      if (nextDate.getDate() !== date.getDate()) {
        nextDate.setDate(0) // Set to last day of previous month
      }
      break
    case 'yearly':
      nextDate.setFullYear(date.getFullYear() + 1)
      // Handle leap year edge case (Feb 29)
      if (nextDate.getDate() !== date.getDate()) {
        nextDate.setDate(0) // Set to last day of previous month
      }
      break
    case 'weekly':
      nextDate.setDate(date.getDate() + 7)
      break
    case 'custom':
      if (customCycleDays) {
        nextDate.setDate(date.getDate() + customCycleDays)
      } else {
        // fallback to monthly
        nextDate.setMonth(date.getMonth() + 1)
        if (nextDate.getDate() !== date.getDate()) {
          nextDate.setDate(0)
        }
      }
      break
    default:
      nextDate.setMonth(date.getMonth() + 1)
      if (nextDate.getDate() !== date.getDate()) {
        nextDate.setDate(0)
      }
  }
  
  return nextDate
}

// Get billing cycle display text
export function getBillingCycleText(cycle: BillingCycle, customDays?: number): string {
  switch (cycle) {
    case 'monthly':
      return 'Monthly'
    case 'yearly':
      return 'Yearly'
    case 'weekly':
      return 'Weekly'
    case 'custom':
      return customDays ? `Every ${customDays} days` : 'Custom'
    default:
      return 'Monthly'
  }
}

// Calculate days until next payment
export function getDaysUntilPayment(nextPaymentDate: string | Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let paymentDate: Date
  
  if (typeof nextPaymentDate === 'string') {
    // Parse YYYY-MM-DD format in local timezone
    const [year, month, day] = nextPaymentDate.split('-').map(Number)
    paymentDate = new Date(year, month - 1, day)
  } else {
    paymentDate = new Date(nextPaymentDate)
  }
  
  paymentDate.setHours(0, 0, 0, 0)
  
  // Calculate difference in milliseconds and convert to days
  const diffTime = paymentDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Check if payment is overdue
export function isPaymentOverdue(nextPaymentDate: string | Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let paymentDate: Date
  
  if (typeof nextPaymentDate === 'string') {
    // Parse YYYY-MM-DD format in local timezone
    const [year, month, day] = nextPaymentDate.split('-').map(Number)
    paymentDate = new Date(year, month - 1, day)
  } else {
    paymentDate = new Date(nextPaymentDate)
  }
  
  paymentDate.setHours(0, 0, 0, 0)
  return paymentDate < today
}

// Check if payment is due soon (within specified days)
export function isPaymentDueSoon(nextPaymentDate: string | Date, withinDays: number = 7): boolean {
  const daysUntil = getDaysUntilPayment(nextPaymentDate)
  return daysUntil <= withinDays && daysUntil >= 0
}

// Generate a random color for categories
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Validate email address
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Convert file to base64 for upload
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate unique ID (simple version, in production you might want to use uuid)
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Sleep utility for delays in development/testing
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Calculate percentage change
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100
  return ((newValue - oldValue) / oldValue) * 100
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

// Sort array of objects by key
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (direction === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
}