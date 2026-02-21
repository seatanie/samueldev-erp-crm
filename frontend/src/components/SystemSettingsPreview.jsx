import React, { useState, useEffect } from 'react';
import { Descriptions, Card, Typography, Space, Divider } from 'antd';
import { 
  GlobalOutlined, 
  ClockCircleOutlined, 
  FlagOutlined, 
  DollarOutlined, 
  CalendarOutlined, 
  NumberOutlined,
  ClockCircleOutlined as ClockIcon,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

const { Text, Title } = Typography;

const SystemSettingsPreview = ({ settings }) => {
  const translate = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Función para formatear la moneda
  const formatCurrency = (amount) => {
    const { currency } = settings;
    
    const currencyFormats = {
      'MXN': { symbol: '$', locale: 'es-MX' },
      'USD': { symbol: '$', locale: 'en-US' },
      'EUR': { symbol: '€', locale: 'de-DE' },
      'CAD': { symbol: 'C$', locale: 'en-CA' },
      'GBP': { symbol: '£', locale: 'en-GB' },
      'ARS': { symbol: '$', locale: 'es-AR' },
      'BRL': { symbol: 'R$', locale: 'pt-BR' },
      'COP': { symbol: '$', locale: 'es-CO' },
      'PEN': { symbol: 'S/', locale: 'es-PE' },
      'CLP': { symbol: '$', locale: 'es-CL' },
      'JPY': { symbol: '¥', locale: 'ja-JP' },
      'KRW': { symbol: '₩', locale: 'ko-KR' },
      'CNY': { symbol: '¥', locale: 'zh-CN' },
      'INR': { symbol: '₹', locale: 'en-IN' }
    };

    const format = currencyFormats[currency] || { symbol: '$', locale: 'en-US' };
    
    return `${format.symbol}${amount.toLocaleString(format.locale, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  // Función para formatear la fecha según el formato seleccionado
  const formatDate = (date) => {
    const { dateFormat } = settings;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'DD.MM.YYYY':
        return `${day}.${month}.${year}`;
      case 'MM.DD.YYYY':
        return `${month}.${day}.${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  // Función para formatear números según el formato seleccionado
  const formatNumber = (number) => {
    const { numberFormat } = settings;
    
    switch (numberFormat) {
      case '#,##0.00':
        return number.toLocaleString('es-MX', { minimumFractionDigits: 2 });
      case '#,##0':
        return number.toLocaleString('es-MX', { minimumFractionDigits: 0 });
      case '0.00':
        return number.toFixed(2);
      case '0':
        return Math.round(number).toString();
      case '#,##0.000':
        return number.toLocaleString('es-MX', { minimumFractionDigits: 3 });
      case '0,000.00':
        return number.toLocaleString('en-US', { minimumFractionDigits: 2 });
      default:
        return number.toLocaleString();
    }
  };

  // Función para obtener la hora local según la zona horaria seleccionada
  const getLocalTime = () => {
    try {
      const { timezone } = settings;
      if (!timezone) return currentTime;
      
      // Crear fecha en la zona horaria seleccionada
      const localTime = new Date().toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      return new Date(localTime);
    } catch (error) {
      // Si hay error con la zona horaria, usar la hora local del navegador
      return currentTime;
    }
  };

  // Función para obtener el offset de la zona horaria
  const getTimezoneOffset = () => {
    try {
      const { timezone } = settings;
      if (!timezone) return '';
      
      const now = new Date();
      const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
      const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
      
      const sign = offset >= 0 ? '+' : '';
      return `GMT${sign}${offset}`;
    } catch (error) {
      return '';
    }
  };

  const localTime = getLocalTime();
  const timezoneOffset = getTimezoneOffset();

  return (
    <div style={{ padding: '8px 0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Configuración del Sistema */}
        <div>
          <Title level={5} style={{ marginBottom: '16px', color: '#000' }}>
            <SettingOutlined style={{ marginRight: '8px' }} /> {translate('system_configuration')}
          </Title>
          <Descriptions 
            column={1} 
            size="small"
            bordered
            style={{ background: '#fafafa' }}
          >
            <Descriptions.Item 
              label={
                <Space>
                  <GlobalOutlined style={{ color: '#000' }} />
                  <span style={{ fontWeight: '500', color: '#000' }}>Idioma</span>
                </Space>
              }
            >
              {settings.language === 'es_es' ? 'Español' : 
               settings.language === 'en_us' ? 'English' :
               settings.language === 'fr_fr' ? 'Français' :
               settings.language === 'de_de' ? 'Deutsch' :
               settings.language === 'pt_br' ? 'Português' :
               settings.language === 'it_it' ? 'Italiano' :
               settings.language === 'ja_jp' ? '日本語' :
               settings.language === 'ko_kr' ? '한국어' :
               settings.language === 'zh_cn' ? '中文' :
               settings.language === 'ru_ru' ? 'Русский' : 'Otro'}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <ClockCircleOutlined style={{ color: '#000' }} />
                  <span style={{ fontWeight: '500', color: '#000' }}>Zona Horaria</span>
                </Space>
              }
            >
              {settings.timezone ? (
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px', color: '#000' }}>
                    {settings.timezone.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {timezoneOffset}
                  </div>
                </div>
              ) : 'No seleccionada'}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <FlagOutlined style={{ color: '#000' }} />
                  <span style={{ fontWeight: '500', color: '#000' }}>País</span>
                </Space>
              }
            >
              {settings.country === 'MX' ? 'México' :
               settings.country === 'US' ? 'Estados Unidos' :
               settings.country === 'CA' ? 'Canadá' :
               settings.country === 'ES' ? 'España' :
               settings.country === 'AR' ? 'Argentina' :
               settings.country === 'BR' ? 'Brasil' :
               settings.country === 'CO' ? 'Colombia' :
               settings.country === 'PE' ? 'Perú' :
               settings.country === 'CL' ? 'Chile' :
               settings.country === 'VE' ? 'Venezuela' :
               settings.country === 'EC' ? 'Ecuador' :
               settings.country === 'GT' ? 'Guatemala' :
               settings.country === 'SV' ? 'El Salvador' :
               settings.country === 'HN' ? 'Honduras' :
               settings.country === 'NI' ? 'Nicaragua' :
               settings.country === 'CR' ? 'Costa Rica' :
               settings.country === 'PA' ? 'Panamá' :
               settings.country === 'UY' ? 'Uruguay' :
               settings.country === 'PY' ? 'Paraguay' :
               settings.country === 'BO' ? 'Bolivia' : 'Otro'}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <DollarOutlined style={{ color: '#000' }} />
                  <span style={{ fontWeight: '500', color: '#000' }}>Moneda</span>
                </Space>
              }
            >
              {settings.currency === 'COP' ? 'COP (Peso Colombiano)' :
               settings.currency === 'MXN' ? 'MXN (Peso Mexicano)' :
               settings.currency === 'USD' ? 'USD (Dólar Estadounidense)' :
               settings.currency === 'EUR' ? 'EUR (Euro)' :
               settings.currency === 'CAD' ? 'CAD (Dólar Canadiense)' :
               settings.currency === 'GBP' ? 'GBP (Libra Esterlina)' :
               settings.currency === 'ARS' ? 'ARS (Peso Argentino)' :
               settings.currency === 'BRL' ? 'BRL (Real Brasileño)' :
               settings.currency === 'PEN' ? 'PEN (Sol Peruano)' :
               settings.currency === 'CLP' ? 'CLP (Peso Chileno)' :
               settings.currency === 'VES' ? 'VES (Bolívar Soberano)' :
               settings.currency === 'JPY' ? 'JPY (Yen Japonés)' :
               settings.currency === 'KRW' ? 'KRW (Won Surcoreano)' :
               settings.currency === 'CNY' ? 'CNY (Yuan Chino)' :
               settings.currency === 'INR' ? 'INR (Rupia India)' : 'Otra'}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <CalendarOutlined style={{ color: '#000' }} />
                  <span style={{ fontWeight: '500', color: '#000' }}>Formato de Fecha</span>
                </Space>
              }
            >
              {settings.dateFormat} - Ejemplo: {formatDate(localTime)}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <NumberOutlined style={{ color: '#000' }} />
                  <span style={{ fontWeight: '500', color: '#000' }}>Formato de Número</span>
                </Space>
              }
            >
              {settings.numberFormat} - Ejemplo: {formatNumber(1234.56)}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Hora Local en Tiempo Real */}
        <div>
                       <Title level={5} style={{ marginBottom: '16px', color: '#52c41a' }}>
               <ClockIcon style={{ marginRight: '8px' }} /> Hora Local - {timezoneOffset}
             </Title>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              border: '1px solid #b7eb8f',
              borderRadius: '8px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#389e0d', marginBottom: '8px' }}>
                {localTime.toLocaleTimeString('es-MX', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div style={{ fontSize: '16px', color: '#52c41a', marginBottom: '4px' }}>
                {formatDate(localTime)}
              </div>
              <div style={{ fontSize: '12px', color: '#73d13d' }}>
                {localTime.toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </Card>
        </div>

        <Divider />

                 {/* Ejemplo de Factura */}
         <div>
           <Title level={5} style={{ marginBottom: '16px', color: '#000' }}>
             <FileTextOutlined style={{ marginRight: '8px' }} /> {translate('example_invoice')}
           </Title>
                     <Card 
             style={{ 
               background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
               border: '1px solid #d9d9d9',
               borderRadius: '8px'
             }}
           >
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text strong>Fecha:</Text>
                <Text>{formatDate(localTime)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text strong>Subtotal:</Text>
                <Text>{formatCurrency(1000.00)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text strong>IVA (25%):</Text>
                <Text>{formatCurrency(250.00)}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: '16px' }}>Total:</Text>
                                 <Text strong style={{ fontSize: '16px', color: '#000' }}>
                   {formatCurrency(1250.00)}
                 </Text>
              </div>
            </div>
          </Card>
        </div>

      </Space>
    </div>
  );
};

export default SystemSettingsPreview;
