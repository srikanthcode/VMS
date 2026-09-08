const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const { User, Vehicle, ServiceType, Booking, BookingStatusHistory, Bill, Payment, Notification, Review } = require('./models');
const { generateBookingId, generateInvoiceNumber } = require('./utils/helpers');

const seed = async () => {
  try {
    await connectDB();
    console.log('Database connected.');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      ServiceType.deleteMany({}),
      Booking.deleteMany({}),
      BookingStatusHistory.deleteMany({}),
      Bill.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({})
    ]);
    console.log('Data cleared.');

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@vms.com',
      phone: '1234567890',
      password: adminPassword,
      role: 'ADMIN'
    });
    console.log('Admin created:', admin.email);

    // Create mechanics
    console.log('Creating mechanics...');
    const mechanicPassword = await bcrypt.hash('mechanic123', 10);
    const mechanics = await User.create([
      { name: 'John Mechanic', email: 'john@vms.com', phone: '9876543210', password: mechanicPassword, role: 'MECHANIC' },
      { name: 'Mike Mechanic', email: 'mike@vms.com', phone: '9876543211', password: mechanicPassword, role: 'MECHANIC' },
      { name: 'Sarah Mechanic', email: 'sarah@vms.com', phone: '9876543212', password: mechanicPassword, role: 'MECHANIC' }
    ]);
    console.log('Mechanics created:', mechanics.length);

    // Create customers
    console.log('Creating customers...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customers = await User.create([
      { name: 'Alice Customer', email: 'alice@vms.com', phone: '8765432100', password: customerPassword, role: 'CUSTOMER' },
      { name: 'Bob Customer', email: 'bob@vms.com', phone: '8765432101', password: customerPassword, role: 'CUSTOMER' },
      { name: 'Charlie Customer', email: 'charlie@vms.com', phone: '8765432102', password: customerPassword, role: 'CUSTOMER' },
      { name: 'Diana Customer', email: 'diana@vms.com', phone: '8765432103', password: customerPassword, role: 'CUSTOMER' },
      { name: 'Eve Customer', email: 'eve@vms.com', phone: '8765432104', password: customerPassword, role: 'CUSTOMER' }
    ]);
    console.log('Customers created:', customers.length);

    // Create service types
    console.log('Creating service types...');
    const services = await ServiceType.create([
      { name: 'Basic Service', description: 'Oil change, filter replacement, general checkup', price: 49.99, duration: 60 },
      { name: 'Major Service', description: 'Complete engine service with all filters and fluids', price: 149.99, duration: 180 },
      { name: 'Brake Service', description: 'Brake pad replacement and brake fluid change', price: 89.99, duration: 90 },
      { name: 'AC Service', description: 'AC gas refill, filter cleaning, performance check', price: 69.99, duration: 60 },
      { name: 'Wheel Alignment', description: 'Four wheel alignment and balancing', price: 39.99, duration: 45 },
      { name: 'Battery Replacement', description: 'Battery testing and replacement with new battery', price: 129.99, duration: 30 }
    ]);
    console.log('Services created:', services.length);

    // Create vehicles for customers
    console.log('Creating vehicles...');
    const vehicles = await Vehicle.create([
      { userId: customers[0]._id, vehicleNumber: 'MH01AB1234', vehicleType: 'CAR', brand: 'Maruti', model: 'Swift', year: 2020, fuelType: 'PETROL', color: 'White', currentKM: 25000 },
      { userId: customers[0]._id, vehicleNumber: 'MH01CD5678', vehicleType: 'BIKE', brand: 'Honda', model: 'CB Shine', year: 2021, fuelType: 'PETROL', color: 'Black', currentKM: 15000 },
      { userId: customers[1]._id, vehicleNumber: 'MH01EF9012', vehicleType: 'CAR', brand: 'Hyundai', model: 'i20', year: 2019, fuelType: 'DIESEL', color: 'Silver', currentKM: 35000 },
      { userId: customers[2]._id, vehicleNumber: 'MH01GH3456', vehicleType: 'SCOOTER', brand: 'Honda', model: 'Activa', year: 2022, fuelType: 'PETROL', color: 'Red', currentKM: 8000 },
      { userId: customers[3]._id, vehicleNumber: 'MH01IJ7890', vehicleType: 'CAR', brand: 'Tata', model: 'Nexon', year: 2023, fuelType: 'ELECTRIC', color: 'Blue', currentKM: 5000 },
      { userId: customers[4]._id, vehicleNumber: 'MH01KL1122', vehicleType: 'THREE_WHEELER', brand: 'Bajaj', model: 'RE', year: 2020, fuelType: 'CNG', color: 'Yellow', currentKM: 40000 }
    ]);
    console.log('Vehicles created:', vehicles.length);

    // Create bookings
    console.log('Creating bookings...');
    const bookings = await Booking.create([
      {
        bookingId: generateBookingId(),
        userId: customers[0]._id,
        vehicleId: vehicles[0]._id,
        serviceTypeId: services[0]._id,
        mechanicId: mechanics[0]._id,
        preferredDate: '2026-09-15',
        preferredTime: '10:00 AM',
        status: 'COMPLETED',
        estimatedPrice: services[0].price
      },
      {
        bookingId: generateBookingId(),
        userId: customers[1]._id,
        vehicleId: vehicles[2]._id,
        serviceTypeId: services[1]._id,
        mechanicId: mechanics[1]._id,
        preferredDate: '2026-09-16',
        preferredTime: '11:00 AM',
        status: 'SERVICE_IN_PROGRESS',
        estimatedPrice: services[1].price
      },
      {
        bookingId: generateBookingId(),
        userId: customers[2]._id,
        vehicleId: vehicles[3]._id,
        serviceTypeId: services[2]._id,
        preferredDate: '2026-09-17',
        preferredTime: '09:00 AM',
        status: 'PENDING',
        estimatedPrice: services[2].price
      },
      {
        bookingId: generateBookingId(),
        userId: customers[0]._id,
        vehicleId: vehicles[1]._id,
        serviceTypeId: services[3]._id,
        mechanicId: mechanics[2]._id,
        preferredDate: '2026-09-18',
        preferredTime: '02:00 PM',
        pickupRequired: true,
        pickupAddress: '123 Main Street',
        pickupLandmark: 'Near Park',
        pickupTime: '01:30 PM',
        pickupContact: '8765432100',
        status: 'CONFIRMED',
        estimatedPrice: services[3].price
      },
      {
        bookingId: generateBookingId(),
        userId: customers[3]._id,
        vehicleId: vehicles[4]._id,
        serviceTypeId: services[4]._id,
        preferredDate: '2026-09-19',
        preferredTime: '03:00 PM',
        status: 'PENDING',
        estimatedPrice: services[4].price
      }
    ]);
    console.log('Bookings created:', bookings.length);

    // Create booking status history
    console.log('Creating booking status history...');
    await BookingStatusHistory.create([
      { bookingId: bookings[0]._id, status: 'PENDING', notes: 'Booking created', updatedBy: customers[0]._id },
      { bookingId: bookings[0]._id, status: 'CONFIRMED', notes: 'Booking confirmed', updatedBy: admin._id },
      { bookingId: bookings[0]._id, status: 'COMPLETED', notes: 'Service completed', updatedBy: mechanics[0]._id }
    ]);
    console.log('Status history created.');

    // Create bills
    console.log('Creating bills...');
    const bills = await Bill.create([
      {
        bookingId: bookings[0]._id,
        invoiceNumber: generateInvoiceNumber(),
        subtotal: 49.99,
        tax: 9.00,
        taxRate: 18,
        grandTotal: 58.99,
        laborCost: 25.00,
        partsCost: 24.99
      },
      {
        bookingId: bookings[1]._id,
        invoiceNumber: generateInvoiceNumber(),
        subtotal: 149.99,
        tax: 27.00,
        taxRate: 18,
        grandTotal: 176.99,
        laborCost: 50.00,
        partsCost: 99.99
      }
    ]);
    console.log('Bills created:', bills.length);

    // Create payments
    console.log('Creating payments...');
    await Payment.create([
      {
        billId: bills[0]._id,
        amount: 58.99,
        paymentMethod: 'CARD',
        transactionId: 'TXN-12345678',
        status: 'PAID',
        paidAt: new Date()
      },
      {
        billId: bills[1]._id,
        amount: 176.99,
        paymentMethod: 'UPI',
        transactionId: 'TXN-87654321',
        status: 'PENDING'
      }
    ]);
    console.log('Payments created.');

    // Create notifications
    console.log('Creating notifications...');
    await Notification.create([
      { userId: customers[0]._id, title: 'Booking Confirmed', message: 'Your booking has been confirmed', type: 'BOOKING' },
      { userId: customers[0]._id, title: 'Service Completed', message: 'Your vehicle service is completed', type: 'SERVICE' },
      { userId: customers[1]._id, title: 'Booking Update', message: 'Your booking is in progress', type: 'BOOKING' }
    ]);
    console.log('Notifications created.');

    // Create reviews
    console.log('Creating reviews...');
    await Review.create({
      userId: customers[0]._id,
      bookingId: bookings[0]._id,
      rating: 5,
      comment: 'Excellent service! Very professional staff.',
      isVisible: true
    });
    console.log('Reviews created.');

    console.log('\nSeed completed successfully!');
    console.log('\nLogin credentials:');
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
