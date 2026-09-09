import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroCarousel from '../components/HeroCarousel'
import ServiceCard from '../components/ServiceCard'
import ReviewCard from '../components/ReviewCard'
import ScrollExpand from '../components/ScrollExpand'
import api from '../services/api'

const HomePage = () => {
  const [services, setServices] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesRes, reviewsRes] = await Promise.all([
        api.services.getAll({ limit: 6 }),
        api.reviews.getAll({ limit: 5 })
      ])
      setServices(servicesRes.data.services || servicesRes.data || [])
      setReviews(reviewsRes.data.reviews || reviewsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: 'bi-tools', title: 'Expert Mechanics', description: 'Certified professionals with years of experience' },
    { icon: 'bi-shield-check', title: 'Genuine Parts', description: '100% genuine parts with warranty' },
    { icon: 'bi-truck', title: 'Pickup & Drop', description: 'Free pickup and drop service available' },
    { icon: 'bi-cash-stack', title: 'Affordable Pricing', description: 'Best prices with no hidden charges' }
  ]

  const whyChooseUs = [
    { icon: 'bi-lightning-charge', title: 'Fast & Reliable Service', description: 'Quick and dependable vehicle servicing with guaranteed quality results', gradient: 'linear-gradient(135deg, #e94560 0%, #0f3460 100%)' },
    { icon: 'bi-person-gear', title: 'Expert Mechanics', description: 'Certified professionals delivering complete vehicle care with precision', gradient: 'linear-gradient(135deg, #0f3460 0%, #28a745 100%)' },
    { icon: 'bi-truck', title: 'Pickup & Drop Available', description: 'Convenient doorstep service - we pick up and deliver your vehicle', gradient: 'linear-gradient(135deg, #17a2b8 0%, #e94560 100%)' }
  ]

  const howItWorks = [
    { step: 1, icon: 'bi-person-plus', title: 'Register', description: 'Create your account and add your vehicle' },
    { step: 2, icon: 'bi-calendar-check', title: 'Book Service', description: 'Select service and schedule appointment' },
    { step: 3, icon: 'bi-truck', title: 'Pickup', description: 'We pick up your vehicle from your location' },
    { step: 4, icon: 'bi-tools', title: 'Service', description: 'Expert mechanics work on your vehicle' },
    { step: 5, icon: 'bi-credit-card', title: 'Payment', description: 'Pay online after service completion' },
    { step: 6, icon: 'bi-house', title: 'Delivery', description: 'We deliver your vehicle back to you' }
  ]

  return (
    <div>
      <HeroCarousel />

      {/* Quick Features - Auto Scroll */}
      <div className="quick-features overflow-hidden py-4" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
        <div className="features-scroll-wrapper">
          <div className="features-scroll-track">
            {[...features, ...features, ...features].map((feature, index) => (
              <div key={index} className="features-scroll-item">
                <div className="quick-feature-item">
                  <i className={`bi ${feature.icon}`}></i>
                  <div>
                    <h6>{feature.title}</h6>
                    <p className="mb-0">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              We offer comprehensive vehicle maintenance and repair services
            </p>
          </div>

          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border"></div>
            </div>
          ) : (
            <div className="row g-4">
              {services.length > 0 ? (
                services.map((service) => (
                  <div key={service.id} className="col-lg-4 col-md-6">
                    <ServiceCard service={service} />
                  </div>
                ))
              ) : (
                <>
                  {[
                    { name: 'Basic Service', price: 599, description: 'Essential maintenance for your vehicle including oil change and filter replacement' },
                    { name: 'Premium Service', price: 1299, description: 'Comprehensive service with engine tune-up and complete fluid check' },
                    { name: 'Major Service', price: 2499, description: 'Complete overhaul with major repairs and part replacements' },
                    { name: 'Oil Change', price: 299, description: 'Quick engine oil change with premium quality oil' },
                    { name: 'Brake Service', price: 499, description: 'Brake pad replacement and brake system inspection' },
                    { name: 'Wheel Alignment', price: 399, description: 'Precision wheel alignment for smooth driving' }
                  ].map((service, index) => (
                    <div key={index} className="col-lg-4 col-md-6">
                      <ServiceCard service={{ ...service, _id: index }} />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          <div className="text-center mt-4">
            <Link to="/services" className="btn btn-accent">
              View All Services <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Simple steps to get your vehicle serviced
            </p>
          </div>

          <div className="row">
            {howItWorks.map((step) => (
              <div key={step.step} className="col-lg-2 col-md-4 col-6">
                <div className="step-card text-center">
                  <div className="step-number">{step.step}</div>
                  <i className={`bi ${step.icon} fs-1 mb-3 d-block`}></i>
                  <h6 className="fw-bold">{step.title}</h6>
                  <p className="small mb-0">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="section-title">About VMS</h2>
              <p className="lead">
                We are a leading vehicle service provider with over 10 years of experience 
                in delivering quality vehicle maintenance and repair services.
              </p>
              <p>
                Our team of certified mechanics uses advanced diagnostic tools and genuine 
                parts to ensure your vehicle receives the best care. We pride ourselves on 
                transparency, quality, and customer satisfaction.
              </p>
              <div className="row g-3 mt-3">
                <div className="col-4">
                  <h3 className="fw-bold stats-number">5000+</h3>
                  <p className="mb-0">Happy Customers</p>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold stats-number">10+</h3>
                  <p className="mb-0">Years Experience</p>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold stats-number">15+</h3>
                  <p className="mb-0">Expert Mechanics</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-cta-box rounded-4 p-5 text-center">
                <i className="bi bi-tools display-1 mb-3"></i>
                <h3 className="fw-bold">Professional Vehicle Care</h3>
                <p>Trust our experts to keep your vehicle in perfect condition</p>
                <Link to="/login" className="btn btn-accent btn-lg">
                  Get Started <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - Auto Scroll */}
      {reviews.length > 0 && (
        <section className="section bg-white overflow-hidden">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="section-title">Customer Reviews</h2>
              <p className="section-subtitle">
                See what our customers say about our services
              </p>
            </div>
          </div>

          <div className="reviews-scroll-wrapper">
            <div className="reviews-scroll-track">
              {[...reviews, ...reviews].map((review, index) => (
                <div key={index} className="reviews-scroll-item">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          <div className="container">
            <div className="text-center mt-4">
              <Link to="/reviews" className="btn btn-accent">
                View All Reviews <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section with ScrollExpand */}
      <div style={{ height: '600px' }}>
        <ScrollExpand
          src="/images/hero-bg.png"
          alt="Vehicle service"
          title="Ready to Service Your Vehicle?"
          scrollHint="Scroll to expand"
          useWindowScroll
          startWidth={50}
          startHeight={60}
          startRadius={24}
          endRadius={0}
          mediaZoom={1.3}
          scrollDistance={1.0}
          holdDistance={0.3}
          smoothing={0.1}
          overlayScrim={0.5}
        >
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: '1rem', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            Ready to Service Your Vehicle?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.15rem', marginBottom: '2rem', maxWidth: '500px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
            Book your service today and experience the best vehicle care in town
          </p>
          <div className="d-flex gap-3 flex-wrap justify-content-center">
            <Link to="/register" className="btn btn-accent btn-lg px-4">
              <i className="bi bi-calendar-plus me-2"></i>
              Book Service
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg px-4">
              Contact Us
            </Link>
          </div>
        </ScrollExpand>
      </div>
    </div>
  )
}

export default HomePage
