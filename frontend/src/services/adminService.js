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
    // Obtener el token del localStorage directamente
    const authData = localStorage.getItem('auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.current && parsed.current.token) {
        config.headers.Authorization = `Bearer ${parsed.current.token}`;
        console.log('🔑 Token incluido en request:', parsed.current.token.substring(0, 20) + '...');
      } else {
        console.log('⚠️ No hay token en auth.current');
      }
    } else {
      console.log('⚠️ No hay datos de auth en localStorage');
    }
  } catch (error) {
    console.error('❌ Error al obtener token:', error);
  }
  return config;
});

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response exitosa:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', error.config?.url, error.message);
    
    if (error.response?.status === 401) {
      console.log('🔒 Error de autenticación - token inválido o expirado');
      
      // Verificar si es un token expirado específicamente
      if (error.response?.data?.jwtExpired) {
        console.log('⏰ Token JWT expirado, limpiando datos de sesión...');
        // Limpiar localStorage y redirigir a login
        localStorage.removeItem('auth');
        localStorage.removeItem('settings');
        localStorage.removeItem('isLogout');
        
        // Redirigir a login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        // Otro tipo de error de autenticación
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

const adminService = {
  // Obtener lista paginada de administradores
  list: async (params) => {
    try {
      console.log('📡 Enviando request a /admin/list con params:', params);
      const response = await api.get('/admin/list', { params });
      console.log('📊 Respuesta de list:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error in list:', error);
      return { success: false, message: 'Error al cargar administradores' };
    }
  },

  // Obtener todos los administradores
  listAll: async () => {
    try {
      const response = await api.get('/admin/listAll');
      return response.data;
    } catch (error) {
      console.error('Error in listAll:', error);
      return { success: false, message: 'Error al cargar todos los administradores' };
    }
  },

  // Obtener un administrador por ID
  read: async (id) => {
    try {
      const response = await api.get(`/admin/read/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in read:', error);
      return { success: false, message: 'Error al cargar administrador' };
    }
  },

  // Crear un nuevo administrador
  create: async (data) => {
    try {
      console.log('📡 Enviando request de creación:', data);
      const response = await api.post('/admin/create', data);
      console.log('✅ Administrador creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error in create:', error);
      return { success: false, message: 'Error al crear administrador' };
    }
  },

  // Actualizar un administrador
  update: async (id, data) => {
    try {
      const response = await api.patch(`/admin/update/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error in update:', error);
      return { success: false, message: 'Error al actualizar administrador' };
    }
  },

  // Eliminar un administrador
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in delete:', error);
      return { success: false, message: 'Error al eliminar administrador' };
    }
  },

  // Buscar administradores
  search: async (params) => {
    try {
      const response = await api.get('/admin/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error in search:', error);
      return { success: false, message: 'Error en búsqueda' };
    }
  },

  // Filtrar administradores
  filter: async (params) => {
    try {
      const response = await api.get('/admin/filter', { params });
      return response.data;
    } catch (error) {
      console.error('Error in filter:', error);
      return { success: false, message: 'Error en filtro' };
    }
  },

  // Obtener resumen de administradores
  summary: async () => {
    try {
      const response = await api.get('/admin/summary');
      return response.data;
    } catch (error) {
      console.error('Error in summary:', error);
      return { success: false, message: 'Error al cargar resumen' };
    }
  },

  // Cambiar estado del administrador
  toggleStatus: async (id, enabled) => {
    try {
      const response = await api.patch(`/admin/toggle-status/${id}`, { enabled });
      return response.data;
    } catch (error) {
      console.error('Error in toggleStatus:', error);
      return { success: false, message: 'Error al cambiar estado' };
    }
  },

  // Actualizar contraseña
  updatePassword: async (id, data) => {
    try {
      const response = await api.patch(`/admin/password-update/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return { success: false, message: 'Error al actualizar contraseña' };
    }
  },
};

export default adminService;
