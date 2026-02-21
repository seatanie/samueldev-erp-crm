import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Result, message } from 'antd';
import { 
  LockOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './resetPassword.css';

const { Title, Text } = Typography;
const { Password } = Input;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Verificar token al cargar la página
  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`http://localhost:8889/api/password-reset/verify/${token}`);
      
      if (response.data.success) {
        setTokenValid(true);
        setEmail(response.data.email);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8889/api/password-reset/reset', {
        token: token,
        newPassword: values.password
      });

      if (response.data.success) {
        setSuccess(true);
        message.success('Contraseña restablecida exitosamente');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        message.error(response.data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al restablecer la contraseña. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Mostrar loading mientras verifica
  if (verifying) {
    return (
      <div className="reset-password-container">
        <Card className="reset-password-card">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <Text>Verificando enlace...</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Mostrar error si el token no es válido
  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <Card className="reset-password-card">
          <Result
            status="error"
            title="Enlace Inválido o Expirado"
            subTitle="El enlace de restablecimiento no es válido o ha expirado."
            extra={[
              <Button 
                type="primary" 
                key="login"
                onClick={() => navigate('/login')}
              >
                Ir al Login
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  // Mostrar éxito si se restableció la contraseña
  if (success) {
    return (
      <div className="reset-password-container">
        <Card className="reset-password-card">
          <Result
            status="success"
            icon={<CheckCircleOutlined />}
            title="Contraseña Restablecida"
            subTitle="Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login en unos segundos."
            extra={[
              <Button 
                type="primary" 
                key="login"
                onClick={() => navigate('/login')}
              >
                Ir al Login
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  // Formulario de restablecimiento
  return (
    <div className="reset-password-container">
      {/* Header */}
      <div className="reset-header">
        <div className="logo-container">
          <div className="logo-square">
            <span className="logo-letter">A</span>
          </div>
        </div>
        <Title level={2} className="reset-title">
          Restablecer Contraseña
        </Title>
        <Text className="reset-subtitle">
          Crea una nueva contraseña para tu cuenta
        </Text>
      </div>

      {/* Formulario */}
      <Card className="reset-password-card">
        <Form
          form={form}
          name="resetPassword"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {/* Nueva Contraseña */}
          <Form.Item
            name="password"
            label="Nueva Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa tu nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="••••••"
              className="reset-input"
              iconRender={(visible) => (
                <span 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  <Text className="toggle-text">Mostrar</Text>
                </span>
              )}
            />
          </Form.Item>

          {/* Confirmar Contraseña */}
          <Form.Item
            name="confirmPassword"
            label="Confirmar Contraseña"
            rules={[
              { required: true, message: 'Por favor confirma tu nueva contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="••••••"
              className="reset-input"
              iconRender={(visible) => (
                <span 
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  <Text className="toggle-text">Mostrar</Text>
                </span>
              )}
            />
          </Form.Item>

          {/* Botón de Restablecimiento */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="reset-button"
              loading={loading}
              block
              size="large"
            >
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </Button>
          </Form.Item>
        </Form>

        {/* Información adicional */}
        <div className="reset-info">
          <Text className="info-text">
            <strong>Nota:</strong> Esta contraseña reemplazará tu contraseña actual.
          </Text>
        </div>
      </Card>

      {/* Footer */}
      <div className="reset-footer">
        <Text className="footer-text">
          ¿Recordaste tu contraseña? <a href="/login">Inicia sesión aquí</a>
        </Text>
      </div>
    </div>
  );
};

export default ResetPassword;
