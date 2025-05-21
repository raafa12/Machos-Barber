// src/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// Rutas para clientes
router.post('/', appointmentController.createAppointment);
router.get('/user', appointmentController.getUserAppointments);
router.get('/available-slots', appointmentController.getAvailableTimeSlots);
router.delete('/:id', appointmentController.cancelAppointment);
router.get('/:id', appointmentController.getAppointmentById);

// Rutas para administradores
router.get('/all', appointmentController.getAllAppointments);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;