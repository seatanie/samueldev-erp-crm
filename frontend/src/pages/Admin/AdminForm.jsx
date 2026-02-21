import React, { useState } from 'react';
import { Form, Input, Select, Switch, Button, message, Modal } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

const { Option } = Select;

const AdminForm = ({ 
  isUpdateForm = false, 
  initialValues = {}, 
  onSubmit, 
  onCancel,
  visible = true 
}) => {
  const translate = useLanguage();
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = [
    { value: 'owner', label: 'Account Owner' },
    { value: 'admin', label: 'Super Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' },
    { value: 'create_only', label: 'Create Only' },
    { value: 'read_only', label: 'Read Only' },
  ];

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) onCancel();
  };

  return (
    <Modal
      title={isUpdateForm ? "Editar Administrador" : "Agregar Nuevo Administrador"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          enabled: true,
          ...initialValues
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: 'El nombre es requerido' }]}
        >
          <Input placeholder="Ingrese el nombre" />
        </Form.Item>

        <Form.Item
          name="surname"
          label="Apellido"
          rules={[{ required: true, message: 'El apellido es requerido' }]}
        >
          <Input placeholder="Ingrese el apellido" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[
            { required: true, message: 'El correo electrónico es requerido' },
            { type: 'email', message: 'Ingrese un correo electrónico válido' }
          ]}
        >
          <Input placeholder="Ingrese el correo electrónico" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Teléfono"
        >
          <Input placeholder="Ingrese el teléfono" />
        </Form.Item>

        <Form.Item
          name="department"
          label="Departamento/Sucursal"
        >
          <Input placeholder="Ingrese el departamento o sucursal" />
        </Form.Item>

        {!isUpdateForm && (
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: 'La contraseña es requerida' }]}
          >
            <Input.Password
              placeholder="Ingrese la contraseña"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
        )}

        <Form.Item
          name="role"
          label="Rol"
          rules={[{ required: true, message: 'El rol es requerido' }]}
        >
          <Select placeholder="Seleccione un rol">
            {roleOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="enabled"
          label="Habilitado"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit">
            {isUpdateForm ? 'Actualizar' : 'Crear'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminForm;




