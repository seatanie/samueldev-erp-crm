import api from '@/services/axiosConfig';
import axios from 'axios';
import successHandler from './successHandler';
import errorHandler from './errorHandler';

// Instancia de axios específica para uploads sin interceptores
const uploadApi = axios.create({
  baseURL: '/api', // Usar proxy de Vite
  timeout: 30000, // Longer timeout for uploads
});

// Agregar interceptor de request para el token
uploadApi.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (auth.current && auth.current.token) {
      config.headers.Authorization = `Bearer ${auth.current.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Agregar interceptor de response para manejar errores sin logout
uploadApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // No hacer logout automático en uploadApi
    console.error('❌ Upload API error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

function findKeyByPrefix(object, prefix) {
  for (var property in object) {
    if (object.hasOwnProperty(property) && property.toString().startsWith(prefix)) {
      return property;
    }
  }
}

// Función para verificar autenticación (optimizada para evitar logs excesivos)
let lastAuthCheck = null;
let authCheckCount = 0;

function verifyAuth() {
  const auth = localStorage.getItem('auth');
  let authData = null;
  
  try {
    if (auth) {
      authData = JSON.parse(auth);
    }
  } catch (error) {
    console.error('Error al parsear auth:', error);
  }

  // Solo hacer logs cada 10 verificaciones o si hay cambios en el estado de auth
  const currentAuthState = {
    hasAuth: !!authData, 
    hasToken: !!(authData && authData.current && authData.current.token)
  };

  authCheckCount++;
  
  // Solo loggear si:
  // 1. Es la primera verificación
  // 2. Cada 10 verificaciones
  // 3. El estado de auth cambió
  if (authCheckCount === 1 || 
      authCheckCount % 10 === 0 || 
      JSON.stringify(lastAuthCheck) !== JSON.stringify(currentAuthState)) {
    
    console.log('🔐 Verificando autenticación:', { 
      ...currentAuthState,
      baseURL: api.defaults.baseURL,
      timeout: api.defaults.timeout,
      checkCount: authCheckCount
    });

    if (authData) {
      console.log('🔑 Token configurado:', authData.current.token ? 'SÍ' : 'NO');
    } else {
      console.warn('⚠️ No hay datos de autenticación disponibles');
    }
  }

  lastAuthCheck = currentAuthState;
}

const request = {
  create: async ({ entity, jsonData }) => {
    try {
      verifyAuth();
      const response = await api.post(`${entity}/create`, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  createAndUpload: async ({ entity, jsonData }) => {
    try {
      verifyAuth();
      const response = await api.post(`${entity}/create`, jsonData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  read: async ({ entity, id }) => {
    try {
      verifyAuth();
      const response = await api.get(entity + '/read/' + id);
      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  update: async ({ entity, id, jsonData }) => {
    try {
      verifyAuth();
      const response = await api.put(entity + '/' + id, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  updateAndUpload: async ({ entity, id, jsonData }) => {
    try {
      verifyAuth();
      const response = await api.put(entity + '/' + id, jsonData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  delete: async ({ entity, id }) => {
    try {
      verifyAuth();
      const response = await api.delete(entity + '/' + id);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  filter: async ({ entity, options = {} }) => {
    try {
      verifyAuth();
      let filter = options.filter ? 'filter=' + options.filter : '';
      let equal = options.equal ? '&equal=' + options.equal : '';
      let query = `?${filter}${equal}`;

      const response = await api.get(entity + '/filter' + query);
      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  search: async ({ entity, options = {} }) => {
    try {
      verifyAuth();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);
      // headersInstance.cancelToken = source.token;
      const response = await api.get(entity + '/search' + query);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  list: async ({ entity, options = {} }) => {
    try {
      verifyAuth();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);

      const response = await api.get(entity + '/list' + query);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  listAll: async ({ entity, options = {} }) => {
    try {
      verifyAuth();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);

      const response = await api.get(entity + '/listAll' + query);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  post: async ({ entity, jsonData }) => {
    try {
      verifyAuth();
      const response = await api.post(entity, jsonData);

      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  get: async ({ entity }) => {
    try {
      verifyAuth();
      const response = await api.get(entity);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  patch: async ({ entity, jsonData }) => {
    try {
      console.log('🔧 PATCH request iniciando:', { entity, jsonData });

      verifyAuth();

      console.log('🔑 Token incluido, enviando petición a:', entity);

      const response = await api.patch(entity, jsonData);

      console.log('✅ PATCH response recibida:', response.status, response.data);

      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ PATCH error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      return errorHandler(error);
    }
  },

  upload: async ({ entity, id, jsonData }) => {
    try {
      console.log('🚀 Iniciando upload para:', entity, id);
      console.log('📁 jsonData recibido:', jsonData);
      
      verifyAuth();
      
      // Verificar que tenemos un token válido
      const auth = JSON.parse(window.localStorage.getItem('auth') || '{}');
      console.log('🔐 Auth info:', {
        hasAuth: !!auth.current,
        hasToken: !!auth.current?.token,
        tokenLength: auth.current?.token?.length || 0
      });
      
      if (!auth.current || !auth.current.token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Crear FormData para enviar archivos
      let formData = new FormData();
      
      // Manejar diferentes tipos de jsonData
      if (jsonData instanceof FormData) {
        // Si ya es FormData, usarlo directamente
        console.log('📁 jsonData ya es FormData, usándolo directamente');
        formData = jsonData;
      } else if (jsonData && jsonData.file) {
        // Si es un objeto con propiedad file
        console.log('📁 jsonData.file type:', typeof jsonData.file);
        console.log('📁 jsonData.file instanceof File:', jsonData.file instanceof File);
        console.log('📁 jsonData.file instanceof Blob:', jsonData.file instanceof Blob);
        console.log('📁 jsonData.file size:', jsonData.file?.size);
        console.log('📁 jsonData.file name:', jsonData.file?.name);
        console.log('📁 jsonData.file type:', jsonData.file?.type);
        
        // Agregar el archivo si existe
        if (jsonData.file) {
          formData.append('file', jsonData.file);
          console.log('📁 Archivo agregado al FormData');
        } else {
          console.log('❌ No se encontró archivo en jsonData.file');
        }
        
        // Agregar otros campos si existen
        Object.keys(jsonData).forEach(key => {
          if (key !== 'file') {
            formData.append(key, jsonData[key]);
          }
        });
      } else {
        console.log('❌ jsonData no tiene formato válido para upload');
        throw new Error('Formato de datos inválido para upload');
      }
      
      // Log del contenido del FormData
      console.log('📁 FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  - ${key}:`, value);
      }
      
      // Usar la ruta de logos para subir archivos
      console.log('🚀 Usando ruta de logos...');
      const response = await uploadApi.post('/logos/upload', formData);
      console.log('✅ Upload exitoso:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('❌ Upload error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      return errorHandler(error);
    }
  },

  source: () => {
    const CancelToken = api.CancelToken;
    const source = CancelToken.source();
    return source;
  },

  summary: async ({ entity, options = {} }) => {
    try {
      verifyAuth();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);
      const response = await api.get(entity + '/summary' + query);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });

      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  mail: async ({ entity, jsonData }) => {
    try {
      verifyAuth();
      const response = await api.post(`${entity}/mail`, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  convert: async ({ entity, id }) => {
    try {
      verifyAuth();
      const response = await api.get(`${entity}/convert/${id}`);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
};

// Función específica para subir logo de empresa
export const uploadCompanyLogo = async (formData) => {
  try {
    console.log('📁 Subiendo logo de empresa...');
    console.log('📁 FormData:', formData);
    
    // Verificar que uploadApi esté configurado correctamente
    if (!uploadApi.defaults.baseURL) {
      throw new Error('uploadApi no tiene baseURL configurada');
    }
    
    // Verificar que el token esté disponible
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.current || !auth.current.token) {
      throw new Error('No hay token de autenticación disponible');
    }
    
    console.log('🔑 Token disponible:', auth.current.token ? 'SÍ' : 'NO');
    
    // Usar la ruta /logos/upload
    const response = await uploadApi.post('/logos/upload', formData);
    
    console.log('✅ Logo de empresa subido exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error subiendo logo de empresa:', error);
    console.error('❌ Error completo:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    throw error;
  }
};

export default request;
