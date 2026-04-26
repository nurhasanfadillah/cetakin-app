import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Lock, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const loginSchema = z.object({
  phone: z.string().min(10, 'Nomor HP minimal 10 digit'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as { from?: string })?.from || '/member'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError('')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', data.phone)
        .single()

      if (profileError || !profile) {
        setError('Nomor HP tidak terdaftar')
        return
      }

      if (!profile.is_active) {
        setError('Akun tidak aktif. Hubungi admin.')
        return
      }

      if (profile.role === 'admin' || profile.role === 'super_admin') {
        navigate('/admin')
      } else {
        navigate(from)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>

          <div className="bg-surface rounded-lg border border-border p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nomor HP</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full pl-10 px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-danger mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full pl-10 px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="Password"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-danger mt-1">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Belum punya akun?{' '}
              <Link to="/order" className="text-primary hover:underline">
                Order dulu
              </Link>
              {' '}untuk buat akun otomatis
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}