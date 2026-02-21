const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMovement: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para mejorar el rendimiento
inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ minStock: 1 });
inventorySchema.index({ status: 1 });

// Middleware para calcular stock disponible
inventorySchema.pre('save', function(next) {
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  next();
});

// Método para verificar si necesita reorden
inventorySchema.methods.needsReorder = function() {
  return this.currentStock <= this.reorderPoint;
};

// Método para verificar si está bajo stock mínimo
inventorySchema.methods.isLowStock = function() {
  return this.currentStock <= this.minStock;
};

// Método para actualizar stock
inventorySchema.methods.updateStock = async function(quantity, type, reason, userId) {
  const oldStock = this.currentStock;
  let newStock = oldStock;

  switch (type) {
    case 'in':
      newStock = oldStock + quantity;
      break;
    case 'out':
      newStock = Math.max(0, oldStock - quantity);
      break;
    case 'adjustment':
      newStock = quantity;
      break;
    case 'reserve':
      this.reservedStock = Math.max(0, this.reservedStock + quantity);
      break;
    case 'unreserve':
      this.reservedStock = Math.max(0, this.reservedStock - quantity);
      break;
  }

  this.currentStock = newStock;
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  this.lastMovement = new Date();
  this.updatedBy = userId;

  await this.save();

  // Crear registro de movimiento
  const InventoryMovement = mongoose.model('InventoryMovement');
  await InventoryMovement.create({
    product: this.product,
    warehouse: this.warehouse,
    type,
    quantity: Math.abs(quantity),
    oldStock,
    newStock,
    reason,
    createdBy: userId,
  });

  return this;
};

// Método estático para obtener productos con stock bajo
inventorySchema.statics.getLowStockProducts = function() {
  return this.find({
    $expr: {
      $lte: ['$currentStock', '$minStock']
    },
    status: 'active',
    removed: false
  }).populate('product', 'name reference').populate('warehouse', 'name');
};

// Método estático para obtener productos que necesitan reorden
inventorySchema.statics.getReorderProducts = function() {
  return this.find({
    $expr: {
      $lte: ['$currentStock', '$reorderPoint']
    },
    status: 'active',
    removed: false
  }).populate('product', 'name reference').populate('warehouse', 'name');
};

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
