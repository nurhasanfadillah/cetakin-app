import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import { PageLoader } from './components/ui/loading'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './pages/public/LandingPage'
import OrderPage from './pages/public/OrderPage'
import OrderSuccessPage from './pages/public/OrderSuccessPage'
import LoginPage from './pages/public/LoginPage'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import AdminMembers from './pages/admin/Members'
import AdminInvoices from './pages/admin/Invoices'
import AdminInvoiceDetail from './pages/admin/InvoiceDetail'
import AdminFiles from './pages/admin/Files'
import AdminMedia from './pages/admin/Media'
import AdminPriceList from './pages/admin/PriceList'
import AdminContent from './pages/admin/Content'
import AdminSeoTracking from './pages/admin/SeoTracking'
import AdminWhatsApp from './pages/admin/WhatsApp'
import AdminCompany from './pages/admin/Company'
import AdminSettings from './pages/admin/Settings'
import MemberDashboard from './pages/member/Dashboard'
import MemberOrders from './pages/member/Orders'
import MemberOrderDetail from './pages/member/OrderDetail'
import MemberInvoices from './pages/member/Invoices'
import MemberInvoiceDetail from './pages/member/InvoiceDetail'

function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <DashboardLayout variant="admin">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/members" element={<AdminMembers />} />
          <Route path="/invoices" element={<AdminInvoices />} />
          <Route path="/invoices/:id" element={<AdminInvoiceDetail />} />
          <Route path="/files" element={<AdminFiles />} />
          <Route path="/media" element={<AdminMedia />} />
          <Route path="/price-list" element={<AdminPriceList />} />
          <Route path="/content" element={<AdminContent />} />
          <Route path="/seo-tracking" element={<AdminSeoTracking />} />
          <Route path="/whatsapp" element={<AdminWhatsApp />} />
          <Route path="/company" element={<AdminCompany />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function MemberRoutes() {
  return (
    <ProtectedRoute allowedRoles={['member', 'admin', 'super_admin']}>
      <DashboardLayout variant="member">
        <Routes>
          <Route path="/" element={<MemberDashboard />} />
          <Route path="/orders" element={<MemberOrders />} />
          <Route path="/orders/:id" element={<MemberOrderDetail />} />
          <Route path="/invoices" element={<MemberInvoices />} />
          <Route path="/invoices/:id" element={<MemberInvoiceDetail />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/order/success/:orderNumber" element={<OrderSuccessPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/member/*" element={<MemberRoutes />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App