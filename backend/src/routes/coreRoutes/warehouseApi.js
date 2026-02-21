const express = require('express');
const router = express.Router();
const warehouseController = require('@/controllers/coreControllers/warehouseController');
const Warehouse = require('@/models/coreModels/Warehouse');

// Obtener almacén principal
router.get('/main', async (req, res) => {
  try {
    const mainWarehouse = await Warehouse.getMainWarehouse();
    res.status(200).json({
      success: true,
      result: mainWarehouse,
      message: 'Almacén principal obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo almacén principal:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener almacenes activos
router.get('/active', async (req, res) => {
  try {
    const activeWarehouses = await Warehouse.getActiveWarehouses();
    res.status(200).json({
      success: true,
      result: activeWarehouses,
      message: 'Almacenes activos obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo almacenes activos:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
});

// Calcular capacidad utilizada
router.post('/:id/calculate-capacity', async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Almacén no encontrado'
      });
    }

    const usedCapacity = await warehouse.calculateUsedCapacity();
    
    res.status(200).json({
      success: true,
      result: { usedCapacity, warehouse },
      message: 'Capacidad calculada exitosamente'
    });
  } catch (error) {
    console.error('Error calculando capacidad:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
});

// Rutas CRUD básicas
router.get('/', warehouseController.list);
router.get('/:id', warehouseController.read);
router.post('/', warehouseController.create);
router.put('/:id', warehouseController.update);
router.delete('/:id', warehouseController.delete);

module.exports = router;
