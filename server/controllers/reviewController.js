const { Review, User, Booking, Vehicle, ServiceType } = require('../models');

const getReviews = async (req, res) => {
  try {
    const query = req.user && req.user.role === 'ADMIN' ? {} : { isVisible: true };

    const reviews = await Review.find(query)
      .populate('userId', 'name avatar')
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists for this booking' });
    }

    const review = await Review.create({
      userId: req.user.id,
      bookingId,
      rating,
      comment
    });

    const fullReview = await Review.findById(review._id)
      .populate('userId', 'name avatar')
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'vehicleId' },
          { path: 'serviceTypeId' }
        ]
      });

    res.status(201).json({ success: true, data: fullReview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role === 'CUSTOMER' && review.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { rating, comment } = req.body;

    const updated = await Review.findByIdAndUpdate(req.params.id, {
      rating: rating || review.rating,
      comment: comment || review.comment
    }, { new: true });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role === 'CUSTOMER' && review.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const adminReply = async (req, res) => {
  try {
    const { adminReply } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, { adminReply }, { new: true });

    res.json({ success: true, data: updated });
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
