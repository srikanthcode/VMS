const { Notification } = require('../models');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.update({ isRead: true });

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createNotification = async (userId, title, message, type = 'GENERAL') => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getUnreadCount
};
