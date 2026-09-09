import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [showModal, setShowModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [formData, setFormData] = useState({ username: '', name: '', email: '', phone: '', role: 'CUSTOMER' })
  const [formLoading, setFormLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCustomers()
  }, [pagination.page])

  const fetchCustomers = async (search = '') => {
    try {
      setLoading(true)
      const response = await api.customers.getAll({ page: pagination.page, limit: pagination.limit, search })
      setCustomers(response.data.customers || response.data || [])
      setPagination(prev => ({
        ...prev,
        total: response.data.total || response.data.length || 0,
        totalPages: response.data.totalPages || 1
      }))
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedCustomer(null)
    setFormData({ username: '', name: '', email: '', phone: '', role: 'CUSTOMER' })
    setShowModal(true)
  }

  const handleEdit = (customer) => {
    setSelectedCustomer(customer)
    setFormData({ username: customer.username || '', name: customer.name, email: customer.email, phone: customer.phone || '', role: customer.role })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return
    try {
      await api.customers.delete(id)
      setCustomers(prev => prev.filter(c => c.id !== id))
      toast.success('Customer deleted successfully')
    } catch (error) {
      toast.error('Failed to delete customer')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormLoading(true)
    try {
      if (selectedCustomer) {
        await api.customers.update(selectedCustomer.id, formData)
        toast.success('Customer updated successfully')
      } else {
        await api.customers.create(formData)
        toast.success('Customer created successfully')
      }
      setShowModal(false)
      fetchCustomers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  const columns = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role', render: (val) => <span className={`badge ${val === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>{val}</span> },
    { key: 'createdAt', label: 'Joined', render: (val) => new Date(val).toLocaleDateString('en-IN') },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(row)}>
            <i className="bi bi-pencil"></i>
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout role="admin">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Customers</h4>
        <button className="btn btn-accent" onClick={handleAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Customer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onSearch={(search) => fetchCustomers(search)}
      />

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn btn-accent" onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <form className="form-custom">
          <div className="mb-3">
            <label className="form-label">Username *</label>
            <input
              type="text"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
              <option value="MECHANIC">Mechanic</option>
            </select>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

export default AdminCustomersPage
