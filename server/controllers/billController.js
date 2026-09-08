const { Bill, Booking, Payment, User, Vehicle, ServiceType } = require('../models');
const { generateInvoiceNumber } = require('../utils/helpers');

const getBills = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'CUSTOMER') {
      const bookings = await Booking.find({ userId: req.user.id }).select('_id');
      const bookingIds = bookings.map(b => b._id);
      query.bookingId = { $in: bookingIds };
    }

    const bills = await Bill.find(query)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      })
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      })
      .populate('paymentId');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (req.user.role === 'CUSTOMER' && bill.bookingId.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createBill = async (req, res) => {
  try {
    const { bookingId, subtotal, discount, tax, taxRate, additionalCharges, partsCost, laborCost } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const existingBill = await Bill.findOne({ bookingId });
    if (existingBill) {
      return res.status(400).json({ success: false, message: 'Bill already exists for this booking' });
    }

    const invoiceNumber = generateInvoiceNumber();
    const taxAmount = tax || (subtotal * (taxRate || 18) / 100);
    const grandTotal = subtotal - (discount || 0) + taxAmount + (additionalCharges || 0);

    const bill = await Bill.create({
      bookingId,
      invoiceNumber,
      subtotal,
      discount: discount || 0,
      tax: taxAmount,
      taxRate: taxRate || 18,
      additionalCharges: additionalCharges || 0,
      grandTotal,
      partsCost: partsCost || 0,
      laborCost: laborCost || 0
    });

    const fullBill = await Bill.findById(bill._id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      });

    res.status(201).json({ success: true, data: fullBill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getBillByBooking = async (req, res) => {
  try {
    const bill = await Bill.findOne({ bookingId: req.params.bookingId })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      })
      .populate('paymentId');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found for this booking' });
    }

    if (req.user.role === 'CUSTOMER' && bill.bookingId.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBills,
  getBill,
  createBill,
  getBillByBooking
};
