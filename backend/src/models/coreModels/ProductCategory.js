const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    color: {
      type: String,
      required: true,
      default: '#1890ff',
      validate: {
        validator: function(v) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'El color debe ser un código hexadecimal válido'
      }
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
productCategorySchema.index({ name: 1 });
productCategorySchema.index({ enabled: 1 });
productCategorySchema.index({ removed: 1 });
productCategorySchema.index({ createdBy: 1 });

// Middleware pre-save para validaciones adicionales
productCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  if (this.isModified('description')) {
    this.description = this.description.trim();
  }
  next();
});

// Método estático para obtener categorías habilitadas
productCategorySchema.statics.getEnabledCategories = function() {
  return this.find({ enabled: true, removed: false }).select('name color');
};

// Método de instancia para soft delete
productCategorySchema.methods.softDelete = function() {
  this.removed = true;
  return this.save();
};

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;
