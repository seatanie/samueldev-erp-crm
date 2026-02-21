const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
} = require('../../controllers/coreControllers/passwordResetController');

// Solicitar restablecimiento de contraseña
router.post('/request', requestPasswordReset);

// Verificar token de restablecimiento
router.get('/verify/:token', verifyResetToken);

// Restablecer contraseña
router.post('/reset', resetPassword);

module.exports = router;
