import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff, Printer, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isAdmin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

      const { error: signInError } = await signIn(data.email, data.password)

      if (signInError) {
        setError('Email atau password salah')
        return
      }

      if (isAdmin) {
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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          <div className="bg-surface rounded-2xl border border-border p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Printer className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Login</h1>
              <p className="text-text-secondary mt-2">Masuk ke akun cetakin.com</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-12 px-4 py-3 border border-border rounded-xl bg-background text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="nama@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-danger mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-12 px-4 py-3 border border-border rounded-xl bg-background text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-danger mt-1">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-muted">
                Lupa password?{' '}
                <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                  Reset password
                </Link>
              </p>
            </div>

            <p className="text-center text-sm text-text-muted mt-6">
              Belum punya akun?{' '}
              <Link to="/order" className="text-primary hover:underline font-medium">
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