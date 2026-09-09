import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminBillingPage = () => {
  const [bills, setBills] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    bookingId: '', items: [{ description: '', amount: '' }], tax: 0, notes: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchBills()
    fetchBookings()
  }, [])

  const fetchBills = async () => {
    try {
      const response = await api.bills.getAll()
      setBills(response.data.bills || response.data || [])
    } catch (error) {
      console.error('Failed to fetch bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await api.bookings.getAll({ status: 'COMPLETED' })
      setBookings(response.data.bookings || response.data || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: '' }]
    }))
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }))
  }

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    return subtotal + (Number(formData.tax) || 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.bookingId) {
      toast.error('Please select a booking')
      return
    }

    setFormLoading(true)
    try {
      const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
      const data = {
        bookingId: formData.bookingId,
        subtotal,
        tax: Number(formData.tax) || 0,
        taxRate: 18,
        additionalCharges: 0,
        partsCost: 0,
        laborCost: 0
      }
      await api.bills.create(data)
      toast.success('Bill created successfully')
      setShowModal(false)
      fetchBills()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create bill')
    } finally {
      setFormLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: (val) => val || 'N/A' },
    { key: 'Booking', label: 'Booking', render: (val) => `#${val?.bookingId || val?.id || 'N/A'}` },
    { key: 'grandTotal', label: 'Amount', render: (val) => `₹${val}`, sortable: true },
    { key: 'Payment', label: 'Payment', render: (val, row) => {
      const status = val?.status || (row.Payments && row.Payments.length > 0 ? row.Payments[0].status : null)
      return <span className={`badge ${status === 'PAID' ? 'bg-success' : 'bg-warning'}`}>{status || 'UNPAID'}</span>
    }},
    { key: 'createdAt', label: 'Date', render: (val) => formatDate(val), sortable: true }
  ]

  return (
    <DashboardLayout role="admin">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Billing</h4>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Create Bill
        </button>
      </div>

      <DataTable columns={columns} data={bills} loading={loading} />

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Create Bill"
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn btn-accent" onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Bill'}
            </button>
          </>
        }
      >
        <form className="form-custom">
          <div className="mb-3">
            <label className="form-label">Select Booking *</label>
            <select
              className="form-select"
              value={formData.bookingId}
              onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
            >
              <option value="">Choose a booking</option>
              {bookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  #{booking.bookingId || booking.id} - {booking.user?.name || 'N/A'} - {booking.ServiceType?.name || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Bill Items</label>
            {formData.items.map((item, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                  style={{ width: '120px' }}
                />
                {formData.items.length > 1 && (
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveItem(index)}>
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={handleAddItem}>
              <i className="bi bi-plus me-1"></i> Add Item
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Tax (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.tax}
                onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Total Amount</label>
              <div className="form-control bg-light fw-bold">₹{calculateTotal()}</div>
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            ></textarea>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

export default AdminBillingPage
