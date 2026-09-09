import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', duration: '', includes: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await api.services.getAll()
      setServices(response.data.services || response.data || [])
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedService(null)
    setFormData({ name: '', description: '', price: '', duration: '', includes: '' })
    setShowModal(true)
  }

  const handleEdit = (service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration || '',
      includes: service.includes?.join(', ') || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return
    try {
      await api.services.delete(id)
      setServices(prev => prev.filter(s => s.id !== id))
      toast.success('Service deleted successfully')
    } catch (error) {
      toast.error('Failed to delete service')
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.services.update(id, { isActive: !currentStatus })
      setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s))
      toast.success('Service status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price) newErrors.price = 'Price is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormLoading(true)
    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        includes: formData.includes ? formData.includes.split(',').map(i => i.trim()) : []
      }
      if (selectedService) {
        await api.services.update(selectedService.id, data)
        toast.success('Service updated successfully')
      } else {
        await api.services.create(data)
        toast.success('Service created successfully')
      }
      setShowModal(false)
      fetchServices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Service Name', sortable: true },
    { key: 'price', label: 'Price', render: (val) => `₹${val}`, sortable: true },
    { key: 'duration', label: 'Duration' },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${val !== false ? 'bg-success' : 'bg-secondary'}`}>
          {val !== false ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(row)}>
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className={`btn btn-sm ${row.isActive !== false ? 'btn-outline-warning' : 'btn-outline-success'}`}
            onClick={() => handleToggleStatus(row.id, row.isActive)}
          >
            <i className={`bi ${row.isActive !== false ? 'bi-pause' : 'bi-play'}`}></i>
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
        <h4 className="fw-bold mb-0">Services</h4>
        <button className="btn btn-accent" onClick={handleAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Service
        </button>
      </div>

      <DataTable
        columns={columns}
        data={services}
        loading={loading}
      />

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={selectedService ? 'Edit Service' : 'Add Service'}
        size="lg"
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
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Service Name *</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="number"
                className="form-control"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 60"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Includes (comma separated)</label>
              <input
                type="text"
                className="form-control"
                value={formData.includes}
                onChange={(e) => setFormData(prev => ({ ...prev, includes: e.target.value }))}
                placeholder="e.g., Oil change, Filter replacement"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description *</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              ></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

export default AdminServicesPage
