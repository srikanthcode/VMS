const { Bill, Booking, Payment, User, Vehicle, ServiceType } = require('../models');
const { Op } = require('sequelize');
const { generateInvoiceNumber } = require('../utils/helpers');

const getBills = async (req, res) => {
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
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
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

const getBill = async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (req.user.role === 'CUSTOMER' && bill.Booking.userId !== req.user.id) {
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

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const existingBill = await Bill.findOne({ where: { bookingId } });
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

    const fullBill = await Bill.findByPk(bill.id, {
      include: [
        {
          model: Booking,
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
            { model: ServiceType }
          ]
        }
      ]
    });

    res.status(201).json({ success: true, data: fullBill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getBillByBooking = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      where: { bookingId: req.params.bookingId },
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
      return res.status(404).json({ success: false, message: 'Bill not found for this booking' });
    }

    if (req.user.role === 'CUSTOMER' && bill.Booking.userId !== req.user.id) {
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
