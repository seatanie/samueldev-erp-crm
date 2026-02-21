const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const validateEnvironment = require('./middlewares/validateEnvironment');

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');

const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');
const epaycoRoutes = require('./routes/appRoutes/epaycoRoutes');
const factusRoutes = require('./routes/appRoutes/factusRoutes');
const reportsApiRouter = require('./routes/coreRoutes/reportsApi');
const productCategoryApiRouter = require('./routes/coreRoutes/productCategoryApi');
const productApiRouter = require('./routes/coreRoutes/productApi');
const orderApiRouter = require('./routes/appRoutes/orderApi');

const zoneApiRouter = require('./routes/appRoutes/zoneRoutes');

// 🎨 Ruta para logos personalizados
const logoUploadRouter = require('./routes/coreRoutes/logoUpload');



// 🔐 Rutas para restablecimiento de contraseña
const passwordResetRouter = require('./routes/coreRoutes/passwordResetRoutes');

// 📊 Rutas para estadísticas del usuario
const userStatsRouter = require('./routes/coreRoutes/userStatsRoutes');

// 📦 Rutas de inventario
const inventoryApiRouter = require('./routes/coreRoutes/inventoryApi');
const warehouseApiRouter = require('./routes/coreRoutes/warehouseApi');

const fileUpload = require('express-fileupload');
// create our Express app
const app = express();

// Configurar Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Deshabilitar para compatibilidad con uploads
}));

// Configurar Rate Limiting (más permisivo en desarrollo)
const isDevelopment = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 1000 : 100, // Más permisivo en desarrollo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para desarrollo local
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});

// Aplicar rate limiting a todas las rutas excepto auth
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/password-reset')) {
    return next(); // Saltar rate limiting para auth
  }
  return limiter(req, res, next);
});

// Rate limiting más estricto para login (más permisivo en desarrollo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 50 : 5, // Más permisivo en desarrollo
  message: {
    success: false,
    message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos.',
  },
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Saltar rate limiting para desarrollo local
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});

app.use('/api/auth', authLimiter);

logger.success('Headers de seguridad configurados con Helmet');
logger.success('Rate limiting configurado');

// Configuración CORS más segura
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remover valores undefined
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.security('CORS bloqueado para origen', { origin });
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // Cache preflight por 24 horas
};

app.use(cors(corsOptions));
logger.success('CORS configurado con validación de origen');

// Validar configuración de entorno
app.use(validateEnvironment);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());



// Servir archivos estáticos del directorio uploads (ANTES de las rutas de API)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Servir archivos estáticos del directorio public completo
app.use('/public', express.static(path.join(__dirname, 'public')));



// Habilitar middleware de subida de archivos (excluyendo rutas de logos)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/logos') || req.path.startsWith('/test-logos')) {
    return next();
  }
  return fileUpload()(req, res, next);
});

// Here our API Routes

// Rutas de autenticación (SIN autenticación)
app.use('/api', coreAuthRouter);

// 🔐 Rutas para restablecimiento de contraseña (SIN autenticación)
app.use('/api/password-reset', passwordResetRouter);

// Rutas de la API (CON autenticación) - TODAS RESTAURADAS
app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
console.log('✅ Ruta /api registrada con coreApiRouter');

app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
app.use('/api/reports', adminAuth.isValidAuthToken, reportsApiRouter);
app.use('/api/product-categories', adminAuth.isValidAuthToken, productCategoryApiRouter);
app.use('/api/product-category', adminAuth.isValidAuthToken, productCategoryApiRouter);
app.use('/api/products', adminAuth.isValidAuthToken, productApiRouter);
app.use('/api/product', adminAuth.isValidAuthToken, productApiRouter);
app.use('/api/orders', adminAuth.isValidAuthToken, orderApiRouter);
app.use('/api/order', adminAuth.isValidAuthToken, orderApiRouter);

// Ruta de prueba sin autenticación para debugging
app.use('/api/test-order', orderApiRouter);

app.use('/api/zones', adminAuth.isValidAuthToken, zoneApiRouter);

// 📊 Rutas para estadísticas del usuario (CON autenticación)
app.use('/api/user-stats', adminAuth.isValidAuthToken, userStatsRouter);

// 📦 Rutas de inventario (CON autenticación)
app.use('/api/inventory', adminAuth.isValidAuthToken, inventoryApiRouter);
app.use('/api/warehouses', adminAuth.isValidAuthToken, warehouseApiRouter);

// 🎨 Ruta para logos personalizados
app.use('/api/logos', adminAuth.isValidAuthToken, logoUploadRouter);
console.log('✅ Ruta /api/logos registrada con logoUploadRouter');

// Rutas de ePayco (sin autenticación para webhooks)
app.use('/api', epaycoRoutes);

// Rutas de FACTUS (con autenticación)
app.use('/api/factus', adminAuth.isValidAuthToken, factusRoutes);

// Servir archivos estáticos de descarga
app.use('/download', express.static(path.join(__dirname, 'public', 'download')));
app.use('/download', coreDownloadRouter);
app.use('/public', corePublicRouter);



// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
