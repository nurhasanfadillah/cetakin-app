import { Link } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  LogOut,
  Clock,
  CheckCircle,
  Printer,
  Plus,
  ChevronRight,
  Truck,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
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

const sampleOrders = [
  {
    id: '1',
    order_number: 'ORD-2604-ABC123',
    service_type: 'Print DTF Meteran',
    status: 'MENUNGGU_REVIEW_FILE',
    pickup_method: 'pickup',
    created_at: '2026-04-26T10:00:00Z',
    total_amount: 150000,
  },
  {
    id: '2',
    order_number: 'ORD-2603-DEF456',
    service_type: 'Print Banyak Desain',
    status: 'SELESAI',
    pickup_method: 'shipping',
    created_at: '2026-04-23T14:30:00Z',
    total_amount: 275000,
  },
  {
    id: '3',
    order_number: 'ORD-2603-GHI789',
    service_type: 'Maklon Vendor',
    status: 'MASUK_PRODUKSI',
    pickup_method: 'pickup',
    created_at: '2026-04-22T09:15:00Z',
    total_amount: 425000,
  },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Dashboard() {
  const stats = [
    { 
      label: 'Total Order', 
      value: sampleOrders.length, 
      icon: ShoppingCart,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'Sedang Diproses', 
      value: sampleOrders.filter(o => ['MENUNGGU_REVIEW_FILE', 'MENUNGGU_APPROVAL_HARGA', 'MENUNGGU_PEMBAYARAN', 'MASUK_PRODUKSI'].includes(o.status)).length, 
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    { 
      label: 'Selesai', 
      value: sampleOrders.filter(o => o.status === 'SELESAI').length, 
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10'
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">cetakin.com</span>
              </Link>
              <span className="hidden md:inline text-sm text-muted-foreground px-2 py-1 bg-surface rounded-md">Member Area</span>
            </div>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 flex-shrink-0">
            <div className="bg-surface rounded-xl border border-border p-4 sticky top-24">
              <nav className="space-y-1">
                <Link to="/member" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg bg-primary/10 text-primary">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/member/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                  Pesanan Saya
                </Link>
                <Link to="/member/invoices" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                  <FileText className="w-4 h-4" />
                  Invoice
                </Link>
              </nav>
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Halo, Member!</h1>
              <p className="text-muted-foreground">Berikut ringkasan pesanan Anda.</p>
            </div>

            {/* Stats */}
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
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
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

            {/* Orders */}
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
                <div className="space-y-3">
                  {sampleOrders.map((order) => (
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
                          <p className="text-sm text-muted-foreground">{order.service_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={statusConfig[order.status]?.variant || 'secondary'}>
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                        <div className="text-right hidden md:block">
                          <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
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
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}