import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import ReviewCard from '../../components/ReviewCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import api from '../../services/api'
import toast from 'react-hot-toast'

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [completedBookings, setCompletedBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    bookingId: '',
    rating: 5,
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [reviewsRes, bookingsRes] = await Promise.all([
        api.reviews.getMy().catch(() => ({ data: { reviews: [] } })),
        api.bookings.getAll({ status: 'COMPLETED' }).catch(() => ({ data: { bookings: [] } }))
      ])
      setReviews(reviewsRes.data.reviews || reviewsRes.data || [])
      setCompletedBookings(bookingsRes.data.bookings || bookingsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.bookingId) newErrors.bookingId = 'Please select a booking'
    if (!formData.comment.trim()) newErrors.comment = 'Please enter your review'
    if (formData.comment.length < 10) newErrors.comment = 'Review must be at least 10 characters'
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

    setSubmitting(true)
    try {
      await api.reviews.create(formData)
      toast.success('Review submitted successfully!')
      setShowForm(false)
      setFormData({ bookingId: '', rating: 5, comment: '' })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        className={`btn btn-sm p-0 ${i < rating ? 'text-warning' : 'text-muted'}`}
        onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
      >
        <i className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'} fs-4`}></i>
      </button>
    ))
  }

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner message="Loading reviews..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-star me-2"></i>
          My Reviews
        </h4>
        <button
          className="btn btn-accent"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Review
        </button>
      </div>

      {/* Add Review Form */}
      {showForm && (
        <div className="card-custom p-4 mb-4">
          <h5 className="fw-bold mb-3">Write a Review</h5>
          <form onSubmit={handleSubmit} className="form-custom">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Select Booking *</label>
                <select
                  className={`form-select ${errors.bookingId ? 'is-invalid' : ''}`}
                  name="bookingId"
                  value={formData.bookingId}
                  onChange={handleChange}
                >
                  <option value="">Choose a completed booking</option>
                  {completedBookings
                    .filter(booking => !reviews.some(r => r.booking?.id === booking.id))
                    .map(booking => (
                      <option key={booking.id} value={booking.id}>
                        #{booking.id?.slice(-6).toUpperCase()} - {booking.service?.name}
                      </option>
                    ))}
                </select>
                {errors.bookingId && <div className="invalid-feedback">{errors.bookingId}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Rating *</label>
                <div className="d-flex gap-1">
                  {renderStars(formData.rating)}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label">Your Review *</label>
                <textarea
                  className={`form-control ${errors.comment ? 'is-invalid' : ''}`}
                  name="comment"
                  rows="4"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Share your experience with our service..."
                ></textarea>
                {errors.comment && <div className="invalid-feedback">{errors.comment}</div>}
              </div>

              <div className="col-12">
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Submit Review
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="row g-4">
          {reviews.map((review) => (
            <div key={review.id} className="col-lg-6">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bi-star"
          title="No Reviews Yet"
          message="Share your experience by leaving a review for completed services"
          actionText="Write a Review"
          actionLink="#"
        />
      )}
    </DashboardLayout>
  )
}

export default ReviewsPage
