'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import Select from 'react-select'
import { CreateSubscriptionForm, Subscription, BillingCycle, Currency } from '@/types'
import { useBanks } from '@/hooks/useBanks'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FiX, 
  FiCalendar, 
  FiDollarSign, 
  FiTag, 
  FiGlobe, 
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiInfo,
  FiStar,
  FiTrendingUp,
  FiBell,
  FiMessageSquare
} from 'react-icons/fi'
import { LoadingSpinner } from '@/components/ui/loading'
import { formatCurrency, formatDatePakistani, getBillingCycleText } from '@/utils'

// Enhanced validation schema with better logic
const subscriptionSchema = z.object({
  service_name: z.string()
    .min(1, 'Service name is required')
    .max(100, 'Service name must be less than 100 characters')
    .trim(),
  cost: z.number()
    .min(0.01, 'Cost must be greater than $0.00')
    .max(999999.99, 'Cost cannot exceed $999,999.99')
    .multipleOf(0.01, 'Cost must be a valid currency amount'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD'], {
    required_error: 'Please select a currency'
  }),
  billing_cycle: z.enum(['monthly', 'yearly', 'weekly', 'custom'], {
    required_error: 'Please select a billing cycle'
  }),
  custom_cycle_days: z.number()
    .int('Must be a whole number of days')
    .min(1, 'Must be at least 1 day')
    .max(365, 'Cannot exceed 365 days')
    .optional(),
  next_payment_date: z.string()
    .min(1, 'Next payment date is required')
    .refine((date) => {
      // Parse date in local timezone to avoid UTC conversion issues
      const [year, month, day] = date.split('-').map(Number)
      const selectedDate = new Date(year, month - 1, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Next payment date cannot be in the past'),
  start_date: z.string().optional(),
  issue_date: z.string().optional(),
  end_date: z.string().optional(),
  website_url: z.union([
    z.string().url('Please enter a valid URL (e.g., https://example.com)'),
    z.literal('')
  ]).optional(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  logo_url: z.string().optional(),
  bank_id: z.union([z.string(), z.null()]).optional(),
  reminder_days_before: z.number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(30, 'Cannot exceed 30 days')
    .optional(),
  reminder_time: z.string().optional()
}).superRefine((data, ctx) => {
  // Custom cycle days validation
  if (data.billing_cycle === 'custom' && !data.custom_cycle_days) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Custom cycle days is required when billing cycle is set to custom',
      path: ['custom_cycle_days']
    })
  }

  // Start date validations
  if (data.start_date && data.start_date.trim() !== '') {
    // Parse dates in local timezone to avoid UTC conversion issues
    const [startYear, startMonth, startDay] = data.start_date.split('-').map(Number)
    const [nextYear, nextMonth, nextDay] = data.next_payment_date.split('-').map(Number)
    
    const startDate = new Date(startYear, startMonth - 1, startDay)
    const nextPaymentDate = new Date(nextYear, nextMonth - 1, nextDay)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start date cannot be in the future
    if (startDate > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date cannot be in the future',
        path: ['start_date']
      })
    }

    // Start date should be before or equal to next payment date
    if (startDate > nextPaymentDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date must be before or equal to next payment date',
        path: ['start_date']
      })
    }
  }

  // Next payment date additional validations
  const [nextYear, nextMonth, nextDay] = data.next_payment_date.split('-').map(Number)
  const nextPaymentDate = new Date(nextYear, nextMonth - 1, nextDay)
  const today = new Date()
  const futureLimit = new Date()
  futureLimit.setFullYear(today.getFullYear() + 5) // Reasonable future limit

  if (nextPaymentDate > futureLimit) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Next payment date is too far in the future (maximum 5 years)',
      path: ['next_payment_date']
    })
  }
})

interface SubscriptionFormProps {
  subscription?: Subscription | null
  onSubmit: (data: CreateSubscriptionForm) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function SubscriptionForm({ 
  subscription, 
  onSubmit: onSubmitProp, 
  onCancel: onCancelProp, 
  loading = false 
}: SubscriptionFormProps) {
  const { banks, loading: banksLoading } = useBanks()
  const { user } = useAuth()
  const [submitError, setSubmitError] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)

  // Wrap the props with useCallback to make them serializable
  const onSubmit = useCallback(onSubmitProp, [onSubmitProp]);
  const onCancel = useCallback(onCancelProp, [onCancelProp]);

