const Setting = require('../../../models/coreModels/Setting');
const catchErrors = require('../../../handlers/errorHandlers');

const simpleUpload = async (req, res) => {
  try {
    const { settingKey } = req.params;
    
    console.log('🔧 Simple upload iniciado para:', settingKey);
    console.log('📁 Archivo subido:', req.uploadedFile);

    if (!req.uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo'
      });
    }

    // Buscar el setting existente
    const existingSetting = await Setting.findOne({ settingKey }).exec();
    if (!existingSetting) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No se encontró el setting: ' + settingKey,
      });
    }

    // Actualizar el setting con la nueva imagen
    const updatedSetting = await Setting.findOneAndUpdate(
      { settingKey },
      { 
        settingValue: req.uploadedFile.url,
        updated: new Date()
      },
      { new: true, runValidators: true }
    ).exec();

    console.log('✅ Setting actualizado:', updatedSetting);

    return res.status(200).json({
      success: true,
      result: updatedSetting,
      message: 'Imagen subida exitosamente',
      file: req.uploadedFile
    });

  } catch (error) {
    console.error('❌ Error en simple upload:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor: ' + error.message,
    });
  }
};

module.exports = simpleUpload;
