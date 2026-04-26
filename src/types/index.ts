export type UserRole = 'member' | 'admin' | 'super_admin'

export interface Profile {
  id: string
  auth_user_id: string | null
  full_name: string
  phone: string
  email: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type OrderStatus = 
  | 'MENUNGGU_REVIEW_FILE'
  | 'FILE_PERLU_REVISI'
  | 'MENUNGGU_APPROVAL_HARGA'
  | 'INVOICE_DITERBITKAN'
  | 'MENUNGGU_PEMBAYARAN'
  | 'PEMBAYARAN_BERHASIL'
  | 'MASUK_PRODUKSI'
  | 'SELESAI_PRODUKSI'
  | 'SIAP_DIAMBIL'
  | 'DIKIRIM'
  | 'SELESAI'
  | 'DIBATALKAN'

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUNDED'

export type PickupMethod = 'pickup' | 'shipping'

export interface Order {
  id: string
  order_number: string
  member_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  service_type: string
  estimated_size: string | null
  deadline: string | null
  pickup_method: PickupMethod
  shipping_address: string | null
  shipping_city: string | null
  customer_notes: string | null
  internal_notes: string | null
  status: OrderStatus
  estimated_price: number | null
  final_price: number | null
  shipping_cost: number | null
  discount: number
  total_amount: number | null
  payment_status: PaymentStatus
  invoice_id: string | null
  created_at: string
  updated_at: string
  files?: OrderFile[]
}

export interface OrderFile {
  id: string
  order_id: string
  media_asset_id: string | null
  file_name: string
  file_path: string
  bucket_name: string
  mime_type: string
  file_size: number
  created_at: string
}

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED'

export interface Invoice {
  id: string
  invoice_number: string
  order_id: string
  member_id: string | null
  status: InvoiceStatus
  subtotal: number
  design_fee: number
  layout_fee: number
  shipping_cost: number
  discount: number
  total: number
  issued_at: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  order_id: string
  invoice_id: string
  provider: string
  provider_payment_id: string | null
  payment_link: string | null
  status: PaymentStatus
  amount: number
  payload: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  title: string
  slug: string
  description: string
  cocok_untuk: string | null
  notes: string | null
  base_price: number | null
  price_label: string | null
  is_active: boolean
  sort_order: number
  media_asset_id: string | null
  created_at: string
  updated_at: string
}

export interface PriceListItem {
  id: string
  service_id: string | null
  title: string
  description: string | null
  price_label: string
  price: number | null
  is_vendor_price: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MediaAsset {
  id: string
  file_name: string
  file_path: string
  public_url: string | null
  bucket_name: string
  mime_type: string
  file_size: number
  alt_text: string | null
  category: string | null
  linked_section: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface LandingPageSection {
  id: string
  section_key: string
  title: string | null
  subtitle: string | null
  body: string | null
  cta_primary_label: string | null
  cta_primary_url: string | null
  cta_secondary_label: string | null
  cta_secondary_url: string | null
  note: string | null
  media_asset_id: string | null
  is_active: boolean
  sort_order: number
  content_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ValueCard {
  id: string
  title: string
  description: string
  media_asset_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AudienceCard {
  id: string
  title: string
  description: string
  main_message: string | null
  media_asset_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface OrderStep {
  id: string
  step_number: number
  title: string
  description: string
  media_asset_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface SeoSetting {
  id: string
  page_key: string
  meta_title: string
  meta_description: string
  og_title: string | null
  og_description: string | null
  og_image_id: string | null
  canonical_url: string | null
  updated_at: string
}

export interface TrackingSetting {
  id: string
  google_ads_conversion_id: string | null
  google_ads_conversion_label: string | null
  ga4_measurement_id: string | null
  enable_google_ads: boolean
  enable_ga4: boolean
  test_mode: boolean
  updated_at: string
}