  // Helper function to get default next payment date
  const getDefaultNextPaymentDate = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Helper function to calculate next payment date based on billing cycle
  const calculateNextPaymentDate = useCallback((startDate: string, billingCycle: BillingCycle, customDays?: number) => {
    if (!startDate) return getDefaultNextPaymentDate()
    
    // Parse date in local timezone to avoid UTC issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
    const start = new Date(startYear, startMonth - 1, startDay)
    const nextDate = new Date(start)
    
    switch (billingCycle) {
      case 'weekly':
        nextDate.setDate(start.getDate() + 7)
        break
      case 'monthly':
        nextDate.setMonth(start.getMonth() + 1)
        // Handle month-end edge cases
        if (nextDate.getDate() !== start.getDate()) {
          nextDate.setDate(0) // Set to last day of previous month
        }
        break
      case 'yearly':
        nextDate.setFullYear(start.getFullYear() + 1)
        // Handle leap year edge case (Feb 29)
        if (nextDate.getDate() !== start.getDate()) {
          nextDate.setDate(0) // Set to last day of previous month
        }
        break
      case 'custom':
        if (customDays) {
          nextDate.setDate(start.getDate() + customDays)
        }
        break
    }
    
    // If calculated date is in the past, move it forward
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    while (nextDate <= today) {
      switch (billingCycle) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1)
          if (nextDate.getDate() !== start.getDate()) {
            nextDate.setDate(0)
          }
          break
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          if (nextDate.getDate() !== start.getDate()) {
            nextDate.setDate(0)
          }
          break
        case 'custom':
          if (customDays) {
            nextDate.setDate(nextDate.getDate() + customDays)
          }
          break
      }
    }
    
