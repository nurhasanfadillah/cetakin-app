import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Menu, X, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

const PROBLEM = {
  title: 'Butuh Partner Print DTF untuk Produksi Harian?',
  body: 'Order sablon full color, desain custom, logo komunitas, nama berbeda, hingga mini drop brand lokal sering membutuhkan proses cetak yang cepat, rapi, dan fleksibel.\n\ncetakin.com hadir sebagai partner print DTF transfer siap press untuk membantu kebutuhan produksi vendor sablon, konveksi kecil, reseller, dan brand lokal.\n\nAnda cukup kirim file desain. Kami bantu cek file, susun layout bila diperlukan, lalu cetak transfer DTF siap press. Setelah itu hasil bisa Anda press ke kaos, hoodie, tote bag, atau produk apparel lainnya.',
  cta: 'Minta Price List Vendor',
}

const SOLUTION = {
  title: 'Solusi Print DTF Siap Press untuk Kebutuhan Produksi Anda',
  body: 'Kami fokus pada layanan print DTF transfer siap press, bukan kaos jadi. Layanan ini cocok untuk Anda yang sudah memiliki kaos, heat press, atau proses produksi sendiri, tetapi membutuhkan partner cetak DTF yang rapi, praktis, dan siap digunakan.',
  benefits: [
    'Print DTF meteran',
    'Cocok untuk vendor sablon, konveksi kecil, reseller, dan brand lokal',
    'Bisa bantu cek file sebelum produksi',
    'Bisa bantu layout hemat area cetak',
    'Transfer dikirim dalam kondisi siap press',
    'Tersedia harga vendor untuk repeat order',
    'Bisa bantu desain ringan untuk optimasi kualitas gambar',
    'Proses order mudah via order cepat atau WhatsApp',
  ],
}

const AUDIENCE = {
  title: 'Layanan Ini Cocok untuk Siapa?',
  cards: [
    {
      title: 'Vendor Sablon',
      description: 'Terima kebutuhan print DTF full color untuk customer Anda dengan proses yang praktis dan siap press. Cocok untuk sablon rumahan, vendor kaos custom, dan usaha sablon kecil.',
      message: 'Partner print DTF untuk kebutuhan produksi harian.',
    },
    {
      title: 'Konveksi Kecil',
      description: 'Tambahkan layanan sablon DTF untuk customer Anda dengan alur produksi yang lebih fleksibel dan mudah dikontrol.',
      message: 'Tambah layanan DTF dengan partner produksi yang praktis.',
    },
    {
      title: 'Reseller Kaos Custom',
      description: 'Anda siapkan kaos dan kebutuhan customer, cetakin.com bantu print transfer DTF-nya. Cocok untuk reseller yang ingin produksi sesuai order.',
      message: 'Jualan kaos custom dengan file siap press.',
    },
    {
      title: 'Brand Lokal',
      description: 'Cetak transfer DTF untuk sample, mini drop, atau stok desain. Press saat order masuk agar produksi lebih fleksibel.',
      message: 'Tes desain dan mini drop dengan lebih fleksibel.',
    },
  ],
}

const VALUE = {
  title: 'Kenapa Print DTF di cetakin.com?',
  body: 'cetakin.com membantu vendor, reseller, konveksi, dan brand lokal mendapatkan print DTF transfer siap press dengan proses yang rapi, praktis, dan mudah dikontrol.',
  cards: [
    { title: 'Siap Press', description: 'Transfer DTF dicetak dan dikirim dalam kondisi siap digunakan. Cocok untuk Anda yang sudah punya heat press sendiri.' },
    { title: 'Layout Hemat Area Cetak', description: 'Gabungkan banyak desain dalam satu area cetak agar lebih efisien dan hemat.' },
    { title: 'File Bisa Dicek', description: 'Kami bantu cek file dari sisi ukuran, resolusi, background, dan kesiapan cetak sebelum produksi.' },
    { title: 'Bantu Desain Ringan', description: 'Kami bisa bantu optimalkan kualitas gambar, merapikan file sederhana, atau membuat desain logo/desain ringan sesuai kebutuhan.' },
    { title: 'Harga Vendor', description: 'Tersedia harga khusus untuk vendor, reseller, dan customer repeat order.' },
    { title: 'Proses Mudah', description: 'Order bisa lewat form order cepat atau WhatsApp. Kirim file, cek estimasi, konfirmasi, produksi, lalu ambil atau kirim.' },
  ],
}

