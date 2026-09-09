import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import api from '../../services/api'

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeBookings: 0,
    completedServices: 0,
    pendingPayments: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(true)

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
        activeBookings: Array.isArray(bookings) ? bookings.filter(b => ['PENDING', 'CONFIRMED', 'SERVICE_IN_PROGRESS'].includes(b.status)).length : 0,
        completedServices: Array.isArray(bookings) ? bookings.filter(b => b.status === 'COMPLETED').length : 0,
        pendingPayments: Array.isArray(bookings) ? bookings.filter(b => b.paymentStatus !== 'PAID' && b.status === 'COMPLETED').length : 0
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
            <div className="col-lg-3 col-md-6">
              <StatsCard
                icon="bi-check-circle"
                title="Completed Services"
                value={stats.completedServices}
                color="success"
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <StatsCard
                icon="bi-credit-card"
                title="Pending Payments"
                value={stats.pendingPayments}
                color="warning"
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

          {/* Quick Actions */}
          <div className="row g-4 mt-2">
            <div className="col-lg-3 col-md-6">
              <Link to="/dashboard/vehicles/add" className="text-decoration-none">
                <div className="card-custom p-4 text-center">
                  <i className="bi bi-plus-circle display-4 text-primary"></i>
                  <h6 className="mt-2 mb-0">Add Vehicle</h6>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link to="/dashboard/book-service" className="text-decoration-none">
                <div className="card-custom p-4 text-center">
                  <i className="bi bi-calendar-plus display-4 text-success"></i>
                  <h6 className="mt-2 mb-0">Book Service</h6>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link to="/dashboard/bills" className="text-decoration-none">
                <div className="card-custom p-4 text-center">
                  <i className="bi bi-receipt display-4 text-warning"></i>
                  <h6 className="mt-2 mb-0">View Bills</h6>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link to="/dashboard/service-history" className="text-decoration-none">
                <div className="card-custom p-4 text-center">
                  <i className="bi bi-clock-history display-4 text-info"></i>
                  <h6 className="mt-2 mb-0">Service History</h6>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}

export default CustomerDashboard
