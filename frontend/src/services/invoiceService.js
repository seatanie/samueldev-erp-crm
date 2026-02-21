import api from './axiosConfig';

// Get all invoices with filters and pagination
export const getInvoices = async (params = {}) => {
  try {
    const response = await api.get('/invoice/list', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get invoice by ID
export const getInvoice = async (id) => {
  try {
    const response = await api.get(`/invoice/read/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new invoice
export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/invoice/create', invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update invoice
export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await api.put(`/invoice/update/${id}`, invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete invoice
export const deleteInvoice = async (id) => {
  try {
    const response = await api.delete(`/invoice/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export default { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice };
