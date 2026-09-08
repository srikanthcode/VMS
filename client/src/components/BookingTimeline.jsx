const BookingTimeline = ({ statusHistory, currentStatus }) => {
  const statusConfig = {
    PENDING: { color: '#ffc107', icon: 'bi-clock', label: 'Pending' },
    CONFIRMED: { color: '#17a2b8', icon: 'bi-check-circle', label: 'Confirmed' },
    PICKUP_SCHEDULED: { color: '#6f42c1', icon: 'bi-truck', label: 'Pickup Scheduled' },
    PICKED_UP: { color: '#fd7e14', icon: 'bi-truck', label: 'Picked Up' },
    SERVICE_IN_PROGRESS: { color: '#007bff', icon: 'bi-gear', label: 'In Progress' },
    COMPLETED: { color: '#28a745', icon: 'bi-check-circle-fill', label: 'Completed' },
    DELIVERED: { color: '#20c997', icon: 'bi-house', label: 'Delivered' },
    CANCELLED: { color: '#dc3545', icon: 'bi-x-circle', label: 'Cancelled' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="timeline">
      {statusHistory && statusHistory.length > 0 ? (
        statusHistory.map((entry, index) => {
          const config = statusConfig[entry.status] || statusConfig.PENDING
          const isLast = index === statusHistory.length - 1
          const isActive = entry.status === currentStatus

          return (
            <div
              key={index}
              className={`timeline-item ${isLast ? 'active' : 'completed'}`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i
                      className={`bi ${config.icon}`}
                      style={{ color: config.color, fontSize: '1.2rem' }}
                    ></i>
                    <span
                      className="badge"
                      style={{ backgroundColor: config.color, color: 'white' }}
                    >
                      {config.label}
                    </span>
                    {isActive && (
                      <span className="badge bg-primary">Current</span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-muted mb-0 mt-1 small">{entry.notes}</p>
                  )}
                  {entry.updatedBy && (
                    <small className="text-muted">
                      Updated by: {entry.updatedBy.name || 'System'}
                    </small>
                  )}
                </div>
                <small className="text-muted">
                  {formatDate(entry.timestamp || entry.updatedAt)}
                </small>
              </div>
            </div>
          )
        })
      ) : (
        <div className="timeline-item active">
          <div className="d-flex align-items-center gap-2">
            <i
              className={`bi ${statusConfig[currentStatus]?.icon || 'bi-clock'}`}
              style={{ color: statusConfig[currentStatus]?.color || '#ffc107', fontSize: '1.2rem' }}
            ></i>
            <span
              className="badge"
              style={{
                backgroundColor: statusConfig[currentStatus]?.color || '#ffc107',
                color: 'white'
              }}
            >
              {statusConfig[currentStatus]?.label || currentStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingTimeline
