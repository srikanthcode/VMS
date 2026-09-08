const { ServiceType } = require('../models');

const getServices = async (req, res) => {
  try {
    const where = req.user && req.user.role === 'ADMIN' ? {} : { isActive: true };
    const services = await ServiceType.findAll({ where });

    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getService = async (req, res) => {
  try {
    const service = await ServiceType.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { name, description, price, duration, image } = req.body;

    const existingService = await ServiceType.findOne({ where: { name } });
    if (existingService) {
      return res.status(400).json({ success: false, message: 'Service name already exists' });
    }

    const service = await ServiceType.create({
      name,
      description,
      price,
      duration,
      image
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await ServiceType.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const { name, description, price, duration, image, isActive } = req.body;

    if (name && name !== service.name) {
      const existing = await ServiceType.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Service name already exists' });
      }
    }

    await service.update({
      name: name || service.name,
      description: description !== undefined ? description : service.description,
      price: price || service.price,
      duration: duration !== undefined ? duration : service.duration,
      image: image !== undefined ? image : service.image,
      isActive: isActive !== undefined ? isActive : service.isActive
    });

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await ServiceType.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await service.update({ isActive: false });

    res.json({ success: true, message: 'Service deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
};
