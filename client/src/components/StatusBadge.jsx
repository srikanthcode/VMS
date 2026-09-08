const StatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { class: 'badge-pending', label: 'Pending' },
    CONFIRMED: { class: 'badge-confirmed', label: 'Confirmed' },
    SERVICE_IN_PROGRESS: { class: 'badge-in-progress', label: 'In Progress' },
    COMPLETED: { class: 'badge-completed', label: 'Completed' },
    CANCELLED: { class: 'badge-cancelled', label: 'Cancelled' },
    ACTIVE: { class: 'badge-completed', label: 'Active' },
    INACTIVE: { class: 'badge-cancelled', label: 'Inactive' },
    PAID: { class: 'badge-completed', label: 'Paid' },
    UNPAID: { class: 'badge-pending', label: 'Unpaid' },
    PARTIAL: { class: 'badge-in-progress', label: 'Partial' },
    PICKUP_SCHEDULED: { class: 'badge-confirmed', label: 'Pickup Scheduled' },
    PICKED_UP: { class: 'badge-in-progress', label: 'Picked Up' },
    DELIVERED: { class: 'badge-completed', label: 'Delivered' }
  }

  const config = statusConfig[status] || { class: 'badge-pending', label: status }

  return (
    <span className={`badge-status ${config.class}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge
