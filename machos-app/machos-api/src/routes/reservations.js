// routes/reservations.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');
const reservationController = require('../controllers/reservationController');

// Obtener todas las reservas (solo admin)
router.get('/', authMiddleware, checkRole(['admin']), reservationController.getAllReservations);

// Obtener reservas del usuario actual
router.get('/me', authMiddleware, reservationController.getMyReservations);

// Verificar disponibilidad
router.get('/availability', authMiddleware, reservationController.checkAvailability);

// Obtener una reserva por ID
router.get('/:id', authMiddleware, reservationController.getReservationById);

// Crear una nueva reserva
router.post('/', 
  authMiddleware,
  [
    check('serviceId', 'El ID del servicio es requerido').not().isEmpty(),
    check('barberId', 'El ID del peluquero es requerido').not().isEmpty(),
    check('date', 'La fecha y hora son requeridas').not().isEmpty(),
  ],
  reservationController.createReservation
);

// Actualizar estado de una reserva
router.patch('/:id/status',
  authMiddleware,
  [
    check('status', 'El estado es requerido')
      .not().isEmpty()
      .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
      .withMessage('Estado inválido')
  ],
  reservationController.updateReservationStatus
);

// Eliminar una reserva (solo admin)
router.delete('/:id', authMiddleware, checkRole(['admin']), reservationController.deleteReservation);

module.exports = router;