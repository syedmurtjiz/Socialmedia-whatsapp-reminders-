import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Subscription, CreateSubscriptionForm } from '@/types'
import { calculateNextPaymentDate } from '@/utils'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSubscriptions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setSubscriptions(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addSubscription = async (subscriptionData: CreateSubscriptionForm) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Normalize date to YYYY-MM-DD format and ensure it's parsed correctly
      let normalizedNextPayment: string
      if (typeof subscriptionData.next_payment_date === 'string') {
        // If it's already in YYYY-MM-DD format, use it directly
        if (subscriptionData.next_payment_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          normalizedNextPayment = subscriptionData.next_payment_date
        } else {
          // Parse and reformat to ensure consistency
          const date = new Date(subscriptionData.next_payment_date)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          normalizedNextPayment = `${year}-${month}-${day}`
        }
      } else {
        const date = new Date(subscriptionData.next_payment_date)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        normalizedNextPayment = `${year}-${month}-${day}`
      }

      // Handle empty strings for UUID fields - convert to null
      const insertData = {
        ...subscriptionData,
        user_id: user.id,
        next_payment_date: normalizedNextPayment,
        start_date: subscriptionData.start_date || null,
        bank_id: subscriptionData.bank_id || null, // Convert empty string to null
        status: 'active' as const
      }

      // @ts-ignore - Temporary workaround for Supabase type issues
      const { data, error } = await (supabase as any)
        .from('subscriptions')
        .insert([insertData])
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setSubscriptions(prev => [data as any, ...prev])
      
      
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Handle next_payment_date normalization if present
      let normalizedUpdates = { ...updates }
      
      if (updates.next_payment_date) {
        if (typeof updates.next_payment_date === 'string') {
          // If it's already in YYYY-MM-DD format, use it directly
          if (updates.next_payment_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            normalizedUpdates.next_payment_date = updates.next_payment_date
          } else {
            // Parse and reformat to ensure consistency
            const date = new Date(updates.next_payment_date)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            normalizedUpdates.next_payment_date = `${year}-${month}-${day}`
          }
        } else {
          const date = new Date(updates.next_payment_date)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          normalizedUpdates.next_payment_date = `${year}-${month}-${day}`
        }
      }

      // Handle empty strings for UUID fields in updates - convert to null
      if ('bank_id' in normalizedUpdates && !normalizedUpdates.bank_id) {
        normalizedUpdates.bank_id = null
      }

      // Clear last_reminder_sent if payment date or reminder settings change
      // This allows reminders to be sent again for the new date/settings
      if (
        'next_payment_date' in normalizedUpdates ||
        'reminder_days_before' in normalizedUpdates ||
        'reminder_time' in normalizedUpdates ||
        'status' in normalizedUpdates
      ) {
        (normalizedUpdates as any).last_reminder_sent = null
      }

      // @ts-ignore - Temporary workaround for Supabase type issues
      const { data, error } = await (supabase as any)
        .from('subscriptions')
        .update(normalizedUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setSubscriptions(prev =>
        prev.map(subscription => (subscription.id === id ? data : subscription))
      )
      
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteSubscription = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setSubscriptions(prev => prev.filter(subscription => subscription.id !== id))
      
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const toggleSubscriptionStatus = async (id: string) => {
    const subscription = subscriptions.find(s => s.id === id)
    if (!subscription) return

    const newStatus = subscription.status === 'active' ? 'inactive' : 'active'
    return updateSubscription(id, { status: newStatus })
  }

  const getActiveSubscriptions = () => {
    return subscriptions.filter(sub => sub.status === 'active')
  }

  const getInactiveSubscriptions = () => {
    return subscriptions.filter(sub => sub.status === 'inactive')
  }

  // Removed: getSubscriptionsByCategory - categories feature removed

  const getUpcomingPayments = (withinDays: number = 7) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endOfWindow = new Date(today)
    endOfWindow.setDate(today.getDate() + withinDays)
    endOfWindow.setHours(23, 59, 59, 999)

    // Helper to parse YYYY-MM-DD as a local date (avoid UTC shift)
    const parseLocalDate = (yyyyMmDd: string) => {
      const [y, m, d] = yyyyMmDd.split('-').map(Number)
      return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0) // noon local time to avoid DST edge cases
    }

    return subscriptions
      .filter(sub => {
        if (sub.status !== 'active') return false
        if (!sub.next_payment_date) return false
        const paymentDate = parseLocalDate(sub.next_payment_date)
        paymentDate.setHours(0, 0, 0, 0) // Normalize to start of day
        return paymentDate >= today && paymentDate <= endOfWindow
      })
      .sort((a, b) => {
        const dateA = parseLocalDate(a.next_payment_date)
        const dateB = parseLocalDate(b.next_payment_date)
        return dateA.getTime() - dateB.getTime()
      })
  }

  const getTotalMonthlyCost = () => {
    return getActiveSubscriptions().reduce((total, sub) => {
      switch (sub.billing_cycle) {
        case 'monthly':
          return total + sub.cost
        case 'yearly':
          return total + (sub.cost / 12)
        case 'weekly':
          return total + (sub.cost * 4.33) // Average weeks per month
        case 'custom':
          return total + (sub.cost * (30 / (sub.custom_cycle_days || 30)))
        default:
          return total + sub.cost
      }
    }, 0)
  }

  const getTotalYearlyCost = () => {
    return getActiveSubscriptions().reduce((total, sub) => {
      switch (sub.billing_cycle) {
        case 'monthly':
          return total + (sub.cost * 12)
        case 'yearly':
          return total + sub.cost
        case 'weekly':
          return total + (sub.cost * 52)
        case 'custom':
          return total + (sub.cost * (365 / (sub.custom_cycle_days || 30)))
        default:
          return total + (sub.cost * 12)
      }
    }, 0)
  }


  useEffect(() => {
    fetchSubscriptions()
  }, [user])

  return {
    subscriptions,
    loading,
    error,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    refetch: fetchSubscriptions,
    getActiveSubscriptions,
    getInactiveSubscriptions,
    getUpcomingPayments,
    getTotalMonthlyCost,
    getTotalYearlyCost
  }
}