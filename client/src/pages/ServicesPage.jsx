import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ServiceCard from '../components/ServiceCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Footer from '../components/Footer'
import api from '../services/api'

const ServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await api.services.getAll()
      setServices(response.data.services || response.data || [])
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div style={{ paddingTop: '80px' }}>
        {/* Header */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h1 className="text-white fw-bold mb-3">Our Services</h1>
                <p className="text-white-50 mb-0">
                  Comprehensive vehicle maintenance and repair services
                </p>
              </div>
              <div className="col-lg-4">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section">
          <div className="container">
            {loading ? (
              <LoadingSpinner message="Loading services..." />
            ) : filteredServices.length > 0 ? (
              <div className="row g-4">
                {filteredServices.map((service) => (
                  <div key={service.id} className="col-lg-4 col-md-6">
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-tools display-1 text-muted"></i>
                <h4 className="mt-3">No services found</h4>
                <p className="text-muted">
                  {searchTerm ? 'Try adjusting your search' : 'Services will be available soon'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container text-center">
            <h2 className="text-white fw-bold">Need Help Choosing?</h2>
            <p className="text-white-50 mb-4">
              Contact us for personalized service recommendations
            </p>
            <Link to="/contact" className="btn btn-light btn-lg px-4">
              <i className="bi bi-telephone me-2"></i>
              Contact Us
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default ServicesPage
