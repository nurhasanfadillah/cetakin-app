import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-mesh-dark opacity-50" />
      
      <div className="relative max-w-md w-full text-center">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-text-muted mb-8">
          Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="default" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Ke Beranda
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    </div>
  )
}
