// Database types based on Supabase schema

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
  timezone: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
  is_default: boolean
}

export interface Bank {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  subscription_id: string
  type: NotificationType
  title: string
  message: string
  whatsapp_number?: string
  whatsapp_message_id?: string
  status: NotificationStatus
  error_message?: string
  scheduled_at?: string
  sent_at?: string
  read_at?: string
  created_at: string
  updated_at: string
  // Joined fields
  subscription?: Subscription
}

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'custom'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
export type NotificationType = 'whatsapp_reminder' | 'email_reminder' | 'system'
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read'

export interface Subscription {
  id: string
  user_id: string
  category_id: string | null  // Changed from string to string | null
  service_name: string
  cost: number
  currency: Currency
  billing_cycle: BillingCycle
  custom_cycle_days?: number
  next_payment_date: string
  last_payment_date?: string
  start_date?: string
  issue_date?: string // Start date of the subscription
  end_date?: string // End date of the subscription
  status: SubscriptionStatus
  logo_url?: string
  website_url?: string
  description?: string
  bank_id?: string | null  // Changed from string to string | null
  is_shared: boolean
  // WhatsApp Reminder fields
  reminder_days_before?: number
  reminder_time?: string
  last_reminder_sent?: string
  created_at: string
  updated_at: string
  // Joined fields
  category?: Category
  bank?: Bank
}


// Form types
export interface CreateSubscriptionForm {
  service_name: string
  cost: number
  currency: Currency
  billing_cycle: BillingCycle
  custom_cycle_days?: number
  next_payment_date: string
  start_date?: string
  issue_date?: string // Start date of the subscription
  end_date?: string // End date of the subscription
  website_url?: string
  description?: string
  logo_url?: string
  bank_id?: string | null  // Changed from string to string | null
  // WhatsApp Reminder fields
  reminder_days_before?: number
  reminder_time?: string
}

export interface CreateCategoryForm {
  name: string
  color: string
  icon: string
}

export interface UpdateProfileForm {
  full_name: string
  timezone: string
  whatsapp_number?: string
}

// Analytics types
export interface SpendingByCategory {
  category_name: string
  category_color: string
  total_amount: number
  subscription_count: number
}

export interface MonthlySpending {
  month: string
  total_amount: number
  subscription_count: number
}

export interface DashboardStats {
  total_monthly_cost: number
  total_yearly_cost: number
  active_subscriptions: number
  upcoming_payments: number
  spending_by_category: SpendingByCategory[]
  monthly_trends: MonthlySpending[]
}

export interface UpcomingPayment {
  subscription: Subscription
  days_until_payment: number
  amount: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Supabase Auth types
export interface AuthUser {
  id: string
  email?: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

// Component prop types
export interface SubscriptionCardProps {
  subscription: Subscription
  onEdit?: (subscription: Subscription) => void
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string, status: SubscriptionStatus) => void
}

export interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
}

export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

// Hook types
export interface UseSubscriptionsReturn {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
  addSubscription: (subscription: CreateSubscriptionForm) => Promise<void>
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  addCategory: (category: CreateCategoryForm) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export interface UseBanksReturn {
  banks: Bank[]
  loading: boolean
  error: string | null
}