export const fields = {
  name: { 
    type: 'string', 
    required: true,
    placeholder: 'Ingresa el nombre'
  },
  surname: { 
    type: 'string', 
    required: true,
    placeholder: 'Ingresa el apellido'
  },
  email: { 
    type: 'email', 
    required: true,
    placeholder: 'Ingresa el correo electrónico'
  },
  role: {
    type: 'select',
    required: true,
    options: [
      { value: 'owner', label: 'Account Owner' },
      { value: 'admin', label: 'Super Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'employee', label: 'Employee' },
      { value: 'create_only', label: 'Create Only' },
      { value: 'read_only', label: 'Read Only' },
    ],
    defaultValue: 'employee',
  },
  department: { 
    type: 'string', 
    defaultValue: 'Sin departamento',
    placeholder: 'Ingresa el departamento'
  },
  phone: { 
    type: 'phone',
    placeholder: 'Ingresa el teléfono'
  },
  address: { 
    type: 'text',
    placeholder: 'Ingresa la dirección'
  },
  enabled: {
    type: 'boolean',
    defaultValue: true,
  },
};