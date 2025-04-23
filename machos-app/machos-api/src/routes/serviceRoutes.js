const express = require('express');
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getService);

// Proteger todas las rutas siguientes
router.use(authMiddleware.protect);

// Rutas solo para administradores
router.use(authMiddleware.restrictTo('admin'));

router
  .route('/')
  .post(serviceController.createService);

router
  .route('/:id')
  .put(serviceController.updateService)
  .delete(serviceController.deleteService);

router.patch('/:id/activate', serviceController.activateService);
router.patch('/:id/deactivate', serviceController.deactivateService);

module.exports = router;