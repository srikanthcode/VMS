const { PickupRequest, Booking, User, Vehicle, ServiceType } = require('../models');
const { Op } = require('sequelize');
const { emitToUser, emitToAdmins, emitBroadcast } = require('../socket');
const { createNotification } = require('./notificationController');

const createPickupRequest = async (req, res) => {
  try {
    const { bookingId, address, landmark, preferredTime, contactNumber } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!booking.pickupRequired) {
      return res.status(400).json({ success: false, message: 'Pickup not required for this booking' });
    }

    const existingPickup = await PickupRequest.findOne({ where: { bookingId } });
    if (existingPickup) {
      return res.status(400).json({ success: false, message: 'Pickup request already exists' });
    }

    const pickup = await PickupRequest.create({
      bookingId,
      address,
      landmark,
      preferredTime,
      contactNumber
    });

    const fullPickup = await PickupRequest.findByPk(pickup.id, {
      include: [
        {
          model: Booking,
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
            { model: ServiceType }
          ]
        }
      ]
    });

    emitBroadcast('pickup:created', fullPickup);
    emitToAdmins('pickup:created', fullPickup);
    await createNotification(req.user.id, 'Pickup Requested', 'Your pickup request has been submitted.', 'BOOKING');

    res.status(201).json({ success: true, data: fullPickup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getPickupRequest = async (req, res) => {
  try {
    const pickup = await PickupRequest.findByPk(req.params.id, {
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

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    if (req.user.role === 'CUSTOMER' && pickup.Booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updatePickupStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const pickup = await PickupRequest.findByPk(req.params.id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    const validStatuses = ['PENDING', 'SCHEDULED', 'PICKED_UP'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await pickup.update({ status });

    if (status === 'PICKED_UP') {
      await Booking.update({ status: 'VEHICLE_PICKED_UP' }, { where: { id: pickup.bookingId } });
    } else if (status === 'SCHEDULED') {
      await Booking.update({ status: 'PICKUP_SCHEDULED' }, { where: { id: pickup.bookingId } });
    }

    const booking = await Booking.findByPk(pickup.bookingId);
    emitBroadcast('pickup:updated', pickup);
    emitToAdmins('pickup:updated', pickup);
    if (booking) {
      emitBroadcast('booking:updated', booking);
      if (booking.userId) {
        emitToUser(booking.userId, 'booking:updated', booking);
        await createNotification(booking.userId, 'Pickup Update', `Your pickup is now ${status.replace(/_/g, ' ').toLowerCase()}.`, 'BOOKING');
      }
    }

    res.json({ success: true, data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPickupRequest,
  getPickupRequest,
  updatePickupStatus
};
