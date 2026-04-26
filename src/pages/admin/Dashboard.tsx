import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ShoppingCart, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Package,
  TrendingUp,
  ChevronRight,
  Search,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/ui/loading'
import { getDashboardStats, getOrders } from '@/lib/db'
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

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Selamat datang di panel admin CetakIn</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

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