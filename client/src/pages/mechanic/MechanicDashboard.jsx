import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import api from '../../services/api'
import toast from 'react-hot-toast'

const MechanicDashboard = () => {
  const [stats, setStats] = useState({
    assignedToday: 0,
    inProgress: 0,
    completedToday: 0,
    pending: 0
  })
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.bookings.getAll({ status: 'SERVICE_IN_PROGRESS' })
      const bookings = response.data.bookings || response.data || []
      
      setStats({
        assignedToday: bookings.filter(b => b.status === 'CONFIRMED').length,
        inProgress: bookings.filter(b => b.status === 'SERVICE_IN_PROGRESS').length,
        completedToday: bookings.filter(b => b.status === 'COMPLETED').length,
        pending: bookings.filter(b => b.status === 'PENDING').length
      })

      setAssignments(bookings.slice(0, 10))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (bookingId, status) => {
    try {
      await api.bookings.updateStatus(bookingId, { status })
      toast.success('Status updated successfully')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardLayout role="mechanic">
        <div className="text-center p-5">
          <div className="spinner-border text-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="mechanic">
      <h4 className="fw-bold mb-4">Mechanic Dashboard</h4>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <StatsCard icon="bi-calendar-check" title="Assigned Today" value={stats.assignedToday} color="primary" />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatsCard icon="bi-gear" title="In Progress" value={stats.inProgress} color="info" />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatsCard icon="bi-check-circle" title="Completed Today" value={stats.completedToday} color="success" />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatsCard icon="bi-clock" title="Pending" value={stats.pending} color="warning" />
        </div>
      </div>

      {/* Assignments */}
      <div className="card-custom p-4">
        <h5 className="fw-bold mb-3">My Assignments</h5>
        {assignments.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id?.slice(-6).toUpperCase()}</td>
                    <td>{booking.customer?.name || 'N/A'}</td>
                    <td>{booking.vehicle?.vehicleNumber || 'N/A'}</td>
                    <td>{booking.service?.name || 'N/A'}</td>
                    <td>{formatDate(booking.preferredDate)}</td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td>
                      <div className="d-flex gap-1">
                        {booking.status === 'CONFIRMED' && (
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleUpdateProgress(booking.id, 'SERVICE_IN_PROGRESS')}
                          >
                            Start
                          </button>
                        )}
                        {booking.status === 'SERVICE_IN_PROGRESS' && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleUpdateProgress(booking.id, 'COMPLETED')}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="bi bi-inbox display-4 text-muted"></i>
            <p className="text-muted mt-2">No assignments yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MechanicDashboard
