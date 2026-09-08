import { Link } from 'react-router-dom'

const ServiceCard = ({ service }) => {
  const iconMap = {
    'Basic Service': 'bi-gear',
    'Premium Service': 'bi-star',
    'Major Service': 'bi-tools',
    'Oil Change': 'bi-droplet',
    'Brake Service': 'bi-stop-circle',
    'Engine Repair': 'bi-cpu',
    'Battery Service': 'bi-battery-charging',
    'AC Service': 'bi-snow',
    'Wheel Alignment': 'bi-arrow-repeat',
    'General Repair': 'bi-wrench'
  }

  const imageMap = {
    'Basic Service': '/images/basic-service.jpg'
  }

  const icon = iconMap[service.name] || 'bi-tools'
  const bgImage = imageMap[service.name] || null

  return (
    <div className="service-card h-100">
      {bgImage && (
        <div
          className="service-card-bg"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '150px',
            borderRadius: '12px 12px 0 0',
            position: 'relative'
          }}
        ></div>
      )}
      <div className="card-body text-center p-4">
        {!bgImage && (
          <div className="service-icon">
            <i className={`bi ${icon}`}></i>
          </div>
        )}
        <h5 className="card-title fw-bold mt-3">{service.name}</h5>
        <p className="card-text text-muted mb-3">
          {service.description?.substring(0, 100)}
          {service.description?.length > 100 ? '...' : ''}
        </p>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="service-price">₹{service.price}</span>
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            {service.estimatedDuration || '2-3 hours'}
          </small>
        </div>
        <Link to={`/services/${service.id}`} className="btn btn-accent w-100">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ServiceCard
