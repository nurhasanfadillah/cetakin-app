import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Save, Loader2, Type, Plus, Trash2, GripVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { FAQ } from '@/types'

export default function AdminContent() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'sections' | 'faqs'>('sections')
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' })
  const [showFaqModal, setShowFaqModal] = useState(false)

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: async () => {
      const { data } = await supabase.from('landing_page_sections').select('*').order('sort_order')
      return data || []
    },
  })

  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data } = await supabase.from('landing_page_faqs').select('*').order('sort_order')
      return data as FAQ[] || []
    },
  })

  const saveFaqMutation = useMutation({
    mutationFn: async () => {
      if (editingFaq) {
        await supabase.from('landing_page_faqs').update({ question: faqForm.question, answer: faqForm.answer }).eq('id', editingFaq.id)
      } else {
        await supabase.from('landing_page_faqs').insert({ question: faqForm.question, answer: faqForm.answer, sort_order: (faqs?.length || 0) + 1 })
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-faqs'] }); setShowFaqModal(false); setEditingFaq(null) },
  })

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => { await supabase.from('landing_page_faqs').delete().eq('id', id) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-faqs'] }),
  })

  const toggleSectionMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await supabase.from('landing_page_sections').update({ is_active: active }).eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sections'] }),
  })

  const isLoading = sectionsLoading || faqsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Konten Landing Page</h1>
        <p className="text-text-muted">Kelola section dan FAQ di halaman utama</p>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'sections' ? 'default' : 'outline'} size="sm" onClick={() => setTab('sections')}>Sections</Button>
        <Button variant={tab === 'faqs' ? 'default' : 'outline'} size="sm" onClick={() => setTab('faqs')}>FAQ</Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : tab === 'sections' ? (
        <Card>
          <CardHeader><CardTitle>Landing Page Sections</CardTitle></CardHeader>
          <CardContent>
            {!sections?.length ? (
              <p className="py-8 text-center text-text-muted">Belum ada section</p>
            ) : (
              <div className="space-y-3">
                {sections.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                      <div>
                        <p className="font-medium">{s.section_key}</p>
                        <p className="text-sm text-text-muted">{s.title || '(no title)'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.is_active ? 'success' : 'secondary'}>{s.is_active ? 'Aktif' : 'Off'}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => toggleSectionMutation.mutate({ id: s.id, active: !s.is_active })}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>FAQ</CardTitle>
            <Button size="sm" onClick={() => { setEditingFaq(null); setFaqForm({ question: '', answer: '' }); setShowFaqModal(true) }}>
              <Plus className="w-4 h-4 mr-2" />Tambah FAQ
            </Button>
          </CardHeader>
          <CardContent>
            {!faqs?.length ? (
              <p className="py-8 text-center text-text-muted">Belum ada FAQ</p>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-4 border border-border rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium mb-1">{faq.question}</p>
                        <p className="text-sm text-text-muted">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingFaq(faq); setFaqForm({ question: faq.question, answer: faq.answer }); setShowFaqModal(true) }}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteFaqMutation.mutate(faq.id)}>
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader><CardTitle>{editingFaq ? 'Edit FAQ' : 'Tambah FAQ'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Pertanyaan</label>
                <input type="text" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Jawaban</label>
                <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={4} />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowFaqModal(false)} className="flex-1">Batal</Button>
                <Button onClick={() => saveFaqMutation.mutate()} disabled={saveFaqMutation.isPending || !faqForm.question} className="flex-1">
                  {saveFaqMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}