import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import api from '../../services/api'

const ServiceHistoryPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServiceHistory()
  }, [])

  const fetchServiceHistory = async () => {
    try {
      const response = await api.bookings.getAll({ status: 'COMPLETED' })
      setBookings(response.data.bookings || response.data || [])
    } catch (error) {
      console.error('Failed to fetch service history:', error)
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

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner message="Loading service history..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-clock-history me-2"></i>
        Service History
      </h4>

      {bookings.length > 0 ? (
        <div className="table-custom">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <Link to={`/dashboard/bookings/${booking.id}`} className="text-decoration-none">
                        #{booking.id?.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td>{booking.vehicle?.vehicleNumber || 'N/A'}</td>
                    <td>{booking.service?.name || 'N/A'}</td>
                    <td>{formatDate(booking.completedDate || booking.updatedAt)}</td>
                    <td>₹{booking.totalAmount || 0}</td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td>
                      {booking.invoice ? (
                        <Link
                          to={`/dashboard/invoices?booking=${booking.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-file-earmark-text me-1"></i>
                          View
                        </Link>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="bi-clock-history"
          title="No Service History"
          message="Your completed services will appear here"
          actionText="Book a Service"
          actionLink="/dashboard/book-service"
        />
      )}
    </DashboardLayout>
  )
}

export default ServiceHistoryPage
