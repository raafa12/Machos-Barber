const express = require('express');
const availabilityController = require('../controllers/availabilityController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas para consultar disponibilidad
router.get('/slots/:stylistId', availabilityController.getAvailableSlots);

// Proteger todas las rutas siguientes
router.use(authMiddleware.protect);

// Rutas para clientes (consultar disponibilidad)
router.get('/stylist/:stylistId', availabilityController.getStylistAvailability);

// Rutas solo para administradores (estilistas)
router.use(authMiddleware.restrictTo('admin'));

router.get('/', availabilityController.getStylistAvailability); // Obtener propia disponibilidad
router.post('/', availabilityController.createUpdateAvailability); // Crear/actualizar disponibilidad
router.delete('/:id', availabilityController.deleteAvailability); // Eliminar disponibilidad
router.post('/exception', availabilityController.createException); // Crear excepción (día libre)

module.exports = router;