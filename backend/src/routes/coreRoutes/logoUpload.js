const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🎨 Configuración de multer para logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/setting');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

// 🎨 Filtro de archivos para solo permitir imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'), false);
  }
};

// 🎨 Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// 🧪 Ruta de prueba simple (sin autenticación)
router.get('/test', (req, res) => {
  console.log('🧪 RUTA DE PRUEBA /logos/test ACTIVADA');
  res.json({
    success: true,
    message: 'Ruta de prueba funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// 🎨 Ruta para subir logo personalizado
router.post('/upload', 
  // Procesar el archivo con multer
  upload.single('file'),
  async (req, res) => {
    try {
      console.log('🚀 MIDDLEWARE /logos/upload - INICIO');
      console.log('📁 Headers recibidos:', Object.keys(req.headers));
      console.log('📁 Body recibido:', req.body);
      console.log('📁 File recibido:', req.file);
      console.log('✅ Autenticación exitosa, procesando archivo...');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se seleccionó ningún archivo'
        });
      }
      
      console.log('✅ Archivo procesado correctamente:', req.file);
      
      // Construir la ruta para la base de datos
      const dbFilePath = `public/uploads/setting/${req.file.filename}`;
      
      // Buscar o crear el setting company_logo
      const Setting = require('../../models/coreModels/Setting');
      let existingSetting = await Setting.findOne({ settingKey: 'company_logo' }).exec();
      
      if (!existingSetting) {
        console.log('🆕 Creando nuevo setting company_logo...');
        
        // Crear un nuevo setting
        const newSetting = new Setting({
          settingKey: 'company_logo',
          settingValue: dbFilePath,
          settingCategory: 'company_settings',
          valueType: 'String',
          isCoreSetting: true,
          enabled: true,
          removed: false
        });
        
        const savedSetting = await newSetting.save();
        console.log('✅ Nuevo setting creado:', savedSetting);
        
        return res.json({
          success: true,
          result: savedSetting,
          message: 'Logo de empresa subido y configurado exitosamente',
          file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: dbFilePath,
            size: req.file.size,
            mimeType: req.file.mimetype
          }
        });
      }
      
      // Actualizar el setting existente
      console.log('🔄 Actualizando setting existente...');
      const updatedSetting = await Setting.findOneAndUpdate(
        { settingKey: 'company_logo' },
        { 
          settingValue: dbFilePath,
          updated: new Date()
        },
        { new: true, runValidators: true }
      ).exec();
      
      console.log('✅ Setting actualizado:', updatedSetting);
      
      return res.json({
        success: true,
        result: updatedSetting,
        message: 'Logo de empresa actualizado exitosamente',
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: dbFilePath,
          size: req.file.size,
          mimeType: req.file.mimetype
        }
      });
      
    } catch (error) {
      console.error('❌ Error procesando logo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }
);

// 🎨 Ruta para obtener logos disponibles
router.get('/list', async (req, res) => {
  try {
    const logosDir = path.join(__dirname, '../../public/uploads/setting');
    
    if (!fs.existsSync(logosDir)) {
      return res.json({
        success: true,
        result: [],
        message: 'No hay logos disponibles'
      });
    }
    
    const files = fs.readdirSync(logosDir);
    const logos = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => ({
        filename: file,
        url: `/uploads/setting/${file}`,
        size: fs.statSync(path.join(logosDir, file)).size
      }));
    
    res.json({
      success: true,
      result: logos,
      message: 'Logos obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Error al obtener los logos'
    });
  }
});

// 🎨 Ruta para eliminar logo
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../public/uploads/setting', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      // Si el logo eliminado era el logo de la empresa, limpiar el setting
      const Setting = require('../../models/coreModels/Setting');
      const setting = await Setting.findOne({ settingKey: 'company_logo' }).exec();
      
      if (setting && setting.settingValue && setting.settingValue.includes(filename)) {
        await Setting.findOneAndUpdate(
          { settingKey: 'company_logo' },
          { settingValue: '' }
        );
      }
      
      res.json({
        success: true,
        message: 'Logo eliminado exitosamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar el logo'
    });
  }
});

module.exports = router;
