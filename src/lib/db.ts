import { supabase } from './supabase'
import type { Order, Invoice } from '../types'

// ==================== PROFILES ====================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', userId)
    .single()
  
  return { data, error, profile: data }
}

export async function getAllMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error, members: data }
}

// ==================== ORDERS ====================

export async function createOrder(order: Partial<Order>) {
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...order, order_number: orderNumber })
    .select()
    .single()
  
  return { data, error, order: data }
}

export async function getOrders(filters?: {
  memberId?: string
  status?: string
  limit?: number
}) {
  let query = supabase
    .from('orders')
    .select('*, member:profiles(full_name, phone)')
    .order('created_at', { ascending: false })

  if (filters?.memberId) {
    query = query.eq('member_id', filters.memberId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  return { data, error, orders: data }
}

export async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, files:order_files(*), member:profiles(*), invoice:invoices(*)')
    .eq('id', orderId)
    .single()
  
  return { data, error, order: data }
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, files:order_files(*), member:profiles(*)')
    .eq('order_number', orderNumber)
    .single()
  
  return { data, error, order: data }
}

export async function updateOrder(orderId: string, updates: Partial<Order>) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single()
  
  return { data, error, order: data }
}

export async function updateOrderStatus(orderId: string, status: string, changedBy?: string) {
  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single()

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (!error) {
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      old_status: order?.status,
      new_status: status,
      changed_by: changedBy
    })
  }

  return { data, error, order: data }
}

// ==================== INVOICES ====================

export async function createInvoice(invoice: Partial<Invoice>) {
  const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  
  const { data, error } = await supabase
    .from('invoices')
    .insert({ ...invoice, invoice_number: invoiceNumber })
    .select()
    .single()
  
  return { data, error, invoice: data }
}

export async function getInvoices(filters?: {
  memberId?: string
  status?: string
  orderId?: string
}) {
  let query = supabase
    .from('invoices')
    .select('*, order:orders(order_number, customer_name, status)')
    .order('created_at', { ascending: false })

  if (filters?.memberId) query = query.eq('member_id', filters.memberId)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.orderId) query = query.eq('order_id', filters.orderId)

  const { data, error } = await query
  return { data, error, invoices: data }
}

export async function getInvoice(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, order:orders(*), payments:payments(*)')
    .eq('id', invoiceId)
    .single()
  
  return { data, error, invoice: data }
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()
  
  return { data, error, invoice: data }
}

// ==================== FILES ====================

export async function uploadFile(bucket: string, file: File, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  return { data, error }
}

export async function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  return { error }
}

// ==================== SERVICES ====================

export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*, price_items:price_list_items(*)')
    .eq('is_active', true)
    .order('sort_order')
  
  return { data, error, services: data }
}

// ==================== MEDIA ====================

export async function getMediaAssets(category?: string) {
  let query = supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  return { data, error, media: data }
}

// ==================== LANDING PAGE ====================

export async function getLandingPageContent() {
  const [sections, faqs, valueCards, audienceCards, orderSteps] = await Promise.all([
    supabase.from('landing_page_sections').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('landing_page_faqs').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('landing_page_value_cards').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('landing_page_audience_cards').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('landing_page_order_steps').select('*').eq('is_active', true).order('sort_order')
  ])

  return {
    sections: sections.data,
    faqs: faqs.data,
    valueCards: valueCards.data,
    audienceCards: audienceCards.data,
    orderSteps: orderSteps.data
  }
}

// ==================== SETTINGS ====================

export async function getSetting<T>(key: string) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()
  
  return { 
    data: data?.value as T | null, 
    error 
  }
}

export async function updateSetting(key: string, value: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key, value })
    .select()
    .single()
  
  return { data, error }
}

// ==================== ANALYTICS ====================

export async function getDashboardStats() {
  const [orders, invoices, members] = await Promise.all([
    supabase.from('orders').select('status, payment_status'),
    supabase.from('invoices').select('status, total'),
    supabase.from('profiles').select('id', { count: 'exact' })
  ])

  const totalOrders = orders.data?.length || 0
  const pendingPayment = orders.data?.filter(o => o.payment_status === 'UNPAID' || o.payment_status === 'PENDING').length || 0
  const activeOrders = orders.data?.filter(o => !['SELESAI', 'DIBATALKAN'].includes(o.status)).length || 0
  const totalRevenue = invoices.data?.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.total || 0), 0) || 0
  const totalMembers = members.count || 0

  return {
    totalOrders,
    pendingPayment,
    activeOrders,
    totalRevenue,
    totalMembers
  }
}