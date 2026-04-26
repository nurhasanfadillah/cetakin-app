import { supabase } from './supabase'

export interface CreatePaymentLinkParams {
  orderNumber: string
  amount: number
  customerName: string
  customerEmail?: string
  customerPhone: string
}

export interface PaymentWebhookPayload {
  order_id: string
  transaction_status: string
  transaction_id: string
  gross_amount: string
  payment_type: string
}

const merchantId = import.meta.env.VITE_MIDTRANS_MERCHANT_ID || ''
const serverKey = import.meta.env.VITE_MIDTRANS_SERVER_KEY || ''
const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'

const baseUrl = isProduction 
  ? 'https://secure.midtrans.com' 
  : 'https://app.sandbox.midtrans.com'

export async function createPaymentLink(params: CreatePaymentLinkParams): Promise<string | null> {
  if (!serverKey || !merchantId) {
    console.warn('Midtrans not configured, returning mock payment link')
    return `https://wa.me/6282113133165?text=Order+${params.orderNumber}+silakan+bayar+${params.amount}`
  }

  const transactionDetails = {
    order_id: params.orderNumber,
    gross_amount: params.amount,
  }

  const customerDetails = {
    email: params.customerEmail || '',
    firstName: params.customerName,
    phone: params.customerPhone,
  }

  const payload = {
    transaction_details: transactionDetails,
    customer_details: customerDetails,
    credit_card: {
      secure: true,
    },
    expiry: {
      unit: 'day',
      expiry_duration: 1,
    },
  }

  try {
    const response = await fetch(`${baseUrl}/v2/vtweb/${merchantId}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${merchantId}:${serverKey}`)}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    return data.token_url || null
  } catch (error) {
    console.error('Payment link error:', error)
    return null
  }
}

export async function handleWebhook(payload: PaymentWebhookPayload): Promise<{ success: boolean; message: string }> {
  try {
    await supabase.from('payment_webhook_logs').insert({
      provider: 'midtrans',
      event_type: payload.transaction_status,
      payload: payload as unknown as Record<string, unknown>,
      processed: false,
    })

    if (payload.transaction_status === 'capture' || payload.transaction_status === 'settlement') {
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', payload.order_id)
        .single()

      if (orders) {
        await supabase
          .from('orders')
          .update({ 
            payment_status: 'PAID',
            status: 'PEMBAYARAN_BERHASIL' 
          })
          .eq('id', orders.id)

        await supabase
          .from('payments')
          .insert({
            order_id: orders.id,
            provider: 'midtrans',
            provider_payment_id: payload.transaction_id,
            status: 'PAID',
            amount: parseInt(payload.gross_amount),
          })
      }
    }

    return { success: true, message: 'Webhook processed' }
  } catch (error) {
    console.error('Webhook error:', error)
    return { success: false, message: 'Error processing webhook' }
  }
}

export function getPaymentStatus(_paymentId: string): Promise<string | null> {
  return Promise.resolve(null)
}

export function cancelPayment(_paymentId: string): Promise<boolean> {
  return Promise.resolve(true)
}