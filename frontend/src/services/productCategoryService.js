import api from './axiosConfig';

const productCategoryService = {
  // Obtener todas las categorías
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/product-categories', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    }
  },

  // Obtener categorías habilitadas
  getEnabledCategories: async () => {
    try {
      const response = await api.get('/product-categories/enabled/list');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo categorías habilitadas:', error);
      throw error;
    }
  },

  // Obtener una categoría por ID
  getCategory: async (id) => {
    try {
      const response = await api.get(`/product-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo categoría:', error);
      throw error;
    }
  },

  // Crear nueva categoría
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/product-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creando categoría:', error);
      throw error;
    }
  },

  // Actualizar categoría
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/product-categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      throw error;
    }
  },

  // Eliminar categoría
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/product-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      throw error;
    }
  },

  // Cambiar estado de categoría
  toggleCategoryStatus: async (id) => {
    try {
      const response = await api.patch(`/product-categories/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error cambiando estado de categoría:', error);
      throw error;
    }
  },
};

export default productCategoryService;
