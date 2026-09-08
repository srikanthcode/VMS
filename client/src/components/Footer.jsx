import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <h5>
              <i className="bi bi-tools me-2"></i>VMS
            </h5>
            <p className="mb-3">
              Your trusted partner for professional vehicle servicing and maintenance. 
              We provide fast, reliable, and affordable care for your bikes and vehicles.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-white fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/">Home</Link></li>
              <li className="mb-2"><Link to="/services">Services</Link></li>
              <li className="mb-2"><Link to="/about">About Us</Link></li>
              <li className="mb-2"><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Customer</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/login">Login</Link></li>
              <li className="mb-2"><Link to="/register">Register</Link></li>
              <li className="mb-2"><Link to="/dashboard">Dashboard</Link></li>
              <li className="mb-2"><Link to="/dashboard/book-service">Book Service</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Contact Info</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                123 Service Street, Auto Nagar
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                +91 98765 43210
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                info@vms.com
              </li>
              <li className="mb-2">
                <i className="bi bi-clock me-2"></i>
                Mon - Sat: 8:00 AM - 8:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0">
                &copy; {new Date().getFullYear()} Vehicle Management System. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <Link to="/privacy" className="me-3">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
