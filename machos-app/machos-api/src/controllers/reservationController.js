// controllers/reservationController.js
const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Obtener todas las reservas (solo admin/peluquero)
exports.getAllReservations = async (req, res) => {
  try {
    // Si es administrador, obtiene todas las reservas
    // Si es peluquero, obtiene solo sus reservas
    const query = req.user.role === 'admin' ? {} : { barber: req.user.id };
    
    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .populate('service', 'name price duration')
      .populate('barber', 'name')
      .sort({ date: 1 });
    
    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    return res.status(500).json({ message: 'Error al obtener las reservas' });
  }
};

// Obtener reservas del usuario actual
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('service', 'name price duration')
      .populate('barber', 'name')
      .sort({ date: 1 });
    
    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas del usuario:', error);
    return res.status(500).json({ message: 'Error al obtener tus reservas' });
  }
};

// Obtener una reserva por ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('service', 'name price duration')
      .populate('barber', 'name');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Verificar que el usuario actual sea el dueño de la reserva o un admin
    if (reservation.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para ver esta reserva' });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    return res.status(500).json({ message: 'Error al obtener la reserva' });
  }
};

// Crear una nueva reserva
exports.createReservation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { serviceId, barberId, date, notes } = req.body;

  try {
    // Verificar que el servicio exista
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Verificar que el peluquero exista y sea admin
    const barber = await User.findById(barberId);
    if (!barber || barber.role !== 'admin') {
      return res.status(404).json({ message: 'Peluquero no encontrado' });
    }

    // Convertir la fecha a objeto Date
    const reservationDate = new Date(date);
    
    // Calcular la fecha de finalización sumando la duración del servicio
    const endTime = new Date(reservationDate.getTime() + service.duration * 60000);

    // Verificar disponibilidad del peluquero en ese horario
    const conflictingReservation = await Reservation.findOne({
      barber: barberId,
      status: { $ne: 'cancelled' },
      $or: [
        // Caso 1: La nueva reserva comienza durante otra reserva
        {
          date: { $lte: reservationDate },
          endTime: { $gt: reservationDate }
        },
        // Caso 2: La nueva reserva termina durante otra reserva
        {
          date: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // Caso 3: La nueva reserva cubre completamente otra reserva
        {
          date: { $gte: reservationDate },
          endTime: { $lte: endTime }
        }
      ]
    });

    if (conflictingReservation) {
      return res.status(400).json({ 
        message: 'El peluquero no está disponible en ese horario. Por favor, selecciona otro horario.' 
      });
    }

    // Crear la reserva
    const newReservation = new Reservation({
      user: req.user.id,
      service: serviceId,
      barber: barberId,
      date: reservationDate,
      endTime,
      notes
    });

    await newReservation.save();

    // Poblar los datos para la respuesta
    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate('service', 'name price duration')
      .populate('barber', 'name');

    return res.status(201).json(populatedReservation);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    return res.status(500).json({ message: 'Error al crear la reserva' });
  }
};

// Actualizar estado de una reserva
exports.updateReservationStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Si es cliente, solo puede cancelar sus propias reservas
    if (req.user.role !== 'admin') {
      if (reservation.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'No tienes permiso para modificar esta reserva' });
      }
      
      // Los clientes solo pueden cancelar
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Solo puedes cancelar la reserva' });
      }
      
      // No se puede cancelar si falta menos de 24 horas
      const now = new Date();
      const reservationTime = new Date(reservation.date);
      const hoursRemaining = (reservationTime - now) / (1000 * 60 * 60);
      
      if (hoursRemaining < 24) {
        return res.status(400).json({ 
          message: 'No se puede cancelar con menos de 24 horas de anticipación' 
        });
      }
    }

    reservation.status = status;
    await reservation.save();

    return res.status(200).json({ 
      message: 'Estado de la reserva actualizado correctamente',
      reservation
    });
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    return res.status(500).json({ message: 'Error al actualizar la reserva' });
  }
};

// Verificar disponibilidad en un rango de fechas
exports.checkAvailability = async (req, res) => {
  const { barberId, date, endDate } = req.query;

  if (!barberId || !date) {
    return res.status(400).json({ message: 'Se requiere barberId y date' });
  }

  try {
    // Convertir las fechas a objetos Date
    const startDateTime = new Date(date);
    const endDateTime = endDate ? new Date(endDate) : new Date(startDateTime.getTime() + 24 * 60 * 60 * 1000); // +1 día por defecto

    // Buscar todas las reservas en el rango de fechas para el peluquero
    const reservations = await Reservation.find({
      barber: barberId,
      status: { $ne: 'cancelled' },
      date: { $gte: startDateTime, $lt: endDateTime }
    }).sort({ date: 1 });

    // Obtener el horario laboral (asumimos 9AM-6PM)
    const workdayStart = 9; // 9 AM
    const workdayEnd = 18;  // 6 PM

    // Preparar la respuesta con bloques de tiempo disponibles y ocupados
    const timeSlots = [];
    
    // Para cada día en el rango
    for (let currentDate = new Date(startDateTime); currentDate < endDateTime; currentDate.setDate(currentDate.getDate() + 1)) {
      // Omitir domingos (0 = domingo, 6 = sábado)
      if (currentDate.getDay() === 0) continue;
      
      const dayReservations = reservations.filter(r => {
        const rDate = new Date(r.date);
        return rDate.getDate() === currentDate.getDate() &&
               rDate.getMonth() === currentDate.getMonth() &&
               rDate.getFullYear() === currentDate.getFullYear();
      });

      // Crear los bloques de tiempo para este día
      const daySlots = [];
      
      // Horario laboral en incrementos de 30 minutos
      for (let hour = workdayStart; hour < workdayEnd; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(currentDate);
          slotTime.setHours(hour, minute, 0, 0);
          
          // Verificar si este horario está ocupado
          const isBooked = dayReservations.some(r => {
            const reservationStart = new Date(r.date);
            const reservationEnd = new Date(r.endTime);
            return slotTime >= reservationStart && slotTime < reservationEnd;
          });

          daySlots.push({
            time: slotTime,
            status: isBooked ? 'booked' : 'available'
          });
        }
      }

      timeSlots.push({
        date: new Date(currentDate.setHours(0, 0, 0, 0)),
        slots: daySlots
      });
    }

    return res.status(200).json(timeSlots);
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    return res.status(500).json({ message: 'Error al verificar disponibilidad' });
  }
};

// Eliminar una reserva (solo admin)
exports.deleteReservation = async (req, res) => {
  try {
    // Solo los administradores pueden eliminar reservas completamente
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar reservas' });
    }
    
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    await Reservation.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    return res.status(500).json({ message: 'Error al eliminar la reserva' });
  }
};