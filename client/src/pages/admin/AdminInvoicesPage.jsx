import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable from '../../components/DataTable'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await api.invoices.getAll()
      setInvoices(response.data.invoices || response.data || [])
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (invoiceId) => {
    try {
      const response = await api.invoices.generatePdf(invoiceId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${invoiceId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Invoice downloaded!')
    } catch (error) {
      toast.error('Failed to download invoice')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const columns = [
    { key: '_id', label: 'Invoice #', render: (val) => `INV-${val?.slice(-6).toUpperCase()}` },
    { key: 'booking', label: 'Booking', render: (val) => `#${val?.id?.slice(-6).toUpperCase() || 'N/A'}` },
    { key: 'totalAmount', label: 'Amount', render: (val) => `₹${val}`, sortable: true },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge ${val === 'PAID' ? 'bg-success' : 'bg-warning'}`}>{val || 'PENDING'}</span> },
    { key: 'createdAt', label: 'Date', render: (val) => formatDate(val), sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(row.id)}>
          <i className="bi bi-download me-1"></i> Download
        </button>
      )
    }
  ]

  return (
    <DashboardLayout role="admin">
      <h4 className="fw-bold mb-4">Invoices</h4>
      <DataTable columns={columns} data={invoices} loading={loading} />
    </DashboardLayout>
  )
}

export default AdminInvoicesPage
