const express = require('express');
const router = express.Router();
const productCategoryController = require('@/controllers/coreControllers/productCategoryController');

// Rutas CRUD básicas
router.get('/list', productCategoryController.list);
router.get('/search', productCategoryController.search);
router.get('/', productCategoryController.list);
router.get('/:id', productCategoryController.read);
router.post('/', productCategoryController.create);
router.post('/create', productCategoryController.create); // Ruta específica para CrudModule
router.put('/:id', productCategoryController.update);
router.patch('/update/:id', productCategoryController.update); // Ruta específica para CrudModule
router.delete('/:id', productCategoryController.delete);
router.delete('/delete/:id', productCategoryController.delete); // Ruta específica para CrudModule



// Rutas personalizadas
router.patch('/:id/toggle-status', productCategoryController.toggleStatus);
router.get('/enabled/list', productCategoryController.getEnabledCategories);

module.exports = router;
