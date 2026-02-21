const axios = require('axios');
const crypto = require('crypto');

class FactusService {
  constructor() {
    this.baseUrl = process.env.FACTUS_BASE_URL || 'https://api-sandbox.factus.com.co';
    this.clientId = process.env.FACTUS_CLIENT_ID;
    this.clientSecret = process.env.FACTUS_CLIENT_SECRET;
    this.username = process.env.FACTUS_USERNAME;
    this.password = process.env.FACTUS_PASSWORD;
    
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.isConfigured = !!(this.clientId && this.clientSecret && this.username && this.password);
    
    if (!this.isConfigured) {
      console.warn('⚠️ FACTUS no está configurado. Verifica las variables de entorno:');
      console.warn('   - FACTUS_CLIENT_ID');
      console.warn('   - FACTUS_CLIENT_SECRET');
      console.warn('   - FACTUS_USERNAME');
      console.warn('   - FACTUS_PASSWORD');
    }
  }

  // Autenticación OAuth2 con FACTUS
  async authenticate() {
    if (!this.isConfigured) {
      throw new Error('FACTUS no está configurado. Verifica las variables de entorno');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'password',
        username: this.username,
        password: this.password,
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return {
        success: true,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      console.error('Error autenticando con FACTUS:', error.response?.data || error.message);
      throw new Error(`Error de autenticación FACTUS: ${error.response?.data?.message || error.message}`);
    }
  }

  // Probar conexión básica
  async testConnection() {
    try {
      await this.ensureAuthenticated();
      
      // Hacer una petición simple para verificar la conexión
      const response = await axios.get(`${this.baseUrl}/test`, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: 'Conexión exitosa con FACTUS',
        data: response.data
      };
    } catch (error) {
      // Si no hay endpoint /test, intentar con un endpoint que sabemos que existe
      try {
        const response = await axios.get(`${this.baseUrl}/empresas`, {
          headers: this.getAuthHeaders()
        });
        
        return {
          success: true,
          message: 'Conexión exitosa con FACTUS (verificada con endpoint empresas)',
          data: response.data
        };
      } catch (secondError) {
        return {
          success: false,
          message: 'Error de conexión con FACTUS',
          error: error.response?.data || error.message
        };
      }
    }
  }

  // Renovar token usando refresh_token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return {
        success: true,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      console.error('Error renovando token FACTUS:', error.response?.data || error.message);
      // Si falla el refresh, intentar autenticación completa
      return await this.authenticate();
    }
  }

  // Verificar si el token está válido
  async ensureAuthenticated() {
    if (!this.accessToken || (this.tokenExpiry && new Date() >= this.tokenExpiry)) {
      // Intentar renovar token primero, si falla hacer autenticación completa
      try {
        await this.refreshAccessToken();
      } catch (error) {
        await this.authenticate();
      }
    }
  }

  // Obtener headers de autenticación
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Crear factura electrónica (Paso 1: Crear factura)
  async createElectronicInvoice(invoiceData) {
    await this.ensureAuthenticated();

    // Si estamos en sandbox, simular la respuesta
    if (this.baseUrl.includes('sandbox')) {
      console.log('🔄 Simulando creación de factura en sandbox...');
      const factusInvoiceData = this.mapInvoiceToFactus(invoiceData);
      
      // Simular respuesta de FACTUS
      const simulatedResponse = {
        success: true,
        factusId: 'SANDBOX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        numeroFactura: factusInvoiceData.invoice.number,
        status: 'created',
        data: {
          id: 'SANDBOX-' + Date.now(),
          numero_factura: factusInvoiceData.invoice.number,
          status: 'created',
          cufe: 'SANDBOX-CUFE-' + Math.random().toString(36).substr(2, 15),
          pdf_url: null,
          xml_url: null,
          created_at: new Date().toISOString(),
          sandbox: true
        },
        warning: 'Esta es una simulación de sandbox. Para funcionalidad real, necesitas credenciales de producción.'
      };
      
      console.log('✅ Factura simulada creada:', simulatedResponse.factusId);
      return simulatedResponse;
    }

    try {
      const factusInvoiceData = this.mapInvoiceToFactus(invoiceData);
      
      const response = await axios.post(
        `${this.baseUrl}/facturas`,
        factusInvoiceData,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        factusId: response.data.id,
        numeroFactura: response.data.numero_factura,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando factura electrónica en FACTUS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  // Validar factura (Paso 2: Validar antes de enviar a DIAN)
  async validateInvoice(factusId) {
    await this.ensureAuthenticated();

    // Si estamos en sandbox, simular la validación
    if (this.baseUrl.includes('sandbox')) {
      console.log('🔄 Simulando validación de factura en sandbox...');
      
      const simulatedResponse = {
        success: true,
        status: 'validated',
        validationResult: {
          status: 'validated',
          validation_date: new Date().toISOString(),
          dian_response: 'SIMULATED',
          cufe: 'SANDBOX-CUFE-' + Math.random().toString(36).substr(2, 15),
          qr_code: 'SANDBOX-QR-' + Math.random().toString(36).substr(2, 20),
          sandbox: true
        },
        data: {
          status: 'validated',
          validation_date: new Date().toISOString(),
          dian_response: 'SIMULATED',
          cufe: 'SANDBOX-CUFE-' + Math.random().toString(36).substr(2, 15),
          qr_code: 'SANDBOX-QR-' + Math.random().toString(36).substr(2, 20),
          sandbox: true
        },
        warning: 'Esta es una simulación de sandbox. Para validación real, necesitas credenciales de producción.'
      };
      
      console.log('✅ Factura simulada validada:', factusId);
      return simulatedResponse;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/facturas/${factusId}/validar`,
        {}, // Body vacío según documentación
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        status: response.data.status,
        validationResult: response.data,
        data: response.data
      };
    } catch (error) {
      console.error('Error validando factura en FACTUS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  // Mapear datos de factura a formato FACTUS
  mapInvoiceToFactus(invoice) {
    const client = invoice.client;
    const company = invoice.company || {};

    return {
      // Información del emisor (empresa)
      issuer: {
        documentType: company.documentType || 'NIT',
        documentNumber: company.documentNumber || '',
        businessName: company.businessName || '',
        tradeName: company.tradeName || '',
        address: {
          street: company.address?.street || '',
          city: company.address?.city || '',
          department: company.address?.department || '',
          country: 'Colombia',
          postalCode: company.address?.postalCode || ''
        },
        phone: company.phone || '',
        email: company.email || '',
        regime: company.regime || 'Responsable de IVA'
      },

      // Información del cliente
      customer: {
        documentType: client.documentType || 'CC',
        documentNumber: client.documentNumber || '',
        businessName: client.name || '',
        tradeName: client.tradeName || client.name || '',
        address: {
          street: client.address?.street || '',
          city: client.address?.city || '',
          department: client.address?.department || '',
          country: 'Colombia',
          postalCode: client.address?.postalCode || ''
        },
        phone: client.phone || '',
        email: client.email || ''
      },

      // Información de la factura
      invoice: {
        number: invoice.number,
        series: invoice.series || 'A',
        date: new Date(invoice.date).toISOString(),
        dueDate: new Date(invoice.expiredDate).toISOString(),
        currency: invoice.currency || 'COP',
        exchangeRate: invoice.exchangeRate || 1,
        notes: invoice.notes || invoice.content || ''
      },

      // Items de la factura
      items: invoice.items.map(item => ({
        code: item.code || '',
        description: item.itemName,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount || 0,
        taxRate: item.taxRate || 0,
        total: item.total
      })),

      // Totales
      totals: {
        subtotal: invoice.subTotal,
        taxTotal: invoice.taxTotal,
        discountTotal: invoice.discount,
        total: invoice.total
      },

      // Información adicional
      additional: {
        paymentMethod: invoice.paymentMethod || 'Contado',
        paymentDueDate: new Date(invoice.expiredDate).toISOString(),
        deliveryDate: new Date(invoice.date).toISOString()
      }
    };
  }

  // Obtener estado de una factura
  async getInvoiceStatus(factusId) {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(
        `${this.baseUrl}/invoices/${factusId}`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        status: response.data.status,
        cufe: response.data.cufe,
        pdfUrl: response.data.pdf_url,
        xmlUrl: response.data.xml_url,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo estado de factura en FACTUS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Descargar PDF de factura
  async downloadInvoicePDF(factusId) {
    await this.ensureAuthenticated();

    // Si estamos en sandbox, generar PDF simulado
    if (this.baseUrl.includes('sandbox')) {
      console.log('🔄 Generando PDF simulado en sandbox...');
      
      try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        
        // Crear buffer para el PDF
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        
        return new Promise((resolve) => {
          doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve({
              success: true,
              pdfBuffer: pdfData,
              contentType: 'application/pdf',
              sandbox: true,
              factusId: factusId,
              warning: 'Este es un PDF simulado de sandbox. Para PDFs reales, necesitas credenciales de producción.'
            });
          });

          // Contenido del PDF simulado más profesional
          const currentDate = new Date();
          const cufe = 'SANDBOX-CUF-' + Math.random().toString(36).substr(2, 15);
          const qrCode = 'SANDBOX-QR-' + Math.random().toString(36).substr(2, 20);
          
          // Header
          doc.fontSize(24).text('FACTURA ELECTRÓNICA', 50, 50);
          doc.fontSize(16).text('SIMULADA - SANDBOX', 50, 80);
          
          // Información de la factura
          doc.fontSize(12).text(`Número: ${factusId}`, 50, 120);
          doc.text(`Fecha: ${currentDate.toLocaleDateString('es-CO')}`, 50, 140);
          doc.text(`CUF: ${cufe}`, 50, 160);
          
          // Línea separadora
          doc.moveTo(50, 190).lineTo(550, 190).stroke();
          
          // Información del emisor
          doc.fontSize(14).text('EMISOR', 50, 210);
          doc.fontSize(10).text('Empresa de Prueba S.A.S', 50, 230);
          doc.text('NIT: 900123456-1', 50, 250);
          doc.text('Dirección: Calle 123 #45-67', 50, 270);
          doc.text('Ciudad: Bogotá D.C.', 50, 290);
          doc.text('Teléfono: (601) 234-5678', 50, 310);
          
          // Información del cliente
          doc.fontSize(14).text('CLIENTE', 300, 210);
          doc.fontSize(10).text('Cliente de Prueba', 300, 230);
          doc.text('CC: 12345678', 300, 250);
          doc.text('Dirección: Cra 7 #24-89', 300, 270);
          doc.text('Ciudad: Bogotá D.C.', 300, 290);
          doc.text('Teléfono: 300-123-4567', 300, 310);
          
          // Línea separadora
          doc.moveTo(50, 340).lineTo(550, 340).stroke();
          
          // Detalles de productos
          doc.fontSize(14).text('DETALLES DE LA FACTURA', 50, 360);
          
          // Tabla de productos
          const tableTop = 380;
          const itemHeight = 20;
          
          // Headers de la tabla
          doc.fontSize(10).text('Código', 50, tableTop);
          doc.text('Descripción', 120, tableTop);
          doc.text('Cant.', 350, tableTop);
          doc.text('V. Unit.', 400, tableTop);
          doc.text('Total', 500, tableTop);
          
          // Línea bajo headers
          doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
          
          // Producto de ejemplo
          doc.text('PROD-001', 50, tableTop + 25);
          doc.text('Producto de Prueba', 120, tableTop + 25);
          doc.text('1', 350, tableTop + 25);
          doc.text('$100,000', 400, tableTop + 25);
          doc.text('$100,000', 500, tableTop + 25);
          
          // Totales
          const totalsTop = tableTop + 60;
          doc.moveTo(50, totalsTop).lineTo(550, totalsTop).stroke();
          
          doc.fontSize(12).text('Subtotal:', 400, totalsTop + 10);
          doc.text('$100,000', 500, totalsTop + 10);
          
          doc.text('IVA (19%):', 400, totalsTop + 30);
          doc.text('$19,000', 500, totalsTop + 30);
          
          doc.fontSize(14).text('TOTAL:', 400, totalsTop + 50);
          doc.text('$119,000', 500, totalsTop + 50);
          
          // Línea final
          doc.moveTo(50, totalsTop + 70).lineTo(550, totalsTop + 70).stroke();
          
          // Información de sandbox
          doc.fontSize(10).text('⚠️ ESTE ES UN PDF SIMULADO DE SANDBOX', 50, totalsTop + 90);
          doc.text('• No tiene validez fiscal', 50, totalsTop + 110);
          doc.text('• Solo para pruebas de integración', 50, totalsTop + 130);
          doc.text('• Para PDFs reales, usar credenciales de producción', 50, totalsTop + 150);
          
          // QR Code simulado
          doc.text(`QR Code: ${qrCode}`, 50, totalsTop + 180);
          
          doc.end();
        });
      } catch (error) {
        console.error('Error generando PDF simulado:', error);
        return {
          success: false,
          error: 'Error generando PDF simulado',
          details: error.message
        };
      }
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/invoices/${factusId}/pdf`,
        { 
          headers: this.getAuthHeaders(),
          responseType: 'arraybuffer'
        }
      );

      return {
        success: true,
        pdfBuffer: response.data,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      console.error('Error descargando PDF de FACTUS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Descargar XML de factura
  async downloadInvoiceXML(factusId) {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(
        `${this.baseUrl}/invoices/${factusId}/xml`,
        { 
          headers: this.getAuthHeaders(),
          responseType: 'arraybuffer'
        }
      );

      return {
        success: true,
        xmlBuffer: response.data,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      console.error('Error descargando XML de FACTUS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Anular factura
  async cancelInvoice(factusId, reason) {
    await this.ensureAuthenticated();

    try {
      const response = await axios.post(
        `${this.baseUrl}/invoices/${factusId}/cancel`,
        { reason: reason || 'Anulación solicitada por el cliente' },
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        cancellationId: response.data.cancellation_id,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('Error anulando factura en FACTUS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Obtener rangos de numeración disponibles
  async getNumberingRanges() {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(
        `${this.baseUrl}/rangos-numeracion`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        ranges: response.data
      };
    } catch (error) {
      console.error('Error obteniendo rangos de numeración:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Obtener municipios (datos maestros)
  async getMunicipios() {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(
        `${this.baseUrl}/municipios`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        municipios: response.data
      };
    } catch (error) {
      console.error('Error obteniendo municipios:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Obtener países (datos maestros)
  async getPaises() {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(
        `${this.baseUrl}/paises`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        paises: response.data
      };
    } catch (error) {
      console.error('Error obteniendo países:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Obtener tributos (datos maestros)
  async getTributos() {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(
        `${this.baseUrl}/tributos`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        tributos: response.data
      };
    } catch (error) {
      console.error('Error obteniendo tributos:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Obtener unidades de medida (datos maestros)
  async getUnidadesMedida() {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(
        `${this.baseUrl}/unidades-medida`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        unidades: response.data
      };
    } catch (error) {
      console.error('Error obteniendo unidades de medida:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Validar configuración
  async validateConfiguration() {
    try {
      await this.authenticate();
      
      // En sandbox, solo verificamos autenticación
      if (this.baseUrl.includes('sandbox')) {
        return {
          success: true,
          authenticated: true,
          rangesAvailable: false,
          message: 'Configuración de FACTUS sandbox válida (solo autenticación)',
          warning: 'El sandbox no tiene acceso completo a los endpoints. Necesitas credenciales de producción para funcionalidad completa.'
        };
      }
      
      const ranges = await this.getNumberingRanges();
      
      return {
        success: true,
        authenticated: true,
        rangesAvailable: ranges.success,
        message: 'Configuración de FACTUS válida'
      };
    } catch (error) {
      return {
        success: false,
        authenticated: false,
        error: error.message
      };
    }
  }
}

module.exports = FactusService;
