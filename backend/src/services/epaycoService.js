const axios = require('axios');
const crypto = require('crypto');

class EpaycoService {
  constructor() {
    this.publicKey = process.env.EPAYCO_PUBLIC_KEY;
    this.privateKey = process.env.EPAYCO_PRIVATE_KEY;
    this.customerId = process.env.EPAYCO_P_CUST_ID_CLIENTE;
    this.pKey = process.env.EPAYCO_P_KEY;
    this.testMode = process.env.EPAYCO_TEST === 'true';
    this.language = process.env.EPAYCO_LANG || 'ES';
    
    this.baseUrl = this.testMode 
      ? 'https://sandboxpruebamv.epayco.me' 
      : 'https://secure.epayco.co/validation/v1/validate';
    
    this.isConfigured = !!(this.publicKey && this.privateKey && this.customerId && this.pKey);
  }

  // Generar firma para autenticación
  generateSignature(data) {
    const signature = crypto
      .createHash('md5')
      .update(this.pKey + '^' + this.privateKey + '^' + data.reference + '^' + data.amount + '^' + data.currency)
      .digest('hex');
    
    return signature;
  }

  // Crear sesión de pago
  async createPaymentSession(invoice, client) {
    if (!this.isConfigured) {
      throw new Error('ePayco no está configurado. Verifica las variables de entorno');
    }

    const paymentData = {
      p_cust_id_cliente: this.customerId,
      p_key: this.pKey,
      p_id_invoice: invoice._id.toString(),
      p_description: `Factura #${invoice.number}/${invoice.year}`,
      p_amount: invoice.total,
      p_amount_base: invoice.subTotal,
      p_tax: invoice.taxTotal || 0,
      p_currency_code: invoice.currency || 'COP',
      p_signature: this.generateSignature({
        reference: invoice._id.toString(),
        amount: invoice.total,
        currency: invoice.currency || 'COP'
      }),
      p_test_request: this.testMode,
      p_customer_email: client.email,
      p_customer_name: client.name,
      p_customer_phone: client.phone || '',
      p_customer_doc_type: 'CC',
      p_customer_doc_number: client.documentNumber || '12345678',
      p_url_response: `${process.env.BACKEND_URL}/api/payment/epayco/response`,
      p_url_confirmation: `${process.env.BACKEND_URL}/api/payment/epayco/webhook`,
      p_method: 'GET',
      p_extra1: invoice.number.toString(),
      p_extra2: invoice.year.toString(),
      p_extra3: 'ERP_CRM'
    };

    try {
      // Para ePayco, creamos un formulario HTML que se envía a su plataforma
      const formHtml = this.generatePaymentForm(paymentData);
      
      return {
        success: true,
        formHtml: formHtml,
        paymentData: paymentData,
        redirectUrl: this.baseUrl
      };
    } catch (error) {
      console.error('Error creando sesión de pago en ePayco:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generar formulario HTML para ePayco
  generatePaymentForm(paymentData) {
    const formFields = Object.entries(paymentData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('');

    return `
      <form id="epayco-form" action="${this.baseUrl}" method="POST" target="_blank">
        ${formFields}
        <button type="submit" class="epayco-btn">
          💳 Pagar con ePayco
        </button>
      </form>
    `;
  }

  // Crear enlace de pago directo
  async createDirectPaymentLink(invoice, client, paymentMethod = 'card') {
    if (!this.isConfigured) {
      throw new Error('ePayco no está configurado');
    }

    const paymentData = {
      p_cust_id_cliente: this.customerId,
      p_key: this.pKey,
      p_id_invoice: invoice._id.toString(),
      p_description: `Factura #${invoice.number}/${invoice.year}`,
      p_amount: invoice.total,
      p_amount_base: invoice.subTotal,
      p_tax: invoice.taxTotal || 0,
      p_currency_code: invoice.currency || 'COP',
      p_signature: this.generateSignature({
        reference: invoice._id.toString(),
        amount: invoice.total,
        currency: invoice.currency || 'COP'
      }),
      p_test_request: this.testMode,
      p_customer_email: client.email,
      p_customer_name: client.name,
      p_customer_phone: client.phone || '',
      p_customer_doc_type: 'CC',
      p_customer_doc_number: client.documentNumber || '12345678',
      p_url_response: `${process.env.BACKEND_URL}/api/payment/epayco/response`,
      p_url_confirmation: `${process.env.BACKEND_URL}/api/payment/epayco/webhook`,
      p_method: 'GET',
      p_extra1: invoice.number.toString(),
      p_extra2: invoice.year.toString(),
      p_extra3: 'ERP_CRM'
    };

    // Para modo sandbox, usar sandboxpruebamv.epayco.me
    if (this.testMode) {
      const queryParams = new URLSearchParams(paymentData).toString();
      const paymentUrl = `${this.baseUrl}?${queryParams}`;
      
      console.log('🔍 ePayco URL generada:', paymentUrl);
      console.log('🔍 Base URL usada:', this.baseUrl);
      console.log('🔍 Test Mode:', this.testMode);
      
      return {
        success: true,
        paymentUrl: paymentUrl,
        data: paymentData
      };
    } else {
      // Para producción, usar la URL de validación
      const queryParams = new URLSearchParams(paymentData).toString();
      const paymentUrl = `https://secure.epayco.co/validation/v1/validate?${queryParams}`;
      
      return {
        success: true,
        paymentUrl: paymentUrl,
        data: paymentData
      };
    }
  }

  // Verificar estado de pago
  async checkPaymentStatus(reference) {
    if (!this.isConfigured) {
      throw new Error('ePayco no está configurado');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/transaction/response.json`, {
        params: {
          ref_payco: reference,
          public_key: this.publicKey
        }
      });

      return {
        success: true,
        status: response.data.data.x_response,
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

  // Procesar webhook de ePayco
  processWebhook(webhookData) {
    if (!this.isConfigured) {
      throw new Error('ePayco no está configurado');
    }

    // Verificar firma del webhook
    const expectedSignature = this.generateSignature({
      reference: webhookData.x_id_invoice,
      amount: webhookData.x_amount,
      currency: webhookData.x_currency_code
    });

    if (webhookData.x_signature !== expectedSignature) {
      throw new Error('Firma del webhook inválida');
    }

    return {
      success: true,
      orderId: webhookData.x_id_invoice,
      status: webhookData.x_response,
      amount: webhookData.x_amount,
      transactionId: webhookData.x_transaction_id,
      currency: webhookData.x_currency_code,
      data: webhookData
    };
  }

  // Obtener métodos de pago disponibles
  getPaymentMethods() {
    return {
      success: true,
      methods: [
        { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳' },
        { id: 'pse', name: 'PSE (Pagos Seguros en Línea)', icon: '🏦' },
        { id: 'cash', name: 'Efectivo', icon: '💵' },
        { id: 'transfer', name: 'Transferencia Bancaria', icon: '🏛️' }
      ]
    };
  }
}

module.exports = new EpaycoService();
