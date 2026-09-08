const { Booking, Bill, Payment, User, Vehicle, ServiceType } = require('../models');

const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    let matchStage = { status: 'PAID' };
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const totalTransactions = payments.reduce((sum, p) => sum + (p.transactionCount || 0), 0);

    res.json({
      success: true,
      data: {
        summary: { totalRevenue, totalTransactions },
        breakdown: payments.map(p => ({ date: p._id, revenue: p.revenue, transactionCount: p.transactionCount }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getServiceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const serviceStats = await Booking.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: 'servicetypes',
          localField: 'serviceTypeId',
          foreignField: '_id',
          as: 'serviceType'
        }
      },
      { $unwind: '$serviceType' },
      {
        $group: {
          _id: '$serviceTypeId',
          bookingCount: { $sum: 1 },
          avgPrice: { $avg: '$estimatedPrice' },
          name: { $first: '$serviceType.name' },
          price: { $first: '$serviceType.price' }
        }
      }
    ]);

    res.json({ success: true, data: serviceStats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getBookingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const statusStats = await Booking.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBookings = statusStats.reduce((sum, s) => sum + s.count, 0);
    const completedBookings = statusStats.find(s => s._id === 'COMPLETED');
    const cancelledBookings = statusStats.find(s => s._id === 'CANCELLED');

    res.json({
      success: true,
      data: {
        summary: {
          total: totalBookings,
          completed: completedBookings ? completedBookings.count : 0,
          cancelled: cancelledBookings ? cancelledBookings.count : 0,
          completionRate: totalBookings > 0
            ? ((completedBookings ? completedBookings.count : 0) / totalBookings * 100).toFixed(2)
            : 0
        },
        byStatus: statusStats.map(s => ({ status: s._id, count: s.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = { role: 'CUSTOMER' };
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const customerStats = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    res.json({
      success: true,
      data: {
        totalCustomers,
        registrationTrend: customerStats.map(s => ({ date: s._id, count: s.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMechanicReport = async (req, res) => {
  try {
    const mechanics = await User.find({ role: 'MECHANIC' }).select('name email');

    const mechanicPerformance = await Promise.all(
      mechanics.map(async (mechanic) => {
        const completedServices = await Booking.countDocuments({
          mechanicId: mechanic._id, status: 'COMPLETED'
        });

        const totalServices = await Booking.countDocuments({
          mechanicId: mechanic._id
        });

        return {
          id: mechanic._id,
          name: mechanic.name,
          email: mechanic.email,
          completedServices,
          totalServices,
          completionRate: totalServices > 0
            ? ((completedServices / totalServices) * 100).toFixed(2)
            : 0
        };
      })
    );

    res.json({ success: true, data: mechanicPerformance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalMechanics = await User.countDocuments({ role: 'MECHANIC' });
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'PENDING' });
    const completedBookings = await Booking.countDocuments({ status: 'COMPLETED' });
    const activeServices = await ServiceType.countDocuments({ isActive: true });

    const revenueResult = await Payment.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentBookings = await Booking.find()
      .populate('userId', 'name')
      .populate('vehicleId', 'vehicleNumber brand')
      .populate('serviceTypeId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalMechanics,
        totalVehicles,
        totalBookings,
        pendingBookings,
        completedBookings,
        activeServices,
        totalRevenue,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getRevenueReport,
  getServiceReport,
  getBookingReport,
  getCustomerReport,
  getMechanicReport,
  getDashboardStats
};
