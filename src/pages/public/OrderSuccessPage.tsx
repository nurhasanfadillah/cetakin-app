import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, MessageCircle, ArrowRight, FileText, AlertCircle, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getOrderByNumber } from '@/lib/db'
import { checkPaymentStatus, loadMidtransSnap } from '@/lib/payment'

export default function OrderSuccessPage() {
  const { orderNumber } = useParams()
  const [paymentCheckComplete, setPaymentCheckComplete] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    status: 'pending' | 'success' | 'failed' | 'expired'
    paymentType?: string
  } | null>(null)

  const { data: orderData } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => getOrderByNumber(orderNumber!),
    enabled: !!orderNumber,
  })

  const order = orderData?.order

  useEffect(() => {
    loadMidtransSnap(() => {
      console.log('Midtrans Snap loaded')
    })
  }, [])

  useEffect(() => {
    if (orderNumber && !paymentCheckComplete) {
      checkPaymentStatus(orderNumber).then(result => {
        setPaymentResult(result)
        setPaymentCheckComplete(true)
        
        if (result.status === 'success') {
          console.log('Payment confirmed via Midtrans')
        }
      })
    }
  }, [orderNumber, paymentCheckComplete])

  const openWhatsApp = () => {
    const msg = `Halo, saya sudah submit order dengan nomor: ${orderNumber}

Mohon dicek file dan diberikan estimasi harganya.

Terima kasih.`
    const waUrl = `https://wa.me/6282113133165?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  const openPaymentLink = () => {
    if (order?.invoice?.payment_link) {
      window.open(order.invoice.payment_link, '_blank')
    }
  }

  const getPaymentStatusDisplay = () => {
    if (!paymentCheckComplete) {
      return { icon: Loader2, text: 'Memverifikasi pembayaran...', color: 'text-text-muted', variant: 'secondary' as const }
    }

    if (order?.payment_status === 'PAID' || paymentResult?.status === 'success') {
      return { icon: CheckCircle2, text: 'Pembayaran Berhasil', color: 'text-success', variant: 'success' as const }
    }

    if (paymentResult?.status === 'pending') {
      return { icon: Clock, text: 'Menunggu Pembayaran', color: 'text-warning', variant: 'warning' as const }
    }

    if (paymentResult?.status === 'expired') {
      return { icon: AlertCircle, text: 'Pembayaran Kedaluwarsa', color: 'text-danger', variant: 'destructive' as const }
    }

    if (paymentResult?.status === 'failed') {
      return { icon: AlertCircle, text: 'Pembayaran Gagal', color: 'text-danger', variant: 'destructive' as const }
    }

    return { icon: Clock, text: 'Menunggu Pembayaran', color: 'text-warning', variant: 'warning' as const }
  }

  const statusDisplay = getPaymentStatusDisplay()
  const StatusIcon = statusDisplay.icon

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            paymentResult?.status === 'success' ? 'bg-success/10' : 'bg-primary/10'
          }`}>
            <StatusIcon className={`w-8 h-8 ${statusDisplay.color} ${!paymentCheckComplete ? 'animate-spin' : ''}`} />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {paymentResult?.status === 'success' ? 'Pembayaran Berhasil!' : 'Order Berhasil Dikirim!'}
          </h1>
          
          <p className="text-text-secondary mb-6">
            Nomor order: <span className="font-mono font-bold">{orderNumber}</span>
          </p>

          <Card className="text-left mb-6">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Status Pembayaran</span>
                <Badge variant={statusDisplay.variant}>
                  {statusDisplay.text}
                </Badge>
              </div>
              
              {order && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Layanan</span>
                    <span className="text-sm font-medium">{order.service_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total_amount || 0)}
                    </span>
                  </div>
                </>
              )}

              {paymentResult?.paymentType && paymentResult.status !== 'success' && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs text-text-muted">
                    via {paymentResult.paymentType}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-surface rounded-lg border border-border p-4 text-left mb-6">
            <h2 className="font-semibold mb-2">Apa selanjutnya?</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Tim kami akan cek file dan memberikan estimasi harga</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Kami akan menghubungi Anda via WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Setelah disetujui, invoice dan payment link akan dikirim</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            {order?.member_id && (
              <Link to="/member">
                <Button variant="accent" size="lg" className="w-full">
                  <ArrowRight className="w-5 h-5" />
                  Cek Status Pesanan
                </Button>
              </Link>
            )}
            
            {(paymentResult?.status === 'pending' || !paymentCheckComplete) && (
              <Button variant="whatsapp" size="lg" className="w-full" onClick={openPaymentLink}>
                Bayar Sekarang
              </Button>
            )}
            
            <Button variant="whatsapp" size="lg" className="w-full" onClick={openWhatsApp}>
              <MessageCircle className="w-5 h-5" />
              Lanjut Chat WhatsApp
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => window.location.href = '/'}>
              Kembali ke Halaman Utama
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}