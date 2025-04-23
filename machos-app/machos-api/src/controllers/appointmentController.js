const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Availability = require('../models/Availability');
const Exception = require('../models/Exception');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendNotification } = require('../services/notificationService');

// Verificar disponibilidad para una fecha/hora específica
const checkTimeSlotAvailability = async (date, serviceId, adminId) => {
  try {
    // Obtenemos información del servicio para saber su duración
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error('Servicio no encontrado');
    }
    
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 (domingo) a 6 (sábado)
    const timeString = appointmentDate.toTimeString().substring(0, 5); // formato "HH:MM"
    
    // Verificar si es un día de excepción (día no laborable)
    const exceptionDate = new Date(appointmentDate);
    exceptionDate.setHours(0, 0, 0, 0);
    
    const exception = await Exception.findOne({
      adminId,
      date: exceptionDate,
      isAvailable: false
    });
    
    if (exception) {
      return false; // Es un día marcado como no disponible
    }
    
    // Verificar disponibilidad regular para ese día de la semana
    const availability = await Availability.findOne({
      adminId,
      dayOfWeek,
      isAvailable: true,
      startTime: { $lte: timeString },
      endTime: { $gte: timeString }
    });
    
    if (!availability) {
      return false; // No hay disponibilidad configurada para este horario
    }
    
    // Calcular la hora de finalización de la cita basada en la duración del servicio
    const appointmentEndTime = new Date(appointmentDate);
    appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + service.duration);
    
    // Verificar si hay otras citas que se solapan con este horario
    const overlappingAppointment = await Appointment.findOne({
      adminId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // La cita existente comienza durante nuestra nueva cita
        {
          date: { $gte: appointmentDate, $lt: appointmentEndTime }
        },
        // La cita existente termina durante nuestra nueva cita
        {
          $expr: {
            $let: {
              vars: {
                existingEndTime: {
                  $add: ["$date", { $multiply: ["$serviceDuration", 60 * 1000] }]
                }
              },
              in: {
                $and: [
                  { $lt: ["$date", appointmentDate] },
                  { $gt: ["$$existingEndTime", appointmentDate] }
                ]
              }
            }
          }
        }
      ]
    });
    
    return !overlappingAppointment; // Disponible si no hay citas solapadas
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    throw error;
  }
};

// Obtener todos los slots disponibles para una fecha específica
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { date, serviceId, adminId } = req.query;
    
    if (!date || !serviceId || !adminId) {
      return res.status(400).json({ message: 'Se requiere fecha, servicio y administrador' });
    }
    
    // Verificar que el adminId corresponde a un usuario con rol de administrador
    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(400).json({ message: 'Administrador no válido' });
    }
    
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    
    // Convertir la fecha a objeto Date (solo la fecha, sin hora)
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = selectedDate.getDay();
    
    // Verificar si es un día de excepción
    const exception = await Exception.findOne({
      adminId,
      date: selectedDate
    });
    
    if (exception && !exception.isAvailable) {
      return res.status(200).json({ timeSlots: [] }); // No hay slots disponibles en días exceptuados
    }
    
    // Obtener las disponibilidades regulares para este día
    const availabilities = await Availability.find({
      adminId,
      dayOfWeek,
      isAvailable: true
    }).sort({ startTime: 1 });
    
    if (availabilities.length === 0) {
      return res.status(200).json({ timeSlots: [] }); // No hay disponibilidad configurada para este día
    }
    
    // Generar todos los posibles slots basados en la duración del servicio
    const possibleSlots = [];
    
    for (const availability of availabilities) {
      // Convertir strings de hora a minutos desde medianoche para facilitar cálculos
      const startMinutes = parseInt(availability.startTime.split(':')[0]) * 60 + 
                           parseInt(availability.startTime.split(':')[1]);
      const endMinutes = parseInt(availability.endTime.split(':')[0]) * 60 + 
                         parseInt(availability.endTime.split(':')[1]);
      
      // Generar slots con incrementos basados en preferencias (por ejemplo, cada 30 min)
      const slotInterval = 30; // minutos entre cada slot inicial
      let currentMinutes = startMinutes;
      
      while (currentMinutes + service.duration <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hours, minutes, 0, 0);
        
        // Solo agregar el slot si está en el futuro
        if (slotDate > new Date()) {
          possibleSlots.push({
            time: timeString,
            date: slotDate.toISOString()
          });
        }
        
        currentMinutes += slotInterval;
      }
    }
    
    // Filtrar slots que ya están ocupados
    const availableSlots = [];
    
    for (const slot of possibleSlots) {
      const isAvailable = await checkTimeSlotAvailability(
        slot.date,
        serviceId,
        adminId
      );
      
      if (isAvailable) {
        availableSlots.push(slot);
      }
    }
    
    return res.status(200).json({ timeSlots: availableSlots });
  } catch (error) {
    console.error('Error al obtener slots disponibles:', error);
    return res.status(500).json({ message: 'Error al obtener slots disponibles', error: error.message });
  }
};

