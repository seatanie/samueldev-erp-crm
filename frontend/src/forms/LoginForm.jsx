import React from 'react';
import { Form, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';

export default function LoginForm() {
  const translate = useLanguage();
  return (
    <div>
      <Form.Item
        label={translate('email')}
        name="email"
        rules={[
          {
            required: true,
            message: 'Por favor ingresa tu correo electrónico',
          },
          {
            type: 'email',
            message: 'Por favor ingresa un correo electrónico válido',
          },
        ]}
        style={{ marginBottom: '24px' }}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" style={{ color: '#bfbfbf' }} />}
          placeholder={'admin@admin.com'}
          type="email"
          size="large"
          style={{
            height: '48px',
            borderRadius: '8px',
            border: '1px solid #e8e8e8',
            fontSize: '15px',
            backgroundColor: '#fafafa',
          }}
        />
      </Form.Item>
      <Form.Item
        label={translate('password')}
        name="password"
        rules={[
          {
            required: true,
            message: 'Por favor ingresa tu contraseña',
          },
        ]}
        style={{ marginBottom: '24px' }}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#bfbfbf' }} />}
          placeholder={'admin123'}
          size="large"
          style={{
            height: '48px',
            borderRadius: '8px',
            border: '1px solid #e8e8e8',
            fontSize: '15px',
            backgroundColor: '#fafafa',
          }}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: '0' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ fontSize: '14px', color: '#666' }}>
              {translate('Remember me')}
            </Checkbox>
          </Form.Item>
          <a 
            className="login-form-forgot" 
            href="/forgetpassword" 
            style={{ 
              color: '#1890ff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {translate('Forgot password')}
          </a>
        </div>
      </Form.Item>
    </div>
  );
}
