import { Settings as SettingsIcon, Shield, Bell, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function AdminSettings() {
  const settingsGroups = [
    { title: 'Profil Perusahaan', description: 'Nama, alamat, dan kontak perusahaan', icon: SettingsIcon, href: '/admin/company', badge: null },
    { title: 'WhatsApp', description: 'Konfigurasi tombol WhatsApp dan pesan otomatis', icon: Bell, href: '/admin/whatsapp', badge: null },
    { title: 'SEO & Tracking', description: 'Meta tags, Google Ads, dan GA4', icon: Database, href: '/admin/seo-tracking', badge: null },
    { title: 'Layanan & Harga', description: 'Daftar layanan dan harga cetak', icon: SettingsIcon, href: '/admin/price-list', badge: null },
    { title: 'Konten Landing Page', description: 'Section, FAQ, dan konten halaman utama', icon: SettingsIcon, href: '/admin/content', badge: null },
    { title: 'Media Library', description: 'Gambar dan file yang digunakan di halaman', icon: SettingsIcon, href: '/admin/media', badge: null },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Pengaturan</h1>
        <p className="text-text-muted">Kelola semua konfigurasi aplikasi</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {settingsGroups.map((group) => (
          <Link key={group.href} to={group.href}>
            <Card className="h-full hover:border-primary/40 transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <group.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{group.title}</h3>
                      {group.badge && <Badge variant="info">{group.badge}</Badge>}
                    </div>
                    <p className="text-sm text-text-muted mt-1">{group.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-warning" />Informasi Sistem</CardTitle>
          <CardDescription>Status dan versi aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-surface rounded-lg"><p className="text-xs text-text-muted">Versi</p><p className="font-mono font-medium">1.0.0</p></div>
            <div className="p-3 bg-surface rounded-lg"><p className="text-xs text-text-muted">Framework</p><p className="font-mono font-medium">React 19 + Vite 8</p></div>
            <div className="p-3 bg-surface rounded-lg"><p className="text-xs text-text-muted">Database</p><p className="font-mono font-medium">Supabase</p></div>
            <div className="p-3 bg-surface rounded-lg"><p className="text-xs text-text-muted">Deploy</p><p className="font-mono font-medium">Netlify</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}