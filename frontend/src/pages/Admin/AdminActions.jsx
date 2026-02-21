import React, { useState } from 'react';
import { Dropdown, Button, Modal, Form, Input, message } from 'antd';
import { 
  MoreOutlined, 
  EyeOutlined, 
  EditOutlined, 
  CopyOutlined, 
  LockOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import adminService from '@/services/crud/admin';

const AdminActions = ({ admin, onEdit, onDelete, onRefresh }) => {
  const translate = useLanguage();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm] = Form.useForm();

  const handleShow = () => {
    // Mostrar detalles del administrador
    Modal.info({
      title: 'Detalles del Administrador',
      content: (
        <div>
          <p><strong>Nombre:</strong> {admin.name}</p>
          <p><strong>Apellido:</strong> {admin.surname}</p>
          <p><strong>Email:</strong> {admin.email}</p>
          <p><strong>Teléfono:</strong> {admin.phone || 'No especificado'}</p>
          <p><strong>Departamento:</strong> {admin.department || 'No especificado'}</p>
          <p><strong>Rol:</strong> {admin.role}</p>
          <p><strong>Estado:</strong> {admin.enabled ? 'Habilitado' : 'Deshabilitado'}</p>
        </div>
      ),
      width: 500,
    });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(admin._id);
    message.success('ID copiado al portapapeles');
  };

  const handleUpdatePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (values) => {
    try {
      const response = await adminService.updatePassword(admin._id, values);
      if (response.success) {
        message.success('Contraseña actualizada exitosamente');
        setShowPasswordModal(false);
        passwordForm.resetFields();
      } else {
        message.error(response.message || 'Error al actualizar contraseña');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      message.error('Error al actualizar contraseña');
    }
  };

  const items = [
    {
      key: 'show',
      label: 'Mostrar',
      icon: <EyeOutlined />,
      onClick: handleShow,
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => onEdit(admin),
    },
    {
      key: 'copy',
      label: 'Copiar ID',
      icon: <CopyOutlined />,
      onClick: handleCopyId,
    },
    {
      key: 'password',
      label: 'Actualizar contraseña',
      icon: <LockOutlined />,
      onClick: handleUpdatePassword,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      onClick: () => onDelete(admin),
      danger: true,
    },
  ];

  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button type="text" icon={<MoreOutlined />} />
      </Dropdown>

      <Modal
        title="Actualizar Contraseña"
        open={showPasswordModal}
        onCancel={() => {
          setShowPasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
        >
          <Form.Item
            name="newPassword"
            label="Nueva contraseña"
            rules={[
              { required: true, message: 'La nueva contraseña es requerida' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password placeholder="Ingrese la nueva contraseña" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar contraseña"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Confirme la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirme la nueva contraseña" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button 
              onClick={() => {
                setShowPasswordModal(false);
                passwordForm.resetFields();
              }}
              style={{ marginRight: 8 }}
            >
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Actualizar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminActions;
