import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  COUNTRY_CODES,
  getExpectedLength,
  getPhoneError,
  getPhoneStatus,
  normalizePhone
} from '../../utils/phoneValidator'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [countryCode, setCountryCode] = useState('+91')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [phoneTouched, setPhoneTouched] = useState(false)

  const expectedLen = getExpectedLength(countryCode)
  const phoneStatus = getPhoneStatus(formData.phone, countryCode)

  // Real-time phone validation while typing
  const livePhoneError = getPhoneError(formData.phone, countryCode, {
    showRequired: phoneTouched
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    const phoneError = getPhoneError(formData.phone, countryCode, { showRequired: true })
    if (phoneError) {
      newErrors.phone = phoneError
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
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

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, expectedLen + 2)
    setFormData(prev => ({ ...prev, phone: digitsOnly }))
    setPhoneTouched(true)
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
  }

  const handleCountryChange = (e) => {
    const newCode = e.target.value
    setCountryCode(newCode)
    setPhoneTouched(true)
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPhoneTouched(true)
    if (!validateForm()) return

    setLoading(true)
    try {
      await register({
        username: formData.username,
        email: formData.email,
        phone: normalizePhone(formData.phone, countryCode),
        countryCode,
        password: formData.password
      })
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (error) {
      const msg = error.response?.data?.message || ''
      if (msg.includes('already registered') || msg.includes('already taken')) {
        toast.error(msg + ' Redirecting to login...')
        setTimeout(() => navigate('/login'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const showPhoneError = errors.phone || (phoneTouched && livePhoneError)
  const phoneIsComplete = phoneStatus.valid

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-md animate-slideUp">
        <Link to="/" className="back-home">
          <i className="bi bi-arrow-left"></i> Home
        </Link>
        <div className="logo">
          <i className="bi bi-tools"></i>
          <h2>Vehicle Management System</h2>
          <p className="text-muted">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="form-custom">
          <div className="mb-2">
            <label className="form-label">Username</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Email Address</label>
            <div className="input-group input-group-sm">
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
            <div className="input-group input-group-sm">
              <select
                className={`form-select ${showPhoneError ? 'is-invalid' : ''}`}
                style={{ maxWidth: '120px', minWidth: '100px' }}
                value={countryCode}
                onChange={handleCountryChange}
                aria-label="Country code"
              >
                {COUNTRY_CODES.map((c, i) => (
                  <option key={`${c.code}-${c.country}-${i}`} value={c.code}>
                    {c.code} {c.country}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                className={`form-control ${showPhoneError ? 'is-invalid' : phoneIsComplete ? 'is-valid' : ''}`}
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                onFocus={() => setPhoneTouched(true)}
                placeholder={`Enter ${expectedLen} digits`}
                maxLength={expectedLen + 2}
                aria-describedby="phoneHelp"
              />
              <span
                className={`input-group-text ${
                  phoneStatus.color === 'success'
                    ? 'bg-success text-white'
                    : phoneStatus.color === 'danger'
                    ? 'bg-danger text-white'
                    : phoneStatus.color === 'warning'
                    ? 'bg-warning'
                    : ''
                }`}
                style={{ minWidth: '58px', justifyContent: 'center', fontSize: '0.8rem' }}
              >
                {phoneStatus.current}/{expectedLen}
              </span>
            </div>

            {showPhoneError ? (
              <div className="text-danger mt-1" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-exclamation-circle me-1"></i>
                {showPhoneError}
              </div>
            ) : phoneIsComplete ? (
              <div className="text-success mt-1" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-check-circle me-1"></i>
                Valid phone number
              </div>
            ) : (
              <div className="text-muted mt-1" id="phoneHelp" style={{ fontSize: '0.78rem' }}>
                {countryCode} requires exactly {expectedLen} digits
                {formData.phone.length > 0 && !phoneIsComplete
                  ? ` — ${expectedLen - phoneStatus.current} more needed`
                  : ''}
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="form-label">Password</label>
            <div className="input-group input-group-sm">
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
            <div className="input-group input-group-sm">
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
            className="btn btn-accent w-100 py-2"
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

        <div className="text-center mt-3">
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
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
