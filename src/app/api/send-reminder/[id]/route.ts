import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subscriptionId = params.id

    // Get the subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Get user profile for WhatsApp number
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('whatsapp_number')
      .eq('id', user.id)
      .single()

    const whatsappNumber = userProfile?.whatsapp_number

    if (!whatsappNumber) {
      return NextResponse.json(
        { error: 'WhatsApp number not configured in settings' },
        { status: 400 }
      )
    }

    // Calculate days until payment
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const paymentDate = new Date(subscription.next_payment_date)
    paymentDate.setHours(0, 0, 0, 0)
    const daysUntilPayment = Math.ceil(
      (paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Get bank name if available (fetch separately since banks are now shared)
    let bankName: string | undefined
    if (subscription.bank_id) {
      const { data: bankData } = await supabase
        .from('banks')
        .select('name')
        .eq('id', subscription.bank_id)
        .single()
      bankName = bankData?.name
    }
    const bankInfo = bankName ? ` (${bankName})` : ''
    
    // Create reminder message
    const message = daysUntilPayment === 0
      ? `🔔 Reminder: Your ${subscription.service_name}${bankInfo} subscription payment is due TODAY! Don't forget to review or cancel if needed.`
      : daysUntilPayment === 1
      ? `🔔 Reminder: Your ${subscription.service_name}${bankInfo} subscription payment is due TOMORROW! Don't forget to review or cancel if needed.`
      : `🔔 Reminder: Your ${subscription.service_name}${bankInfo} subscription payment is due in ${daysUntilPayment} days! Don't forget to review or cancel if needed.`

    // Send WhatsApp message
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
          to: whatsappNumber,
          type: 'text',
          text: { body: message },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to send WhatsApp message' },
        { status: response.status }
      )
    }

    // Update last_reminder_sent
    await supabase
      .from('subscriptions')
      .update({ last_reminder_sent: new Date().toISOString() })
      .eq('id', subscriptionId)

    // Create notification record
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        type: 'whatsapp_reminder',
        title: `Reminder: ${subscription.service_name}`,
        message: message,
        status: 'sent',
        sent_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Reminder sent successfully',
      data
    })
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
