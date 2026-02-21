import api from './axiosConfig';

// Get all clients with filters and pagination
export const getClients = async (params = {}) => {
  try {
    const response = await api.get('/client/list', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get client by ID
export const getClient = async (id) => {
  try {
    const response = await api.get(`/client/read/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new client
export const createClient = async (clientData) => {
  try {
    const response = await api.post('/client/create', clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update client
export const updateClient = async (id, clientData) => {
  try {
    const response = await api.put(`/client/update/${id}`, clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete client
export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/client/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default { getClients, getClient, createClient, updateClient, deleteClient };
