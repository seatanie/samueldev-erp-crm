const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'reserve', 'unreserve', 'transfer'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    oldStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    reference: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    // Para transferencias entre almacenes
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    // Para movimientos relacionados con órdenes
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
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
inventoryMovementSchema.index({ product: 1, createdAt: -1 });
inventoryMovementSchema.index({ warehouse: 1, createdAt: -1 });
inventoryMovementSchema.index({ type: 1 });
inventoryMovementSchema.index({ createdAt: -1 });

// Método para obtener el balance de un producto en un almacén
inventoryMovementSchema.statics.getProductBalance = async function(productId, warehouseId, fromDate, toDate) {
  const matchStage = {
    product: mongoose.Types.ObjectId(productId),
    warehouse: mongoose.Types.ObjectId(warehouseId),
    removed: false,
  };

  if (fromDate || toDate) {
    matchStage.createdAt = {};
    if (fromDate) matchStage.createdAt.$gte = new Date(fromDate);
    if (toDate) matchStage.createdAt.$lte = new Date(toDate);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalIn: {
          $sum: {
            $cond: [
              { $in: ['$type', ['in', 'adjustment']] },
              '$quantity',
              0
            ]
          }
        },
        totalOut: {
          $sum: {
            $cond: [
              { $in: ['$type', ['out', 'reserve']] },
              '$quantity',
              0
            ]
          }
        },
        totalUnreserve: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'unreserve'] },
              '$quantity',
              0
            ]
          }
        },
        movements: { $push: '$$ROOT' }
      }
    },
    {
      $project: {
        _id: 0,
        totalIn: 1,
        totalOut: 1,
        totalUnreserve: 1,
        netBalance: { $subtract: ['$totalIn', '$totalOut'] },
        movements: 1
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || { totalIn: 0, totalOut: 0, totalUnreserve: 0, netBalance: 0, movements: [] };
};

// Método para obtener movimientos por período
inventoryMovementSchema.statics.getMovementsByPeriod = function(productId, warehouseId, fromDate, toDate, limit = 50) {
  const matchStage = {
    product: mongoose.Types.ObjectId(productId),
    warehouse: mongoose.Types.ObjectId(warehouseId),
    removed: false,
  };

  if (fromDate || toDate) {
    matchStage.createdAt = {};
    if (fromDate) matchStage.createdAt.$gte = new Date(fromDate);
    if (toDate) matchStage.createdAt.$lte = new Date(toDate);
  }

  return this.find(matchStage)
    .populate('product', 'name reference')
    .populate('warehouse', 'name')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

module.exports = InventoryMovement;
