import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import api from '../../services/api'
import toast from 'react-hot-toast'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.notifications.getAll()
      setNotifications(response.data.notifications || response.data || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.notifications.markRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner message="Loading notifications..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">
            <i className="bi bi-bell me-2"></i>
            Notifications
          </h4>
          {unreadCount > 0 && (
            <small className="text-muted">{unreadCount} unread notifications</small>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline-primary btn-sm" onClick={markAllAsRead}>
            <i className="bi bi-check-all me-1"></i>
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="list-group">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`list-group-item list-group-item-action ${!notification.isRead ? 'bg-light' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="d-flex align-items-start gap-3">
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${!notification.isRead ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                  <i className={`bi ${notification.type === 'BOOKING' ? 'bi-calendar-check' : notification.type === 'PAYMENT' ? 'bi-credit-card' : 'bi-bell'} text-white`}></i>
                </div>
                <div className="flex-grow-1">
                  <p className={`mb-1 ${!notification.isRead ? 'fw-bold' : ''}`}>
                    {notification.message}
                  </p>
                  <small className="text-muted">
                    {formatDate(notification.createdAt)}
                  </small>
                </div>
                {!notification.isRead && (
                  <div className="bg-primary rounded-circle" style={{ width: '10px', height: '10px' }}></div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bi-bell-slash"
          title="No Notifications"
          message="You're all caught up! No new notifications."
        />
      )}
    </DashboardLayout>
  )
}

export default NotificationsPage
