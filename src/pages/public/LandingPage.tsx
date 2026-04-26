import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Menu, X, ArrowRight, CheckCircle2, HelpCircle, MapPin, Clock, Phone, Printer, Sparkles, Zap, Shield, GalleryVertical, Eye, Package, Droplets, Layers, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/loading'
import { getLandingPageContent, getSetting } from '@/lib/db'

const COMPANY = {
  name: 'cetakin.com',
  companyName: 'PT. REDONE BERKAH MANDIRI UTAMA',
  whatsapp: '6282113133165',
  address: 'Jl. Raya Cileungsi - Jonggol Km. 10 RT 004/002, Cipeucang, Kec. Cileungsi, Kabupaten Bogor, Jawa Barat 16820',
}

const HERO = {
  headline: 'Print DTF Transfer Siap Press untuk Vendor, Reseller & Brand Lokal',
  subheadline: 'cetakin.com membantu vendor sablon, konveksi kecil, reseller, dan brand lokal mencetak transfer DTF meteran yang rapi, praktis, dan siap press. Kirim file desain Anda, kami bantu cek dan cetak untuk kebutuhan produksi Anda.',
  ctaPrimary: 'Order Cepat',
  ctaSecondary: 'Cek File & Harga via WhatsApp',
  note: 'Layanan belum termasuk kaos dan jasa press.',
}

const PRINTING_SAMPLES = [
  { title: 'DTF Meteran', desc: 'Full color', image: '🎨' },
  { title: 'Logo Kompleks', desc: 'Detail tinggi', image: '✨' },
  { title: 'Nama Batch', desc: 'Ukuran sama', image: '📝' },
  { title: 'Full Print', desc: 'Satu A4', image: '👕' },
]

const PROCESS_STEPS = [
  { num: '01', title: 'Kirim File', desc: 'Upload desain via form atau WhatsApp', icon: Upload },
  { num: '02', title: 'Cek File', desc: 'Kami review ukuran & resolusi', icon: Eye },
  { num: '03', title: 'Konfirmasi', desc: 'Setuju, lanjutke pembayaran', icon: CheckCircle2 },
  { num: '04', title: 'Produksi', desc: 'Cetak DTF siap press', icon: Droplets },
  { num: '05', title: 'Selesai', desc: 'Ambil atau kirim', icon: Package },
]

const GALLERY_IMAGES = [
  { id: 1, label: 'Sample 1', desc: 'DTF Print Quality', emoji: '🖼️' },
  { id: 2, label: 'Sample 2', desc: 'Color Result', emoji: '🎯' },
  { id: 3, label: 'Sample 3', desc: 'Detail Clear', emoji: '🔍' },
  { id: 4, label: 'Sample 4', desc: 'Finish Ready', emoji: '✅' },
  { id: 5, label: 'Sample 5', desc: 'Press Result', emoji: '🔥' },
  { id: 6, label: 'Sample 6', desc: 'Production', emoji: '⚡' },
]

const BENEFITS_VISUAL = [
  { icon: Shield, title: 'Siap Press', desc: 'Transfer DTF dalam kondisi siap digunakan langsung.' },
  { icon: Layers, title: 'Layout Hemat', desc: 'Gabungkan banyak desain dalam satu area.' },
  { icon: Eye, title: 'File Dicek', desc: ' Review ukuran & resolusi sebelum cetak.' },
  { icon: Sparkles, title: 'Desain Ringan', desc: 'Bantu optimalkan kualitas gambar.' },
]

const AUDIENCE = [
  { title: 'Vendor Sablon', desc: 'Partner print DTF untuk kebutuhan produksi harian.', emoji: '🖨️' },
  { title: 'Konveksi Kecil', desc: 'Tambah layanan DTF tanpa investasi mesin.', emoji: '👔' },
  { title: 'Reseller', desc: 'Kaos customready to sell.', emoji: '💼' },
  { title: 'Brand Lokal', desc: 'Mini drop dengan fleksibilitas tinggi.', emoji: '🚀' },
]