// Crear una nueva reserva
exports.createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { serviceId, adminId, date, notes } = req.body;
    const userId = req.user.id; // Del token JWT
    
    // Validar los datos de entrada
    if (!serviceId || !adminId || !date) {
      return res.status(400).json({ message: 'Se requiere servicio, administrador y fecha' });
    }
    
    // Verificar que el servicio existe
    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    
    // Verificar que el administrador existe y tiene rol adecuado
    const admin = await User.findOne({ _id: adminId, role: 'admin' }).session(session);
    if (!admin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }
    
    // Verificar disponibilidad del horario
    const isAvailable = await checkTimeSlotAvailability(date, serviceId, adminId);
    if (!isAvailable) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'El horario seleccionado no está disponible' });
    }
    
    // Crear la reserva
    const appointment = new Appointment({
      userId,
      adminId,
      serviceId,
      date: new Date(date),
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      status: 'confirmed',
      notes: notes || ''
    });
    
    await appointment.save({ session });
    
    // Actualizar el usuario con referencia a esta cita
    await User.findByIdAndUpdate(
      userId,
      { $push: { appointments: appointment._id } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    // Enviar notificación (si está implementado)
    try {
      const user = await User.findById(userId);
      if (user.fcmToken) {
        await sendNotification(
          user.fcmToken,
          'Reserva Confirmada',
          `Tu cita para ${service.name} ha sido confirmada para el ${new Date(date).toLocaleString()}`
        );
      }
    } catch (notificationError) {
      console.error('Error al enviar notificación:', notificationError);
      // No bloqueamos la respuesta por un error en la notificación
    }
    
    return res.status(201).json({
      message: 'Reserva creada exitosamente',
      appointment
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error al crear reserva:', error);
    return res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
  }
};

// Obtener todas las reservas de un usuario
exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id; // Del token JWT
    
    const appointments = await Appointment.find({ userId })
      .sort({ date: -1 }) // Orden descendente por fecha
      .populate('serviceId', 'name price duration')
      .populate('adminId', 'name');
    
    return res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    return res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
  }
};

// Obtener todas las reservas (para administradores)
exports.getAllAppointments = async (req, res) => {
  try {
    // Verificar que el usuario es administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { startDate, endDate, status } = req.query;
    let query = {};
    
    // Filtrar por rango de fechas si se proporciona
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
    
    // Filtrar por estado si se proporciona
    if (status) {
      query.status = status;
    }
    
    // Si el admin solo quiere ver sus propias citas
    if (req.query.onlyMine === 'true') {
      query.adminId = req.user.id;
    }
    
    const appointments = await Appointment.find(query)
      .sort({ date: 1 })
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name price duration')
      .populate('adminId', 'name');
    
    return res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error al obtener todas las reservas:', error);
    return res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
  }
};

