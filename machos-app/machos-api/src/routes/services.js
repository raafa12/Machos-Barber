// routes/services.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const serviceController = require('../controllers/serviceController');

// Middleware para verificar si es admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Obtener todos los servicios (público)
router.get('/', serviceController.getAllServices);

// Obtener un servicio por ID (público)
router.get('/:id', serviceController.getServiceById);

// Crear un nuevo servicio (solo admin)
router.post('/',
  auth,
  isAdmin,
  [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('price', 'El precio es requerido').not().isEmpty().isNumeric(),
    check('duration', 'La duración es requerida').not().isEmpty().isNumeric(),
    check('category', 'La categoría es requerida').not().isEmpty()
  ],
  serviceController.createService
);

// Actualizar un servicio (solo admin)
router.put('/:id',
  auth,
  isAdmin,
  [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('price', 'El precio es requerido').not().isEmpty().isNumeric(),
    check('duration', 'La duración es requerida').not().isEmpty().isNumeric(),
    check('category', 'La categoría es requerida').not().isEmpty()
  ],
  serviceController.updateService
);

// Eliminar un servicio (solo admin)
router.delete('/:id', auth, isAdmin, serviceController.deleteService);

module.exports = router;