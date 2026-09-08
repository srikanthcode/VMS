import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits starting with 6-9'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by auth context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-slideUp">
        <div className="logo">
          <i className="bi bi-tools"></i>
          <h2>Vehicle Management System</h2>
          <p className="text-muted">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="form-custom">
          <div className="mb-2">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-telephone"></i>
              </span>
              <input
                type="tel"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-accent w-100 py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating Account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
