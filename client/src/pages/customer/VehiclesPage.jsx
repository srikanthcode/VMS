import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import api from '../../services/api'
import toast from 'react-hot-toast'

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await api.vehicles.getAll()
      setVehicles(response.data.vehicles || response.data || [])
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return

    try {
      await api.vehicles.delete(id)
      setVehicles(prev => prev.filter(v => v.id !== id))
      toast.success('Vehicle deleted successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle')
    }
  }

  const getFuelIcon = (fuelType) => {
    const icons = {
      'Petrol': 'bi-fuel-pump',
      'Diesel': 'bi-fuel-pump',
      'Electric': 'bi-ev-station',
      'CNG': 'bi-fuel-diesel'
    }
    return icons[fuelType] || 'bi-fuel-pump'
  }

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner message="Loading vehicles..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">My Vehicles</h4>
        <Link to="/dashboard/vehicles/add" className="btn btn-accent">
          <i className="bi bi-plus-circle me-2"></i>
          Add Vehicle
        </Link>
      </div>

      {vehicles.length > 0 ? (
        <div className="row g-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="col-lg-4 col-md-6">
              <div className="card-custom h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{vehicle.vehicleNumber}</h5>
                      <p className="text-muted mb-0">
                        {vehicle.brand} {vehicle.model}
                      </p>
                    </div>
                    <span className="badge bg-primary">{vehicle.vehicleType}</span>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Year</span>
                      <span>{vehicle.year}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Fuel Type</span>
                      <span>
                        <i className={`bi ${getFuelIcon(vehicle.fuelType)} me-1`}></i>
                        {vehicle.fuelType}
                      </span>
                    </div>
                    {vehicle.color && (
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted">Color</span>
                        <span>{vehicle.color}</span>
                      </div>
                    )}
                    {vehicle.currentKM && (
                      <div className="d-flex justify-content-between py-2">
                        <span className="text-muted">Current KM</span>
                        <span>{vehicle.currentKM.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/dashboard/vehicles/${vehicle.id}`}
                      className="btn btn-outline-primary btn-sm flex-grow-1"
                    >
                      <i className="bi bi-eye me-1"></i> View
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bi-car-front"
          title="No Vehicles Added"
          message="Add your first vehicle to start booking services"
          actionText="Add Vehicle"
          actionLink="/dashboard/vehicles/add"
        />
      )}
    </DashboardLayout>
  )
}

export default VehiclesPage
