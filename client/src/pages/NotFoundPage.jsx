import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const NotFoundPage = () => {
  return (
    <div>
      <div style={{ paddingTop: '80px' }}>
        <section className="section" style={{ minHeight: '70vh' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <div className="mb-4">
                  <i className="bi bi-exclamation-triangle display-1" style={{ color: '#ffc107', fontSize: '8rem' }}></i>
                </div>
                <h1 className="display-4 fw-bold mb-3">404</h1>
                <h3 className="mb-3">Page Not Found</h3>
                <p className="text-muted mb-4">
                  Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="btn btn-accent btn-lg px-4">
                  <i className="bi bi-house me-2"></i>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default NotFoundPage
