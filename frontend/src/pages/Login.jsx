import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Modal, message } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  MailOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import { useNavigate } from 'react-router-dom';
import useUserStats from '@/hooks/useUserStats';
import axios from 'axios';
import './login.css';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [emailLinkModal, setEmailLinkModal] = useState(false);
  const [emailLinkForm] = Form.useForm();
  const [sendingLink, setSendingLink] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, error } = useSelector(selectAuth);
  const { recordLogin } = useUserStats();

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    console.log('🔍 [LOGIN DEBUG] Valores del formulario:', values);
    
    // Registrar actividad de login en estadísticas
    await recordLogin();
    
    dispatch(login({ loginData: values }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función para enviar enlace de restablecimiento de contraseña
  const sendPasswordResetLink = async (values) => {
    setSendingLink(true);
    try {
      const response = await axios.post('http://localhost:8889/api/password-reset/request', {
        email: values.email
      });

      if (response.data.success) {
        message.success(response.data.message);
        setEmailLinkModal(false);
        emailLinkForm.resetFields();
      } else {
        message.error(response.data.message || 'Error al enviar el enlace');
      }
    } catch (error) {
      console.error('Error enviando enlace de restablecimiento:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al enviar el enlace. Intenta nuevamente.');
      }
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <div className="frappe-login-container">
      {/* Logo y Título */}
      <div className="login-header">
        <div className="logo-container">
          <div className="logo-square">
            <span className="logo-letter">A</span>
          </div>
        </div>
        <Title level={2} className="login-title">
          Iniciar sesión
        </Title>
      </div>

      {/* Formulario Principal */}
      <Card className="login-card">
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {/* Campo Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu email' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="juan@example.com"
              className="frappe-input"
            />
          </Form.Item>

          {/* Campo Contraseña */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="•••••"
              className="frappe-input"
              iconRender={(visible) => (
                <span 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {visible ? (
                    <EyeInvisibleOutlined className="eye-icon eye-icon-visible" />
                  ) : (
                    <EyeOutlined className="eye-icon eye-icon-hidden" />
                  )}
                </span>
              )}
            />
          </Form.Item>

          {/* Link Olvidé Contraseña */}
          <div className="forgot-password">
            <Text className="forgot-link" onClick={() => setEmailLinkModal(true)}>
              ¿Se te olvidó tu contraseña?
            </Text>
          </div>

          {/* Botón Principal */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="frappe-primary-button"
              loading={isLoading}
              block
            >
              Iniciar sesión
            </Button>
          </Form.Item>

          {/* Separador */}
          <div className="login-separator">
            <Text className="separator-text">o</Text>
          </div>

          {/* Opciones Alternativas */}
          <div className="alternative-login">
            <Button
              className="frappe-secondary-button"
              icon={<MailOutlined />}
              block
              onClick={() => setEmailLinkModal(true)}
            >
              Restablecer contraseña por correo
            </Button>
          </div>
        </Form>

        {/* Mensaje de Error */}
        {error && (
          <div className="error-message">
            <Text type="danger">{error}</Text>
          </div>
        )}
      </Card>



      {/* Modal para Restablecimiento de Contraseña */}
      <Modal
        title="Restablecer Contraseña"
        open={emailLinkModal}
        onCancel={() => setEmailLinkModal(false)}
        footer={null}
        centered
        className="email-link-modal"
      >
        <div className="modal-content">
          <div className="modal-icon">
            <MailOutlined />
          </div>
          <Title level={4} className="modal-title">
            Recibir enlace de restablecimiento
          </Title>
          <Text className="modal-description">
            Te enviaremos un enlace seguro a tu correo electrónico para restablecer tu contraseña.
          </Text>
          
          <Form
            form={emailLinkForm}
            onFinish={sendPasswordResetLink}
            layout="vertical"
            className="email-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Por favor ingresa tu email' },
                { type: 'email', message: 'Email inválido' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="tu@email.com"
                size="large"
                className="modal-input"
              />
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={sendingLink}
                block
                size="large"
                className="send-link-button"
                icon={<SendOutlined />}
              >
                {sendingLink ? 'Enviando...' : 'Enviar Enlace'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
