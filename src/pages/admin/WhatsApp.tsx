import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Save, Loader2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSetting, updateSetting } from '@/lib/db'

interface WhatsAppConfig {
  enabled: boolean
  stickyLabel: string
  prefilledMessage: string
}

interface CompanyConfig {
  whatsapp: string
}

export default function AdminWhatsApp() {
  const queryClient = useQueryClient()
  const [config, setConfig] = useState<WhatsAppConfig>({
    enabled: true, stickyLabel: 'Chat WhatsApp', prefilledMessage: ''
  })
  const [whatsappNumber, setWhatsappNumber] = useState('')

  const { isLoading } = useQuery({
    queryKey: ['admin-whatsapp-config'],
    queryFn: async () => {
      const [waConfig, companyConfig] = await Promise.all([
        getSetting<WhatsAppConfig>('whatsapp_config'),
        getSetting<CompanyConfig>('company'),
      ])
      if (waConfig.data) setConfig(waConfig.data)
      if (companyConfig.data) setWhatsappNumber(companyConfig.data.whatsapp || '')
      return { waConfig: waConfig.data, company: companyConfig.data }
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateSetting('whatsapp_config', config as unknown as Record<string, unknown>)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-whatsapp-config'] }),
  })

  if (isLoading) {
    return <div className="py-12 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Konfigurasi WhatsApp</h1>
        <p className="text-text-muted">Atur tombol WhatsApp dan pesan otomatis</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-success" /> Pengaturan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="wa-enabled" checked={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} className="w-4 h-4 rounded border-border" />
              <label htmlFor="wa-enabled" className="text-sm font-medium">Tampilkan Tombol WhatsApp</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Label Tombol</label>
              <input type="text" value={config.stickyLabel} onChange={(e) => setConfig({ ...config, stickyLabel: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Pesan Otomatis</label>
              <textarea value={config.prefilledMessage} onChange={(e) => setConfig({ ...config, prefilledMessage: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={4} />
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preview</CardTitle><CardDescription>Tampilan tombol WhatsApp</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white ${config.enabled ? 'bg-[#25D366]' : 'bg-gray-400'}`}>
                <MessageCircle className="w-5 h-5" />{config.stickyLabel}
              </div>
            </div>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(config.prefilledMessage)}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full"><ExternalLink className="w-4 h-4 mr-2" />Test Link</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}