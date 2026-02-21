const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');

const simpleUpload = (options = {}) => {
  const {
    uploadDir = 'src/public/uploads',
    maxFileSize = 5 * 1024 * 1024, // 5MB
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  return (req, res, next) => {
    // Verificar si es multipart/form-data
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type debe ser multipart/form-data'
      });
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: maxFileSize,
        files: 1
      }
    });

    let fileReceived = false;
    let fileInfo = null;
    let error = null;

    busboy.on('file', (fieldname, file, info) => {
      console.log('📁 Archivo recibido:', fieldname, info);
      
      // Verificar tipo MIME
      if (!allowedMimeTypes.includes(info.mimeType)) {
        error = new Error(`Tipo de archivo no permitido: ${info.mimeType}`);
        file.destroy();
        return;
      }

      fileReceived = true;
      fileInfo = { fieldname, ...info };

      // Crear directorio si no existe
      const fullUploadDir = path.join(process.cwd(), uploadDir, 'setting');
      if (!fs.existsSync(fullUploadDir)) {
        fs.mkdirSync(fullUploadDir, { recursive: true });
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const filename = `${timestamp}-${info.filename}`;
      const filepath = path.join(fullUploadDir, filename);

      // Guardar archivo
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log('✅ Archivo guardado:', filepath);
        // Agregar información del archivo a req
        req.uploadedFile = {
          originalName: info.filename,
          filename: filename,
          path: filepath,
          size: info.size,
          mimeType: info.mimeType,
          url: `/uploads/setting/${filename}`
        };
      });

      writeStream.on('error', (err) => {
        console.error('❌ Error guardando archivo:', err);
        error = err;
      });
    });

    busboy.on('finish', () => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Error procesando archivo: ' + error.message
        });
      }

      if (!fileReceived) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo'
        });
      }

      console.log('✅ Upload completado exitosamente');
      next();
    });

    busboy.on('error', (err) => {
      console.error('❌ Error en busboy:', err);
      res.status(400).json({
        success: false,
        message: 'Error en upload: ' + err.message
      });
    });

    // Pipe la request a busboy
    req.pipe(busboy);
  };
};

module.exports = simpleUpload;