const SERVICES = {
  title: 'Layanan Print DTF yang Tersedia',
  items: [
    {
      title: 'Print DTF Meteran',
      description: 'Cocok untuk vendor, reseller, dan konveksi yang membutuhkan cetak transfer DTF berdasarkan panjang meter.',
      cocok: 'Order customer, desain full color, logo, nama, nomor, merchandise, dan produksi berulang.',
    },
    {
      title: 'Print Banyak Desain Sekaligus',
      description: 'Susun banyak desain, logo, nama, atau variasi ukuran dalam satu area cetak agar lebih efisien.',
      cocok: 'Reseller, brand lokal, vendor sablon, dan customer yang ingin memaksimalkan area cetak.',
    },
    {
      title: 'Maklon Print DTF Vendor',
      description: 'Untuk vendor sablon dan konveksi yang membutuhkan partner print DTF transfer siap press.',
      cocok: 'Vendor yang sudah punya customer, kaos, dan heat press, tetapi butuh partner print DTF.',
    },
    {
      title: 'Bantuan Layout Hemat Area Cetak',
      description: 'Kami dapat membantu menyusun file ke dalam layout cetak agar area lebih efisien.',
      cocok: 'Catatan: Bantuan layout berlaku untuk file yang sudah siap cetak.',
    },
    {
      title: 'Bantu Desain Ringan',
      description: 'Kami bisa bantu optimalkan kualitas gambar, merapikan file sederhana, menyesuaikan ukuran.',
      cocok: 'Gratis untuk kebutuhan ringan.',
    },
  ],
}

const ORDER_STEPS = [
  { title: 'Kirim File Desain', description: 'Kirim file desain lewat order cepat atau WhatsApp. Format bisa berupa PNG transparan, PDF, AI, CDR, PSD, ZIP.' },
  { title: 'Kami Cek File', description: 'Kami bantu cek ukuran, resolusi, background, dan kesiapan file untuk dicetak.' },
  { title: 'Estimasi & Harga Final', description: 'Sistem dapat menampilkan estimasi awal. Harga final akan dikonfirmasi admin setelah file dicek.' },
  { title: 'Invoice & Payment Link', description: 'Setelah file dan harga disetujui, sistem membuat invoice dan payment link.' },
  { title: 'Produksi Print DTF', description: 'Setelah pembayaran berhasil, file diproses menjadi transfer DTF siap press.' },
  { title: 'Ambil atau Kirim', description: 'Hasil print bisa diambil langsung di workshop atau dikirim via ekspedisi.' },
]

const SYARAT_FILE = {
  title: 'Syarat File',
  items: [
    'File disarankan dalam format PNG transparan, PDF, AI, CDR, PSD, atau ZIP',
    'Resolusi tinggi dan tidak pecah',
    'Background transparan jika desain tidak ingin berbentuk kotak',
    'Ukuran desain sudah jelas',
    'Warna pada layar bisa sedikit berbeda dengan hasil cetak',
    'File blur, kecil, atau pecah akan memengaruhi hasil print',
    'Untuk cetak banyak desain sekaligus, beri jarak aman antar desain agar mudah dipotong',
  ],
  cta: 'Ragu file Anda sudah siap cetak? Kirim File untuk Kami Cek.',
}

const DISCLAIMER = {
  title: 'Penting Sebelum Order',
  body: 'Layanan kami khusus untuk print DTF transfer siap press.\n\nKami tidak menyediakan kaos dan tidak termasuk jasa press.\n\nHasil akhir setelah ditempel dapat dipengaruhi oleh: jenis kain, suhu press, tekanan press, durasi press, cara peel, second press, teknik pencucian.\n\nKami dapat memberikan panduan press dasar untuk membantu Anda mendapatkan hasil terbaik.',
}

const FAQ = [
  { q: 'Apakah layanan ini sudah termasuk kaos?', a: 'Belum. Kami hanya menyediakan jasa print DTF transfer siap press.' },
  { q: 'Apakah sudah termasuk jasa press?', a: 'Belum. Transfer DTF dikirim dalam bentuk siap press. Layanan ini cocok untuk customer yang sudah punya heat press sendiri.' },
  { q: 'Bisa order untuk vendor sablon atau konveksi?', a: 'Bisa. Kami melayani vendor sablon, konveksi kecil, reseller, dan brand lokal.' },
  { q: 'Bisa bantu layout hemat area cetak?', a: 'Bisa, selama file sudah siap cetak. Jika file perlu edit berat, kami akan informasikan terlebih dahulu.' },
  { q: 'Bisa bantu desain?', a: 'Bisa untuk desain ringan, optimasi kualitas gambar, desain logo sederhana, atau perapihan file dasar. Untuk desain kompleks akan dikonfirmasi terlebih dahulu.' },
  { q: 'File dari Canva bisa dicetak?', a: 'Bisa dicek dulu. Pastikan file memiliki resolusi yang cukup dan background sesuai kebutuhan.' },
  { q: 'Bisa kirim luar kota?', a: 'Bisa. Transfer DTF bisa dikirim sesuai alamat tujuan via ekspedisi.' },
  { q: 'Bisa ambil langsung?', a: 'Bisa. Anda dapat mengambil hasil print langsung di workshop cetakin.com.' },
  { q: 'Kalau hasil press gagal, apakah diganti?', a: 'Kami bertanggung jawab jika terdapat cacat produksi pada hasil print. Namun proses press, suhu, tekanan, bahan kain, dan teknik aplikasi berada di luar kendali kami.' },
  { q: 'Bisa dapat harga vendor?', a: 'Bisa. Harga vendor tersedia untuk repeat order atau pembelian dengan jumlah tertentu.' },
]

