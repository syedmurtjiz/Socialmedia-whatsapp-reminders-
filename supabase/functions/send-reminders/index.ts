// ============================================
// SUPABASE EDGE FUNCTION: SEND REMINDERS
// ============================================
// This function checks for subscriptions that need reminders
// and sends WhatsApp messages via Meta WhatsApp API
// Configured for Pakistan timezone (UTC+5)
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// ============================================
// TYPES
// ============================================
interface Subscription {
  id: string
  user_id: string
  service_name: string
  cost: number
  currency: string
  next_payment_date: string
  reminder_days_before: number
  reminder_time: string
  whatsapp_number: string
  last_reminder_sent: string | null
  website_url?: string
  bank_id?: string
}

interface ReminderResult {
  total: number
  sent: number
  failed: number
  skipped: number
  details: Array<{
    subscription_id: string
    service_name: string
    status: 'sent' | 'failed' | 'skipped'
    reason?: string
  }>
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current time in Pakistan timezone (UTC+5)
 */
function getPakistanTime() {
  const now = new Date()
  const pakistanOffset = 5 * 60 // Pakistan is UTC+5 (5 hours * 60 minutes)
  const pakistanTime = new Date(now.getTime() + pakistanOffset * 60 * 1000)
  
  return {
    date: pakistanTime,
    hour: pakistanTime.getUTCHours(),
    minute: pakistanTime.getUTCMinutes(),
    dateString: pakistanTime.toISOString().split('T')[0],
    timeString: `${String(pakistanTime.getUTCHours()).padStart(2, '0')}:${String(pakistanTime.getUTCMinutes()).padStart(2, '0')}`
  }
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    PKR: 'Rs.',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$'
  }
  
