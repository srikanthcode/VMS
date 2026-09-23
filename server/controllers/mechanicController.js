const { User, Booking, Vehicle, ServiceType } = require('../models');
const bcrypt = require('bcryptjs');
const { emitToUser, emitToAdmins, emitToMechanics, emitBroadcast } = require('../socket');
const { createNotification } = require('./notificationController');
const { isValidPhone, normalizePhone } = require('../utils/phoneValidator');

const getMechanics = async (req, res) => {
  try {
    const mechanics = await User.findAll({
      where: { role: 'MECHANIC' },
      attributes: { exclude: ['password'] }
    });

    res.json({ success: true, data: mechanics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMechanic = async (req, res) => {
  try {
    const mechanic = await User.findOne({
      where: { id: req.params.id, role: 'MECHANIC' },
      attributes: { exclude: ['password'] }
    });

    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }

    res.json({ success: true, data: mechanic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createMechanic = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password || 'mechanic123', 10);

    const mechanic = await User.create({
      name,
      email,
      phone: normalizePhone(phone),
      password: hashedPassword,
      role: 'MECHANIC'
    });

    res.status(201).json({
      success: true,
      data: {
        id: mechanic.id,
        name: mechanic.name,
        email: mechanic.email,
        phone: mechanic.phone,
        role: mechanic.role,
        isActive: mechanic.isActive,
        createdAt: mechanic.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateMechanic = async (req, res) => {
  try {
    const mechanic = await User.findOne({
      where: { id: req.params.id, role: 'MECHANIC' }
    });

    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }

    const { name, email, phone } = req.body;

    if (email && email !== mechanic.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    let updateData = {
      name: name || mechanic.name,
      email: email || mechanic.email
    };
    if (phone !== undefined && phone !== '') {
      if (!isValidPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
      }
      updateData.phone = normalizePhone(phone);
    }

    await mechanic.update(updateData);

    res.json({
      success: true,
      data: {
        id: mechanic.id,
        name: mechanic.name,
        email: mechanic.email,
        phone: mechanic.phone,
        role: mechanic.role,
        isActive: mechanic.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const toggleMechanicStatus = async (req, res) => {
  try {
    const mechanic = await User.findOne({
      where: { id: req.params.id, role: 'MECHANIC' }
    });

    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }

    await mechanic.update({ isActive: !mechanic.isActive });

    res.json({
      success: true,
      data: {
        id: mechanic.id,
        name: mechanic.name,
        isActive: mechanic.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMechanicBookings = async (req, res) => {
  try {
    const mechanicId = req.user.role === 'MECHANIC' ? req.user.id : req.params.id;

    const bookings = await Booking.findAll({
      where: { mechanicId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
        { model: ServiceType }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateServiceProgress = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findOne({
      where: { id: req.params.id, mechanicId: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not assigned to you' });
    }

    const validStatuses = ['INSPECTION', 'SERVICE_IN_PROGRESS', 'READY_FOR_DELIVERY', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status for mechanic' });
    }

    await booking.update({ status });

    const { BookingStatusHistory } = require('../models');
    await BookingStatusHistory.create({
      bookingId: booking.id,
      status,
      notes: notes || `Status updated by mechanic`,
      updatedBy: req.user.id
    });

    emitBroadcast('booking:updated', booking);
    emitToAdmins('booking:updated', booking);
    emitToMechanics('booking:updated', booking);
    if (booking.userId) {
      emitToUser(booking.userId, 'booking:updated', booking);
      await createNotification(
        booking.userId,
        'Service Update',
        `Booking ${booking.bookingId} is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
        'SERVICE'
      );
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMechanics,
  getMechanic,
  createMechanic,
  updateMechanic,
  toggleMechanicStatus,
  getMechanicBookings,
  updateServiceProgress
};
