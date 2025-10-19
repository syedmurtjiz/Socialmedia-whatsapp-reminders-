// ============================================
// SIMPLIFIED EDGE FUNCTION - USES SQL VIEW
// ============================================
// This version is MUCH simpler because it uses
// the subscription_reminders view we created in SQL
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

serve(async (req) => {
  try {
    console.log('🚀 Starting reminder check...')
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const metaAccessToken = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN')
    const metaPhoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID')
    
    // Validate WhatsApp credentials
    if (!metaAccessToken || !metaPhoneNumberId) {
      console.error('❌ Missing WhatsApp credentials')
      return new Response(
        JSON.stringify({ error: 'Missing WhatsApp credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get current time in Pakistan (UTC+5)
    const now = new Date()
    const pakistanTime = new Date(now.getTime() + 5 * 60 * 60 * 1000)
    const currentHour = pakistanTime.getUTCHours()
    const currentMinute = pakistanTime.getUTCMinutes()
    
    console.log(`⏰ Current Pakistan time: ${currentHour}:${currentMinute}`)
    
    // Query the view - it handles all the date calculation!
    const { data: subscriptions, error } = await supabase
      .from('subscription_reminders')
      .select('*')
      .eq('should_send_today', true)  // Only today's reminders
      .not('whatsapp_number', 'is', null)  // Must have WhatsApp number
    
    if (error) {
      console.error('❌ Error fetching subscriptions:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`📋 Found ${subscriptions?.length || 0} subscriptions to check`)
    
    const results = {
      total: subscriptions?.length || 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: []
    }
    
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send today', results }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Process each subscription
    for (const sub of subscriptions) {
      console.log(`\n📝 Processing: ${sub.service_name}`)
      console.log(`  - Payment date: ${sub.next_payment_date}`)
      console.log(`  - Reminder date: ${sub.reminder_date}`)
      console.log(`  - WhatsApp: ${sub.whatsapp_number}`)
      
      // Check if already sent today
      if (sub.already_sent_today) {
        console.log(`  ⏭️ Skipping - already sent today`)
        results.skipped++
        continue
      }
      
      // Parse reminder time
      const reminderTime = sub.reminder_time || '09:00:00'
      const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number)
      
      // Check if current time matches reminder time
      if (currentHour !== reminderHour || currentMinute !== reminderMinute) {
        console.log(`  ⏭️ Skipping - not reminder time yet (${reminderHour}:${reminderMinute})`)
        results.skipped++
        continue
      }
      
      // Calculate days until payment
      const paymentDate = new Date(sub.next_payment_date)
      const today = new Date(sub.current_date)
      const daysUntil = Math.round((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      // Create message
      const message = daysUntil === 0
        ? `🔔 *Payment Reminder*\n\nYour *${sub.service_name}* subscription payment is due *TODAY*!\n\n✅ Please ensure sufficient funds are available.`
        : daysUntil === 1
        ? `🔔 *Payment Reminder*\n\nYour *${sub.service_name}* subscription payment is due *TOMORROW*!\n\n✅ Please ensure sufficient funds are available.`
        : `🔔 *Payment Reminder*\n\nYour *${sub.service_name}* subscription payment is due in *${daysUntil} days*!\n\n✅ Please ensure sufficient funds are available.`
      
      console.log(`  📤 Sending WhatsApp message...`)
      
      // Send WhatsApp message
      try {
        const response = await fetch(
          `https://graph.facebook.com/v17.0/${metaPhoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${metaAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: sub.whatsapp_number,
              type: 'text',
              text: { body: message },
            }),
          }
        )
        
        if (response.ok) {
          console.log(`  ✅ WhatsApp sent successfully`)
          results.sent++
          
          // Update last_reminder_sent
          await supabase
            .from('subscriptions')
            .update({ last_reminder_sent: new Date().toISOString() })
            .eq('id', sub.id)
          
          // Create notification
          await supabase
            .from('notifications')
            .insert({
              user_id: sub.user_id,
              subscription_id: sub.id,
              type: 'whatsapp_reminder',
              title: 'WhatsApp Reminder Sent',
              message: message,
              status: 'sent',
              created_at: new Date().toISOString()
            })
        } else {
          const errorData = await response.json()
          console.log(`  ❌ WhatsApp failed: ${JSON.stringify(errorData)}`)
          results.failed++
        }
      } catch (error) {
        console.error(`  ❌ Error sending WhatsApp:`, error)
        results.failed++
      }
    }
    
    console.log('\n📊 Summary:')
    console.log(`  - Total: ${results.total}`)
    console.log(`  - Sent: ${results.sent}`)
    console.log(`  - Failed: ${results.failed}`)
    console.log(`  - Skipped: ${results.skipped}`)
    
    return new Response(
      JSON.stringify({ message: 'Reminder check completed', results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
