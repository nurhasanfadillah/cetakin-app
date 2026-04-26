import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, FileText, Eye, ChevronRight, Clock 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getInvoices } from '@/lib/db'
import type { InvoiceStatus } from '@/types'

const statusConfig: Record<InvoiceStatus, { label: string; variant: BadgeVariant }> = {
  'DRAFT': { label: 'Draft', variant: 'secondary' },
  'ISSUED': { label: 'Diterbitkan', variant: 'info' },
  'PAID': { label: 'Lunas', variant: 'success' },
  'CANCELLED': { label: 'Dibatalkan', variant: 'destructive' },
}

const formatCurrency = (amount: number | null) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  })
}

export default function AdminInvoices() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-invoices', statusFilter],
    queryFn: () => getInvoices(statusFilter ? { status: statusFilter } : undefined),
  })

  const invoices = data?.invoices || []

  const filtered = invoices.filter(inv => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      inv.invoice_number?.toLowerCase().includes(q) ||
      (inv.order as { customer_name?: string })?.customer_name?.toLowerCase().includes(q)
    )
  })

  const totalRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + (i.total || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoice</h1>
          <p className="text-text-muted">Kelola semua invoice</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{invoices.length} invoice</Badge>
          <Badge variant="success">Paid: {formatCurrency(totalRevenue)}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Cari nomor invoice atau nama..."
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
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">Belum ada invoice</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Order</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Tanggal</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const order = inv.order as { order_number?: string; customer_name?: string } | null
                    return (
                      <tr key={inv.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-primary">{inv.invoice_number}</span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium">{order?.order_number || '-'}</p>
                          <p className="text-xs text-text-muted">{order?.customer_name || '-'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={statusConfig[inv.status as InvoiceStatus]?.variant || 'secondary'}>
                            {statusConfig[inv.status as InvoiceStatus]?.label || inv.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 font-medium">{formatCurrency(inv.total)}</td>
                        <td className="py-4 px-4 text-sm text-text-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(inv.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link to={`/admin/invoices/${inv.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Detail
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}