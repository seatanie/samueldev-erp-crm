const mongoose = require('mongoose');
const epayService = require('@/services/epayService');
const { calculate } = require('@/helpers');

const Invoice = mongoose.model('Invoice');
const Payment = mongoose.model('Payment');
const Client = mongoose.model('Client');

// Crear sesión de pago en ePay.co
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

    // Crear sesión de pago en ePay.co
    const paymentResult = await epayService.createPaymentSession(invoice, invoice.client);

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
        'epay.sessionId': paymentResult.sessionId,
        'epay.paymentUrl': paymentResult.paymentUrl,
        'epay.paymentMethod': paymentMethod || 'card',
        'epay.createdAt': new Date()
      }
    });

    return res.status(200).json({
      success: true,
      result: {
        paymentUrl: paymentResult.paymentUrl,
        sessionId: paymentResult.sessionId,
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

// Webhook para recibir notificaciones de ePay.co
const webhook = async (req, res) => {
  try {
    const { signature } = req.headers;
    const webhookData = req.body;

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Firma del webhook no proporcionada',
      });
    }

    // Procesar webhook
    const webhookResult = epayService.processWebhook(webhookData, signature);

    if (!webhookResult.success) {
      return res.status(400).json({
        success: false,
        message: webhookResult.error,
      });
    }

    const { orderId, status, amount, transactionId } = webhookResult;

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
    if (status === 'completed' || status === 'paid') {
      // Crear registro de pago
      const paymentData = {
        number: await generatePaymentNumber(),
        client: invoice.client,
        invoice: invoice._id,
        date: new Date(),
        amount: amount,
        currency: invoice.currency,
        paymentMode: await getEpayPaymentMode(),
        ref: transactionId,
        description: `Pago en línea via ePay.co - Transacción: ${transactionId}`,
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
          'epay.status': status,
          'epay.transactionId': transactionId,
          'epay.completedAt': new Date()
        }
      });

      console.log(`✅ Pago procesado exitosamente para factura ${orderId}: ${amount} ${invoice.currency}`);
    } else if (status === 'failed' || status === 'cancelled') {
      // Actualizar estado de la factura
      await Invoice.findByIdAndUpdate(orderId, {
        $set: { 
          'epay.status': status,
          'epay.failedAt': new Date()
        }
      });

      console.log(`❌ Pago falló para factura ${orderId}: ${status}`);
    }

    // Responder a ePay.co
    res.status(200).json({ success: true, message: 'Webhook procesado' });

  } catch (error) {
    console.error('Error procesando webhook de ePay.co:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Verificar estado de pago
const checkPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'ID de sesión es requerido',
      });
    }

    const statusResult = await epayService.checkPaymentStatus(sessionId);

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
    const methodsResult = await epayService.getPaymentMethods();

    if (!methodsResult.success) {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Error obteniendo métodos de pago',
        error: methodsResult.error,
      });
    }

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
    const paymentResult = await epayService.createDirectPaymentLink(
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

const getEpayPaymentMode = async () => {
  // Buscar o crear modo de pago para ePay.co
  const PaymentMode = mongoose.model('PaymentMode');
  let epayMode = await PaymentMode.findOne({ name: 'ePay.co' });
  
  if (!epayMode) {
    epayMode = await PaymentMode.create({
      name: 'ePay.co',
      description: 'Pago en línea via ePay.co',
      isActive: true
    });
  }
  
  return epayMode._id;
};

module.exports = {
  createPaymentSession,
  webhook,
  checkPaymentStatus,
  getPaymentMethods,
  createDirectPaymentLink
};
