import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.payments.getAll()
      setPayments(response.data.payments || response.data || [])
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const columns = [
    { key: 'id', label: 'Payment ID', render: (val) => `#${val}` },
    { key: 'Bill', label: 'Bill ID', render: (val) => val?.invoiceNumber || (val?.id ? `#${val.id}` : 'N/A') },
    { key: 'amount', label: 'Amount', render: (val) => `₹${val}`, sortable: true },
    { key: 'paymentMethod', label: 'Method', render: (val) => val || 'Online' },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge ${val === 'PAID' ? 'bg-success' : 'bg-warning'}`}>{val || 'PENDING'}</span> },
    { key: 'createdAt', label: 'Date', render: (val) => formatDate(val), sortable: true }
  ]

  return (
    <DashboardLayout role="admin">
      <h4 className="fw-bold mb-4">Payments</h4>
      <DataTable columns={columns} data={payments} loading={loading} />
    </DashboardLayout>
  )
}

export default AdminPaymentsPage
