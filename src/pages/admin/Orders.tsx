import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  ChevronRight, 
  Eye,
  Clock,
  Package,
  Phone,
  Mail,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge } from '@/components/PaymentStatus'
import { getOrders } from '@/lib/db'
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

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pesanan</h1>
          <p className="text-text-muted">Kelola semua pesanan masuk</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{orders.length} pesanan</Badge>
        </div>
      </div>

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