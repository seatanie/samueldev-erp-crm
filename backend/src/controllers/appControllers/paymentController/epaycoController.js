const mongoose = require('mongoose');
const epaycoService = require('@/services/epaycoService');
const { calculate } = require('@/helpers');

const Invoice = mongoose.model('Invoice');
const Payment = mongoose.model('Payment');
const Client = mongoose.model('Client');

// Crear sesión de pago en ePayco
const createPaymentSession = async (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'ID de factura es requerido',
      });
    }

    // Buscar la factura y el cliente
    const invoice = await Invoice.findById(invoiceId)
      .populate('client')
      .exec();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Factura no encontrada',
      });
    }

    if (!invoice.client) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'La factura debe tener un cliente asociado',
      });
    }

    // Verificar que la factura no esté pagada
    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Esta factura ya está pagada',
      });
    }

    // Crear sesión de pago en ePayco
    const paymentResult = await epaycoService.createPaymentSession(invoice, invoice.client);

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Error creando sesión de pago',
        error: paymentResult.error,
      });
    }

    // Guardar información de la sesión de pago
    await Invoice.findByIdAndUpdate(invoiceId, {
      $set: {
        'epayco.sessionData': paymentResult.paymentData,
        'epayco.paymentMethod': paymentMethod || 'card',
        'epayco.createdAt': new Date()
      }
    });

    return res.status(200).json({
      success: true,
      result: {
        formHtml: paymentResult.formHtml,
        redirectUrl: paymentResult.redirectUrl,
        invoiceId: invoiceId
      },
      message: 'Sesión de pago creada exitosamente',
    });

  } catch (error) {
    console.error('Error en createPaymentSession:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Webhook para recibir notificaciones de ePayco
const webhook = async (req, res) => {
  try {
    const webhookData = req.body;

    // Procesar webhook
    const webhookResult = epaycoService.processWebhook(webhookData);

    if (!webhookResult.success) {
      return res.status(400).json({
        success: false,
        message: webhookResult.error,
      });
    }

    const { orderId, status, amount, transactionId, currency } = webhookResult;

    // Buscar la factura
    const invoice = await Invoice.findById(orderId);
    if (!invoice) {
      console.error('Factura no encontrada para el webhook:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    // Procesar según el estado del pago
    if (status === 'Aceptada' || status === 'Aceptada') {
      // Crear registro de pago
      const paymentData = {
        number: await generatePaymentNumber(),
        client: invoice.client,
        invoice: invoice._id,
        date: new Date(),
        amount: amount,
        currency: currency || invoice.currency,
        paymentMode: await getEpaycoPaymentMode(),
        ref: transactionId,
        description: `Pago en línea via ePayco - Transacción: ${transactionId}`,
        createdBy: invoice.createdBy || 'system'
      };

      const payment = await Payment.create(paymentData);

      // Actualizar factura
      const newCredit = calculate.add(invoice.credit || 0, amount);
      let paymentStatus = 'unpaid';
      
      if (newCredit >= calculate.sub(invoice.total, invoice.discount || 0)) {
        paymentStatus = 'paid';
      } else if (newCredit > 0) {
        paymentStatus = 'partially';
      }

      await Invoice.findByIdAndUpdate(orderId, {
        $push: { payment: payment._id },
        $inc: { credit: amount },
        $set: { 
          paymentStatus: paymentStatus,
          'epayco.status': status,
          'epayco.transactionId': transactionId,
          'epayco.completedAt': new Date()
        }
      });

      console.log(`✅ Pago procesado exitosamente para factura ${orderId}: ${amount} ${currency}`);
    } else if (status === 'Rechazada' || status === 'Fallida') {
      // Actualizar estado de la factura
      await Invoice.findByIdAndUpdate(orderId, {
        $set: { 
          'epayco.status': status,
          'epayco.failedAt': new Date()
        }
      });

      console.log(`❌ Pago falló para factura ${orderId}: ${status}`);
    }

    // Responder a ePayco
    res.status(200).json({ success: true, message: 'Webhook procesado' });

  } catch (error) {
    console.error('Error procesando webhook de ePayco:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Respuesta del pago (redirección del cliente)
const paymentResponse = async (req, res) => {
  try {
    const { x_id_invoice, x_response, x_amount, x_currency_code, x_transaction_id } = req.query;

    if (!x_id_invoice) {
      return res.status(400).json({
        success: false,
        message: 'ID de factura no proporcionado',
      });
    }

    // Buscar la factura
    const invoice = await Invoice.findById(x_id_invoice);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    // Redirigir al frontend con el resultado
    const redirectUrl = `${process.env.APP_URL}/payment/result?` + 
      `invoiceId=${x_id_invoice}&` +
      `status=${x_response}&` +
      `amount=${x_amount}&` +
      `currency=${x_currency_code}&` +
      `transactionId=${x_transaction_id}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Error en paymentResponse:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Verificar estado de pago
const checkPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Referencia de pago es requerida',
      });
    }

    const statusResult = await epaycoService.checkPaymentStatus(reference);

    if (!statusResult.success) {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Error verificando estado de pago',
        error: statusResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      result: statusResult.data,
      message: 'Estado de pago obtenido exitosamente',
    });

  } catch (error) {
    console.error('Error en checkPaymentStatus:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Obtener métodos de pago disponibles
const getPaymentMethods = async (req, res) => {
  try {
    const methodsResult = epaycoService.getPaymentMethods();

    return res.status(200).json({
      success: true,
      result: methodsResult.methods,
      message: 'Métodos de pago obtenidos exitosamente',
    });

  } catch (error) {
    console.error('Error en getPaymentMethods:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Crear enlace de pago directo
const createDirectPaymentLink = async (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'ID de factura es requerido',
      });
    }

    // Buscar la factura y el cliente
    const invoice = await Invoice.findById(invoiceId)
      .populate('client')
      .exec();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Factura no encontrada',
      });
    }

    if (!invoice.client) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'La factura debe tener un cliente asociado',
      });
    }

    // Crear enlace de pago directo
    const paymentResult = await epaycoService.createDirectPaymentLink(
      invoice, 
      invoice.client, 
      paymentMethod || 'card'
    );

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Error creando enlace de pago',
        error: paymentResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      result: {
        paymentUrl: paymentResult.paymentUrl,
        invoiceId: invoiceId
      },
      message: 'Enlace de pago creado exitosamente',
    });

  } catch (error) {
    console.error('Error en createDirectPaymentLink:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Funciones auxiliares
const generatePaymentNumber = async () => {
  const lastPayment = await Payment.findOne({}, {}, { sort: { 'number': -1 } });
  return lastPayment ? lastPayment.number + 1 : 1;
};

const getEpaycoPaymentMode = async () => {
  // Buscar o crear modo de pago para ePayco
  const PaymentMode = mongoose.model('PaymentMode');
  let epaycoMode = await PaymentMode.findOne({ name: 'ePayco' });
  
  if (!epaycoMode) {
    epaycoMode = await PaymentMode.create({
      name: 'ePayco',
      description: 'Pago en línea via ePayco',
      isActive: true
    });
  }
  
  return epaycoMode._id;
};

module.exports = {
  createPaymentSession,
  webhook,
  paymentResponse,
  checkPaymentStatus,
  getPaymentMethods,
  createDirectPaymentLink
};
