import { useState, useEffect } from 'react'
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
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

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

          {/* Stats */}
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

          {/* Our Services - Auto Scroll */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Our Services</h5>
            <div className="dashboard-services-scroll">
              <div className="dashboard-services-track">
                {[...services, ...services, ...services].map((service, index) => (
                  <div className="dashboard-services-item" key={index}>
                    <div
                      className="service-showcase-card"
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="service-showcase-img">
                        <img src={service.image} alt={service.title} />
                        <div className="service-showcase-overlay">
                          <span className="service-showcase-price">{service.price}</span>
                        </div>
                      </div>
                      <div className="service-showcase-body">
                        <h6 className="fw-bold">{service.title}</h6>
                        <p className="text-muted small mb-2">{service.description?.substring(0, 80)}...</p>
                        <small className="text-accent fw-500">
                          <i className="bi bi-info-circle me-1"></i>Tap for details
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Detail Modal */}
          {selectedService && (
            <div className="service-modal-overlay" onClick={() => setSelectedService(null)}>
              <div className="service-modal" onClick={(e) => e.stopPropagation()}>
                <button className="service-modal-close" onClick={() => setSelectedService(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
                <div className="service-modal-img">
                  <img src={selectedService.image} alt={selectedService.title} />
                  <div className="service-modal-price">{selectedService.price}</div>
                </div>
                <div className="service-modal-body">
                  <h4 className="fw-bold mb-2">{selectedService.title}</h4>
                  <p className="mb-3">{selectedService.description}</p>
                  <h6 className="fw-bold mb-2">Features:</h6>
                  <ul className="list-unstyled mb-3">
                    {selectedService.features.map((feature, i) => (
                      <li key={i} className="mb-1">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/dashboard/book-service" className="btn btn-accent w-100" onClick={() => setSelectedService(null)}>
                    <i className="bi bi-calendar-plus me-2"></i>
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          )}

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
    </DashboardLayout>
  )
}

export default CustomerDashboard
