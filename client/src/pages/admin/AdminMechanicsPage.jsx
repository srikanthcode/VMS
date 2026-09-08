import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminMechanicsPage = () => {
  const [mechanics, setMechanics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedMechanic, setSelectedMechanic] = useState(null)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: '', experience: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchMechanics()
  }, [])

  const fetchMechanics = async () => {
    try {
      const response = await api.mechanics.getAll()
      setMechanics(response.data.mechanics || response.data || [])
    } catch (error) {
      console.error('Failed to fetch mechanics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedMechanic(null)
    setFormData({ name: '', email: '', phone: '', specialization: '', experience: '' })
    setShowModal(true)
  }

  const handleEdit = (mechanic) => {
    setSelectedMechanic(mechanic)
    setFormData({
      name: mechanic.name,
      email: mechanic.email,
      phone: mechanic.phone || '',
      specialization: mechanic.specialization || '',
      experience: mechanic.experience || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mechanic?')) return
    try {
      await api.mechanics.delete(id)
      setMechanics(prev => prev.filter(m => m.id !== id))
      toast.success('Mechanic deleted successfully')
    } catch (error) {
      toast.error('Failed to delete mechanic')
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.mechanics.update(id, { isActive: !currentStatus })
      setMechanics(prev => prev.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m))
      toast.success('Mechanic status updated')
    } catch (error) {
      toast.error('Failed to update status')
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
      if (selectedMechanic) {
        await api.mechanics.update(selectedMechanic.id, formData)
        toast.success('Mechanic updated successfully')
      } else {
        await api.mechanics.create(formData)
        toast.success('Mechanic created successfully')
      }
      setShowModal(false)
      fetchMechanics()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'experience', label: 'Experience' },
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
        <h4 className="fw-bold mb-0">Mechanics</h4>
        <button className="btn btn-accent" onClick={handleAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Mechanic
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mechanics}
        loading={loading}
      />

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={selectedMechanic ? 'Edit Mechanic' : 'Add Mechanic'}
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
              <label className="form-label">Name *</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                className="form-control"
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="e.g., Engine, Brakes"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Experience (years)</label>
              <input
                type="number"
                className="form-control"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              />
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

export default AdminMechanicsPage
