const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },

  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin', required: true },
  number: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  content: String,
  recurring: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'annually', 'quarter'],
  },
  date: {
    type: Date,
    required: true,
  },
  expiredDate: {
    type: Date,
    required: true,
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
    autopopulate: true,
  },
  converted: {
    from: {
      type: String,
      enum: ['quote', 'offer'],
    },
    offer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Offer',
    },
    quote: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quote',
    },
  },
  items: [
    {
      // product: {
      //   type: mongoose.Schema.ObjectId,
      //   ref: 'Product',
      //   // required: true,
      // },
      itemName: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      // discount: {
      //   type: Number,
      //   default: 0,
      // },
      // taxRate: {
      //   type: Number,
      //   default: 0,
      // },
      // subTotal: {
      //   type: Number,
      //   default: 0,
      // },
      // taxTotal: {
      //   type: Number,
      //   default: 0,
      // },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  taxRate: {
    type: Number,
    default: 0,
  },
  subTotal: {
    type: Number,
    default: 0,
  },
  taxTotal: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'NA',
    uppercase: true,
    required: true,
  },
  credit: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  payment: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Payment',
    },
  ],
  paymentStatus: {
    type: String,
    default: 'unpaid',
    enum: ['unpaid', 'paid', 'partially'],
  },
  isOverdue: {
    type: Boolean,
    default: false,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'sent', 'refunded', 'cancelled', 'on hold'],
    default: 'draft',
  },
  pdf: {
    type: String,
  },
  files: [
    {
      id: String,
      name: String,
      path: String,
      description: String,
      isPublic: {
        type: Boolean,
        default: true,
      },
    },
  ],
  // Campos para integración con ePayco
  epayco: {
    sessionData: Object,
    paymentMethod: String,
    status: String,
    transactionId: String,
    createdAt: Date,
    completedAt: Date,
    failedAt: Date
  },
  // Campos para integración con FACTUS (DIAN Colombia)
  factus: {
    factusId: String,
    cufe: String, // Código Único de Facturación Electrónica
    qrCode: String,
    pdfUrl: String,
    xmlUrl: String,
    status: {
      type: String,
      enum: ['draft', 'created', 'validated', 'sent', 'accepted', 'rejected', 'cancelled'],
      default: 'draft'
    },
    createdAt: Date,
    validatedAt: Date,
    validationResult: Object,
    sentAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    cancellationId: String,
    cancelledAt: Date,
    cancellationReason: String
  },
  // Campos específicos para DIAN Colombia
  dian: {
    documentType: {
      type: String,
      enum: ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'FACTURA_EXPORTACION'],
      default: 'FACTURA'
    },
    series: {
      type: String,
      default: 'A'
    },
    regime: {
      type: String,
      enum: ['Responsable de IVA', 'No responsable de IVA', 'Régimen Simple'],
      default: 'Responsable de IVA'
    },
    paymentMethod: {
      type: String,
      enum: ['Contado', 'Crédito', 'Mixto'],
      default: 'Contado'
    },
    paymentDueDate: Date,
    deliveryDate: Date,
    exchangeRate: {
      type: Number,
      default: 1
    },
    // Información del emisor (empresa)
    issuer: {
      documentType: {
        type: String,
        enum: ['NIT', 'CC', 'CE', 'PP', 'TI', 'RC'],
        default: 'NIT'
      },
      documentNumber: String,
      businessName: String,
      tradeName: String,
      address: {
        street: String,
        city: String,
        department: String,
        country: { type: String, default: 'Colombia' },
        postalCode: String
      },
      phone: String,
      email: String
    },
    // Información del cliente
    customer: {
      documentType: {
        type: String,
        enum: ['CC', 'CE', 'PP', 'TI', 'RC', 'NIT'],
        default: 'CC'
      },
      documentNumber: String,
      businessName: String,
      tradeName: String,
      address: {
        street: String,
        city: String,
        department: String,
        country: { type: String, default: 'Colombia' },
        postalCode: String
      },
      phone: String,
      email: String
    }
  },
  // 🎨 CAMPOS DE PERSONALIZACIÓN DE FACTURA
  invoiceTemplate: {
    // Colores personalizados
    primaryColor: { type: String, default: '#52008c' },
    secondaryColor: { type: String, default: '#222' },
    backgroundColor: { type: String, default: '#ffffff' },
    tableHeaderColor: { type: String, default: '#52008c' },
    tableRowColor: { type: String, default: '#fcfeff' },
    
    // Tipografías
    fontFamily: { type: String, default: 'sans-serif' },
    fontSize: { type: Number, default: 12 },
    headerFontSize: { type: Number, default: 32 },
    
    // Logo personalizado
    customLogo: { type: String }, // URL del logo personalizado
    logoPosition: { type: String, enum: ['left', 'right', 'center'], default: 'left' },
    logoSize: { type: Number, default: 200 },
    
    // Layout personalizable
    logoAlignment: { type: String, enum: ['left', 'right', 'center'], default: 'left' },
    
    // Campos adicionales personalizables
    customFields: [{
      label: String,
      value: String,
      position: { type: String, enum: ['header', 'footer', 'sidebar'], default: 'header' }
    }],
    
    // Footer personalizado
    customFooter: { type: String, default: '' },
    
    // Estilos adicionales
    borderColor: { type: String, default: '#c2e0f2' },
    textColor: { type: String, default: '#5d6975' }
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

invoiceSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Invoice', invoiceSchema);
