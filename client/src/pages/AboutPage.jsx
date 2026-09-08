import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const AboutPage = () => {
  const stats = [
    { value: '5000+', label: 'Happy Customers' },
    { value: '10+', label: 'Years Experience' },
    { value: '15+', label: 'Expert Mechanics' },
    { value: '10000+', label: 'Services Completed' }
  ]

  const values = [
    { icon: 'bi-award', title: 'Quality', description: 'We never compromise on service quality' },
    { icon: 'bi-heart', title: 'Trust', description: 'Building lasting relationships with our customers' },
    { icon: 'bi-lightning', title: 'Efficiency', description: 'Quick and reliable service delivery' },
    { icon: 'bi-people', title: 'Customer First', description: 'Your satisfaction is our priority' }
  ]

  const team = [
    { name: 'Rajesh Kumar', role: 'Founder & CEO', experience: '15+ years' },
    { name: 'Amit Singh', role: 'Head Mechanic', experience: '12+ years' },
    { name: 'Priya Sharma', role: 'Service Manager', experience: '8+ years' },
    { name: 'Vikram Patel', role: 'Quality Head', experience: '10+ years' }
  ]

  return (
    <div>
      <div style={{ paddingTop: '80px' }}>
        {/* Header */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
          <div className="container">
            <h1 className="text-white fw-bold mb-3">About Us</h1>
            <p className="text-white-50 mb-0">
              Learn more about Vehicle Management System
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="section">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <h2 className="fw-bold mb-4">Our Story</h2>
                <p className="text-muted lead">
                  Vehicle Management System was founded with a vision to revolutionize 
                  vehicle maintenance and repair services.
                </p>
                <p className="text-muted">
                  With over a decade of experience, we have grown from a small workshop 
                  to a trusted service center serving thousands of satisfied customers. 
                  Our commitment to quality, transparency, and customer satisfaction has 
                  helped us build lasting relationships with vehicle owners across the city.
                </p>
                <p className="text-muted">
                  We use advanced diagnostic tools, genuine parts, and employ certified 
                  mechanics to ensure your vehicle receives the best care possible. Our 
                  transparent pricing and real-time service tracking set us apart from 
                  traditional service centers.
                </p>
              </div>
              <div className="col-lg-6">
                <div className="bg-primary rounded-4 p-5 text-white text-center">
                  <i className="bi bi-tools display-1 mb-3"></i>
                  <h3 className="fw-bold">10+ Years of Excellence</h3>
                  <p className="mb-0">Serving the community with trusted vehicle care</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
          <div className="container">
            <div className="row g-4">
              {stats.map((stat, index) => (
                <div key={index} className="col-lg-3 col-md-6 text-center">
                  <h2 className="text-white fw-bold display-4">{stat.value}</h2>
                  <p className="text-white-50 mb-0">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section">
          <div className="container">
            <h2 className="text-center fw-bold mb-5">Our Values</h2>
            <div className="row g-4">
              {values.map((value, index) => (
                <div key={index} className="col-lg-3 col-md-6">
                  <div className="feature-card h-100">
                    <div className="feature-icon">
                      <i className={`bi ${value.icon}`}></i>
                    </div>
                    <h5 className="fw-bold">{value.title}</h5>
                    <p className="text-muted mb-0">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section bg-white">
          <div className="container">
            <h2 className="text-center fw-bold mb-5">Our Team</h2>
            <div className="row g-4">
              {team.map((member, index) => (
                <div key={index} className="col-lg-3 col-md-6">
                  <div className="card-custom text-center p-4">
                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '100px', height: '100px' }}>
                      <i className="bi bi-person display-4 text-white"></i>
                    </div>
                    <h5 className="fw-bold mb-1">{member.name}</h5>
                    <p className="text-accent mb-1" style={{ color: '#e94560' }}>{member.role}</p>
                    <small className="text-muted">{member.experience}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container text-center">
            <h2 className="text-white fw-bold">Ready to Experience Our Service?</h2>
            <p className="text-white-50 mb-4">
              Book your first service and see the difference
            </p>
            <Link to="/register" className="btn btn-light btn-lg px-4">
              Get Started <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default AboutPage
