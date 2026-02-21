const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      city: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      state: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: 20,
      },
      country: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },
    contact: {
      phone: {
        type: String,
        trim: true,
        maxlength: 20,
      },
      email: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      manager: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },
    capacity: {
      type: Number,
      min: 0,
    },
    currentCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
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
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ status: 1 });
warehouseSchema.index({ isMain: 1 });

// Middleware para asegurar que solo haya un almacén principal
warehouseSchema.pre('save', async function(next) {
  if (this.isMain && this.status === 'active') {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isMain: true },
      { isMain: false }
    );
  }
  next();
});

// Método para obtener el almacén principal
warehouseSchema.statics.getMainWarehouse = function() {
  return this.findOne({ isMain: true, status: 'active', removed: false });
};

// Método para obtener almacenes activos
warehouseSchema.statics.getActiveWarehouses = function() {
  return this.find({ status: 'active', removed: false }).sort({ name: 1 });
};

// Método para calcular capacidad utilizada
warehouseSchema.methods.calculateUsedCapacity = async function() {
  const Inventory = mongoose.model('Inventory');
  const result = await Inventory.aggregate([
    { $match: { warehouse: this._id, removed: false } },
    { $group: { _id: null, totalStock: { $sum: '$currentStock' } } }
  ]);
  
  this.currentCapacity = result[0]?.totalStock || 0;
  await this.save();
  
  return this.currentCapacity;
};

// Método para verificar si hay espacio disponible
warehouseSchema.methods.hasSpace = function(requiredSpace) {
  if (!this.capacity) return true; // Sin límite de capacidad
  return (this.currentCapacity + requiredSpace) <= this.capacity;
};

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
