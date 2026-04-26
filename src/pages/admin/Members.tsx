import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Search, 
  Plus, 
  Edit2, 
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

const roleLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  'super_admin': { label: 'Super Admin', variant: 'warning' },
  'admin': { label: 'Admin', variant: 'warning' },
  'member': { label: 'Member', variant: 'secondary' },
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric'
  })
}

export default function AdminMembers() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    role: 'member',
    password: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Profile[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (newMember: typeof formData) => {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', newMember.phone)
        .single()
      
      if (existing) throw new Error('Nomor HP sudah terdaftar')
      
      const { data, error } = await supabase.rpc('register_with_phone', {
        p_full_name: newMember.full_name,
        p_phone: newMember.phone,
        p_email: newMember.email || null,
        p_password: newMember.password || 'changeme123',
      })
      
      if (error) throw error
      
      if (newMember.role !== 'member') {
        await supabase
          .from('profiles')
          .update({ role: newMember.role })
          .eq('phone', newMember.phone)
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
      closeModal()
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', id)
      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
    },
  })

  const members = data || []

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      member.full_name?.toLowerCase().includes(q) ||
      member.phone?.includes(q) ||
      member.email?.toLowerCase().includes(q)
    )
  })

  const openModal = (member?: Profile) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        full_name: member.full_name,
        phone: member.phone,
        email: member.email || '',
        role: member.role,
        password: '',
      })
    } else {
      setEditingMember(null)
      setFormData({ full_name: '', phone: '', email: '', role: 'member', password: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingMember(null)
    setFormData({ full_name: '', phone: '', email: '', role: 'member', password: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Member</h1>
          <p className="text-text-muted">Kelola akun member dan admin</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Member
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Cari nama, HP, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 h-11 rounded-xl border border-border bg-background px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-text-muted mt-4">Memuat...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center">
              <User className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">Belum ada member</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Nama</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Kontak</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Daftar</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-surface/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-text-muted" />
                            {member.phone}
                          </p>
                          {member.email && (
                            <p className="flex items-center gap-1">
                              <Mail className="w-4 h-4 text-text-muted" />
                              {member.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={roleLabels[member.role]?.variant || 'secondary'}>
                          {roleLabels[member.role]?.label || member.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {member.is_active ? (
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle className="w-4 h-4" />
                            Aktif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-danger">
                            <XCircle className="w-4 h-4" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-text-muted">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(member)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({ 
                              id: member.id, 
                              isActive: !member.is_active 
                            })}
                          >
                            {member.is_active ? (
                              <XCircle className="w-4 h-4 text-danger" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-success" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {editingMember ? 'Edit Member' : 'Tambah Member Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Nomor HP</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                {!editingMember && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">
                    Batal
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingMember ? 'Simpan' : 'Tambah'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}