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
    const handler = () => fetchDashboardData()
    window.addEventListener('vms:booking', handler)
    window.addEventListener('vms:payment', handler)
    window.addEventListener('vms:bill', handler)
    window.addEventListener('vms:review', handler)
    return () => {
      window.removeEventListener('vms:booking', handler)
      window.removeEventListener('vms:payment', handler)
      window.removeEventListener('vms:bill', handler)
      window.removeEventListener('vms:review', handler)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, bookingsRes, revenueRes, servicesRes] = await Promise.all([
        api.reports.dashboard().catch(() => ({ data: {} })),
        api.bookings.getAll({ limit: 10 }).catch(() => ({ data: [] })),
        api.reports.revenue({ period: 'monthly' }).catch(() => ({ data: {} })),
        api.services.getAll().catch(() => ({ data: [] }))
      ])

      const dashboard = dashboardRes.data
      setStats({
        totalCustomers: dashboard.totalCustomers || 0,
        totalVehicles: dashboard.totalVehicles || 0,
        pendingServices: dashboard.pendingBookings || 0,
        activeServices: dashboard.activeServices || 0,
        completedServices: dashboard.completedBookings || 0,
        revenue: dashboard.totalRevenue || 0
      })

      const bookingData = bookingsRes.data
      const allBookings = bookingData.bookings || bookingData || []
      setRecentBookings(allBookings)

      const revenueBreakdown = revenueRes.data
      setRevenueData(revenueBreakdown.breakdown || revenueBreakdown.data || [])

      const servicesList = servicesRes.data.services || servicesRes.data || []
      const counts = {}
      allBookings.forEach(b => {
        const name = b.ServiceType?.name || 'Other'
        counts[name] = (counts[name] || 0) + 1
      })
      const realServiceStats = Object.entries(counts).map(([name, count]) => ({ name, count }))
      setServiceStats(
        realServiceStats.length > 0
          ? realServiceStats
          : servicesList.slice(0, 5).map(s => ({ name: s.name, count: 0 }))
      )

      const statusCounts = { PENDING: 0, CONFIRMED: 0, SERVICE_IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 }
      allBookings.forEach(b => {
        if (statusCounts[b.status] != null) statusCounts[b.status]++
      })
      setBookingStatus([
        { status: 'PENDING', count: dashboard.pendingBookings || statusCounts.PENDING },
        { status: 'CONFIRMED', count: dashboard.activeBookings || statusCounts.CONFIRMED },
        { status: 'SERVICE_IN_PROGRESS', count: statusCounts.SERVICE_IN_PROGRESS },
        { status: 'COMPLETED', count: dashboard.completedBookings || statusCounts.COMPLETED },
        { status: 'CANCELLED', count: statusCounts.CANCELLED }
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
    labels: revenueData.map(d => d.date) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (₹)',
      data: revenueData.map(d => d.revenue) || [12000, 19000, 15000, 25000, 22000, 30000],
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
                      <td>#{booking.bookingId || booking.id}</td>
                      <td>{booking.user?.name || 'N/A'}</td>
                      <td>{booking.ServiceType?.name || 'N/A'}</td>
                      <td>{formatDate(booking.preferredDate)}</td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td>₹{booking.estimatedPrice || 0}</td>
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
