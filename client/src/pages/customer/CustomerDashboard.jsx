import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import api from '../../services/api'

const services = [
  {
    id: 1,
    title: 'Expert Mechanics',
    description: 'Our certified mechanics bring years of experience in servicing all types of vehicles. From routine maintenance to complex repairs, your vehicle is in safe hands.',
    image: '/images/expert-mechanics.jpg',
    features: ['Certified & Trained Staff', 'All Vehicle Brands', 'Genuine Spare Parts', 'Warranty on Services'],
    price: 'Starting ₹499'
  },
  {
    id: 2,
    title: 'Professional Bike Service',
    description: 'Complete bike servicing with oil change, brake adjustment, chain lubrication, engine tuning and thorough safety inspection — all at your doorstep.',
    image: '/images/professional-bike-service.jpg',
    features: ['Full Engine Service', 'Oil & Filter Change', 'Brake & Chain Care', 'Performance Check'],
    price: 'Starting ₹399'
  },
  {
    id: 3,
    title: 'Pickup & Drop Available',
    description: 'No time to visit us? We pick up your vehicle from your location and deliver it back after service. Free pickup & drop within 10 km radius.',
    image: '/images/pickup-drop.webp',
    features: ['Free Within 10 km', 'Real-time Tracking', 'Same Day Return', 'Insured Transport'],
    price: 'FREE'
  }
]

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeService, setActiveService] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveService(prev => (prev + 1) % services.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [])

  const openServiceModal = (service) => {
    setShowModal(service)
    clearInterval(timerRef.current)
  }

  const closeServiceModal = () => {
    setShowModal(null)
    timerRef.current = setInterval(() => {
      setActiveService(prev => (prev + 1) % services.length)
    }, 3000)
  }

  const fetchDashboardData = async () => {
    try {
      const [vehiclesRes, bookingsRes, notificationsRes] = await Promise.all([
        api.vehicles.getAll().catch(() => ({ data: { vehicles: [] } })),
        api.bookings.getAll({ limit: 5 }).catch(() => ({ data: { bookings: [] } })),
        api.notifications.getAll({ limit: 5 }).catch(() => ({ data: { notifications: [] } }))
      ])

      const vehicles = vehiclesRes.data.vehicles || vehiclesRes.data || []
      const bookings = bookingsRes.data.bookings || bookingsRes.data || []
      const notifications = notificationsRes.data.notifications || notificationsRes.data || []

      setStats({
        totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
        activeBookings: Array.isArray(bookings) ? bookings.filter(b => ['PENDING', 'CONFIRMED', 'SERVICE_IN_PROGRESS'].includes(b.status)).length : 0
      })

      setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 5) : [])
      setRecentNotifications(Array.isArray(notifications) ? notifications.slice(0, 5) : [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <DashboardLayout role="customer">
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
          {/* Welcome */}
          <div className="mb-4">
            <h4 className="fw-bold">Welcome back!</h4>
            <p className="text-muted mb-0">Here's what's happening with your vehicles</p>
          </div>

          {/* Our Services - Big Cards with Auto Highlight */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Our Services</h5>
            <div className="row g-4">
              {services.map((service, index) => (
                <div className="col-lg-4 col-md-6" key={service.id}>
                  <div
                    className={`dashboard-service-card ${activeService === index ? 'active-highlight' : ''}`}
                    onClick={() => openServiceModal(service)}
                  >
                    <div className="dashboard-service-img">
                      <img src={service.image} alt={service.title} />
                      <div className="dashboard-service-price">{service.price}</div>
                      {activeService === index && <div className="dashboard-service-pulse"></div>}
                    </div>
                    <div className="dashboard-service-body">
                      <h5 className="fw-bold mb-1">{service.title}</h5>
                      <p className="mb-2">{service.description?.substring(0, 90)}...</p>
                      <small className="tap-details">
                        <i className="bi bi-info-circle me-1"></i>Tap for details
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats - Below Services */}
          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-md-6">
              <StatsCard
                icon="bi-car-front"
                title="Total Vehicles"
                value={stats.totalVehicles}
                color="primary"
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <StatsCard
                icon="bi-calendar-check"
                title="Active Bookings"
                value={stats.activeBookings}
                color="info"
              />
            </div>
          </div>

          <div className="row g-4">
            {/* Recent Bookings */}
            <div className="col-lg-8">
              <div className="card-custom p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Recent Bookings</h5>
                  <Link to="/dashboard/bookings" className="text-decoration-none">
                    View All <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>

                {recentBookings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <Link to={`/dashboard/bookings/${booking.id}`} className="text-decoration-none">
                                #{booking.id?.slice(-6).toUpperCase()}
                              </Link>
                            </td>
                            <td>{booking.ServiceType?.name || 'N/A'}</td>
                            <td>{formatDate(booking.preferredDate)}</td>
                            <td><StatusBadge status={booking.status} /></td>
                            <td>₹{booking.estimatedPrice || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-x display-4 text-muted"></i>
                    <p className="text-muted mt-2">No bookings yet</p>
                    <Link to="/dashboard/book-service" className="btn btn-accent btn-sm">
                      Book Your First Service
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="col-lg-4">
              <div className="card-custom p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Notifications</h5>
                  <Link to="/dashboard/notifications" className="text-decoration-none">
                    View All
                  </Link>
                </div>

                {recentNotifications.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`list-group-item ${!notification.isRead ? 'bg-light' : ''}`}
                      >
                        <p className="mb-1 small">{notification.message}</p>
                        <small className="text-muted">
                          {formatDate(notification.createdAt)}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-bell-slash display-4 text-muted"></i>
                    <p className="text-muted mt-2">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Auto Service Modal */}
      {showModal && (
        <div className="svc-modal-overlay" onClick={closeServiceModal}>
          <div className="svc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="svc-modal-close" onClick={closeServiceModal}>
              <i className="bi bi-x-lg"></i>
            </button>
            <div className="svc-modal-img">
              <img src={showModal.image} alt={showModal.title} />
              <div className="svc-modal-badge">{showModal.price}</div>
            </div>
            <div className="svc-modal-content">
              <h4 className="fw-bold">{showModal.title}</h4>
              <p className="mb-3">{showModal.description}</p>
              <div className="svc-modal-features">
                {showModal.features.map((f, i) => (
                  <div key={i} className="svc-modal-feature" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard/book-service" className="btn btn-accent w-100 mt-3" onClick={closeServiceModal}>
                <i className="bi bi-calendar-plus me-2"></i>Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default CustomerDashboard
