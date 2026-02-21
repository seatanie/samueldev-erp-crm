const mongoose = require('mongoose');

const Model = mongoose.model('Setting');

const updateBySettingKey = async (req, res) => {
  try {
    console.log('=== DEBUG: updateBySettingKey ===');
    console.log('req.params:', req.params);
    console.log('req.body:', req.body);
    console.log('req.upload:', req.upload);
    console.log('req.file:', req.file);
    console.log('===============================');

    const settingKey = req.params.settingKey || undefined;

    if (!settingKey) {
      console.log('No settingKey provided');
      return res.status(202).json({
        success: false,
        result: null,
        message: 'No settingKey provided ',
      });
    }

    console.log('SettingKey encontrado:', settingKey);

    // Verificar si hay un archivo subido
    let settingValue;
    
    console.log('🔍 req.upload:', req.upload);
    console.log('🔍 req.file:', req.file);
    console.log('🔍 req.body:', req.body);
    
    if (req.upload) {
      // Si hay un archivo subido a través del middleware personalizado
      console.log('✅ Archivo subido detectado (req.upload):', req.upload);
      
      if (settingKey === 'company_logo') {
        settingValue = req.upload.filePath;
        console.log('🎨 Logo de empresa - guardando ruta:', settingValue);
      } else {
        settingValue = {
          fileName: req.upload.fileName,
          fieldExt: req.upload.fieldExt,
          entity: req.upload.entity,
          fieldName: req.upload.fieldName,
          fileType: req.upload.fileType,
          filePath: req.upload.filePath,
        };
      }
    } else if (req.file) {
      // Si hay un archivo subido a través de multer directo
      console.log('✅ Archivo subido detectado (req.file):', req.file);
      
      // Construir la ruta del archivo basada en la configuración de multer
      const filePath = `public/uploads/setting/${req.file.filename}`;
      
      if (settingKey === 'company_logo') {
        settingValue = filePath;
        console.log('🎨 Logo de empresa - guardando ruta (desde req.file):', settingValue);
      } else {
        settingValue = {
          fileName: req.file.filename,
          fieldExt: req.file.originalname.split('.').pop(),
          entity: 'setting',
          fieldName: 'file',
          fileType: 'image',
          filePath: filePath,
        };
      }
    } else if (req.body.settingValue) {
      // Si no hay archivo, usar el valor del body
      console.log('📝 Valor de texto detectado:', req.body.settingValue);
      settingValue = req.body.settingValue;
    } else {
      console.log('❌ No se encontró archivo ni valor de texto');
      console.log('❌ req.upload es:', req.upload);
      console.log('❌ req.file es:', req.file);
      console.log('❌ req.body.settingValue es:', req.body.settingValue);
      console.log('❌ req.body completo es:', req.body);
      return res.status(202).json({
        success: false,
        result: null,
        message: 'No settingValue provided ',
      });
    }

    console.log('Valor final a guardar:', settingValue);

    // Verificar que el setting existe antes de actualizar
    console.log('Buscando setting existente con key:', settingKey);
    const existingSetting = await Model.findOne({ settingKey }).exec();
    if (!existingSetting) {
      console.log('Setting no encontrado:', settingKey);
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found by this settingKey: ' + settingKey,
      });
    }

    console.log('Setting encontrado:', existingSetting);

    console.log('Actualizando setting...');
    console.log('🔍 Query de búsqueda:', { settingKey });
    console.log('🔍 Datos a actualizar:', { settingValue });
    console.log('🔍 Opciones de actualización:', { new: true, runValidators: true });
    
    try {
      const result = await Model.findOneAndUpdate(
        { settingKey },
        {
          settingValue,
        },
        {
          new: true, // return the new result instead of the old one
          runValidators: true,
        }
      ).exec();
      
      console.log('✅ Resultado de findOneAndUpdate:', result);
      
      if (!result) {
        console.log('❌ Error al actualizar setting - resultado null');
        return res.status(404).json({
          success: false,
          result: null,
          message: 'No document found by this settingKey: ' + settingKey,
        });
      } else {
        console.log('✅ Setting actualizado exitosamente:', result);
        return res.status(200).json({
          success: true,
          result,
          message: 'we update this document by this settingKey: ' + settingKey,
        });
      }
    } catch (dbError) {
      console.error('❌ Error específico en base de datos:', dbError);
      console.error('❌ Tipo de error:', dbError.constructor.name);
      console.error('❌ Mensaje de error:', dbError.message);
      console.error('❌ Stack trace de DB:', dbError.stack);
      throw dbError; // Re-lanzar para que sea capturado por el catch general
    }
  } catch (error) {
    console.error('ERROR en updateBySettingKey:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Internal server error: ' + error.message,
    });
  }
};

module.exports = updateBySettingKey;
