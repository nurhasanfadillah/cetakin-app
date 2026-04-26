import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from './lib/AuthContext'
import { PageLoader } from './components/ui/loading'
import { ErrorBoundary } from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'

// ═══════════════════════════════════════════════════════════════════
//  LAZY-LOADED PAGES (code-split by route)
// ═══════════════════════════════════════════════════════════════════

// Public
const LandingPage = lazy(() => import('./pages/public/LandingPage'))
const OrderPage = lazy(() => import('./pages/public/OrderPage'))
const OrderSuccessPage = lazy(() => import('./pages/public/OrderSuccessPage'))
const LoginPage = lazy(() => import('./pages/public/LoginPage'))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'))

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'))
const AdminMembers = lazy(() => import('./pages/admin/Members'))
const AdminInvoices = lazy(() => import('./pages/admin/Invoices'))
const AdminInvoiceDetail = lazy(() => import('./pages/admin/InvoiceDetail'))
const AdminFiles = lazy(() => import('./pages/admin/Files'))
const AdminMedia = lazy(() => import('./pages/admin/Media'))
const AdminPriceList = lazy(() => import('./pages/admin/PriceList'))
const AdminContent = lazy(() => import('./pages/admin/Content'))
const AdminSeoTracking = lazy(() => import('./pages/admin/SeoTracking'))
const AdminWhatsApp = lazy(() => import('./pages/admin/WhatsApp'))
const AdminCompany = lazy(() => import('./pages/admin/Company'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

// Member
const MemberDashboard = lazy(() => import('./pages/member/Dashboard'))
const MemberOrders = lazy(() => import('./pages/member/Orders'))
const MemberOrderDetail = lazy(() => import('./pages/member/OrderDetail'))
const MemberInvoices = lazy(() => import('./pages/member/Invoices'))
const MemberInvoiceDetail = lazy(() => import('./pages/member/InvoiceDetail'))

// ═══════════════════════════════════════════════════════════════════
//  ROUTE COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
      <SuspenseWrapper>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order/success/:orderNumber" element={<OrderSuccessPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ── Admin Routes ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout variant="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="invoices/:id" element={<AdminInvoiceDetail />} />
            <Route path="files" element={<AdminFiles />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="price-list" element={<AdminPriceList />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="seo-tracking" element={<AdminSeoTracking />} />
            <Route path="whatsapp" element={<AdminWhatsApp />} />
            <Route path="company" element={<AdminCompany />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ── Member Routes ── */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['member', 'admin', 'super_admin']}>
                <DashboardLayout variant="member" />
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberDashboard />} />
            <Route path="orders" element={<MemberOrders />} />
            <Route path="orders/:id" element={<MemberOrderDetail />} />
            <Route path="invoices" element={<MemberInvoices />} />
            <Route path="invoices/:id" element={<MemberInvoiceDetail />} />
          </Route>

          {/* ── 404 Catch-all ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SuspenseWrapper>
    </ErrorBoundary>
  )
}

export default App