const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  // Usuario al que pertenecen las estadísticas
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },

  // Estadísticas de sesiones
  sessions: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    averageDuration: { type: Number, default: 0 }, // en minutos
    totalDuration: { type: Number, default: 0 } // en minutos
  },

  // Estadísticas de uso por función
  functionUsage: {
    registration: { type: Number, default: 0 },
    login: { type: Number, default: 0 },
    profile: { type: Number, default: 0 },
    settings: { type: Number, default: 0 },
    passwordReset: { type: Number, default: 0 },
    dashboard: { type: Number, default: 0 }
  },

  // Actividad reciente
  recentActivity: [{
    action: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed }
  }],

  // Configuraciones y cambios
  configurations: {
    totalChanges: { type: Number, default: 0 },
    lastChanged: { type: Date },
    changesThisMonth: { type: Number, default: 0 }
  },

  // Emails y notificaciones
  communications: {
    emailsSent: { type: Number, default: 0 },
    emailsReceived: { type: Number, default: 0 },
    notifications: { type: Number, default: 0 }
  },

  // Métricas de rendimiento
  performance: {
    lastLogin: { type: Date },
    lastActivity: { type: Date },
    streakDays: { type: Number, default: 0 }, // días consecutivos de uso
    preferredHours: [Number], // horas preferidas de uso (0-23)
    preferredDays: [Number] // días preferidos (0-6, domingo=0)
  },

  // Metadatos
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Índices para optimizar consultas
userStatsSchema.index({ userId: 1, createdAt: -1 });
userStatsSchema.index({ 'performance.lastActivity': -1 });
userStatsSchema.index({ 'sessions.thisMonth': -1 });

// Métodos del modelo
userStatsSchema.methods.updateSessionStats = function(durationMinutes) {
  this.sessions.total += 1;
  this.sessions.thisMonth += 1;
  this.sessions.thisWeek += 1;
  this.sessions.today += 1;
  
  // Calcular duración promedio
  this.sessions.totalDuration += durationMinutes;
  this.sessions.averageDuration = Math.round(this.sessions.totalDuration / this.sessions.total);
  
  this.performance.lastActivity = new Date();
  this.performance.lastLogin = new Date();
  
  return this.save();
};

userStatsSchema.methods.recordActivity = function(action, description, metadata = {}) {
  this.recentActivity.unshift({
    action,
    description,
    timestamp: new Date(),
    metadata
  });
  
  // Mantener solo las últimas 50 actividades
  if (this.recentActivity.length > 50) {
    this.recentActivity = this.recentActivity.slice(0, 50);
  }
  
  this.performance.lastActivity = new Date();
  return this.save();
};

userStatsSchema.methods.updateFunctionUsage = function(functionName) {
  if (this.functionUsage[functionName] !== undefined) {
    this.functionUsage[functionName] += 1;
  }
  return this.save();
};

userStatsSchema.methods.updateConfigurationChange = function() {
  this.configurations.totalChanges += 1;
  this.configurations.lastChanged = new Date();
  this.configurations.changesThisMonth += 1;
  return this.save();
};

// Middleware para limpiar estadísticas mensuales
userStatsSchema.methods.resetMonthlyStats = function() {
  this.sessions.thisMonth = 0;
  this.sessions.thisWeek = 0;
  this.sessions.today = 0;
  this.configurations.changesThisMonth = 0;
  return this.save();
};

// Middleware para limpiar estadísticas semanales
userStatsSchema.methods.resetWeeklyStats = function() {
  this.sessions.thisWeek = 0;
  this.sessions.today = 0;
  return this.save();
};

// Middleware para limpiar estadísticas diarias
userStatsSchema.methods.resetDailyStats = function() {
  this.sessions.today = 0;
  return this.save();
};

const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;
