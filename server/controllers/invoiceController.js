const { Bill, Booking, Payment, User, Vehicle, ServiceType } = require('../models');
const { Op } = require('sequelize');
const { generateInvoice } = require('../utils/pdfGenerator');

const getInvoices = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === 'CUSTOMER') {
      const bookings = await Booking.findAll({
        where: { userId: req.user.id },
        attributes: ['id']
      });
      const bookingIds = bookings.map(b => b.id);
      where.bookingId = { [Op.in]: bookingIds };
    }

    const bills = await Bill.findAll({
      where,
      include: [
        {
          model: Booking,
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
            { model: ServiceType }
          ]
        },
        { model: Payment }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [
        {
          model: Booking,
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
            { model: ServiceType }
          ]
        },
        { model: Payment }
      ]
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (req.user.role === 'CUSTOMER' && bill.Booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const generateInvoicePDF = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [
        {
          model: Booking,
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
            { model: ServiceType }
          ]
        },
        { model: Payment }
      ]
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (req.user.role === 'CUSTOMER' && bill.Booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const pdfBuffer = await generateInvoice({
      invoiceNumber: bill.invoiceNumber,
      date: bill.createdAt,
      customer: {
        name: bill.Booking.User.name,
        email: bill.Booking.User.email,
        phone: bill.Booking.User.phone
      },
      vehicle: {
        number: bill.Booking.Vehicle.vehicleNumber,
        brand: bill.Booking.Vehicle.brand,
        model: bill.Booking.Vehicle.model
      },
      service: {
        name: bill.Booking.ServiceType.name,
        description: bill.Booking.ServiceType.description
      },
      items: [
        { description: bill.Booking.ServiceType.name, amount: bill.subtotal }
      ],
      subtotal: bill.subtotal,
      discount: bill.discount,
      taxRate: bill.taxRate,
      tax: bill.tax,
      additionalCharges: bill.additionalCharges,
      grandTotal: bill.grandTotal,
      paymentStatus: bill.Payment ? bill.Payment.status : 'PENDING'
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
