import DashboardLayout from '../../components/DashboardLayout'
import LiveLocationShare from '../../components/LiveLocationShare'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import { Link } from 'react-router-dom'

const ShareLocationPage = () => {
  const [pickupBookings, setPickupBookings] = useState([])
  const [activeBookingId, setActiveBookingId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.bookings.getAll()
        const bookings = res.data.bookings || res.data || []
        const pickups = bookings.filter(b => b.pickupRequired && !['COMPLETED', 'CANCELLED'].includes(b.status))
        setPickupBookings(pickups)
        if (pickups.length > 0) setActiveBookingId(pickups[0].id)
      } catch {
        setPickupBookings([])
      }
    }
    load()
  }, [])

  return (
    <DashboardLayout role="customer">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="mb-4">
            <h4 className="fw-bold mb-1">
              <i className="bi bi-broadcast me-2 text-danger"></i>
              Share Live Location
            </h4>
            <p className="text-muted mb-0">
              Share your real-time Google Maps location so admin and mechanic can pick up your vehicle.
            </p>
          </div>

          {pickupBookings.length > 1 && (
            <div className="mb-3">
              <label className="form-label">Select pickup booking</label>
              <select
                className="form-select"
                value={activeBookingId || ''}
                onChange={(e) => setActiveBookingId(Number(e.target.value))}
              >
                {pickupBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    #{b.bookingId || b.id} — {b.ServiceType?.name || 'Service'} ({b.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <LiveLocationShare bookingId={activeBookingId} />

          {pickupBookings.length === 0 && (
            <div className="card-custom p-4 mt-4 text-center">
              <i className="bi bi-calendar-x display-6 text-muted"></i>
              <p className="mt-2 mb-3 text-muted">No active pickup bookings found.</p>
              <Link to="/dashboard/book-service" className="btn btn-accent">
                <i className="bi bi-calendar-plus me-2"></i>
                Book Pickup & Drop
              </Link>
            </div>
          )}

          {pickupBookings.length > 0 && (
            <div className="card-custom p-4 mt-4">
              <h6 className="fw-bold mb-3">Active Pickup Bookings</h6>
              {pickupBookings.map(b => (
                <div key={b.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <Link to={`/dashboard/bookings/${b.id}`} className="fw-bold text-decoration-none">
                      #{b.bookingId || b.id}
                    </Link>
                    <div className="small text-muted">{b.pickupAddress || 'Address on booking'}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ShareLocationPage
