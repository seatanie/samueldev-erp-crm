const Inventory = require('@/models/coreModels/Inventory');
const InventoryMovement = require('@/models/coreModels/InventoryMovement');
const Warehouse = require('@/models/coreModels/Warehouse');
const Product = require('@/models/coreModels/Product');

// Métodos CRUD básicos
const create = async (req, res) => {
  try {
    const inventoryData = {
      ...req.body,
      createdBy: req.admin._id,
      updatedBy: req.admin._id
    };
    
    const inventory = new Inventory(inventoryData);
    await inventory.save();
    
    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('product', 'name reference price image')
      .populate('warehouse', 'name code')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      result: populatedInventory,
      message: 'Registro de inventario creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando inventario:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.admin._id
    };
    
    const inventory = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('product', 'name reference price image')
     .populate('warehouse', 'name code')
     .populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Registro de inventario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      result: inventory,
      message: 'Registro de inventario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando inventario:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventory = await Inventory.findByIdAndUpdate(
      id,
      { 
        removed: true,
        updatedBy: req.admin._id
      },
      { new: true }
    );
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Registro de inventario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      result: inventory,
      message: 'Registro de inventario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando inventario:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener inventario con información completa
const getInventoryWithDetails = async (req, res) => {
  try {
    const { page = 1, limit = 10, warehouse, product, lowStock, reorder } = req.query;
    
    const filters = { removed: false };
    
    if (warehouse) filters.warehouse = warehouse;
    if (product) filters.product = product;
    
    // Filtros especiales
    if (lowStock === 'true') {
      filters.$expr = { $lte: ['$currentStock', '$minStock'] };
    }
    
    if (reorder === 'true') {
      filters.$expr = { $lte: ['$currentStock', '$reorderPoint'] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inventory, total] = await Promise.all([
      Inventory.find(filters)
        .populate('product', 'name reference price image')
        .populate('warehouse', 'name code')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Inventory.countDocuments(filters)
    ]);

    res.status(200).json({
      success: true,
      result: {
        inventory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + inventory.length < total,
          hasPrev: parseInt(page) > 1
        }
      },
      message: 'Inventario obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener productos con stock bajo
const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Inventory.getLowStockProducts();
    
    res.status(200).json({
      success: true,
      result: lowStockProducts,
      message: 'Productos con stock bajo obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener productos que necesitan reorden
const getReorderProducts = async (req, res) => {
  try {
    const reorderProducts = await Inventory.getReorderProducts();
    
    res.status(200).json({
      success: true,
      result: reorderProducts,
      message: 'Productos que necesitan reorden obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo productos para reorden:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar stock de un producto
const updateStock = async (req, res) => {
  try {
    const { inventoryId, quantity, type, reason, reference } = req.body;
    const userId = req.admin._id;

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Registro de inventario no encontrado'
      });
    }

    // Validar que el tipo de movimiento sea válido
    const validTypes = ['in', 'out', 'adjustment', 'reserve', 'unreserve'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Tipo de movimiento inválido'
      });
    }

    // Validar cantidad
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    // Validar que no se retire más stock del disponible
    if (type === 'out' && quantity > inventory.availableStock) {
      return res.status(400).json({
        success: false,
        result: null,
        message: `No hay suficiente stock disponible. Stock actual: ${inventory.availableStock}`
      });
    }

    // Actualizar stock
    await inventory.updateStock(quantity, type, reason, userId);

    // Actualizar referencia si se proporciona
    if (reference) {
      await InventoryMovement.findOneAndUpdate(
        { product: inventory.product, warehouse: inventory.warehouse },
        { reference },
        { sort: { createdAt: -1 } }
      );
    }

    // Obtener inventario actualizado
    const updatedInventory = await Inventory.findById(inventoryId)
      .populate('product', 'name reference price image')
      .populate('warehouse', 'name code');

    res.status(200).json({
      success: true,
      result: updatedInventory,
      message: 'Stock actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener historial de movimientos
const getMovementHistory = async (req, res) => {
  try {
    const { 
      productId, 
      warehouseId, 
      fromDate, 
      toDate, 
      type, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filters = { removed: false };
    
    if (productId) filters.product = productId;
    if (warehouseId) filters.warehouse = warehouseId;
    if (type) filters.type = type;
    
    if (fromDate || toDate) {
      filters.createdAt = {};
      if (fromDate) filters.createdAt.$gte = new Date(fromDate);
      if (toDate) filters.createdAt.$lte = new Date(toDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movements, total] = await Promise.all([
      InventoryMovement.find(filters)
        .populate('product', 'name reference')
        .populate('warehouse', 'name code')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InventoryMovement.countDocuments(filters)
    ]);

    res.status(200).json({
      success: true,
      result: {
        movements,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + movements.length < total,
          hasPrev: parseInt(page) > 1
        }
      },
      message: 'Historial de movimientos obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo historial de movimientos:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de inventario
const getInventoryStats = async (req, res) => {
  try {
    const { warehouseId } = req.query;

    const matchStage = { removed: false };
    if (warehouseId) matchStage.warehouse = warehouseId;

    const stats = await Inventory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          totalValue: { $sum: { $multiply: ['$currentStock', '$product.price'] } },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lte: ['$currentStock', '$minStock'] },
                1,
                0
              ]
            }
          },
          reorderCount: {
            $sum: {
              $cond: [
                { $lte: ['$currentStock', '$reorderPoint'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      lowStockCount: 0,
      reorderCount: 0
    };

    res.status(200).json({
      success: true,
      result,
      message: 'Estadísticas de inventario obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de inventario:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener inventario por ID
const read = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventory = await Inventory.findById(id)
      .populate('product', 'name reference price image description')
      .populate('warehouse', 'name code location')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Registro de inventario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      result: inventory,
      message: 'Registro de inventario obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  create,
  read,
  update,
  delete: deleteInventory,
  getInventoryWithDetails,
  getLowStockProducts,
  getReorderProducts,
  updateStock,
  getMovementHistory,
  getInventoryStats
};
