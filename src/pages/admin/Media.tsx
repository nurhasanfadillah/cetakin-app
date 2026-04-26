import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Upload, Trash2, Image as ImageIcon, File, Loader2, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { MediaAsset } from '@/types'

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminMedia() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: media, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const { data } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false })
      return data as MediaAsset[] || []
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true)
      const path = `media/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('order-files').upload(path, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('order-files').getPublicUrl(path)
      await supabase.from('media_assets').insert({
        file_name: file.name, file_path: path, public_url: urlData.publicUrl,
        bucket_name: 'order-files', mime_type: file.type, file_size: file.size,
        category: file.type.startsWith('image/') ? 'image' : 'document',
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-media'] }); setUploading(false) },
    onError: () => setUploading(false),
  })

  const deleteMutation = useMutation({
    mutationFn: async (asset: MediaAsset) => {
      await supabase.storage.from(asset.bucket_name).remove([asset.file_path])
      await supabase.from('media_assets').delete().eq('id', asset.id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-media'] }),
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) uploadMutation.mutate(e.target.files[0])
  }

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = (media || []).filter(m => !searchQuery || m.file_name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Media Library</h1>
          <p className="text-text-muted">Kelola gambar dan file media</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{media?.length || 0} file</Badge>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.svg" onChange={handleFileSelect} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Cari file..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-11 rounded-xl border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center"><ImageIcon className="w-12 h-12 mx-auto text-text-muted mb-4" /><p className="text-text-muted">Belum ada media</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((asset) => (
                <div key={asset.id} className="group border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="aspect-square bg-surface flex items-center justify-center overflow-hidden">
                    {asset.mime_type?.startsWith('image/') && asset.public_url ? (
                      <img src={asset.public_url} alt={asset.alt_text || asset.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <File className="w-10 h-10 text-text-muted" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{asset.file_name}</p>
                    <p className="text-xs text-text-muted">{formatSize(asset.file_size)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {asset.public_url && (
                        <Button variant="ghost" size="sm" onClick={() => copyUrl(asset.public_url!, asset.id)}>
                          {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(asset)}>
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}