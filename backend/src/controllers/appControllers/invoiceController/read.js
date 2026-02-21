const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');
const FactusService = require('@/services/factusService');

const read = async (req, res) => {
  // Find document by id
  const result = await Model.findOne({
    _id: req.params.id,
    removed: false,
  })
    .populate('createdBy', 'name')
    .exec();
  // If no results found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    // 🚀 Validar automáticamente en FACTUS si tiene factusId
    if (result.factus && result.factus.factusId && result.factus.status === 'created') {
      try {
        const factus = new FactusService();
        const validationResult = await factus.validateInvoice(result.factus.factusId);
        
        if (validationResult.success) {
          // Actualizar estado de validación
          const updateData = {
            'factus.status': 'validated',
            'factus.validatedAt': new Date(),
            'factus.validationResult': validationResult.data
          };

          // Si es sandbox, agregar información adicional
          if (validationResult.warning) {
            updateData['factus.warning'] = validationResult.warning;
            updateData['factus.sandbox'] = true;
            console.log('⚠️ FACTUS en modo sandbox - validación simulada');
          }

          await Model.findOneAndUpdate(
            { _id: result._id },
            updateData,
            { new: true }
          ).exec();
          
          console.log('✅ Factura validada exitosamente en FACTUS');
          if (validationResult.warning) {
            console.log('ℹ️ Advertencia:', validationResult.warning);
          }
        }
      } catch (error) {
        console.error('⚠️ Error validando en FACTUS:', error.message);
        // No fallar la lectura si FACTUS falla
      }
    }

    // Return success resposne
    return res.status(200).json({
      success: true,
      result,
      message: 'we found this document ',
    });
  }
};

module.exports = read;
