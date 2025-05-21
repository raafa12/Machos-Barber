// src/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Usuario que hace la reserva
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Estilista asignado
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Servicio reservado
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  // Información del servicio (para mantener un registro incluso si el servicio cambia)
  serviceInfo: {
    name: String,
    price: Number,
    duration: Number
  },
  // Fecha de la reserva (YYYY-MM-DD)
  date: {
    type: String,
    required: true
  },
  // Hora de inicio (formato HH:MM)
  startTime: {
    type: String,
    required: true
  },
  // Hora de fin (formato HH:MM)
  endTime: {
    type: String,
    required: true
  },
  // Estado de la reserva
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Notas adicionales
  notes: {
    type: String,
    trim: true
  },
  // Metadatos
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fecha de modificación
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices para búsquedas eficientes
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ stylist: 1, date: 1 });
bookingSchema.index({ date: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
