const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    enabled: {
      type: Boolean,
      default: true,
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
productSchema.index({ name: 1 });
productSchema.index({ reference: 1 });
productSchema.index({ category: 1 });
productSchema.index({ enabled: 1 });
productSchema.index({ removed: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ price: 1 });

// Middleware pre-save para validaciones adicionales
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  if (this.isModified('description')) {
    this.description = this.description.trim();
  }
  if (this.isModified('reference')) {
    this.reference = this.reference.trim().toUpperCase();
  }
  next();
});

// Método estático para obtener productos habilitados
productSchema.statics.getEnabledProducts = function() {
  return this.find({ enabled: true, removed: false })
    .populate('category', 'name color')
    .select('name description reference price category image stock');
};

// Método de instancia para soft delete
productSchema.methods.softDelete = function() {
  this.removed = true;
  return this.save();
};

// Método para actualizar stock
productSchema.methods.updateStock = function(quantity) {
  this.stock = Math.max(0, this.stock + quantity);
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
