const Model = require('@/models/coreModels/Setting');

const updatePDFSettings = async (req, res) => {
  try {
    console.log('=== DEBUG: updatePDFSettings ===');
    
    const { pdf_invoice_footer, pdf_quote_footer, pdf_offer_footer, pdf_payment_footer } = req.body;
    
    console.log('Valores recibidos:', {
      pdf_invoice_footer,
      pdf_quote_footer,
      pdf_offer_footer,
      pdf_payment_footer
    });

    // Actualizar cada configuración individualmente
    const updatePromises = [];
    
    if (pdf_invoice_footer !== undefined) {
      updatePromises.push(
        Model.findOneAndUpdate(
          { settingKey: 'pdf_invoice_footer' },
          { settingValue: pdf_invoice_footer },
          { new: true, runValidators: true }
        ).exec()
      );
    }
    
    if (pdf_quote_footer !== undefined) {
      updatePromises.push(
        Model.findOneAndUpdate(
          { settingKey: 'pdf_quote_footer' },
          { settingValue: pdf_quote_footer },
          { new: true, runValidators: true }
        ).exec()
      );
    }
    
    if (pdf_offer_footer !== undefined) {
      updatePromises.push(
        Model.findOneAndUpdate(
          { settingKey: 'pdf_offer_footer' },
          { settingValue: pdf_offer_footer },
          { new: true, runValidators: true }
        ).exec()
      );
    }
    
    if (pdf_payment_footer !== undefined) {
      updatePromises.push(
        Model.findOneAndUpdate(
          { settingKey: 'pdf_payment_footer' },
          { settingValue: pdf_payment_footer },
          { new: true, runValidators: true }
        ).exec()
      );
    }

    // Ejecutar todas las actualizaciones
    const results = await Promise.all(updatePromises);
    
    console.log('Configuraciones actualizadas:', results);

    return res.status(200).json({
      success: true,
      result: {
        pdf_invoice_footer: results.find(r => r?.settingKey === 'pdf_invoice_footer')?.settingValue || '',
        pdf_quote_footer: results.find(r => r?.settingKey === 'pdf_quote_footer')?.settingValue || '',
        pdf_offer_footer: results.find(r => r?.settingKey === 'pdf_offer_footer')?.settingValue || '',
        pdf_payment_footer: results.find(r => r?.settingKey === 'pdf_payment_footer')?.settingValue || ''
      },
      message: 'Configuración de PDF actualizada exitosamente'
    });

  } catch (error) {
    console.error('ERROR en updatePDFSettings:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor: ' + error.message,
    });
  }
};

module.exports = updatePDFSettings;










