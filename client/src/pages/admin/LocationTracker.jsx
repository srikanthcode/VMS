import { useState, useEffect, useRef } from 'react'
import GoogleMapsView from '../../components/GoogleMapsView'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import './LocationTracker.css'

const RoleColors = { ADMIN: '#e94560', MECHANIC: '#28a745', CUSTOMER: '#17a2b8' }
const STALE_AFTER_MS = 45000

const toUser = (payload) => ({
  id: payload.userId ?? payload.id,
  name: payload.name || 'User',
  role: payload.role,
  latitude: payload.latitude,
  longitude: payload.longitude,
  accuracy: payload.accuracy,
  lastLocationUpdate: payload.lastLocationUpdate,
  avatar: payload.avatar || null,
  phone: payload.phone || null
})

const hasCoords = (u) =>
  u.latitude != null &&
  u.longitude != null &&
  !Number.isNaN(parseFloat(u.latitude)) &&
  !Number.isNaN(parseFloat(u.longitude))

const isStale = (u) =>
  !u.lastLocationUpdate || Date.now() - new Date(u.lastLocationUpdate).getTime() > STALE_AFTER_MS

const LocationTracker = ({ title = 'Location Tracker', subtitle = 'Track all users in real-time', roleFilter = null }) => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tracking, setTracking] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [center, setCenter] = useState(null)
  const [filter, setFilter] = useState(roleFilter || 'ALL')
  const watchIdRef = useRef(null)

  const mergeUser = (next) => {
    if (!next || next.id == null) return
    setUsers(prev => {
      const exists = prev.some(u => String(u.id) === String(next.id))
      if (!exists) return [...prev, next]
      return prev.map(u => String(u.id) === String(next.id) ? { ...u, ...next } : u)
    })
    if (hasCoords(next)) {
      setCenter({ lat: parseFloat(next.latitude), lng: parseFloat(next.longitude) })
    }
  }

  useEffect(() => {
    fetchLocations()

    const onLocation = (e) => {
      const payload = e.detail
      if (!payload) return
      if (payload.latitude == null || payload.longitude == null) {
        setUsers(prev => prev.filter(u => String(u.id) !== String(payload.userId ?? payload.id)))
        return
      }
      mergeUser(toUser(payload))
    }

    window.addEventListener('vms:location', onLocation)
    window.addEventListener('vms:customer-location', onLocation)
    const poll = setInterval(fetchLocations, 10000)
    const clock = setInterval(() => setUsers(prev => [...prev]), 5000)

    return () => {
      window.removeEventListener('vms:location', onLocation)
      window.removeEventListener('vms:customer-location', onLocation)
      clearInterval(poll)
      clearInterval(clock)
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const fetchLocations = async () => {
    try {
      const params = filter && filter !== 'ALL' ? { role: filter } : undefined
      const res = await api.location.trackAll(params)
      const data = res.data || []
      setUsers(prev => {
        const previous = new Map(prev.map(u => [String(u.id), u]))
        return data.map(u => {
          const local = previous.get(String(u.id))
          if (
            local &&
            local.lastLocationUpdate &&
            u.lastLocationUpdate &&
            new Date(local.lastLocationUpdate).getTime() > new Date(u.lastLocationUpdate).getTime()
          ) {
            return {
              ...u,
              latitude: local.latitude,
              longitude: local.longitude,
              accuracy: local.accuracy,
              lastLocationUpdate: local.lastLocationUpdate
            }
          }
          return u
        })
      })
      if (!selectedId && data.length > 0) {
        const first = data.find(hasCoords)
        if (first) setSelectedId(first.id)
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [filter])

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    setTracking(true)
    toast.success('Sharing your live location')
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        try {
          await api.location.update({ latitude, longitude, accuracy })
          mergeUser({
            id: user?.id,
            name: user?.name,
            role: user?.role,
            latitude,
            longitude,
            accuracy,
            lastLocationUpdate: new Date().toISOString()
          })
          setSelectedId(user?.id)
        } catch (error) {
          console.error('Failed to update location:', error)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Failed to get location')
        setTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    )
  }

  const stopTracking = async () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
    try {
      await api.location.stop({})
    } catch {}
    toast.success('Location sharing stopped')
  }

  const centerOnUser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        if (user?.id) setSelectedId(user.id)
      },
      () => toast.error('Failed to get your location')
    )
  }

  const filteredUsers = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false
    if (filter && filter !== 'ALL' && u.role !== filter) return false
    return hasCoords(u) && !isStale(u)
  })

  const listUsers = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false
    if (filter && filter !== 'ALL' && u.role !== filter) return false
    return true
  })

  const googleMarkers = filteredUsers.map(u => ({
    id: u.id,
    userId: u.id,
    name: u.name,
    role: u.role,
    latitude: u.latitude,
    longitude: u.longitude,
    accuracy: u.accuracy,
    lastLocationUpdate: u.lastLocationUpdate
  }))

  return (
    <div className="location-tracker">
      <div className="location-header">
        <div>
          <h4 style={{ margin: 0 }}>{title}</h4>
          <small style={{ color: 'var(--text-secondary, #8a94a6)' }}>{subtitle}</small>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {!roleFilter && (
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All roles</option>
              <option value="CUSTOMER">Customers</option>
              <option value="MECHANIC">Mechanics</option>
              <option value="ADMIN">Admins</option>
            </select>
          )}
          <button
            className={`btn btn-sm ${tracking ? 'btn-danger' : 'btn-accent'}`}
            onClick={tracking ? stopTracking : startTracking}
          >
            <i className={`bi ${tracking ? 'bi-stop-circle' : 'bi-play-circle'} me-1`}></i>
            {tracking ? 'Stop' : 'Share My Location'}
          </button>
          <button className="btn btn-sm btn-outline-accent" onClick={centerOnUser}>
            <i className="bi bi-crosshair"></i>
          </button>
          <button className="btn btn-sm btn-outline-accent" onClick={fetchLocations}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <div className="location-content">
        <div className="map-container">
          {loading ? (
            <div className="map-loading">
              <div className="loading-spinner"></div>
              <p>Loading Google Maps...</p>
            </div>
          ) : (
            <GoogleMapsView
              markers={googleMarkers}
              center={center}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              height="100%"
              singleEmbed
              className="google-map-view"
            />
          )}
        </div>

        <div className="users-sidebar">
          <h6 style={{ marginBottom: '15px' }}>
            <i className="bi bi-people me-2"></i>
            Live Users ({filteredUsers.length})
          </h6>
          {listUsers.map(u => (
            <div
              key={u.id}
              className={`user-card ${String(selectedId) === String(u.id) ? 'active' : ''}`}
              onClick={() => {
                if (hasCoords(u)) {
                  setSelectedId(u.id)
                  setCenter({ lat: parseFloat(u.latitude), lng: parseFloat(u.longitude) })
                }
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="user-name">{u.name}</h6>
                  <span
                    className="role-badge"
                    style={{ background: RoleColors[u.role] || '#6c757d' }}
                  >
                    {u.role}
                  </span>
                </div>
                {hasCoords(u) && !isStale(u) ? (
                  <span className="live-badge">
                    <i className="bi bi-circle-fill me-1"></i>Live
                  </span>
                ) : hasCoords(u) ? (
                  <span className="text-warning" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-clock-history me-1"></i>Stale
                  </span>
                ) : (
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>Offline</span>
                )}
              </div>
              {u.phone && (
                <small className="update-time">
                  <i className="bi bi-telephone me-1"></i>{u.phone}
                </small>
              )}
              {u.lastLocationUpdate && (
                <small className="update-time">
                  <i className="bi bi-clock me-1"></i>{new Date(u.lastLocationUpdate).toLocaleTimeString()} · {Math.max(0, Math.round((Date.now() - new Date(u.lastLocationUpdate).getTime()) / 1000))}s ago
                </small>
              )}
              {hasCoords(u) && (
                <a
                  className="btn btn-sm btn-outline-primary mt-2 w-100"
                  href={`https://www.google.com/maps?q=${u.latitude},${u.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="bi bi-signpost-2 me-1"></i>
                  Directions
                </a>
              )}
            </div>
          ))}
          {listUsers.length === 0 && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-geo-alt display-6"></i>
              <p className="small mt-2 mb-0">No one is sharing location right now</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationTracker
