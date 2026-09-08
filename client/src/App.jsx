import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Components
import Navbar from './components/Navbar'

// Public Pages
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import MechanicLoginPage from './pages/auth/MechanicLoginPage'

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import ProfilePage from './pages/customer/ProfilePage'
import VehiclesPage from './pages/customer/VehiclesPage'
import AddVehiclePage from './pages/customer/AddVehiclePage'
import VehicleDetailPage from './pages/customer/VehicleDetailPage'
import BookServicePage from './pages/customer/BookServicePage'
import BookingsPage from './pages/customer/BookingsPage'
import BookingDetailPage from './pages/customer/BookingDetailPage'
import ServiceHistoryPage from './pages/customer/ServiceHistoryPage'
import BillsPage from './pages/customer/BillsPage'
import PaymentsPage from './pages/customer/PaymentsPage'
import InvoicesPage from './pages/customer/InvoicesPage'
import NotificationsPage from './pages/customer/NotificationsPage'
import ReviewsPage from './pages/customer/ReviewsPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage'
import AdminServicesPage from './pages/admin/AdminServicesPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminMechanicsPage from './pages/admin/AdminMechanicsPage'
import AdminBillingPage from './pages/admin/AdminBillingPage'
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage'
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import LocationTracker from './pages/admin/LocationTracker'

// Mechanic Pages
import MechanicDashboard from './pages/mechanic/MechanicDashboard'

// Loading
import LoadingSpinner from './components/LoadingSpinner'

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner fullPage message="Loading..." />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner fullPage message="Loading..." />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

const MechanicRoute = ({ children }) => {
  const { isAuthenticated, isMechanic, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner fullPage message="Loading..." />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/mechanic/login" replace />
  }
  
  if (!isMechanic) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  const location = useLocation()
  const hideNavbar = ['/login', '/register', '/forgot-password', '/admin/login', '/mechanic/login'].includes(location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/mechanic/login" element={<MechanicLoginPage />} />

        {/* Customer Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
        <Route path="/dashboard/vehicles/add" element={<ProtectedRoute><AddVehiclePage /></ProtectedRoute>} />
        <Route path="/dashboard/vehicles/:id" element={<ProtectedRoute><VehicleDetailPage /></ProtectedRoute>} />
        <Route path="/dashboard/book-service" element={<ProtectedRoute><BookServicePage /></ProtectedRoute>} />
        <Route path="/dashboard/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/dashboard/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
        <Route path="/dashboard/service-history" element={<ProtectedRoute><ServiceHistoryPage /></ProtectedRoute>} />
        <Route path="/dashboard/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
        <Route path="/dashboard/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/dashboard/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
        <Route path="/dashboard/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/dashboard/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
        <Route path="/admin/vehicles" element={<AdminRoute><AdminVehiclesPage /></AdminRoute>} />
        <Route path="/admin/services" element={<AdminRoute><AdminServicesPage /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
        <Route path="/admin/mechanics" element={<AdminRoute><AdminMechanicsPage /></AdminRoute>} />
        <Route path="/admin/billing" element={<AdminRoute><AdminBillingPage /></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><AdminPaymentsPage /></AdminRoute>} />
        <Route path="/admin/invoices" element={<AdminRoute><AdminInvoicesPage /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><AdminReviewsPage /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
        <Route path="/admin/location" element={<AdminRoute><LocationTracker /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

        {/* Mechanic Routes */}
        <Route path="/mechanic/dashboard" element={<MechanicRoute><MechanicDashboard /></MechanicRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
