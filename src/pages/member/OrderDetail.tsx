import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Send, FileText, Printer, ExternalLink, Package, Truck, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PaymentStatusBadge } from '@/components/PaymentStatus'
import { createSnapTransaction, loadMidtransSnap, openMidtransSnap } from '@/lib/payment'
import type { Order, OrderStatus } from '@/types'

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
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function OrderDetail() {
  const { id } = useParams()
  const [snapLoaded, setSnapLoaded] = useState(false)
  const [loadingSnap, setLoadingSnap] = useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: ['member-order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, invoice:invoices(*), payment:payments(*), files:order_files(*), member:profiles(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      console.log('Order data:', data)
      return data as Order
    },
    enabled: !!id,
  })

  const handleLoadSnap = () => {
    loadMidtransSnap(() => {
      setSnapLoaded(true)
    })
  }

  const handleBayarSekarang = async () => {
    if (!order) return
    
    if (!snapLoaded) {
      handleLoadSnap()
      return
    }

    try {
      setLoadingSnap(true)
      const totalAmount = (order.final_price || order.estimated_price || 0) + (order.shipping_cost || 0) - (order.discount || 0)

      const result = await createSnapTransaction({
        orderId: order.id,
        orderNumber: order.order_number,
        amount: totalAmount,
        customerName: order.customer_name,
        customerEmail: order.customer_email || undefined,
        customerPhone: order.customer_phone,
        items: [
          {
            id: 'service',
            name: 'Jasa Print DTF',
            price: order.final_price || order.estimated_price || 0,
            quantity: 1,
          },
          ...(order.shipping_cost ? [{
            id: 'shipping',
            name: 'Biaya Pengiriman',
            price: order.shipping_cost,
            quantity: 1,
          }] : []),
        ],
      })

      if (result?.token) {
        openMidtransSnap(result.token)
      } else if (result?.redirect_url) {
        window.open(result.redirect_url, '_blank')
      } else {
        alert('Gagal membuat payment link. Pastikan konfigurasi Midtrans sudah benar.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Terjadi kesalahan saat membuat payment link.')
    } finally {
      setLoadingSnap(false)
    }
  }

  const openWhatsApp = () => {
    if (!order) return
    const msg = `Halo, saya ingin tanya soal order ${order.order_number}`
    const waUrl = `https://wa.me/6282113133165?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
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
        <p className="text-muted-foreground">Order tidak ditemukan</p>
        <Link to="/member" className="mt-4 inline-block">
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>
    )
  }

  const totalAmount = (order.final_price || order.estimated_price || 0) + (order.shipping_cost || 0) - (order.discount || 0)
  const needsPayment = order.payment_status === 'UNPAID' || order.payment_status === 'PENDING'

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/member">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Order {order.order_number}</h1>
              <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusConfig[order.status as OrderStatus]?.variant || 'secondary'}>
                    {statusConfig[order.status as OrderStatus]?.label || order.status}
                  </Badge>
                  <PaymentStatusBadge status={order.payment_status} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Status terakhir diperbarui: {formatDate(order.updated_at || order.created_at)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis Layanan</p>
                    <p className="font-medium">{order.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ukuran</p>
                    <p className="font-medium">{order.estimated_size || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{order.deadline ? formatDate(order.deadline) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pengambilan</p>
                    <p className="font-medium flex items-center gap-2">
                      {order.pickup_method === 'pickup' ? (
                        <Package className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Truck className="w-4 h-4 text-muted-foreground" />
                      )}
                      {order.pickup_method === 'pickup' ? 'Ambil di Workshop' : 'Kirim Ekspedisi'}
                    </p>
                  </div>
                  {order.pickup_method === 'shipping' && (
                    <>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Alamat</p>
                        <p className="font-medium">{order.shipping_address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kota</p>
                        <p className="font-medium">{order.shipping_city}</p>
                      </div>
                    </>
                  )}
                </div>
                {order.customer_notes && (
                  <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm text-warning font-medium mb-1">Catatan Anda</p>
                    <p className="text-sm">{order.customer_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rincian Biaya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biaya Print</span>
                    <span>{formatCurrency(order.final_price || order.estimated_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkir</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diskon</span>
                    <span className="text-success">-{formatCurrency(order.discount)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(order.files && order.files.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>File Uploaded ({order.files.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {((file.file_size || 0) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {file.file_path && (
                            <a
                              href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${file.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {needsPayment && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-primary">Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Total yang harus dibayar: <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
                  </p>
                  <Button
                    className="w-full"
                    variant="accent"
                    onClick={handleBayarSekarang}
                    disabled={loadingSnap}
                  >
                    {loadingSnap ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Bayar Sekarang
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Pembayaran via Midtrans
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Aksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="whatsapp" className="w-full" onClick={openWhatsApp}>
                    <Send className="w-4 h-4" />
                    Hubungi Admin
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to={`/member/invoice/${order.id}`}>
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4" />
                      Lihat Invoice
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" />
                    Cetak Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}