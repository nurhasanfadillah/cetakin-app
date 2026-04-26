import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, MessageCircle, ArrowRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderSuccessPage() {
  const { orderNumber } = useParams()

  const openWhatsApp = () => {
    const msg = `Halo, saya sudah submit order dengan nomor: ${orderNumber}

Mohon dicek file dan diberikan estimasi harganya.

Terima kasih.`
    const waUrl = `https://wa.me/6282113133165?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Berhasil Dikirim!</h1>
          <p className="text-muted-foreground mb-6">
            Nomor order Anda: <span className="font-mono font-bold">{orderNumber}</span>
          </p>
          
          <div className="bg-surface rounded-lg border border-border p-4 text-left mb-6">
            <h2 className="font-semibold mb-2">Apa selanjutnya?</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5" />
                <span>Tim kami akan cek file dan memberikan estimasi harga</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 mt-0.5" />
                <span>Kami akan menghubungi Anda via WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5" />
                <span>Setelah disetujui, invoice dan payment link akan dikirim</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link to="/member">
              <Button variant="accent" size="lg" className="w-full">
                <ArrowRight className="w-5 h-5" />
                Cek Status Pesanan
              </Button>
            </Link>
            
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