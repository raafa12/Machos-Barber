const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  // Referencia al usuario (peluquero) - necesario si tienes múltiples peluqueros
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Día de la semana (0: domingo, 1: lunes, ..., 6: sábado)
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
    validate: {
      validator: Number.isInteger,
      message: 'El día de la semana debe ser un número entero entre 0 y 6'
    }
  },
  // Hora de inicio (formato 24h: 9.5 = 9:30, 14 = 14:00)
  startTime: {
    type: Number,
    required: true,
    min: 0,
    max: 23.75, // Hasta 23:45
    validate: {
      validator: function(v) {
        // Valida que sea múltiplo de 0.25 (cada 15 minutos)
        return v % 0.25 === 0;
      },
      message: props => `${props.value} no es un horario válido. Debe ser múltiplo de 15 minutos.`
    }
  },
  // Hora de fin (formato 24h)
  endTime: {
    type: Number,
    required: true,
    min: 0,
    max: 23.75,
    validate: {
      validator: function(v) {
        return v % 0.25 === 0 && v > this.startTime;
      },
      message: props => `${props.value} no es un horario válido o es menor que la hora de inicio.`
    }
  },
  // Indicador si este horario está activo
  isActive: {
    type: Boolean,
    default: true
  },
  // Campo para fechas especiales (ej: días festivos, vacaciones)
  isException: {
    type: Boolean,
    default: false
  },
  // Fecha específica para excepciones (null para horarios regulares)
  specificDate: {
    type: Date,
    default: null
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

// Índice compuesto para evitar horarios duplicados
availabilitySchema.index(
  { stylist: 1, dayOfWeek: 1, startTime: 1, specificDate: 1 },
  { unique: true }
);

// Middleware para actualizar la fecha de modificación
availabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método estático para obtener la disponibilidad para una fecha específica
availabilitySchema.statics.getAvailabilityForDate = async function(stylistId, date) {
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split('T')[0];

  // Buscar excepciones para esa fecha específica primero
  const exceptions = await this.find({
    stylist: stylistId,
    isException: true,
    specificDate: {
      $gte: new Date(`${dateString}T00:00:00.000Z`),
      $lt: new Date(`${dateString}T23:59:59.999Z`)
    },
    isActive: true
  });

  // Si hay excepciones, retornarlas
  if (exceptions.length > 0) {
    return exceptions;
  }

  // De lo contrario, retornar el horario normal para ese día de la semana
  return await this.find({
    stylist: stylistId,
    dayOfWeek: dayOfWeek,
    isException: false,
    isActive: true
  });
};

// Convertir horas decimales a formato HH:MM
availabilitySchema.methods.formatTime = function(decimalTime) {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;