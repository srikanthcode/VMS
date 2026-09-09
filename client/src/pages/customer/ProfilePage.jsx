import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await api.auth.updateProfile(formData)
      updateUser(response.data.user || { ...user, ...formData })
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!validatePassword()) return

    setPasswordLoading(true)
    try {
      await api.auth.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <DashboardLayout role="customer">
      <div className="row">
        {/* Profile Info */}
        <div className="col-lg-8">
          <div className="card-custom p-4 mb-4">
            <h5 className="fw-bold mb-4">
              <i className="bi bi-person me-2"></i>
              Profile Information
            </h5>
            <form onSubmit={handleSubmit} className="form-custom">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    disabled
                  />
                  <small className="text-muted">Email cannot be changed</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
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
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-4">
              <i className="bi bi-lock me-2"></i>
              Change Password
            </h5>
            <form onSubmit={handlePasswordSubmit} className="form-custom">
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  {passwordErrors.currentPassword && (
                    <div className="invalid-feedback">{passwordErrors.currentPassword}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  {passwordErrors.newPassword && (
                    <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                  )}
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-lock me-2"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="card-custom p-4 text-center">
            <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '100px', height: '100px' }}>
              <span className="display-4 text-white">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <h5 className="fw-bold mb-1">{user?.name}</h5>
            <p className="text-muted mb-3">{user?.email}</p>
            <span className="badge bg-primary">{user?.role || 'Customer'}</span>
            <hr />
            <div className="text-start">
              <p className="mb-2">
                <i className="bi bi-telephone me-2 text-muted"></i>
                {user?.phone || 'Not provided'}
              </p>
              <p className="mb-0">
                <i className="bi bi-calendar me-2 text-muted"></i>
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
