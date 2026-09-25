const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

const authController = require('../controllers/authController');
const vehicleController = require('../controllers/vehicleController');
const serviceController = require('../controllers/serviceController');
const bookingController = require('../controllers/bookingController');
const mechanicController = require('../controllers/mechanicController');
const billController = require('../controllers/billController');
const paymentController = require('../controllers/paymentController');
const invoiceController = require('../controllers/invoiceController');
const notificationController = require('../controllers/notificationController');
const reviewController = require('../controllers/reviewController');
const pickupController = require('../controllers/pickupController');
const reportController = require('../controllers/reportController');

const {
  registerValidation,
  loginValidation,
  vehicleValidation,
  bookingValidation,
  billValidation,
  reviewValidation,
  serviceValidation,
  mechanicValidation,
  handleValidation
} = require('../middleware/validation');
const { isValidPhone, normalizePhone } = require('../utils/phoneValidator');

// Auth routes
router.post('/auth/register', registerValidation, handleValidation, authController.register);
router.post('/auth/login', loginValidation, handleValidation, authController.login);
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);
router.put('/auth/change-password', authenticate, authController.changePassword);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/reset-password', authController.resetPassword);

// Customer routes (admin managing customers)
router.get('/customers', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { User } = require('../models');
    const customers = await User.findAll({
      where: { role: 'CUSTOMER' },
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/customers/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { User } = require('../models');
    const customer = await User.findOne({
      where: { id: req.params.id, role: 'CUSTOMER' },
      attributes: { exclude: ['password'] }
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/customers', authenticate, authorize('ADMIN'), registerValidation, handleValidation, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { User } = require('../models');
    const { username, name, email, phone, password } = req.body;
    const finalUsername = (username && String(username).trim()) || String(email).split('@')[0];

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ where: { username: finalUsername } });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken. Please choose another.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await User.create({
      username: finalUsername,
      name: name || finalUsername,
      email,
      phone: normalizePhone(phone),
      password: hashedPassword,
      role: 'CUSTOMER'
    });

    res.status(201).json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
        isActive: customer.isActive,
        createdAt: customer.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.put('/customers/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { User } = require('../models');
    const customer = await User.findOne({
      where: { id: req.params.id, role: 'CUSTOMER' }
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { username, name, email, phone, isActive } = req.body;
    let updateData = {
      name: name || customer.name,
      isActive: isActive !== undefined ? isActive : customer.isActive
    };

    if (email && email !== customer.email) {
      const emailTaken = await User.findOne({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      updateData.email = email;
    }

    if (username && username !== customer.username) {
      const usernameTaken = await User.findOne({ where: { username } });
      if (usernameTaken) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      updateData.username = username;
    }

    if (phone !== undefined && phone !== '') {
      if (!isValidPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
      }
      updateData.phone = normalizePhone(phone);
    }
    await customer.update(updateData);

    res.json({
      success: true,
      data: {
        id: customer.id,
        username: customer.username,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
        isActive: customer.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.delete('/customers/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { User } = require('../models');
    const customer = await User.findOne({
      where: { id: req.params.id, role: 'CUSTOMER' }
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await customer.update({ isActive: false });

    res.json({ success: true, message: 'Customer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Vehicle routes
router.get('/vehicles', authenticate, vehicleController.getVehicles);
router.get('/vehicles/:id', authenticate, vehicleController.getVehicle);
router.post('/vehicles', authenticate, vehicleValidation, handleValidation, vehicleController.createVehicle);
router.put('/vehicles/:id', authenticate, vehicleController.updateVehicle);
router.delete('/vehicles/:id', authenticate, vehicleController.deleteVehicle);

// Service routes
router.get('/services', serviceController.getServices);
router.get('/services/:id', serviceController.getService);
router.post('/services', authenticate, authorize('ADMIN'), serviceValidation, handleValidation, serviceController.createService);
router.put('/services/:id', authenticate, authorize('ADMIN'), serviceController.updateService);
router.delete('/services/:id', authenticate, authorize('ADMIN'), serviceController.deleteService);

// Booking routes
router.get('/bookings', authenticate, bookingController.getBookings);
router.get('/bookings/:id', authenticate, bookingController.getBooking);
router.post('/bookings', authenticate, bookingValidation, handleValidation, bookingController.createBooking);
router.put('/bookings/:id', authenticate, bookingController.updateBooking);
router.put('/bookings/:id/cancel', authenticate, bookingController.cancelBooking);
router.put('/bookings/:id/status', authenticate, authorize('ADMIN'), bookingController.updateStatus);
router.put('/bookings/:id/assign', authenticate, authorize('ADMIN'), bookingController.assignMechanic);

// Mechanic routes (static paths must come before /:id)
router.get('/mechanics', authenticate, mechanicController.getMechanics);
router.get('/mechanics/bookings', authenticate, authorize('MECHANIC'), mechanicController.getMechanicBookings);
router.post('/mechanics', authenticate, authorize('ADMIN'), mechanicValidation, handleValidation, mechanicController.createMechanic);
router.put('/mechanics/bookings/:id/progress', authenticate, authorize('MECHANIC'), mechanicController.updateServiceProgress);
router.get('/mechanics/:id/bookings', authenticate, authorize('ADMIN', 'MECHANIC'), mechanicController.getMechanicBookings);
router.get('/mechanics/:id', authenticate, mechanicController.getMechanic);
router.put('/mechanics/:id', authenticate, authorize('ADMIN'), mechanicController.updateMechanic);
router.delete('/mechanics/:id', authenticate, authorize('ADMIN'), mechanicController.deleteMechanic);
router.put('/mechanics/:id/toggle-status', authenticate, authorize('ADMIN'), mechanicController.toggleMechanicStatus);

// Bill routes
router.get('/bills', authenticate, billController.getBills);
router.get('/bills/:id', authenticate, billController.getBill);
router.post('/bills', authenticate, authorize('ADMIN'), billValidation, handleValidation, billController.createBill);
router.get('/bills/booking/:bookingId', authenticate, billController.getBillByBooking);

// Payment routes
router.get('/payments', authenticate, paymentController.getPayments);
router.post('/payments', authenticate, paymentController.processPayment);
router.get('/payments/bill/:billId', authenticate, paymentController.getPaymentByBill);

// Invoice routes
router.get('/invoices', authenticate, invoiceController.getInvoices);
router.get('/invoices/:id', authenticate, invoiceController.getInvoice);
router.get('/invoices/:id/pdf', authenticate, invoiceController.generateInvoicePDF);

// Notification routes
router.get('/notifications', authenticate, notificationController.getNotifications);
router.put('/notifications/read-all', authenticate, notificationController.markAllAsRead);
router.get('/notifications/unread-count', authenticate, notificationController.getUnreadCount);
router.put('/notifications/:id/read', authenticate, notificationController.markAsRead);

// Review routes
router.get('/reviews', optionalAuth, reviewController.getReviews);
router.get('/reviews/my', authenticate, reviewController.getMyReviews);
router.post('/reviews', authenticate, reviewValidation, handleValidation, reviewController.createReview);
router.put('/reviews/:id', authenticate, reviewController.updateReview);
router.delete('/reviews/:id', authenticate, reviewController.deleteReview);
router.put('/reviews/:id/reply', authenticate, authorize('ADMIN'), reviewController.adminReply);

// Pickup routes
router.post('/pickups', authenticate, pickupController.createPickupRequest);
router.get('/pickups/:id', authenticate, pickupController.getPickupRequest);
router.put('/pickups/:id/status', authenticate, authorize('ADMIN'), pickupController.updatePickupStatus);

// Report routes
router.get('/reports/revenue', authenticate, authorize('ADMIN'), reportController.getRevenueReport);
router.get('/reports/services', authenticate, authorize('ADMIN'), reportController.getServiceReport);
router.get('/reports/bookings', authenticate, authorize('ADMIN'), reportController.getBookingReport);
router.get('/reports/customers', authenticate, authorize('ADMIN'), reportController.getCustomerReport);
router.get('/reports/mechanics', authenticate, authorize('ADMIN'), reportController.getMechanicReport);
router.get('/reports/dashboard', authenticate, authorize('ADMIN'), reportController.getDashboardStats);

// Contact route
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    res.json({ success: true, message: 'Message received. We will get back to you soon.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Location routes (real-time live tracking for Pickup & Drop)
router.put('/location/update', authenticate, async (req, res) => {
  try {
    const { latitude, longitude, accuracy, bookingId } = req.body;
    if (latitude == null || longitude == null || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ success: false, message: 'Valid latitude and longitude are required' });
    }
    const { User, Booking } = require('../models');
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }
    const accuracyValue = accuracy != null && !isNaN(parseFloat(accuracy)) && parseFloat(accuracy) >= 0
      ? parseFloat(accuracy)
      : null;

    await User.update(
      { latitude: lat, longitude: lng, accuracy: accuracyValue, lastLocationUpdate: new Date() },
      { where: { id: req.user.id } }
    );

    if (bookingId && req.user.role === 'CUSTOMER') {
      const booking = await Booking.findOne({ where: { id: bookingId, userId: req.user.id } });
      if (booking && booking.pickupRequired) {
        await booking.update({ pickupLatitude: lat, pickupLongitude: lng, shareLiveLocation: true });
      }
    }

    const { emitLocationUpdate } = require('../socket');
    const payload = {
      userId: req.user.id,
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      avatar: req.user.avatar || null,
      latitude: lat,
      longitude: lng,
      accuracy: accuracyValue,
      bookingId: bookingId || null,
      lastLocationUpdate: new Date().toISOString()
    };
    emitLocationUpdate(payload);

    res.json({ success: true, message: 'Location updated', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/location/stop', authenticate, async (req, res) => {
  try {
    const { User, Booking } = require('../models');
    await User.update(
      { latitude: null, longitude: null, accuracy: null, lastLocationUpdate: null },
      { where: { id: req.user.id } }
    );
    if (req.body.bookingId && req.user.role === 'CUSTOMER') {
      await Booking.update(
        { shareLiveLocation: false },
        { where: { id: req.body.bookingId, userId: req.user.id } }
      );
    }
    const { emitLocationUpdate } = require('../socket');
    emitLocationUpdate({
      userId: req.user.id,
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      latitude: null,
      longitude: null,
      accuracy: null,
      sharing: false,
      lastLocationUpdate: new Date().toISOString()
    });
    res.json({ success: true, message: 'Location sharing stopped' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/location/track', authenticate, authorize('ADMIN', 'MECHANIC'), async (req, res) => {
  try {
    const { User } = require('../models');
    const maxAgeMinutes = parseInt(req.query.maxAge, 10) || 5;
    const staleBefore = new Date(Date.now() - maxAgeMinutes * 60000);

    const where = {
      latitude: { [Op.ne]: null },
      longitude: { [Op.ne]: null },
      [Op.or]: [
        { lastLocationUpdate: null },
        { lastLocationUpdate: { [Op.gte]: staleBefore } }
      ]
    };
    if (req.query.role) where.role = req.query.role;

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'role', 'latitude', 'longitude', 'accuracy', 'lastLocationUpdate', 'avatar', 'phone']
    });

    res.json({ success: true, data: users, meta: { staleBefore: staleBefore.toISOString(), serverTime: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/location/customers', authenticate, authorize('ADMIN', 'MECHANIC'), async (req, res) => {
  try {
    const { User } = require('../models');
    const staleBefore = new Date(Date.now() - 5 * 60000);
    const customers = await User.findAll({
      where: {
        role: 'CUSTOMER',
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        [Op.or]: [
          { lastLocationUpdate: null },
          { lastLocationUpdate: { [Op.gte]: staleBefore } }
        ]
      },
      attributes: ['id', 'name', 'role', 'latitude', 'longitude', 'accuracy', 'lastLocationUpdate', 'avatar', 'phone']
    });
    res.json({ success: true, data: customers, meta: { serverTime: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/location/user/:id', authenticate, authorize('ADMIN', 'MECHANIC'), async (req, res) => {
  try {
    const { User } = require('../models');

    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'role', 'latitude', 'longitude', 'accuracy', 'lastLocationUpdate', 'avatar', 'phone']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user, meta: { serverTime: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
