import { request } from '@/request';

export const factusService = {
  // Crear factura en FACTUS (Paso 1)
  createInvoice: async (invoiceId, force = false) => {
    return request.post({ entity: `factus/create/${invoiceId}`, jsonData: { force } });
  },

  // Validar factura en FACTUS (Paso 2)
  validateInvoice: async (invoiceId) => {
    return request.post({ entity: `factus/validate/${invoiceId}`, jsonData: {} });
  },

  // Obtener estado de factura en FACTUS
  getInvoiceStatus: async (invoiceId) => {
    return request.get({ entity: `factus/status/${invoiceId}` });
  },

  // Descargar PDF de FACTUS
  downloadPDF: async (invoiceId) => {
    return request.get({ entity: `factus/download/pdf/${invoiceId}` });
  },

  // Descargar XML de FACTUS
  downloadXML: async (invoiceId) => {
    return request.get({ entity: `factus/download/xml/${invoiceId}` });
  },

  // Anular factura en FACTUS
  cancelInvoice: async (invoiceId, reason) => {
    return request.post({ entity: `factus/cancel/${invoiceId}`, jsonData: { reason } });
  },

  // Obtener rangos de numeración
  getNumberingRanges: async () => {
    return request.get({ entity: 'factus/numbering-ranges' });
  },

  // Validar configuración de FACTUS
  validateConfig: async () => {
    return request.get({ entity: 'factus/validate-config' });
  },

  // Datos maestros
  getMunicipios: async () => {
    return request.get({ entity: 'factus/municipios' });
  },

  getPaises: async () => {
    return request.get({ entity: 'factus/paises' });
  },

  getTributos: async () => {
    return request.get({ entity: 'factus/tributos' });
  },

  getUnidadesMedida: async () => {
    return request.get({ entity: 'factus/unidades-medida' });
  }
};

export default factusService;
