const mongoose = require('mongoose');
const Order = require('@/models/appModels/Order');
const Invoice = require('@/models/appModels/Invoice');
const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');

const createInvoiceFromOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la orden
    const order = await Order.findById(id)
      .populate('customer')
      .populate('product')
      .populate('createdBy');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar si ya existe una factura para esta orden
    // Como el modelo no soporta 'order' en converted.from, usamos una búsqueda alternativa
    const existingInvoice = await Invoice.findOne({ 
      content: { $regex: order.orderNumber || order._id.toString(), $options: 'i' }
    });
    
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una factura para esta orden',
        result: existingInvoice
      });
    }

    // Calcular totales
    const subTotal = calculate.multiply(order.quantity, order.price);
    const discountAmount = order.discount || 0;
    const taxRate = 0; // Por defecto sin impuestos, se puede configurar
    const taxTotal = calculate.multiply(subTotal, taxRate / 100);
    const total = calculate.add(calculate.sub(subTotal, discountAmount), taxTotal);

    // Crear los items para la factura
    const items = [{
      itemName: order.product?.name || 'Producto',
      description: order.product?.description || '',
      quantity: order.quantity,
      price: order.price,
      total: subTotal
    }];

    // Generar número de factura primero
    console.log('🔢 Generando número de factura...');
    
    // Verificar si existe el setting invoiceNumber
    const Setting = require('@/models/coreModels/Setting');
    let invoiceNumberSetting = await Setting.findOne({ settingKey: 'invoiceNumber' });
    
    let invoiceNumber;
    if (invoiceNumberSetting) {
      // Incrementar el número existente
      invoiceNumberSetting.settingValue = (invoiceNumberSetting.settingValue || 0) + 1;
      await invoiceNumberSetting.save();
      invoiceNumber = invoiceNumberSetting.settingValue;
    } else {
      // Crear el setting con valor 1
      console.log('🔢 Setting invoiceNumber no existe, creándolo...');
      const newSetting = new Setting({
        settingKey: 'invoiceNumber',
        settingValue: 1,
        settingCategory: 'invoice_settings',
        valueType: 'number',
        isPrivate: false,
        isCoreSetting: true
      });
      await newSetting.save();
      invoiceNumber = 1;
    }
    console.log('🔢 Número de factura generado:', invoiceNumber);
    
    // Preparar datos de la factura
    const invoiceData = {
      client: order.customer._id,
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      items: items,
      taxRate: taxRate,
      subTotal: subTotal,
      taxTotal: taxTotal,
      total: total,
      discount: discountAmount,
      paymentStatus: 'unpaid',
      createdBy: req.admin?._id || order.createdBy,
      number: invoiceNumber,
      year: new Date().getFullYear(),
      // No usamos converted ya que el modelo no soporta 'order'
      content: order.note || `Factura generada desde la orden ${order.orderNumber || order._id}`
    };

    // Crear la factura
    console.log('💾 Datos de la factura:', JSON.stringify(invoiceData, null, 2));
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Generar PDF
    const fileId = 'invoice-' + invoice._id + '.pdf';
    await Invoice.findByIdAndUpdate(invoice._id, { pdf: fileId });

    // Actualizar el estado de la orden a "facturado" si es necesario
    // order.status = 'invoiced';
    // await order.save();

    res.status(201).json({
      success: true,
      result: invoice,
      message: 'Factura creada exitosamente desde la orden'
    });

  } catch (error) {
    console.error('Error creando factura desde orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = createInvoiceFromOrder;
