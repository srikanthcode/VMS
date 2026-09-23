const { Review, User, Booking, Vehicle, ServiceType } = require('../models');
const { emitBroadcast, emitToAdmins, emitToUser } = require('../socket');
const { createNotification } = require('./notificationController');

const getReviews = async (req, res) => {
  try {
    const where = req.user && req.user.role === 'ADMIN' ? {} : { isVisible: true };

    const reviews = await Review.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'name', 'avatar'] },
        {
          model: Booking,
          include: [
            { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
            { model: ServiceType }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Booking,
          include: [
            { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
            { model: ServiceType }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const bookingIdInt = parseInt(bookingId);

    const booking = await Booking.findOne({
      where: { id: bookingIdInt, userId: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    const existingReview = await Review.findOne({ where: { bookingId: bookingIdInt } });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists for this booking' });
    }

    const review = await Review.create({
      userId: req.user.id,
      bookingId: bookingIdInt,
      rating,
      comment
    });

    const fullReview = await Review.findByPk(review.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'avatar'] },
        {
          model: Booking,
          include: [
            { model: Vehicle, include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }] },
            { model: ServiceType }
          ]
        }
      ]
    });

    emitBroadcast('review:created', fullReview);
    emitToAdmins('review:created', fullReview);

    res.status(201).json({ success: true, data: fullReview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role !== 'ADMIN' && review.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { rating, comment } = req.body;

    await review.update({
      rating: rating || review.rating,
      comment: comment || review.comment
    });

    emitBroadcast('review:updated', review);

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role !== 'ADMIN' && review.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.destroy();

    emitBroadcast('review:deleted', { id: review.id, bookingId: review.bookingId });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const adminReply = async (req, res) => {
  try {
    const { adminReply } = req.body;

    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await review.update({ adminReply });

    emitToUser(review.userId, 'review:replied', review);
    emitBroadcast('review:updated', review);

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  adminReply
};
