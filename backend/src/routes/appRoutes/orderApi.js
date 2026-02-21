const express = require('express');
const router = express.Router();
const { catchErrors } = require('@/handlers/errorHandlers');
const orderController = require('@/controllers/appControllers/orderController');
const createInvoiceFromOrder = require('@/controllers/appControllers/orderController/createInvoiceFromOrder');

// Rutas CRUD básicas
router.get('/list', catchErrors(orderController.list));
router.get('/search', catchErrors(orderController.search));
router.get('/', catchErrors(orderController.list));
router.get('/:id', catchErrors(orderController.read));
router.post('/create', catchErrors(orderController.create));
router.post('/test-create', catchErrors(orderController.create)); // Ruta de prueba sin auth
router.patch('/update/:id', catchErrors(orderController.update));
router.delete('/delete/:id', catchErrors(orderController.remove));

// Rutas específicas para órdenes
router.get('/with-details/list', catchErrors(orderController.getOrdersWithDetails));
router.patch('/:id/status', catchErrors(orderController.updateOrderStatus));
router.get('/stats', catchErrors(orderController.getOrderStats));
router.get('/export/excel', catchErrors(orderController.exportToExcel));

// Ruta para crear factura desde orden
router.post('/:id/create-invoice', catchErrors(createInvoiceFromOrder));

module.exports = router;
