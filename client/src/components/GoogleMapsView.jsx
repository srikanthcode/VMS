import { useEffect, useRef, useState } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
let mapsPromise = null

const loadGoogleMaps = () => {
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (!API_KEY) return Promise.reject(new Error('NO_API_KEY'))
  if (mapsPromise) return mapsPromise

  mapsPromise = new Promise((resolve, reject) => {
    const previous = document.getElementById('google-maps-script')
    if (previous) {
      if (window.google?.maps) return resolve(window.google.maps)
      previous.addEventListener('load', () => resolve(window.google.maps))
      previous.addEventListener('error', () => reject(new Error('GOOGLE_MAPS_LOAD_FAILED')))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.async = true
    script.defer = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY)}&v=quarterly`
    script.onload = () => resolve(window.google.maps)
    script.onerror = () => reject(new Error('GOOGLE_MAPS_LOAD_FAILED'))
    document.head.appendChild(script)
  })

  return mapsPromise
}

const RoleColors = {
  ADMIN: '#e94560',
  MECHANIC: '#28a745',
  CUSTOMER: '#17a2b8'
}

const isValid = (lat, lng) =>
  lat != null && lng != null && !Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lng))

const GoogleMapsView = ({
  markers = [],
  center = null,
  selectedId = null,
  onSelect,
  height = '100%',
  singleEmbed = false,
  className = ''
}) => {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const googleMarkersRef = useRef({})
  const infoRef = useRef(null)
  const [mode, setMode] = useState(API_KEY ? 'loading' : 'embed')
  const [embedCenter, setEmbedCenter] = useState(null)

  const validMarkers = markers.filter((m) => isValid(m.latitude, m.longitude))

  const defaultCenter = center && isValid(center.lat ?? center[0], center.lng ?? center[1])
    ? { lat: parseFloat(center.lat ?? center[0]), lng: parseFloat(center.lng ?? center[1]) }
    : validMarkers.length > 0
      ? { lat: parseFloat(validMarkers[0].latitude), lng: parseFloat(validMarkers[0].longitude) }
      : { lat: 20.5937, lng: 78.9629 }

  useEffect(() => {
    if (API_KEY) {
      loadGoogleMaps()
        .then(() => setMode('js'))
        .catch(() => setMode('embed'))
    } else {
      setMode('embed')
    }
  }, [])

  useEffect(() => {
    if (mode !== 'js' || !containerRef.current || !window.google?.maps) return

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(containerRef.current, {
        center: defaultCenter,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      })
      infoRef.current = new window.google.maps.InfoWindow()
    } else if (center) {
      mapRef.current.panTo(defaultCenter)
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'js' || !mapRef.current || !window.google?.maps) return

    const map = mapRef.current
    const seen = new Set()

    validMarkers.forEach((m) => {
      const id = m.id ?? m.userId
      const position = { lat: parseFloat(m.latitude), lng: parseFloat(m.longitude) }
      seen.add(String(id))

      let marker = googleMarkersRef.current[id]
      if (!marker) {
        marker = new window.google.maps.Marker({
          map,
          position,
          title: m.name || 'User',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: RoleColors[m.role] || '#17a2b8',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          },
          animation: window.google.maps.Animation.DROP
        })
        marker.addListener('click', () => {
          if (onSelect) onSelect(id)
          infoRef.current.setContent(
            `<div style="font-family:Inter,sans-serif;min-width:140px">
              <strong>${m.name || 'User'}</strong><br/>
              <span style="display:inline-block;background:${RoleColors[m.role] || '#6c757d'};color:#fff;padding:1px 6px;border-radius:8px;font-size:11px;margin-top:4px">${m.role || ''}</span>
              ${m.lastLocationUpdate ? `<br/><small style="color:#666">Updated ${new Date(m.lastLocationUpdate).toLocaleString()}</small>` : ''}
            </div>`
          )
          infoRef.current.open(map, marker)
        })
        googleMarkersRef.current[id] = marker
      } else {
        marker.setPosition(position)
        marker.setTitle(m.name || 'User')
      }

      if (selectedId != null && String(selectedId) === String(id)) {
        map.panTo(position)
        map.setZoom(Math.max(map.getZoom(), 15))
      }
    })

    Object.keys(googleMarkersRef.current).forEach((id) => {
      if (!seen.has(id)) {
        googleMarkersRef.current[id].setMap(null)
        delete googleMarkersRef.current[id]
      }
    })
  }, [mode, JSON.stringify(validMarkers.map(m => ({
    id: m.id ?? m.userId,
    latitude: m.latitude,
    longitude: m.longitude,
    name: m.name,
    role: m.role
  }))), selectedId, onSelect])

  useEffect(() => {
    if (mode !== 'embed') return
    const selected = validMarkers.find((m) => String(m.id ?? m.userId) === String(selectedId))
    const target = selected || validMarkers[0]
    if (target) {
      setEmbedCenter({ lat: parseFloat(target.latitude), lng: parseFloat(target.longitude), name: target.name })
    }
  }, [mode, selectedId, JSON.stringify(validMarkers.map(m => ({
    id: m.id ?? m.userId,
    latitude: m.latitude,
    longitude: m.longitude,
    name: m.name
  })))])

  if (mode === 'loading') {
    return (
      <div className={className} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light, #f5f6fa)' }}>
        <div className="text-center">
          <div className="spinner-border text-danger mb-2" role="status"></div>
          <small className="text-muted">Loading Google Maps...</small>
        </div>
      </div>
    )
  }

  if (mode === 'js') {
    return <div ref={containerRef} className={className} style={{ height, width: '100%' }} />
  }

  const embedSrc = embedCenter
    ? `https://www.google.com/maps?q=${embedCenter.lat},${embedCenter.lng}&z=15&output=embed`
    : `https://www.google.com/maps?q=20.5937,78.9629&z=5&output=embed`

  return (
    <div className={className} style={{ height, position: 'relative', background: '#e5e3df' }}>
      <iframe
        title="Google Maps Live Location"
        src={embedSrc}
        style={{ width: '100%', height: '100%', border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {embedCenter?.name && (
        <div
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            background: 'rgba(26,26,46,0.85)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: '0.75rem',
            zIndex: 2
          }}
        >
          <i className="bi bi-geo-alt-fill me-1" style={{ color: '#e94560' }}></i>
          {embedCenter.name}
        </div>
      )}
      {singleEmbed && validMarkers.length > 1 && (
        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            background: 'rgba(26,26,46,0.75)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 8,
            fontSize: '0.7rem',
            zIndex: 2
          }}
        >
          Select a user to focus
        </div>
      )}
    </div>
  )
}

export default GoogleMapsView
