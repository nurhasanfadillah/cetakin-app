import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Search, 
  ChevronRight, 
  Eye,
  Clock,
  Package,
  Phone,
  Mail,
  Plus,
  X,
  Loader2,
  MapPin,
  Truck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge } from '@/components/PaymentStatus'
import { getOrders } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { OrderStatus } from '@/types'

const statusConfig: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  'MENUNGGU_REVIEW_FILE': { label: 'Menunggu Review', variant: 'warning' },
  'FILE_PERLU_REVISI': { label: 'Perlu Revisi', variant: 'destructive' },
  'MENUNGGU_APPROVAL_HARGA': { label: 'Menunggu Approval', variant: 'warning' },
  'INVOICE_DITERBITKAN': { label: 'Invoice Diterbitkan', variant: 'info' },
  'MENUNGGU_PEMBAYARAN': { label: 'Menunggu Pembayaran', variant: 'warning' },
  'PEMBAYARAN_BERHASIL': { label: 'Pembayaran Berhasil', variant: 'success' },
  'MASUK_PRODUKSI': { label: 'Masuk Produksi', variant: 'info' },
  'SELESAI_PRODUKSI': { label: 'Selesai Produksi', variant: 'info' },
  'SIAP_DIAMBIL': { label: 'Siap Diambil', variant: 'success' },
  'DIKIRIM': { label: 'Dikirim', variant: 'success' },
  'SELESAI': { label: 'Selesai', variant: 'success' },
  'DIBATALKAN': { label: 'Dibatalkan', variant: 'destructive' },
}

const formatCurrency = (amount: number | null) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const SERVICE_OPTIONS = [
  { value: 'print_dtf_meteran', label: 'Print DTF Meteran' },
  { value: 'print_banyak_desain', label: 'Print Banyak Desain Sekaligus' },
  { value: 'maklon_vendor', label: 'Maklon Print DTF Vendor' },
  { value: 'bantuan_layout', label: 'Bantuan Layout Hemat Area Cetak' },
  { value: 'bantu_desain', label: 'Bantu Desain Ringan' },
]

export default function AdminOrders() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_type: 'print_dtf_meteran',
    estimated_size: '',
    pickup_method: 'pickup' as 'pickup' | 'shipping',
    shipping_address: '',
    shipping_city: '',
    customer_notes: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => getOrders(statusFilter ? { status: statusFilter } : undefined),
  })

  const orders = data?.orders || []

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      order.order_number?.toLowerCase().includes(q) ||
      order.customer_name?.toLowerCase().includes(q) ||
      order.customer_phone?.includes(q)
    )
  })

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const date = new Date()
      const year = date.getFullYear().toString().slice(-2)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      const orderNumber = `ORD-${year}${month}-${random}`

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          service_type: formData.service_type,
          estimated_size: formData.estimated_size || null,
          pickup_method: formData.pickup_method,
          shipping_address: formData.pickup_method === 'shipping' ? formData.shipping_address : null,
          shipping_city: formData.pickup_method === 'shipping' ? formData.shipping_city : null,
          customer_notes: formData.customer_notes || null,
          status: 'MENUNGGU_REVIEW_FILE',
          payment_status: 'UNPAID',
          discount: 0,
        })
        .select()
        .single()
      
      if (error) throw error
      return order
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      setShowCreateModal(false)
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        service_type: 'print_dtf_meteran',
        estimated_size: '',
        pickup_method: 'pickup',
        shipping_address: '',
        shipping_city: '',
        customer_notes: '',
      })
      navigate(`/admin/orders/${order.id}`)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pesanan</h1>
          <p className="text-text-muted">Kelola semua pesanan masuk</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{orders.length} pesanan</Badge>
          <Button variant="accent" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Order Baru
          </Button>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Order Baru</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Customer *</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">No. WhatsApp *</label>
                <input
                  type="text"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Layanan *</label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Ukuran/Panjang</label>
                <input
                  type="text"
                  value={formData.estimated_size}
                  onChange={(e) => setFormData({ ...formData, estimated_size: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Contoh: 30cm x 40cm atau 1 meter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Pengambilan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pickup_method: 'pickup' })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.pickup_method === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Ambil Sendiri</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pickup_method: 'shipping' })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.pickup_method === 'shipping' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span className="text-sm font-medium">Dikirim</span>
                  </button>
                </div>
              </div>
              {formData.pickup_method === 'shipping' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Alamat Pengiriman</label>
                    <textarea
                      value={formData.shipping_address}
                      onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Alamat lengkap"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Kota</label>
                    <input
                      type="text"
                      value={formData.shipping_city}
                      onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Nama kota"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Catatan</label>
                <textarea
                  value={formData.customer_notes}
                  onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Catatan tambahan..."
                  rows={2}
                />
              </div>
              <Button
                variant="accent"
                className="w-full"
                onClick={() => createOrderMutation.mutate()}
                disabled={createOrderMutation.isPending || !formData.customer_name || !formData.customer_phone}
              >
                {createOrderMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Buat Order
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Cari nomor order, nama, atau WA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-11 rounded-xl border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="">Semua Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-text-muted mt-4">Memuat...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">Belum ada pesanan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{order.order_number}</span>
                        <Badge variant={statusConfig[order.status as OrderStatus]?.variant || 'secondary'}>
                          {statusConfig[order.status as OrderStatus]?.label || order.status}
                        </Badge>
                        <PaymentStatusBadge status={order.payment_status as string} />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-text-primary">{order.customer_name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {order.customer_phone}
                        </span>
                        {order.customer_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {order.customer_email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-text-muted">Total</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(order.total_amount || order.estimated_price)}
                        </p>
                      </div>
                      
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Detail
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4 text-sm">
                    <span className="text-text-muted">Layanan: <span className="text-text-primary">{order.service_type}</span></span>
                    {order.estimated_size && (
                      <span className="text-text-muted">Ukuran: <span className="text-text-primary">{order.estimated_size}</span></span>
                    )}
                    <span className="text-text-muted">Pengiriman: <span className="text-text-primary">
                      {order.pickup_method === 'pickup' ? 'Ambil sendiri' : 'Dikirim'}
                    </span></span>
                    {order.customer_notes && (
                      <span className="text-text-muted">Catatan: <span className="text-text-primary">{order.customer_notes}</span></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}