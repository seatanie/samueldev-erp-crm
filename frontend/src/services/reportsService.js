import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para incluir el token de autenticación
api.interceptors.request.use((config) => {
  try {
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

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Verificar si es un token expirado específicamente
      if (error.response?.data?.jwtExpired) {
        console.log('⏰ Token JWT expirado, limpiando datos de sesión...');
        localStorage.removeItem('auth');
        localStorage.removeItem('settings');
        localStorage.removeItem('isLogout');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('auth');
        localStorage.removeItem('settings');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

const reportsService = {
  // Obtener estadísticas de facturas
  getInvoiceStats: async (period, year) => {
    try {
      const response = await api.get('/reports/invoice-stats', {
        params: { period, year }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de facturas:', error);
      return { success: false, message: 'Error al cargar estadísticas' };
    }
  },

  // Obtener estadísticas de pagos
  getPaymentStats: async (period, year) => {
    try {
      const response = await api.get('/reports/payment-stats', {
        params: { period, year }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de pagos:', error);
      return { success: false, message: 'Error al cargar estadísticas' };
    }
  },

  // Obtener datos del gráfico anual
  getAnnualChartData: async (year) => {
    try {
      const response = await api.get('/reports/annual-chart', {
        params: { year }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo datos del gráfico anual:', error);
      return { success: false, message: 'Error al cargar datos del gráfico' };
    }
  },

  // Obtener estadísticas generales
  getGeneralStats: async (period, year) => {
    try {
      const response = await api.get('/reports/general-stats', {
        params: { period, year }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error);
      return { success: false, message: 'Error al cargar estadísticas' };
    }
  }
};

export default reportsService;
