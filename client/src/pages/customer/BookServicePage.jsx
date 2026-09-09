import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'

const BookServicePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedServiceId = location.state?.serviceId

  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceTypeId: preselectedServiceId || '',
    preferredDate: '',
    preferredTime: '',
    pickupRequired: false,
    pickupAddress: '',
    additionalNotes: ''
  })
  const [vehicles, setVehicles] = useState([])
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.serviceTypeId && services.length > 0) {
      const service = services.find(s => s.id === formData.serviceTypeId)
      setSelectedService(service)
    }
  }, [formData.serviceTypeId, services])

  const fetchData = async () => {
    try {
      const [vehiclesRes, servicesRes] = await Promise.all([
        api.vehicles.getAll(),
        api.services.getAll()
      ])
      setVehicles(vehiclesRes.data.vehicles || vehiclesRes.data || [])
      setServices(servicesRes.data.services || servicesRes.data || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.vehicleId) newErrors.vehicleId = 'Please select a vehicle'
    if (!formData.serviceTypeId) newErrors.serviceTypeId = 'Please select a service'
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select a date'
    } else {
      const selectedDate = new Date(formData.preferredDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.preferredDate = 'Date cannot be in the past'
      }
    }
    if (!formData.preferredTime) newErrors.preferredTime = 'Please select a time'
    if (formData.pickupRequired && !formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'Please enter pickup address'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await api.bookings.create({
        vehicleId: formData.vehicleId,
        serviceTypeId: formData.serviceTypeId,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        pickupRequired: formData.pickupRequired,
        pickupAddress: formData.pickupAddress,
        additionalNotes: formData.additionalNotes
      })
      toast.success('Booking created successfully!')
      navigate('/dashboard/bookings')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ]

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="text-center p-5">
          <div className="spinner-border text-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card-custom p-4">
            <h4 className="fw-bold mb-4">
              <i className="bi bi-calendar-plus me-2"></i>
              Book a Service
            </h4>

            <form onSubmit={handleSubmit} className="form-custom">
              <div className="row g-3">
                {/* Vehicle Selection */}
                <div className="col-md-6">
                  <label className="form-label">Select Vehicle *</label>
                  <select
                    className={`form-select ${errors.vehicleId ? 'is-invalid' : ''}`}
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                  >
                    <option value="">Choose your vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                  </select>
                  {errors.vehicleId && <div className="invalid-feedback">{errors.vehicleId}</div>}
                  {vehicles.length === 0 && (
                    <small className="text-muted">
                      No vehicles found. <a href="/dashboard/vehicles/add">Add a vehicle</a>
                    </small>
                  )}
                </div>

                {/* Service Selection */}
                <div className="col-md-6">
                  <label className="form-label">Select Service *</label>
                  <select
                    className={`form-select ${errors.serviceTypeId ? 'is-invalid' : ''}`}
                    name="serviceTypeId"
                    value={formData.serviceTypeId}
                    onChange={handleChange}
                  >
                    <option value="">Choose a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.price}
                      </option>
                    ))}
                  </select>
                  {errors.serviceTypeId && <div className="invalid-feedback">{errors.serviceTypeId}</div>}
                </div>

                {/* Date and Time */}
                <div className="col-md-6">
                  <label className="form-label">Preferred Date *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.preferredDate ? 'is-invalid' : ''}`}
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.preferredDate && <div className="invalid-feedback">{errors.preferredDate}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Preferred Time *</label>
                  <select
                    className={`form-select ${errors.preferredTime ? 'is-invalid' : ''}`}
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.preferredTime && <div className="invalid-feedback">{errors.preferredTime}</div>}
                </div>

                {/* Pickup */}
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="pickupRequired"
                      name="pickupRequired"
                      checked={formData.pickupRequired}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="pickupRequired">
                      Require Pickup & Drop Service
                    </label>
                  </div>
                </div>

                {formData.pickupRequired && (
                  <div className="col-12">
                    <label className="form-label">Pickup Address *</label>
                    <textarea
                      className={`form-control ${errors.pickupAddress ? 'is-invalid' : ''}`}
                      name="pickupAddress"
                      rows="2"
                      value={formData.pickupAddress}
                      onChange={handleChange}
                      placeholder="Enter your pickup address"
                    ></textarea>
                    {errors.pickupAddress && <div className="invalid-feedback">{errors.pickupAddress}</div>}
                  </div>
                )}

                {/* Notes */}
                <div className="col-12">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-control"
                    name="additionalNotes"
                    rows="3"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    placeholder="Any specific requirements or issues to mention..."
                  ></textarea>
                </div>

                {/* Summary */}
                {selectedService && (
                  <div className="col-12">
                    <div className="bg-light rounded-3 p-3">
                      <h6 className="fw-bold mb-2">Booking Summary</h6>
                      <div className="d-flex justify-content-between">
                        <span>Service:</span>
                        <span className="fw-bold">{selectedService.name}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Estimated Cost:</span>
                        <span className="fw-bold text-primary">₹{selectedService.price}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Duration:</span>
                        <span>{selectedService.duration || '60'} minutes</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="col-12">
                  <hr />
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="btn btn-accent"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating Booking...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Confirm Booking
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(-1)}
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

export default BookServicePage
