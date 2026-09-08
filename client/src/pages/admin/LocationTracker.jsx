import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import './LocationTracker.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:28px;height:28px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:white;border-radius:50%"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -20]
})

const RoleColors = { ADMIN: '#e94560', MECHANIC: '#28a745', CUSTOMER: '#17a2b8' }

const MapUpdater = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 15)
    }
  }, [center, map])
  return null
}

const LocationTracker = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tracking, setTracking] = useState(false)
  const [center, setCenter] = useState([20.5937, 78.9629])
  const [mapReady, setMapReady] = useState(false)
  const watchIdRef = useRef(null)

  useEffect(() => {
    fetchLocations()
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (mapReady) {
      fetchLocations()
    }
  }, [mapReady])

  const fetchLocations = async () => {
    try {
      const res = await api.location.trackAll()
      const data = res.data || []
      setUsers(data)
      if (data.length > 0) {
        const withLocation = data.filter(u => u.latitude && u.longitude)
        if (withLocation.length > 0) {
          setCenter([parseFloat(withLocation[0].latitude), parseFloat(withLocation[0].longitude)])
        }
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    setTracking(true)
    toast.success('Location tracking started')
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          await api.location.update({ latitude, longitude })
          setCenter([latitude, longitude])
          fetchLocations()
        } catch (error) {
          console.error('Failed to update location:', error)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Failed to get location')
        setTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
    toast.success('Location tracking stopped')
  }

  const centerOnUser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCenter([latitude, longitude])
      },
      () => toast.error('Failed to get your location')
    )
  }

  return (
    <div className="location-tracker">
      <div className="location-header">
        <div>
          <h4 style={{ margin: 0 }}>Location Tracker</h4>
          <small style={{ color: 'var(--text-secondary, #8a94a6)' }}>Track all users in real-time</small>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${tracking ? 'btn-danger' : 'btn-accent'}`}
            onClick={tracking ? stopTracking : startTracking}
          >
            <i className={`bi ${tracking ? 'bi-stop-circle' : 'bi-play-circle'} me-1`}></i>
            {tracking ? 'Stop' : 'Track'}
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
              <p>Loading map...</p>
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={13}
              className="leaflet-map"
              whenCreated={() => setMapReady(true)}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapUpdater center={center} />
              {users.filter(u => u.latitude && u.longitude).map(u => (
                <Marker
                  key={u.id}
                  position={[parseFloat(u.latitude), parseFloat(u.longitude)]}
                  icon={createIcon(RoleColors[u.role] || '#6c757d')}
                >
                  <Popup>
                    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '150px' }}>
                      <h6 style={{ margin: 0, fontSize: '1rem' }}>{u.name}</h6>
                      <span style={{
                        display: 'inline-block',
                        background: RoleColors[u.role],
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        marginTop: '4px'
                      }}>
                        {u.role}
                      </span>
                      {u.lastLocationUpdate && (
                        <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#666' }}>
                          Updated: {new Date(u.lastLocationUpdate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        <div className="users-sidebar">
          <h6 style={{ marginBottom: '15px' }}>
            <i className="bi bi-people me-2"></i>
            Users ({users.filter(u => u.latitude).length})
          </h6>
          {users.map(u => (
            <div
              key={u.id}
              className="user-card"
              onClick={() => u.latitude && setCenter([parseFloat(u.latitude), parseFloat(u.longitude)])}
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
                {u.latitude && (
                  <span className="live-badge">
                    <i className="bi bi-circle-fill me-1"></i>Live
                  </span>
                )}
              </div>
              {u.lastLocationUpdate && (
                <small className="update-time">
                  {new Date(u.lastLocationUpdate).toLocaleString()}
                </small>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LocationTracker
