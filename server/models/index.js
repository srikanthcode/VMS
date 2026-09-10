const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: true, unique: true },
  name: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: true, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('ADMIN', 'CUSTOMER', 'MECHANIC'), defaultValue: 'CUSTOMER' },
  avatar: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  lastLocationUpdate: { type: DataTypes.DATE, allowNull: true }
});

const Vehicle = sequelize.define('Vehicle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  vehicleType: { type: DataTypes.ENUM('BIKE', 'SCOOTER', 'CAR', 'THREE_WHEELER'), allowNull: false },
  brand: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false },
  variant: { type: DataTypes.STRING, allowNull: true },
  year: { type: DataTypes.INTEGER, allowNull: false },
  fuelType: { type: DataTypes.ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'CNG'), allowNull: false },
  color: { type: DataTypes.STRING, allowNull: true },
  currentKM: { type: DataTypes.INTEGER, defaultValue: 0 },
  insuranceExpiry: { type: DataTypes.DATE, allowNull: true },
  rcNumber: { type: DataTypes.STRING, allowNull: true }
});

const ServiceType = sequelize.define('ServiceType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookingId: { type: DataTypes.STRING, unique: true, allowNull: false },
  preferredDate: { type: DataTypes.DATEONLY, allowNull: false },
  preferredTime: { type: DataTypes.STRING, allowNull: false },
  pickupRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
  pickupAddress: { type: DataTypes.TEXT, allowNull: true },
  pickupLandmark: { type: DataTypes.STRING, allowNull: true },
  pickupTime: { type: DataTypes.STRING, allowNull: true },
  pickupContact: { type: DataTypes.STRING, allowNull: true },
  additionalNotes: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PICKUP_SCHEDULED', 'VEHICLE_PICKED_UP', 'INSPECTION', 'SERVICE_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  estimatedPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true }
});

const BookingStatusHistory = sequelize.define('BookingStatusHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.STRING, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true }
});

const Bill = sequelize.define('Bill', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoiceNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  taxRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 18 },
  additionalCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  grandTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  partsCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  laborCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
});

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: { type: DataTypes.ENUM('CASH', 'CARD', 'UPI', 'NET_BANKING'), allowNull: false },
  transactionId: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'), defaultValue: 'PENDING' },
  paidAt: { type: DataTypes.DATE, allowNull: true }
});

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('BOOKING', 'SERVICE', 'PAYMENT', 'REMINDER', 'GENERAL'), defaultValue: 'GENERAL' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, allowNull: false },
  isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
  adminReply: { type: DataTypes.TEXT, allowNull: true }
});

const PickupRequest = sequelize.define('PickupRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  address: { type: DataTypes.TEXT, allowNull: false },
  landmark: { type: DataTypes.STRING, allowNull: true },
  preferredTime: { type: DataTypes.STRING, allowNull: false },
  contactNumber: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'SCHEDULED', 'PICKED_UP'), defaultValue: 'PENDING' }
});

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING, allowNull: false },
  entity: { type: DataTypes.STRING, allowNull: false },
  entityId: { type: DataTypes.INTEGER, allowNull: true },
  details: { type: DataTypes.TEXT, allowNull: true }
});

// Associations
User.hasMany(Vehicle, { foreignKey: 'userId' });
Vehicle.belongsTo(User, { as: 'owner', foreignKey: 'userId' });
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });
Vehicle.hasMany(Booking, { foreignKey: 'vehicleId' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId' });
ServiceType.hasMany(Booking, { foreignKey: 'serviceTypeId' });
Booking.belongsTo(ServiceType, { foreignKey: 'serviceTypeId' });
User.hasMany(Booking, { as: 'mechanicBookings', foreignKey: 'mechanicId' });
Booking.belongsTo(User, { as: 'mechanic', foreignKey: 'mechanicId' });
Booking.hasOne(Bill, { foreignKey: 'bookingId' });
Bill.belongsTo(Booking, { foreignKey: 'bookingId' });
Bill.hasOne(Payment, { foreignKey: 'billId' });
Payment.belongsTo(Bill, { foreignKey: 'billId' });
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });
Booking.hasOne(Review, { foreignKey: 'bookingId' });
Review.belongsTo(Booking, { foreignKey: 'bookingId' });
Booking.hasOne(PickupRequest, { foreignKey: 'bookingId' });
PickupRequest.belongsTo(Booking, { foreignKey: 'bookingId' });
Booking.hasMany(BookingStatusHistory, { foreignKey: 'bookingId' });
BookingStatusHistory.belongsTo(Booking, { foreignKey: 'bookingId' });
User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  ServiceType,
  Booking,
  BookingStatusHistory,
  Bill,
  Payment,
  Notification,
  Review,
  PickupRequest,
  AuditLog
};
