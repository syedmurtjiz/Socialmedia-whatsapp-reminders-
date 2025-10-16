import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all subscriptions created OR updated in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', fiveMinutesAgo)

    if (error) {
      throw error
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        message: 'No recent subscriptions found',
        count: 0 
      })
    }

    const results = {
      total: subscriptions.length,
      sent: 0,
      failed: 0,
    }

    // Send WhatsApp message for each subscription
    for (const subscription of subscriptions) {
      try {
        const response = await fetch(
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
              text: {
                body: `🔔 Reminder: Your ${subscription.name} subscription renews on ${new Date(subscription.next_payment_date).toLocaleDateString()}. Don't forget to review or cancel if needed!`,
              },
            }),
          }
        )

        const data = await response.json()

        if (response.ok) {
          results.sent++
        } else {
          results.failed++
        }
      } catch (error) {
        results.failed++
      }
    }

    return NextResponse.json({
      message: 'Test reminders processed',
      results,
      subscriptions: subscriptions.map((s: any) => ({
        name: s.name,
        created_at: s.created_at,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process test reminders' },
      { status: 500 }
    )
  }
}
