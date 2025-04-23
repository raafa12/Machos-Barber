// routes/reservations.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const reservationController = require('../controllers/reservationController');

// Middleware para verificar si es admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Obtener todas las reservas (solo admin)
router.get('/', auth, isAdmin, reservationController.getAllReservations);

// Obtener reservas del usuario actual
router.get('/me', auth, reservationController.getMyReservations);

// Verificar disponibilidad
router.get('/availability', auth, reservationController.checkAvailability);

// Obtener una reserva por ID
router.get('/:id', auth, reservationController.getReservationById);

// Crear una nueva reserva
router.post('/', 
  auth,
  [
    check('serviceId', 'El ID del servicio es requerido').not().isEmpty(),
    check('barberId', 'El ID del peluquero es requerido').not().isEmpty(),
    check('date', 'La fecha y hora son requeridas').not().isEmpty(),
  ],
  reservationController.createReservation
);

// Actualizar estado de una reserva
router.patch('/:id/status',
  auth,
  [
    check('status', 'El estado es requerido')
      .not().isEmpty()
      .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
      .withMessage('Estado inválido')
  ],
  reservationController.updateReservationStatus
);

// Eliminar una reserva (solo admin)
router.delete('/:id', auth, isAdmin, reservationController.deleteReservation);

module.exports = router;