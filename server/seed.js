const bcrypt = require('bcryptjs');
const { sequelize, User, Vehicle, ServiceType, Booking, BookingStatusHistory, Bill, Payment, Notification, Review } = require('./models');
const { generateBookingId, generateInvoiceNumber } = require('./utils/helpers');

const seed = async () => {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({ username: 'admin', name: 'Admin User', email: 'admin@vms.com', phone: '1234567890', password: adminPassword, role: 'ADMIN' });
    console.log('Admin created:', admin.username);

    console.log('Creating mechanics...');
    const mechanicPassword = await bcrypt.hash('mechanic123', 10);
    const mechanics = await Promise.all([
      User.create({ username: 'john_mech', name: 'John Mechanic', email: 'john@vms.com', phone: '9876543210', password: mechanicPassword, role: 'MECHANIC' }),
      User.create({ username: 'mike_mech', name: 'Mike Mechanic', email: 'mike@vms.com', phone: '9876543211', password: mechanicPassword, role: 'MECHANIC' }),
      User.create({ username: 'sarah_mech', name: 'Sarah Mechanic', email: 'sarah@vms.com', phone: '9876543212', password: mechanicPassword, role: 'MECHANIC' })
    ]);

    console.log('Creating customers...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customers = await Promise.all([
      User.create({ username: 'alice', name: 'Alice Customer', email: 'alice@vms.com', phone: '8765432100', password: customerPassword, role: 'CUSTOMER' }),
      User.create({ username: 'bob', name: 'Bob Customer', email: 'bob@vms.com', phone: '8765432101', password: customerPassword, role: 'CUSTOMER' }),
      User.create({ username: 'charlie', name: 'Charlie Customer', email: 'charlie@vms.com', phone: '8765432102', password: customerPassword, role: 'CUSTOMER' }),
      User.create({ username: 'diana', name: 'Diana Customer', email: 'diana@vms.com', phone: '8765432103', password: customerPassword, role: 'CUSTOMER' }),
      User.create({ username: 'eve', name: 'Eve Customer', email: 'eve@vms.com', phone: '8765432104', password: customerPassword, role: 'CUSTOMER' })
    ]);

    console.log('Creating service types...');
    const services = await Promise.all([
      ServiceType.create({ name: 'Basic Service', description: 'Oil change, filter replacement, general checkup', price: 49.99, duration: 60 }),
      ServiceType.create({ name: 'Major Service', description: 'Complete engine service with all filters and fluids', price: 149.99, duration: 180 }),
      ServiceType.create({ name: 'Brake Service', description: 'Brake pad replacement and brake fluid change', price: 89.99, duration: 90 }),
      ServiceType.create({ name: 'AC Service', description: 'AC gas refill, filter cleaning, performance check', price: 69.99, duration: 60 }),
      ServiceType.create({ name: 'Wheel Alignment', description: 'Four wheel alignment and balancing', price: 39.99, duration: 45 }),
      ServiceType.create({ name: 'Battery Replacement', description: 'Battery testing and replacement with new battery', price: 129.99, duration: 30 })
    ]);

    console.log('Creating vehicles...');
    const vehicles = await Promise.all([
      Vehicle.create({ userId: customers[0].id, vehicleNumber: 'MH01AB1234', vehicleType: 'CAR', brand: 'Maruti', model: 'Swift', year: 2020, fuelType: 'PETROL', color: 'White', currentKM: 25000 }),
      Vehicle.create({ userId: customers[0].id, vehicleNumber: 'MH01CD5678', vehicleType: 'BIKE', brand: 'Honda', model: 'CB Shine', year: 2021, fuelType: 'PETROL', color: 'Black', currentKM: 15000 }),
      Vehicle.create({ userId: customers[1].id, vehicleNumber: 'MH01EF9012', vehicleType: 'CAR', brand: 'Hyundai', model: 'i20', year: 2019, fuelType: 'DIESEL', color: 'Silver', currentKM: 35000 }),
      Vehicle.create({ userId: customers[2].id, vehicleNumber: 'MH01GH3456', vehicleType: 'SCOOTER', brand: 'Honda', model: 'Activa', year: 2022, fuelType: 'PETROL', color: 'Red', currentKM: 8000 }),
      Vehicle.create({ userId: customers[3].id, vehicleNumber: 'MH01IJ7890', vehicleType: 'CAR', brand: 'Tata', model: 'Nexon', year: 2023, fuelType: 'ELECTRIC', color: 'Blue', currentKM: 5000 }),
      Vehicle.create({ userId: customers[4].id, vehicleNumber: 'MH01KL1122', vehicleType: 'THREE_WHEELER', brand: 'Bajaj', model: 'RE', year: 2020, fuelType: 'CNG', color: 'Yellow', currentKM: 40000 })
    ]);

    console.log('Creating bookings...');
    const bookings = await Promise.all([
      Booking.create({ bookingId: generateBookingId(), userId: customers[0].id, vehicleId: vehicles[0].id, serviceTypeId: services[0].id, mechanicId: mechanics[0].id, preferredDate: '2026-09-15', preferredTime: '10:00 AM', status: 'COMPLETED', estimatedPrice: services[0].price }),
      Booking.create({ bookingId: generateBookingId(), userId: customers[1].id, vehicleId: vehicles[2].id, serviceTypeId: services[1].id, mechanicId: mechanics[1].id, preferredDate: '2026-09-16', preferredTime: '11:00 AM', status: 'SERVICE_IN_PROGRESS', estimatedPrice: services[1].price }),
      Booking.create({ bookingId: generateBookingId(), userId: customers[2].id, vehicleId: vehicles[3].id, serviceTypeId: services[2].id, preferredDate: '2026-09-17', preferredTime: '09:00 AM', status: 'PENDING', estimatedPrice: services[2].price }),
      Booking.create({ bookingId: generateBookingId(), userId: customers[0].id, vehicleId: vehicles[1].id, serviceTypeId: services[3].id, mechanicId: mechanics[2].id, preferredDate: '2026-09-18', preferredTime: '02:00 PM', pickupRequired: true, pickupAddress: '123 Main Street', pickupLandmark: 'Near Park', pickupTime: '01:30 PM', pickupContact: '8765432100', status: 'CONFIRMED', estimatedPrice: services[3].price }),
      Booking.create({ bookingId: generateBookingId(), userId: customers[3].id, vehicleId: vehicles[4].id, serviceTypeId: services[4].id, preferredDate: '2026-09-19', preferredTime: '03:00 PM', status: 'PENDING', estimatedPrice: services[4].price })
    ]);

    console.log('Creating status history...');
    await Promise.all([
      BookingStatusHistory.create({ bookingId: bookings[0].id, status: 'PENDING', notes: 'Booking created', updatedBy: customers[0].id }),
      BookingStatusHistory.create({ bookingId: bookings[0].id, status: 'CONFIRMED', notes: 'Booking confirmed', updatedBy: admin.id }),
      BookingStatusHistory.create({ bookingId: bookings[0].id, status: 'COMPLETED', notes: 'Service completed', updatedBy: mechanics[0].id })
    ]);

    console.log('Creating bills...');
    const bills = await Promise.all([
      Bill.create({ bookingId: bookings[0].id, invoiceNumber: generateInvoiceNumber(), subtotal: 49.99, tax: 9.00, taxRate: 18, grandTotal: 58.99, laborCost: 25.00, partsCost: 24.99 }),
      Bill.create({ bookingId: bookings[1].id, invoiceNumber: generateInvoiceNumber(), subtotal: 149.99, tax: 27.00, taxRate: 18, grandTotal: 176.99, laborCost: 50.00, partsCost: 99.99 })
    ]);

    console.log('Creating payments...');
    await Promise.all([
      Payment.create({ billId: bills[0].id, amount: 58.99, paymentMethod: 'CARD', transactionId: 'TXN-12345678', status: 'PAID', paidAt: new Date() }),
      Payment.create({ billId: bills[1].id, amount: 176.99, paymentMethod: 'UPI', transactionId: 'TXN-87654321', status: 'PENDING' })
    ]);

    console.log('Creating notifications...');
    await Promise.all([
      Notification.create({ userId: customers[0].id, title: 'Booking Confirmed', message: 'Your booking has been confirmed', type: 'BOOKING' }),
      Notification.create({ userId: customers[0].id, title: 'Service Completed', message: 'Your vehicle service is completed', type: 'SERVICE' }),
      Notification.create({ userId: customers[1].id, title: 'Booking Update', message: 'Your booking is in progress', type: 'BOOKING' })
    ]);

    console.log('Creating reviews...');
    await Review.create({ userId: customers[0].id, bookingId: bookings[0].id, rating: 5, comment: 'Excellent service! Very professional staff.', isVisible: true });
    await Review.create({ userId: customers[1].id, bookingId: bookings[1].id, rating: 4, comment: 'Great experience. My car runs like new after the service.', isVisible: true });
    await Review.create({ userId: customers[0].id, bookingId: bookings[3].id, rating: 5, comment: 'Best vehicle service center. Highly recommended!', isVisible: true });
    await Review.create({ userId: customers[2].id, bookingId: bookings[2].id, rating: 4, comment: 'Good quality work and reasonable prices.', isVisible: true });
    await Review.create({ userId: customers[3].id, bookingId: bookings[4].id, rating: 5, comment: 'Very satisfied with the pickup and drop service.', isVisible: true });

    console.log('\nSeed completed!');
    console.log('Admin: admin@vms.com / admin123');
    console.log('Mechanic: john@vms.com / mechanic123');
    console.log('Customer: alice@vms.com / customer123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
