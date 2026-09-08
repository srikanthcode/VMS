import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import api from '../../services/api'
import toast from 'react-hot-toast'

const BookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.bookings.getAll()
      setBookings(response.data.bookings || response.data || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    try {
      await api.bookings.cancel(id)
      setBookings(prev => prev.map(b => 
        b.id === id ? { ...b, status: 'CANCELLED' } : b
      ))
      toast.success('Booking cancelled successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'ALL' || booking.status === filter
    const matchesSearch = 
      booking.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle?.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner message="Loading bookings..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">My Bookings</h4>
        <Link to="/dashboard/book-service" className="btn btn-accent">
          <i className="bi bi-plus-circle me-2"></i>
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="card-custom p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2 flex-wrap">
              {['ALL', 'PENDING', 'CONFIRMED', 'SERVICE_IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                <button
                  key={status}
                  className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(status)}
                >
                  {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="row g-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="col-lg-6">
              <div className="card-custom h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1">
                        #{booking.id?.slice(-6).toUpperCase()}
                      </h6>
                      <p className="text-muted mb-0 small">
                        {booking.service?.name || 'N/A'}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="my-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-car-front text-muted me-2"></i>
                      <span>{booking.vehicle?.vehicleNumber || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar text-muted me-2"></i>
                      <span>{formatDate(booking.preferredDate)}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-clock text-muted me-2"></i>
                      <span>{booking.preferredTime || 'Flexible'}</span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="h5 text-primary mb-0">₹{booking.totalAmount || 0}</span>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/dashboard/bookings/${booking.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Details
                      </Link>
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bi-calendar-x"
          title="No Bookings Found"
          message={searchTerm || filter !== 'ALL' ? 'No bookings match your criteria' : "You haven't made any bookings yet"}
          actionText={!searchTerm && filter === 'ALL' ? 'Book a Service' : undefined}
          actionLink={!searchTerm && filter === 'ALL' ? '/dashboard/book-service' : undefined}
        />
      )}
    </DashboardLayout>
  )
}

export default BookingsPage
