import React from 'react';
import { Typography, Card, Space, Button } from 'antd';
import { GithubOutlined, GlobalOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function About() {
  const handleContact = () => {
    window.open(`https://samueldev.com/contacto/`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Acerca de Samuel Dev</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Información del Sistema">
          <Paragraph>
            <Text strong>Sistema: </Text>Samuel Dev ERP CRM
          </Paragraph>
          <Paragraph>
            <Text strong>Versión: </Text>1.0.0
          </Paragraph>
          <Paragraph>
            <Text strong>Desarrollado por: </Text>Samuel Dev
          </Paragraph>
        </Card>

        <Card title="Enlaces">
          <Space direction="vertical">
            <div>
              <GlobalOutlined style={{ marginRight: '8px' }} />
              Website : <a href="https://www.samueldev">nolink</a>
            </div>
            <div>
              <GithubOutlined style={{ marginRight: '8px' }} />
              GitHub : <a href="https://github.com/samueldev/samueldev">
                https://github.com/pordefinir
              </a>
            </div>
          </Space>
        </Card>

        <Card title="Contacto">
          <Button 
            type="primary" 
            icon={<MailOutlined />}
            onClick={handleContact}
          >
            Contactar
          </Button>
        </Card>
      </Space>
    </div>
  );
}
