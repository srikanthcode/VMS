const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'}`}
        style={{ color: '#ffc107' }}
      ></i>
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="review-card mb-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div className="rating mb-1">{renderStars(review.rating)}</div>
          <span className="reviewer">{review.customer?.name || 'Anonymous'}</span>
        </div>
        <span className="date">{formatDate(review.createdAt)}</span>
      </div>
      <p className="mb-0">{review.comment}</p>
      {review.adminReply && (
        <div className="mt-3 p-3 bg-light rounded">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-reply me-1"></i> Admin Reply:
          </small>
          <p className="mb-0 small">{review.adminReply}</p>
        </div>
      )}
    </div>
  )
}

export default ReviewCard
