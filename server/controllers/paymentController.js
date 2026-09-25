const { Payment, Bill, Booking, User, Vehicle } = require('../models');
const { Op } = require('sequelize');
const { generateTransactionId } = require('../utils/helpers');
const { emitToUser, emitToAdmins, emitBroadcast } = require('../socket');
const { createNotification } = require('./notificationController');

const getPayments = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === 'CUSTOMER') {
      const bookings = await Booking.findAll({
        where: { userId: req.user.id },
        attributes: ['id']
      });
      const bookingIds = bookings.map(b => b.id);
      const bills = await Bill.findAll({
        where: { bookingId: { [Op.in]: bookingIds } },
        attributes: ['id']
      });
      const billIds = bills.map(b => b.id);
      where.billId = { [Op.in]: billIds };
    }

    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: Bill,
          include: [
            {
              model: Booking,
              include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const processPayment = async (req, res) => {
  try {
    const { billId, paymentMethod } = req.body;

    const validMethods = ['CASH', 'CARD', 'UPI', 'NET_BANKING'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Valid payment method is required (CASH, CARD, UPI, NET_BANKING)' });
    }

    const bill = await Bill.findByPk(billId, {
      include: [{ model: Booking }]
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (req.user.role === 'CUSTOMER' && (!bill.Booking || bill.Booking.userId !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const existingPayment = await Payment.findOne({ where: { billId, status: 'PAID' } });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    const transactionId = generateTransactionId();

    let payment = await Payment.findOne({ where: { billId } });
    if (payment) {
      await payment.update({
        amount: bill.grandTotal,
        paymentMethod,
        transactionId,
        status: 'PAID',
        paidAt: new Date()
      });
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

    emitBroadcast('payment:updated', payment);
    emitToAdmins('payment:updated', payment);
    if (bill.Booking?.userId) {
      emitToUser(bill.Booking.userId, 'payment:updated', payment);
      await createNotification(
        bill.Booking.userId,
        'Payment Successful',
        `Payment of â‚¹${bill.grandTotal} received for invoice ${bill.invoiceNumber}.`,
        'PAYMENT'
      );
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getPaymentByBill = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { billId: req.params.billId },
      include: [
        {
          model: Bill,
          include: [
            {
              model: Booking,
              include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
              ]
            }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (req.user.role === 'CUSTOMER' && payment.Bill?.Booking?.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
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
