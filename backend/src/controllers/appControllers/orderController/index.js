const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const Order = require('@/models/appModels/Order');
const Client = require('@/models/appModels/Client');
const Product = require('@/models/coreModels/Product');
const ExcelJS = require('exceljs');
const methods = createCRUDController('Order');

const create = async (req, res) => {
  try {
    console.log('🚀 Creating order with data:', req.body);
    console.log('👤 User:', req.user);
    
    const { 
      customer, 
      product, 
      quantity, 
      price, 
      discount = 0, 
      status = 'pending',
      phone,
      state,
      city,
      address,
      note
    } = req.body;
    
    console.log('📝 Extracted data:', { customer, product, quantity, price, discount, status });
    
    // Crear la orden de forma simplificada
    const newOrder = new Order({
      customer,
      product,
      quantity,
      price,
      discount,
      status,
      phone,
      state,
      city,
      address,
      note,
      createdBy: req.user?._id || '000000000000000000000000' // ID temporal si no hay usuario
    });

    console.log('💾 Saving order...');
    await newOrder.save();
    console.log('✅ Order saved successfully');

    res.status(201).json({
      success: true,
      result: newOrder,
      message: 'Orden creada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error creando orden:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que la orden existe
    const existingOrder = await Order.findOne({ 
      _id: id, 
      removed: false 
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Si se está cambiando el producto o cantidad, verificar stock
    if (updateData.product || updateData.quantity) {
      const productId = updateData.product || existingOrder.product;
      const newQuantity = updateData.quantity || existingOrder.quantity;
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Calcular diferencia de stock
      const quantityDiff = newQuantity - existingOrder.quantity;
      if (product.stock < quantityDiff) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${product.stock} unidades`
        });
      }

      // Actualizar stock
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: -quantityDiff } }
      );
    }

    // Actualizar la orden
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { ...updateData, updated: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'product', select: 'name reference price category' },
      { path: 'product.category', select: 'name color' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      result: updatedOrder,
      message: 'Orden actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const read = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ 
      _id: id, 
      removed: false 
    }).populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'product', select: 'name reference price category' },
      { path: 'product.category', select: 'name color' },
      { path: 'createdBy', select: 'name email' }
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      result: order
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const list = async (req, res) => {
  try {
    console.log('🔍 Order list request:', req.query);
    
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;
    const { sortBy = 'created', sortValue = -1, filter, equal } = req.query;
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

    // Ejecutar consulta con población
    const resultsPromise = Order.find(query)
      .populate('customer', 'name email phone')
      .populate('product', 'name reference price category')
      .populate('product.category', 'name color')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortValue })
      .exec();

    // Contar documentos
    const countPromise = Order.countDocuments(query);

    const [result, count] = await Promise.all([resultsPromise, countPromise]);
    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    console.log('✅ Orders found:', count, 'Results:', result.length);

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result,
        pagination
      });
    } else {
      return res.status(200).json({
        success: true,
        result: [],
        pagination
      });
    }

  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getOrdersWithDetails = async (req, res) => {
  try {
    const orders = await Order.getOrdersWithDetails();
    
    res.status(200).json({
      success: true,
      result: orders
    });

  } catch (error) {
    console.error('Error obteniendo órdenes con detalles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const order = await Order.findOne({ 
      _id: id, 
      removed: false 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    await order.updateStatus(status, reason);

    // Poblar la orden actualizada
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'product', select: 'name reference price category' },
      { path: 'product.category', select: 'name color' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      result: order,
      message: 'Estado de orden actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getOrderStats();
    
    res.status(200).json({
      success: true,
      result: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const exportToExcel = async (req, res) => {
  try {
    console.log('📊 Exporting orders to Excel...');
    
    // Obtener todas las órdenes con datos relacionados
    const orders = await Order.find({ removed: false })
      .populate('customer', 'name email phone')
      .populate('product', 'name reference price category')
      .populate('product.category', 'name color')
      .populate('createdBy', 'name email')
      .sort({ created: -1 });

    // Crear un nuevo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Órdenes');

    // Definir las columnas
    worksheet.columns = [
      { header: 'Número de Orden', key: 'orderNumber', width: 15 },
      { header: 'Cliente', key: 'customerName', width: 25 },
      { header: 'Email Cliente', key: 'customerEmail', width: 30 },
      { header: 'Teléfono Cliente', key: 'customerPhone', width: 15 },
      { header: 'Producto', key: 'productName', width: 25 },
      { header: 'Referencia', key: 'productReference', width: 15 },
      { header: 'Categoría', key: 'productCategory', width: 20 },
      { header: 'Cantidad', key: 'quantity', width: 10 },
      { header: 'Precio Unitario', key: 'price', width: 15 },
      { header: 'Descuento', key: 'discount', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Estado/Provincia', key: 'state', width: 20 },
      { header: 'Ciudad', key: 'city', width: 20 },
      { header: 'Dirección', key: 'address', width: 30 },
      { header: 'Notas', key: 'note', width: 30 },
      { header: 'Fecha de Creación', key: 'createdAt', width: 20 },
      { header: 'Creado por', key: 'createdByName', width: 20 }
    ];

    // Estilo para el encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Agregar datos
    orders.forEach(order => {
      worksheet.addRow({
        orderNumber: order.orderNumber || 'N/A',
        customerName: order.customer?.name || 'N/A',
        customerEmail: order.customer?.email || 'N/A',
        customerPhone: order.customer?.phone || 'N/A',
        productName: order.product?.name || 'N/A',
        productReference: order.product?.reference || 'N/A',
        productCategory: order.product?.category?.name || 'N/A',
        quantity: order.quantity || 0,
        price: order.price || 0,
        discount: order.discount || 0,
        total: order.total || 0,
        status: order.status || 'N/A',
        phone: order.phone || 'N/A',
        state: order.state || 'N/A',
        city: order.city || 'N/A',
        address: order.address || 'N/A',
        note: order.note || 'N/A',
        createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES') : 'N/A',
        createdByName: order.createdBy?.name || 'N/A'
      });
    });

    // Aplicar bordes a todas las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Configurar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ordenes_${new Date().toISOString().split('T')[0]}.xlsx"`);

    // Escribir el archivo
    await workbook.xlsx.write(res);
    res.end();

    console.log('✅ Excel export completed successfully');

  } catch (error) {
    console.error('❌ Error exporting orders to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar órdenes a Excel',
      error: error.message
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ 
      _id: id, 
      removed: false 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Restaurar stock del producto
    await Product.findByIdAndUpdate(
      order.product,
      { $inc: { stock: order.quantity } }
    );

    // Soft delete de la orden
    await order.softDelete();

    res.status(200).json({
      success: true,
      message: 'Orden eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  ...methods,
  list,
  read,
  create,
  update,
  remove,
  getOrdersWithDetails,
  updateOrderStatus,
  getOrderStats,
  exportToExcel
};
