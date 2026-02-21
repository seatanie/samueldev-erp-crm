const Invoice = require('@/models/appModels/Invoice');
const Client = require('@/models/appModels/Client');
const Setting = require('@/models/coreModels/Setting');
const factusService = require('@/services/factusService');
const { calculate } = require('@/helpers');

// Crear factura en FACTUS (Paso 1)
const createFactusInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.body;

    // Buscar la factura
    const invoice = await Invoice.findById(id)
      .populate('client')
      .populate('createdBy');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Verificar si ya fue creada en FACTUS
    if (invoice.factus?.factusId && !force) {
      return res.status(400).json({
        success: false,
        message: 'Esta factura ya fue creada en FACTUS',
        factusId: invoice.factus.factusId,
        status: invoice.factus.status
      });
    }

    // Obtener configuración de la empresa
    const companySettings = await getCompanySettings();
    
    // Preparar datos de la factura para FACTUS
    const invoiceData = {
      ...invoice.toObject(),
      company: companySettings
    };

    // Crear factura en FACTUS
    const result = await factusService.createElectronicInvoice(invoiceData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Error creando factura en FACTUS',
        error: result.error,
        details: result.details
      });
    }

    // Actualizar la factura con los datos de FACTUS
    const updateData = {
      'factus.factusId': result.factusId,
      'factus.status': 'created',
      'factus.createdAt': new Date()
    };

    await Invoice.findByIdAndUpdate(id, updateData);

    res.json({
      success: true,
      message: 'Factura creada exitosamente en FACTUS',
      result: {
        factusId: result.factusId,
        numeroFactura: result.numeroFactura,
        status: result.status
      }
    });

  } catch (error) {
    console.error('Error creando factura en FACTUS:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Validar factura en FACTUS (Paso 2)
const validateFactusInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (!invoice.factus?.factusId) {
      return res.status(400).json({
        success: false,
        message: 'Esta factura no ha sido creada en FACTUS'
      });
    }

    const result = await factusService.validateInvoice(invoice.factus.factusId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Error validando factura en FACTUS',
        error: result.error,
        details: result.details
      });
    }

    // Actualizar estado en la base de datos
    await Invoice.findByIdAndUpdate(id, {
      'factus.status': 'validated',
      'factus.validatedAt': new Date(),
      'factus.validationResult': result.validationResult
    });

    res.json({
      success: true,
      message: 'Factura validada exitosamente en FACTUS',
      result: {
        status: result.status,
        validationResult: result.validationResult
      }
    });

  } catch (error) {
    console.error('Error validando factura en FACTUS:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estado de factura en FACTUS
const getFactusStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (!invoice.factus?.factusId) {
      return res.status(400).json({
        success: false,
        message: 'Esta factura no ha sido enviada a FACTUS'
      });
    }

    const result = await factusService.getInvoiceStatus(invoice.factus.factusId);

    if (result.success) {
      // Actualizar estado en la base de datos
      await Invoice.findByIdAndUpdate(id, {
        'factus.status': result.status,
        'factus.pdfUrl': result.pdfUrl,
        'factus.xmlUrl': result.xmlUrl
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Estado obtenido exitosamente' : 'Error obteniendo estado',
      result: result
    });

  } catch (error) {
    console.error('Error obteniendo estado de FACTUS:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Descargar PDF de FACTUS
const downloadFactusPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (!invoice.factus?.factusId) {
      return res.status(400).json({
        success: false,
        message: 'Esta factura no ha sido enviada a FACTUS'
      });
    }

    const result = await factusService.downloadInvoicePDF(invoice.factus.factusId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Error descargando PDF de FACTUS',
        error: result.error
      });
    }

    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="factura-${invoice.number}-${invoice.year}.pdf"`
    });

    res.send(result.pdfBuffer);

  } catch (error) {
    console.error('Error descargando PDF de FACTUS:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Descargar XML de FACTUS
const downloadFactusXML = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (!invoice.factus?.factusId) {
      return res.status(400).json({
        success: false,
        message: 'Esta factura no ha sido enviada a FACTUS'
      });
    }

    const result = await factusService.downloadInvoiceXML(invoice.factus.factusId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Error descargando XML de FACTUS',
        error: result.error
      });
    }

    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="factura-${invoice.number}-${invoice.year}.xml"`
    });

    res.send(result.xmlBuffer);

  } catch (error) {
    console.error('Error descargando XML de FACTUS:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Anular factura en FACTUS
const cancelFactusInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (!invoice.factus?.factusId) {
      return res.status(400).json({
        success: false,
        message: 'Esta factura no ha sido enviada a FACTUS'
      });
    }

    const result = await factusService.cancelInvoice(invoice.factus.factusId, reason);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Error anulando factura en FACTUS',
        error: result.error
      });
    }

    // Actualizar estado en la base de datos
    await Invoice.findByIdAndUpdate(id, {
      'factus.status': 'cancelled',
      'factus.cancellationId': result.cancellationId,
      'factus.cancelledAt': new Date(),
      'factus.cancellationReason': reason
    });

    res.json({
      success: true,
      message: 'Factura anulada exitosamente en FACTUS',
      result: {
        cancellationId: result.cancellationId,
        status: result.status
      }
    });

  } catch (error) {
    console.error('Error anulando factura en FACTUS:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener rangos de numeración de FACTUS
const getNumberingRanges = async (req, res) => {
  try {
    const result = await factusService.getNumberingRanges();

    res.json({
      success: result.success,
      message: result.success ? 'Rangos obtenidos exitosamente' : 'Error obteniendo rangos',
      result: result
    });

  } catch (error) {
    console.error('Error obteniendo rangos de FACTUS:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Validar configuración de FACTUS
const validateFactusConfig = async (req, res) => {
  try {
    const result = await factusService.validateConfiguration();

    res.json({
      success: result.success,
      message: result.success ? 'Configuración de FACTUS válida' : 'Error en configuración de FACTUS',
      result: result
    });

  } catch (error) {
    console.error('Error validando configuración de FACTUS:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener configuración de la empresa
const getCompanySettings = async () => {
  const settings = await Setting.find({
    settingKey: {
      $in: [
        'company_name',
        'company_email',
        'company_phone',
        'company_address',
        'company_city',
        'company_department',
        'company_postal_code',
        'company_nit',
        'company_regime',
        'company_trade_name'
      ]
    }
  });

  const companySettings = {};
  settings.forEach(setting => {
    companySettings[setting.settingKey.replace('company_', '')] = setting.settingValue;
  });

  return {
    documentType: 'NIT',
    documentNumber: companySettings.nit || '',
    businessName: companySettings.name || '',
    tradeName: companySettings.trade_name || companySettings.name || '',
    address: {
      street: companySettings.address || '',
      city: companySettings.city || '',
      department: companySettings.department || '',
      country: 'Colombia',
      postalCode: companySettings.postal_code || ''
    },
    phone: companySettings.phone || '',
    email: companySettings.email || '',
    regime: companySettings.regime || 'Responsable de IVA'
  };
};

// Obtener municipios
const getMunicipios = async (req, res) => {
  try {
    const result = await factusService.getMunicipios();

    res.json({
      success: result.success,
      message: result.success ? 'Municipios obtenidos exitosamente' : 'Error obteniendo municipios',
      result: result
    });

  } catch (error) {
    console.error('Error obteniendo municipios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener países
const getPaises = async (req, res) => {
  try {
    const result = await factusService.getPaises();

    res.json({
      success: result.success,
      message: result.success ? 'Países obtenidos exitosamente' : 'Error obteniendo países',
      result: result
    });

  } catch (error) {
    console.error('Error obteniendo países:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener tributos
const getTributos = async (req, res) => {
  try {
    const result = await factusService.getTributos();

    res.json({
      success: result.success,
      message: result.success ? 'Tributos obtenidos exitosamente' : 'Error obteniendo tributos',
      result: result
    });

  } catch (error) {
    console.error('Error obteniendo tributos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener unidades de medida
const getUnidadesMedida = async (req, res) => {
  try {
    const result = await factusService.getUnidadesMedida();

    res.json({
      success: result.success,
      message: result.success ? 'Unidades de medida obtenidas exitosamente' : 'Error obteniendo unidades de medida',
      result: result
    });

  } catch (error) {
    console.error('Error obteniendo unidades de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  createFactusInvoice,
  validateFactusInvoice,
  getFactusStatus,
  downloadFactusPDF,
  downloadFactusXML,
  cancelFactusInvoice,
  getNumberingRanges,
  validateFactusConfig,
  getMunicipios,
  getPaises,
  getTributos,
  getUnidadesMedida
};
