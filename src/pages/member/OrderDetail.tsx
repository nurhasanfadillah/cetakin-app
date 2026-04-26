import { Link, useParams } from 'react-router-dom'
import { 
  ArrowLeft,
  FileText,
  Download,
  Printer,
  Send,
  ExternalLink
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

const paymentStatusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  'UNPAID': { label: 'Belum Bayar', variant: 'destructive' },
  'PENDING': { label: 'Pending', variant: 'warning' },
  'PAID': { label: 'Lunas', variant: 'success' },
  'EXPIRED': { label: 'Expired', variant: 'secondary' },
  'FAILED': { label: 'Gagal', variant: 'destructive' },
}

// Sample order
const sampleOrder = {
  id: '1',
  order_number: 'ORD-2604-ABC123',
  service_type: 'Print DTF Meteran',
  estimated_size: '30cm x 40cm',
  deadline: '2026-04-30',
  pickup_method: 'shipping',
  shipping_address: 'Jl. Merdeka No. 10, Jakarta Pusat',
  shipping_city: 'Jakarta',
  customer_notes: 'Mohon dicek ulang file sebelum cetak',
  status: 'PEMBAYARAN_BERHASIL',
  final_price: 150000,
  shipping_cost: 25000,
  discount: 0,
  total_amount: 175000,
  payment_status: 'PAID',
  created_at: '2026-04-26T10:00:00Z',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function OrderDetail() {
  const { id: _orderId } = useParams()

  const openWhatsApp = () => {
    const msg = `Halo, saya ingin tanya soal order ${sampleOrder.order_number}`
    const waUrl = `https://wa.me/6282113133165?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

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
              <h1 className="text-xl font-bold">Order {sampleOrder.order_number}</h1>
              <p className="text-sm text-muted-foreground">{formatDate(sampleOrder.created_at)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusConfig[sampleOrder.status]?.variant || 'secondary'}>
                    {statusConfig[sampleOrder.status]?.label || sampleOrder.status}
                  </Badge>
                  <Badge variant={paymentStatusConfig[sampleOrder.payment_status]?.variant || 'secondary'}>
                    {paymentStatusConfig[sampleOrder.payment_status]?.label || sampleOrder.payment_status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Status terakhir diperbarui: {formatDate(sampleOrder.created_at)}
                </p>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis Layanan</p>
                    <p className="font-medium">{sampleOrder.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ukuran</p>
                    <p className="font-medium">{sampleOrder.estimated_size || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{sampleOrder.deadline ? formatDate(sampleOrder.deadline) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pengambilan</p>
                    <p className="font-medium">
                      {sampleOrder.pickup_method === 'pickup' ? 'Ambil di Workshop' : 'Kirim Ekspedisi'}
                    </p>
                  </div>
                  {sampleOrder.pickup_method === 'shipping' && (
                    <>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Alamat</p>
                        <p className="font-medium">{sampleOrder.shipping_address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kota</p>
                        <p className="font-medium">{sampleOrder.shipping_city}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Rincian Biaya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biaya Print</span>
                    <span>{formatCurrency(sampleOrder.final_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkir</span>
                    <span>{formatCurrency(sampleOrder.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diskon</span>
                    <span>-{formatCurrency(sampleOrder.discount)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(sampleOrder.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
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

            {/* Payment Info */}
            {(sampleOrder.payment_status === 'UNPAID' || sampleOrder.payment_status === 'PENDING') && (
              <Card>
                <CardHeader>
                  <CardTitle>Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Silakan lakukan pembayaran sesuai total pesanan.
                  </p>
                  <Button className="w-full">
                    <ExternalLink className="w-4 h-4" />
                    Bayar Sekarang
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Invoice */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4" />
                    Lihat Invoice
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Printer className="w-4 h-4" />
                    Cetak Invoice
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4" />
                    Download PDF
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