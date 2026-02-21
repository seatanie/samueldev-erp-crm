import { Button, Form, message, Space, Typography, Input, Card, Divider } from 'antd';
import { FileTextOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { selectSettings } from '@/redux/settings/selectors';
import { settingsAction } from '@/redux/settings/actions';
import useLanguage from '@/locale/useLanguage';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function PDFSettingsForm() {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const { result, isLoading, isSuccess } = useSelector(selectSettings);
  const lastUpdateRef = useRef(null);
  const [form] = Form.useForm();
  
  // Obtener valores actuales de la configuración
  const getCurrentValue = (key) => {
    // result.pdf_settings contiene las configuraciones de PDF
    if (result?.pdf_settings && result.pdf_settings[key]) {
      return result.pdf_settings[key];
    }
    return '';
  };

  // Efecto para mostrar mensajes de éxito/error solo cuando se actualiza PDF
  useEffect(() => {
    if (isSuccess && !isLoading && lastUpdateRef.current === 'pdf_settings') {
      message.success('Configuración de PDF actualizada exitosamente');
      lastUpdateRef.current = null; // Reset para evitar mensajes duplicados
    }
  }, [isSuccess, isLoading]);

  // Efecto para establecer valores iniciales cuando se cargan los datos
  useEffect(() => {
    if (result?.pdf_settings) {
      const initialValues = {
        pdf_invoice_footer: getCurrentValue('pdf_invoice_footer'),
        pdf_quote_footer: getCurrentValue('pdf_quote_footer'),
        pdf_offer_footer: getCurrentValue('pdf_offer_footer'),
        pdf_payment_footer: getCurrentValue('pdf_payment_footer')
      };
      form.setFieldsValue(initialValues);
    }
  }, [result, form]);

  const onFinish = (values) => {
    try {
      // Marcar que estamos actualizando configuraciones de PDF
      lastUpdateRef.current = 'pdf_settings';
      
      // Preparar las configuraciones en el formato esperado por updateMany
      const settings = [];
      
      if (values.pdf_invoice_footer !== undefined && values.pdf_invoice_footer !== '') {
        settings.push({ settingKey: 'pdf_invoice_footer', settingValue: values.pdf_invoice_footer });
      }
      if (values.pdf_quote_footer !== undefined && values.pdf_quote_footer !== '') {
        settings.push({ settingKey: 'pdf_quote_footer', settingValue: values.pdf_quote_footer });
      }
      if (values.pdf_offer_footer !== undefined && values.pdf_offer_footer !== '') {
        settings.push({ settingKey: 'pdf_offer_footer', settingValue: values.pdf_offer_footer });
      }
      if (values.pdf_payment_footer !== undefined && values.pdf_payment_footer !== '') {
        settings.push({ settingKey: 'pdf_payment_footer', settingValue: values.pdf_payment_footer });
      }
      
      if (settings.length > 0) {
        // Usar la acción de Redux para actualizar las configuraciones
        dispatch(settingsAction.updateMany({ 
          entity: 'setting', 
          jsonData: { settings } 
        }));
      } else {
        message.warning('No hay configuraciones para actualizar');
      }
    } catch (error) {
      console.error('Error al guardar configuración de PDF:', error);
      message.error('Error al guardar la configuración');
    }
  };

  // Función para limpiar los campos del formulario
  const handleClearFields = () => {
    form.resetFields();
    message.info('Campos limpiados. Los valores originales se han restaurado.');
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px'
    }}>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: '24px' }}
      >
        {/* Configuración de Factura */}
        <Card 
          title={
            <span style={{ color: '#262626', fontWeight: '600' }}>
              Pie de Página del PDF de Factura
            </span>
          } 
          size="default" 
          style={{ 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '6px',
            border: '1px solid #e8e8e8'
          }}
          styles={{
            header: {
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #d9d9d9',
              borderRadius: '6px 6px 0 0'
            }
          }}
        >
          <Form.Item
            name="pdf_invoice_footer"
            label={
              <span style={{ fontWeight: '500', color: '#262626' }}>
                Texto del pie de página para facturas
              </span>
            }
            rules={[
              {
                max: 500,
                message: 'El texto no puede exceder 500 caracteres'
              }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ingresa tu mensaje personalizado para el pie de página de las facturas..."
              showCount
              maxLength={500}
              style={{
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>
            Este texto aparecerá en el pie de página de todas las facturas PDF
          </Text>
        </Card>

        {/* Configuración de Cotización */}
        <Card 
          title={
            <span style={{ color: '#262626', fontWeight: '600' }}>
              Pie de Página del PDF de Cotización
            </span>
          } 
          size="default" 
          style={{ 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '6px',
            border: '1px solid #e8e8e8'
          }}
          styles={{
            header: {
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #d9d9d9',
              borderRadius: '6px 6px 0 0'
            }
          }}
        >
          <Form.Item
            name="pdf_quote_footer"
            label={
              <span style={{ fontWeight: '500', color: '#262626' }}>
                Texto del pie de página para cotizaciones
              </span>
            }
            rules={[
              {
                max: 500,
                message: 'El texto no puede exceder 500 caracteres'
              }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ingresa tu mensaje personalizado para el pie de página de las cotizaciones..."
              showCount
              maxLength={500}
              style={{
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>
            Este texto aparecerá en el pie de página de todas las cotizaciones PDF
          </Text>
        </Card>

        {/* Configuración de Oferta */}
        <Card 
          title={
            <span style={{ color: '#262626', fontWeight: '600' }}>
              Pie de Página del PDF de Oferta
            </span>
          } 
          size="default" 
          style={{ 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '6px',
            border: '1px solid #e8e8e8'
          }}
          styles={{
            header: {
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #d9d9d9',
              borderRadius: '6px 6px 0 0'
            }
          }}
        >
          <Form.Item
            name="pdf_offer_footer"
            label={
              <span style={{ fontWeight: '500', color: '#262626' }}>
                Texto del pie de página para ofertas
              </span>
            }
            rules={[
              {
                max: 500,
                message: 'El texto no puede exceder 500 caracteres'
              }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ingresa tu mensaje personalizado para el pie de página de las ofertas..."
              showCount
              maxLength={500}
              style={{
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>
            Este texto aparecerá en el pie de página de todas las ofertas PDF
          </Text>
        </Card>

        {/* Configuración de Pago */}
        <Card 
          title={
            <span style={{ color: '#262626', fontWeight: '600' }}>
              Pie de Página del PDF de Pago
            </span>
          } 
          size="default" 
          style={{ 
            marginBottom: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '6px',
            border: '1px solid #e8e8e8'
          }}
          styles={{
            header: {
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #d9d9d9',
              borderRadius: '6px 6px 0 0'
            }
          }}
        >
          <Form.Item
            name="pdf_payment_footer"
            label={
              <span style={{ fontWeight: '500', color: '#262626' }}>
                Texto del pie de página para recibos de pago
              </span>
            }
            rules={[
              {
                max: 500,
                message: 'El texto no puede exceder 500 caracteres'
              }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ingresa tu mensaje personalizado para el pie de página de los recibos de pago..."
              showCount
              maxLength={500}
              style={{
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>
            Este texto aparecerá en el pie de página de todos los recibos de pago PDF
          </Text>
        </Card>

        <Divider />

        {/* Botones de acción */}
        <Form.Item style={{ textAlign: 'center', marginTop: '32px' }}>
          <Space size="large">
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={isLoading}
              size="large"
              style={{
                height: '40px',
                padding: '0 24px',
                fontSize: '14px',
                borderRadius: '4px'
              }}
            >
              Guardar Configuración
            </Button>
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClearFields}
              size="large"
              style={{
                height: '40px',
                padding: '0 24px',
                fontSize: '14px',
                borderRadius: '4px'
              }}
            >
              Limpiar Campos
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
