const mongoose = require('mongoose');
const FactusService = require('@/services/factusService');

const Model = mongoose.model('Invoice');

const downloadFactusPDF = async (req, res) => {
  try {
    // Buscar la factura
    const invoice = await Model.findOne({
      _id: req.params.id,
      removed: false,
    }).exec();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Factura no encontrada',
      });
    }

    // Verificar si tiene factusId
    if (!invoice.factus || !invoice.factus.factusId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Esta factura no fue procesada por FACTUS',
      });
    }

    console.log('📄 Descargando PDF de FACTUS para factura:', invoice._id);
    console.log('🆔 FACTUS ID:', invoice.factus.factusId);
    
    const factus = new FactusService();
    const pdfResult = await factus.downloadInvoicePDF(invoice.factus.factusId);
    
    if (!pdfResult.success) {
      console.error('❌ Error descargando PDF:', pdfResult.error);
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Error descargando PDF de FACTUS',
        error: pdfResult.error,
        details: pdfResult.details
      });
    }

    console.log('✅ PDF descargado exitosamente');
    console.log(`📊 Tamaño: ${pdfResult.pdfBuffer.length} bytes`);
    console.log(`📋 Tipo: ${pdfResult.contentType}`);
    
    if (pdfResult.sandbox) {
      console.log('⚠️ Modo sandbox - PDF simulado');
    }

    // Configurar headers para descarga
    const filename = `factura-${invoice.number}-${invoice.year}.pdf`;
    
    res.setHeader('Content-Type', pdfResult.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfResult.pdfBuffer.length);
    
    // Enviar el PDF
    res.send(pdfResult.pdfBuffer);

  } catch (error) {
    console.error('❌ Error en downloadFactusPDF:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = downloadFactusPDF;