  const symbol = currencySymbols[currency] || currency
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Calculate reminder date based on next payment date and days before
 */
function calculateReminderDate(nextPaymentDate: string, daysBefore: number): string {
  const paymentDate = new Date(nextPaymentDate)
  const reminderDate = new Date(paymentDate)
  reminderDate.setDate(reminderDate.getDate() - daysBefore)
  return reminderDate.toISOString().split('T')[0]
}

/**
 * Send WhatsApp message via Meta API
 */
async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  accessToken: string,
  phoneNumberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📱 Sending WhatsApp message to ${phoneNumber}`)
    
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ WhatsApp API error:', errorData)
      return {
        success: false,
        error: `WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`
      }
    }

    const data = await response.json()
    console.log('✅ WhatsApp message sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Create reminder message with bank name and website
 */
function createReminderMessage(
  subscription: Subscription, 
  daysUntilPayment: number, 
  bankName?: string
): string {
  const { service_name, cost, currency, next_payment_date, website_url } = subscription
  
  const formattedCost = formatCurrency(cost, currency)
  const formattedDate = new Date(next_payment_date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // Build the base message
  let message = `🔔 *Payment Reminder*\n\n`
  message += `Your *${service_name}* subscription payment of *${formattedCost}* is due `
  
  if (daysUntilPayment === 0) {
    message += `*TODAY* (${formattedDate}).`
  } else if (daysUntilPayment === 1) {
    message += `*TOMORROW* (${formattedDate}).`
  } else {
    message += `in *${daysUntilPayment} days* (${formattedDate}).`
  }
  
  // Add bank information if available
  if (bankName) {
    message += `\n\n💳 *Payment Method:* ${bankName}`
  }
  
  // Add website link if available
  if (website_url) {
    message += `\n🌐 *Website:* ${website_url}`
  }
  
  message += `\n\n✅ Please ensure sufficient funds are available.`
  
  return message
}

// ============================================
// MAIN HANDLER
// ============================================
serve(async (req) => {
  try {
    console.log('🚀 Starting reminder check...')
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const metaAccessToken = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN')
    const metaPhoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID')
    
    // Validate environment variables
    if (!metaAccessToken || !metaPhoneNumberId) {
      console.error('❌ Missing WhatsApp credentials')
      return new Response(
        JSON.stringify({
          error: 'Missing WhatsApp credentials. Please set META_WHATSAPP_ACCESS_TOKEN and META_PHONE_NUMBER_ID'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get current Pakistan time
    const pakistanTime = getPakistanTime()
    console.log(`⏰ Current Pakistan time: ${pakistanTime.dateString} ${pakistanTime.timeString} (Hour: ${pakistanTime.hour}, Minute: ${pakistanTime.minute})`)
    
    // Query subscriptions that need reminders
    // 1. Only active subscriptions
    // 2. We'll get user_profiles separately since there's no foreign key
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
    
    if (error) {
      console.error('❌ Error fetching subscriptions:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`📋 Found ${subscriptions?.length || 0} subscriptions with WhatsApp numbers`)
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️ No subscriptions found')
      return new Response(
        JSON.stringify({
          message: 'No subscriptions with WhatsApp numbers found',
          results: { total: 0, sent: 0, failed: 0, skipped: 0, details: [] }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Process each subscription
    const results: ReminderResult = {
      total: subscriptions.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: []
    }
    
    for (const subscription of subscriptions as Subscription[]) {
      console.log(`\n📝 Processing subscription: ${subscription.service_name} (ID: ${subscription.id})`)
      
      // Calculate reminder date
      const reminderDate = calculateReminderDate(
        subscription.next_payment_date,
        subscription.reminder_days_before
      )
      
      // Get user profile to fetch WhatsApp number
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('whatsapp_number')
        .eq('id', subscription.user_id)
        .single()
      
      if (profileError) {
        console.log(`  ⏭️ Skipping - error fetching user profile: ${profileError.message}`)
        results.skipped++
        results.details.push({
          subscription_id: subscription.id,
          service_name: subscription.service_name,
          status: 'skipped',
          reason: 'Error fetching user profile'
        })
        continue
      }
      
      const whatsappNumber = userProfile?.whatsapp_number
      const reminderTime = subscription.reminder_time || '09:00:00'
      
      // Skip if no WhatsApp number in user profile
      if (!whatsappNumber) {
        console.log(`  ⏭️ Skipping - no WhatsApp number in user settings`)
        results.skipped++
        results.details.push({
          subscription_id: subscription.id,
          service_name: subscription.service_name,
          status: 'skipped',
          reason: 'No WhatsApp number in user settings'
        })
        continue
      }
      
      console.log(`  - Next payment: ${subscription.next_payment_date}`)
      console.log(`  - Reminder days before: ${subscription.reminder_days_before}`)
      console.log(`  - Calculated reminder date: ${reminderDate}`)
      console.log(`  - Current Pakistan date: ${pakistanTime.dateString}`)
      console.log(`  - Reminder time: ${reminderTime}`)
      console.log(`  - Current Pakistan time: ${pakistanTime.timeString}`)
      console.log(`  - WhatsApp number: ${whatsappNumber}`)
      
      // Check if today is the reminder date
      if (reminderDate !== pakistanTime.dateString) {
        console.log(`  ⏭️ Skipping - not reminder date yet (reminder: ${reminderDate}, today: ${pakistanTime.dateString})`)
        results.skipped++
        results.details.push({
          subscription_id: subscription.id,
          service_name: subscription.service_name,
          status: 'skipped',
          reason: `Not reminder date yet (${reminderDate})`
        })
        continue
      }
      
      // Parse reminder time (format: HH:MM:SS or HH:MM)
      const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number)
      
      console.log(`  - Reminder hour: ${reminderHour}, minute: ${reminderMinute}`)
      console.log(`  - Current hour: ${pakistanTime.hour}, minute: ${pakistanTime.minute}`)
      
      // Check if current time matches reminder time (within the same minute)
      if (reminderHour !== pakistanTime.hour || reminderMinute !== pakistanTime.minute) {
        console.log(`  ⏭️ Skipping - not reminder time yet (reminder: ${reminderHour}:${reminderMinute}, current: ${pakistanTime.hour}:${pakistanTime.minute})`)
        results.skipped++
        results.details.push({
          subscription_id: subscription.id,
          service_name: subscription.service_name,
          status: 'skipped',
          reason: `Not reminder time yet (${reminderHour}:${reminderMinute})`
        })
        continue
      }
      
      // Check if reminder already sent today (prevent duplicates)
      if (subscription.last_reminder_sent) {
        const lastSentDate = new Date(subscription.last_reminder_sent)
        const lastSentPakistan = new Date(lastSentDate.getTime() + 5 * 60 * 60 * 1000)
        const lastSentDateString = lastSentPakistan.toISOString().split('T')[0]
        
        console.log(`  - Last reminder sent: ${subscription.last_reminder_sent}`)
        console.log(`  - Last sent Pakistan date: ${lastSentDateString}`)
        
        if (lastSentDateString === pakistanTime.dateString) {
          console.log(`  ⏭️ Skipping - reminder already sent today`)
          results.skipped++
          results.details.push({
            subscription_id: subscription.id,
            service_name: subscription.service_name,
            status: 'skipped',
            reason: 'Reminder already sent today'
          })
          continue
        }
      }
      
      // Calculate days until payment
      const paymentDate = new Date(subscription.next_payment_date)
      const todayDate = new Date(pakistanTime.dateString)
      const daysUntilPayment = Math.ceil((paymentDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log(`  - Days until payment: ${daysUntilPayment}`)
      
      // Fetch bank name if bank_id exists
      let bankName: string | undefined
      if (subscription.bank_id) {
        const { data: bankData } = await supabase
          .from('banks')
          .select('name')
          .eq('id', subscription.bank_id)
          .single()
        
        bankName = bankData?.name
        console.log(`  - Bank: ${bankName || 'Not specified'}`)
      }
      
      // Create and send reminder message
      const message = createReminderMessage(subscription, daysUntilPayment, bankName)
      console.log(`  📤 Sending reminder message...`)
      if (subscription.website_url) {
        console.log(`  - Website: ${subscription.website_url}`)
      }
      
      const result = await sendWhatsAppMessage(
        whatsappNumber,
        message,
        metaAccessToken,
        metaPhoneNumberId
      )
      
      if (result.success) {
        console.log(`  ✅ Reminder sent successfully`)
        results.sent++
        results.details.push({
          subscription_id: subscription.id,
          service_name: subscription.service_name,
          status: 'sent'
        })
        
        // Update last_reminder_sent timestamp
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ last_reminder_sent: new Date().toISOString() })
          .eq('id', subscription.id)
        
        if (updateError) {
          console.error(`  ⚠️ Failed to update last_reminder_sent:`, updateError)
        } else {
          console.log(`  ✅ Updated last_reminder_sent timestamp`)
        }
      } else {
        console.log(`  ❌ Failed to send reminder: ${result.error}`)
        results.failed++
        results.details.push({
          subscription_id: subscription.id,
          service_name: subscription.service_name,
          status: 'failed',
          reason: result.error
        })
      }
    }
    
    console.log('\n📊 Summary:')
    console.log(`  - Total: ${results.total}`)
    console.log(`  - Sent: ${results.sent}`)
    console.log(`  - Failed: ${results.failed}`)
    console.log(`  - Skipped: ${results.skipped}`)
    
    return new Response(
      JSON.stringify({
        message: 'Reminder check completed',
        pakistan_time: `${pakistanTime.dateString} ${pakistanTime.timeString}`,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
