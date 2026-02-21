const mongoose = require('mongoose');
const FactusService = require('@/services/factusService');

const Model = mongoose.model('Invoice');

const downloadPDF = async (req, res) => {
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

    // Si tiene factusId, procesar con FACTUS
    if (invoice.factus && invoice.factus.factusId) {
      try {
        console.log('🔍 Procesando PDF con FACTUS para factura:', invoice._id);
        console.log('📄 PDF existente:', invoice.pdf);
        
        const factus = new FactusService();
        const pdfResult = await factus.downloadInvoicePDF(invoice.factus.factusId);
        
        console.log('📊 Resultado de FACTUS:', JSON.stringify(pdfResult, null, 2));
        
        if (pdfResult.success) {
          // Si es sandbox, usar PDF existente
          if (pdfResult.data.sandbox) {
            // En sandbox, usar el PDF local de la factura si existe, o uno de ejemplo
            let pdfFileName = invoice.pdf; // Usar PDF local si existe
            
            if (!pdfFileName) {
              // Si no hay PDF local, usar uno de ejemplo
              pdfFileName = 'invoice-68c42e3e3c6e90fe91394db2.pdf';
              console.log('⚠️ No hay PDF local, usando PDF de ejemplo en sandbox');
            }
            
            console.log('✅ Enviando PDF en sandbox:', `/download/invoice/${pdfFileName}`);
            return res.status(200).json({
              success: true,
              result: {
                pdfUrl: `/download/invoice/${pdfFileName}`,
                factusId: invoice.factus.factusId,
                status: invoice.factus.status,
                sandbox: true,
                warning: pdfResult.warning || 'Modo sandbox - usando PDF local'
              },
              message: 'PDF descargado exitosamente (sandbox)',
            });
          }
          
          // Si no es sandbox, usar PDF de FACTUS
          if (pdfResult.data.pdfUrl) {
            console.log('✅ Enviando PDF de FACTUS:', pdfResult.data.pdfUrl);
            return res.status(200).json({
              success: true,
              result: {
                pdfUrl: pdfResult.data.pdfUrl,
                factusId: invoice.factus.factusId,
                status: invoice.factus.status,
                sandbox: false
              },
              message: 'PDF descargado exitosamente desde FACTUS',
            });
          }
        }
      } catch (error) {
        console.error('⚠️ Error descargando PDF de FACTUS:', error.message);
        // Continuar con PDF local si FACTUS falla
      }
    }

    // Si no hay factusId o falló la descarga, usar PDF local
    if (invoice.pdf) {
      return res.status(200).json({
        success: true,
        result: {
          pdfUrl: `/uploads/${invoice.pdf}`,
          local: true
        },
        message: 'PDF local disponible',
      });
    }

    return res.status(404).json({
      success: false,
      result: null,
      message: 'No hay PDF disponible para esta factura',
    });

  } catch (error) {
    console.error('Error descargando PDF:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
    });
  }
};

module.exports = downloadPDF;
