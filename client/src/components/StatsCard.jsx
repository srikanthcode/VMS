const StatsCard = ({ icon, title, value, trend, color = 'accent' }) => {
  const colorMap = {
    accent: { bg: 'rgba(233, 69, 96, 0.1)', text: '#e94560' },
    primary: { bg: 'rgba(26, 26, 46, 0.1)', text: '#1a1a2e' },
    success: { bg: 'rgba(40, 167, 69, 0.1)', text: '#28a745' },
    info: { bg: 'rgba(23, 162, 184, 0.1)', text: '#17a2b8' },
    warning: { bg: 'rgba(255, 193, 7, 0.1)', text: '#ffc107' },
    danger: { bg: 'rgba(220, 53, 69, 0.1)', text: '#dc3545' }
  }

  const colors = colorMap[color] || colorMap.accent

  return (
    <div className="stats-card h-100">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="stats-label mb-1">{title}</p>
          <h3 className="stats-value mb-0">{value}</h3>
          {trend && (
            <small className={trend > 0 ? 'text-success' : 'text-danger'}>
              <i className={`bi ${trend > 0 ? 'bi-arrow-up' : 'bi-arrow-down'} me-1`}></i>
              {Math.abs(trend)}% from last month
            </small>
          )}
        </div>
        <div
          className="stats-icon"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  )
}

export default StatsCard
