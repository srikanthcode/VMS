import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import toast from 'react-hot-toast'

const AdminSettingsPage = () => {
  const [formData, setFormData] = useState({
    companyName: 'Vehicle Management System',
    address: '123 Service Street, Auto Nagar, City - 500001',
    phone: '+91 98765 43210',
    email: 'info@vms.com',
    businessHours: 'Mon - Sat: 8:00 AM - 8:00 PM',
    currency: 'INR',
    taxRate: 18,
    pickupCharge: 100
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <h4 className="fw-bold mb-4">Settings</h4>

      <div className="row">
        <div className="col-lg-8">
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-4">Company Information</h5>
            <form onSubmit={handleSubmit} className="form-custom">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Business Hours</label>
                  <input
                    type="text"
                    className="form-control"
                    name="businessHours"
                    value={formData.businessHours}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Pickup Charge (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="pickupCharge"
                    value={formData.pickupCharge}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-3">Quick Info</h5>
            <div className="text-center mb-3">
              <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-tools display-4 text-white"></i>
              </div>
              <h6>{formData.companyName}</h6>
            </div>
            <div className="small">
              <p className="mb-2"><i className="bi bi-geo-alt me-2 text-muted"></i>{formData.address}</p>
              <p className="mb-2"><i className="bi bi-telephone me-2 text-muted"></i>{formData.phone}</p>
              <p className="mb-2"><i className="bi bi-envelope me-2 text-muted"></i>{formData.email}</p>
              <p className="mb-0"><i className="bi bi-clock me-2 text-muted"></i>{formData.businessHours}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminSettingsPage
