const { PickupRequest, Booking, User, Vehicle, ServiceType } = require('../models');

const createPickupRequest = async (req, res) => {
  try {
    const { bookingId, address, landmark, preferredTime, contactNumber } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!booking.pickupRequired) {
      return res.status(400).json({ success: false, message: 'Pickup not required for this booking' });
    }

    const existingPickup = await PickupRequest.findOne({ bookingId });
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

    const fullPickup = await PickupRequest.findById(pickup._id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      });

    res.status(201).json({ success: true, data: fullPickup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getPickupRequest = async (req, res) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      });

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    if (req.user.role === 'CUSTOMER' && pickup.bookingId.userId._id.toString() !== req.user.id) {
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

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    const validStatuses = ['PENDING', 'SCHEDULED', 'PICKED_UP'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await PickupRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (status === 'PICKED_UP') {
      await Booking.findByIdAndUpdate(pickup.bookingId, { status: 'VEHICLE_PICKED_UP' });
    } else if (status === 'SCHEDULED') {
      await Booking.findByIdAndUpdate(pickup.bookingId, { status: 'PICKUP_SCHEDULED' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPickupRequest,
  getPickupRequest,
  updatePickupStatus
};
