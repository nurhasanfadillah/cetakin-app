import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MidtransNotification {
  order_id: string
  status_code: string
  transaction_status: string
  transaction_id: string
  transaction_time: string
  gross_amount: string
  payment_type: string
  signature_key?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const notification: MidtransNotification = await req.json()
    
    console.log('Received Midtrans notification:', notification)

    const expectedSignatureKey = crypto.subtle.digestSync(
      'SHA-512',
      new TextEncoder().encode(
        notification.order_id + notification.status_code + notification.gross_amount + midtransServerKey
      )
    )
    
    const signatureKeyHex = Array.from(new Uint8Array(expectedSignatureKey))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    if (notification.signature_key && notification.signature_key !== signatureKeyHex) {
      console.error('Invalid signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: existingLog } = await supabase
      .from('payment_webhook_logs')
      .select('id, processed')
      .eq('payload->>transaction_id', notification.transaction_id)
      .single()

    if (existingLog?.processed) {
      console.log('Already processed:', notification.transaction_id)
      return new Response(JSON.stringify({ message: 'Already processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('payment_webhook_logs').insert({
      provider: 'midtrans',
      event_type: notification.transaction_status,
      payload: notification as unknown as Record<string, unknown>,
      processed: false,
    })

    const { data: order } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('order_number', notification.order_id)
      .single()

    if (!order) {
      console.error('Order not found:', notification.order_id)
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let newPaymentStatus = 'PENDING'
    let newOrderStatus = order.status

    switch (notification.transaction_status) {
      case 'capture':
      case 'settlement':
        newPaymentStatus = 'PAID'
        newOrderStatus = 'PEMBAYARAN_BERHASIL'
        break
      case 'pending':
        newPaymentStatus = 'PENDING'
        break
      case 'expire':
        newPaymentStatus = 'EXPIRED'
        newOrderStatus = 'DIBATALKAN'
        break
      case 'deny':
      case 'cancel':
        newPaymentStatus = 'FAILED'
        newOrderStatus = 'DIBATALKAN'
        break
    }

    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: newPaymentStatus,
        status: newOrderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (orderUpdateError) {
      console.error('Failed to update order:', orderUpdateError)
    }

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', order.id)
      .single()

    if (!existingPayment) {
      await supabase.from('payments').insert({
        order_id: order.id,
        provider: 'midtrans',
        provider_payment_id: notification.transaction_id,
        status: newPaymentStatus,
        amount: parseInt(notification.gross_amount),
        payload: notification as unknown as Record<string, unknown>,
      })
    } else {
      await supabase
        .from('payments')
        .update({
          status: newPaymentStatus,
          provider_payment_id: notification.transaction_id,
          payload: notification as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPayment.id)
    }

    if (newPaymentStatus === 'PAID') {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('order_id', order.id)
        .single()

      if (invoice) {
        await supabase
          .from('invoices')
          .update({
            status: 'PAID',
            paid_at: new Date().toISOString(),
          })
          .eq('id', invoice.id)
      }
    }

    await supabase
      .from('payment_webhook_logs')
      .update({ processed: true })
      .eq('payload->>transaction_id', notification.transaction_id)

    return new Response(JSON.stringify({ success: true, message: 'Webhook processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})