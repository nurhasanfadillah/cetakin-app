import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FileText, Download, Eye, Image as ImageIcon, File, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface OrderFileRow {
  id: string
  order_id: string
  file_name: string
  file_path: string
  bucket_name: string
  mime_type: string | null
  file_size: number | null
  created_at: string
  order?: { order_number: string; customer_name: string }
}

const formatSize = (bytes: number | null) => {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (mime: string | null) => {
  if (!mime) return File
  if (mime.startsWith('image/')) return ImageIcon
  return FileText
}

export default function AdminFiles() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: files, isLoading } = useQuery({
    queryKey: ['admin-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_files')
        .select('*, order:orders(order_number, customer_name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as OrderFileRow[]
    },
  })

  const filtered = (files || []).filter(f => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return f.file_name.toLowerCase().includes(q) || f.order?.order_number?.toLowerCase().includes(q)
  })

  const handleDownload = async (file: OrderFileRow) => {
    const { data } = await supabase.storage.from(file.bucket_name).createSignedUrl(file.file_path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">File Order</h1>
          <p className="text-text-muted">Semua file yang di-upload customer</p>
        </div>
        <Badge variant="secondary">{files?.length || 0} file</Badge>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Cari nama file atau order..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-11 rounded-xl border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center"><FileText className="w-12 h-12 mx-auto text-text-muted mb-4" /><p className="text-text-muted">Belum ada file</p></div>
          ) : (
            <div className="space-y-3">
              {filtered.map((file) => {
                const Icon = getFileIcon(file.mime_type)
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{file.file_name}</p>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span>{file.order?.order_number}</span>
                          <span>{formatSize(file.file_size)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(file.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}