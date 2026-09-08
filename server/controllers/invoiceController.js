const { Bill, Booking, Payment, User, Vehicle, ServiceType } = require('../models');
const { generateInvoice } = require('../utils/pdfGenerator');

const getInvoices = async (req, res) => {
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
          { path: 'userId', select: 'name email phone' },
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

const getInvoice = async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (req.user.role === 'CUSTOMER' && bill.bookingId.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const generateInvoicePDF = async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (req.user.role === 'CUSTOMER' && bill.bookingId.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const pdfBuffer = await generateInvoice({
      invoiceNumber: bill.invoiceNumber,
      date: bill.createdAt,
      customer: {
        name: bill.bookingId.userId.name,
        email: bill.bookingId.userId.email,
        phone: bill.bookingId.userId.phone
      },
      vehicle: {
        number: bill.bookingId.vehicleId.vehicleNumber,
        brand: bill.bookingId.vehicleId.brand,
        model: bill.bookingId.vehicleId.model
      },
      service: {
        name: bill.bookingId.serviceTypeId.name,
        description: bill.bookingId.serviceTypeId.description
      },
      items: [
        { description: bill.bookingId.serviceTypeId.name, amount: bill.subtotal }
      ],
      subtotal: bill.subtotal,
      discount: bill.discount,
      taxRate: bill.taxRate,
      tax: bill.tax,
      additionalCharges: bill.additionalCharges,
      grandTotal: bill.grandTotal,
      paymentStatus: bill.paymentId ? bill.paymentId.status : 'PENDING'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  generateInvoicePDF
};
