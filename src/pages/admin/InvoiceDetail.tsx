import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Printer, Download, Send, ExternalLink, Copy, CheckCircle, FileText } from 'lucide-react'
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

export default function AdminInvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-invoice-order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, invoice:invoices(*), payments:payments(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Order & { invoice?: { id: string; invoice_number: string; created_at: string }; payments?: { payment_link?: string; status?: string }[] }
    },
    enabled: !!id,
  })

  const generateInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!order) return
      
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      
      if (order.invoice) {
        return
      }

      const { error } = await supabase.from('invoices').insert({
        order_id: order.id,
        invoice_number: invoiceNumber,
        issued_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DRAFT',
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoice-order', id] })
    },
  })

  const markAsSentMutation = useMutation({
    mutationFn: async () => {
      if (!order?.invoice) return
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'SENT' })
        .eq('id', order.invoice.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoice-order', id] })
    },
  })

  const totalAmount = (order?.final_price || order?.estimated_price || 0) + (order?.shipping_cost || 0) - (order?.discount || 0)

  const handleCopyLink = () => {
    if (order?.payments?.[0]?.payment_link) {
      navigator.clipboard.writeText(order.payments[0].payment_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

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
        <Link to="/admin/orders" className="mt-4 inline-block">
          <Button variant="outline">Kembali ke Daftar Order</Button>
        </Link>
      </div>
    )
  }

  const invoice = (order as any).invoice
  const payment = order.payments?.[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {invoice ? `Invoice ${invoice.invoice_number}` : 'Invoice'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Order {order.order_number}
          </p>
        </div>
        <Badge variant={order.payment_status === 'PAID' ? 'success' : 'warning'}>
          <PaymentStatusBadge status={order.payment_status} />
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="print:border print:shadow-none">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Cetakin.com</h2>
                  <p className="text-sm text-muted-foreground">Print DTF Transfer Siap Press</p>
                  <p className="text-sm text-muted-foreground">Cileungsi, Bogor</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold">INVOICE</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoice ? `#${invoice.invoice_number}` : 'DRAFT'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tanggal: {invoice ? formatDate(invoice.created_at) : formatDate(new Date().toISOString())}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Jatuh tempo: {invoice ? formatDate(invoice.due_date || '') : '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">DITAGIHKAN KEPADA</h4>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                  {order.customer_email && (
                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                  )}
                  {order.pickup_method === 'shipping' && order.shipping_address && (
                    <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                  )}
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">ORDER</h4>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">Tanggal: {formatDate(order.created_at)}</p>
                  {order.deadline && (
                    <p className="text-sm text-muted-foreground">Deadline: {formatDate(order.deadline)}</p>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Deskripsi</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Harga</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.service_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.estimated_size ? `Ukuran: ${order.estimated_size}` : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">1</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(order.final_price || order.estimated_price)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(order.final_price || order.estimated_price)}</td>
                    </tr>
                    {order.shipping_cost && order.shipping_cost > 0 && (
                      <tr>
                        <td className="px-4 py-3">
                          <p className="font-medium">Biaya Pengiriman</p>
                          <p className="text-xs text-muted-foreground">
                            {order.shipping_city || 'Pengiriman'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">1</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(order.shipping_cost)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(order.shipping_cost)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-72">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between py-2 text-success">
                      <span>Diskon</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {order.customer_notes && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">Catatan</h4>
                  <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!invoice ? (
                <Button
                  className="w-full"
                  onClick={() => generateInvoiceMutation.mutate()}
                  disabled={generateInvoiceMutation.isPending}
                >
                  {generateInvoiceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Generate Invoice
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={handlePrint}>
                    <Printer className="w-4 h-4" />
                    Cetak Invoice
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.print()}>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {payment?.payment_link && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-success/10 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success font-medium">Payment Link Tersedia</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <a href={payment.payment_link} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {invoice && order.payment_status !== 'PAID' && (
            <Card>
              <CardHeader>
                <CardTitle> Kirim Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={() => {
                    const msg = `Halo ${order.customer_name},

Berikut invoice untuk order ${order.order_number}:

Total: ${formatCurrency(totalAmount)}
Payment Link: ${payment?.payment_link || 'Belum tersedia'}

Terima kasih,
Cetakin.com`
                    const waUrl = `https://wa.me/${order.customer_phone.replace(/^0/, '62')}?text=${encodeURIComponent(msg)}`
                    window.open(waUrl, '_blank')
                    markAsSentMutation.mutate()
                  }}
                  disabled={markAsSentMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                  Kirim via WhatsApp
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}