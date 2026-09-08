const { Booking, Vehicle, ServiceType, User, BookingStatusHistory, Bill, Payment } = require('../models');
const { generateBookingId } = require('../utils/helpers');

const getBookings = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'CUSTOMER') {
      query.userId = req.user.id;
    } else if (req.user.role === 'MECHANIC') {
      query.mechanicId = req.user.id;
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceTypeId')
      .populate('mechanicId', 'name email')
      .populate('billId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceTypeId')
      .populate('mechanicId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'CUSTOMER' && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'MECHANIC' && booking.mechanicId && booking.mechanicId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bill = await Bill.findOne({ bookingId: booking._id }).populate('paymentId');
    const history = await BookingStatusHistory.find({ bookingId: booking._id }).sort({ createdAt: -1 });

    res.json({ success: true, data: { ...booking.toObject(), bill, statusHistory: history } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { vehicleId, serviceTypeId, preferredDate, preferredTime, pickupRequired, pickupAddress, pickupLandmark, pickupTime, pickupContact, additionalNotes } = req.body;

    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found or not owned by you' });
    }

    const serviceType = await ServiceType.findById(serviceTypeId);
    if (!serviceType) {
      return res.status(404).json({ success: false, message: 'Service type not found' });
    }

    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      userId: req.user.id,
      vehicleId,
      serviceTypeId,
      preferredDate,
      preferredTime,
      pickupRequired: pickupRequired || false,
      pickupAddress,
      pickupLandmark,
      pickupTime,
      pickupContact,
      additionalNotes,
      estimatedPrice: serviceType.price
    });

    await BookingStatusHistory.create({
      bookingId: booking._id,
      status: 'PENDING',
      notes: 'Booking created',
      updatedBy: req.user.id
    });

    const fullBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('vehicleId')
      .populate('serviceTypeId');

    res.status(201).json({ success: true, data: fullBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'CUSTOMER' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot update booking in current status' });
    }

    const { preferredDate, preferredTime, pickupRequired, pickupAddress, pickupLandmark, pickupTime, pickupContact, additionalNotes } = req.body;

    const updated = await Booking.findByIdAndUpdate(req.params.id, {
      preferredDate: preferredDate || booking.preferredDate,
      preferredTime: preferredTime || booking.preferredTime,
      pickupRequired: pickupRequired !== undefined ? pickupRequired : booking.pickupRequired,
      pickupAddress: pickupAddress !== undefined ? pickupAddress : booking.pickupAddress,
      pickupLandmark: pickupLandmark !== undefined ? pickupLandmark : booking.pickupLandmark,
      pickupTime: pickupTime !== undefined ? pickupTime : booking.pickupTime,
      pickupContact: pickupContact !== undefined ? pickupContact : booking.pickupContact,
      additionalNotes: additionalNotes !== undefined ? additionalNotes : booking.additionalNotes
    }, { new: true });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'CUSTOMER' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel booking in current status' });
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, { status: 'CANCELLED' }, { new: true });

    await BookingStatusHistory.create({
      bookingId: booking._id,
      status: 'CANCELLED',
      notes: req.body.reason || 'Booking cancelled',
      updatedBy: req.user.id
    });

    res.json({ success: true, message: 'Booking cancelled successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const validStatuses = [
      'PENDING', 'CONFIRMED', 'PICKUP_SCHEDULED', 'VEHICLE_PICKED_UP',
      'INSPECTION', 'SERVICE_IN_PROGRESS', 'READY_FOR_DELIVERY',
      'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });

    await BookingStatusHistory.create({
      bookingId: booking._id,
      status,
      notes: notes || `Status updated to ${status}`,
      updatedBy: req.user.id
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const assignMechanic = async (req, res) => {
  try {
    const { mechanicId } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const mechanic = await User.findOne({ _id: mechanicId, role: 'MECHANIC' });
    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, { mechanicId }, { new: true });

    await BookingStatusHistory.create({
      bookingId: booking._id,
      status: booking.status,
      notes: `Assigned to mechanic ${mechanic.name}`,
      updatedBy: req.user.id
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  updateStatus,
  assignMechanic
};
