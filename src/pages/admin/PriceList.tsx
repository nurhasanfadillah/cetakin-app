import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Search, Plus, Edit2, Trash2, Save, X, Loader2,
  DollarSign, GripVertical
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { Service, PriceListItem } from '@/types'

const formatCurrency = (amount: number | null) => {
  if (!amount) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export default function AdminPriceList() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', slug: '', description: '', cocok_untuk: '', base_price: '', price_label: '', is_active: true })

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, price_items:price_list_items(*)')
        .order('sort_order')
      if (error) throw error
      return data as (Service & { price_items: PriceListItem[] })[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || null,
        cocok_untuk: formData.cocok_untuk || null,
        base_price: formData.base_price ? parseFloat(formData.base_price) : null,
        price_label: formData.price_label || null,
        is_active: formData.is_active,
      }
      if (editingService) {
        const { error } = await supabase.from('services').update(payload).eq('id', editingService.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('services').insert({ ...payload, sort_order: (services?.length || 0) + 1 })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      closeModal()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('services').update({ is_active: active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-services'] }),
  })

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({ title: service.title, slug: service.slug, description: service.description || '', cocok_untuk: service.cocok_untuk || '', base_price: service.base_price?.toString() || '', price_label: service.price_label || '', is_active: service.is_active })
    } else {
      setEditingService(null)
      setFormData({ title: '', slug: '', description: '', cocok_untuk: '', base_price: '', price_label: '', is_active: true })
    }
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditingService(null) }

  const filtered = (services || []).filter(s => {
    if (!searchQuery) return true
    return s.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Layanan & Harga</h1>
          <p className="text-text-muted">Kelola daftar layanan dan harga</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text" placeholder="Cari layanan..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 h-11 rounded-xl border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">Belum ada layanan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((service) => (
                <div key={service.id} className="border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <GripVertical className="w-5 h-5 text-text-muted mt-0.5 cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary">{service.title}</h3>
                          <Badge variant={service.is_active ? 'success' : 'secondary'}>
                            {service.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        {service.description && <p className="text-sm text-text-muted mb-2">{service.description}</p>}
                        {service.cocok_untuk && <p className="text-xs text-text-secondary">Cocok untuk: {service.cocok_untuk}</p>}
                        {service.base_price && (
                          <p className="text-sm font-medium text-primary mt-2">
                            {formatCurrency(service.base_price)} {service.price_label && `/ ${service.price_label}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(service)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: service.id, active: !service.is_active })}>
                        {service.is_active ? <X className="w-4 h-4 text-danger" /> : <Save className="w-4 h-4 text-success" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Layanan *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Nama layanan" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="url-slug" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={3} placeholder="Deskripsi layanan" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Cocok Untuk</label>
                <textarea value={formData.cocok_untuk} onChange={(e) => setFormData({ ...formData, cocok_untuk: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={2} placeholder="Siapa yang cocok menggunakan layanan ini" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Harga Dasar (Rp)</label>
                  <input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Label Harga</label>
                  <input type="text" value={formData.price_label} onChange={(e) => setFormData({ ...formData, price_label: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="per meter" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded border-border" />
                <label htmlFor="is_active" className="text-sm">Aktif</label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">Batal</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !formData.title} className="flex-1">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}