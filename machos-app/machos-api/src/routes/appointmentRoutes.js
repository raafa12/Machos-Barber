const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Obtener slots disponibles
router.get('/available-slots', appointmentController.getAvailableTimeSlots);

// Crear una nueva reserva
router.post('/', appointmentController.createAppointment);

// Obtener las reservas del usuario autenticado
router.get('/my-appointments', appointmentController.getUserAppointments);

// Obtener todas las reservas (admin)
router.get('/all', appointmentController.getAllAppointments);

// Obtener detalles de una reserva específica
router.get('/:id', appointmentController.getAppointmentById);

// Actualizar estado de una reserva
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// Cancelar una reserva
router.post('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;