import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { Profile } from '../types'

interface AuthContextType {
  user: Profile | null
  isLoading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  signIn: (phone: string, password: string) => Promise<{ error: string | null; user?: Profile }>
  signUp: (data: SignUpData) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>
  resetPassword: (phone: string, newPassword: string) => Promise<{ error: string | null }>
}

interface SignUpData {
  fullName: string
  phone: string
  email?: string
  password: string
}

const SESSION_KEY = 'cetakin_session'
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000 // 7 days

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredSession(): Profile | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null
    
    const { profile, expiry } = JSON.parse(stored)
    
    if (Date.now() > expiry) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    
    return profile
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function setStoredSession(profile: Profile) {
  const data = {
    profile,
    expiry: Date.now() + SESSION_TIMEOUT
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const signIn = async (phone: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('login_with_phone', {
        p_phone: phone,
        p_password: password
      })

      if (error) {
        return { error: error.message }
      }

      if (!data || data.length === 0) {
        return { error: 'Login gagal' }
      }

      const profile = data[0] as Profile
      setUser(profile)
      setStoredSession(profile)
      return { error: null, user: profile }
    } catch (err: unknown) {
      const error = err as Error
      if (error.message.includes('Nomor HP tidak terdaftar') ||
          error.message.includes('Password salah') ||
          error.message.includes('tidak aktif')) {
        return { error: error.message }
      }
      return { error: error.message || 'Terjadi kesalahan' }
    }
  }

  const signUp = async (data: SignUpData) => {
    try {
      const { error } = await supabase.rpc('register_with_phone', {
        p_full_name: data.fullName,
        p_phone: data.phone,
        p_password: data.password,
        p_email: data.email || null
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err: unknown) {
      const error = err as Error
      return { error: error.message || 'Terjadi kesalahan' }
    }
  }

  const signOut = async () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) return { error: 'Tidak ada session' }

      const { error: verifyError } = await supabase.rpc('login_with_phone', {
        phone: user.phone,
        password: currentPassword
      })

      if (verifyError) {
        return { error: 'Password saat ini salah' }
      }

      const { error } = await supabase.rpc('update_profile_password', {
        profile_id: user.id,
        new_password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err: unknown) {
      const error = err as Error
      return { error: error.message || 'Terjadi kesalahan' }
    }
  }

  const resetPassword = async (phone: string, newPassword: string) => {
    try {
      const { data, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .single()

      if (findError || !data) {
        return { error: 'Nomor HP tidak ditemukan' }
      }

      const { error } = await supabase.rpc('admin_reset_password', {
        profile_id: data.id,
        new_password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err: unknown) {
      const error = err as Error
      return { error: error.message || 'Terjadi kesalahan' }
    }
  }

  useEffect(() => {
    const stored = getStoredSession()
    if (stored) {
      setUser(stored)
    }
    setIsLoading(false)
  }, [])

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      updatePassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}