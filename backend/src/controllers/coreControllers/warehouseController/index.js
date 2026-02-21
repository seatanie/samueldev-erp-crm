const Warehouse = require('@/models/coreModels/Warehouse');

// Métodos CRUD básicos
const create = async (req, res) => {
  try {
    const warehouseData = {
      ...req.body,
      createdBy: req.admin._id,
      updatedBy: req.admin._id
    };
    
    const warehouse = new Warehouse(warehouseData);
    await warehouse.save();
    
    const populatedWarehouse = await Warehouse.findById(warehouse._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      result: populatedWarehouse,
      message: 'Almacén creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando almacén:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

const read = async (req, res) => {
  try {
    const { id } = req.params;
    
    const warehouse = await Warehouse.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Almacén no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      result: warehouse,
      message: 'Almacén obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo almacén:', error);
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
    
    const warehouse = await Warehouse.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Almacén no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      result: warehouse,
      message: 'Almacén actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando almacén:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const warehouse = await Warehouse.findByIdAndUpdate(
      id,
      { 
        removed: true,
        updatedBy: req.admin._id
      },
      { new: true }
    );
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Almacén no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      result: warehouse,
      message: 'Almacén eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando almacén:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor'
    });
  }
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = { removed: false };
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [warehouses, total] = await Promise.all([
      Warehouse.find(filters)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Warehouse.countDocuments(filters)
    ]);
    
    res.status(200).json({
      success: true,
      result: {
        warehouses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + warehouses.length < total,
          hasPrev: parseInt(page) > 1
        }
      },
      message: 'Almacenes obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo almacenes:', error);
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
  delete: deleteWarehouse,
  list
};







