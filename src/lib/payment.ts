import { supabase } from './supabase'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: SnapOptions) => void
    }
  }
}

interface SnapOptions {
  onSuccess?: (result: unknown) => void
  onPending?: (result: unknown) => void
  onError?: (result: unknown) => void
  onClose?: () => void
}

const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''
const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'

const MIDTRANS_PORTAL = IS_PRODUCTION
  ? 'https://app.midtrans.com'
  : 'https://app.sandbox.midtrans.com'

// ═══════════════════════════════════════════════════════════════════
//  PUBLIC INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface CreatePaymentParams {
  orderId: string
  orderNumber: string
  amount: number
  customerName: string
  customerEmail?: string
  customerPhone: string
  items?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

export interface PaymentResult {
  token: string
  redirect_url: string
}

// ═══════════════════════════════════════════════════════════════════
//  SERVER-SIDE PAYMENT (via Supabase Edge Function)
//
//  All Midtrans server-key operations MUST go through a backend.
//  The Edge Function at `supabase/functions/payment-webhook/` should
//  also expose a `/create-transaction` endpoint.
// ═══════════════════════════════════════════════════════════════════

/**
 * Create a Snap transaction by calling the Supabase Edge Function.
 * The server key is stored securely in the Edge Function environment.
 */
export async function createSnapTransaction(
  params: CreatePaymentParams
): Promise<PaymentResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'payment-webhook',
      {
        body: {
          action: 'create-transaction',
          order_id: params.orderNumber,
          gross_amount: params.amount,
          customer_name: params.customerName,
          customer_email: params.customerEmail || '',
          customer_phone: params.customerPhone,
          items: params.items || [
            {
              id: 'service',
              name: 'Jasa Print DTF',
              price: params.amount,
              quantity: 1,
            },
          ],
          finish_url: `${window.location.origin}/order/success/${params.orderNumber}`,
        },
      }
    )

    if (error) {
      console.error('Edge Function error:', error)
      return null
    }

    if (!data?.token || !data?.redirect_url) {
      console.error('Invalid response from payment Edge Function:', data)
      return null
    }

    // Record payment in the database
    await supabase.from('payments').insert({
      order_id: params.orderId,
      provider: 'midtrans',
      status: 'PENDING',
      amount: params.amount,
      payment_link: data.redirect_url,
    })

    return {
      token: data.token,
      redirect_url: data.redirect_url,
    }
  } catch (error) {
    console.error('Create payment error:', error)
    return null
  }
}

/**
 * Check payment status via the Edge Function (server-side).
 */
export async function checkPaymentStatus(
  orderNumber: string
): Promise<{
  status: 'pending' | 'success' | 'failed' | 'expired'
  paymentType?: string
  transactionId?: string
}> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'payment-webhook',
      {
        body: {
          action: 'check-status',
          order_id: orderNumber,
        },
      }
    )

    if (error || !data) {
      return { status: 'pending' }
    }

    const transactionStatus = data.transaction_status
    const paymentType = data.payment_type
    const transactionId = data.transaction_id

    let paymentStatus: 'pending' | 'success' | 'failed' | 'expired'

    switch (transactionStatus) {
      case 'capture':
      case 'settlement':
        paymentStatus = 'success'
        break
      case 'pending':
        paymentStatus = 'pending'
        break
      case 'expire':
        paymentStatus = 'expired'
        break
      case 'cancel':
      case 'deny':
      case 'failure':
        paymentStatus = 'failed'
        break
      default:
        paymentStatus = 'pending'
    }

    return { status: paymentStatus, paymentType, transactionId }
  } catch (error) {
    console.error('Check payment status error:', error)
    return { status: 'pending' }
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CLIENT-SIDE SNAP INTEGRATION (uses Client Key only — safe)
// ═══════════════════════════════════════════════════════════════════

/**
 * Load the Midtrans Snap.js script into the page.
 * Only uses the CLIENT_KEY which is safe to expose.
 */
export function loadMidtransSnap(callback: () => void) {
  if (!CLIENT_KEY) {
    console.warn('Midtrans CLIENT_KEY not configured')
    return
  }

  // Prevent duplicate script loading
  if (document.querySelector('script[data-client-key]')) {
    callback()
    return
  }

  const script = document.createElement('script')
  script.src = `${MIDTRANS_PORTAL}/snap/snap.js`
  script.setAttribute('data-client-key', CLIENT_KEY)
  script.onload = callback
  script.onerror = () => console.error('Failed to load Midtrans Snap.js')
  document.body.appendChild(script)
}

/**
 * Open the Midtrans Snap payment popup.
 */
export function openMidtransSnap(token: string) {
  if (typeof window === 'undefined' || !window.snap) {
    console.error('Midtrans Snap.js not loaded')
    return
  }

  window.snap.pay(token, {
    onSuccess: (result: unknown) => {
      console.log('Payment success:', result)
      const orderId = (result as { order_id?: string })?.order_id
      if (orderId) {
        window.location.href = `/order/success/${orderId}`
      }
    },
    onPending: (result: unknown) => {
      console.log('Payment pending:', result)
      const orderId = (result as { order_id?: string })?.order_id
      if (orderId) {
        window.location.href = `/order/success/${orderId}`
      }
    },
    onError: (result: unknown) => {
      console.error('Payment error:', result)
    },
    onClose: () => {
      console.log('Payment popup closed')
    },
  })
}

// ═══════════════════════════════════════════════════════════════════
//  STATUS FORMATTERS
// ═══════════════════════════════════════════════════════════════════

export function formatMidtransStatus(status: string): string {
  const statusMap: Record<string, string> = {
    capture: 'Tertangkap',
    settlement: 'Lunas',
    pending: 'Menunggu Pembayaran',
    deny: 'Ditolak',
    cancel: 'Dibatalkan',
    expire: 'Kedaluwarsa',
    refund: 'Dikembalikan',
  }
  return statusMap[status] || status
}