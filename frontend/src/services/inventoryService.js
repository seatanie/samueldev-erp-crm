import request from '@/request/request';

const inventoryService = {
  // Obtener inventario con detalles
  getInventory: (params = {}) => {
    let query = '?';
    for (var key in params) {
      query += key + '=' + params[key] + '&';
    }
    query = query.slice(0, -1);
    return request.get({ entity: '/inventory' + query });
  },

  // Obtener productos con stock bajo
  getLowStockProducts: () => {
    return request.get({ entity: '/inventory/low-stock' });
  },

  // Obtener productos que necesitan reorden
  getReorderProducts: () => {
    return request.get({ entity: '/inventory/reorder' });
  },

  // Obtener estadísticas de inventario
  getInventoryStats: (warehouseId) => {
    let query = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return request.get({ entity: '/inventory/stats' + query });
  },

  // Obtener historial de movimientos
  getMovementHistory: (params = {}) => {
    let query = '?';
    for (var key in params) {
      query += key + '=' + params[key] + '&';
    }
    query = query.slice(0, -1);
    return request.get({ entity: '/inventory/movements' + query });
  },

  // Actualizar stock
  updateStock: (data) => {
    return request.post({ entity: '/inventory/update-stock', jsonData: data });
  },

  // Obtener inventario por ID
  getInventoryById: (id) => {
    return request.read({ entity: '/inventory', id });
  },

  // Crear registro de inventario
  createInventory: (data) => {
    return request.create({ entity: '/inventory', jsonData: data });
  },

  // Actualizar registro de inventario
  updateInventory: (id, data) => {
    return request.update({ entity: '/inventory', id, jsonData: data });
  },

  // Eliminar registro de inventario
  deleteInventory: (id) => {
    return request.delete({ entity: '/inventory', id });
  }
};

export default inventoryService;
