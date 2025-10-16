import { FiCalendar, FiCreditCard, FiEdit2, FiExternalLink, FiPause, FiPlay, FiTrash2 } from 'react-icons/fi'
import { Subscription, Category, Bank } from '@/types'
import { formatCurrency, formatDatePakistani as formatDate, getDaysUntilPayment, getBillingCycleText } from '@/utils'

interface SubscriptionCardProps {
  subscription: Subscription
  category?: Category | null
  bank?: Bank | null
  onEdit: (subscription: Subscription) => void
  onDelete: (subscription: Subscription) => void
  onToggleStatus: (subscription: Subscription) => void
}

export default function SubscriptionCard({
  subscription,
  category,
  bank,
  onEdit,
  onDelete,
  onToggleStatus
}: SubscriptionCardProps) {
  const daysUntilPayment = getDaysUntilPayment(subscription.next_payment_date)
  const isOverdue = daysUntilPayment < 0
  const isDueSoon = daysUntilPayment >= 0 && daysUntilPayment <= 7

  return (
    <div className={`bg-white dark:bg-chocolate-900 rounded-xl shadow-lg dark:shadow-2xl hover:shadow-xl dark:hover:shadow-3xl transition-all duration-300 p-6 border border-gray-200 dark:border-chocolate-700 ${
      subscription.status === 'inactive' ? 'opacity-70' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {category ? (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md"
              style={{ backgroundColor: category.color }}
            >
              {category.icon}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-chocolate-800 flex items-center justify-center text-gray-500 dark:text-chocolate-400 text-xl">
              ?
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-chocolate-100 text-lg leading-tight">
              {subscription.service_name}
            </h3>
            <div className="mt-1 space-y-1">
              {category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-chocolate-800 text-gray-800 dark:text-chocolate-200">
                  {category.name}
                </span>
              )}
              {bank && (
                <div className="flex items-center text-xs text-gray-500 dark:text-chocolate-400 mt-1">
                  <FiCreditCard className="w-3.5 h-3.5 mr-1.5" />
                  <span className="font-medium">{bank.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          subscription.status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {subscription.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Cost and Billing */}
      <div className="mb-4 pb-4 border-b border-gray-100 dark:border-chocolate-700">
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-chocolate-100">
            {formatCurrency(subscription.cost, subscription.currency)}
          </div>
          <div className="text-sm text-gray-500 dark:text-chocolate-400 font-medium">
            {getBillingCycleText(subscription.billing_cycle, subscription.custom_cycle_days)}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600 dark:text-chocolate-300">
          <FiCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Next payment: <span className="font-medium">{formatDate(subscription.next_payment_date)}</span></span>
        </div>
        
        {subscription.status === 'active' && (
          <div className={`text-sm font-medium inline-flex items-center px-2.5 py-0.5 rounded-full ${
            isOverdue 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : isDueSoon 
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          }`}>
            {isOverdue 
              ? `Overdue by ${Math.abs(daysUntilPayment)} day(s)`
              : daysUntilPayment === 0
              ? 'Due today'
              : `Due in ${daysUntilPayment} day(s)`
            }
          </div>
        )}
        
        {subscription.start_date && (
          <div className="flex items-center text-sm text-gray-500 dark:text-chocolate-400">
            <FiCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Started: {formatDate(subscription.start_date)}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {subscription.description && (
        <p className="text-sm text-gray-600 dark:text-chocolate-300 mb-4 line-clamp-2">
          {subscription.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-chocolate-700">
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(subscription)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-chocolate-800 text-gray-600 dark:text-chocolate-300 hover:text-gray-900 dark:hover:text-chocolate-100 transition-colors"
            title="Edit subscription"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onToggleStatus(subscription)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-chocolate-800 text-gray-600 dark:text-chocolate-300 hover:text-gray-900 dark:hover:text-chocolate-100 transition-colors"
            title={subscription.status === 'active' ? 'Pause subscription' : 'Resume subscription'}
          >
            {subscription.status === 'active' ? (
              <FiPause className="w-4 h-4" />
            ) : (
              <FiPlay className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => onDelete(subscription)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-chocolate-800 text-gray-600 dark:text-chocolate-300 hover:text-gray-900 dark:hover:text-chocolate-100 transition-colors"
            title="Delete subscription"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Website Link */}
        {subscription.website_url && (
          <a
            href={subscription.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-chocolate-800 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
            title="Visit website"
          >
            <FiExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  )
}