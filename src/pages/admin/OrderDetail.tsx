import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  ArrowLeft,
  Download,
  Eye,
  FileText,
  CheckCircle,
  Send
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

// Sample order data
const sampleOrder = {
  id: '1',
  order_number: 'ORD-2604-ABC123',
  customer_name: 'Budi Santoso',
  customer_phone: '081234567890',
  customer_email: 'budi@email.com',
  service_type: 'Print DTF Meteran',
  estimated_size: '30cm x 40cm',
  deadline: '2026-04-30',
  pickup_method: 'shipping',
  shipping_address: 'Jl. Merdeka No. 10, Jakarta Pusat',
  shipping_city: 'Jakarta',
  customer_notes: 'Mohon dicek ulang file sebelum cetak',
  internal_notes: '',
  status: 'MENUNGGU_REVIEW_FILE',
  estimated_price: 150000,
  final_price: null,
  shipping_cost: 25000,
  discount: 0,
  total_amount: null,
  payment_status: 'UNPAID',
  created_at: '2026-04-26T10:00:00Z',
  files: [
    { id: '1', file_name: 'design-1.png', mime_type: 'image/png', file_size: 1024000 },
    { id: '2', file_name: 'design-2.jpg', mime_type: 'image/jpeg', file_size: 512000 },
  ]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const statusActions = [
  { value: 'MENUNGGU_REVIEW_FILE', label: 'Menunggu Review File' },
  { value: 'FILE_PERLU_REVISI', label: 'File Perlu Revisi' },
  { value: 'MENUNGGU_APPROVAL_HARGA', label: 'Menunggu Approval Harga' },
  { value: 'INVOICE_DITERBITKAN', label: 'Terbitkan Invoice' },
  { value: 'MENUNGGU_PEMBAYARAN', label: 'Menunggu Pembayaran' },
  { value: 'PEMBAYARAN_BERHASIL', label: 'Pembayaran Berhasil' },
  { value: 'MASUK_PRODUKSI', label: 'Masuk Produksi' },
  { value: 'SELESAI_PRODUKSI', label: 'Selesai Produksi' },
  { value: 'SIAP_DIAMBIL', label: 'Siap Diambil' },
  { value: 'DIKIRIM', label: 'Dikirim' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DIBATALKAN', label: 'Dibatalkan' },
]

export default function OrderDetail() {
  const { id: _orderId } = useParams()
  const [status, setStatus] = useState(sampleOrder.status)
  const [internalNotes, setInternalNotes] = useState(sampleOrder.internal_notes)

  const openWhatsApp = () => {
    const msg = `Halo, ada order baru dengan nomor: ${sampleOrder.order_number}\n\nMohon dicek file dan diberikan harga.`
    const waUrl = `https://wa.me/6282113133165?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  const estimatedTotal = (sampleOrder.final_price || sampleOrder.estimated_price || 0) + (sampleOrder.shipping_cost || 0) - sampleOrder.discount

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin">
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
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama</p>
                    <p className="font-medium">{sampleOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{sampleOrder.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{sampleOrder.customer_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{sampleOrder.deadline ? formatDate(sampleOrder.deadline) : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis Layanan</p>
                    <p className="font-medium">{sampleOrder.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimasi Ukuran</p>
                    <p className="font-medium">{sampleOrder.estimated_size || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Metode Pengambilan</p>
                    <p className="font-medium">
                      {sampleOrder.pickup_method === 'pickup' ? 'Ambil di Workshop' : 'Kirim Ekspedisi'}
                    </p>
                  </div>
                  {sampleOrder.pickup_method === 'shipping' && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Alamat Pengiriman</p>
                        <p className="font-medium">{sampleOrder.shipping_address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kota</p>
                        <p className="font-medium">{sampleOrder.shipping_city}</p>
                      </div>
                    </>
                  )}
                  {sampleOrder.customer_notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Catatan Customer</p>
                      <p className="font-medium">{sampleOrder.customer_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Files */}
            <Card>
              <CardHeader>
                <CardTitle>File Desain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sampleOrder.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-background rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Catatan Internal</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Tambahkan catatan internal..."
                  className="w-full h-24 rounded-md border border-input bg-background px-3 py-2"
                />
                <Button className="mt-2" size="sm">Simpan Catatan</Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status Order</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  {statusActions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
                <Badge variant={statusConfig[status]?.variant || 'secondary'} className="mt-2">
                  {statusConfig[status]?.label || status}
                </Badge>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Harga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimasi Harga</span>
                    <span>{formatCurrency(sampleOrder.estimated_price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkir</span>
                    <span>{formatCurrency(sampleOrder.shipping_cost || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diskon</span>
                    <span>-{formatCurrency(sampleOrder.discount)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(estimatedTotal)}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <input
                    type="number"
                    placeholder="Harga Final"
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                  />
                  <Button className="w-full">Update Harga</Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={paymentStatusConfig[sampleOrder.payment_status]?.variant || 'secondary'}>
                  {paymentStatusConfig[sampleOrder.payment_status]?.label || sampleOrder.payment_status}
                </Badge>

                <div className="mt-4 space-y-2">
                  <Button className="w-full">
                    <Send className="w-4 h-4" />
                    Generate Payment Link
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4" />
                    Generate Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="accent" className="w-full">
                    <CheckCircle className="w-4 h-4" />
                    Approve Order
                  </Button>
                  <Button variant="whatsapp" className="w-full" onClick={openWhatsApp}>
                    Hubungi Customer
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