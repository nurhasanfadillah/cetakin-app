import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Save, Loader2, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSetting, updateSetting } from '@/lib/db'

interface CompanyData {
  name: string
  companyName: string
  whatsapp: string
  address: string
  email?: string
  website?: string
}

export default function AdminCompany() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CompanyData>({
    name: '', companyName: '', whatsapp: '', address: '', email: '', website: ''
  })

  const { isLoading } = useQuery({
    queryKey: ['admin-company'],
    queryFn: async () => {
      const { data } = await getSetting<CompanyData>('company')
      if (data) setFormData(data)
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: () => updateSetting('company', formData as unknown as Record<string, unknown>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-company'] }),
  })

  if (isLoading) {
    return <div className="py-12 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
  }

  const fields = [
    { key: 'name', label: 'Nama Brand', icon: Globe, placeholder: 'cetakin.com' },
    { key: 'companyName', label: 'Nama Perusahaan (Legal)', icon: Building2, placeholder: 'PT. REDONE BERKAH MANDIRI UTAMA' },
    { key: 'whatsapp', label: 'Nomor WhatsApp', icon: Phone, placeholder: '6282113133165' },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'info@cetakin.com' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://cetakin.com' },
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profil Perusahaan</h1>
        <p className="text-text-muted">Informasi perusahaan yang tampil di invoice dan landing page</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />Informasi Perusahaan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {fields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5"><Icon className="w-4 h-4 text-text-muted" />{label}</label>
              <input type="text" value={(formData as Record<string, string>)[key] || ''} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder={placeholder} />
            </div>
          ))}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1.5"><MapPin className="w-4 h-4 text-text-muted" />Alamat</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={3} />
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}