// src/components/TestLanguage.jsx
import React from 'react';
import { Typography, Card, Space, Button } from 'antd';
import { useLanguage } from '@/locale/useLanguage';

const { Title, Text, Paragraph } = Typography;

export default function TestLanguage() {
  const { translate, currentLocale, changeLocale } = useLanguage();

  const handleChangeLanguage = (locale) => {
    changeLocale(locale);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Test de Idioma - Samuel Dev</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Cambiar Idioma">
          <Space>
            <Button onClick={() => handleChangeLanguage('es')}>
              Español
            </Button>
            <Button onClick={() => handleChangeLanguage('en')}>
              English
            </Button>
            <Button onClick={() => handleChangeLanguage('fr')}>
              Français
            </Button>
          </Space>
        </Card>

        <Card title="Idioma Actual">
          <Text strong>Idioma actual: {currentLocale}</Text>
        </Card>

        <Card title="Traducciones de Ejemplo">
          <Paragraph>
            <Text strong>Email: </Text>
            {translate('email')}
          </Paragraph>
          <Paragraph>
            <Text strong>Password: </Text>
            {translate('password')}
          </Paragraph>
          <Paragraph>
            <Text strong>Login: </Text>
            {translate('login')}
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
}
