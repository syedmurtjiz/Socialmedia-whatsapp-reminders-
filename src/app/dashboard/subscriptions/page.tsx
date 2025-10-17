'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useBanks } from '@/hooks/useBanks'
import { Subscription, CreateSubscriptionForm } from '@/types'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard'
import Link from 'next/link'
import { 
  FiPlus, 
  FiFilter,
  FiSearch,
  FiDollarSign
} from 'react-icons/fi'
import { formatCurrency, formatDatePakistani as formatDate, getDaysUntilPayment, getBillingCycleText } from '@/utils'
import DashboardHeader from '@/components/ui/DashboardHeader'
import LoadingState from '@/components/ui/LoadingState'

export default function SubscriptionsPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { 
    subscriptions, 
    loading, 
    error, 
    addSubscription, 
    updateSubscription, 
    deleteSubscription, 
    toggleSubscriptionStatus 
  } = useSubscriptions()
  const { banks } = useBanks()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'next_payment' | 'created'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Check for add parameter in URL
  useEffect(() => {
    const addParam = searchParams.get('add')
    if (addParam === 'true') {
      setEditingSubscription(null)
      setShowForm(true)
      // Remove the add parameter from URL
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('add')
      router.replace(`/dashboard/subscriptions?${newSearchParams.toString()}`, { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  const handleAddSubscription = async (data: CreateSubscriptionForm) => {
    try {
      await addSubscription(data)
      setShowForm(false)
    } catch (error: any) {
      alert(error?.message || 'Failed to add subscription')
    }
  }

  const handleEditSubscription = async (data: CreateSubscriptionForm) => {
    if (editingSubscription) {
      try {
        await updateSubscription(editingSubscription.id, data)
        setEditingSubscription(null)
        setShowForm(false)
      } catch (error: any) {
        alert(error?.message || 'Failed to update subscription')
      }
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setShowForm(true)
  }

  const handleDelete = async (subscription: Subscription) => {
    if (window.confirm(`Are you sure you want to delete "${subscription.service_name}"?`)) {
      try {
        await deleteSubscription(subscription.id)
      } catch (error: any) {
        alert(error.message)
      }
    }
  }

  const handleToggleStatus = async (subscription: Subscription) => {
    try {
      await toggleSubscriptionStatus(subscription.id)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSubscription(null)
  }

  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions
    .filter(sub => {
      const matchesSearch = sub.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.service_name.toLowerCase()
          bValue = b.service_name.toLowerCase()
          break
        case 'cost':
          aValue = a.cost
          bValue = b.cost
          break
        case 'next_payment':
          // Parse dates in local timezone for consistent comparison
          const [aYear, aMonth, aDay] = a.next_payment_date.split('-').map(Number)
          const [bYear, bMonth, bDay] = b.next_payment_date.split('-').map(Number)
          aValue = new Date(aYear, aMonth - 1, aDay)
          bValue = new Date(bYear, bMonth - 1, bDay)
          break
        case 'created':
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  if (authLoading || loading) {
    return <LoadingState message="Loading subscriptions..." fullscreen />
  }

  if (showForm) {
    return (
      <SubscriptionForm
        subscription={editingSubscription}
        onSubmit={editingSubscription ? handleEditSubscription : handleAddSubscription}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-chocolate-950 transition-colors duration-300">
      {/* Header */}
      <DashboardHeader activePage="subscriptions" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-chocolate-100">Subscriptions</h1>
            <p className="text-gray-600 dark:text-chocolate-300 mt-1">
              Manage your subscriptions and track upcoming payments
            </p>
          </div>
          <button
            onClick={() => { setEditingSubscription(null); setShowForm(true) }}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center shadow-md hover:shadow-lg"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add Subscription
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-chocolate-900 rounded-xl shadow-lg dark:shadow-2xl p-6 mb-6 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Sort */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-chocolate-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 flex-1"
              >
                <option value="created">Created Date</option>
                <option value="name">Name</option>
                <option value="cost">Cost</option>
                <option value="next_payment">Next Payment</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 dark:border-chocolate-700 rounded-md hover:bg-gray-50 dark:hover:bg-chocolate-800 bg-white dark:bg-chocolate-900 text-gray-700 dark:text-chocolate-200 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Subscriptions Grid */}
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-chocolate-800 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-12 h-12 text-gray-400 dark:text-chocolate-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-chocolate-100 mb-2">
              {subscriptions.length === 0 ? 'No subscriptions yet' : 'No subscriptions match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-chocolate-300 mb-8 max-w-md mx-auto">
              {subscriptions.length === 0 
                ? 'Add your first subscription to get started tracking your expenses.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {subscriptions.length === 0 && (
              <button
                onClick={() => { setEditingSubscription(null); setShowForm(true) }}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
              >
                Add Your First Subscription
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription) => {
              const bank = subscription.bank || banks.find(b => b.id === subscription.bank_id) || null

              return (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  bank={bank}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}