// src/components/LanguageDemo.jsx
import React from 'react';
import { Typography, Card, Space, Button, Divider } from 'antd';
import { useLanguage } from '@/locale/useLanguage';

const { Title, Text, Paragraph } = Typography;

export default function LanguageDemo() {
  const { translate, currentLocale, changeLocale } = useLanguage();

  const handleChangeLanguage = (locale) => {
    changeLocale(locale);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Demostración de Idiomas</Title>
      
      <Paragraph>
        Este componente demuestra las funcionalidades del sistema de idiomas implementado en Samuel Dev.
      </Paragraph>

      <Divider />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Selector de Idioma">
          <Space wrap>
            <Button 
              type={currentLocale === 'es' ? 'primary' : 'default'}
              onClick={() => handleChangeLanguage('es')}
            >
              🇪🇸 Español
            </Button>
            <Button 
              type={currentLocale === 'en' ? 'primary' : 'default'}
              onClick={() => handleChangeLanguage('en')}
            >
              🇺🇸 English
            </Button>
            <Button 
              type={currentLocale === 'fr' ? 'primary' : 'default'}
              onClick={() => handleChangeLanguage('fr')}
            >
              🇫🇷 Français
            </Button>
          </Space>
        </Card>

        <Card title="Idioma Actual">
          <Text strong>Idioma seleccionado: {currentLocale}</Text>
        </Card>

        <Card title="Ejemplos de Traducción">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Dashboard: </Text>
              <Text code>{translate('dashboard')}</Text>
            </div>
            <div>
              <Text strong>Customer: </Text>
              <Text code>{translate('customer')}</Text>
            </div>
            <div>
              <Text strong>Invoice: </Text>
              <Text code>{translate('invoice')}</Text>
            </div>
            <div>
              <Text strong>Settings: </Text>
              <Text code>{translate('settings')}</Text>
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
