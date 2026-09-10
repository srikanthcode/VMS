const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { sequelize, User, Vehicle, ServiceType, Booking, Bill, Payment, Notification, Review, BookingStatusHistory } = require('./models');
const { generateBookingId, generateInvoiceNumber } = require('./utils/helpers');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, message: 'Validation error', errors: err.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ success: false, message: 'Duplicate entry', errors: err.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

const autoSeed = async () => {
  try {
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Database is empty. Seeding...');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({ username: 'admin', name: 'Admin User', email: 'admin@vms.com', phone: '1234567890', password: adminPassword, role: 'ADMIN' });

    const mechanicPassword = await bcrypt.hash('mechanic123', 10);
    const mechanics = await Promise.all([
      User.create({ username: 'john_mech', name: 'John Mechanic', email: 'john@vms.com', phone: '9876543210', password: mechanicPassword, role: 'MECHANIC' }),
      User.create({ username: 'mike_mech', name: 'Mike Mechanic', email: 'mike@vms.com', phone: '9876543211', password: mechanicPassword, role: 'MECHANIC' }),
      User.create({ username: 'sarah_mech', name: 'Sarah Mechanic', email: 'sarah@vms.com', phone: '9876543212', password: mechanicPassword, role: 'MECHANIC' })
    ]);

    const customerPassword = await bcrypt.hash('customer123', 10);
    const customers = await Promise.all([
      User.create({ username: 'alice', name: 'Alice Customer', email: 'alice@vms.com', phone: '8765432100', password: customerPassword, role: 'CUSTOMER' }),
      User.create({ username: 'bob', name: 'Bob Customer', email: 'bob@vms.com', phone: '8765432101', password: customerPassword, role: 'CUSTOMER' }),
      User.create({ username: 'charlie', name: 'Charlie Customer', email: 'charlie@vms.com', phone: '8765432102', password: customerPassword, role: 'CUSTOMER' }),
      User.create({ username: 'diana', name: 'Diana Customer', email: 'diana@vms.com', phone: '8765432103', password: customerPassword, role: 'CUSTOMER' }),
      User.create({ username: 'eve', name: 'Eve Customer', email: 'eve@vms.com', phone: '8765432104', password: customerPassword, role: 'CUSTOMER' })
    ]);

    const services = await Promise.all([
      ServiceType.create({ name: 'Basic Service', description: 'Oil change, filter replacement, general checkup', price: 49.99, duration: 60 }),
      ServiceType.create({ name: 'Major Service', description: 'Complete engine service with all filters and fluids', price: 149.99, duration: 180 }),
      ServiceType.create({ name: 'Brake Service', description: 'Brake pad replacement and brake fluid change', price: 89.99, duration: 90 }),
      ServiceType.create({ name: 'AC Service', description: 'AC gas refill, filter cleaning, performance check', price: 69.99, duration: 60 }),
      ServiceType.create({ name: 'Wheel Alignment', description: 'Four wheel alignment and balancing', price: 39.99, duration: 45 }),
      ServiceType.create({ name: 'Battery Replacement', description: 'Battery testing and replacement with new battery', price: 129.99, duration: 30 })
    ]);

    const vehicles = await Promise.all([
      Vehicle.create({ userId: customers[0].id, vehicleNumber: 'MH01AB1234', vehicleType: 'CAR', brand: 'Maruti', model: 'Swift', year: 2020, fuelType: 'PETROL', color: 'White', currentKM: 25000 }),
      Vehicle.create({ userId: customers[0].id, vehicleNumber: 'MH01CD5678', vehicleType: 'BIKE', brand: 'Honda', model: 'CB Shine', year: 2021, fuelType: 'PETROL', color: 'Black', currentKM: 15000 }),
      Vehicle.create({ userId: customers[1].id, vehicleNumber: 'MH01EF9012', vehicleType: 'CAR', brand: 'Hyundai', model: 'i20', year: 2019, fuelType: 'DIESEL', color: 'Silver', currentKM: 35000 }),
      Vehicle.create({ userId: customers[2].id, vehicleNumber: 'MH01GH3456', vehicleType: 'SCOOTER', brand: 'Honda', model: 'Activa', year: 2022, fuelType: 'PETROL', color: 'Red', currentKM: 8000 }),
      Vehicle.create({ userId: customers[3].id, vehicleNumber: 'MH01IJ7890', vehicleType: 'CAR', brand: 'Tata', model: 'Nexon', year: 2023, fuelType: 'ELECTRIC', color: 'Blue', currentKM: 5000 }),
      Vehicle.create({ userId: customers[4].id, vehicleNumber: 'MH01KL1122', vehicleType: 'THREE_WHEELER', brand: 'Bajaj', model: 'RE', year: 2020, fuelType: 'CNG', color: 'Yellow', currentKM: 40000 })
    ]);

    const bookings = await Promise.all([
      Booking.create({ bookingId: generateBookingId(), userId: customers[0].id, vehicleId: vehicles[0].id, serviceTypeId: services[0].id, mechanicId: mechanics[0].id, preferredDate: '2026-09-15', preferredTime: '10:00 AM', status: 'COMPLETED', estimatedPrice: services[0].price }),
      Booking.create({ bookingId: generateBookingId(), userId: customers[1].id, vehicleId: vehicles[2].id, serviceTypeId: services[1].id, mechanicId: mechanics[1].id, preferredDate: '2026-09-16', preferredTime: '11:00 AM', status: 'SERVICE_IN_PROGRESS', estimatedPrice: services[1].price }),
      Booking.create({ bookingId: generateBookingId(), userId: customers[2].id, vehicleId: vehicles[3].id, serviceTypeId: services[2].id, preferredDate: '2026-09-17', preferredTime: '09:00 AM', status: 'PENDING', estimatedPrice: services[2].price }),
      Booking.create({ bookingId: generateBookingId(), userId: customers[0].id, vehicleId: vehicles[1].id, serviceTypeId: services[3].id, mechanicId: mechanics[2].id, preferredDate: '2026-09-18', preferredTime: '02:00 PM', pickupRequired: true, pickupAddress: '123 Main Street', pickupLandmark: 'Near Park', pickupTime: '01:30 PM', pickupContact: '8765432100', status: 'CONFIRMED', estimatedPrice: services[3].price }),
      Booking.create({ bookingId: generateBookingId(), userId: customers[3].id, vehicleId: vehicles[4].id, serviceTypeId: services[4].id, preferredDate: '2026-09-19', preferredTime: '03:00 PM', status: 'PENDING', estimatedPrice: services[4].price })
    ]);

    await Promise.all([
      BookingStatusHistory.create({ bookingId: bookings[0].id, status: 'PENDING', notes: 'Booking created', updatedBy: customers[0].id }),
      BookingStatusHistory.create({ bookingId: bookings[0].id, status: 'CONFIRMED', notes: 'Booking confirmed', updatedBy: admin.id }),
      BookingStatusHistory.create({ bookingId: bookings[0].id, status: 'COMPLETED', notes: 'Service completed', updatedBy: mechanics[0].id })
    ]);

    const bills = await Promise.all([
      Bill.create({ bookingId: bookings[0].id, invoiceNumber: generateInvoiceNumber(), subtotal: 49.99, tax: 9.00, taxRate: 18, grandTotal: 58.99, laborCost: 25.00, partsCost: 24.99 }),
      Bill.create({ bookingId: bookings[1].id, invoiceNumber: generateInvoiceNumber(), subtotal: 149.99, tax: 27.00, taxRate: 18, grandTotal: 176.99, laborCost: 50.00, partsCost: 99.99 })
    ]);

    await Promise.all([
      Payment.create({ billId: bills[0].id, amount: 58.99, paymentMethod: 'CARD', transactionId: 'TXN-12345678', status: 'PAID', paidAt: new Date() }),
      Payment.create({ billId: bills[1].id, amount: 176.99, paymentMethod: 'UPI', transactionId: 'TXN-87654321', status: 'PENDING' })
    ]);

    await Promise.all([
      Notification.create({ userId: customers[0].id, title: 'Booking Confirmed', message: 'Your booking has been confirmed', type: 'BOOKING' }),
      Notification.create({ userId: customers[0].id, title: 'Service Completed', message: 'Your vehicle service is completed', type: 'SERVICE' }),
      Notification.create({ userId: customers[1].id, title: 'Booking Update', message: 'Your booking is in progress', type: 'BOOKING' })
    ]);

    await Review.create({ userId: customers[0].id, bookingId: bookings[0].id, rating: 5, comment: 'Excellent service! Very professional staff.', isVisible: true });
    await Review.create({ userId: customers[1].id, bookingId: bookings[1].id, rating: 4, comment: 'Great experience. My car runs like new after the service.', isVisible: true });
    await Review.create({ userId: customers[0].id, bookingId: bookings[3].id, rating: 5, comment: 'Best vehicle service center. Highly recommended!', isVisible: true });
    await Review.create({ userId: customers[2].id, bookingId: bookings[2].id, rating: 4, comment: 'Good quality work and reasonable prices.', isVisible: true });
    await Review.create({ userId: customers[3].id, bookingId: bookings[4].id, rating: 5, comment: 'Very satisfied with the pickup and drop service.', isVisible: true });

    console.log('Seed completed! Admin: admin@vms.com / admin123');
  } catch (error) {
    console.error('Auto-seed error:', error);
  }
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync({ alter: true });
    console.log('Database synced.');
    await autoSeed();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
module.exports = app;
