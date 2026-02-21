import React from 'react';
import { Form, Select, Space } from 'antd';
import { 
  GlobalOutlined, 
  ClockCircleOutlined, 
  FlagOutlined, 
  DollarOutlined, 
  CalendarOutlined, 
  NumberOutlined 
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

const { Option } = Select;

const SystemSettingsForm = () => {
  const translate = useLanguage();

  // Opciones de idioma
  const languageOptions = [
    { value: 'es_es', label: 'Español' },
    { value: 'en_us', label: 'English' },
    { value: 'fr_fr', label: 'Français' },
    { value: 'de_de', label: 'Deutsch' },
    { value: 'pt_pt', label: 'Português' },
    { value: 'it_it', label: 'Italiano' },
    { value: 'ja_jp', label: '日本語' },
    { value: 'ko_kr', label: '한국어' },
    { value: 'zh_cn', label: '中文' },
    { value: 'ru_ru', label: 'Русский' }
  ];

  // Opciones de zona horaria
  const timezoneOptions = [
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Mexico_City', label: 'México (GMT-6/-5)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5/-4)' },
    { value: 'America/Chicago', label: 'Chicago (GMT-6/-5)' },
    { value: 'America/Denver', label: 'Denver (GMT-7/-6)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8/-7)' },
    { value: 'America/Anchorage', label: 'Alaska (GMT-9/-8)' },
    { value: 'Pacific/Honolulu', label: 'Hawái (GMT-10)' },
    { value: 'Europe/London', label: 'Londres (GMT+0/+1)' },
    { value: 'Europe/Paris', label: 'París (GMT+1/+2)' },
    { value: 'Europe/Berlin', label: 'Berlín (GMT+1/+2)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1/+2)' },
    { value: 'Asia/Tokyo', label: 'Tokio (GMT+9)' },
    { value: 'Asia/Seoul', label: 'Seúl (GMT+9)' },
    { value: 'Asia/Shanghai', label: 'Shanghái (GMT+8)' },
    { value: 'Australia/Sydney', label: 'Sídney (GMT+10/+11)' }
  ];

  // Opciones de país
  const countryOptions = [
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'CA', label: 'Canadá' },
    { value: 'ES', label: 'España' },
    { value: 'AR', label: 'Argentina' },
    { value: 'BR', label: 'Brasil' },
    { value: 'CO', label: 'Colombia' },
    { value: 'PE', label: 'Perú' },
    { value: 'CL', label: 'Chile' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'GT', label: 'Guatemala' },
    { value: 'SV', label: 'El Salvador' },
    { value: 'HN', label: 'Honduras' },
    { value: 'NI', label: 'Nicaragua' },
    { value: 'CR', label: 'Costa Rica' },
    { value: 'PA', label: 'Panamá' },
    { value: 'UY', label: 'Uruguay' },
    { value: 'PY', label: 'Paraguay' },
    { value: 'BO', label: 'Bolivia' },
    { value: 'GY', label: 'Guyana' },
    { value: 'SR', label: 'Surinam' },
    { value: 'GF', label: 'Guayana Francesa' },
    { value: 'FK', label: 'Islas Malvinas' },
    { value: 'FR', label: 'Francia' },
    { value: 'DE', label: 'Alemania' },
    { value: 'IT', label: 'Italia' },
    { value: 'GB', label: 'Reino Unido' },
    { value: 'NL', label: 'Países Bajos' },
    { value: 'BE', label: 'Bélgica' },
    { value: 'AT', label: 'Austria' },
    { value: 'CH', label: 'Suiza' },
    { value: 'SE', label: 'Suecia' },
    { value: 'NO', label: 'Noruega' },
    { value: 'DK', label: 'Dinamarca' },
    { value: 'FI', label: 'Finlandia' },
    { value: 'GR', label: 'Grecia' },
    { value: 'TR', label: 'Turquía' },
    { value: 'RU', label: 'Rusia' },
    { value: 'JP', label: 'Japón' },
    { value: 'KR', label: 'Corea del Sur' },
    { value: 'CN', label: 'China' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'SG', label: 'Singapur' },
    { value: 'TH', label: 'Tailandia' },
    { value: 'VN', label: 'Vietnam' },
    { value: 'ID', label: 'Indonesia' },
    { value: 'PH', label: 'Filipinas' },
    { value: 'IN', label: 'India' },
    { value: 'AE', label: 'Emiratos Árabes Unidos' },
    { value: 'IR', label: 'Irán' },
    { value: 'AU', label: 'Australia' },
    { value: 'NZ', label: 'Nueva Zelanda' },
    { value: 'FJ', label: 'Fiyi' },
    { value: 'EG', label: 'Egipto' },
    { value: 'ZA', label: 'Sudáfrica' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'MA', label: 'Marruecos' },
    { value: 'KE', label: 'Kenia' }
  ];

  // Opciones de moneda
  const currencyOptions = [
    { value: 'COP', label: 'Peso Colombiano (COP)' },
    { value: 'MXN', label: 'Peso Mexicano (MXN)' },
    { value: 'USD', label: 'Dólar Estadounidense (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'CAD', label: 'Dólar Canadiense (CAD)' },
    { value: 'GBP', label: 'Libra Esterlina (GBP)' },
    { value: 'JPY', label: 'Yen Japonés (JPY)' },
    { value: 'KRW', label: 'Won Surcoreano (KRW)' },
    { value: 'CNY', label: 'Yuan Chino (CNY)' },
    { value: 'HKD', label: 'Dólar de Hong Kong (HKD)' },
    { value: 'SGD', label: 'Dólar de Singapur (SGD)' },
    { value: 'THB', label: 'Baht Tailandés (THB)' },
    { value: 'VND', label: 'Dong Vietnamita (VND)' },
    { value: 'IDR', label: 'Rupia Indonesia (IDR)' },
    { value: 'PHP', label: 'Peso Filipino (PHP)' },
    { value: 'INR', label: 'Rupia India (INR)' },
    { value: 'AED', label: 'Dírham de los EAU (AED)' },
    { value: 'IRR', label: 'Rial Iraní (IRR)' },
    { value: 'AUD', label: 'Dólar Australiano (AUD)' },
    { value: 'NZD', label: 'Dólar Neozelandés (NZD)' },
    { value: 'FJD', label: 'Dólar de Fiyi (FJD)' },
    { value: 'EGP', label: 'Libra Egipcia (EGP)' },
    { value: 'ZAR', label: 'Rand Sudafricano (ZAR)' },
    { value: 'NGN', label: 'Naira Nigeriana (NGN)' },
    { value: 'MAD', label: 'Dírham Marroquí (MAD)' },
    { value: 'KES', label: 'Chelín Keniano (KES)' }
  ];

  // Opciones de formato de fecha
  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (30/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/30/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-30)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (30-12-2024)' },
    { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY (12-30-2024)' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (30.12.2024)' },
    { value: 'MM.DD.YYYY', label: 'MM.DD.YYYY (12.30.2024)' }
  ];

  // Opciones de formato de número
  const numberFormatOptions = [
    { value: '#,##0.00', label: '#,##0.00 (1,234.56)' },
    { value: '#,##0', label: '#,##0 (1,235)' },
    { value: '0.00', label: '0.00 (1234.56)' },
    { value: '0', label: '0 (1235)' },
    { value: '#,##0.000', label: '#,##0.000 (1,234.567)' },
    { value: '0,000.00', label: '0,000.00 (1,234.56)' }
  ];

  // Función de filtro mejorada para búsqueda
  const filterOption = (input, option) => {
    if (!option || !option.children) return false;
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  return (
    <div style={{ padding: '0' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        
        {/* Idioma */}
        <Form.Item
          name="language"
          label={
            <span style={{ fontWeight: '600', color: '#262626', fontSize: '14px' }}>
              <GlobalOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> Idioma
            </span>
          }
          rules={[{ required: true, message: 'Por favor selecciona un idioma' }]}
        >
          <Select
            placeholder="Selecciona tu idioma preferido"
            size="large"
            showSearch
            filterOption={filterOption}
            optionFilterProp="children"
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: '300px' }}
          >
            {languageOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Zona Horaria */}
        <Form.Item
          name="timezone"
          label={
            <span style={{ fontWeight: '600', color: '#262626', fontSize: '14px' }}>
              <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> Zona Horaria
            </span>
          }
          rules={[{ required: true, message: 'Por favor selecciona una zona horaria' }]}
        >
          <Select
            placeholder="Selecciona tu zona horaria"
            size="large"
            showSearch
            filterOption={filterOption}
            optionFilterProp="children"
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: '300px' }}
          >
            {timezoneOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* País */}
        <Form.Item
          name="country"
          label={
            <span style={{ fontWeight: '600', color: '#262626', fontSize: '14px' }}>
              <FlagOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> País
            </span>
          }
          rules={[{ required: true, message: 'Por favor selecciona un país' }]}
        >
          <Select
            placeholder="Selecciona tu país"
            size="large"
            showSearch
            filterOption={filterOption}
            optionFilterProp="children"
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: '300px' }}
          >
            {countryOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Moneda */}
        <Form.Item
          name="currency"
          label={
            <span style={{ fontWeight: '600', color: '#262626', fontSize: '14px' }}>
              <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> Moneda
            </span>
          }
          rules={[{ required: true, message: 'Por favor selecciona una moneda' }]}
        >
          <Select
            placeholder="Selecciona tu moneda preferida"
            size="large"
            showSearch
            filterOption={filterOption}
            optionFilterProp="children"
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: '300px' }}
          >
            {currencyOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Formato de Fecha */}
        <Form.Item
          name="dateFormat"
          label={
            <span style={{ fontWeight: '600', color: '#262626', fontSize: '14px' }}>
              <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> Formato de fecha
            </span>
          }
          rules={[{ required: true, message: 'Por favor selecciona un formato de fecha' }]}
        >
          <Select
            placeholder="Selecciona el formato de fecha"
            size="large"
            showSearch
            filterOption={filterOption}
            optionFilterProp="children"
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: '300px' }}
          >
            {dateFormatOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Formato de Número */}
        <Form.Item
          name="numberFormat"
          label={
            <span style={{ fontWeight: '600', color: '#262626', fontSize: '14px' }}>
              <NumberOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> Formato de Número
            </span>
          }
          rules={[{ required: true, message: 'Por favor selecciona un formato de número' }]}
        >
          <Select
            placeholder="Selecciona el formato de número"
            size="large"
            showSearch
            filterOption={filterOption}
            optionFilterProp="children"
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: '300px' }}
          >
            {numberFormatOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

      </Space>
    </div>
  );
};

export default SystemSettingsForm;