const CLOSING = {
  headline: 'Siap Print DTF untuk Kebutuhan Produksi Anda?',
  body: 'Kirim file desain Anda sekarang. cetakin.com bantu cek file, hitungkan kebutuhan cetak, dan siapkan transfer DTF siap press untuk kebutuhan produksi Anda.',
  cta: 'Order Cepat',
  ctaSecondary: 'Cek File & Harga via WhatsApp',
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const openWhatsApp = (message?: string) => {
    const defaultMsg = `Halo, saya ingin print DTF transfer siap press.

Kebutuhan saya:
- Jenis order: 
- Ukuran desain:
- Jumlah atau estimasi panjang:
- Deadline:
- Kota pengiriman:
- File desain: akan saya kirim

Mohon dibantu cek file dan estimasi harganya.`
    const msg = message || defaultMsg
    const waUrl = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary">
              {COMPANY.name}
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/#services" className="text-sm text-muted-foreground hover:text-foreground">Layanan</Link>
              <Link to="/#cara-order" className="text-sm text-muted-foreground hover:text-foreground">Cara Order</Link>
              <Link to="/#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
              <Button variant="whatsapp" size="sm" onClick={() => openWhatsApp()}>
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </nav>

            <button 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 flex flex-col gap-4">
              <Link to="/#services" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Layanan</Link>
              <Link to="/#cara-order" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Cara Order</Link>
              <Link to="/#faq" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Button variant="whatsapp" size="sm" onClick={() => openWhatsApp()}>
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {HERO.headline}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              {HERO.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/order">
                <Button variant="accent" size="lg">
                  <ArrowRight className="w-5 h-5" />
                  {HERO.ctaPrimary}
                </Button>
              </Link>
              <Button variant="whatsapp" size="lg" onClick={() => openWhatsApp()}>
                <MessageCircle className="w-5 h-5" />
                {HERO.ctaSecondary}
              </Button>
            </div>
            <p className="text-sm text-muted mt-4">{HERO.note}</p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">{PROBLEM.title}</h2>
            <div className="prose prose-gray max-w-none text-center text-muted-foreground mb-6">
              {PROBLEM.body.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" onClick={() => openWhatsApp()}>
                {PROBLEM.cta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{SOLUTION.title}</h2>
            <p className="text-center text-muted-foreground mb-8">{SOLUTION.body}</p>
            <ul className="space-y-3">
              {SOLUTION.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{AUDIENCE.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCE.cards.map((card, i) => (
              <div key={i} className="bg-surface rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
                <p className="text-sm font-medium text-primary">{card.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{VALUE.title}</h2>
          <p className="text-center text-muted-foreground mb-8">{VALUE.body}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUE.cards.map((card, i) => (
              <div key={i} className="bg-background rounded-lg p-6 border border-border">
                <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{SERVICES.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.items.map((service, i) => (
              <div key={i} className="bg-surface rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                <p className="text-sm text-muted"><span className="font-medium">Cocok untuk:</span> {service.cocok}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Order */}
      <section id="cara-order" className="py-12 md:py-16 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Cara Order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ORDER_STEPS.map((step, i) => (
              <div key={i} className="bg-background rounded-lg p-6 border border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syarat File */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{SYARAT_FILE.title}</h2>
          <div className="max-w-2xl mx-auto">
            <ul className="space-y-3 mb-6">
              {SYARAT_FILE.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <Button variant="outline" onClick={() => openWhatsApp()}>
                {SYARAT_FILE.cta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">{DISCLAIMER.title}</h2>
          <div className="max-w-2xl mx-auto prose prose-gray text-center text-muted-foreground">
            {DISCLAIMER.body.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">FAQ</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left bg-surface hover:bg-surface/80"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <span className="font-medium">{item.q}</span>
                  <HelpCircle className={`w-5 h-5 flex-shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="p-4 pt-0 text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{CLOSING.headline}</h2>
            <p className="text-white/80 mb-6">{CLOSING.body}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/order">
                <Button variant="accent" size="lg">
                  <ArrowRight className="w-5 h-5" />
                  {CLOSING.cta}
                </Button>
              </Link>
              <Button variant="whatsapp" size="lg" onClick={() => openWhatsApp()}>
                <MessageCircle className="w-5 h-5" />
                {CLOSING.ctaSecondary}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-surface-dark text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="font-semibold">{COMPANY.name}</p>
              <p className="text-sm text-white/60">{COMPANY.companyName}</p>
            </div>
            <div className="text-center md:text-right text-sm text-white/60">
              <p>{COMPANY.address}</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky WhatsApp */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button variant="whatsapp" size="lg" className="rounded-full shadow-lg" onClick={() => openWhatsApp()}>
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}