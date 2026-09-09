const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const vehicleValidation = [
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('vehicleType').isIn(['BIKE', 'SCOOTER', 'CAR', 'THREE_WHEELER']).withMessage('Invalid vehicle type'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('fuelType').isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'CNG']).withMessage('Invalid fuel type')
];

const bookingValidation = [
  body('vehicleId').isInt().withMessage('Vehicle ID is required'),
  body('serviceTypeId').isInt().withMessage('Service type ID is required'),
  body('preferredDate').isDate().withMessage('Valid date is required'),
  body('preferredTime').trim().notEmpty().withMessage('Preferred time is required')
];

const billValidation = [
  body('bookingId').isInt().withMessage('Booking ID is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('tax').isFloat({ min: 0 }).withMessage('Tax must be a positive number')
];

const reviewValidation = [
  body('bookingId').isInt().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
];

const serviceValidation = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

const mechanicValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  vehicleValidation,
  bookingValidation,
  billValidation,
  reviewValidation,
  serviceValidation,
  mechanicValidation,
  handleValidation
};
