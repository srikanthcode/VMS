import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import GoogleMapsView from './GoogleMapsView'
import { useLiveLocation } from '../hooks/useLiveLocation'

const LiveLocationShare = ({ bookingId = null, compact = false }) => {
  const { sharing, position, error, lastUpdated, toggleSharing } = useLiveLocation({ bookingId })
  const [ago, setAgo] = useState('')

  useEffect(() => {
    if (!lastUpdated) {
      setAgo('')
      return
    }
    const tick = () => {
      const seconds = Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
      setAgo(seconds < 5 ? 'just now' : `${seconds}s ago`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lastUpdated])

  const handleToggle = () => {
    const started = toggleSharing()
    if (started) {
      toast.success('Sharing your live location for pickup')
    } else if (!sharing) {
      toast.error(error || 'Could not start location sharing')
    } else {
      toast.success('Location sharing stopped')
    }
  }

  const mapsMarkers = position
    ? [{
        id: 'me',
        name: 'You',
        role: 'CUSTOMER',
        latitude: position.latitude,
        longitude: position.longitude,
        lastLocationUpdate: lastUpdated?.toISOString()
      }]
    : []

  if (compact) {
    return (
      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <span
            className={`badge rounded-pill ${sharing ? 'bg-success' : 'bg-secondary'}`}
          >
            <i className={`bi ${sharing ? 'bi-broadcast' : 'bi-geo-alt'} me-1`}></i>
            {sharing ? 'Live' : 'Off'}
          </span>
          {sharing && ago && <small className="text-muted">updated {ago}</small>}
        </div>
        <button
          type="button"
          className={`btn btn-sm ${sharing ? 'btn-outline-danger' : 'btn-accent'}`}
          onClick={handleToggle}
        >
          <i className={`bi ${sharing ? 'bi-stop-circle' : 'bi-geo-alt'} me-1`}></i>
          {sharing ? 'Stop Sharing' : 'Share Live Location'}
        </button>
      </div>
    )
  }

  return (
    <div className="card-custom p-4">
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-1">
            <i className="bi bi-broadcast me-2 text-danger"></i>
            Live Location (Pickup & Drop)
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Share your real-time Google Maps location so admin & mechanic can find you for pickup.
          </p>
        </div>
        <button
          type="button"
          className={`btn ${sharing ? 'btn-outline-danger' : 'btn-accent'}`}
          onClick={handleToggle}
        >
          <i className={`bi ${sharing ? 'bi-stop-circle' : 'bi-geo-alt'} me-1`}></i>
          {sharing ? 'Stop Sharing' : 'Start Sharing'}
        </button>
      </div>

      <div className="mb-3">
        <span className={`badge ${sharing ? 'bg-success' : 'bg-secondary'} me-2`}>
          {sharing ? '● LIVE' : 'Not sharing'}
        </span>
        {sharing && ago && <small className="text-muted">Last update: {ago}</small>}
        {error && <div className="text-danger small mt-1">{error}</div>}
      </div>

      <div style={{ height: compact ? 220 : 280, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border, #e5e7eb)' }}>
        {position ? (
          <GoogleMapsView
            markers={mapsMarkers}
            center={{ lat: position.latitude, lng: position.longitude }}
            selectedId="me"
            height="100%"
            singleEmbed
          />
        ) : (
          <div className="h-100 d-flex align-items-center justify-center text-muted" style={{ background: 'var(--bg-light, #f5f6fa)' }}>
            <div className="text-center">
              <i className="bi bi-geo-alt display-5"></i>
              <p className="mt-2 mb-0 small">Start sharing to show your pickup pin on Google Maps</p>
            </div>
          </div>
        )}
      </div>

      {position && (
        <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <small className="text-muted">
            {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
          </small>
          <a
            className="btn btn-sm btn-outline-primary"
            href={`https://www.google.com/maps?q=${position.latitude},${position.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            <i className="bi bi-box-arrow-up-right me-1"></i>
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  )
}

export default LiveLocationShare
