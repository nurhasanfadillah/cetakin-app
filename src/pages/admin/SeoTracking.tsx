import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Save, Loader2, BarChart3, Globe, Code } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { TrackingSetting } from '@/types'

export default function AdminSeoTracking() {
  const queryClient = useQueryClient()
  const [tracking, setTracking] = useState<Partial<TrackingSetting>>({})
  const [seoForm, setSeoForm] = useState({ meta_title: '', meta_description: '', og_title: '', og_description: '' })

  const { isLoading } = useQuery({
    queryKey: ['admin-tracking'],
    queryFn: async () => {
      const { data } = await supabase.from('tracking_settings').select('*').limit(1).maybeSingle()
      if (data) setTracking(data)
      const { data: seo } = await supabase.from('seo_settings').select('*').eq('page_key', 'home').maybeSingle()
      if (seo) setSeoForm({ meta_title: seo.meta_title, meta_description: seo.meta_description, og_title: seo.og_title || '', og_description: seo.og_description || '' })
      return { tracking: data, seo }
    },
  })

  const saveTrackingMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('tracking_settings').upsert({ id: tracking.id, ...tracking })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tracking'] }),
  })

  const saveSeoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('seo_settings').upsert({ page_key: 'home', ...seoForm })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tracking'] }),
  })

  if (isLoading) {
    return <div className="py-12 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">SEO & Tracking</h1>
        <p className="text-text-muted">Konfigurasi meta tags dan tracking analytics</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />SEO Meta Tags</CardTitle><CardDescription>Pengaturan SEO untuk halaman utama</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Meta Title</label>
              <input type="text" value={seoForm.meta_title} onChange={(e) => setSeoForm({ ...seoForm, meta_title: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Meta Description</label>
              <textarea value={seoForm.meta_description} onChange={(e) => setSeoForm({ ...seoForm, meta_description: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">OG Title</label>
              <input type="text" value={seoForm.og_title} onChange={(e) => setSeoForm({ ...seoForm, og_title: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">OG Description</label>
              <textarea value={seoForm.og_description} onChange={(e) => setSeoForm({ ...seoForm, og_description: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={3} />
            </div>
            <Button onClick={() => saveSeoMutation.mutate()} disabled={saveSeoMutation.isPending} className="w-full">
              {saveSeoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Simpan SEO
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Tracking & Analytics</CardTitle><CardDescription>Google Ads dan GA4</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
              <div className="flex items-center gap-2"><Code className="w-4 h-4 text-text-muted" /><span className="text-sm font-medium">Google Ads</span></div>
              <input type="checkbox" checked={tracking.enable_google_ads || false} onChange={(e) => setTracking({ ...tracking, enable_google_ads: e.target.checked })} className="w-4 h-4 rounded border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Conversion ID</label>
              <input type="text" value={tracking.google_ads_conversion_id || ''} onChange={(e) => setTracking({ ...tracking, google_ads_conversion_id: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="AW-XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Conversion Label</label>
              <input type="text" value={tracking.google_ads_conversion_label || ''} onChange={(e) => setTracking({ ...tracking, google_ads_conversion_label: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
              <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-text-muted" /><span className="text-sm font-medium">GA4</span></div>
              <input type="checkbox" checked={tracking.enable_ga4 || false} onChange={(e) => setTracking({ ...tracking, enable_ga4: e.target.checked })} className="w-4 h-4 rounded border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">GA4 Measurement ID</label>
              <input type="text" value={tracking.ga4_measurement_id || ''} onChange={(e) => setTracking({ ...tracking, ga4_measurement_id: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="G-XXXXXXXXXX" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <Badge variant="warning">Test Mode</Badge>
              <input type="checkbox" checked={tracking.test_mode ?? true} onChange={(e) => setTracking({ ...tracking, test_mode: e.target.checked })} className="w-4 h-4 rounded border-border ml-auto" />
            </div>
            <Button onClick={() => saveTrackingMutation.mutate()} disabled={saveTrackingMutation.isPending} className="w-full">
              {saveTrackingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Simpan Tracking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}