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
const ENVIRONMENT = import.meta.env.MIDTRANS_ENVIRONMENT || 'sandbox'

const MIDTRANS_CONFIG = {
  sandbox: {
    snapUrl: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    apiUrl: 'https://api.sandbox.midtrans.com/v2',
    portalUrl: 'https://app.sandbox.midtrans.com',
  },
  production: {
    snapUrl: 'https://app.midtrans.com/snap/v1/transactions',
    apiUrl: 'https://api.midtrans.com/v2',
    portalUrl: 'https://app.midtrans.com',
  }
}

const config = MIDTRANS_CONFIG[ENVIRONMENT as keyof typeof MIDTRANS_CONFIG] || MIDTRANS_CONFIG.sandbox

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

export interface MidtransSnapResponse {
  token: string
  redirect_url: string
}

export async function createSnapTransaction(params: CreatePaymentParams): Promise<MidtransSnapResponse | null> {
  try {
    const SERVER_KEY = import.meta.env.MIDTRANS_SERVER_KEY
    
    if (!SERVER_KEY) {
      console.warn('Midtrans SERVER_KEY not configured')
      return null
    }

    const transactionDetails = {
      order_id: params.orderNumber,
      gross_amount: params.amount,
    }

    const customerDetails = {
      first_name: params.customerName,
      email: params.customerEmail || '',
      phone: params.customerPhone,
    }

    const itemDetails = params.items?.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })) || [
      {
        id: 'service',
        name: 'Jasa Print DTF',
        price: params.amount,
        quantity: 1
      }
    ]

    const payload = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      item_details: itemDetails,
      credit_card: {
        secure: true
      },
      expiry: {
        start_time: new Date().toISOString(),
        unit: 'hours',
        duration: 24
      },
      callbacks: {
        finish: `${window.location.origin}/order/success/${params.orderNumber}`
      }
    }

    const response = await fetch(config.snapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(SERVER_KEY + ':')}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Midtrans API error:', error)
      return null
    }

    const data = await response.json()
    
    if (data.token && data.redirect_url) {
      await supabase.from('payments').insert({
        order_id: params.orderId,
        provider: 'midtrans',
        status: 'PENDING',
        amount: params.amount,
        payment_link: data.redirect_url,
      })
    }

    return {
      token: data.token,
      redirect_url: data.redirect_url
    }
  } catch (error) {
    console.error('Create payment error:', error)
    return null
  }
}

export async function getTransactionStatus(orderNumber: string) {
  try {
    const SERVER_KEY = import.meta.env.MIDTRANS_SERVER_KEY
    
    if (!SERVER_KEY) {
      return null
    }

    const response = await fetch(`${config.apiUrl}/${orderNumber}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(SERVER_KEY + ':')}`,
      },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Get transaction status error:', error)
    return null
  }
}

export async function checkPaymentStatus(orderNumber: string): Promise<{
  status: 'pending' | 'success' | 'failed' | 'expired'
  paymentType?: string
  transactionId?: string
}> {
  const status = await getTransactionStatus(orderNumber)
  
  if (!status) {
    return { status: 'pending' }
  }

  const transactionStatus = status.transaction_status
  const paymentType = status.payment_type
  const transactionId = status.transaction_id

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

  return {
    status: paymentStatus,
    paymentType,
    transactionId
  }
}

export function loadMidtransSnap(callback: () => void) {
  if (CLIENT_KEY) {
    const script = document.createElement('script')
    script.src = `${config.portalUrl}/snap/snap.js`
    script.setAttribute('data-client-key', CLIENT_KEY)
    script.onload = callback
    document.body.appendChild(script)
  }
}

export function openMidtransSnap(token: string) {
  if (typeof window !== 'undefined' && window.snap) {
    window.snap.pay(token, {
      onSuccess: (result: unknown) => {
        console.log('Payment success:', result)
        window.location.href = `/order/success/${(result as { order_id: string })?.order_id}`
      },
      onPending: (result: unknown) => {
        console.log('Payment pending:', result)
        window.location.href = `/order/success/${(result as { order_id: string })?.order_id}`
      },
      onError: (result: unknown) => {
        console.error('Payment error:', result)
      },
      onClose: () => {
        console.log('Payment popup closed')
      }
    })
  }
}

export function formatMidtransStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'capture': 'Tertangkap',
    'settlement': 'Lunas',
    'pending': 'Menunggu Pembayaran',
    'deny': 'Ditolak',
    'cancel': 'Dibatalkan',
    'expire': 'Kedaluwarsa',
    'refund': 'Dikembalikan'
  }
  return statusMap[status] || status
}