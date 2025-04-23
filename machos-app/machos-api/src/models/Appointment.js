// src/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  servicePrice: {
    type: Number,
    required: true
  },
  serviceDuration: {
    type: Number,
    required: true,
    min: 15
  },
  date: {
    type: String,  // Formato YYYY-MM-DD
    required: true
  },
  time: {
    type: String,  // Formato HH:MM
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para mejorar búsquedas
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;