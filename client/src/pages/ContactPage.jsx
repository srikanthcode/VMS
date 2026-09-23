import { useState } from 'react'
import Footer from '../components/Footer'
import api from '../services/api'
import toast from 'react-hot-toast'

const OFFICE_ADDRESS = 'Village Road, Pallikaranai, Chennai, Tamil Nadu 600100'
const OFFICE_LAT = 12.9684
const OFFICE_LNG = 80.2440
const MAP_QUERY = encodeURIComponent(`${OFFICE_ADDRESS} (${OFFICE_LAT},${OFFICE_LNG})`)

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await api.contact.send(formData)
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    { icon: 'bi-geo-alt', title: 'Address', value: OFFICE_ADDRESS },
    { icon: 'bi-telephone', title: 'Phone', value: '+91 98765 43210' },
    { icon: 'bi-envelope', title: 'Email', value: 'info@vms.com' },
    { icon: 'bi-clock', title: 'Working Hours', value: 'Mon - Sat: 8:00 AM - 8:00 PM' }
  ]

  return (
    <div>
      <div style={{ paddingTop: '80px' }}>
        {/* Header */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
          <div className="container">
            <h1 className="text-white fw-bold mb-3">Contact Us</h1>
            <p className="text-white-50 mb-0">
              Get in touch with our team
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="section">
          <div className="container">
            <div className="row g-5">
              {/* Contact Form */}
              <div className="col-lg-7">
                <div className="card-custom p-4">
                  <h3 className="fw-bold mb-4">Send us a Message</h3>
                  <form onSubmit={handleSubmit} className="form-custom">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Name *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Your email"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label">Subject *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Subject"
                        />
                        {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label">Message *</label>
                        <textarea
                          className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                          name="message"
                          rows="5"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Your message"
                        ></textarea>
                        {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-accent btn-lg"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Contact Info */}
              <div className="col-lg-5">
                <div className="card-custom p-4 mb-4">
                  <h4 className="fw-bold mb-4">Contact Information</h4>
                  {contactInfo.map((info, index) => (
                    <div key={index} className="d-flex align-items-start mb-3">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
                        <i className={`bi ${info.icon} text-white`}></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{info.title}</h6>
                        <p className="text-muted mb-0">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card-custom p-4">
                  <h5 className="fw-bold mb-3">Follow Us</h5>
                  <div className="d-flex gap-3">
                    <a href="#" className="btn btn-outline-primary btn-lg">
                      <i className="bi bi-facebook"></i>
                    </a>
                    <a href="#" className="btn btn-outline-info btn-lg">
                      <i className="bi bi-twitter"></i>
                    </a>
                    <a href="#" className="btn btn-outline-danger btn-lg">
                      <i className="bi bi-instagram"></i>
                    </a>
                    <a href="#" className="btn btn-outline-primary btn-lg">
                      <i className="bi bi-linkedin"></i>
                    </a>
                  </div>
                </div>

                {/* Google Map */}
                <div className="card-custom p-4 mt-4">
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-geo-alt me-2"></i>
                    Our Location
                  </h5>
                  <div className="rounded overflow-hidden" style={{ height: '260px', position: 'relative', background: '#e9ecef' }}>
                    <iframe
                      title="VMS Location - Google Maps"
                      src={`https://www.google.com/maps?q=${MAP_QUERY}&z=15&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">Live Google Map</small>
                    <a
                      href={`https://www.google.com/maps?q=${MAP_QUERY}`}
                      target="_blank"
                      rel="noreferrer"
                      className="small text-decoration-none"
                    >
                      Open in Google Maps <i className="bi bi-box-arrow-up-right ms-1"></i>
                    </a>
                  </div>
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

export default ContactPage
