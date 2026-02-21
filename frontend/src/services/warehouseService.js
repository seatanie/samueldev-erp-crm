import request from '@/request/request';

const warehouseService = {
  // Obtener todos los almacenes
  getWarehouses: (params = {}) => {
    let query = '?';
    for (var key in params) {
      query += key + '=' + params[key] + '&';
    }
    query = query.slice(0, -1);
    return request.get({ entity: '/warehouses' + query });
  },

  // Obtener almacén por ID
  getWarehouseById: (id) => {
    return request.read({ entity: '/warehouses', id });
  },

  // Obtener almacén principal
  getMainWarehouse: () => {
    return request.get({ entity: '/warehouses/main' });
  },

  // Obtener almacenes activos
  getActiveWarehouses: () => {
    return request.get({ entity: '/warehouses/active' });
  },

  // Crear almacén
  createWarehouse: (data) => {
    return request.create({ entity: '/warehouses', jsonData: data });
  },

  // Actualizar almacén
  updateWarehouse: (id, data) => {
    return request.update({ entity: '/warehouses', id, jsonData: data });
  },

  // Eliminar almacén
  deleteWarehouse: (id) => {
    return request.delete({ entity: '/warehouses', id });
  },

  // Calcular capacidad utilizada
  calculateCapacity: (id) => {
    return request.post({ entity: `/warehouses/${id}/calculate-capacity`, jsonData: {} });
  }
};

export default warehouseService;
