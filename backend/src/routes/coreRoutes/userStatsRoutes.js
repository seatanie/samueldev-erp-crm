const express = require('express');
const router = express.Router();
const { 
  getUserStats, 
  recordUserActivity, 
  updateSessionStats, 
  getAggregatedStats 
} = require('../../controllers/coreControllers/userStatsController');

// Middleware de autenticación
const createAuthMiddleware = require('../../controllers/middlewaresControllers/createAuthMiddleware');
const Admin = require('../../models/coreModels/Admin');
const { isValidAuthToken } = createAuthMiddleware(Admin);

// Obtener estadísticas del usuario autenticado
router.get('/my-stats', isValidAuthToken, getUserStats);

// Registrar actividad del usuario
router.post('/record-activity', isValidAuthToken, recordUserActivity);

// Actualizar estadísticas de sesión
router.post('/update-session', isValidAuthToken, updateSessionStats);

// Obtener estadísticas agregadas (solo admin)
router.get('/aggregated', isValidAuthToken, getAggregatedStats);

module.exports = router;
