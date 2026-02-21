import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: '/api', // Usar proxy de Vite
  timeout: 10000,
  withCredentials: true, // Importante: enviar cookies automáticamente
});

// Interceptor para agregar token de autenticación (fallback para compatibilidad)
api.interceptors.request.use((config) => {
  try {
    // Intentar leer desde localStorage como fallback
    const authData = localStorage.getItem('auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.current && parsed.current.token) {
        config.headers.Authorization = `Bearer ${parsed.current.token}`;
      }
    }
  } catch (error) {
    console.error('Error al obtener token:', error);
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Axios response error:', error);
    
    // No hacer logout automático para uploads
    if (error.config && error.config.url && error.config.url.includes('/upload')) {
      console.log('🚫 No se hace logout automático para uploads');
      return Promise.reject(error);
    }
    
    if (error.response && error.response.status === 401) {
      console.log('Token expirado o inválido, redirigiendo a login...');
      // Limpiar localStorage y redirigir a login
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
