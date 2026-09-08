const { Booking, Bill, Payment, User, Vehicle, ServiceType, sequelize } = require('../models');
const { Op } = require('sequelize');

const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    let where = { status: 'PAID' };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const payments = await Payment.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0);
    const totalTransactions = payments.reduce((sum, p) => sum + (parseInt(p.transactionCount) || 0), 0);

    res.json({
      success: true,
      data: {
        summary: { totalRevenue, totalTransactions },
        breakdown: payments.map(p => ({ date: p.date, revenue: parseFloat(p.revenue), transactionCount: parseInt(p.transactionCount) }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getServiceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const serviceStats = await Booking.findAll({
      where,
      attributes: [
        'serviceTypeId',
        [sequelize.fn('COUNT', sequelize.col('Booking.id')), 'bookingCount'],
        [sequelize.fn('AVG', sequelize.col('estimatedPrice')), 'avgPrice']
      ],
      include: [
        {
          model: ServiceType,
          attributes: ['id', 'name', 'price']
        }
      ],
      group: ['serviceTypeId', 'ServiceType.id', 'ServiceType.name', 'ServiceType.price'],
      raw: true,
      nest: true
    });

    res.json({ success: true, data: serviceStats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getBookingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const statusStats = await Booking.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const totalBookings = statusStats.reduce((sum, s) => sum + parseInt(s.count), 0);
    const completedBookings = statusStats.find(s => s.status === 'COMPLETED');
    const cancelledBookings = statusStats.find(s => s.status === 'CANCELLED');

    res.json({
      success: true,
      data: {
        summary: {
          total: totalBookings,
          completed: completedBookings ? parseInt(completedBookings.count) : 0,
          cancelled: cancelledBookings ? parseInt(cancelledBookings.count) : 0,
          completionRate: totalBookings > 0
            ? ((completedBookings ? parseInt(completedBookings.count) : 0) / totalBookings * 100).toFixed(2)
            : 0
        },
        byStatus: statusStats.map(s => ({ status: s.status, count: parseInt(s.count) }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = { role: 'CUSTOMER' };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const customerStats = await User.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    const totalCustomers = await User.count({ where: { role: 'CUSTOMER' } });

    res.json({
      success: true,
      data: {
        totalCustomers,
        registrationTrend: customerStats.map(s => ({ date: s.date, count: parseInt(s.count) }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMechanicReport = async (req, res) => {
  try {
    const mechanics = await User.findAll({
      where: { role: 'MECHANIC' },
      attributes: ['id', 'name', 'email']
    });

    const mechanicPerformance = await Promise.all(
      mechanics.map(async (mechanic) => {
        const completedServices = await Booking.count({
          where: { mechanicId: mechanic.id, status: 'COMPLETED' }
        });

        const totalServices = await Booking.count({
          where: { mechanicId: mechanic.id }
        });

        return {
          id: mechanic.id,
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
    const totalCustomers = await User.count({ where: { role: 'CUSTOMER' } });
    const totalMechanics = await User.count({ where: { role: 'MECHANIC' } });
    const totalVehicles = await Vehicle.count();
    const totalBookings = await Booking.count();
    const pendingBookings = await Booking.count({ where: { status: 'PENDING' } });
    const completedBookings = await Booking.count({ where: { status: 'COMPLETED' } });
    const activeServices = await ServiceType.count({ where: { isActive: true } });

    const revenueResult = await Payment.findOne({
      where: { status: 'PAID' },
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      raw: true
    });
    const totalRevenue = revenueResult && revenueResult.total ? parseFloat(revenueResult.total) : 0;

    const recentBookings = await Booking.findAll({
      include: [
        { model: Vehicle },
        { model: ServiceType }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const recentBookingUserIds = [...new Set(recentBookings.map(b => b.userId).filter(Boolean))];
    const recentUsers = recentBookingUserIds.length > 0 ? await User.findAll({
      where: { id: recentBookingUserIds },
      attributes: ['id', 'name']
    }) : [];
    const recentUserMap = {};
    recentUsers.forEach(u => { recentUserMap[u.id] = u.toJSON(); });

    const enrichedRecentBookings = recentBookings.map(b => ({
      ...b.toJSON(),
      user: recentUserMap[b.userId] || null
    }));

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
        recentBookings: enrichedRecentBookings
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
