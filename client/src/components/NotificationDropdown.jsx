import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const [notiRes, countRes] = await Promise.all([
        api.notifications.getAll({ limit: 5 }),
        api.notifications.unreadCount()
      ])
      setNotifications(notiRes.data.notifications || notiRes.data || [])
      setUnreadCount(countRes.data.count || 0)
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
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="dropdown">
      <button
        className="nav-link nav-link-custom position-relative"
        data-bs-toggle="dropdown"
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      <div className="dropdown-menu dropdown-menu-end" style={{ width: '350px' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <Link to="/dashboard/notifications" className="text-decoration-none small">
              Mark all read
            </Link>
          )}
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center p-3">
              <div className="spinner-border spinner-border-sm text-primary"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`dropdown-item py-2 px-3 ${!notification.isRead ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="d-flex align-items-start gap-2">
                  <i className={`bi ${notification.isRead ? 'bi-bell' : 'bi-bell-fill'} text-primary mt-1`}></i>
                  <div className="flex-grow-1">
                    <p className="mb-0 small">{notification.message}</p>
                    <small className="text-muted">{formatDate(notification.createdAt)}</small>
                  </div>
                  {!notification.isRead && (
                    <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-3 text-muted">
              <i className="bi bi-bell-slash fs-4 d-block mb-2"></i>
              No notifications
            </div>
          )}
        </div>

        <div className="border-top px-3 py-2">
          <Link to="/dashboard/notifications" className="text-decoration-none small">
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotificationDropdown
