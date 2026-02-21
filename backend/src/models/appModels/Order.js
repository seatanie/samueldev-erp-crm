const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  
  createdBy: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Admin', 
    required: true 
  },
  
  orderNumber: {
    type: String,
    required: false, // Se genera automáticamente
    unique: true,
    trim: true,
  },
  
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
    autopopulate: true,
  },
  
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
    autopopulate: true,
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  total: {
    type: Number,
    required: false, // Se calcula automáticamente
    min: 0,
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  
  phone: {
    type: String,
    trim: true,
  },
  
  state: {
    type: String,
    trim: true,
  },
  
  city: {
    type: String,
    trim: true,
  },
  
  address: {
    type: String,
    trim: true,
  },
  
  note: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  
  // Campos de seguimiento
  shippedDate: {
    type: Date,
  },
  
  deliveredDate: {
    type: Date,
  },
  
  cancelledDate: {
    type: Date,
  },
  
  cancelledReason: {
    type: String,
    trim: true,
  },
  
  // Campos de auditoría
  updated: {
    type: Date,
    default: Date.now,
  },
  
  created: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Plugin para autopopulate - TEMPORALMENTE DESHABILITADO PARA DEBUG
// orderSchema.plugin(require('mongoose-autopopulate'));

// Índices para mejorar el rendimiento
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ created: -1 });
orderSchema.index({ removed: 1 });
orderSchema.index({ createdBy: 1 });

// Middleware pre-save para generar número de orden y calcular total
orderSchema.pre('save', async function(next) {
  try {
    // Generar número de orden si no existe
    if (!this.orderNumber) {
      const count = await this.constructor.countDocuments();
      this.orderNumber = `ORDER-${String(count + 1).padStart(6, '0')}`;
    }
    
    // Calcular total si no existe
    if (this.price && this.quantity) {
      const subtotal = this.price * this.quantity;
      this.total = Math.max(0, subtotal - (this.discount || 0));
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});

// Middleware pre-save para actualizar fechas de estado
orderSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'shipped':
        this.shippedDate = now;
        break;
      case 'delivered':
        this.deliveredDate = now;
        break;
      case 'cancelled':
        this.cancelledDate = now;
        break;
    }
  }
  
  next();
});

// Método estático para obtener órdenes con detalles
orderSchema.statics.getOrdersWithDetails = function(filter = {}) {
  return this.find({ ...filter, removed: false })
    .populate('customer', 'name email phone')
    .populate('product', 'name reference price category')
    .populate('product.category', 'name color')
    .populate('createdBy', 'name email')
    .sort({ created: -1 });
};

// Método estático para obtener estadísticas de órdenes
orderSchema.statics.getOrderStats = function(filter = {}) {
  return this.aggregate([
    { $match: { ...filter, removed: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' }
      }
    }
  ]);
};

// Método de instancia para soft delete
orderSchema.methods.softDelete = function() {
  this.removed = true;
  return this.save();
};

// Método para actualizar estado
orderSchema.methods.updateStatus = function(newStatus, reason = null) {
  this.status = newStatus;
  if (reason && newStatus === 'cancelled') {
    this.cancelledReason = reason;
  }
  return this.save();
};

// Método para calcular total
orderSchema.methods.calculateTotal = function() {
  const subtotal = this.price * this.quantity;
  this.total = Math.max(0, subtotal - (this.discount || 0));
  return this.total;
};

// Virtual para obtener el subtotal
orderSchema.virtual('subtotal').get(function() {
  return this.price * this.quantity;
});

// Configurar JSON transform para incluir virtuals
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
