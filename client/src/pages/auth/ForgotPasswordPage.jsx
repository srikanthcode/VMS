import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid')
      return false
    }
    setError('')
    return true
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!validateEmail()) return

    setLoading(true)
    try {
      const response = await api.auth.forgotPassword({ email })
      toast.success(response.message || 'OTP sent to your email!')
      setStep(2)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleOTPPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
      setOtp(newOtp)
      const lastFilledIndex = Math.min(pastedData.length, 5)
      const nextInput = document.getElementById(`otp-${lastFilledIndex}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    setLoading(true)
    try {
      await api.auth.verifyOTP({ email, otp: otpString })
      toast.success('OTP verified successfully!')
      setStep(3)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.auth.resetPassword({ email, newPassword })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
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
          <p className="text-muted">
            {step === 1 && 'Reset your password'}
            {step === 2 && 'Enter verification code'}
            {step === 3 && 'Create new password'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="form-custom">
            <p className="mb-4" style={{ color: '#8a94a6' }}>
              Enter your email address and we'll send you a verification code.
            </p>

            <div className="mb-4">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Enter your email"
                />
                {error && <div className="invalid-feedback">{error}</div>}
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
                  Sending OTP...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Send OTP
                </>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="form-custom">
            <p className="mb-4" style={{ color: '#8a94a6' }}>
              We've sent a 6-digit code to <strong style={{ color: '#ffffff' }}>{email}</strong>
            </p>

            <div className="mb-4">
              <label className="form-label">Enter OTP</label>
              <div className="d-flex gap-2 justify-content-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    className="form-control text-center"
                    style={{
                      width: '50px',
                      height: '55px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      background: '#2a2a4a',
                      border: digit ? '2px solid #e94560' : '2px solid #3a3a5a',
                      color: '#ffffff'
                    }}
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={handleOTPPaste}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-accent w-100 py-3 mb-3"
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Verify OTP
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="btn btn-link"
                style={{ color: '#8a94a6' }}
                onClick={handleSendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="form-custom">
            <p className="mb-4" style={{ color: '#8a94a6' }}>
              Create a new password for your account.
            </p>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
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
                  Resetting...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-all me-2"></i>
                  Reset Password
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-decoration-none" style={{ color: '#8a94a6' }}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
