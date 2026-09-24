import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setSocket(null)
      setConnected(false)
      return
    }

    const s = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    })

    socketRef.current = s
    setSocket(s)

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', (err) => {
      console.error('Socket connection error:', err?.message)
    })

    s.on('notification:new', (notification) => {
      toast(notification?.message || 'New notification', {
        icon: '🔔',
        duration: 4000
      })
      window.dispatchEvent(new CustomEvent('vms:notification', { detail: notification }))
    })

    s.on('notification:unread-count', (payload) => {
      window.dispatchEvent(new CustomEvent('vms:unread-count', { detail: payload }))
    })

    s.on('notification:all-read', () => {
      window.dispatchEvent(new CustomEvent('vms:notifications-cleared'))
    })

    s.on('booking:created', (booking) => {
      window.dispatchEvent(new CustomEvent('vms:booking', { detail: { type: 'created', booking } }))
      if (user?.role === 'ADMIN') {
        toast(`New booking ${booking?.bookingId || ''}`, { icon: '📅' })
      }
    })

    s.on('booking:updated', (booking) => {
      window.dispatchEvent(new CustomEvent('vms:booking', { detail: { type: 'updated', booking } }))
      if (booking?.status) {
        toast(`Booking ${booking.bookingId || booking.id}: ${String(booking.status).replace(/_/g, ' ')}`, {
          icon: '🔄',
          duration: 3500
        })
      }
    })

    s.on('booking:assigned', (booking) => {
      window.dispatchEvent(new CustomEvent('vms:booking', { detail: { type: 'assigned', booking } }))
      toast('You have a new booking assignment', { icon: '🛠️' })
    })

    s.on('payment:updated', (payment) => {
      window.dispatchEvent(new CustomEvent('vms:payment', { detail: payment }))
    })

    s.on('bill:created', (bill) => {
      window.dispatchEvent(new CustomEvent('vms:bill', { detail: bill }))
    })

    s.on('review:created', (review) => {
      window.dispatchEvent(new CustomEvent('vms:review', { detail: { type: 'created', review } }))
    })

    s.on('review:updated', (review) => {
      window.dispatchEvent(new CustomEvent('vms:review', { detail: { type: 'updated', review } }))
    })

    s.on('review:deleted', (payload) => {
      window.dispatchEvent(new CustomEvent('vms:review', { detail: { type: 'deleted', payload } }))
    })

    s.on('location:updated', (payload) => {
      window.dispatchEvent(new CustomEvent('vms:location', { detail: payload }))
    })

    s.on('customer:location', (payload) => {
      window.dispatchEvent(new CustomEvent('vms:customer-location', { detail: payload }))
    })

    s.on('pickup:created', (payload) => {
      window.dispatchEvent(new CustomEvent('vms:pickup', { detail: { type: 'created', payload } }))
    })

    s.on('pickup:updated', (payload) => {
      window.dispatchEvent(new CustomEvent('vms:pickup', { detail: { type: 'updated', payload } }))
    })

    return () => {
      s.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
    }
  }, [isAuthenticated, token, user?.role])

  const on = useCallback((event, handler) => {
    if (!socketRef.current) return () => {}
    socketRef.current.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }, [])

  const emit = useCallback((event, payload) => {
    socketRef.current?.emit(event, payload)
  }, [])

  const value = {
    socket,
    connected,
    on,
    emit
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketContext
