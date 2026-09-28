import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../services/api'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'
import { syncChartDefaults, cartesianOptions } from '../../utils/chartTheme'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const AdminReportsPage = () => {
  const { theme } = useTheme()
  const [reportType, setReportType] = useState('revenue')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [reportType, dateRange])

  useEffect(() => {
    syncChartDefaults(theme)
  }, [theme])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (dateRange.start) params.startDate = dateRange.start
      if (dateRange.end) params.endDate = dateRange.end
      let response
      switch (reportType) {
        case 'revenue':
          response = await api.reports.revenue(params)
          break
        case 'services':
          response = await api.reports.services(params)
          break
        case 'bookings':
          response = await api.reports.bookings(params)
          break
        case 'customers':
          response = await api.reports.customers(params)
          break
        case 'mechanics':
          response = await api.reports.mechanics(params)
          break
        default:
          response = await api.reports.revenue(params)
      }
      setReportData(response.data)
    } catch (error) {
      console.error('Failed to fetch report:', error)
      toast.error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const reportList = Array.isArray(reportData) ? reportData : null

  const chartData = {
    revenue: {
      labels: reportData?.breakdown?.map(d => d.date) || [],
      datasets: [{
        label: 'Revenue (₹)',
        data: reportData?.breakdown?.map(d => d.revenue) || [],
        borderColor: '#e94560',
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    services: {
      labels: reportList ? reportList.map(d => d.ServiceType?.name || d.name) : [],
      datasets: [{
        label: 'Bookings',
        data: reportList ? reportList.map(d => parseInt(d.bookingCount) || d.count || 0) : [],
        backgroundColor: '#e94560'
      }]
    },
    bookings: {
      labels: reportData?.byStatus?.map(d => d.status?.replace('_', ' ')) || [],
      datasets: [{
        label: 'Bookings',
        data: reportData?.byStatus?.map(d => d.count) || [],
        backgroundColor: ['#ffc107', '#17a2b8', '#6ea8fe', '#28a745', '#dc3545']
      }]
    },
    customers: {
      labels: reportData?.registrationTrend?.map(d => d.date) || [],
      datasets: [{
        label: 'New Customers',
        data: reportData?.registrationTrend?.map(d => d.count) || [],
        borderColor: '#e94560',
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    mechanics: {
      labels: reportList ? reportList.map(d => d.name) : [],
      datasets: [{
        label: 'Completed Services',
        data: reportList ? reportList.map(d => d.completedServices) : [],
        backgroundColor: '#6ea8fe'
      }, {
        label: 'Total Services',
        data: reportList ? reportList.map(d => d.totalServices) : [],
        backgroundColor: '#e94560'
      }]
    }
  }

  const handleExport = () => {
    toast.success('Report exported successfully!')
  }

  return (
    <DashboardLayout role="admin">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Reports</h4>
        <button className="btn btn-accent" onClick={handleExport}>
          <i className="bi bi-download me-2"></i>
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="card-custom p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Report Type</label>
            <select
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="revenue">Revenue</option>
              <option value="services">Services</option>
              <option value="bookings">Bookings</option>
              <option value="customers">Customers</option>
              <option value="mechanics">Mechanics</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary w-100" onClick={fetchReport}>
              <i className="bi bi-search me-2"></i>
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card-custom p-4">
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <div style={{ height: '400px' }}>
            {reportType === 'revenue' ? (
              <Line data={chartData.revenue} options={cartesianOptions(theme)} />
            ) : (
              <Bar data={chartData[reportType] || chartData.bookings} options={cartesianOptions(theme)} />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminReportsPage
