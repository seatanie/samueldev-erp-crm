const fileFilter =
  (type = 'default') =>
  (req, file, cb) => {
    console.log('=== FILE FILTER DEBUG ===');
    console.log('file.mimetype:', file.mimetype);
    console.log('file.originalname:', file.originalname);
    console.log('filter type:', type);
    
    // array containing all the possible file types
    const _fileType = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/msword',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/pdf',
      'application/zip',
      'application/vnd.rar',
      'video/mp4',
      'video/x-msvideo',
      'audio/mpeg',
      'video/webm',
    ];

    if (type === 'default') {
      console.log('Tipo default - aceptando archivo');
      return cb(null, true);
    } else {
      let _flag = _fileType.includes(file.mimetype);

      if (type === 'image') {
        if (!file.mimetype.startsWith('image/')) {
          _flag = false;
        }
      } else if (type === 'pdf') {
        if (!file.mimetype.startsWith('application/pdf')) {
          _flag = false;
        }
      } else if (type === 'video') {
        if (!file.mimetype.startsWith('video/')) {
          _flag = false;
        }
      } else if (type === 'audio') {
        if (!file.mimetype.startsWith('audio/')) {
          _flag = false;
        }
      } else if (type === 'text') {
        if (
          !file.mimetype.startsWith('text/') &&
          !file.mimetype.startsWith('application/vnd.ms-excel') &&
          !file.mimetype.startsWith('application/msword') &&
          !file.mimetype.startsWith(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          )
        ) {
          _flag = false;
        }
      } else if (type === 'excel') {
        if (
          !file.mimetype.startsWith('application/vnd.ms-excel') &&
          !file.mimetype.startsWith(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          )
        ) {
          _flag = false;
        }
      } else if (type === 'compressed') {
        if (
          !file.mimetype.startsWith('application/zip') &&
          !file.mimetype.startsWith('application/x-zip-compressed') &&
          !file.mimetype.startsWith('application/vnd.rar')
        ) {
          _flag = false;
        }
      }

      console.log('Flag result:', _flag);

      if (_flag) {
        console.log('Archivo aceptado por el filtro');
        return cb(null, true);
      } else {
        console.log('Archivo rechazado por el filtro:', file.mimetype);
        return cb(new Error(`${file.mimetype} File type not supported!`));
      }
    }
  };

module.exports = fileFilter;