// Obtener detalles de una reserva específica
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name price duration')
      .populate('adminId', 'name');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    // Verificar que el usuario tiene permiso para ver esta reserva
    if (
      appointment.userId._id.toString() !== req.user.id &&
      appointment.adminId._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    return res.status(200).json({ appointment });
  } catch (error) {
    console.error('Error al obtener detalles de la reserva:', error);
    return res.status(500).json({ message: 'Error al obtener detalles de la reserva', error: error.message });
  }
};

// Actualizar estado de una reserva
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    // Verificar permisos para actualizar
    if (
      req.user.role !== 'admin' &&
      (status !== 'cancelled' || appointment.userId.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar esta reserva' });
    }
    
    // Verificar si la cita ya pasó (no se puede cancelar citas pasadas)
    if (status === 'cancelled' && new Date(appointment.date) < new Date()) {
      return res.status(400).json({ message: 'No se puede cancelar una cita que ya ha pasado' });
    }
    
    // Actualizar el estado
    appointment.status = status;
    await appointment.save();
    
    // Enviar notificación si corresponde
    try {
      const user = await User.findById(appointment.userId);
      if (user.fcmToken) {
        let message;
        
        switch (status) {
          case 'confirmed':
            message = 'Tu cita ha sido confirmada';
            break;
          case 'cancelled':
            message = 'Tu cita ha sido cancelada';
            break;
          case 'completed':
            message = 'Tu cita ha sido marcada como completada';
            break;
          default:
            message = `El estado de tu cita ha cambiado a: ${status}`;
        }
        
        await sendNotification(
          user.fcmToken,
          'Actualización de Reserva',
          message
        );
      }
    } catch (notificationError) {
      console.error('Error al enviar notificación:', notificationError);
    }
    
    return res.status(200).json({
      message: 'Estado de la reserva actualizado correctamente',
      appointment
    });
  } catch (error) {
    console.error('Error al actualizar estado de la reserva:', error);
    return res.status(500).json({ message: 'Error al actualizar estado de la reserva', error: error.message });
  }
};

// Cancelar una reserva
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    // Verificar que la cita pertenece al usuario o es un administrador
    if (
      appointment.userId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva' });
    }
    
    // Verificar si la cita ya pasó
    if (new Date(appointment.date) < new Date()) {
      return res.status(400).json({ message: 'No se puede cancelar una cita que ya ha pasado' });
    }
    
    // Verificar política de cancelación (ejemplo: no se puede cancelar con menos de X horas)
    const hoursBeforeAppointment = (new Date(appointment.date) - new Date()) / (1000 * 60 * 60);
    const minHoursForCancellation = 2; // Política de ejemplo: 2 horas mínimo
    
    if (hoursBeforeAppointment < minHoursForCancellation) {
      return res.status(400).json({
        message: `No se puede cancelar con menos de ${minHoursForCancellation} horas de anticipación`
      });
    }
    
    // Actualizar la reserva
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason || 'No especificado';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user.id;
    
    await appointment.save();
    
    // Enviar notificación
    try {
      // Notificar al cliente si un admin cancela
      if (req.user.role === 'admin' && appointment.userId.toString() !== req.user.id) {
        const user = await User.findById(appointment.userId);
        if (user.fcmToken) {
          await sendNotification(
            user.fcmToken,
            'Cita Cancelada',
            `Tu cita del ${new Date(appointment.date).toLocaleString()} ha sido cancelada`
          );
        }
      }
      
      // Notificar al admin si un cliente cancela
      if (req.user.role === 'client') {
        const admin = await User.findById(appointment.adminId);
        if (admin && admin.fcmToken) {
          await sendNotification(
            admin.fcmToken,
            'Cita Cancelada',
            `El cliente ${req.user.name} ha cancelado su cita del ${new Date(appointment.date).toLocaleString()}`
          );
        }
      }
    } catch (notificationError) {
      console.error('Error al enviar notificación:', notificationError);
    }
    
    return res.status(200).json({
      message: 'Reserva cancelada correctamente',
      appointment
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    return res.status(500).json({ message: 'Error al cancelar la reserva', error: error.message });
  }
};