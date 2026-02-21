const axios = require('axios');
const crypto = require('crypto');

class EpayService {
  constructor() {
    this.apiKey = process.env.EPAY_API_KEY;
    this.secretKey = process.env.EPAY_SECRET_KEY;
    this.baseUrl = process.env.EPAY_BASE_URL || 'https://api.epay.co';
    this.isConfigured = !!(this.apiKey && this.secretKey);
  }

  // Generar firma para autenticación
  generateSignature(data) {
    const sortedData = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(sortedData)
      .digest('hex');
  }

  // Crear sesión de pago
  async createPaymentSession(invoice, client) {
    if (!this.isConfigured) {
      throw new Error('ePay.co no está configurado. Verifica EPAY_API_KEY y EPAY_SECRET_KEY');
    }

    const paymentData = {
      amount: invoice.total,
      currency: invoice.currency || 'USD',
      order_id: invoice._id.toString(),
      customer_email: client.email,
      customer_name: client.name,
      description: `Factura #${invoice.number}/${invoice.year}`,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      webhook_url: `${process.env.BACKEND_URL}/api/payment/epay/webhook`,
      timestamp: Date.now()
    };

    paymentData.signature = this.generateSignature(paymentData);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/payments/create`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        paymentUrl: response.data.payment_url,
        sessionId: response.data.session_id,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando sesión de pago en ePay.co:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Verificar estado de pago
  async checkPaymentStatus(sessionId) {
    if (!this.isConfigured) {
      throw new Error('ePay.co no está configurado');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/v1/payments/${sessionId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('Error verificando estado de pago:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Procesar webhook de ePay.co
  processWebhook(webhookData, signature) {
    if (!this.isConfigured) {
      throw new Error('ePay.co no está configurado');
    }

    // Verificar firma del webhook
    const calculatedSignature = this.generateSignature(webhookData);
    if (calculatedSignature !== signature) {
      throw new Error('Firma del webhook inválida');
    }

    return {
      success: true,
      orderId: webhookData.order_id,
      status: webhookData.status,
      amount: webhookData.amount,
      transactionId: webhookData.transaction_id,
      data: webhookData
    };
  }

  // Obtener métodos de pago disponibles
  async getPaymentMethods() {
    if (!this.isConfigured) {
      throw new Error('ePay.co no está configurado');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/v1/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        methods: response.data.methods || []
      };
    } catch (error) {
      console.error('Error obteniendo métodos de pago:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Crear enlace de pago directo
  async createDirectPaymentLink(invoice, client, paymentMethod = 'card') {
    if (!this.isConfigured) {
      throw new Error('ePay.co no está configurado');
    }

    const paymentData = {
      amount: invoice.total,
      currency: invoice.currency || 'USD',
      order_id: invoice._id.toString(),
      customer_email: client.email,
      customer_name: client.name,
      description: `Factura #${invoice.number}/${invoice.year}`,
      payment_method: paymentMethod,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      webhook_url: `${process.env.BACKEND_URL}/api/payment/epay/webhook`,
      timestamp: Date.now()
    };

    paymentData.signature = this.generateSignature(paymentData);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/payments/direct-link`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        paymentUrl: response.data.payment_url,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando enlace de pago directo:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new EpayService();
