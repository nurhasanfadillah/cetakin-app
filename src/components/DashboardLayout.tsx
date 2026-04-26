import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { 
  LayoutDashboard, Package, Users, FileText, Image, 
  CreditCard, Settings, ChevronLeft, ChevronRight,
  LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Pesanan', path: '/admin/orders', icon: Package },
  { label: 'Member', path: '/admin/members', icon: Users },
  { label: 'Invoice', path: '/admin/invoices', icon: FileText },
  { label: 'File', path: '/admin/files', icon: FileText },
  { label: 'Media', path: '/admin/media', icon: Image },
  { label: 'Daftar Harga', path: '/admin/price-list', icon: CreditCard },
  { label: 'Konten', path: '/admin/content', icon: FileText },
  { label: 'SEO & Tracking', path: '/admin/seo-tracking', icon: Settings },
  { label: 'WhatsApp', path: '/admin/whatsapp', icon: Settings },
  { label: 'Perusahaan', path: '/admin/company', icon: Settings },
  { label: 'Pengaturan', path: '/admin/settings', icon: Settings },
]

const memberNavItems = [
  { label: 'Dashboard', path: '/member', icon: LayoutDashboard },
  { label: 'Pesanan', path: '/member/orders', icon: Package },
  { label: 'Invoice', path: '/member/invoices', icon: FileText },
  { label: 'Pengaturan', path: '/member/settings', icon: Settings },
]

interface DashboardLayoutProps {
  variant: 'admin' | 'member'
  children: React.ReactNode
}

export default function DashboardLayout({ variant, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  const navItems = variant === 'admin' ? adminNavItems : memberNavItems

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-surface border-r border-border
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link to="/" className="text-xl font-bold text-primary">
              Cetak<span className="text-highlight">In</span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-surface-highlight rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== `/${variant}` && location.pathname.startsWith(item.path))
            const Icon = item.icon
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-text-secondary hover:bg-surface-highlight hover:text-text-primary'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-surface border border-border rounded-full items-center justify-center hover:bg-surface-highlight transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 hover:bg-surface-highlight rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-semibold text-text-primary capitalize">{variant} Dashboard</h1>
              <p className="text-sm text-text-muted">{profile?.full_name || 'User'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}