    // Format as YYYY-MM-DD
    const resultYear = nextDate.getFullYear()
    const resultMonth = String(nextDate.getMonth() + 1).padStart(2, '0')
    const resultDay = String(nextDate.getDate()).padStart(2, '0')
    return `${resultYear}-${resultMonth}-${resultDay}`
  }, [])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
    trigger,
    clearErrors,
    control
  } = useForm<CreateSubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    mode: 'onChange',
    defaultValues: subscription ? {
      service_name: subscription.service_name,
      cost: subscription.cost,
      currency: subscription.currency,
      billing_cycle: subscription.billing_cycle,
      custom_cycle_days: subscription.custom_cycle_days || undefined,
      next_payment_date: subscription.next_payment_date,
      start_date: subscription.start_date || '',
      website_url: subscription.website_url || '',
      description: subscription.description || '',
      bank_id: subscription.bank_id || '',
      reminder_days_before: subscription.reminder_days_before || 3,
      reminder_time: subscription.reminder_time || '09:00'
    } : {
      service_name: '',
      cost: 0,
      currency: 'USD' as Currency,
      billing_cycle: 'monthly' as BillingCycle,
      next_payment_date: getDefaultNextPaymentDate(),
      start_date: '',
      website_url: '',
      description: '',
      bank_id: '',
      reminder_days_before: 3,
      reminder_time: '09:00'
    }
  })

  const watchedFields = watch()
  const { billing_cycle, start_date, custom_cycle_days } = watchedFields

  // Auto-calculate next payment date when start date or billing cycle changes
  useEffect(() => {
    if (start_date && start_date.trim() !== '') {
      const calculatedDate = calculateNextPaymentDate(start_date, billing_cycle, custom_cycle_days)
      setValue('next_payment_date', calculatedDate)
      trigger('next_payment_date')
    }
  }, [start_date, billing_cycle, custom_cycle_days, setValue, trigger, calculateNextPaymentDate])

  // Update form validity state
  useEffect(() => {
    setIsFormValid(isValid && !banksLoading)
  }, [isValid, banksLoading])

  // Smart form submission with enhanced error handling
  const handleFormSubmit = async (data: CreateSubscriptionForm) => {
    try {
      setSubmitError('')
      
      // Additional client-side validation
      if (!data.service_name.trim()) {
        throw new Error('Service name cannot be empty')
      }
      
      if (data.billing_cycle === 'custom' && !data.custom_cycle_days) {
        throw new Error('Custom cycle days is required for custom billing cycle')
      }
      
      // Clean up the data and handle empty strings for UUID fields
      const cleanData = {
        ...data,
        service_name: data.service_name.trim(),
        website_url: data.website_url?.trim() || '',
        description: data.description?.trim() || '',
        // Handle empty strings for UUID fields - convert to null
        bank_id: data.bank_id === '' ? null : data.bank_id,
        // Remove custom_cycle_days if not using custom billing
        ...(data.billing_cycle !== 'custom' && { custom_cycle_days: undefined })
      }
      
      await onSubmit(cleanData)
    } catch (error: any) {
      console.error('Form submission error:', error)
      setSubmitError(
        error.message || 
        'Failed to save subscription. Please check your information and try again.'
      )
    }
  }

  // Handle service name input with smart formatting
  const handleServiceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Auto-capitalize first letter of each word
    const formatted = value.replace(/\b\w/g, l => l.toUpperCase())
    setValue('service_name', formatted)
    if (errors.service_name) {
      trigger('service_name')
    }
  }

  // Handle cost input with currency formatting
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setValue('cost', Math.round(value * 100) / 100) // Round to 2 decimal places
    if (errors.cost) {
      trigger('cost')
    }
  }

  // Handle website URL with smart formatting
  const handleWebsiteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim()
    
    // Auto-add https:// if missing protocol
    if (value && !value.match(/^https?:\/\//)) {
      value = 'https://' + value
    }
    
    setValue('website_url', value)
    if (errors.website_url) {
      trigger('website_url')
    }
  }

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' }
  ]

  const billingCycles: { value: BillingCycle; label: string; description: string }[] = [
    { value: 'weekly', label: 'Weekly', description: 'Every 7 days' },
    { value: 'monthly', label: 'Monthly', description: 'Every month' },
    { value: 'yearly', label: 'Yearly', description: 'Every 12 months' },
    { value: 'custom', label: 'Custom', description: 'Custom interval' }
  ]

  // Get today's date for date input constraints
  const today = new Date().toISOString().split('T')[0]
  const futureLimit = new Date()
  futureLimit.setFullYear(futureLimit.getFullYear() + 5)
  const maxDate = futureLimit.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-900 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto h-[calc(100vh-3rem)] flex items-center justify-center">
        <div className="bg-white dark:bg-chocolate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-chocolate-700 transition-all duration-300 overflow-hidden w-full max-h-[calc(100vh-3rem)] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-primary-600 dark:bg-primary-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                  <FiStar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {subscription ? 'Edit Subscription' : 'Add New Subscription'}
                  </h2>
                  <p className="text-primary-100 dark:text-primary-200 text-sm mt-1">
                    {subscription 
                      ? 'Update your subscription details below' 
                      : 'Fill in the details to track your new subscription'
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors duration-200 group"
                disabled={isSubmitting || loading}
                title="Close form"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-8 overflow-y-auto flex-grow">
            {/* Service Name Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FiTag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Service Details</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('service_name')}
                      type="text"
                      id="service_name"
                      onChange={handleServiceNameChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
                      placeholder="e.g., Netflix, Spotify, Adobe Creative Cloud"
                      maxLength={100}
                    />
                  </div>
                  {errors.service_name ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.service_name.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Enter the name of the service you&apos;re subscribing to
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Pricing & Billing</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cost <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('cost', { valueAsNumber: true })}
                      type="number"
                      id="cost"
                      step="0.01"
                      min="0.01"
                      max="999999.99"
                      onChange={handleCostChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
                      placeholder="9.99"
                    />
                  </div>
                  {errors.cost ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.cost.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Enter the subscription cost (minimum $0.01)
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={currencies.map(currency => ({
                          value: currency.value,
                          label: `${currency.symbol} ${currency.label}`
                        }))}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select currency"
                        isSearchable={true}
                        isClearable={false}
                        isDisabled={isSubmitting || loading}
                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                        value={currencies.map(currency => ({ value: currency.value, label: `${currency.symbol} ${currency.label}` })).find(option => option.value === field.value) || null}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                          }
                        }}
                      />
                    )}
                  />
                  {errors.currency ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.currency.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Select your preferred currency
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Cycle Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FiClock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Billing Cycle</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="billing_cycle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Billing Frequency <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="billing_cycle"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={billingCycles.map(cycle => ({
                          value: cycle.value,
                          label: `${cycle.label} - ${cycle.description}`
                        }))}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select billing frequency"
                        isSearchable={true}
                        isClearable={false}
                        isDisabled={isSubmitting || loading}
                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                        value={billingCycles.map(cycle => ({ value: cycle.value, label: `${cycle.label} - ${cycle.description}` })).find(option => option.value === field.value) || null}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                          }
                        }}
                      />
                    )}
                  />
                  {errors.billing_cycle ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.billing_cycle.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      How often are you billed?
                    </p>
                  )}
                </div>

                {/* Custom Cycle Days */}
                {billing_cycle === 'custom' && (
                  <div className="transition-all duration-300 ease-out">
                    <label htmlFor="custom_cycle_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Days per Cycle <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('custom_cycle_days', { valueAsNumber: true })}
                      type="number"
                      id="custom_cycle_days"
                      min="1"
                      max="365"
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
                      placeholder="30"
                    />
                    {errors.custom_cycle_days ? (
                      <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                        <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                        <p>{errors.custom_cycle_days.message}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Enter number of days between billing (1-365 days)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Schedule & Category Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FiCalendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Schedule & Organization</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                    DD/MM/YYYY Format
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('start_date')}
                      type="date"
                      id="start_date"
                      max={today}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
                    />
                  </div>
                  {errors.start_date ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.start_date.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      When did this subscription start?
                    </p>
                  )}
                </div>

                {/* Next Payment Date */}
                <div>
                  <label htmlFor="next_payment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Next Payment Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('next_payment_date')}
                      type="date"
                      id="next_payment_date"
                      min={today}
                      max={maxDate}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
                    />
                    {start_date && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FiInfo className="h-5 w-5 text-primary-500" title="Auto-calculated based on start date and billing cycle" />
                      </div>
                    )}
                  </div>
                  {errors.next_payment_date ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.next_payment_date.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {start_date ? 'Auto-calculated from start date' : 'When is your next payment due?'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Bank Information</h3>
              </div>
              
              <div>
                <label htmlFor="bank_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank (Optional)
                </label>
                <Controller
                  name="bank_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={banks.map(bank => ({
                        value: bank.id,
                        label: bank.name
                      }))}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select a bank (optional)"
                      isSearchable={true}
                      isClearable={true}
                      isDisabled={banksLoading || isSubmitting || loading}
                      onChange={(selectedOption) => field.onChange(selectedOption?.value || '')}
                      value={banks.map(bank => ({ value: bank.id, label: bank.name })).find(option => option.value === field.value) || null}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                        }
                      }}
                    />
                  )}
                />
                {errors.bank_id ? (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                    <p>{errors.bank_id.message}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select the bank associated with this subscription (optional)
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp Reminder Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FiBell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Reminder Settings</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">(Optional)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reminder Days Before */}
                <div>
                  <label htmlFor="reminder_days_before" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days Before Payment
                  </label>
                  <input
                    {...register('reminder_days_before', { valueAsNumber: true })}
                    type="number"
                    id="reminder_days_before"
                    min="0"
                    max="30"
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
                    placeholder="3"
                  />
                  {errors.reminder_days_before ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.reminder_days_before.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Remind me X days before payment
                    </p>
                  )}
                </div>

                {/* Reminder Time */}
                <div>
                  <label htmlFor="reminder_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reminder Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('reminder_time')}
                      type="time"
                      id="reminder_time"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
                    />
                  </div>
                  {errors.reminder_time ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.reminder_time.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      What time to send the reminder
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FiInfo className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">Additional Information</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">(Optional)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Website URL */}
                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiGlobe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('website_url')}
                      type="url"
                      id="website_url"
                      onChange={handleWebsiteUrlChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200"
                      placeholder="https://example.com"
                    />
                  </div>
                  {errors.website_url ? (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                      <p>{errors.website_url.message}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Add a link to the service&apos;s website (https:// will be auto-added)
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description & Notes
                  </label>
                  <textarea
                    {...register('description')}
                    id="description"
                    rows={4}
                    maxLength={500}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200 resize-none"
                    placeholder="Add any additional notes about this subscription... (e.g., shared account, special features, renewal terms)"
                  />
                  <div className="flex justify-between mt-2">
                    {errors.description ? (
                      <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                        <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5" />
                        <p>{errors.description.message}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Any additional notes or details
                      </p>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {watchedFields.description?.length || 0}/500 characters
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Status Info */}
            {!isFormValid && !isSubmitting && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Form Status</h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <ul role="list" className="list-disc space-y-1 pl-5">
                        {Object.keys(errors).length > 0 && <li>Please fix the validation errors above</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Submission Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{submitError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-chocolate-700">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting || loading}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {(isSubmitting || loading) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {subscription ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <FiCheck className="w-5 h-5 mr-2" />
                    {subscription ? 'Update Subscription' : 'Add Subscription'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || loading}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-chocolate-800 hover:bg-gray-50 dark:hover:bg-chocolate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FiX className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}