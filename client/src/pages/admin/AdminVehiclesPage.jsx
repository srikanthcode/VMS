import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchVehicles(searchTerm)
  }, [pagination.page])

  const fetchVehicles = async (search = searchTerm, page = pagination.page) => {
    try {
      setLoading(true)
      const response = await api.vehicles.getAll({ page, limit: pagination.limit, search })
      setVehicles(response.data.vehicles || response.data || [])
      setPagination(prev => ({
        ...prev,
        page,
        total: response.data.total || response.data.length || 0,
        totalPages: response.data.totalPages || 1
      }))
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (search) => {
    setSearchTerm(search)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchVehicles(search, 1)
  }

  const columns = [
    { key: 'vehicleNumber', label: 'Vehicle Number', sortable: true },
    { key: 'brand', label: 'Brand', sortable: true },
    { key: 'model', label: 'Model' },
    { key: 'vehicleType', label: 'Type' },
    { key: 'fuelType', label: 'Fuel' },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'owner',
      label: 'Owner',
      render: (_, row) => row.owner?.name || row.user?.name || 'N/A'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button className="btn btn-sm btn-outline-primary" onClick={() => toast.success(`Vehicle: ${row.vehicleNumber}`)}>
          <i className="bi bi-eye"></i>
        </button>
      )
    }
  ]

  return (
    <DashboardLayout role="admin">
      <h4 className="fw-bold mb-4">All Vehicles</h4>
      <DataTable
        columns={columns}
        data={vehicles}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onSearch={handleSearch}
      />
    </DashboardLayout>
  )
}

export default AdminVehiclesPage
