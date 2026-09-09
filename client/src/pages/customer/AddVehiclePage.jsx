import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AddVehiclePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'BIKE',
    brand: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    fuelType: 'PETROL',
    color: '',
    currentKM: '',
    insuranceExpiry: '',
    rcNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const vehicleTypes = ['BIKE', 'SCOOTER', 'CAR', 'THREE_WHEELER']
  const fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'CNG']

  const validateForm = () => {
    const newErrors = {}
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required'
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required'
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }
    if (!formData.year) {
      newErrors.year = 'Year is required'
    } else if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Invalid year'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await api.vehicles.create(formData)
      toast.success('Vehicle added successfully!')
      navigate('/dashboard/vehicles')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="customer">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card-custom p-4">
            <h4 className="fw-bold mb-4">
              <i className="bi bi-car-front me-2"></i>
              Add New Vehicle
            </h4>

            <form onSubmit={handleSubmit} className="form-custom">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Vehicle Number *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.vehicleNumber ? 'is-invalid' : ''}`}
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="e.g., MH12AB1234"
                  />
                  {errors.vehicleNumber && <div className="invalid-feedback">{errors.vehicleNumber}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Vehicle Type *</label>
                  <select
                    className="form-select"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                  >
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Brand *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.brand ? 'is-invalid' : ''}`}
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Honda, Toyota"
                  />
                  {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Model *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.model ? 'is-invalid' : ''}`}
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Civic, Innova"
                  />
                  {errors.model && <div className="invalid-feedback">{errors.model}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Variant</label>
                  <input
                    type="text"
                    className="form-control"
                    name="variant"
                    value={formData.variant}
                    onChange={handleChange}
                    placeholder="e.g., VX, ZXi"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Year *</label>
                  <input
                    type="number"
                    className={`form-control ${errors.year ? 'is-invalid' : ''}`}
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.year && <div className="invalid-feedback">{errors.year}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Fuel Type *</label>
                  <select
                    className="form-select"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                  >
                    {fuelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-control"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g., White, Black"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Current KM Reading</label>
                  <input
                    type="number"
                    className="form-control"
                    name="currentKM"
                    value={formData.currentKM}
                    onChange={handleChange}
                    placeholder="e.g., 25000"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Insurance Expiry</label>
                  <input
                    type="date"
                    className="form-control"
                    name="insuranceExpiry"
                    value={formData.insuranceExpiry}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">RC Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="rcNumber"
                    value={formData.rcNumber}
                    onChange={handleChange}
                    placeholder="Registration Certificate Number"
                  />
                </div>

                <div className="col-12">
                  <hr />
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="btn btn-accent"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Add Vehicle
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/dashboard/vehicles')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AddVehiclePage
