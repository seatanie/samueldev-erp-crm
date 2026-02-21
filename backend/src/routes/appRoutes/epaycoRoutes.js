const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const epaycoController = require('@/controllers/appControllers/paymentController/epaycoController');

// Rutas para integración con ePayco
router.route('/payment/epayco/session').post(catchErrors(epaycoController.createPaymentSession));
router.route('/payment/epayco/direct-link').post(catchErrors(epaycoController.createDirectPaymentLink));
router.route('/payment/epayco/status/:reference').get(catchErrors(epaycoController.checkPaymentStatus));
router.route('/payment/epayco/methods').get(catchErrors(epaycoController.getPaymentMethods));

// Webhook para recibir notificaciones de ePayco
router.route('/payment/epayco/webhook').post(catchErrors(epaycoController.webhook));

// Respuesta del pago (redirección del cliente)
router.route('/payment/epayco/response').get(catchErrors(epaycoController.paymentResponse));

module.exports = router;
