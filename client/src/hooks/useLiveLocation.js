import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { useSocket } from '../context/SocketContext'

const SHARE_KEY = 'vms:location-sharing'

export const useLiveLocation = ({ bookingId = null, intervalMs = 5000 } = {}) => {
  const { emit, connected } = useSocket()
  const [sharing, setSharing] = useState(() => localStorage.getItem(SHARE_KEY) === '1')
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const watchIdRef = useRef(null)
  const bookingRef = useRef(bookingId)

  bookingRef.current = bookingId

  const pushLocation = useCallback(async (latitude, longitude) => {
    const payload = {
      latitude,
      longitude,
      bookingId: bookingRef.current || undefined
    }
    setPosition({ latitude, longitude })
    setLastUpdated(new Date())
    setError(null)

    if (connected) {
      emit('location:update', payload)
    }

    try {
      await api.location.update(payload)
    } catch (err) {
      console.error('Failed to persist location:', err)
    }
  }, [connected, emit])

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device')
      return false
    }
    if (watchIdRef.current != null) return true

    setError(null)
    const send = (pos) => {
      pushLocation(pos.coords.latitude, pos.coords.longitude)
    }

    navigator.geolocation.getCurrentPosition(send, (err) => {
      setError(err.code === 1 ? 'Location permission denied' : 'Unable to get your location')
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })

    watchIdRef.current = navigator.geolocation.watchPosition(send, (err) => {
      setError(err.code === 1 ? 'Location permission denied' : 'Unable to get your location')
    }, { enableHighAccuracy: true, maximumAge: intervalMs, timeout: 15000 })

    localStorage.setItem(SHARE_KEY, '1')
    setSharing(true)
    return true
  }, [intervalMs, pushLocation])

  const stopSharing = useCallback(async () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    localStorage.removeItem(SHARE_KEY)
    setSharing(false)
    try {
      await api.location.stop({ bookingId: bookingRef.current || undefined })
    } catch (err) {
      console.error('Failed to stop sharing:', err)
    }
  }, [])

  const toggleSharing = useCallback(() => {
    if (sharing) {
      stopSharing()
      return false
    }
    return startSharing()
  }, [sharing, startSharing, stopSharing])

  useEffect(() => {
    if (sharing && watchIdRef.current == null) {
      startSharing()
    }
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [])

  return {
    sharing,
    position,
    error,
    lastUpdated,
    startSharing,
    stopSharing,
    toggleSharing
  }
}

export default useLiveLocation
