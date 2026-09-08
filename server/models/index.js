const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'CUSTOMER', 'MECHANIC'], default: 'CUSTOMER' },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  latitude: { type: Number },
  longitude: { type: Number },
  lastLocationUpdate: { type: Date }
}, { timestamps: true });

const vehicleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleNumber: { type: String, required: true, unique: true },
  vehicleType: { type: String, enum: ['BIKE', 'SCOOTER', 'CAR', 'THREE_WHEELER'], required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  variant: { type: String },
  year: { type: Number, required: true },
  fuelType: { type: String, enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'CNG'], required: true },
  color: { type: String },
  currentKM: { type: Number, default: 0 },
  insuranceExpiry: { type: Date },
  rcNumber: { type: String }
}, { timestamps: true });

const serviceTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number },
  image: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType', required: true },
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  pickupRequired: { type: Boolean, default: false },
  pickupAddress: { type: String },
  pickupLandmark: { type: String },
  pickupTime: { type: String },
  pickupContact: { type: String },
  additionalNotes: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PICKUP_SCHEDULED', 'VEHICLE_PICKED_UP', 'INSPECTION', 'SERVICE_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  estimatedPrice: { type: Number }
}, { timestamps: true });

const bookingStatusHistorySchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  status: { type: String, required: true },
  notes: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const billSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, required: true },
  taxRate: { type: Number, default: 18 },
  additionalCharges: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  partsCost: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['CASH', 'CARD', 'UPI', 'NET_BANKING'], required: true },
  transactionId: { type: String },
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  paidAt: { type: Date }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['BOOKING', 'SERVICE', 'PAYMENT', 'REMINDER', 'GENERAL'], default: 'GENERAL' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVisible: { type: Boolean, default: true },
  adminReply: { type: String }
}, { timestamps: true });

const pickupRequestSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  address: { type: String, required: true },
  landmark: { type: String },
  preferredTime: { type: String, required: true },
  contactNumber: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'SCHEDULED', 'PICKED_UP'], default: 'PENDING' }
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const ServiceType = mongoose.model('ServiceType', serviceTypeSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const BookingStatusHistory = mongoose.model('BookingStatusHistory', bookingStatusHistorySchema);
const Bill = mongoose.model('Bill', billSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Review = mongoose.model('Review', reviewSchema);
const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = {
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
