const Joi = require('joi');
const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  number: Joi.number().required(),
  year: Joi.number().required(),
  status: Joi.string().required(),
  notes: Joi.string().allow(''),
  expiredDate: Joi.date().required(),
  date: Joi.date().required(),
  // array cannot be empty
  items: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().allow('').optional(),
        itemName: Joi.string().required(),
        description: Joi.string().allow(''),
        quantity: Joi.number().required(),
        price: Joi.number().required(),
        total: Joi.number().required(),
      }).required()
    )
    .required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
  // 🎨 Template de personalización opcional
  invoiceTemplate: Joi.object({
    primaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    secondaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    backgroundColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    tableHeaderColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    tableRowColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    fontFamily: Joi.string().optional(),
    fontSize: Joi.number().min(8).max(20).optional(),
    headerFontSize: Joi.number().min(20).max(50).optional(),
    customLogo: Joi.string().uri().optional(),
    logoPosition: Joi.string().valid('left', 'right', 'center').optional(),
    logoSize: Joi.number().min(100).max(400).optional(),
    logoAlignment: Joi.string().valid('left', 'right', 'center').optional(),
    customFields: Joi.array().items(
      Joi.object({
        label: Joi.string().required(),
        value: Joi.string().required(),
        position: Joi.string().valid('header', 'footer', 'sidebar').optional()
      })
    ).optional(),
    customFooter: Joi.string().optional(),
    borderColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    textColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }).optional()
});

module.exports = schema;
