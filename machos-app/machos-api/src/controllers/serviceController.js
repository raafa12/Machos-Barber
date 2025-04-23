const Service = require('../models/Service');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Obtener todos los servicios
exports.getAllServices = catchAsync(async (req, res, next) => {
  // Filtrar sólo servicios activos si no es admin
  const filter = req.user && req.user.role === 'admin' ? {} : { active: true };
  
  const services = await Service.find(filter);
  
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: { services }
  });
});

// Obtener un servicio por ID
exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return next(new AppError('No se encontró un servicio con ese ID', 404));
  }
  
  // Si no es admin y el servicio no está activo, no mostrarlo
  if ((!req.user || req.user.role !== 'admin') && !service.active) {
    return next(new AppError('No se encontró un servicio con ese ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { service }
  });
});

// Crear un nuevo servicio (sólo admin)
exports.createService = catchAsync(async (req, res, next) => {
  const newService = await Service.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: { service: newService }
  });
});

// Actualizar un servicio (sólo admin)
exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true, // Retornar el documento actualizado
      runValidators: true // Validar de acuerdo al Schema
    }
  );
  
  if (!service) {
    return next(new AppError('No se encontró un servicio con ese ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { service }
  });
});

// Eliminar un servicio (sólo admin)
exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  
  if (!service) {
    return next(new AppError('No se encontró un servicio con ese ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Alternativa: Desactivar un servicio (más seguro que eliminarlo)
exports.deactivateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { active: false },
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!service) {
    return next(new AppError('No se encontró un servicio con ese ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { service }
  });
});

// Activar un servicio
exports.activateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { active: true },
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!service) {
    return next(new AppError('No se encontró un servicio con ese ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { service }
  });
});