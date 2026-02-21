import { Form, Input, Switch, Button, Card, Typography, Space, Divider } from 'antd';
import { MailOutlined, SendOutlined, SettingOutlined, SaveOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

const { Title, Text } = Typography;

export default function EmailSettingsForm() {
  const translate = useLanguage();

  const onFinish = (values) => {
    console.log('Email settings:', values);
    // Aquí se enviarían los valores al backend
  };

  const initialValues = {
    samueldev_app_email: 'noreply@samueldev.com',
    samueldev_app_name: 'Samuel Dev',
    samueldev_app_email_from_name: 'Samuel Dev',
    samueldev_app_email_from_address: 'noreply@samueldev.com',
    samueldev_app_email_reply_to: 'support@samueldev.com',
    samueldev_app_email_subject_prefix: '[Samuel Dev]',
    samueldev_app_email_signature: 'Saludos,\nEquipo de Samuel Dev',
    samueldev_app_email_footer: '© 2024 Samuel Dev. Todos los derechos reservados.',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Title level={3}>
        <MailOutlined style={{ marginRight: '8px' }} />
        Configuración de Email para Facturas
      </Title>
      
      <Text type="secondary">
        Configura el envío automático de facturas por correo electrónico
      </Text>

      <Divider />

      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          enable_invoice_emails: true,
          samueldev_app_email: 'noreply@samueldev.com',
          samueldev_app_name: 'Samuel Dev',
          invoice_email_subject: 'Factura #{number}/{year} - {company_name}',
          invoice_email_template: 'default'
        }}
      >
        <Card title="Configuración General" style={{ marginBottom: '20px' }}>
          <Form.Item
            label="Habilitar envío de facturas por email"
            name="enable_invoice_emails"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Email de la aplicación"
            name="samueldev_app_email"
            rules={[
              {
                required: true,
                message: 'Por favor ingresa el email de la aplicación',
              },
              {
                type: 'email',
                message: 'Por favor ingresa un email válido',
              },
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="noreply@tuempresa.com"
            />
          </Form.Item>

          <Form.Item
            label="Nombre de la aplicación"
            name="samueldev_app_name"
            rules={[
              {
                required: true,
                message: 'Por favor ingresa el nombre de la aplicación',
              },
            ]}
          >
            <Input 
              prefix={<SettingOutlined />} 
              placeholder="Nombre de tu empresa"
            />
          </Form.Item>
        </Card>

        <Card title="Plantilla de Email" style={{ marginBottom: '20px' }}>
          <Form.Item
            label="Asunto del email"
            name="invoice_email_subject"
            rules={[
              {
                required: true,
                message: 'Por favor ingresa el asunto del email',
              },
            ]}
            extra="Variables disponibles: {number}, {year}, {company_name}, {client_name}"
          >
            <Input 
              prefix={<SendOutlined />} 
              placeholder="Factura #{number}/{year} - {company_name}"
            />
          </Form.Item>

          <Form.Item
            label="Plantilla de email"
            name="invoice_email_template"
          >
            <Input.TextArea 
              rows={4}
              placeholder="Plantilla HTML del email (opcional)"
              disabled
            />
          </Form.Item>
        </Card>

        <Card title="Configuración de Resend" style={{ marginBottom: '20px' }}>
          <Text type="secondary">
            Para usar el envío de emails, necesitas configurar Resend en tu archivo .env:
          </Text>
          
          <div style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '6px', 
            marginTop: '10px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            RESEND_API=re_xxxxxxxxxxxxx<br/>
            RESEND_FROM_EMAIL=noreply@tuempresa.com
          </div>
        </Card>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Guardar Configuración
            </Button>
            <Button onClick={() => window.location.reload()}>
              Cancelar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
