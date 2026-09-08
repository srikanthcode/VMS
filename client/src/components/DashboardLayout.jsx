import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = ({ children, role = 'customer', links = [] }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const defaultLinks = {
    customer: [
      { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
      { path: '/dashboard/profile', label: 'Profile', icon: 'bi-person' },
      { path: '/dashboard/vehicles', label: 'My Vehicles', icon: 'bi-car-front' },
      { path: '/dashboard/book-service', label: 'Book Service', icon: 'bi-calendar-plus' },
      { path: '/dashboard/bookings', label: 'My Bookings', icon: 'bi-calendar-check' },
      { path: '/dashboard/service-history', label: 'Service History', icon: 'bi-clock-history' },
      { path: '/dashboard/bills', label: 'Bills', icon: 'bi-receipt' },
      { path: '/dashboard/payments', label: 'Payments', icon: 'bi-credit-card' },
      { path: '/dashboard/invoices', label: 'Invoices', icon: 'bi-file-earmark-text' },
      { path: '/dashboard/notifications', label: 'Notifications', icon: 'bi-bell' },
      { path: '/dashboard/reviews', label: 'My Reviews', icon: 'bi-star' }
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
      { path: '/admin/customers', label: 'Customers', icon: 'bi-people' },
      { path: '/admin/vehicles', label: 'Vehicles', icon: 'bi-car-front' },
      { path: '/admin/services', label: 'Services', icon: 'bi-gear' },
      { path: '/admin/bookings', label: 'Bookings', icon: 'bi-calendar-check' },
      { path: '/admin/mechanics', label: 'Mechanics', icon: 'bi-person-gear' },
      { path: '/admin/billing', label: 'Billing', icon: 'bi-receipt' },
      { path: '/admin/payments', label: 'Payments', icon: 'bi-credit-card' },
      { path: '/admin/invoices', label: 'Invoices', icon: 'bi-file-earmark-text' },
      { path: '/admin/reviews', label: 'Reviews', icon: 'bi-star' },
      { path: '/admin/reports', label: 'Reports', icon: 'bi-graph-up' },
      { path: '/admin/location', label: 'Location', icon: 'bi-geo-alt' },
      { path: '/admin/settings', label: 'Settings', icon: 'bi-gear-wide-connected' }
    ],
    mechanic: [
      { path: '/mechanic/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
      { path: '/mechanic/bookings', label: 'My Assignments', icon: 'bi-calendar-check' }
    ]
  }

  const navLinks = links.length > 0 ? links : defaultLinks[role] || defaultLinks.customer

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        className="btn btn-primary position-fixed d-lg-none"
        style={{ top: '1rem', left: '1rem', zIndex: 1001 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="bi bi-list fs-4"></i>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/" className="text-decoration-none">
            <h4 className="text-white mb-0">
              <i className="bi bi-tools me-2" style={{ color: '#e94560' }}></i>
              VMS
            </h4>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-nav-item ${
                location.pathname === link.path ? 'active' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          ))}

          <hr className="my-3 mx-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          <Link to="/" className="sidebar-nav-item">
            <i className="bi bi-house"></i>
            <span>Back to Home</span>
          </Link>

          <button className="sidebar-nav-item w-100 text-start border-0 bg-transparent" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="d-flex align-items-center gap-3">
            <h5 className="mb-0 d-none d-md-block">
              {navLinks.find(l => l.path === location.pathname)?.label || 'Dashboard'}
            </h5>
          </div>

          <div className="topbar-actions">
            <div className="topbar-search d-none d-md-block">
              <i className="bi bi-search"></i>
              <input type="text" className="form-control" placeholder="Search..." />
            </div>

            <Link to={role === 'admin' ? '/admin/dashboard' : '/dashboard/notifications'} className="btn btn-outline-secondary position-relative">
              <i className="bi bi-bell"></i>
            </Link>

            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
                data-bs-toggle="dropdown"
              >
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="d-none d-md-inline">{user?.name || 'User'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text">
                    <strong>{user?.name}</strong>
                    <br />
                    <small className="text-muted">{user?.email}</small>
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to={role === 'admin' ? '/admin/settings' : '/dashboard/profile'}>
                    <i className="bi bi-person me-2"></i> Profile
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
