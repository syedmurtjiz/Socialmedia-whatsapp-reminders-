import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Category, CreateCategoryForm } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchCategories = async () => {
    if (!user) return

    try {
      setLoading(true)
      // @ts-ignore - Temporary workaround for Supabase type issues
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        throw error
      }

      // @ts-ignore - Temporary workaround for Supabase type issues
      setCategories(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (categoryData: CreateCategoryForm) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const insertData = {
        ...categoryData,
        user_id: user.id
      }
      
      // @ts-ignore - Temporary workaround for Supabase type issues
      const { data, error } = await supabase
        .from('categories')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        throw error
      }

      // @ts-ignore - Temporary workaround for Supabase type issues
      setCategories(prev => [...prev, data])
      // @ts-ignore - Temporary workaround for Supabase type issues
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // @ts-ignore - Temporary workaround for Supabase type issues
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // @ts-ignore - Temporary workaround for Supabase type issues
      setCategories(prev =>
        prev.map(category => (category.id === id ? data : category))
      )
      // @ts-ignore - Temporary workaround for Supabase type issues
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // First check if category has subscriptions
      // @ts-ignore - Temporary workaround for Supabase type issues
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('category_id', id)

      if (subscriptionError) {
        throw subscriptionError
      }

      if (subscriptions && subscriptions.length > 0) {
        throw new Error(`Cannot delete category. It has ${subscriptions.length} subscription(s). Please reassign them first.`)
      }

      // @ts-ignore - Temporary workaround for Supabase type issues
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setCategories(prev => prev.filter(category => category.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getDefaultCategories = () => {
    return categories.filter(category => category.is_default)
  }

  const getCustomCategories = () => {
    return categories.filter(category => !category.is_default)
  }

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id)
  }

  useEffect(() => {
    fetchCategories()
  }, [user])

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
    getDefaultCategories,
    getCustomCategories,
    getCategoryById
  }
}