const { Payment, Bill, Booking, User, Vehicle } = require('../models');
const { generateTransactionId } = require('../utils/helpers');

const getPayments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'CUSTOMER') {
      const bookings = await Booking.find({ userId: req.user.id }).select('_id');
      const bookingIds = bookings.map(b => b._id);
      const bills = await Bill.find({ bookingId: { $in: bookingIds } }).select('_id');
      const billIds = bills.map(b => b._id);
      query.billId = { $in: billIds };
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'billId',
        populate: {
          path: 'bookingId',
          populate: [
            { path: 'userId', select: 'name email' },
            { path: 'vehicleId' }
          ]
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const processPayment = async (req, res) => {
  try {
    const { billId, paymentMethod } = req.body;

    const bill = await Bill.findById(billId).populate('bookingId');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (req.user.role === 'CUSTOMER' && bill.bookingId.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const existingPayment = await Payment.findOne({ billId, status: 'PAID' });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    const transactionId = generateTransactionId();

    let payment = await Payment.findOne({ billId });
    if (payment) {
      payment = await Payment.findByIdAndUpdate(payment._id, {
        amount: bill.grandTotal,
        paymentMethod,
        transactionId,
        status: 'PAID',
        paidAt: new Date()
      }, { new: true });
    } else {
      payment = await Payment.create({
        billId,
        amount: bill.grandTotal,
        paymentMethod,
        transactionId,
        status: 'PAID',
        paidAt: new Date()
      });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getPaymentByBill = async (req, res) => {
  try {
    const payment = await Payment.findOne({ billId: req.params.billId })
      .populate({
        path: 'billId',
        populate: {
          path: 'bookingId',
          populate: { path: 'userId', select: 'name email' }
        }
      });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPayments,
  processPayment,
  getPaymentByBill
};
