const express = require('express');
const router = express.Router();
const reportsController = require('@/controllers/coreControllers/reportsController');

// Rutas para informes
router.get('/invoice-stats', reportsController.getInvoiceStats);
router.get('/payment-stats', reportsController.getPaymentStats);
router.get('/annual-chart', reportsController.getAnnualChartData);
router.get('/general-stats', reportsController.getGeneralStats);

module.exports = router;
