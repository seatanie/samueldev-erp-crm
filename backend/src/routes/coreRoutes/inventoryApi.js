const express = require('express');
const router = express.Router();
const inventoryController = require('@/controllers/coreControllers/inventoryController');

// Rutas de inventario
router.get('/', inventoryController.getInventoryWithDetails);
router.get('/low-stock', inventoryController.getLowStockProducts);
router.get('/reorder', inventoryController.getReorderProducts);
router.get('/stats', inventoryController.getInventoryStats);
router.get('/movements', inventoryController.getMovementHistory);
router.post('/update-stock', inventoryController.updateStock);

// Rutas CRUD básicas
router.get('/:id', inventoryController.read);
router.post('/', inventoryController.create);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.delete);

module.exports = router;
