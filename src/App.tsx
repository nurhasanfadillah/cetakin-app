import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'
import OrderPage from './pages/public/OrderPage'
import OrderSuccessPage from './pages/public/OrderSuccessPage'
import LoginPage from './pages/public/LoginPage'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import AdminMembers from './pages/admin/Members'
import AdminInvoices from './pages/admin/Invoices'
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/order/success/:orderNumber" element={<OrderSuccessPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
      <Route path="/admin/members" element={<AdminMembers />} />
      <Route path="/admin/invoices" element={<AdminInvoices />} />
      <Route path="/admin/files" element={<AdminFiles />} />
      <Route path="/admin/media" element={<AdminMedia />} />
      <Route path="/admin/price-list" element={<AdminPriceList />} />
      <Route path="/admin/content" element={<AdminContent />} />
      <Route path="/admin/seo-tracking" element={<AdminSeoTracking />} />
      <Route path="/admin/whatsapp" element={<AdminWhatsApp />} />
      <Route path="/admin/company" element={<AdminCompany />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      
      <Route path="/member" element={<MemberDashboard />} />
      <Route path="/member/orders" element={<MemberOrders />} />
      <Route path="/member/orders/:id" element={<MemberOrderDetail />} />
      <Route path="/member/invoices" element={<MemberInvoices />} />
      <Route path="/member/invoices/:id" element={<MemberInvoiceDetail />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App