const FAQ = [
  { q: 'Apakah layanan ini sudah termasuk kaos?', a: 'Belum. Kami hanya menyediakan jasa print DTF transfer siap press.' },
  { q: 'Apakah sudah termasuk jasa press?', a: 'Belum. Transfer DTF dikirim dalam bentuk siap press.' },
  { q: 'Bisa order untuk vendor sablon?', a: 'Bisa. Kami melayani vendor, konveksi, reseller, dan brand.' },
  { q: 'Bisa bantu layout hemat area?', a: 'Bisa, selama file sudah siap cetak.' },
  { q: 'Bisa bantu desain?', a: 'Bisa untuk desain ringan dan optimasi.' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['landing-content'],
    queryFn: getLandingPageContent,
  })

  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: () => getSetting<{
      name: string
      companyName: string
      whatsapp: string
      address: string
    }>('company'),
  })

  const company = companySettings?.data || COMPANY
  const faqs = content?.faqs || FAQ

  const openWhatsApp = (message?: string) => {
    const defaultMsg = `Halo, saya ingin print DTF transfer siap press.

Kebutuhan saya:
- Jenis order: 
- Ukuran desain:
- Jumlah:

Mohon dibantu cek file dan estimasi harganya.`
    const msg = message || defaultMsg
    const waUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ═══════════════════════════════════════════════════════════════
          HEADER - Glassmorphism
      ═══════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Printer className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">{COMPANY.name}</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#samples" className="text-sm text-text-secondary hover:text-foreground transition-colors">Sample</a>
              <a href="#process" className="text-sm text-text-secondary hover:text-foreground transition-colors">Cara Kerja</a>
              <a href="#faq" className="text-sm text-text-secondary hover:text-foreground transition-colors">FAQ</a>
              <Button variant="whatsapp" size="sm" onClick={() => openWhatsApp()}>
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </nav>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 flex flex-col gap-4 pb-4">
              <a href="#samples" onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-foreground transition-colors">Sample</a>
              <a href="#process" onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-foreground transition-colors">Cara Kerja</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-foreground transition-colors">FAQ</a>
              <Button variant="whatsapp" size="sm" onClick={() => openWhatsApp()}>WhatsApp</Button>
            </nav>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION - Visual & Glow
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center bg-mesh-dark bg-grid-dark pt-24 pb-16 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-text-secondary">Print DTF Transfer Siap Press</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-text">{HERO.headline}</span>
              </h1>
              
              <p className="text-lg text-text-secondary max-w-xl">
                {HERO.subheadline}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/order">
                  <Button variant="glow" size="lg" className="group">
                    {HERO.ctaPrimary}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="whatsapp" size="lg" onClick={() => openWhatsApp()}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {HERO.ctaSecondary}
                </Button>
              </div>
              
              <p className="text-sm text-text-muted">{HERO.note}</p>
            </div>

            {/* Right - Visual Showcase */}
            <div className="relative animate-scale-in-glow">
              <div className="grid grid-cols-2 gap-4">
                {PRINTING_SAMPLES.map((sample, idx) => (
                  <div 
                    key={idx}
                    className="glass-card rounded-2xl p-8 text-center hover:scale-105 transition-transform cursor-pointer"
                  >
                    <span className="text-5xl block mb-3">{sample.image}</span>
                    <h3 className="font-semibold text-lg mb-1">{sample.title}</h3>
                    <p className="text-sm text-text-muted">{sample.desc}</p>
                  </div>
                ))}
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 glass rounded-xl px-4 py-2 animate-float">
                <span className="text-sm font-medium">🔥 Ready to Press</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BENEFITS - Visual Cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Keunggulan Cetakin.com</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Partner print DTF yang praktis untuk kebutuhan produksi Anda.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS_VISUAL.map((item, idx) => (
              <Card key={idx} className="group hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-text-muted">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SAMPLES GALLERY - Visual Grid
      ══════════════════════════════════════════════════���════════════ */}
      <section id="samples" className="py-20 bg-mesh-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sample Hasil Cetak</h2>
            <p className="text-text-secondary">Kualitas print DTF transfer siap press dari cetakin.com</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {GALLERY_IMAGES.map((img) => (
              <div 
                key={img.id}
                className="group relative aspect-square glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
              >
                {/* Placeholder visual - in production, this would be real image */}
                <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
                  <span className="text-6xl group-hover:scale-110 transition-transform">{img.emoji}</span>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div>
                    <h3 className="font-semibold">{img.label}</h3>
                    <p className="text-sm text-text-muted">{img.desc}</p>
                  </div>
                </div>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute inset-0 shadow-glow-blue rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/order">
              <Button variant="outline" size="lg">
                <GalleryVertical className="w-5 h-5 mr-2" />
                Lihat Semua Sample
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PROCESS - Step by Step Visual
      ═══════════════════════════════════════════════════════════════ */}
      <section id="process" className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Order</h2>
            <p className="text-text-secondary">5 langkah mudah</p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {PROCESS_STEPS.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={idx} className="relative">
                  <Card className="h-full text-center hover:border-primary/50 transition-all group">
                    <CardContent className="p-6">
                      <div className="text-5xl font-bold text-text-subtle/30 mb-4">{step.num}</div>
                      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-text-muted">{step.desc}</p>
                    </CardContent>
                  </Card>
                  
                  {/* Connector line */}
                  {idx < PROCESS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-text-subtle/30" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TARGET AUDIENCE - Visual Cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-mesh-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Layanan Ini Cocok untuk Siapa?</h2>
            <p className="text-text-secondary">Siap membantu berbagai kebutuhan printing Anda</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCE.map((item, idx) => (
              <Card key={idx} className="group hover:border-accent/50 transition-all">
                <CardContent className="p-6 text-center">
                  <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-text-muted">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA SECTION - Glow
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-glow-spot relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-accent opacity-30" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Siap Print DTF untuk Kebutuhan Anda?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">Kirim file desain Anda sekarang. cetakin.com bantu cek file, hitungkan kebutuhan, dan siapkan transfer DTF siap press.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/order">
              <Button variant="accent" size="lg">
                {HERO.ctaPrimary}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="whatsapp" size="lg" onClick={() => openWhatsApp()}>
              <MessageCircle className="w-5 h-5 mr-2" />
              {HERO.ctaSecondary}
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FAQ - Accordion
      ════════��═��════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">FAQ</h2>
            <p className="text-text-secondary">Pertanyaan yang sering diajukan</p>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-3">
            {contentLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner text="Memuat FAQ..." />
              </div>
            ) : (
              faqs.map((item: { question: string; answer: string }, idx: number) => (
                <div key={idx} className="border border-border rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-elevated transition-colors"
                    onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  >
                    <span className="font-medium pr-4">{item.question}</span>
                    <HelpCircle className={`w-5 h-5 flex-shrink-0 transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {faqOpen === idx && (
                    <div className="px-4 pb-4 text-text-muted">{item.answer}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="py-12 bg-surface-dark">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">{COMPANY.name}</span>
              </div>
              <p className="text-sm text-text-muted mb-4">{COMPANY.companyName}</p>
              <div className="flex items-start gap-3 text-sm text-text-muted">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{COMPANY.address}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Kontak</h3>
              <div className="space-y-3 text-sm text-text-muted">
                <a href={`https://wa.me/${COMPANY.whatsapp}`} className="flex items-center gap-3 hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4" />
                  +62 821 1313 3165
                </a>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4" />
                  Jam operasional: 08.00 - 17.00 WIB
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Link</h3>
              <div className="space-y-2 text-sm text-text-muted">
                <Link to="/order" className="block hover:text-foreground transition-colors">Order Cepat</Link>
                <Link to="/login" className="block hover:text-foreground transition-colors">Login Member</Link>
                <Link to="/admin" className="block hover:text-foreground transition-colors">Admin</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp - Mobile */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button variant="whatsapp" size="lg" className="rounded-full shadow-lg hover:scale-110 transition-transform" onClick={() => openWhatsApp()}>
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}