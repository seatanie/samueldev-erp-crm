import api from './axiosConfig';

const orderService = {
  // Obtener todas las órdenes
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      throw error;
    }
  },

  // Obtener órdenes con detalles completos
  getOrdersWithDetails: async (params = {}) => {
    try {
      const response = await api.get('/orders/with-details/list', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo órdenes con detalles:', error);
      throw error;
    }
  },

  // Obtener una orden por ID
  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo orden:', error);
      throw error;
    }
  },

  // Crear nueva orden
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creando orden:', error);
      throw error;
    }
  },

  // Actualizar orden
  updateOrder: async (id, orderData) => {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando orden:', error);
      throw error;
    }
  },

  // Eliminar orden
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando orden:', error);
      throw error;
    }
  },

  // Cambiar estado de orden
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error actualizando estado de orden:', error);
      throw error;
    }
  },

  // Obtener estadísticas de órdenes
  getOrderStats: async (params = {}) => {
    try {
      const response = await api.get('/orders/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de órdenes:', error);
      throw error;
    }
  },

  // Exportar órdenes a Excel
  exportToExcel: async () => {
    try {
      const response = await api.get('/order/export/excel', {
        responseType: 'blob', // Importante para archivos binarios
      });
      
      // Crear un blob y descargar el archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordenes_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Archivo Excel descargado exitosamente' };
    } catch (error) {
      console.error('Error exporting orders to Excel:', error);
      throw error;
    }
  },

  // Crear factura desde orden
  createInvoiceFromOrder: async (orderId) => {
    try {
      const response = await api.post(`/order/${orderId}/create-invoice`);
      return response.data;
    } catch (error) {
      console.error('Error creando factura desde orden:', error);
      throw error;
    }
  },
};

export default orderService;
