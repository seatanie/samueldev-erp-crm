const express = require('express');
const router = express.Router();
const productController = require('@/controllers/coreControllers/productController');

// Rutas CRUD básicas
router.get('/list', productController.list);
router.get('/search', productController.search);
router.get('/', productController.list);
router.get('/:id', productController.read);
router.post('/', productController.create);
router.post('/create', productController.create); // Ruta específica para CrudModule
router.put('/:id', productController.update);
router.patch('/update/:id', productController.update); // Ruta específica para CrudModule
router.delete('/:id', productController.delete);
router.delete('/delete/:id', productController.delete); // Ruta específica para CrudModule

// Rutas personalizadas
router.patch('/:id/toggle-status', productController.toggleStatus);
router.get('/with-categories/list', productController.getProductsWithCategories);

module.exports = router;
