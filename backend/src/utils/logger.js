/**
 * Sistema de logging seguro para producción
 * Solo muestra logs detallados en desarrollo
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  // Logs de información (solo en desarrollo)
  info: (message, data = null) => {
    if (isDevelopment) {
      console.log(`ℹ️ ${message}`);
      if (data) {
        console.log('   Data:', data);
      }
    }
  },

  // Logs de éxito (siempre visibles)
  success: (message, data = null) => {
    console.log(`✅ ${message}`);
    if (data && isDevelopment) {
      console.log('   Data:', data);
    }
  },

  // Logs de error (siempre visibles, pero sin datos sensibles en producción)
  error: (message, error = null) => {
    console.error(`❌ ${message}`);
    if (error && isDevelopment) {
      console.error('   Error details:', error);
    } else if (error && !isDevelopment) {
      // En producción, solo mostrar el mensaje de error sin detalles sensibles
      console.error('   Error:', error.message || 'Unknown error');
    }
  },

  // Logs de debug (solo en desarrollo)
  debug: (message, data = null) => {
    if (isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`);
      if (data) {
        console.log('   Debug data:', data);
      }
    }
  },

  // Logs de seguridad (siempre visibles)
  security: (message, data = null) => {
    console.log(`🔒 [SECURITY] ${message}`);
    if (data && isDevelopment) {
      console.log('   Security data:', data);
    }
  },

  // Logs de autenticación (sin datos sensibles)
  auth: (message, userData = null) => {
    if (isDevelopment) {
      console.log(`🔑 [AUTH] ${message}`);
      if (userData) {
        // Solo mostrar datos no sensibles
        const safeData = {
          userId: userData._id,
          email: userData.email,
          role: userData.role,
          enabled: userData.enabled
        };
        console.log('   User data:', safeData);
      }
    } else {
      // En producción, solo el mensaje
      console.log(`🔑 [AUTH] ${message}`);
    }
  }
};

module.exports = logger;

