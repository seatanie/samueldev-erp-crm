const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const epayController = require('@/controllers/appControllers/paymentController/epayController');

// Rutas para integración con ePay.co
router.route('/payment/epay/session').post(catchErrors(epayController.createPaymentSession));
router.route('/payment/epay/direct-link').post(catchErrors(epayController.createDirectPaymentLink));
router.route('/payment/epay/status/:sessionId').get(catchErrors(epayController.checkPaymentStatus));
router.route('/payment/epay/methods').get(catchErrors(epayController.getPaymentMethods));

// Webhook para recibir notificaciones de ePay.co
router.route('/payment/epay/webhook').post(catchErrors(epayController.webhook));

module.exports = router;



