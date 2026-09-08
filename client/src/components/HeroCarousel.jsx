import { Link } from 'react-router-dom'

const HeroCarousel = () => {
  const slides = [
    {
      id: 1,
      title: 'Professional Bike Service',
      subtitle: 'Fast, Reliable & Affordable Vehicle Care',
      description: 'Get your bike serviced by certified mechanics at your doorstep. Quality service guaranteed.',
      btn1Text: 'Book Service',
      btn1Link: '/dashboard/book-service',
      btn2Text: 'View Services',
      btn2Link: '/services',
      image: '/images/hero-bg.png'
    },
    {
      id: 2,
      title: 'Expert Mechanics',
      subtitle: 'Complete service for your vehicle by certified professionals',
      description: 'Our experienced mechanics provide comprehensive maintenance and repair services.',
      btn1Text: 'View Services',
      btn1Link: '/services',
      btn2Text: 'About Us',
      btn2Link: '/about',
      image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=80'
    },
    {
      id: 3,
      title: 'Pickup & Drop Available',
      subtitle: 'Convenient vehicle servicing at your doorstep',
      description: 'No need to visit the service center. We pick up and deliver your vehicle.',
      btn1Text: 'Book Now',
      btn1Link: '/dashboard/book-service',
      btn2Text: 'Learn More',
      btn2Link: '/about',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80'
    }
  ]

  return (
    <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
      <div className="carousel-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
          />
        ))}
      </div>

      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-item ${index === 0 ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="overlay"></div>
            <div className="container h-100">
              <div className="row h-100 align-items-center">
                <div className="col-lg-8 hero-content">
                  <span className="badge bg-danger mb-3 px-3 py-2">Fast & Reliable Service</span>
                  <h1 className="hero-title">
                    {slide.title}
                  </h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.85)', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)' }}>{slide.description}</p>
                  <div className="d-flex gap-3 flex-wrap">
                    <Link to={slide.btn1Link} className="btn btn-accent btn-lg px-4">
                      <i className="bi bi-calendar-check me-2"></i>
                      {slide.btn1Text}
                    </Link>
                    <Link to={slide.btn2Link} className="btn btn-outline-light btn-lg px-4">
                      {slide.btn2Text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon"></span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon"></span>
      </button>
    </div>
  )
}

export default HeroCarousel
