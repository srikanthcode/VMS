import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

const auth = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  verifyOTP: (data) => apiClient.post('/auth/verify-otp', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data)
}

const vehicles = {
  getAll: (params) => apiClient.get('/vehicles', { params }),
  getById: (id) => apiClient.get(`/vehicles/${id}`),
  create: (data) => apiClient.post('/vehicles', data),
  update: (id, data) => apiClient.put(`/vehicles/${id}`, data),
  delete: (id) => apiClient.delete(`/vehicles/${id}`)
}

const services = {
  getAll: (params) => apiClient.get('/services', { params }),
  getById: (id) => apiClient.get(`/services/${id}`),
  create: (data) => apiClient.post('/services', data),
  update: (id, data) => apiClient.put(`/services/${id}`, data),
  delete: (id) => apiClient.delete(`/services/${id}`)
}

const bookings = {
  getAll: (params) => apiClient.get('/bookings', { params }),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  create: (data) => apiClient.post('/bookings', data),
  update: (id, data) => apiClient.put(`/bookings/${id}`, data),
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`),
  updateStatus: (id, data) => apiClient.put(`/bookings/${id}/status`, data),
  assignMechanic: (id, data) => apiClient.put(`/bookings/${id}/assign`, data)
}

const mechanics = {
  getAll: (params) => apiClient.get('/mechanics', { params }),
  getById: (id) => apiClient.get(`/mechanics/${id}`),
  create: (data) => apiClient.post('/mechanics', data),
  update: (id, data) => apiClient.put(`/mechanics/${id}`, data),
  toggleStatus: (id) => apiClient.put(`/mechanics/${id}/toggle-status`),
  getBookings: (id, params) => apiClient.get(`/mechanics/${id}/bookings`, { params }),
  updateProgress: (id, data) => apiClient.put(`/mechanics/bookings/${id}/progress`, data)
}

const bills = {
  getAll: (params) => apiClient.get('/bills', { params }),
  getById: (id) => apiClient.get(`/bills/${id}`),
  create: (data) => apiClient.post('/bills', data),
  getByBooking: (bookingId) => apiClient.get(`/bills/booking/${bookingId}`)
}

const payments = {
  getAll: (params) => apiClient.get('/payments', { params }),
  process: (data) => apiClient.post('/payments', data),
  getByBill: (billId) => apiClient.get(`/payments/bill/${billId}`)
}

const invoices = {
  getAll: (params) => apiClient.get('/invoices', { params }),
  getById: (id) => apiClient.get(`/invoices/${id}`),
  generatePdf: (id) => apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
}

const notifications = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put('/notifications/read-all'),
  unreadCount: () => apiClient.get('/notifications/unread-count')
}

const reviews = {
  getAll: (params) => apiClient.get('/reviews', { params }),
  getMy: (params) => apiClient.get('/reviews/my', { params }),
  create: (data) => apiClient.post('/reviews', data),
  update: (id, data) => apiClient.put(`/reviews/${id}`, data),
  delete: (id) => apiClient.delete(`/reviews/${id}`)
}

const customers = {
  getAll: (params) => apiClient.get('/customers', { params }),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`)
}

const pickups = {
  create: (data) => apiClient.post('/pickups', data),
  getById: (id) => apiClient.get(`/pickups/${id}`),
  updateStatus: (id, data) => apiClient.put(`/pickups/${id}/status`, data)
}

const reports = {
  revenue: (params) => apiClient.get('/reports/revenue', { params }),
  services: (params) => apiClient.get('/reports/services', { params }),
  bookings: (params) => apiClient.get('/reports/bookings', { params }),
  customers: (params) => apiClient.get('/reports/customers', { params }),
  mechanics: (params) => apiClient.get('/reports/mechanics', { params }),
  dashboard: (params) => apiClient.get('/reports/dashboard', { params })
}

const location = {
  update: (data) => apiClient.put('/location/update', data),
  trackAll: () => apiClient.get('/location/track'),
  getUser: (id) => apiClient.get(`/location/user/${id}`)
}

const api = {
  auth,
  vehicles,
  services,
  bookings,
  mechanics,
  bills,
  payments,
  invoices,
  notifications,
  reviews,
  customers,
  pickups,
  reports,
  location
}

export default api
