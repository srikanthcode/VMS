import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import api from '../../services/api'
import toast from 'react-hot-toast'

const InvoicesPage = () => {
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
      toast.success('Invoice downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download invoice')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner message="Loading invoices..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-file-earmark-text me-2"></i>
        Invoices
      </h4>

      {invoices.length > 0 ? (
        <div className="table-custom">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Booking ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="fw-bold">{invoice.invoiceNumber || `INV-${invoice.id}`}</td>
                    <td>#{invoice.Booking?.bookingId || invoice.Booking?.id || 'N/A'}</td>
                    <td>{formatDate(invoice.createdAt)}</td>
                    <td className="text-primary fw-bold">₹{invoice.grandTotal || 0}</td>
                    <td>
                      <span className={`badge ${invoice.Payment?.status === 'PAID' ? 'bg-success' : 'bg-warning'}`}>
                        {invoice.Payment?.status || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleDownload(invoice.id)}
                      >
                        <i className="bi bi-download me-1"></i>
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="bi-file-earmark-text"
          title="No Invoices"
          message="Your invoices will appear here after completing a service"
        />
      )}
    </DashboardLayout>
  )
}

export default InvoicesPage
