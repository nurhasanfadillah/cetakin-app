import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Package, Clock, ChevronRight, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
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

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function MemberOrders() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['member-orders', user?.id],
    queryFn: () => getOrders({ memberId: user?.id }),
    enabled: !!user?.id,
  })

  const orders = data?.orders || []
  const filtered = orders.filter(o => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return o.order_number?.toLowerCase().includes(q) || o.service_type?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pesanan Saya</h1>
          <p className="text-text-muted">Riwayat semua pesanan Anda</p>
        </div>
        <Badge variant="secondary">{orders.length} pesanan</Badge>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Cari nomor order..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-11 rounded-xl border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-text-muted mt-4">Memuat...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center"><Package className="w-12 h-12 mx-auto text-text-muted mb-4" /><p className="text-text-muted">Belum ada pesanan</p></div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div key={order.id} className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{order.order_number}</span>
                        <Badge variant={statusConfig[order.status as OrderStatus]?.variant || 'secondary'}>
                          {statusConfig[order.status as OrderStatus]?.label || order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-text-muted">
                        <span>{order.service_type}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-primary">{formatCurrency(order.total_amount || order.estimated_price)}</p>
                      <Link to={`/member/orders/${order.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /><ChevronRight className="w-4 h-4" /></Button>
                      </Link>
                    </div>
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