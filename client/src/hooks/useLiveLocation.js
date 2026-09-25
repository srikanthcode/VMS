import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { useSocket } from '../context/SocketContext'

const SHARE_KEY = 'vms:location-sharing'
const MIN_INTERVAL_MS = 3000

export const useLiveLocation = ({ bookingId = null, intervalMs = 5000 } = {}) => {
  const { emit, connected } = useSocket()
  const [sharing, setSharing] = useState(() => localStorage.getItem(SHARE_KEY) === '1')
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const watchIdRef = useRef(null)
  const bookingRef = useRef(bookingId)
  const lastSentRef = useRef(0)
  const flushTimerRef = useRef(null)
  const pendingRef = useRef(null)
  const connectedRef = useRef(connected)
  const emitRef = useRef(emit)

  bookingRef.current = bookingId
  connectedRef.current = connected
  emitRef.current = emit

  const deliver = useCallback(async (payload) => {
    if (connectedRef.current) {
      emitRef.current('location:update', payload)
      return
    }
    try {
      await api.location.update(payload)
    } catch (err) {
      console.error('Failed to persist location:', err)
    }
  }, [])

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current != null) return
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastSentRef.current))
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null
      const payload = pendingRef.current
      if (!payload) return
      pendingRef.current = null
      lastSentRef.current = Date.now()
      deliver(payload)
    }, wait)
  }, [deliver])

  const pushLocation = useCallback((latitude, longitude, accuracy) => {
    const payload = {
      latitude,
      longitude,
      accuracy: typeof accuracy === 'number' && !Number.isNaN(accuracy) ? accuracy : undefined,
      bookingId: bookingRef.current || undefined
    }
    setPosition({ latitude, longitude, accuracy: payload.accuracy })
    setLastUpdated(new Date())
    setError(null)
    pendingRef.current = payload

    if (Date.now() - lastSentRef.current >= MIN_INTERVAL_MS) {
      if (flushTimerRef.current != null) {
        clearTimeout(flushTimerRef.current)
        flushTimerRef.current = null
      }
      pendingRef.current = null
      lastSentRef.current = Date.now()
      deliver(payload)
    } else {
      scheduleFlush()
    }
  }, [deliver, scheduleFlush])

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device')
      return false
    }
    if (watchIdRef.current != null) return true

    setError(null)
    const send = (pos) => {
      pushLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy)
    }

    navigator.geolocation.getCurrentPosition(send, (err) => {
      setError(err.code === 1 ? 'Location permission denied' : 'Unable to get your location')
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })

    watchIdRef.current = navigator.geolocation.watchPosition(send, (err) => {
      setError(err.code === 1 ? 'Location permission denied' : 'Unable to get your location')
    }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 })

    localStorage.setItem(SHARE_KEY, '1')
    setSharing(true)
    return true
  }, [intervalMs, pushLocation])

  const stopSharing = useCallback(async () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (flushTimerRef.current != null) {
      clearTimeout(flushTimerRef.current)
      flushTimerRef.current = null
    }
    pendingRef.current = null
    localStorage.removeItem(SHARE_KEY)
    setSharing(false)
    setPosition(null)
    setLastUpdated(null)
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
      if (flushTimerRef.current != null) {
        clearTimeout(flushTimerRef.current)
        flushTimerRef.current = null
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
