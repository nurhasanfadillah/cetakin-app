import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Send,
  MessageCircle,
  Loader2,
  XCircle,
  Package,
  Truck,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { PaymentStatusBadge } from '@/components/PaymentStatus'
import { createSnapTransaction } from '@/lib/payment'
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
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [internalNotes, setInternalNotes] = useState('')
  const [finalPrice, setFinalPrice] = useState('')
  const [shippingCost, setShippingCost] = useState('')
  const [discount, setDiscount] = useState('')
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, files:order_files(*), member:profiles(*), invoice:invoices(*), payments:payments(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Order & { invoice?: { id: string }; payments?: { payment_link?: string }[] }
    },
    enabled: !!id,
  })

  const order = data

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })

  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ internal_notes: notes })
        .eq('id', id)
      if (error) throw error
    },
  })

  const updatePriceMutation = useMutation({
    mutationFn: async (data: { final_price?: number | null; shipping_cost?: number; discount?: number }) => {
      const updateData: Record<string, unknown> = {}
      if (data.final_price !== undefined) updateData.final_price = data.final_price
      if (data.shipping_cost !== undefined) updateData.shipping_cost = data.shipping_cost
      if (data.discount !== undefined) updateData.discount = data.discount
      if (data.final_price !== undefined || data.shipping_cost !== undefined || data.discount !== undefined) {
        const price = data.final_price ?? 0
        const shipping = data.shipping_cost ?? 0
        const disc = data.discount ?? 0
        updateData.total_amount = price + shipping - disc
      }
      
      console.log('Updating order:', id, updateData)
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
      
      if (error) {
        console.error('Update price error:', error)
        throw error
      }
    },
    onSuccess: () => {
      console.log('Price updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] })
      setFinalPrice('')
      setShippingCost('')
      setDiscount('')
    },
  })

const openWhatsApp = () => {
    if (!order) return
    
    const msg = `Halo ${order.customer_name},

Berkaitan dengan order Anda:
*No. Order:* ${order.order_number}
*Status:* ${statusConfig[order.status as OrderStatus]?.label || order.status}

Silakan hubungi kami jika ada pertanyaan.

Terima kasih,
Cetakin.com`
    const waUrl = `https://wa.me/${order.customer_phone.replace(/^0/, '62')}?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  const generatePaymentLink = async () => {
    if (!order) return
    
    try {
      setGeneratingLink(true)
      const totalAmount = (order.final_price || order.estimated_price || 0) + (order.shipping_cost || 0) - (order.discount || 0)

      if (totalAmount <= 0) {
        alert('Harga belum ditentukan. Silakan update harga terlebih dahulu.')
        return
      }

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
            name: order.service_type || 'Jasa Print DTF',
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

      if (result?.redirect_url) {
        setPaymentLink(result.redirect_url)
        
        await supabase.from('orders').update({ payment_status: 'PENDING' }).eq('id', order.id)
        await supabase.from('payments').insert({
          order_id: order.id,
          provider: 'midtrans',
          status: 'PENDING',
          amount: totalAmount,
          payment_link: result.redirect_url,
        })
        
        queryClient.invalidateQueries({ queryKey: ['admin-order', id] })
      } else {
        alert('Gagal membuat payment link. Pastikan konfigurasi Midtrans sudah benar.')
      }
    } catch (error) {
      console.error('Generate payment link error:', error)
      alert('Terjadi kesalahan saat membuat payment link.')
    } finally {
      setGeneratingLink(false)
    }
  }

  const copyPaymentLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const goToInvoice = () => {
    navigate(`/admin/invoice/${order?.id}`)
  }

  useEffect(() => {
    if (order) {
      setInternalNotes(order.internal_notes || '')
    }
  }, [order])

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
        <p className="text-text-muted">Order tidak ditemukan</p>
        <Link to="/admin/orders" className="mt-4 inline-block">
          <Button variant="outline">Kembali ke Daftar Order</Button>
        </Link>
      </div>
    )
  }

  const calcTotal = (fp: string, sc: string, d: string) => {
    const final = fp ? parseInt(fp) : (order?.final_price || order?.estimated_price || 0)
    const ship = sc ? parseInt(sc) : (order?.shipping_cost || 0)
    const disc = d ? parseInt(d) : (order?.discount || 0)
    return final + ship - disc
  }
  const totalAmount = calcTotal(finalPrice, shippingCost, discount)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <p className="text-text-muted">{formatDate(order.created_at)}</p>
        </div>
        <Badge variant={statusConfig[order.status as OrderStatus]?.variant || 'secondary'} className="px-3 py-1">
          {statusConfig[order.status as OrderStatus]?.label || order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-text-muted">Nama</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">WhatsApp</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <p className="font-medium">{order.customer_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Deadline</p>
                  <p className="font-medium">{order.deadline ? formatDate(order.deadline) : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-muted">Jenis Layanan</p>
                    <p className="font-medium">{order.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Estimasi Ukuran</p>
                    <p className="font-medium">{order.estimated_size || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {order.pickup_method === 'pickup' ? (
                    <Package className="w-5 h-5 text-text-muted" />
                  ) : (
                    <Truck className="w-5 h-5 text-text-muted" />
                  )}
                  <span className="font-medium">
                    {order.pickup_method === 'pickup' ? 'Ambil di Workshop' : 'Kirim Ekspedisi'}
                  </span>
                </div>

                {order.pickup_method === 'shipping' && (
                  <>
                    <div>
                      <p className="text-sm text-text-muted">Alamat Pengiriman</p>
                      <p className="font-medium">{order.shipping_address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Kota</p>
                      <p className="font-medium">{order.shipping_city}</p>
                    </div>
                  </>
                )}

                {order.customer_notes && (
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm text-warning font-medium">Catatan Customer</p>
                    <p className="text-text-primary">{order.customer_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Desain ({order.files?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!order.files || order.files.length === 0 ? (
                <p className="text-text-muted text-center py-4">Tidak ada file</p>
              ) : (
                <div className="space-y-2">
                  {order.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-text-muted" />
                        <div>
                          <p className="font-medium text-sm">{file.file_name}</p>
                          <p className="text-xs text-text-muted">
                            {formatFileSize(file.file_size)} • {file.mime_type}
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
                              <Eye className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {file.file_path && (
                          <a 
                            href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${file.file_path}`}
                            download={file.file_name}
                          >
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catatan Internal</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Tambahkan catatan internal..."
                className="w-full h-24 rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <Button 
                className="mt-3" 
                size="sm"
                onClick={() => updateNotesMutation.mutate(internalNotes)}
                disabled={updateNotesMutation.isPending}
              >
                {updateNotesMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : 'Simpan Catatan'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={order.status}
                onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                className="w-full h-11 rounded-lg border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                disabled={updateStatusMutation.isPending}
              >
                <option value="MENUNGGU_REVIEW_FILE">Menunggu Review File</option>
                <option value="FILE_PERLU_REVISI">File Perlu Revisi</option>
                <option value="MENUNGGU_APPROVAL_HARGA">Menunggu Approval Harga</option>
                <option value="INVOICE_DITERBITKAN">Invoice Diterbitkan</option>
                <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
                <option value="PEMBAYARAN_BERHASIL">Pembayaran Berhasil</option>
                <option value="MASUK_PRODUKSI">Masuk Produksi</option>
                <option value="SELESAI_PRODUKSI">Selesai Produksi</option>
                <option value="SIAP_DIAMBIL">Siap Diambil</option>
                <option value="DIKIRIM">Dikirim</option>
                <option value="SELESAI">Selesai</option>
                <option value="DIBATALKAN">Dibatalkan</option>
              </select>

              {updateStatusMutation.isPending && (
                <p className="text-sm text-text-muted">Memperbarui...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Harga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-text-muted">Harga Final (Rp)</label>
                <input
                  type="number"
                  placeholder={formatCurrency(order.final_price || order.estimated_price || 0)}
                  defaultValue={order.final_price || order.estimated_price || ''}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 mt-1 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-text-muted">Ongkir (Rp)</label>
                <input
                  type="number"
                  defaultValue={order.shipping_cost || 0}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 mt-1 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-text-muted">Diskon (Rp)</label>
                <input
                  type="number"
                  defaultValue={order.discount || 0}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 mt-1 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => updatePriceMutation.mutate({
                  final_price: finalPrice ? parseInt(finalPrice) : (order.final_price || order.estimated_price),
                  shipping_cost: shippingCost ? parseInt(shippingCost) : (order.shipping_cost || 0),
                  discount: discount ? parseInt(discount) : (order.discount || 0),
                })}
                disabled={updatePriceMutation.isPending}
              >
                {updatePriceMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : 'Update Harga'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Status:</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>
              
              {paymentLink ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-success font-medium">Payment Link Generated</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm" onClick={copyPaymentLink}>
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <ExternalLink className="w-4 h-4" />
                        Open Link
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={generatePaymentLink}
                  disabled={generatingLink || order.payment_status === 'PAID'}
                >
                  {generatingLink ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {order.payment_status === 'PAID' ? 'Sudah Lunas' : 'Generate Payment Link'}
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={goToInvoice}>
                <FileText className="w-4 h-4" />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(order as any)?.invoice ? 'Lihat Invoice' : 'Generate Invoice'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="accent" className="w-full" onClick={openWhatsApp}>
                <MessageCircle className="w-4 h-4" />
                Hubungi Customer
              </Button>
              
              {order.status !== 'SELESAI' && order.status !== 'DIBATALKAN' && (
                <Button 
                  variant="ghost" 
                  className="w-full text-danger hover:bg-danger/10"
                  onClick={() => updateStatusMutation.mutate('DIBATALKAN')}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="w-4 h-4" />
                  Batalkan Order
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}