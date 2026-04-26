import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Printer, Download, ExternalLink, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PaymentStatusBadge } from '@/components/PaymentStatus'
import type { Order } from '@/types'

const formatCurrency = (amount: number | null) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

export default function MemberInvoiceDetail() {
  const { id } = useParams()

  const { data: order, isLoading } = useQuery({
    queryKey: ['member-invoice-order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, invoice:invoices(*), payments:payments(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Order & { invoice?: { id: string; invoice_number: string; created_at: string }; payments?: { payment_link?: string }[] }
    },
    enabled: !!id,
  })

  const totalAmount = (order?.final_price || order?.estimated_price || 0) + (order?.shipping_cost || 0) - (order?.discount || 0)
  const invoice = (order as any).invoice
  const payment = order?.payments?.[0]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice tidak ditemukan</p>
        <Link to="/member" className="mt-4 inline-block">
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={`/member/order/${order.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">
                {invoice ? `Invoice ${invoice.invoice_number}` : 'Invoice'}
              </h1>
              <p className="text-sm text-muted-foreground">Order {order.order_number}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="print:border print:shadow-none">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-primary">Cetakin.com</h2>
                    <p className="text-sm text-muted-foreground">Print DTF Transfer Siap Press</p>
                    <p className="text-sm text-muted-foreground">Cileungsi, Bogor</p>
                  </div>
                  <div className="text-left md:text-right">
                    <h3 className="text-lg font-bold">INVOICE</h3>
                    <p className="text-sm text-muted-foreground">
                      {invoice ? `#${invoice.invoice_number}` : 'DRAFT'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice ? formatDate(invoice.created_at) : formatDate(new Date().toISOString())}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Order</h4>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                    {order.deadline && (
                      <p className="text-sm text-muted-foreground">Deadline: {formatDate(order.deadline)}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Layanan</h4>
                    <p className="font-medium">{order.service_type}</p>
                    {order.estimated_size && (
                      <p className="text-sm text-muted-foreground">Ukuran: {order.estimated_size}</p>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden mb-6">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">Deskripsi</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm">{order.service_type}</p>
                          {order.estimated_size && (
                            <p className="text-xs text-muted-foreground">Ukuran: {order.estimated_size}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">{formatCurrency(order.final_price || order.estimated_price)}</td>
                      </tr>
                      {order.shipping_cost && order.shipping_cost > 0 && (
                        <tr>
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm">Biaya Pengiriman</p>
                            <p className="text-xs text-muted-foreground">{order.shipping_city || 'Pengiriman'}</p>
                          </td>
                          <td className="px-4 py-3 text-right">{formatCurrency(order.shipping_cost)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-full md:w-64">
                    {order.discount > 0 && (
                      <div className="flex justify-between py-1.5 text-sm">
                        <span className="text-muted-foreground">Diskon</span>
                        <span className="text-success">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t font-bold text-base md:text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm">Status:</span>
                    <PaymentStatusBadge status={order.payment_status} />
                  </div>
                  
                  {order.payment_status !== 'PAID' && payment?.payment_link && (
                    <Button
                      variant="accent"
                      className="w-full"
                      onClick={() => window.open(payment.payment_link, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Bayar Sekarang
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" />
                  Cetak Invoice
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hubungi Kami</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="whatsapp"
                  className="w-full"
                  onClick={() => {
                    const msg = `Halo, saya ingin bertanya soal invoice ${invoice?.invoice_number || order.order_number}`
                    const waUrl = `https://wa.me/6282113133165?text=${encodeURIComponent(msg)}`
                    window.open(waUrl, '_blank')
                  }}
                >
                  <Send className="w-4 h-4" />
                  Chat WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          header { display: none !important; }
          .no-print { display: none !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}