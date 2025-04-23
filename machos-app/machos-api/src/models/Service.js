const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del servicio es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción del servicio es obligatoria'],
    trim: true
  },
  duration: {
    type: Number, // Duración en minutos
    required: [true, 'La duración del servicio es obligatoria'],
    min: [5, 'La duración mínima es de 5 minutos']
  },
  price: {
    type: Number,
    required: [true, 'El precio del servicio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  image: {
    type: String, // URL de la imagen
    default: 'default-service.jpg'
  },
  active: {
    type: Boolean,
    default: true
  },
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
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;