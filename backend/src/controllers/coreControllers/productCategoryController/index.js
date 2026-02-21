const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const ProductCategory = require('@/models/coreModels/ProductCategory');
const methods = createCRUDController('ProductCategory');

const create = async (req, res) => {
  try {
    const { name, description, color, enabled } = req.body;
    
    console.log('🎨 Color recibido:', color);
    console.log('🎨 Tipo de color:', typeof color);
    console.log('🎨 Color stringified:', JSON.stringify(color));
    
    // Extraer el valor hexadecimal del color si viene como objeto
    let colorValue = color;
    
    // Función para convertir HSV a RGB
    const hsvToRgb = (h, s, v) => {
      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;
      
      let r, g, b;
      if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
      } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
      } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
      } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
      } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
      } else {
        r = c; g = 0; b = x;
      }
      
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      
      return { r, g, b };
    };
    
    // Función para procesar objeto HSV
    const processHsvObject = (hsvObj) => {
      console.log('🎨 HSV Object recibido:', hsvObj);
      const h = hsvObj.h;
      const s = hsvObj.s;
      const v = hsvObj.v;
      
      console.log('🎨 Valores HSV:', { h, s, v });
      const rgb = hsvToRgb(h, s, v);
      console.log('🎨 RGB calculado:', rgb);
      
      const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
      console.log('🎨 Hexadecimal final:', hex);
      
      return hex;
    };
    
    if (color && typeof color === 'object') {
      // Si viene del ColorPicker de Ant Design con estructura metaColor
      if (color.metaColor && color.metaColor.originalInput) {
        console.log('🎨 Procesando metaColor.originalInput:', color.metaColor.originalInput);
        const originalInput = color.metaColor.originalInput;
        if (originalInput.h !== undefined && originalInput.s !== undefined && originalInput.v !== undefined) {
          colorValue = processHsvObject(originalInput);
        } else {
          // Si no tiene HSV, usar el valor tal como viene
          colorValue = typeof originalInput === 'string' ? originalInput : JSON.stringify(originalInput);
        }
      } else if (color.h !== undefined && color.s !== undefined && color.v !== undefined) {
        console.log('🎨 Procesando objeto HSV directo:', color);
        colorValue = processHsvObject(color);
      } else if (color.toHexString) {
        colorValue = color.toHexString();
      } else {
        // Fallback: convertir a string
        colorValue = JSON.stringify(color);
      }
    }
    
    // Asegurar que colorValue sea siempre un string
    if (typeof colorValue === 'object') {
      console.log('⚠️ ColorValue sigue siendo objeto, convirtiendo a string:', colorValue);
      colorValue = JSON.stringify(colorValue);
    } else if (color && typeof color === 'string') {
      // Si viene como string JSON, intentar parsearlo
      try {
        const parsedColor = JSON.parse(color);
        if (parsedColor.h !== undefined && parsedColor.s !== undefined && parsedColor.v !== undefined) {
          console.log('🎨 Procesando string JSON HSV:', parsedColor);
          colorValue = processHsvObject(parsedColor);
        } else {
          colorValue = color;
        }
      } catch (e) {
        // Si no es JSON válido, usar el string tal como viene
        colorValue = color;
      }
    }
    
    console.log('🎨 ColorValue final:', colorValue);
    console.log('🎨 Tipo de colorValue final:', typeof colorValue);
    console.log('🎨 Es objeto colorValue?', typeof colorValue === 'object');
    
    // Forzar conversión a string si sigue siendo objeto
    if (typeof colorValue === 'object') {
      console.log('🚨 FORZANDO CONVERSIÓN A STRING');
      colorValue = JSON.stringify(colorValue);
    }
    
    console.log('🎨 ColorValue después de forzar:', colorValue);
    console.log('🎨 Tipo después de forzar:', typeof colorValue);
    
    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategory = await ProductCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      removed: false 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const newCategory = new ProductCategory({
      name,
      description,
      color: colorValue,
      enabled: enabled !== undefined ? enabled : true,
      createdBy: req.admin._id
    });

    const savedCategory = await newCategory.save();
    
    res.status(201).json({
      success: true,
      result: savedCategory,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, enabled } = req.body;
    
    // Extraer el valor hexadecimal del color si viene como objeto
    let colorValue = color;
    
    // Función para convertir HSV a RGB
    const hsvToRgb = (h, s, v) => {
      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;
      
      let r, g, b;
      if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
      } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
      } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
      } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
      } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
      } else {
        r = c; g = 0; b = x;
      }
      
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      
      return { r, g, b };
    };
    
    // Función para procesar objeto HSV
    const processHsvObject = (hsvObj) => {
      console.log('🎨 HSV Object recibido:', hsvObj);
      const h = hsvObj.h;
      const s = hsvObj.s;
      const v = hsvObj.v;
      
      console.log('🎨 Valores HSV:', { h, s, v });
      const rgb = hsvToRgb(h, s, v);
      console.log('🎨 RGB calculado:', rgb);
      
      const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
      console.log('🎨 Hexadecimal final:', hex);
      
      return hex;
    };
    
    if (color && typeof color === 'object') {
      // Si viene del ColorPicker de Ant Design con estructura metaColor
      if (color.metaColor && color.metaColor.originalInput) {
        console.log('🎨 Procesando metaColor.originalInput:', color.metaColor.originalInput);
        const originalInput = color.metaColor.originalInput;
        if (originalInput.h !== undefined && originalInput.s !== undefined && originalInput.v !== undefined) {
          colorValue = processHsvObject(originalInput);
        } else {
          // Si no tiene HSV, usar el valor tal como viene
          colorValue = typeof originalInput === 'string' ? originalInput : JSON.stringify(originalInput);
        }
      } else if (color.h !== undefined && color.s !== undefined && color.v !== undefined) {
        console.log('🎨 Procesando objeto HSV directo:', color);
        colorValue = processHsvObject(color);
      } else if (color.toHexString) {
        colorValue = color.toHexString();
      } else {
        // Fallback: convertir a string
        colorValue = JSON.stringify(color);
      }
    }
    
    // Asegurar que colorValue sea siempre un string
    if (typeof colorValue === 'object') {
      console.log('⚠️ ColorValue sigue siendo objeto, convirtiendo a string:', colorValue);
      colorValue = JSON.stringify(colorValue);
    } else if (color && typeof color === 'string') {
      // Si viene como string JSON, intentar parsearlo
      try {
        const parsedColor = JSON.parse(color);
        if (parsedColor.h !== undefined && parsedColor.s !== undefined && parsedColor.v !== undefined) {
          console.log('🎨 Procesando string JSON HSV:', parsedColor);
          colorValue = processHsvObject(parsedColor);
        } else {
          colorValue = color;
        }
      } catch (e) {
        // Si no es JSON válido, usar el string tal como viene
        colorValue = color;
      }
    }
    
    // Verificar si ya existe otra categoría con el mismo nombre
    if (name) {
      const existingCategory = await ProductCategory.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id },
        removed: false 
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otra categoría con ese nombre'
        });
      }
    }

    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      id,
      {
        name,
        description,
        color: colorValue,
        enabled,
        updatedBy: req.admin._id
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      result: updatedCategory,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    category.enabled = !category.enabled;
    category.updatedBy = req.admin._id;
    await category.save();

    res.json({
      success: true,
      result: category,
      message: `Categoría ${category.enabled ? 'habilitada' : 'deshabilitada'} exitosamente`
    });
  } catch (error) {
    console.error('Error cambiando estado de categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getEnabledCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find({ enabled: true, removed: false })
      .select('name color')
      .sort({ name: 1 });

    res.json({
      success: true,
      result: categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías habilitadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Soft delete
    category.removed = true;
    category.updatedBy = req.admin._id;
    await category.save();

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función read personalizada para compatibilidad con CrudModule
const read = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el ID sea válido
    if (!id || id === 'list' || id === 'create' || id === 'update' || id === 'delete') {
      return res.status(400).json({
        success: false,
        message: 'ID de categoría inválido'
      });
    }

    const category = await ProductCategory.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      result: category,
      message: 'Categoría encontrada exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función list personalizada para compatibilidad con CrudModule
const list = async (req, res) => {
  try {
    console.log('🔍 ProductCategory list request:', req.query);
    
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;
    const { sortBy = 'createdAt', sortValue = -1, filter, equal } = req.query;
    const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];
    const searchQuery = req.query.q || '';

    console.log('📊 Query parameters:', { page, limit, skip, sortBy, sortValue, filter, equal, fieldsArray, searchQuery });

    // Construir filtros de búsqueda
    let searchFields = {};
    if (searchQuery && fieldsArray.length > 0) {
      searchFields = {
        $or: fieldsArray.map(field => ({
          [field]: { $regex: new RegExp(searchQuery, 'i') }
        }))
      };
    }

    // Construir filtros adicionales
    let additionalFilters = {};
    if (filter && equal !== undefined) {
      additionalFilters[filter] = equal;
    }

    // Consulta principal
    const query = {
      removed: false,
      ...searchFields,
      ...additionalFilters
    };

    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));

    // Ejecutar consulta
    const resultsPromise = ProductCategory.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortValue })
      .exec();

    // Contar documentos
    const countPromise = ProductCategory.countDocuments(query);

    const [result, count] = await Promise.all([resultsPromise, countPromise]);
    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    console.log('✅ ProductCategories found:', count, 'Results:', result.length);

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result,
        pagination,
        message: 'Successfully found all product categories',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No product categories found',
      });
    }
  } catch (error) {
    console.error('❌ Error listing product categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  ...methods,
  list, // Sobrescribir la función list del CRUD genérico
  read, // Sobrescribir la función read del CRUD genérico
  create,
  update,
  toggleStatus,
  getEnabledCategories,
  remove
};
