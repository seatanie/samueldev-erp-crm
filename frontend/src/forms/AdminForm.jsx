import { Form, Input, Select, Button, Switch, Space } from 'antd';
import { CloseOutlined, CheckOutlined, SaveOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

import useLanguage from '@/locale/useLanguage';

export default function AdminForm({ 
  isUpdateForm = false, 
  isForAdminOwner = false, 
  onSubmit, 
  initialValues = {} 
}) {
  const translate = useLanguage();
  const [form] = Form.useForm();

  // Actualizar valores iniciales cuando cambien
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    // Aquí podrías cerrar el modal si pasas la función
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Form.Item
        label={translate('first_name')}
        name="name"
        rules={[
          {
            required: true,
            message: translate('first_name') + ' es requerido',
          },
        ]}
      >
        <Input 
          autoComplete="off" 
          placeholder="Ingresa el nombre"
          size="large"
        />
      </Form.Item>
      
      <Form.Item
        label={translate('last_name')}
        name="surname"
        rules={[
          {
            required: true,
            message: translate('last_name') + ' es requerido',
          },
        ]}
      >
        <Input 
          autoComplete="off" 
          placeholder="Ingresa el apellido"
          size="large"
        />
      </Form.Item>
      
      <Form.Item
        label={translate('email')}
        name="email"
        rules={[
          {
            required: true,
            message: translate('email') + ' es requerido',
          },
          {
            type: 'email',
            message: 'Email inválido',
          },
        ]}
      >
        <Input 
          autoComplete="off" 
          placeholder="ejemplo@correo.com"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Teléfono"
        name="phone"
      >
        <Input 
          autoComplete="off" 
          placeholder="+1 234 567 890"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Departamento"
        name="department"
      >
        <Input 
          autoComplete="off" 
          placeholder="Ej: Administración, Ventas, etc."
          size="large"
        />
      </Form.Item>

      {!isUpdateForm && (
        <Form.Item
          label={translate('password')}
          name="password"
          rules={[
            {
              required: true,
              message: translate('password') + ' es requerido',
            },
            {
              min: 6,
              message: 'La contraseña debe tener al menos 6 caracteres',
            },
          ]}
        >
          <Input.Password 
            autoComplete="new-password" 
            placeholder="Ingresa la contraseña"
            size="large"
          />
        </Form.Item>
      )}

      <Form.Item
        label={translate('role')}
        name="role"
        rules={[
          {
            required: true,
            message: translate('role') + ' es requerido',
          },
        ]}
      >
        <Select
          placeholder="Selecciona un rol"
          size="large"
        >
          <Select.Option value="owner" disabled={!isForAdminOwner}>
            {translate('account_owner')}
          </Select.Option>
          <Select.Option value="admin" disabled={isForAdminOwner}>
            {translate('super_admin')}
          </Select.Option>
          <Select.Option value="manager" disabled={isForAdminOwner}>
            {translate('manager')}
          </Select.Option>
          <Select.Option value="employee" disabled={isForAdminOwner}>
            {translate('employee')}
          </Select.Option>
          <Select.Option value="create_only" disabled={isForAdminOwner}>
            {translate('create_only')}
          </Select.Option>
          <Select.Option value="read_only" disabled={isForAdminOwner}>
            {translate('read_only')}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={translate('enabled')}
        name="enabled"
        valuePropName={'checked'}
        initialValue={true}
      >
        <Switch 
          checkedChildren={<CheckOutlined />} 
          unCheckedChildren={<CloseOutlined />}
          size="default"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button 
            onClick={handleCancel}
            size="large"
          >
            {translate('close')}
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSubmit}
            size="large"
          >
            {translate('save')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
