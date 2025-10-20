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
      subscriptions: {
        Row: {
          id: string
          user_id: string
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
      user_profiles: {
        Row: {
          id: string
          whatsapp_number: string | null
          reminder_time: string | null
          timezone: string
          email_notifications: boolean
          push_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          whatsapp_number?: string | null
          reminder_time?: string | null
          timezone?: string
          email_notifications?: boolean
          push_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          whatsapp_number?: string | null
          reminder_time?: string | null
          timezone?: string
          email_notifications?: boolean
          push_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          type: string
          title: string
          message: string
          whatsapp_number: string | null
          whatsapp_message_id: string | null
          status: string
          error_message: string | null
          scheduled_at: string | null
          sent_at: string | null
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          type?: string
          title: string
          message: string
          whatsapp_number?: string | null
          whatsapp_message_id?: string | null
          status?: string
          error_message?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          type?: string
          title?: string
          message?: string
          whatsapp_number?: string | null
          whatsapp_message_id?: string | null
          status?: string
          error_message?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          read_at?: string | null
          created_at?: string
          updated_at?: string
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