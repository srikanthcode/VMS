const { Booking, Vehicle, ServiceType, User, BookingStatusHistory, Bill, Payment } = require('../models');
const { generateBookingId } = require('../utils/helpers');

const getBookings = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === 'CUSTOMER') {
      where.userId = req.user.id;
    } else if (req.user.role === 'MECHANIC') {
      where.mechanicId = req.user.id;
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Vehicle },
        { model: ServiceType }
      ],
      order: [['createdAt', 'DESC']]
    });

    const userIds = [...new Set(bookings.map(b => b.userId).filter(Boolean))];
    const mechanicIds = [...new Set(bookings.map(b => b.mechanicId).filter(Boolean))];
    const allUserIds = [...new Set([...userIds, ...mechanicIds])];
    
    const users = allUserIds.length > 0 ? await User.findAll({
      where: { id: allUserIds },
      attributes: ['id', 'name', 'email', 'phone']
    }) : [];
    
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.toJSON(); });

    const enrichedBookings = bookings.map(b => {
      const booking = b.toJSON();
      booking.user = userMap[b.userId] || null;
      booking.mechanic = userMap[b.mechanicId] || null;
      return booking;
    });

    res.json({ success: true, data: enrichedBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Vehicle },
        { model: ServiceType }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'MECHANIC' && booking.mechanicId && booking.mechanicId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = booking.userId ? await User.findByPk(booking.userId, { attributes: ['id', 'name', 'email', 'phone'] }) : null;
    const mechanic = booking.mechanicId ? await User.findByPk(booking.mechanicId, { attributes: ['id', 'name', 'email'] }) : null;

    const history = await BookingStatusHistory.findAll({
      where: { bookingId: booking.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: { ...booking.toJSON(), user: user ? user.toJSON() : null, mechanic: mechanic ? mechanic.toJSON() : null, statusHistory: history } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { vehicleId, serviceTypeId, preferredDate, preferredTime, pickupRequired, pickupAddress, pickupLandmark, pickupTime, pickupContact, additionalNotes } = req.body;

    const vehicle = await Vehicle.findOne({ where: { id: vehicleId, userId: req.user.id } });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found or not owned by you' });
    }

    const serviceType = await ServiceType.findByPk(serviceTypeId);
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
      bookingId: booking.id,
      status: 'PENDING',
      notes: 'Booking created',
      updatedBy: req.user.id
    });

    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Vehicle },
        { model: ServiceType }
      ]
    });

    res.status(201).json({ success: true, data: fullBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot update booking in current status' });
    }

    const { preferredDate, preferredTime, pickupRequired, pickupAddress, pickupLandmark, pickupTime, pickupContact, additionalNotes } = req.body;

    await booking.update({
      preferredDate: preferredDate || booking.preferredDate,
      preferredTime: preferredTime || booking.preferredTime,
      pickupRequired: pickupRequired !== undefined ? pickupRequired : booking.pickupRequired,
      pickupAddress: pickupAddress !== undefined ? pickupAddress : booking.pickupAddress,
      pickupLandmark: pickupLandmark !== undefined ? pickupLandmark : booking.pickupLandmark,
      pickupTime: pickupTime !== undefined ? pickupTime : booking.pickupTime,
      pickupContact: pickupContact !== undefined ? pickupContact : booking.pickupContact,
      additionalNotes: additionalNotes !== undefined ? additionalNotes : booking.additionalNotes
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel booking in current status' });
    }

    await booking.update({ status: 'CANCELLED' });

    await BookingStatusHistory.create({
      bookingId: booking.id,
      status: 'CANCELLED',
      notes: req.body.reason || 'Booking cancelled',
      updatedBy: req.user.id
    });

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findByPk(req.params.id);
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

    await booking.update({ status });

    await BookingStatusHistory.create({
      bookingId: booking.id,
      status,
      notes: notes || `Status updated to ${status}`,
      updatedBy: req.user.id
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const assignMechanic = async (req, res) => {
  try {
    const { mechanicId } = req.body;

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const mechanic = await User.findOne({ where: { id: mechanicId, role: 'MECHANIC' } });
    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }

    await booking.update({ mechanicId });

    await BookingStatusHistory.create({
      bookingId: booking.id,
      status: booking.status,
      notes: `Assigned to mechanic ${mechanic.name}`,
      updatedBy: req.user.id
    });

    res.json({ success: true, data: booking });
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
