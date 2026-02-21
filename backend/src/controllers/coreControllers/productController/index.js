const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const Product = require('@/models/coreModels/Product');
const ProductCategory = require('@/models/coreModels/ProductCategory');
const methods = createCRUDController('Product');

const create = async (req, res) => {
  try {
    const { name, description, reference, price, category, image, stock, enabled } = req.body;
    
    // Extraer la información de la imagen si viene como objeto del Upload
    let imageValue = null;
    if (image && Array.isArray(image) && image.length > 0) {
      // Si es un array de archivos, tomar el primer archivo
      const file = image[0];
      if (file.thumbUrl) {
        // Usar la URL de vista previa si está disponible
        imageValue = file.thumbUrl;
      } else if (file.url) {
        // Usar la URL del archivo si está disponible
        imageValue = file.url;
      } else if (file.name) {
        // Solo guardar el nombre del archivo como referencia
        imageValue = file.name;
      }
    } else if (typeof image === 'string') {
      // Si ya es un string, usarlo directamente
      imageValue = image;
    }
    
    // Verificar si ya existe un producto con la misma referencia
    const existingProduct = await Product.findOne({ 
      reference: { $regex: new RegExp(`^${reference}$`, 'i') },
      removed: false 
    });
    
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un producto con esa referencia'
      });
    }

    // Verificar que la categoría existe y esté habilitada
    const categoryExists = await ProductCategory.findOne({ 
      _id: category, 
      enabled: true, 
      removed: false 
    });
    
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'La categoría seleccionada no existe o no está habilitada'
      });
    }

    const newProduct = new Product({
      name,
      description,
      reference,
      price,
      category,
      image: imageValue,
      stock: stock || 0,
      enabled: enabled !== undefined ? enabled : true,
      createdBy: req.admin._id
    });

    const savedProduct = await newProduct.save();
    
    // Populate la categoría para la respuesta
    await savedProduct.populate('category', 'name color');
    
    res.status(201).json({
      success: true,
      result: savedProduct,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, reference, price, category, image, stock, enabled } = req.body;
    
    // Extraer la información de la imagen si viene como objeto del Upload
    let imageValue = null;
    if (image && Array.isArray(image) && image.length > 0) {
      // Si es un array de archivos, tomar el primer archivo
      const file = image[0];
      if (file.thumbUrl) {
        // Usar la URL de vista previa si está disponible
        imageValue = file.thumbUrl;
      } else if (file.url) {
        // Usar la URL del archivo si está disponible
        imageValue = file.url;
      } else if (file.name) {
        // Solo guardar el nombre del archivo como referencia
        imageValue = file.name;
      }
    } else if (typeof image === 'string') {
      // Si ya es un string, usarlo directamente
      imageValue = image;
    }
    
    // Verificar si ya existe otro producto con la misma referencia
    if (reference) {
      const existingProduct = await Product.findOne({ 
        reference: { $regex: new RegExp(`^${reference}$`, 'i') },
        _id: { $ne: id },
        removed: false 
      });
      
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro producto con esa referencia'
        });
      }
    }

    // Verificar que la categoría existe y esté habilitada
    if (category) {
      const categoryExists = await ProductCategory.findOne({ 
        _id: category, 
        enabled: true, 
        removed: false 
      });
      
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'La categoría seleccionada no existe o no está habilitada'
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        reference,
        price,
        category,
        image: imageValue,
        stock,
        enabled,
        updatedBy: req.admin._id
      },
      { new: true, runValidators: true }
    ).populate('category', 'name color');

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      result: updatedProduct,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.enabled = !product.enabled;
    product.updatedBy = req.admin._id;
    await product.save();
    
    // Populate la categoría para la respuesta
    await product.populate('category', 'name color');

    res.json({
      success: true,
      result: product,
      message: `Producto ${product.enabled ? 'habilitado' : 'deshabilitado'} exitosamente`
    });
  } catch (error) {
    console.error('Error cambiando estado de producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getProductsWithCategories = async (req, res) => {
  try {
    const { search, category, enabled, page = 1, limit = 10 } = req.query;
    
    let query = { removed: false };
    
    // Filtro de búsqueda
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por categoría
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filtro por estado
    if (enabled !== undefined && enabled !== 'all') {
      query.enabled = enabled === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('category', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      result: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Soft delete
    product.removed = true;
    product.updatedBy = req.admin._id;
    await product.save();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
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
        message: 'ID de producto inválido'
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name color')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      result: product,
      message: 'Producto encontrado exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función list personalizada para compatibilidad con CrudModule
const list = async (req, res) => {
  try {
    console.log('🔍 Product list request:', req.query);
    
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

    // Ejecutar consulta con población de categorías
    const resultsPromise = Product.find(query)
      .populate('category', 'name color')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortValue })
      .exec();

    // Contar documentos
    const countPromise = Product.countDocuments(query);

    const [result, count] = await Promise.all([resultsPromise, countPromise]);
    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    console.log('✅ Products found:', count, 'Results:', result.length);

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result,
        pagination,
        message: 'Successfully found all products',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No products found',
      });
    }
  } catch (error) {
    console.error('❌ Error listing products:', error);
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
  getProductsWithCategories,
  remove
};
