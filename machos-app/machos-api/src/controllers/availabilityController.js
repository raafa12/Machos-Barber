const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Función auxiliar para convertir hora de string a decimal
const timeStringToDecimal = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes / 60);
};

// Función auxiliar para convertir hora de decimal a string
const decimalToTimeString = (decimalTime) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Obtener toda la disponibilidad de un estilista
exports.getStylistAvailability = catchAsync(async (req, res, next) => {
  const stylistId = req.params.stylistId || req.user._id;

  // Verificar si el estilista existe
  const stylist = await User.findById(stylistId);
  if (!stylist || stylist.role !== 'admin') {
    return next(new AppError('No se encontró un estilista con ese ID', 404));
  }

  const availability = await Availability.find({ stylist: stylistId, isActive: true });

  res.status(200).json({
    status: 'success',
    results: availability.length,
    data: { availability }
  });
});

// Crear o actualizar disponibilidad para un estilista
exports.createUpdateAvailability = catchAsync(async (req, res, next) => {
  const stylistId = req.params.stylistId || req.user._id;
  const { dayOfWeek, startTime, endTime, isException, specificDate } = req.body;

  // Validar que el usuario sea un estilista
  const stylist = await User.findById(stylistId);
  if (!stylist || stylist.role !== 'admin') {
    return next(new AppError('No se encontró un estilista con ese ID', 404));
  }

  // Convertir tiempos si vienen en formato string
  let startTimeDecimal = startTime;
  let endTimeDecimal = endTime;

  if (typeof startTime === 'string') {
    startTimeDecimal = timeStringToDecimal(startTime);
  }
  if (typeof endTime === 'string') {
    endTimeDecimal = timeStringToDecimal(endTime);
  }

  // Validar que el horario sea coherente
  if (startTimeDecimal >= endTimeDecimal) {
    return next(new AppError('La hora de inicio debe ser anterior a la hora de fin', 400));
  }

  // Buscar si ya existe una disponibilidad para este día/hora
  let availability = await Availability.findOne({
    stylist: stylistId,
    dayOfWeek,
    startTime: startTimeDecimal,
    ...(isException && specificDate ? { specificDate: new Date(specificDate) } : { isException: false })
  });

  if (availability) {
    // Actualizar disponibilidad existente
    availability.endTime = endTimeDecimal;
    availability.isActive = true;
    availability.updatedAt = Date.now();
    await availability.save();
  } else {
    // Crear nueva disponibilidad
    availability = await Availability.create({
      stylist: stylistId,
      dayOfWeek,
      startTime: startTimeDecimal,
      endTime: endTimeDecimal,
      isException: isException || false,
      specificDate: isException && specificDate ? new Date(specificDate) : null
    });
  }

  res.status(201).json({
    status: 'success',
    data: { availability }
  });
});

// Eliminar disponibilidad
exports.deleteAvailability = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const stylistId = req.user._id;

  // Buscar la disponibilidad
  const availability = await Availability.findOne({
    _id: id,
    stylist: stylistId
  });

  if (!availability) {
    return next(new AppError('No se encontró la disponibilidad especificada', 404));
  }

  // Marcar como inactiva en lugar de eliminar
  availability.isActive = false;
  await availability.save();

  res.status(200).json({
    status: 'success',
    data: null
  });
});

// Crear excepción (día libre, vacaciones, etc.)
exports.createException = catchAsync(async (req, res, next) => {
  const stylistId = req.params.stylistId || req.user._id;
  const { date, isAvailable } = req.body;

  // Validar que el usuario sea un estilista
  const stylist = await User.findById(stylistId);
  if (!stylist || stylist.role !== 'admin') {
    return next(new AppError('No se encontró un estilista con ese ID', 404));
  }

  const specificDate = new Date(date);
  const dayOfWeek = specificDate.getDay();

  if (!isAvailable) {
    // Crear una excepción de día completo (no disponible)
    await Availability.updateMany(
      {
        stylist: stylistId,
        isException: true,
        specificDate: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`)
        }
      },
      { isActive: false }
    );

    const exception = await Availability.create({
      stylist: stylistId,
      dayOfWeek,
      startTime: 0,
      endTime: 23.75,
      isException: true,
      specificDate,
      isActive: false // Marcar como inactivo para indicar que no hay disponibilidad
    });

    return res.status(201).json({
      status: 'success',
      data: { exception }
    });
  } else {
    // Eliminar todas las excepciones para esta fecha (volver al horario normal)
    await Availability.updateMany(
      {
        stylist: stylistId,
        isException: true,
        specificDate: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`)
        }
      },
      { isActive: false }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Se ha restaurado el horario normal para esta fecha'
    });
  }
});

// Obtener slots disponibles para una fecha específica
exports.getAvailableSlots = catchAsync(async (req, res, next) => {
  const stylistId = req.params.stylistId || req.query.stylistId;
  const { date, serviceId } = req.query;
  
  if (!date) {
    return next(new AppError('La fecha es obligatoria', 400));
  }

  // Validar que el usuario sea un estilista
  const stylist = await User.findById(stylistId);
  if (!stylist || stylist.role !== 'admin') {
    return next(new AppError('No se encontró un estilista con ese ID', 404));
  }

  // Obtener la duración del servicio si se especificó
  let serviceDuration = 30; // Duración predeterminada en minutos
  if (serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new AppError('No se encontró el servicio especificado', 404));
    }
    serviceDuration = service.duration;
  }

  const serviceDurationHours = serviceDuration / 60; // Convertir minutos a horas (decimal)
  
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();
  
  // Formato para búsqueda de fecha específica
  const dateString = selectedDate.toISOString().split('T')[0];
  
  // 1. Obtener horarios disponibles para ese día
  let availableHours = await Availability.getAvailabilityForDate(stylistId, selectedDate);
  
  // Si no hay disponibilidad para ese día
  if (availableHours.length === 0) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: { slots: [] }
    });
  }
  
  // 2. Obtener reservas existentes para ese día
  const bookings = await Booking.find({
    stylist: stylistId,
    date: {
      $gte: new Date(`${dateString}T00:00:00.000Z`),
      $lt: new Date(`${dateString}T23:59:59.999Z`)
    },
    status: { $nin: ['cancelled', 'rejected'] }
  });
  
  // 3. Generar slots disponibles
  const allSlots = [];
  
  availableHours.forEach(slot => {
    // Intervalo de 15 minutos (0.25 horas)
    const slotInterval = 0.25;
    
    // Recorrer desde hora inicio hasta hora fin - duración del servicio
    for (let time = slot.startTime; time <= slot.endTime - serviceDurationHours; time += slotInterval) {
      // Verificar si este slot se superpone con alguna reserva existente
      const isSlotAvailable = !bookings.some(booking => {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        
        // Verificar si hay solapamiento
        return (time < bookingEnd && time + serviceDurationHours > bookingStart);
      });
      
      if (isSlotAvailable) {
        allSlots.push({
          time: decimalToTimeString(time),
          endTime: decimalToTimeString(time + serviceDurationHours),
          timestamp: time
        });
      }
    }
  });
  
  // Ordenar slots por hora
  allSlots.sort((a, b) => a.timestamp - b.timestamp);
  
  res.status(200).json({
    status: 'success',
    results: allSlots.length,
    data: { slots: allSlots }
  });
});