import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [mechanics, setMechanics] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedMechanic, setSelectedMechanic] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchBookings()
    fetchMechanics()
  }, [pagination.page, statusFilter])

  const fetchBookings = async (search = '') => {
    try {
      setLoading(true)
      const params = { page: pagination.page, limit: pagination.limit, search }
      if (statusFilter !== 'ALL') params.status = statusFilter
      const response = await api.bookings.getAll(params)
      setBookings(response.data.bookings || response.data || [])
      setPagination(prev => ({
        ...prev,
        total: response.data.total || response.data.length || 0,
        totalPages: response.data.totalPages || 1
      }))
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMechanics = async () => {
    try {
      const response = await api.mechanics.getAll()
      setMechanics(response.data.mechanics || response.data || [])
    } catch (error) {
      console.error('Failed to fetch mechanics:', error)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.bookings.updateStatus(id, { status })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
      toast.success(`Booking ${status.toLowerCase()} successfully`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleAssignMechanic = async () => {
    if (!selectedBooking || !selectedMechanic) return

    setAssigning(true)
    try {
      await api.bookings.assignMechanic(selectedBooking.id, { mechanicId: selectedMechanic })
      toast.success('Mechanic assigned successfully')
      setShowAssignModal(false)
      setSelectedBooking(null)
      setSelectedMechanic('')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to assign mechanic')
    } finally {
      setAssigning(false)
    }
  }

  const openAssignModal = (booking) => {
    setSelectedBooking(booking)
    setSelectedMechanic(booking.mechanic?.id || '')
    setShowAssignModal(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const columns = [
    { key: 'bookingId', label: 'Booking ID', render: (val) => `#${val || 'N/A'}` },
    { key: 'user', label: 'Customer', render: (val) => val?.name || 'N/A' },
    { key: 'Vehicle', label: 'Vehicle', render: (val) => val?.vehicleNumber || 'N/A' },
    { key: 'ServiceType', label: 'Service', render: (val) => val?.name || 'N/A' },
    { key: 'preferredDate', label: 'Date', render: (val) => formatDate(val), sortable: true },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'estimatedPrice', label: 'Amount', render: (val) => `₹${val || 0}`, sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1 flex-wrap">
          {row.status === 'PENDING' && (
            <button className="btn btn-sm btn-outline-success" onClick={() => handleUpdateStatus(row.id, 'CONFIRMED')}>
              <i className="bi bi-check"></i>
            </button>
          )}
          {['PENDING', 'CONFIRMED'].includes(row.status) && (
            <button className="btn btn-sm btn-outline-primary" onClick={() => openAssignModal(row)}>
              <i className="bi bi-person-plus"></i>
            </button>
          )}
          {row.status === 'CONFIRMED' && (
            <button className="btn btn-sm btn-outline-info" onClick={() => handleUpdateStatus(row.id, 'SERVICE_IN_PROGRESS')}>
              <i className="bi bi-play"></i>
            </button>
          )}
          {row.status === 'SERVICE_IN_PROGRESS' && (
            <button className="btn btn-sm btn-outline-success" onClick={() => handleUpdateStatus(row.id, 'COMPLETED')}>
              <i className="bi bi-check-circle"></i>
            </button>
          )}
          {['PENDING', 'CONFIRMED'].includes(row.status) && (
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleUpdateStatus(row.id, 'CANCELLED')}>
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <DashboardLayout role="admin">
      <h4 className="fw-bold mb-4">Bookings</h4>

      <div className="mb-3">
        <div className="d-flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'CONFIRMED', 'SERVICE_IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => { setStatusFilter(status); setPagination(prev => ({ ...prev, page: 1 })) }}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onSearch={(search) => fetchBookings(search)}
      />

      <Modal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Mechanic"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
            <button type="button" className="btn btn-accent" onClick={handleAssignMechanic} disabled={assigning || !selectedMechanic}>
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </>
        }
      >
        <div className="mb-3">
          <label className="form-label">Select Mechanic</label>
          <select
            className="form-select"
            value={selectedMechanic}
            onChange={(e) => setSelectedMechanic(e.target.value)}
          >
            <option value="">Choose a mechanic</option>
                {mechanics.filter(m => m.isActive !== false).map(mechanic => (
                  <option key={mechanic.id} value={mechanic.id}>
                    {mechanic.name}
                  </option>
            ))}
          </select>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default AdminBookingsPage
