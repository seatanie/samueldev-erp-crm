const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600 // Expira en 1 hora
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar búsquedas
passwordResetSchema.index({ email: 1 });
passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ expiresAt: 1 });

// Método para verificar si el token es válido
passwordResetSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

// Método para marcar como usado
passwordResetSchema.methods.markAsUsed = function() {
  this.used = true;
  return this.save();
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;









