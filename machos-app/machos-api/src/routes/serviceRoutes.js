const express = require('express');
const serviceController = require('../controllers/serviceController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Proteger todas las rutas siguientes
router.use(authMiddleware);

// Rutas solo para administradores
router.use(checkRole(['admin']));

router
  .route('/')
  .post(serviceController.createService);

router
  .route('/:id')
  .put(serviceController.updateService)
  .delete(serviceController.deleteService);

// Estas rutas se implementarán más adelante
// router.patch('/:id/activate', serviceController.activateService);
// router.patch('/:id/deactivate', serviceController.deactivateService);

module.exports = router;