import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'
import toast from 'react-hot-toast'

const VehicleDetailPage = () => {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [serviceHistory, setServiceHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicleData()
  }, [id])

  const fetchVehicleData = async () => {
    try {
      const [vehicleRes, bookingsRes] = await Promise.all([
        api.vehicles.getById(id),
        api.bookings.getAll({ vehicleId: id, limit: 10 })
      ])
      setVehicle(vehicleRes.data.vehicle || vehicleRes.data)
      setServiceHistory(bookingsRes.data.bookings || bookingsRes.data || [])
    } catch (error) {
      toast.error('Failed to load vehicle details')
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
        <LoadingSpinner message="Loading vehicle details..." />
      </DashboardLayout>
    )
  }

  if (!vehicle) {
    return (
      <DashboardLayout role="customer">
        <div className="text-center py-5">
          <i className="bi bi-exclamation-circle display-1 text-muted"></i>
          <h4 className="mt-3">Vehicle not found</h4>
          <Link to="/dashboard/vehicles" className="btn btn-accent mt-3">
            Back to Vehicles
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="mb-4">
        <Link to="/dashboard/vehicles" className="text-decoration-none">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Vehicles
        </Link>
      </div>

      <div className="row">
        {/* Vehicle Info */}
        <div className="col-lg-4">
          <div className="card-custom p-4">
            <div className="text-center mb-4">
              <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '100px', height: '100px' }}>
                <i className="bi bi-car-front display-4 text-white"></i>
              </div>
              <h4 className="fw-bold mb-1">{vehicle.vehicleNumber}</h4>
              <p className="text-muted mb-0">{vehicle.brand} {vehicle.model}</p>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Type</span>
                <span className="badge bg-primary">{vehicle.vehicleType}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Year</span>
                <span>{vehicle.year}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Fuel Type</span>
                <span>{vehicle.fuelType}</span>
              </div>
              {vehicle.variant && (
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Variant</span>
                  <span>{vehicle.variant}</span>
                </div>
              )}
              {vehicle.color && (
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Color</span>
                  <span>{vehicle.color}</span>
                </div>
              )}
              {vehicle.currentKM && (
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Current KM</span>
                  <span>{vehicle.currentKM.toLocaleString()} km</span>
                </div>
              )}
              {vehicle.rcNumber && (
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">RC Number</span>
                  <span>{vehicle.rcNumber}</span>
                </div>
              )}
            </div>

            <Link to="/dashboard/book-service" className="btn btn-accent w-100">
              <i className="bi bi-calendar-plus me-2"></i>
              Book Service
            </Link>
          </div>
        </div>

        {/* Service History */}
        <div className="col-lg-8">
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-4">
              <i className="bi bi-clock-history me-2"></i>
              Service History
            </h5>

            {serviceHistory.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceHistory.map((booking) => (
                      <tr key={booking.id}>
                        <td>{formatDate(booking.preferredDate)}</td>
                        <td>{booking.ServiceType?.name || 'N/A'}</td>
                        <td><StatusBadge status={booking.status} /></td>
                        <td>₹{booking.estimatedPrice || 0}</td>
                        <td>
                          <Link
                            to={`/dashboard/bookings/${booking.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-inbox display-4 text-muted"></i>
                <p className="text-muted mt-2">No service history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default VehicleDetailPage
