import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  FileText, 
  Folder, 
  Image, 
  DollarSign,
  Settings,
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Members', href: '/admin/members', icon: Users },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Payments', href: '/admin/payments', icon: DollarSign },
  { name: 'Files', href: '/admin/files', icon: Folder },
  { name: 'Media', href: '/admin/media', icon: Image },
  { name: 'Price List', href: '/admin/price-list', icon: FileText },
  { name: 'Content', href: '/admin/content', icon: FileText },
  { name: 'SEO', href: '/admin/seo-tracking', icon: Settings },
  { name: 'WhatsApp', href: '/admin/whatsapp', icon: Settings },
  { name: 'Company', href: '/admin/company', icon: Settings },
]

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

const paymentStatusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  'UNPAID': { label: 'Belum Bayar', variant: 'destructive' },
  'PENDING': { label: 'Pending', variant: 'warning' },
  'PAID': { label: 'Lunas', variant: 'success' },
  'EXPIRED': { label: 'Expired', variant: 'secondary' },
  'FAILED': { label: 'Gagal', variant: 'destructive' },
}

// Sample data - will be replaced with Supabase data
const sampleOrders = [
  {
    id: '1',
    order_number: 'ORD-2604-ABC123',
    customer_name: 'Budi Santoso',
    customer_phone: '081234567890',
    service_type: 'Print DTF Meteran',
    status: 'MENUNGGU_REVIEW_FILE',
    payment_status: 'UNPAID',
    created_at: '2026-04-26T10:00:00Z',
    total_amount: 150000,
  },
  {
    id: '2',
    order_number: 'ORD-2604-DEF456',
    customer_name: 'Siti Aminah',
    customer_phone: '087765432100',
    service_type: 'Print Banyak Desain',
    status: 'PEMBAYARAN_BERHASIL',
    payment_status: 'PAID',
    created_at: '2026-04-25T14:30:00Z',
    total_amount: 275000,
  },
  {
    id: '3',
    order_number: 'ORD-2604-GHI789',
    customer_name: 'Ahmad Rizal',
    customer_phone: '081122334455',
    service_type: 'Maklon Vendor',
    status: 'MASUK_PRODUKSI',
    payment_status: 'PAID',
    created_at: '2026-04-24T09:15:00Z',
    total_amount: 450000,
  },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const stats = [
    { label: 'Order Baru', value: 5, icon: Clock, color: 'text-warning' },
    { label: 'Menunggu Review', value: 3, icon: AlertCircle, color: 'text-warning' },
    { label: 'Menunggu Bayar', value: 2, icon: AlertCircle, color: 'text-danger' },
    { label: 'Masuk Produksi', value: 4, icon: CheckCircle, color: 'text-info' },
    { label: 'Selesai', value: 12, icon: CheckCircle, color: 'text-success' },
  ]

  const filteredOrders = sampleOrders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl font-bold text-primary">cetakin.com</Link>
              <span className="text-sm text-muted-foreground">Admin Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.map((stat, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daftar Order</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cari order number, nama, atau WA..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3"
                  >
                    <option value="all">Semua Status</option>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium">Order</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Customer</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Layanan</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Bayar</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Total</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Tanggal</th>
                        <th className="text-left py-3 px-2 text-sm font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-accent/50">
                            <td className="py-3 px-2">
                              <span className="font-mono text-sm">{order.order_number}</span>
                            </td>
                            <td className="py-3 px-2">
                              <p className="text-sm font-medium">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                            </td>
                            <td className="py-3 px-2 text-sm">{order.service_type}</td>
                            <td className="py-3 px-2">
                              <Badge variant={statusConfig[order.status]?.variant || 'secondary'}>
                                {statusConfig[order.status]?.label || order.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant={paymentStatusConfig[order.payment_status]?.variant || 'secondary'}>
                                {paymentStatusConfig[order.payment_status]?.label || order.payment_status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-sm font-medium">
                              {formatCurrency(order.total_amount)}
                            </td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="py-3 px-2">
                              <Link to={`/admin/orders/${order.id}`}>
                                <Button variant="ghost" size="sm">
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-muted-foreground">
                            Tidak ada order
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}