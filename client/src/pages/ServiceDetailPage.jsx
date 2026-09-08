import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const ServiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchService()
  }, [id])

  const fetchService = async () => {
    try {
      const response = await api.services.getById(id)
      setService(response.data.service || response.data)
    } catch (error) {
      console.error('Failed to fetch service:', error)
      toast.error('Failed to load service details')
    } finally {
      setLoading(false)
    }
  }

  const handleBookService = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a service')
      navigate('/login')
      return
    }
    navigate('/dashboard/book-service', { state: { serviceId: id } })
  }

  if (loading) {
    return (
      <div>
      <LoadingSpinner fullPage message="Loading service details..." />
      </div>
    )
  }

  if (!service) {
    return (
      <div>
        <div className="container py-5 text-center" style={{ marginTop: '80px' }}>
          <i className="bi bi-exclamation-circle display-1 text-muted"></i>
          <h3 className="mt-3">Service not found</h3>
          <Link to="/services" className="btn btn-accent mt-3">
            Back to Services
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <div style={{ paddingTop: '80px' }}>
        {/* Header */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
          <div className="container">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-3">
                <li className="breadcrumb-item">
                  <Link to="/services" className="text-white-50 text-decoration-none">Services</Link>
                </li>
                <li className="breadcrumb-item active text-white">{service.name}</li>
              </ol>
            </nav>
            <h1 className="text-white fw-bold">{service.name}</h1>
          </div>
        </section>

        {/* Service Detail */}
        <section className="section">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <div className="card-custom p-4 mb-4">
                  <h4 className="fw-bold mb-3">Description</h4>
                  <p className="text-muted">{service.description}</p>

                  {service.includes && service.includes.length > 0 && (
                    <>
                      <h5 className="fw-bold mt-4 mb-3">What's Included</h5>
                      <div className="row">
                        {service.includes.map((item, index) => (
                          <div key={index} className="col-md-6 mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {item}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {service.features && service.features.length > 0 && (
                    <>
                      <h5 className="fw-bold mt-4 mb-3">Features</h5>
                      <div className="row">
                        {service.features.map((feature, index) => (
                          <div key={index} className="col-md-6 mb-2">
                            <i className="bi bi-star-fill text-warning me-2"></i>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card-custom p-4 mb-4">
                  <h5 className="fw-bold mb-3">Service Details</h5>
                  
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Price</span>
                    <span className="h4 text-accent fw-bold mb-0" style={{ color: '#e94560' }}>
                      ₹{service.price}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Duration</span>
                    <span className="fw-bold">{service.estimatedDuration || '2-3 hours'}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Warranty</span>
                    <span className="fw-bold">{service.warranty || '30 days'}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span className="text-muted">Difficulty</span>
                    <span className="badge bg-primary">{service.difficulty || 'Standard'}</span>
                  </div>

                  <button
                    className="btn btn-accent w-100 mt-4 py-3"
                    onClick={handleBookService}
                  >
                    <i className="bi bi-calendar-plus me-2"></i>
                    Book This Service
                  </button>
                </div>

                <div className="card-custom p-4">
                  <h6 className="fw-bold mb-3">Need Help?</h6>
                  <p className="text-muted small mb-3">
                    Have questions about this service? Contact our team.
                  </p>
                  <Link to="/contact" className="btn btn-outline-accent w-100">
                    <i className="bi bi-telephone me-2"></i>
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default ServiceDetailPage
