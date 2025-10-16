export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          timezone: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          timezone?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          timezone?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          created_at: string
          is_default: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon: string
          created_at?: string
          is_default?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          created_at?: string
          is_default?: boolean
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          service_name: string
          cost: number
          currency: string
          billing_cycle: string
          custom_cycle_days: number | null
          bank_id: string | null
          next_payment_date: string
          last_payment_date: string | null
          start_date: string | null
          status: string
          logo_url: string | null
          website_url: string | null
          description: string | null
          is_shared: boolean
          reminder_days_before: number | null
          reminder_time: string | null
          whatsapp_number: string | null
          last_reminder_sent: string | null
          created_at: string
          updated_at: string
          trial_end_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          service_name: string
          cost: number
          currency?: string
          billing_cycle: string
          custom_cycle_days?: number | null
          bank_id?: string | null
          next_payment_date: string
          last_payment_date?: string | null
          start_date?: string | null
          status?: string
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          is_shared?: boolean
          reminder_days_before?: number | null
          reminder_time?: string | null
          whatsapp_number?: string | null
          last_reminder_sent?: string | null
          created_at?: string
          updated_at?: string
          trial_end_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          service_name?: string
          cost?: number
          currency?: string
          billing_cycle?: string
          custom_cycle_days?: number | null
          bank_id?: string | null
          next_payment_date?: string
          last_payment_date?: string | null
          start_date?: string | null
          status?: string
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          is_shared?: boolean
          reminder_days_before?: number | null
          reminder_time?: string | null
          whatsapp_number?: string | null
          last_reminder_sent?: string | null
          created_at?: string
          updated_at?: string
          trial_end_date?: string | null
        }
      }
      banks: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      billing_cycle: 'monthly' | 'yearly' | 'weekly' | 'custom'
      subscription_status: 'active' | 'inactive' | 'cancelled'
      currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
    }
  }
}