/**
 * Middleware para validar variables de entorno esenciales
 */
const logger = require('../utils/logger');

const validateEnvironment = (req, res, next) => {
  const requiredEnvVars = [
    'DATABASE',
    'JWT_SECRET',
    'NODE_ENV',
    'PUBLIC_SERVER_FILE',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
    'RESEND_API',
    'RESEND_FROM_EMAIL',
    'FACTUS_BASE_URL',
    'FACTUS_CLIENT_ID',
    'FACTUS_CLIENT_SECRET',
    'FACTUS_USERNAME',
    'FACTUS_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
    
    // En desarrollo, permitimos que continúe pero con advertencia
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Continuando en modo desarrollo a pesar de variables de entorno faltantes');
      return next();
    }
    
    // En producción, detenemos la aplicación
    return res.status(500).json({
      error: 'Configuración incompleta',
      message: `Faltan variables de entorno requeridas: ${missingVars.join(', ')}`,
      details: 'Verifique el archivo .env'
    });
  }

  // Validar valores críticos
  if (process.env.JWT_SECRET === 'Camila2512@' && process.env.NODE_ENV === 'production') {
    logger.warn('JWT_SECRET está usando el valor por defecto en producción - esto es inseguro');
  }

  next();
};

module.exports = validateEnvironment;