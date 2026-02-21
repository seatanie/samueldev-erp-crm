export const fields = {
  name: {
    type: 'string',
  },
  reference: {
    type: 'string',
  },
  description: {
    type: 'text',
  },
  price: {
    type: 'number',
  },
  stock: {
    type: 'number',
  },
  category: {
    type: 'async',
    entity: 'product-category',
    displayLabels: ['name'],
    outputValue: '_id',
  },
  enabled: {
    type: 'boolean',
  },
  image: {
    type: 'upload',
    accept: 'image/*',
    maxCount: 1,
  },
};