const Zone = require('../../models/appModels/Zone');
const { validateObjectId } = require('../../helpers');

// Crear nueva zona
const create = async (req, res) => {
  try {
    const { name, description, coordinates, center, radius, color, type, status } = req.body;
    
    // Validar datos requeridos
    if (!name || !center || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, centro y coordenadas son requeridos'
      });
    }

    // Validar coordenadas
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas deben ser un array válido'
      });
    }

    // Crear nueva zona
    const zone = new Zone({
      name,
      description,
      coordinates,
      center,
      radius: radius || 0,
      color: color || '#1890ff',
      type: type || 'custom',
      status: status || 'active',
      admin: req.admin._id
    });

    await zone.save();

    res.status(201).json({
      success: true,
      result: zone,
      message: 'Zona creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener lista de zonas con paginación
const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, search, type, status } = req.query;
    
    // Construir filtros
    const filter = {};
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Solo mostrar zonas del admin actual
    filter.admin = req.admin._id;

    // Calcular skip para paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Parsear el ordenamiento
    let sortOptions = { created: -1 }; // valor por defecto
    if (sort) {
      try {
        // Si viene como string, intentar parsearlo
        if (typeof sort === 'string') {
          sortOptions = JSON.parse(sort);
        } else if (typeof sort === 'object') {
          sortOptions = sort;
        }
      } catch (e) {
        console.warn('Error parsing sort parameter, using default:', e.message);
        sortOptions = { created: -1 };
      }
    }

    // Ejecutar consulta
    const zones = await Zone.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('admin', 'name surname email');

    // Contar total de zonas
    const total = await Zone.countDocuments(filter);

    res.json({
      success: true,
      result: zones,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error listing zones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener zona por ID
const read = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de zona inválido'
      });
    }

    const zone = await Zone.findById(id)
      .populate('admin', 'name surname email');

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    // Verificar que la zona pertenece al admin actual
    if (zone.admin._id.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta zona'
      });
    }

    res.json({
      success: true,
      result: zone
    });

  } catch (error) {
    console.error('Error reading zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar zona
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de zona inválido'
      });
    }

    // Buscar zona y verificar permisos
    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    if (zone.admin.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta zona'
      });
    }

    // Actualizar zona
    const updatedZone = await Zone.findByIdAndUpdate(
      id,
      { ...updateData, updated: new Date() },
      { new: true, runValidators: true }
    ).populate('admin', 'name surname email');

    res.json({
      success: true,
      result: updatedZone,
      message: 'Zona actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar zona
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de zona inválido'
      });
    }

    // Buscar zona y verificar permisos
    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    if (zone.admin.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta zona'
      });
    }

    await Zone.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Zona eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cambiar estado de zona
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de zona inválido'
      });
    }

    // Buscar zona y verificar permisos
    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    if (zone.admin.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta zona'
      });
    }

    // Cambiar estado
    const newStatus = zone.status === 'active' ? 'inactive' : 'active';
    const updatedZone = await Zone.findByIdAndUpdate(
      id,
      { status: newStatus, updated: new Date() },
      { new: true }
    ).populate('admin', 'name surname email');

    res.json({
      success: true,
      result: updatedZone,
      message: `Zona ${newStatus === 'active' ? 'activada' : 'desactivada'} exitosamente`
    });

  } catch (error) {
    console.error('Error toggling zone status:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de zonas
const summary = async (req, res) => {
  try {
    const adminId = req.admin._id;

    // Contar zonas por estado
    const statusCounts = await Zone.aggregate([
      { $match: { admin: adminId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Contar zonas por tipo
    const typeCounts = await Zone.aggregate([
      { $match: { admin: adminId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Calcular área total
    const zones = await Zone.find({ admin: adminId });
    const totalArea = zones.reduce((sum, zone) => sum + zone.calculateArea(), 0);

    // Zona más grande
    const largestZone = zones.reduce((largest, zone) => {
      const area = zone.calculateArea();
      return area > largest.area ? { zone, area } : largest;
    }, { zone: null, area: 0 });

    res.json({
      success: true,
      result: {
        total: zones.length,
        active: zones.filter(z => z.status === 'active').length,
        inactive: zones.filter(z => z.status === 'inactive').length,
        statusCounts,
        typeCounts,
        totalArea: Math.round(totalArea * 100) / 100,
        largestZone: largestZone.zone ? {
          name: largestZone.zone.name,
          area: Math.round(largestZone.area * 100) / 100
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting zone summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Buscar zonas por ubicación
const searchByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius en km
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitud y longitud son requeridas'
      });
    }

    const adminId = req.admin._id;

    // Buscar zonas que contengan el punto o estén dentro del radio
    const zones = await Zone.find({
      admin: adminId,
      status: 'active',
      $or: [
        // Zonas que contengan el punto
        { coordinates: { $geoIntersects: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } } } },
        // Zonas cuyo centro esté dentro del radio
        { center: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: radius * 1000 } } }
      ]
    }).populate('admin', 'name surname email');

    res.json({
      success: true,
      result: zones,
      total: zones.length
    });

  } catch (error) {
    console.error('Error searching zones by location:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  create,
  list,
  read,
  update,
  remove,
  toggleStatus,
  summary,
  searchByLocation
};
