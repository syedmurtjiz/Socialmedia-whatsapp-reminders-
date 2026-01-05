import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Notification } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select(`
          *,
          subscription:subscriptions(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      setNotifications(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, status: 'read' as const, read_at: new Date().toISOString() }
            : notif
        )
      )
    } catch (err: any) {
      // Error marking notification as read
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .neq('status', 'read')

      if (error) throw error

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          status: 'read' as const,
          read_at: notif.read_at || new Date().toISOString()
        }))
      )
    } catch (err: any) {
      // Error marking all notifications as read
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
    } catch (err: any) {
      // Error deleting notification
    }
  }

  const getUnreadCount = () => {
    return notifications.filter(n => n.status !== 'read').length
  }

  const getUnreadNotifications = () => {
    return notifications.filter(n => n.status !== 'read')
  }

  useEffect(() => {
    fetchNotifications()

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchNotifications])

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    getUnreadNotifications
  }
}
