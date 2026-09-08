import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PaymentsPage = () => {
  const [payments, setPayments] = useState([])
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [paymentsRes, billsRes] = await Promise.all([
        api.payments.getAll().catch(() => ({ data: { payments: [] } })),
        api.bills.getAll().catch(() => ({ data: { bills: [] } }))
      ])
      setPayments(paymentsRes.data.payments || paymentsRes.data || [])
      setBills(billsRes.data.bills || billsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = (bill) => {
    setSelectedBill(bill)
    setShowPaymentModal(true)
  }

  const processPayment = async () => {
    if (!selectedBill) return

    setProcessing(true)
    try {
      await api.payments.process({
        billId: selectedBill.id,
        amount: selectedBill.totalAmount,
        paymentMethod
      })
      toast.success('Payment successful!')
      setShowPaymentModal(false)
      setSelectedBill(null)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unpaidBills = bills.filter(bill => bill.paymentStatus !== 'PAID')

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner message="Loading payments..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-credit-card me-2"></i>
        Payments
      </h4>

      {/* Pending Payments */}
      {unpaidBills.length > 0 && (
        <div className="card-custom p-4 mb-4">
          <h5 className="fw-bold mb-3">
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Pending Payments
          </h5>
          <div className="row g-3">
            {unpaidBills.map((bill) => (
              <div key={bill.id} className="col-md-6 col-lg-4">
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted">Bill #{bill.id?.slice(-6).toUpperCase()}</span>
                    <StatusBadge status="UNPAID" />
                  </div>
                  <h5 className="text-primary mb-2">₹{bill.totalAmount}</h5>
                  <button
                    className="btn btn-accent btn-sm w-100"
                    onClick={() => handlePay(bill)}
                  >
                    <i className="bi bi-credit-card me-1"></i>
                    Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="card-custom p-4">
        <h5 className="fw-bold mb-3">Payment History</h5>
        {payments.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Bill ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.id?.slice(-6).toUpperCase()}</td>
                    <td>#{payment.bill?.id?.slice(-6).toUpperCase() || 'N/A'}</td>
                    <td className="fw-bold">₹{payment.amount}</td>
                    <td>
                      <i className="bi bi-credit-card me-1"></i>
                      {payment.paymentMethod || 'Online'}
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td><StatusBadge status={payment.status || 'COMPLETED'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="bi-credit-card"
            title="No Payment History"
            message="Your payment history will appear here"
          />
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Process Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="mb-1">Bill Amount</p>
                  <h3 className="text-primary">₹{selectedBill?.totalAmount}</h3>
                </div>
                <div className="mb-3">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="online">Online Payment</option>
                    <option value="upi">UPI</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-1"></i>
                    This is a simulated payment. No real transaction will occur.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={processPayment}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Pay ₹{selectedBill?.totalAmount}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default PaymentsPage
