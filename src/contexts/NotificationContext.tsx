'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Notification = Database['public']['Tables']['notifications']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  loading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // @ts-ignore - Supabase typing issue workaround
      const result = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (result.error) throw result.error

      const data = result.data as Notification[] | null
      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => n.status !== 'read').length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return

    try {
      // @ts-ignore - Supabase typing issue workaround
      const result = await (supabase as any)
        .from('notifications')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (result.error) throw result.error

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, status: 'read', read_at: new Date().toISOString() } : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      // @ts-ignore - Supabase typing issue workaround
      const result = await (supabase as any)
        .from('notifications')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .neq('status', 'read')
        .select()

      if (result.error) throw result.error

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read', read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Check for upcoming payments and create notifications
  const checkUpcomingPayments = useCallback(async () => {
    if (!user) return

    try {
      // Get all active subscriptions for the user
      // @ts-ignore - Supabase typing issue workaround
      const result = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (result.error) throw result.error

      const subscriptions = result.data as Subscription[] | null || []

      // Check each subscription for upcoming payments
      for (const subscription of subscriptions) {
        const daysUntilPayment = getDaysUntilPayment(subscription.next_payment_date)
        
        // Create notification for 2 days before payment
        if (daysUntilPayment === 2) {
          // Check if notification already exists to avoid duplicates
          // @ts-ignore - Supabase typing issue workaround
          const existingResult = await (supabase as any)
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('subscription_id', subscription.id)
            .eq('title', 'Upcoming Payment')
            .gte('created_at', new Date().toISOString().split('T')[0]) // Today or later

          if (existingResult.error) throw existingResult.error

          const existingData = existingResult.data
          if (!existingData || existingData.length === 0) {
            await createNotification({
              user_id: user.id,
              subscription_id: subscription.id,
              type: 'system',
              title: 'Upcoming Payment',
              message: `Your ${subscription.service_name} subscription payment is due in 2 days.`,
              status: 'sent'
            })
          }
        }
        
        // Create notification for 1 day before payment
        if (daysUntilPayment === 1) {
          // Check if notification already exists to avoid duplicates
          // @ts-ignore - Supabase typing issue workaround
          const existingResult = await (supabase as any)
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('subscription_id', subscription.id)
            .eq('title', 'Payment Due Tomorrow')
            .gte('created_at', new Date().toISOString().split('T')[0]) // Today or later

          if (existingResult.error) throw existingResult.error

          const existingData = existingResult.data
          if (!existingData || existingData.length === 0) {
            await createNotification({
              user_id: user.id,
              subscription_id: subscription.id,
              type: 'system',
              title: 'Payment Due Tomorrow',
              message: `Your ${subscription.service_name} subscription payment is due tomorrow.`,
              status: 'sent'
            })
          }
        }
      }
    } catch (error) {
      console.error('Error checking upcoming payments:', error)
    }
  }, [user])

  // Create a new notification
  const createNotification = async (notification: Database['public']['Tables']['notifications']['Insert']) => {
    try {
      // @ts-ignore - Supabase typing issue workaround
      const result = await (supabase as any)
        .from('notifications')
        .insert([notification])
        .select()
        .single()

      if (result.error) throw result.error

      // Add to local notifications list
      setNotifications(prev => [result.data as Notification, ...prev])
      setUnreadCount(prev => prev + 1)
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  // Helper function to calculate days until payment
  const getDaysUntilPayment = (nextPaymentDate: string): number => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const [year, month, day] = nextPaymentDate.split('-').map(Number)
    const paymentDate = new Date(year, month - 1, day)
    paymentDate.setHours(0, 0, 0, 0)
    
    const diffTime = paymentDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return

    // Fetch initial notifications
    fetchNotifications()

    // Set up real-time listener for new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as unknown as Notification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    // Disabled: Only show WhatsApp reminder logs, not automatic system notifications
    // Set up interval to check for upcoming payments
    // const interval = setInterval(() => {
    //   checkUpcomingPayments()
    // }, 60000) // Check every minute

    // Initial check
    // checkUpcomingPayments()

    return () => {
      supabase.removeChannel(channel)
      // clearInterval(interval) // Disabled with automatic notifications
    }
  }, [user, checkUpcomingPayments, fetchNotifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
        loading
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}