import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ShoppingCart, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Package,
  TrendingUp,
  ChevronRight,
  Search,
  RefreshCw,
  Plus,
  X,
  Loader2,
  Truck,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/ui/loading'
import { getDashboardStats, getOrders } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { OrderStatus, PaymentStatus } from '@/types'

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

const paymentStatusConfig: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  'UNPAID': { label: 'Belum Bayar', variant: 'destructive' },
  'PENDING': { label: 'Pending', variant: 'warning' },
  'PAID': { label: 'Lunas', variant: 'success' },
  'EXPIRED': { label: 'Expired', variant: 'secondary' },
  'FAILED': { label: 'Gagal', variant: 'destructive' },
  'REFUNDED': { label: 'Refund', variant: 'secondary' },
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const SERVICE_OPTIONS = [
  { value: 'print_dtf_meteran', label: 'Print DTF Meteran' },
  { value: 'print_banyak_desain', label: 'Print Banyak Desain Sekaligus' },
  { value: 'maklon_vendor', label: 'Maklon Print DTF Vendor' },
  { value: 'bantuan_layout', label: 'Bantuan Layout Hemat Area Cetak' },
  { value: 'bantu_desain', label: 'Bantu Desain Ringan' },
]

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showQuickOrder, setShowQuickOrder] = useState(false)
  const [quickOrderData, setQuickOrderData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_type: 'print_dtf_meteran',
    estimated_size: '',
    estimated_price: '',
    pickup_method: 'pickup' as 'pickup' | 'shipping',
    shipping_address: '',
    shipping_city: '',
    customer_notes: '',
  })

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getDashboardStats,
  })

  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders-recent'],
    queryFn: () => getOrders({ limit: 10 }),
  })

  const orders = ordersData?.orders || []

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone?.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRefresh = () => {
    refetchStats()
    refetchOrders()
  }

  const generateOrderNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${year}${month}-${random}`
  }

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderNumber = generateOrderNumber()
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: quickOrderData.customer_name,
          customer_phone: quickOrderData.customer_phone,
          customer_email: quickOrderData.customer_email || null,
          service_type: quickOrderData.service_type,
          estimated_size: quickOrderData.estimated_size || null,
          estimated_price: quickOrderData.estimated_price ? parseInt(quickOrderData.estimated_price) : null,
          pickup_method: quickOrderData.pickup_method,
          shipping_address: quickOrderData.pickup_method === 'shipping' ? quickOrderData.shipping_address : null,
          shipping_city: quickOrderData.pickup_method === 'shipping' ? quickOrderData.shipping_city : null,
          customer_notes: quickOrderData.customer_notes || null,
          status: 'MENUNGGU_REVIEW_FILE',
          payment_status: 'UNPAID',
          discount: 0,
        })
        .select()
        .single()
      
      if (error) throw error
      return order
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-recent'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
      setShowQuickOrder(false)
      setQuickOrderData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        service_type: 'print_dtf_meteran',
        estimated_size: '',
        estimated_price: '',
        pickup_method: 'pickup',
        shipping_address: '',
        shipping_city: '',
        customer_notes: '',
      })
    },
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Selamat datang di panel admin CetakIn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="accent" size="sm" onClick={() => setShowQuickOrder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Order Baru
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Order Modal */}
      {showQuickOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Order Baru (Quick)</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowQuickOrder(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Customer *</label>
                <input
                  type="text"
                  value={quickOrderData.customer_name}
                  onChange={(e) => setQuickOrderData({ ...quickOrderData, customer_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">No. WhatsApp *</label>
                <input
                  type="text"
                  value={quickOrderData.customer_phone}
                  onChange={(e) => setQuickOrderData({ ...quickOrderData, customer_phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={quickOrderData.customer_email}
                  onChange={(e) => setQuickOrderData({ ...quickOrderData, customer_email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Layanan *</label>
                <select
                  value={quickOrderData.service_type}
                  onChange={(e) => setQuickOrderData({ ...quickOrderData, service_type: e.target.value })}
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
                  value={quickOrderData.estimated_size}
                  onChange={(e) => setQuickOrderData({ ...quickOrderData, estimated_size: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Contoh: 30cm x 40cm atau 1 meter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Estimasi Harga (Rp)</label>
                <input
                  type="number"
                  value={quickOrderData.estimated_price}
                  onChange={(e) => setQuickOrderData({ ...quickOrderData, estimated_price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Contoh: 150000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Pengambilan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickOrderData({ ...quickOrderData, pickup_method: 'pickup' })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      quickOrderData.pickup_method === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Ambil Sendiri</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickOrderData({ ...quickOrderData, pickup_method: 'shipping' })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      quickOrderData.pickup_method === 'shipping' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span className="text-sm font-medium">Dikirim</span>
                  </button>
                </div>
              </div>
              {quickOrderData.pickup_method === 'shipping' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Alamat Pengiriman</label>
                    <textarea
                      value={quickOrderData.shipping_address}
                      onChange={(e) => setQuickOrderData({ ...quickOrderData, shipping_address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Alamat lengkap"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Kota</label>
                    <input
                      type="text"
                      value={quickOrderData.shipping_city}
                      onChange={(e) => setQuickOrderData({ ...quickOrderData, shipping_city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Nama kota"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Catatan</label>
                <textarea
                  value={quickOrderData.customer_notes}
                  onChange={(e) => setQuickOrderData({ ...quickOrderData, customer_notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Catatan tambahan..."
                  rows={2}
                />
              </div>
              <Button
                variant="accent"
                className="w-full"
                onClick={() => createOrderMutation.mutate()}
                disabled={createOrderMutation.isPending || !quickOrderData.customer_name || !quickOrderData.customer_phone}
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

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-surface rounded-xl border border-border p-4 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-surface-highlight" />
                <div className="mt-3 h-8 w-16 bg-surface-highlight rounded" />
                <div className="mt-2 h-4 w-24 bg-surface-highlight rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-surface rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingPayment || 0}</p>
                  <p className="text-xs text-text-muted">Menunggu Bayar</p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.activeOrders || 0}</p>
                  <p className="text-xs text-text-muted">Order Aktif</p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                  <p className="text-xs text-text-muted">Total Order</p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
                  <p className="text-xs text-text-muted">Member</p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                  <p className="text-xs text-text-muted">Pendapatan</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Terbaru</CardTitle>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Cari order number, nama, atau WA..."
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
                <option value="all">Semua Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {ordersLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner text="Memuat order..." />
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-6 text-sm font-medium text-text-muted">Order</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Layanan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Bayar</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Tanggal</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm font-medium">{order.order_number}</span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium">{order.customer_name}</p>
                          <p className="text-xs text-text-muted">{order.customer_phone}</p>
                        </td>
                        <td className="py-4 px-4 text-sm">{order.service_type}</td>
                        <td className="py-4 px-4">
                          <Badge variant={statusConfig[order.status as OrderStatus]?.variant || 'secondary'}>
                            {statusConfig[order.status as OrderStatus]?.label || order.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={paymentStatusConfig[order.payment_status as PaymentStatus]?.variant || 'secondary'}>
                            {paymentStatusConfig[order.payment_status as PaymentStatus]?.label || order.payment_status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium">
                          {formatCurrency(order.total_amount || 0)}
                        </td>
                        <td className="py-4 px-4 text-sm text-text-muted">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <Link to={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Belum ada order</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}