import api from './axiosConfig';

const productService = {
  // Obtener todos los productos
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  },

  // Obtener productos con categorías y filtros
  getProductsWithCategories: async (params = {}) => {
    try {
      const response = await api.get('/products/with-categories/list', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos con categorías:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      throw error;
    }
  },

  // Crear nuevo producto
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  },

  // Cambiar estado de producto
  toggleProductStatus: async (id) => {
    try {
      const response = await api.patch(`/products/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error cambiando estado de producto:', error);
      throw error;
    }
  },
};

export default productService;
