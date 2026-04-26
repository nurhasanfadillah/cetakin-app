import { Link } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  LogOut,
  Clock,
  CheckCircle
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
    created_at: '2026-04-26T10:00:00Z',
    total_amount: 150000,
  },
  {
    id: '2',
    order_number: 'ORD-2603-DEF456',
    service_type: 'Print Banyak Desain',
    status: 'SELESAI',
    created_at: '2026-04-23T14:30:00Z',
    total_amount: 275000,
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
    { label: 'Total Order', value: sampleOrders.length, icon: ShoppingCart },
    { label: 'Menunggu', value: sampleOrders.filter(o => ['MENUNGGU_REVIEW_FILE', 'MENUNGGU_APPROVAL_HARGA', 'MENUNGGU_PEMBAYARAN'].includes(o.status)).length, icon: Clock },
    { label: 'Selesai', value: sampleOrders.filter(o => o.status === 'SELESAI').length, icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl font-bold text-primary">cetakin.com</Link>
              <span className="text-sm text-muted-foreground">Member Area</span>
            </div>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 flex-shrink-0">
            <nav className="space-y-1">
              <Link to="/member" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md bg-accent">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/member/orders" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent">
                <ShoppingCart className="w-4 h-4" />
                Pesanan Saya
              </Link>
              <Link to="/member/invoices" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent">
                <FileText className="w-4 h-4" />
                Invoice
              </Link>
            </nav>
          </aside>

          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Halo, Member!</h1>
              <p className="text-muted-foreground">Berikut ringkasan pesanan Anda.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <stat.icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pesanan Terbaru</CardTitle>
                  <Link to="/member/orders">
                    <Button variant="ghost" size="sm">Lihat Semua</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium">Order</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Layanan</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Total</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Tanggal</th>
                        <th className="text-left py-3 px-2 text-sm font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-accent/50">
                          <td className="py-3 px-2">
                            <span className="font-mono text-sm">{order.order_number}</span>
                          </td>
                          <td className="py-3 px-2 text-sm">{order.service_type}</td>
                          <td className="py-3 px-2">
                            <Badge variant={statusConfig[order.status]?.variant || 'secondary'}>
                              {statusConfig[order.status]?.label || order.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">
                            {formatCurrency(order.total_amount)}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="py-3 px-2">
                            <Link to={`/member/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">Detail</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link to="/order">
                <Button variant="accent">
                  <ShoppingCart className="w-4 h-4" />
                  Order Baru
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}