import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import api from '../../services/api'
import toast from 'react-hot-toast'

const BillsPage = () => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBills()
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

  const handlePay = async (billId) => {
    try {
      await api.payments.process({ billId, amount: bills.find(b => b.id === billId)?.totalAmount })
      toast.success('Payment successful!')
      fetchBills()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed')
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
        <LoadingSpinner message="Loading bills..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-receipt me-2"></i>
        Bills
      </h4>

      {bills.length > 0 ? (
        <div className="row g-4">
          {bills.map((bill) => (
            <div key={bill.id} className="col-lg-6">
              <div className="card-custom h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="fw-bold mb-1">Bill #{bill.id?.slice(-6).toUpperCase()}</h6>
                      <p className="text-muted mb-0 small">
                        Booking: #{bill.booking?.id?.slice(-6).toUpperCase() || 'N/A'}
                      </p>
                    </div>
                    <StatusBadge status={bill.paymentStatus || 'UNPAID'} />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Service</span>
                      <span>{bill.booking?.service?.name || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Date</span>
                      <span>{formatDate(bill.createdAt)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted">Amount</span>
                      <span className="h5 text-primary mb-0">₹{bill.totalAmount || 0}</span>
                    </div>
                  </div>

                  {bill.items && bill.items.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-2">Bill Items:</small>
                      {bill.items.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between small">
                          <span>{item.description}</span>
                          <span>₹{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    {(bill.paymentStatus !== 'PAID') && (
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => handlePay(bill.id)}
                      >
                        <i className="bi bi-credit-card me-1"></i>
                        Pay Now
                      </button>
                    )}
                    <Link
                      to={`/dashboard/invoices?bill=${bill.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-file-earmark-text me-1"></i>
                      View Invoice
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bi-receipt"
          title="No Bills Found"
          message="Your bills will appear here after booking a service"
          actionText="Book a Service"
          actionLink="/dashboard/book-service"
        />
      )}
    </DashboardLayout>
  )
}

export default BillsPage
