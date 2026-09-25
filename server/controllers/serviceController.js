const { ServiceType } = require('../models');

const parseList = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((v) => String(v).trim()).filter(Boolean);
        }
      } catch (error) {
        return trimmed.split(',').map((v) => v.trim()).filter(Boolean);
      }
    }
    return trimmed.split(',').map((v) => v.trim()).filter(Boolean);
  }
  return [];
};

const serialize = (service) => {
  const plain = typeof service.toJSON === 'function' ? service.toJSON() : { ...service };
  plain.features = parseList(plain.features);
  plain.includes = parseList(plain.includes);
  if (plain.duration != null && !plain.estimatedDuration) {
    const minutes = Number(plain.duration);
    if (!Number.isNaN(minutes)) {
      if (minutes < 60) {
        plain.estimatedDuration = `${minutes} mins`;
      } else {
        const hours = minutes / 60;
        const rounded = Math.round(hours * 10) / 10;
        plain.estimatedDuration = `${rounded} ${rounded === 1 ? 'hour' : 'hours'}`;
      }
    }
  }
  return plain;
};

const getServices = async (req, res) => {
  try {
    const where = req.user && req.user.role === 'ADMIN' ? {} : { isActive: true };
    const services = await ServiceType.findAll({ where, order: [['id', 'ASC']] });

    res.json({ success: true, data: services.map(serialize) });
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

    res.json({ success: true, data: serialize(service) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { name, description, price, duration, image, features, includes, warranty } = req.body;

    const existingService = await ServiceType.findOne({ where: { name } });
    if (existingService) {
      return res.status(400).json({ success: false, message: 'Service name already exists' });
    }

    const service = await ServiceType.create({
      name,
      description,
      price,
      duration,
      image,
      features: JSON.stringify(parseList(features)),
      includes: JSON.stringify(parseList(includes)),
      warranty
    });

    res.status(201).json({ success: true, data: serialize(service) });
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

    const { name, description, price, duration, image, features, includes, warranty, isActive } = req.body;

    if (name && name !== service.name) {
      const existing = await ServiceType.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Service name already exists' });
      }
    }

    const updateData = {
      name: name || service.name,
      description: description !== undefined ? description : service.description,
      price: price || service.price,
      duration: duration !== undefined ? duration : service.duration,
      image: image !== undefined ? image : service.image,
      warranty: warranty !== undefined ? warranty : service.warranty,
      isActive: isActive !== undefined ? isActive : service.isActive
    };

    if (features !== undefined) {
      updateData.features = JSON.stringify(parseList(features));
    }
    if (includes !== undefined) {
      updateData.includes = JSON.stringify(parseList(includes));
    }

    await service.update(updateData);

    res.json({ success: true, data: serialize(service) });
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
