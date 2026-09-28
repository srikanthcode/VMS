import DashboardLayout from '../../components/DashboardLayout'
import LiveLocationShare from '../../components/LiveLocationShare'
import { useEffect, useState, useCallback } from 'react'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import { Link } from 'react-router-dom'

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.display_name || null
  } catch {
    return null
  }
}

const ShareLocationPage = () => {
  const [pickupBookings, setPickupBookings] = useState([])
  const [activeBookingId, setActiveBookingId] = useState(null)
  const [liveAddress, setLiveAddress] = useState(null)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = useCallback(async () => {
    try {
      const res = await api.bookings.getAll()
      const bookings = res.data.bookings || res.data || []
      const pickups = bookings.filter(b => b.pickupRequired && !['COMPLETED', 'CANCELLED'].includes(b.status))
      setPickupBookings(pickups)
      setLastRefresh(new Date())
      if (pickups.length > 0) {
        setActiveBookingId(prev => (prev && pickups.some(b => b.id === prev) ? prev : pickups[0].id))
      } else {
        setActiveBookingId(null)
      }
    } catch {
      setPickupBookings([])
    }
  }, [])

  useEffect(() => {
    load()
    const refresh = () => load()
    window.addEventListener('vms:booking', refresh)
    window.addEventListener('vms:location', refresh)
    const timer = setInterval(load, 10000)
    return () => {
      window.removeEventListener('vms:booking', refresh)
      window.removeEventListener('vms:location', refresh)
      clearInterval(timer)
    }
  }, [load])

  const activeBooking = pickupBookings.find(b => b.id === activeBookingId) || null

  useEffect(() => {
    const booking = activeBooking
    if (!booking) {
      setLiveAddress(null)
      return
    }
    const lat = parseFloat(booking.pickupLatitude)
    const lng = parseFloat(booking.pickupLongitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      setLoadingAddress(true)
      reverseGeocode(lat, lng).then(addr => {
        setLiveAddress(addr)
        setLoadingAddress(false)
      })
    } else {
      setLiveAddress(null)
    }
  }, [activeBooking])

  const fmtTime = (t) => {
    if (!t) return '—'
    const m = String(t).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (!m) return t
    let h = parseInt(m[1], 10)
    const mer = (m[3] || '').toUpperCase()
    if (mer === 'PM' && h < 12) h += 12
    if (mer === 'AM' && h === 12) h = 0
    return `${h}:${m[2]}`
  }

  return (
    <DashboardLayout role="customer">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="mb-4 d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h4 className="fw-bold mb-1">
                <i className="bi bi-broadcast me-2 text-danger"></i>
                Share Live Location
              </h4>
              <p className="text-muted mb-0">
                Share your real-time location so admin and mechanic can pick up your vehicle.
              </p>
            </div>
            <small className="text-muted">
              <i className="bi bi-arrow-clockwise me-1"></i>
              Auto-updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </small>
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
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-box-seam me-2"></i>
                  Active Pickup Bookings
                  <span className="badge bg-accent ms-2">{pickupBookings.length}</span>
                </h6>
                <span className="badge bg-success bg-opacity-10 text-success">
                  <span className="d-inline-block rounded-circle bg-success me-1" style={{ width: 7, height: 7 }}></span>
                  Live
                </span>
              </div>

              {pickupBookings.map(b => {
                const isActive = b.id === activeBookingId
                const hasCoords = !isNaN(parseFloat(b.pickupLatitude)) && !isNaN(parseFloat(b.pickupLongitude))
                return (
                  <div
                    key={b.id}
                    className={`pickup-booking-row p-3 mb-2 rounded border ${isActive ? 'border-accent bg-accent bg-opacity-10' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                      <div>
                        <Link to={`/dashboard/bookings/${b.id}`} className="fw-bold text-decoration-none">
                          #{b.bookingId || b.id}
                        </Link>
                        <span className="text-muted small ms-2">
                          <i className="bi bi-gear me-1"></i>
                          {b.ServiceType?.name || 'Service'}
                        </span>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="row g-2 small">
                      <div className="col-md-6">
                        <div className="text-muted mb-1">
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                          <strong>Pickup Address</strong>
                        </div>
                        <div>{b.pickupAddress || 'Address on booking'}</div>
                        {b.pickupLandmark && (
                          <div className="text-muted">
                            <i className="bi bi-bookmark me-1"></i>
                            Landmark: {b.pickupLandmark}
                          </div>
                        )}
                        {isActive && hasCoords && (
                          <div className="text-muted mt-1">
                            <i className="bi bi-crosshair me-1"></i>
                            {loadingAddress ? (
                              <span>Resolving real address from GPS…</span>
                            ) : liveAddress ? (
                              <span>
                                <strong>Live location:</strong> {liveAddress}
                                {' '}
                                <a
                                  href={`https://www.google.com/maps?q=${b.pickupLatitude},${b.pickupLongitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  (Open map)
                                </a>
                              </span>
                            ) : (
                              <span>GPS: {parseFloat(b.pickupLatitude).toFixed(5)}, {parseFloat(b.pickupLongitude).toFixed(5)}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="col-md-3">
                        <div className="text-muted mb-1">
                          <i className="bi bi-clock text-primary me-1"></i>
                          <strong>Pickup Time</strong>
                        </div>
                        <div>
                          {b.pickupTime || b.preferredTime || '—'}
                          {b.preferredDate && (
                            <div className="text-muted">
                              {new Date(b.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-muted mb-1">
                          <i className="bi bi-telephone text-success me-1"></i>
                          <strong>Contact</strong>
                        </div>
                        <div>
                          {b.pickupContact || b.user?.phone || '—'}
                          {b.user?.name && <div className="text-muted">{b.user.name}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ShareLocationPage