import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, FileText, Clock, ChevronRight, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
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

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function MemberInvoices() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['member-invoices', user?.id],
    queryFn: () => getInvoices({ memberId: user?.id }),
    enabled: !!user?.id,
  })

  const invoices = data?.invoices || []
  const filtered = invoices.filter(inv => {
    if (!searchQuery) return true
    return inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoice Saya</h1>
          <p className="text-text-muted">Riwayat tagihan dan pembayaran</p>
        </div>
        <Badge variant="secondary">{invoices.length} invoice</Badge>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Cari nomor invoice..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-11 rounded-xl border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-text-muted mt-4">Memuat...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center"><FileText className="w-12 h-12 mx-auto text-text-muted mb-4" /><p className="text-text-muted">Belum ada invoice</p></div>
          ) : (
            <div className="space-y-3">
              {filtered.map((inv) => {
                const order = inv.order as { order_number?: string } | null
                return (
                  <div key={inv.id} className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">{inv.invoice_number}</span>
                          <Badge variant={statusConfig[inv.status as InvoiceStatus]?.variant || 'secondary'}>
                            {statusConfig[inv.status as InvoiceStatus]?.label || inv.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                          {order?.order_number && <span>Order: {order.order_number}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(inv.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-primary">{formatCurrency(inv.total)}</p>
                        <Link to={`/member/invoices/${inv.id}`}>
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /><ChevronRight className="w-4 h-4" /></Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}