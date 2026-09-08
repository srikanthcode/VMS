import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import api from '../../services/api'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend)

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    pendingServices: 0,
    activeServices: 0,
    completedServices: 0,
    revenue: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [serviceStats, setServiceStats] = useState([])
  const [bookingStatus, setBookingStatus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, bookingsRes, revenueRes] = await Promise.all([
        api.reports.dashboard().catch(() => ({ data: {} })),
        api.bookings.getAll({ limit: 10 }).catch(() => ({ data: { bookings: [] } })),
        api.reports.revenue({ period: 'monthly' }).catch(() => ({ data: { data: [] } }))
      ])

      const dashboard = dashboardRes.data
      setStats({
        totalCustomers: dashboard.totalCustomers || 0,
        totalVehicles: dashboard.totalVehicles || 0,
        pendingServices: dashboard.pendingBookings || 0,
        activeServices: dashboard.activeBookings || 0,
        completedServices: dashboard.completedBookings || 0,
        revenue: dashboard.totalRevenue || 0
      })

      setRecentBookings(bookingsRes.data.bookings || [])
      setRevenueData(revenueRes.data.data || [])

      // Mock service and booking stats
      setServiceStats([
        { name: 'Basic Service', count: 45 },
        { name: 'Premium Service', count: 32 },
        { name: 'Major Service', count: 18 },
        { name: 'Oil Change', count: 65 },
        { name: 'Brake Service', count: 28 }
      ])

      setBookingStatus([
        { status: 'PENDING', count: dashboard.pendingBookings || 12 },
        { status: 'CONFIRMED', count: dashboard.activeBookings || 8 },
        { status: 'SERVICE_IN_PROGRESS', count: 5 },
        { status: 'COMPLETED', count: dashboard.completedBookings || 45 },
        { status: 'CANCELLED', count: 3 }
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const revenueChartData = {
    labels: revenueData.map(d => d.month || d.label) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (₹)',
      data: revenueData.map(d => d.revenue || d.value) || [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: '#e94560',
      backgroundColor: 'rgba(233, 69, 96, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  const serviceChartData = {
    labels: serviceStats.map(s => s.name),
    datasets: [{
      data: serviceStats.map(s => s.count),
      backgroundColor: ['#e94560', '#1a1a2e', '#16213e', '#0f3460', '#17a2b8'],
      borderWidth: 0
    }]
  }

  const bookingChartData = {
    labels: bookingStatus.map(b => b.status.replace('_', ' ')),
    datasets: [{
      label: 'Bookings',
      data: bookingStatus.map(b => b.count),
      backgroundColor: ['#ffc107', '#17a2b8', '#007bff', '#28a745', '#dc3545'],
      borderWidth: 0
    }]
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center p-5">
          <div className="spinner-border text-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <h4 className="fw-bold mb-4">Admin Dashboard</h4>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-lg-2 col-md-4">
          <StatsCard icon="bi-people" title="Customers" value={stats.totalCustomers} color="primary" />
        </div>
        <div className="col-lg-2 col-md-4">
          <StatsCard icon="bi-car-front" title="Vehicles" value={stats.totalVehicles} color="info" />
        </div>
        <div className="col-lg-2 col-md-4">
          <StatsCard icon="bi-clock" title="Pending" value={stats.pendingServices} color="warning" />
        </div>
        <div className="col-lg-2 col-md-4">
          <StatsCard icon="bi-gear" title="Active" value={stats.activeServices} color="primary" />
        </div>
        <div className="col-lg-2 col-md-4">
          <StatsCard icon="bi-check-circle" title="Completed" value={stats.completedServices} color="success" />
        </div>
        <div className="col-lg-2 col-md-4">
          <StatsCard icon="bi-currency-rupee" title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="accent" />
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-3">Revenue Overview</h5>
            <div style={{ height: '300px' }}>
              <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-3">Services Distribution</h5>
            <div style={{ height: '300px' }}>
              <Doughnut data={serviceChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Bookings by Status */}
        <div className="col-lg-4">
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-3">Bookings by Status</h5>
            <div style={{ height: '250px' }}>
              <Bar data={bookingChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="col-lg-8">
          <div className="card-custom p-4">
            <h5 className="fw-bold mb-3">Recent Bookings</h5>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id?.slice(-6).toUpperCase()}</td>
                      <td>{booking.customer?.name || 'N/A'}</td>
                      <td>{booking.service?.name || 'N/A'}</td>
                      <td>{formatDate(booking.preferredDate)}</td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td>₹{booking.totalAmount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
