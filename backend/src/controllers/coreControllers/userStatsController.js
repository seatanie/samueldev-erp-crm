const UserStats = require('../../models/coreModels/UserStats');
const Admin = require('../../models/coreModels/Admin');

// Obtener estadísticas del usuario
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id; // Viene del middleware de autenticación

    // Buscar o crear estadísticas del usuario
    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      // Crear estadísticas iniciales si no existen
      userStats = new UserStats({
        userId,
        sessions: { total: 0, thisMonth: 0, thisWeek: 0, today: 0, averageDuration: 0, totalDuration: 0 },
        functionUsage: { registration: 0, login: 0, profile: 0, settings: 0, passwordReset: 0, dashboard: 0 },
        recentActivity: [],
        configurations: { totalChanges: 0, lastChanged: null, changesThisMonth: 0 },
        communications: { emailsSent: 0, emailsReceived: 0, notifications: 0 },
        performance: { lastLogin: null, lastActivity: null, streakDays: 0, preferredHours: [], preferredDays: [] }
      });
      await userStats.save();
    }

    // Calcular estadísticas adicionales
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Obtener estadísticas agregadas
    const monthlyStats = await UserStats.aggregate([
      { $match: { userId: userStats.userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: '$sessions.total' },
          totalDuration: { $sum: '$sessions.totalDuration' },
          avgDuration: { $avg: '$sessions.averageDuration' }
        }
      }
    ]);

    // Preparar respuesta
    const stats = {
      summary: {
        totalSessions: userStats.sessions.total,
        sessionsThisMonth: userStats.sessions.thisMonth,
        sessionsThisWeek: userStats.sessions.thisWeek,
        sessionsToday: userStats.sessions.today,
        averageSessionDuration: userStats.sessions.averageDuration,
        totalTimeSpent: userStats.sessions.totalDuration
      },
      functionUsage: userStats.functionUsage,
      configurations: {
        totalChanges: userStats.configurations.totalChanges,
        changesThisMonth: userStats.configurations.changesThisMonth,
        lastChanged: userStats.configurations.lastChanged
      },
      communications: userStats.communications,
      performance: {
        lastLogin: userStats.performance.lastLogin,
        lastActivity: userStats.performance.lastActivity,
        streakDays: userStats.performance.streakDays
      },
      recentActivity: userStats.recentActivity.slice(0, 10), // Solo las últimas 10
      charts: {
        functionUsage: Object.entries(userStats.functionUsage).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value
        })),
        sessionTrend: {
          today: userStats.sessions.today,
          thisWeek: userStats.sessions.thisWeek,
          thisMonth: userStats.sessions.thisMonth
        }
      }
    };

    res.json({
      success: true,
      result: stats,
      message: 'Estadísticas obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Registrar actividad del usuario
const recordUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, description, metadata } = req.body;

    if (!action || !description) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Acción y descripción son requeridas'
      });
    }

    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      userStats = new UserStats({ userId });
    }

    // Registrar la actividad
    await userStats.recordActivity(action, description, metadata);

    // Actualizar uso de función si es aplicable
    if (userStats.functionUsage[action] !== undefined) {
      await userStats.updateFunctionUsage(action);
    }

    res.json({
      success: true,
      result: { message: 'Actividad registrada exitosamente' },
      message: 'Actividad registrada'
    });

  } catch (error) {
    console.error('Error registrando actividad:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estadísticas de sesión
const updateSessionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { durationMinutes } = req.body;

    if (!durationMinutes || durationMinutes < 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Duración de sesión válida es requerida'
      });
    }

    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      userStats = new UserStats({ userId });
    }

    // Actualizar estadísticas de sesión
    await userStats.updateSessionStats(durationMinutes);

    res.json({
      success: true,
      result: { message: 'Estadísticas de sesión actualizadas' },
      message: 'Sesión registrada'
    });

  } catch (error) {
    console.error('Error actualizando estadísticas de sesión:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas agregadas (para admin)
const getAggregatedStats = async (req, res) => {
  try {
    // Verificar si el usuario es admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        result: null,
        message: 'Acceso denegado. Solo administradores pueden ver estadísticas agregadas.'
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Estadísticas agregadas de todos los usuarios
    const aggregatedStats = await UserStats.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalSessions: { $sum: '$sessions.total' },
          totalDuration: { $sum: '$sessions.totalDuration' },
          avgSessionDuration: { $avg: '$sessions.averageDuration' },
          totalConfigChanges: { $sum: '$configurations.totalChanges' },
          totalEmailsSent: { $sum: '$communications.emailsSent' }
        }
      }
    ]);

    // Usuarios más activos
    const mostActiveUsers = await UserStats.aggregate([
      {
        $lookup: {
          from: 'admins',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalSessions: '$sessions.total',
          lastActivity: '$performance.lastActivity'
        }
      },
      {
        $sort: { totalSessions: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const result = {
      overview: aggregatedStats[0] || {},
      mostActiveUsers,
      period: {
        month: startOfMonth,
        week: startOfWeek,
        current: now
      }
    };

    res.json({
      success: true,
      result,
      message: 'Estadísticas agregadas obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas agregadas:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Limpiar estadísticas antiguas (tarea programada)
const cleanupOldStats = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Limpiar actividades más antiguas de 30 días
    await UserStats.updateMany(
      {},
      {
        $pull: {
          recentActivity: {
            timestamp: { $lt: thirtyDaysAgo }
          }
        }
      }
    );

    console.log('✅ Estadísticas antiguas limpiadas exitosamente');
  } catch (error) {
    console.error('❌ Error limpiando estadísticas antiguas:', error);
  }
};

module.exports = {
  getUserStats,
  recordUserActivity,
  updateSessionStats,
  getAggregatedStats,
  cleanupOldStats
};
