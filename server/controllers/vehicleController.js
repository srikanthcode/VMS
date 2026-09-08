const { Vehicle, User, Booking } = require('../models');

const getVehicles = async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const vehicles = await Vehicle.findAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
    });

    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (req.user.role === 'CUSTOMER' && vehicle.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, brand, model, variant, year, fuelType, color, currentKM, insuranceExpiry, rcNumber } = req.body;

    const existingVehicle = await Vehicle.findOne({ where: { vehicleNumber } });
    if (existingVehicle) {
      return res.status(400).json({ success: false, message: 'Vehicle number already registered' });
    }

    const vehicle = await Vehicle.create({
      userId: req.user.id,
      vehicleNumber,
      vehicleType,
      brand,
      model,
      variant,
      year,
      fuelType,
      color,
      currentKM: currentKM || 0,
      insuranceExpiry,
      rcNumber
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (req.user.role === 'CUSTOMER' && vehicle.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { vehicleNumber, vehicleType, brand, model, variant, year, fuelType, color, currentKM, insuranceExpiry, rcNumber } = req.body;

    if (vehicleNumber && vehicleNumber !== vehicle.vehicleNumber) {
      const existing = await Vehicle.findOne({ where: { vehicleNumber } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Vehicle number already exists' });
      }
    }

    await vehicle.update({
      vehicleNumber: vehicleNumber || vehicle.vehicleNumber,
      vehicleType: vehicleType || vehicle.vehicleType,
      brand: brand || vehicle.brand,
      model: model || vehicle.model,
      variant: variant !== undefined ? variant : vehicle.variant,
      year: year || vehicle.year,
      fuelType: fuelType || vehicle.fuelType,
      color: color !== undefined ? color : vehicle.color,
      currentKM: currentKM !== undefined ? currentKM : vehicle.currentKM,
      insuranceExpiry: insuranceExpiry !== undefined ? insuranceExpiry : vehicle.insuranceExpiry,
      rcNumber: rcNumber !== undefined ? rcNumber : vehicle.rcNumber
    });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (req.user.role === 'CUSTOMER' && vehicle.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookingCount = await Booking.count({ where: { vehicleId: vehicle.id } });
    if (bookingCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete vehicle with existing bookings' });
    }

    await vehicle.destroy();

    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
