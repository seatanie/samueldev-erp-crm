export const fields = {
  customer: {
    type: 'async',
    entity: 'client',
    displayLabels: ['name'],
    outputValue: '_id',
  },
  product: {
    type: 'async',
    entity: 'product',
    displayLabels: ['name', 'reference'],
    outputValue: '_id',
  },
  quantity: {
    type: 'number',
    min: 1,
    defaultValue: 1,
  },
  price: {
    type: 'number',
    min: 0,
  },
  discount: {
    type: 'number',
    min: 0,
    defaultValue: 0,
  },
  status: {
    type: 'select',
    options: [
      { value: 'pending', label: 'Pendiente' },
      { value: 'processing', label: 'Procesando' },
      { value: 'shipped', label: 'Enviado' },
      { value: 'delivered', label: 'Entregado' },
      { value: 'cancelled', label: 'Cancelado' },
    ],
    defaultValue: 'pending',
  },
  phone: {
    type: 'phone',
  },
  state: {
    type: 'string',
  },
  city: {
    type: 'string',
  },
  address: {
    type: 'text',
  },
  note: {
    type: 'text',
  },
};
