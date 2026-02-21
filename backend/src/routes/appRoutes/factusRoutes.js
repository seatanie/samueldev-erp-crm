const express = require('express');
const router = express.Router();
const factusController = require('@/controllers/appControllers/factusController');
const adminAuth = require('@/controllers/coreControllers/adminAuth');

// Crear factura en FACTUS (Paso 1)
router.post('/create/:id', factusController.createFactusInvoice);

// Validar factura en FACTUS (Paso 2)
router.post('/validate/:id', factusController.validateFactusInvoice);

// Obtener estado de factura en FACTUS
router.get('/status/:id', factusController.getFactusStatus);

// Descargar PDF de FACTUS
router.get('/download/pdf/:id', factusController.downloadFactusPDF);

// Descargar XML de FACTUS
router.get('/download/xml/:id', factusController.downloadFactusXML);

// Anular factura en FACTUS
router.post('/cancel/:id', factusController.cancelFactusInvoice);

// Obtener rangos de numeración de FACTUS
router.get('/numbering-ranges', factusController.getNumberingRanges);

// Validar configuración de FACTUS
router.get('/validate-config', factusController.validateFactusConfig);

// Datos maestros (recomendados para persistir)
router.get('/municipios', factusController.getMunicipios);
router.get('/paises', factusController.getPaises);
router.get('/tributos', factusController.getTributos);
router.get('/unidades-medida', factusController.getUnidadesMedida);

module.exports = router;
