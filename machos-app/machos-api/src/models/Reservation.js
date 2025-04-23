// models/Reservation.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Asumiendo que los peluqueros son usuarios con rol "admin"
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar las consultas
ReservationSchema.index({ user: 1, date: 1 });
ReservationSchema.index({ barber: 1, date: 1 });
ReservationSchema.index({ status: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema);