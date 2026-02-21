const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true,
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
  },
  surname: { 
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
    default: 'Sin departamento',
  },
  role: {
    type: String,
    default: 'employee',
    enum: ['owner', 'admin', 'manager', 'employee', 'create_only', 'read_only'],
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar la fecha de modificación
adminSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

// Índices para mejorar el rendimiento
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ enabled: 1 });
adminSchema.index({ removed: 1 });

module.exports = mongoose.model('Admin', adminSchema);
