const express = require('express');
const router = express.Router();
const zoneController = require('@/controllers/appControllers/zoneController');
const adminAuth = require('@/controllers/coreControllers/adminAuth');

// Aplicar autenticación a todas las rutas
router.use(adminAuth.isValidAuthToken);

// Rutas CRUD básicas
router.post('/', zoneController.create);
router.get('/', zoneController.list);
router.get('/summary', zoneController.summary);
router.get('/search-location', zoneController.searchByLocation);
router.get('/:id', zoneController.read);
router.put('/:id', zoneController.update);
router.delete('/:id', zoneController.remove);

// Rutas adicionales
router.patch('/:id/toggle-status', zoneController.toggleStatus);

module.exports = router;
