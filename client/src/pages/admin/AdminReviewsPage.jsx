import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [reply, setReply] = useState('')
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await api.reviews.getAll()
      setReviews(response.data.reviews || response.data || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!selectedReview || !reply.trim()) return

    setReplying(true)
    try {
      await api.reviews.update(selectedReview.id, { adminReply: reply })
      setReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, adminReply: reply } : r))
      toast.success('Reply added successfully')
      setShowReplyModal(false)
      setSelectedReview(null)
      setReply('')
    } catch (error) {
      toast.error('Failed to add reply')
    } finally {
      setReplying(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'} text-warning`}></i>
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const columns = [
    { key: 'customer', label: 'Customer', render: (val) => val?.name || 'N/A' },
    { key: 'rating', label: 'Rating', render: (val) => <div>{renderStars(val)}</div> },
    { key: 'comment', label: 'Review', render: (val) => <p className="mb-0" style={{ maxWidth: '300px' }}>{val}</p> },
    { key: 'adminReply', label: 'Reply', render: (val) => val || <span className="text-muted">No reply</span> },
    { key: 'createdAt', label: 'Date', render: (val) => formatDate(val), sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button className="btn btn-sm btn-outline-primary" onClick={() => { setSelectedReview(row); setShowReplyModal(true) }}>
          <i className="bi bi-reply"></i>
        </button>
      )
    }
  ]

  return (
    <DashboardLayout role="admin">
      <h4 className="fw-bold mb-4">Reviews</h4>
      <DataTable columns={columns} data={reviews} loading={loading} />

      <Modal
        show={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title="Reply to Review"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowReplyModal(false)}>Cancel</button>
            <button type="button" className="btn btn-accent" onClick={handleReply} disabled={replying || !reply.trim()}>
              {replying ? 'Sending...' : 'Send Reply'}
            </button>
          </>
        }
      >
        {selectedReview && (
          <div>
            <div className="mb-3 p-3 bg-light rounded">
              <div className="d-flex justify-content-between mb-2">
                <strong>{selectedReview.customer?.name}</strong>
                <div>{renderStars(selectedReview.rating)}</div>
              </div>
              <p className="mb-0">{selectedReview.comment}</p>
            </div>
            <div className="mb-3">
              <label className="form-label">Your Reply</label>
              <textarea
                className="form-control"
                rows="3"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your reply..."
              ></textarea>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

export default AdminReviewsPage
