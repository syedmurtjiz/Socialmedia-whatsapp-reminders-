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

    console.log(`⏰ Current time: ${now.toLocaleTimeString()}`)

    // Query ALL subscriptions (bypasses RLS with service role)
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .gte('next_payment_date', today.toISOString().split('T')[0])

    if (error) {
      throw error
    }

    console.log(`📋 Found ${subscriptions?.length || 0} total subscriptions`)

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
      const paymentDate = new Date(subscription.next_payment_date)
      paymentDate.setHours(0, 0, 0, 0)
      
      const daysUntilPayment = Math.ceil(
        (paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      console.log(
        `📅 ${subscription.name}: ${daysUntilPayment} days until payment, reminder set for ${subscription.reminder_days_before} days before`
      )

      // Check if reminder already sent today (prevent duplicates)
      const todayStr = today.toISOString().split('T')[0]
      const lastSentStr = subscription.last_reminder_sent 
        ? new Date(subscription.last_reminder_sent).toISOString().split('T')[0] 
        : null

      if (lastSentStr === todayStr) {
        console.log(`⏭️ Skipping ${subscription.name} - reminder already sent today`)
        results.skipped++
        continue
      }

      // Check if it's time to send the reminder
      const reminderTime = subscription.reminder_time || '09:00:00'
      const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number)
      
      // Check if current time EXACTLY matches reminder time (same hour and minute)
      const isTimeToSend = currentHour === reminderHour && currentMinute === reminderMinute

      if (!isTimeToSend) {
        console.log(`⏰ Skipping ${subscription.name} - not time yet (reminder at ${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}, current: ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')})`)
        results.skipped++
        continue
      }

      console.log(`✅ Time match for ${subscription.name} - sending now!`)

      // Send reminder if within the reminder window
      if (daysUntilPayment === subscription.reminder_days_before) {
        try {
          // Send WhatsApp message directly
          const message = daysUntilPayment === 0
            ? `🔔 Reminder: Your ${subscription.name} subscription payment is due TODAY! Don't forget to review or cancel if needed.`
            : daysUntilPayment === 1
            ? `🔔 Reminder: Your ${subscription.name} subscription payment is due TOMORROW! Don't forget to review or cancel if needed.`
            : `🔔 Reminder: Your ${subscription.name} subscription payment is due in ${daysUntilPayment} days! Don't forget to review or cancel if needed.`

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
                to: subscription.whatsapp_number,
                type: 'text',
                text: { body: message },
              }),
            }
          )

          if (whatsappResponse.ok) {
            results.sent++
            
            // Update last_reminder_sent
            await supabase
              .from('subscriptions')
              .update({ last_reminder_sent: new Date().toISOString() })
              .eq('id', subscription.id)
            
            console.log(`✅ Sent reminder for ${subscription.name}`)
          } else {
            results.failed++
            const errorData = await whatsappResponse.json().catch(() => ({}))
            console.error(`❌ Failed to send WhatsApp for ${subscription.name}:`, whatsappResponse.status, errorData)
          }
        } catch (error) {
          results.failed++
          console.error(`❌ Error sending reminder for ${subscription.name}:`, error)
        }
      } else {
        results.skipped++
      }
    }

    console.log('📊 Results:', results)

    return NextResponse.json({
      message: 'Reminder check completed',
      results,
    })
  } catch (error) {
    console.error('❌ Error:', error)
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
