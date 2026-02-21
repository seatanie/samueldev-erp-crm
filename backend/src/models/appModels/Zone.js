const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  coordinates: {
    type: { 
      type: String, 
      default: 'Polygon',
      enum: ['Polygon', 'Circle', 'Point']
    },
    coordinates: [[[Number]]] // Array de coordenadas para polígonos
  },
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radius: { 
    type: Number, 
    min: 0,
    default: 0
  },
  color: { 
    type: String, 
    default: '#1890ff',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color debe ser un código hexadecimal válido'
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  type: {
    type: String,
    enum: ['delivery', 'service', 'marketing', 'custom'],
    default: 'custom'
  },
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    required: true
  },
  created: { 
    type: Date, 
    default: Date.now 
  },
  updated: { 
    type: Date, 
    default: Date.now 
  }
});

// Índice geoespacial para consultas de ubicación
zoneSchema.index({ coordinates: '2dsphere' });
zoneSchema.index({ center: '2dsphere' });

// Índices para búsquedas rápidas
zoneSchema.index({ name: 'text', description: 'text' });
zoneSchema.index({ admin: 1, status: 1 });
zoneSchema.index({ type: 1, status: 1 });

// Middleware para actualizar fecha de modificación
zoneSchema.pre('save', function(next) {
  this.updated = new Date();
  next();
});

// Método para calcular área aproximada (en km²)
zoneSchema.methods.calculateArea = function() {
  if (this.coordinates && this.coordinates[0] && this.coordinates[0].length > 2) {
    // Algoritmo simple para calcular área de polígono
    let area = 0;
    const coords = this.coordinates[0];
    for (let i = 0; i < coords.length - 1; i++) {
      area += (coords[i + 1][0] - coords[i][0]) * (coords[i + 1][1] + coords[i][1]);
    }
    return Math.abs(area) * 111.32 * 111.32; // Conversión aproximada a km²
  }
  return 0;
};

// Método para verificar si un punto está dentro de la zona
zoneSchema.methods.containsPoint = function(lat, lng) {
  if (this.coordinates && this.coordinates[0]) {
    // Algoritmo ray casting para polígonos
    let inside = false;
    const coords = this.coordinates[0];
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      if (((coords[i][1] > lat) !== (coords[j][1] > lat)) &&
          (lng < (coords[j][0] - coords[i][0]) * (lat - coords[i][1]) / (coords[j][1] - coords[i][1]) + coords[i][0])) {
        inside = !inside;
      }
    }
    return inside;
  }
  return false;
};

module.exports = mongoose.model('Zone', zoneSchema);
