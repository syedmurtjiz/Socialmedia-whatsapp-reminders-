import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use service role key to bypass RLS (for cron jobs)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get current date and time
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Query ACTIVE subscriptions only (bypasses RLS with service role)
    // Get active subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .gte('next_payment_date', today.toISOString().split('T')[0])

    if (error) {
      throw error
    }

    const results = {
      total: subscriptions?.length || 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        message: 'No subscriptions found', 
        results 
      })
    }

    // Process each subscription
    for (const subscription of subscriptions) {
      // Get user profile for WhatsApp number
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('whatsapp_number')
        .eq('id', subscription.user_id)
        .single()

      const whatsappNumber = userProfile?.whatsapp_number

      // Skip if no WhatsApp number configured
      if (!whatsappNumber) {
        results.skipped++
        continue
      }

      const paymentDate = new Date(subscription.next_payment_date)
      paymentDate.setHours(0, 0, 0, 0)
      
      const daysUntilPayment = Math.ceil(
        (paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Check if reminder already sent today (prevent duplicates)
      const todayStr = today.toISOString().split('T')[0]
      const lastSentStr = subscription.last_reminder_sent 
        ? new Date(subscription.last_reminder_sent).toISOString().split('T')[0] 
        : null

      if (lastSentStr === todayStr) {
        results.skipped++
        continue
      }

      // Check if it's time to send the reminder
      const reminderTime = subscription.reminder_time || '09:00:00'
      const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number)
      
      // Check if current time EXACTLY matches reminder time (same hour and minute)
      const isTimeToSend = currentHour === reminderHour && currentMinute === reminderMinute

      if (!isTimeToSend) {
        results.skipped++
        continue
      }

      // Send reminder if within the reminder window
      if (daysUntilPayment === subscription.reminder_days_before) {
        try {
          // Get bank name if available
          const bankName = (subscription as any).banks?.name
          const bankInfo = bankName ? ` (${bankName})` : ''
          
          // Send WhatsApp message directly
          const message = daysUntilPayment === 0
            ? `🔔 Reminder: Your ${subscription.service_name}${bankInfo} subscription payment is due TODAY! Don't forget to review or cancel if needed.`
            : daysUntilPayment === 1
            ? `🔔 Reminder: Your ${subscription.service_name}${bankInfo} subscription payment is due TOMORROW! Don't forget to review or cancel if needed.`
            : `🔔 Reminder: Your ${subscription.service_name}${bankInfo} subscription payment is due in ${daysUntilPayment} days! Don't forget to review or cancel if needed.`

          const whatsappResponse = await fetch(
            `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: whatsappNumber,
                type: 'text',
                text: { body: message },
              }),
            }
          )

          const whatsappData = await whatsappResponse.json()

          if (whatsappResponse.ok) {
            results.sent++
            
            // Update last_reminder_sent
            await supabase
              .from('subscriptions')
              .update({ last_reminder_sent: new Date().toISOString() })
              .eq('id', subscription.id)
            
            // Log successful notification
            const { data: notifData, error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: subscription.user_id,
                subscription_id: subscription.id,
                type: 'whatsapp_reminder',
                title: `Reminder: ${subscription.service_name}`,
                message: message,
                whatsapp_number: whatsappNumber,
                whatsapp_message_id: whatsappData.messages?.[0]?.id || null,
                status: 'sent',
                scheduled_at: new Date().toISOString(),
                sent_at: new Date().toISOString()
              })
              .select()
          } else {
            results.failed++
            
            // Log failed notification
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: subscription.user_id,
                subscription_id: subscription.id,
                type: 'whatsapp_reminder',
                title: `Failed: ${subscription.service_name}`,
                message: message,
                whatsapp_number: whatsappNumber,
                status: 'failed',
                error_message: `WhatsApp API error: ${whatsappResponse.status} - ${JSON.stringify(whatsappData)}`,
                scheduled_at: new Date().toISOString()
              })
          }
        } catch (error) {
          results.failed++
        }
      } else {
        results.skipped++
      }
    }

    return NextResponse.json({
      message: 'Reminder check completed',
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Allow POST as well
export async function POST() {
  return GET()
}
