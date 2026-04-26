import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ShoppingCart, 
  Clock,
  CheckCircle,
  Plus,
  ChevronRight,
  Truck,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getOrders } from '@/lib/db'
import { useAuth } from '@/lib/AuthContext'
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
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MemberDashboard() {
  const { user } = useAuth()
  
  const { data, isLoading } = useQuery({
    queryKey: ['member-orders'],
    queryFn: () => getOrders({ memberId: user?.id }),
    enabled: !!user?.id,
  })

  const orders = data?.orders || []

  const activeOrders = orders.filter(o => 
    !['SELESAI', 'DIBATALKAN'].includes(o.status)
  )
  const completedOrders = orders.filter(o => 
    ['SELESAI'].includes(o.status)
  )

  const stats = [
    { 
      label: 'Total Order', 
      value: orders.length, 
      icon: ShoppingCart,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'Sedang Diproses', 
      value: activeOrders.length, 
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    { 
      label: 'Selesai', 
      value: completedOrders.length, 
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10'
    },
  ]

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Halo, {user?.full_name?.split(' ')[0]}!</h1>
        <p className="text-text-muted">Berikut ringkasan pesanan Anda.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="bg-surface rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Mau Order Lagi?</h2>
            <p className="text-white/80">Siap membantu kebutuhan printing Anda.</p>
          </div>
          <Link to="/order">
            <Button variant="accent" size="lg" className="group">
              <Plus className="w-5 h-5 mr-2" />
              Order Baru
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pesanan Terbaru</CardTitle>
            <Link to="/member/orders">
              <Button variant="ghost" size="sm">
                Lihat Semua
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">Belum ada pesanan</p>
              <Link to="/order" className="mt-4 inline-block">
                <Button variant="accent" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Order Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {order.pickup_method === 'pickup' ? (
                        <MapPin className="w-5 h-5 text-primary" />
                      ) : (
                        <Truck className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono font-medium">{order.order_number}</p>
                      <p className="text-sm text-text-muted">{order.service_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={statusConfig[order.status as OrderStatus]?.variant || 'secondary'}>
                      {statusConfig[order.status as OrderStatus]?.label || order.status}
                    </Badge>
                    <div className="text-right hidden md:block">
                      <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                      <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                    </div>
                    <Link to={`/member/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
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