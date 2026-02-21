import { request } from '@/request';

const entity = 'admin';

const adminService = {
  list: (params) => {
    return request.list({ entity, options: params });
  },

  listAll: (params) => {
    return request.listAll({ entity, options: params });
  },

  read: (id) => {
    return request.read({ entity, id });
  },

  create: (data) => {
    return request.create({ entity, jsonData: data });
  },

  update: (id, data) => {
    return request.update({ entity, id, jsonData: data });
  },

  delete: (id) => {
    return request.delete({ entity, id });
  },

  search: (params) => {
    return request.search({ entity, options: params });
  },

  filter: (params) => {
    return request.filter({ entity, options: params });
  },

  summary: (params) => {
    return request.summary({ entity, options: params });
  },

  toggleStatus: (id, enabled) => {
    return request.patch({ entity: `${entity}/toggle-status/${id}`, jsonData: { enabled } });
  },

  updatePassword: (id, data) => {
    return request.patch({ entity: `${entity}/password-update/${id}`, jsonData: data });
  },
};

export default adminService;
