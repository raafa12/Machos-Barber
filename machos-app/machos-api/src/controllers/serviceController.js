// controllers/serviceController.js
const Service = require('../models/Service');
const { validationResult } = require('express-validator');

// Obtener todos los servicios
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    return res.status(200).json(services);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return res.status(500).json({ message: 'Error al obtener los servicios' });
  }
};

// Obtener un servicio por ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    return res.status(200).json(service);
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    return res.status(500).json({ message: 'Error al obtener el servicio' });
  }
};

// Crear un nuevo servicio
exports.createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, duration, category, image } = req.body;

  try {
    // Comprobar si ya existe un servicio con el mismo nombre
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({ message: 'Ya existe un servicio con ese nombre' });
    }

    // Crear el nuevo servicio
    const newService = new Service({
      name,
      description,
      price,
      duration, // en minutos
      category,
      image
    });

    await newService.save();
    return res.status(201).json(newService);
  } catch (error) {
    console.error('Error al crear servicio:', error);
    return res.status(500).json({ message: 'Error al crear el servicio' });
  }
};

// Actualizar un servicio
exports.updateService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, duration, category, image } = req.body;

  try {
    // Comprobar si existe otro servicio con el mismo nombre (que no sea este mismo)
    const duplicateService = await Service.findOne({ 
      name, 
      _id: { $ne: req.params.id } 
    });
    
    if (duplicateService) {
      return res.status(400).json({ message: 'Ya existe otro servicio con ese nombre' });
    }

    const serviceToUpdate = await Service.findById(req.params.id);
    if (!serviceToUpdate) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Actualizar los campos
    serviceToUpdate.name = name || serviceToUpdate.name;
    serviceToUpdate.description = description || serviceToUpdate.description;
    serviceToUpdate.price = price !== undefined ? price : serviceToUpdate.price;
    serviceToUpdate.duration = duration !== undefined ? duration : serviceToUpdate.duration;
    serviceToUpdate.category = category || serviceToUpdate.category;
    serviceToUpdate.image = image || serviceToUpdate.image;

    const updatedService = await serviceToUpdate.save();
    return res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    return res.status(500).json({ message: 'Error al actualizar el servicio' });
  }
};

// Eliminar un servicio
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Aquí podríamos verificar si hay reservas que usan este servicio
    // y decidir si permitir la eliminación o no

    await Service.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    return res.status(500).json({ message: 'Error al eliminar el servicio' });
  }
};