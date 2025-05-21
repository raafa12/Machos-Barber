// src/models/Exception.js
const mongoose = require('mongoose');

const exceptionSchema = new mongoose.Schema({
  // Referencia al usuario (peluquero)
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Fecha de inicio de la excepción
  startDate: {
    type: Date,
    required: true
  },
  // Fecha de fin de la excepción
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio'
    }
  },
  // Tipo de excepción (vacaciones, enfermedad, etc.)
  type: {
    type: String,
    enum: ['vacation', 'sick', 'personal', 'other'],
    default: 'other'
  },
  // Descripción o motivo
  description: {
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
exceptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índice para búsquedas eficientes
exceptionSchema.index({ stylist: 1, startDate: 1, endDate: 1 });

const Exception = mongoose.model('Exception', exceptionSchema);

module.exports = Exception;
