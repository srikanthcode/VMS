import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import BookingTimeline from '../../components/BookingTimeline'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'
import toast from 'react-hot-toast'

const BookingDetailPage = () => {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooking()
  }, [id])

  const fetchBooking = async () => {
    try {
      const response = await api.bookings.getById(id)
      setBooking(response.data.booking || response.data)
    } catch (error) {
      toast.error('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    try {
      await api.bookings.cancel(id)
      setBooking(prev => ({ ...prev, status: 'CANCELLED' }))
      toast.success('Booking cancelled successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner message="Loading booking details..." />
      </DashboardLayout>
    )
  }

  if (!booking) {
    return (
      <DashboardLayout role="customer">
        <div className="text-center py-5">
          <i className="bi bi-exclamation-circle display-1 text-muted"></i>
          <h4 className="mt-3">Booking not found</h4>
          <Link to="/dashboard/bookings" className="btn btn-accent mt-3">
            Back to Bookings
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="mb-4">
        <Link to="/dashboard/bookings" className="text-decoration-none">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Bookings
        </Link>
      </div>

      <div className="row">
        {/* Booking Info */}
        <div className="col-lg-8">
          <div className="card-custom p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h4 className="fw-bold mb-1">
                  Booking #{booking.id?.slice(-6).toUpperCase()}
                </h4>
                <p className="text-muted mb-0">
                  Created on {formatDate(booking.createdAt)}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* Timeline */}
            <h5 className="fw-bold mb-3">
              <i className="bi bi-clock-history me-2"></i>
              Status Timeline
            </h5>
            <BookingTimeline
              statusHistory={booking.statusHistory}
              currentStatus={booking.status}
            />
          </div>

          {/* Service Details */}
          <div className="card-custom p-4 mb-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-gear me-2"></i>
              Service Details
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <p className="text-muted mb-1">Service Name</p>
                <p className="fw-bold mb-0">{booking.service?.name || 'N/A'}</p>
              </div>
              <div className="col-md-6">
                <p className="text-muted mb-1">Service Price</p>
                <p className="fw-bold text-primary mb-0">₹{booking.service?.price || 0}</p>
              </div>
              <div className="col-md-6">
                <p className="text-muted mb-1">Preferred Date</p>
                <p className="fw-bold mb-0">{formatDate(booking.preferredDate)}</p>
              </div>
              <div className="col-md-6">
                <p className="text-muted mb-1">Preferred Time</p>
                <p className="fw-bold mb-0">{booking.preferredTime || 'Flexible'}</p>
              </div>
              {booking.additionalNotes && (
                <div className="col-12">
                  <p className="text-muted mb-1">Additional Notes</p>
                  <p className="mb-0">{booking.additionalNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Info */}
          {booking.vehicle && (
            <div className="card-custom p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-car-front me-2"></i>
                Vehicle Details
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <p className="text-muted mb-1">Vehicle Number</p>
                  <p className="fw-bold mb-0">{booking.vehicle.vehicleNumber}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Vehicle</p>
                  <p className="fw-bold mb-0">
                    {booking.vehicle.brand} {booking.vehicle.model}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Type</p>
                  <p className="fw-bold mb-0">{booking.vehicle.vehicleType}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Fuel Type</p>
                  <p className="fw-bold mb-0">{booking.vehicle.fuelType}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Payment Info */}
          <div className="card-custom p-4 mb-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-credit-card me-2"></i>
              Payment Summary
            </h5>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Service Cost</span>
              <span>₹{booking.service?.price || 0}</span>
            </div>
            {booking.pickupCharge > 0 && (
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span>Pickup Charge</span>
                <span>₹{booking.pickupCharge}</span>
              </div>
            )}
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Tax</span>
              <span>₹{booking.tax || 0}</span>
            </div>
            <div className="d-flex justify-content-between py-2">
              <span className="fw-bold">Total Amount</span>
              <span className="h5 text-primary mb-0">₹{booking.totalAmount || 0}</span>
            </div>

            <div className="mt-3">
              <span className="badge bg-secondary me-2">Payment Status:</span>
              <StatusBadge status={booking.paymentStatus || 'UNPAID'} />
            </div>
          </div>

          {/* Mechanic Info */}
          {booking.mechanic && (
            <div className="card-custom p-4 mb-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-person-gear me-2"></i>
                Assigned Mechanic
              </h5>
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                  <span className="text-white fw-bold">
                    {booking.mechanic.name?.charAt(0) || 'M'}
                  </span>
                </div>
                <div>
                  <p className="fw-bold mb-0">{booking.mechanic.name}</p>
                  <small className="text-muted">{booking.mechanic.phone || 'Contact via platform'}</small>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-3">Actions</h5>
            <div className="d-grid gap-2">
              {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                <button
                  className="btn btn-outline-danger"
                  onClick={handleCancel}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel Booking
                </button>
              )}
              {booking.status === 'COMPLETED' && booking.paymentStatus !== 'PAID' && (
                <Link to={`/dashboard/payments?booking=${booking.id}`} className="btn btn-accent">
                  <i className="bi bi-credit-card me-2"></i>
                  Make Payment
                </Link>
              )}
              {booking.status === 'COMPLETED' && (
                <Link to={`/dashboard/reviews?booking=${booking.id}`} className="btn btn-outline-primary">
                  <i className="bi bi-star me-2"></i>
                  Leave Review
                </Link>
              )}
              <Link to="/dashboard/book-service" className="btn btn-outline-secondary">
                <i className="bi bi-calendar-plus me-2"></i>
                Book Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default BookingDetailPage
