const multer = require('multer');
const path = require('path');
const fs = require('fs');

const fileFilter = require('./utils/LocalfileFilter');

const singleStorageUpload = ({
  entity,
  fileType = 'default',
  uploadFieldName = 'file',
  fieldName = 'file',
}) => {
  console.log('=== DEBUG: singleStorageUpload ===');
  console.log('entity:', entity);
  console.log('fileType:', fileType);
  console.log('uploadFieldName:', uploadFieldName);
  console.log('fieldName:', fieldName);
  console.log('==================================');

  var diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      try {
        console.log('=== DESTINATION FUNCTION ===');
        const uploadPath = `src/public/uploads/${entity}`;
        console.log('Destino de upload:', uploadPath);
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
          console.log('Creando directorio:', uploadPath);
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        console.log('Directorio listo:', uploadPath);
        console.log('=== FIN DESTINATION FUNCTION ===');
        cb(null, uploadPath);
      } catch (error) {
        console.error('❌ Error al crear directorio:', error);
        cb(error);
      }
    },
    filename: function (req, file, cb) {
      try {
        console.log('Procesando archivo:', file.originalname);
        
        // fetching the file extension of the uploaded file
        let fileExtension = path.extname(file.originalname);
        let uniqueFileID = Math.random().toString(36).slice(2, 7); // generates unique ID of length 5

        // Simplificar el nombre del archivo
        let originalname = file.originalname.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (originalname.length === 0) {
          originalname = 'file';
        }

        let _fileName = `${originalname}-${uniqueFileID}${fileExtension}`;
        const filePath = `public/uploads/${entity}/${_fileName}`;
        
        console.log('Nombre del archivo generado:', _fileName);
        console.log('Ruta del archivo:', filePath);
        
        // saving file name and extension in request upload object
        req.upload = {
          fileName: _fileName,
          fieldExt: fileExtension,
          entity: entity,
          fieldName: fieldName,
          fileType: fileType,
          filePath: filePath,
        };

        req.body[fieldName] = filePath;
        
        console.log('req.upload configurado:', req.upload);
        console.log('req.body[fieldName]:', req.body[fieldName]);

        cb(null, _fileName);
      } catch (error) {
        console.error('Error en filename function:', error);
        cb(error); // pass the error to the callback
      }
    },
  });

  let filterType = fileFilter(fileType);

  const multerStorage = multer({ 
    storage: diskStorage, 
    fileFilter: filterType,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  }).single(uploadFieldName);
  
  // Wrapper para agregar logging adicional
  return (req, res, next) => {
    console.log('=== MULTER MIDDLEWARE WRAPPER ===');
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Content-Length:', req.get('Content-Length'));
    
    multerStorage(req, res, (err) => {
      if (err) {
        console.error('Error en multer:', err);
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          field: err.field,
          storageErrors: err.storageErrors
        });
        return res.status(400).json({
          success: false,
          message: 'Error al procesar archivo: ' + err.message,
          details: {
            code: err.code,
            field: err.field
          }
        });
      }
      
      console.log('=== DESPUÉS DE MULTER ===');
      console.log('req.file después de multer:', req.file);
      console.log('req.upload después de multer:', req.upload);
      console.log('req.body después de multer:', req.body);
      
      next();
    });
  };
};

module.exports = singleStorageUpload;
