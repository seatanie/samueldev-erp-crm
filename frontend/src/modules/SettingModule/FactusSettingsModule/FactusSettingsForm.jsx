import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, Select, Button, Card, message, Divider, Space, Alert } from 'antd';
import { SettingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import useFetch from '@/hooks/useFetch';
import { request } from '@/request';

const { Option } = Select;

const FactusSettingsForm = () => {
  const translate = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configStatus, setConfigStatus] = useState(null);

  // Obtener configuraciones actuales
  const { result: settings, isLoading: settingsLoading } = useFetch(async () => {
    return await request.listAll({ 
      entity: 'setting', 
      options: { settingCategory: 'factus_config' } 
    });
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const settingsObj = {};
      settings.forEach(setting => {
        settingsObj[setting.settingKey] = setting.settingValue;
      });
      form.setFieldsValue(settingsObj);
    }
  }, [settings, form]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
        settingKey: key,
        settingValue: value,
        settingCategory: 'factus_config',
        valueType: typeof value === 'boolean' ? 'boolean' : 'string'
      }));

      // Actualizar cada configuración
      for (const setting of settingsToUpdate) {
        await request.create({ entity: 'setting', jsonData: setting });
      }

      message.success('Configuración de FACTUS guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      message.error('Error guardando configuración de FACTUS');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConfigStatus(null);
    
    try {
      const response = await request.get({ entity: 'factus/validate-config' });
      
      if (response.success) {
        setConfigStatus('success');
        message.success('Conexión con FACTUS exitosa');
      } else {
        setConfigStatus('error');
        message.error('Error en la conexión con FACTUS');
      }
    } catch (error) {
      console.error('Error probando conexión:', error);
      setConfigStatus('error');
      message.error('Error probando conexión con FACTUS');
    } finally {
      setTesting(false);
    }
  };

  const getNumberingRanges = async () => {
    try {
      const response = await request.get({ entity: 'factus/numbering-ranges' });
      if (response.success) {
        message.success('Rangos de numeración obtenidos exitosamente');
        console.log('Rangos disponibles:', response.result);
      } else {
        message.error('Error obteniendo rangos de numeración');
      }
    } catch (error) {
      console.error('Error obteniendo rangos:', error);
      message.error('Error obteniendo rangos de numeración');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <SettingOutlined />
            Configuración de FACTUS - Facturación Electrónica Colombia
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleTestConnection}
            loading={testing}
          >
            Probar Conexión
          </Button>
        }
      >
        {configStatus && (
          <Alert
            message={configStatus === 'success' ? 'Conexión Exitosa' : 'Error de Conexión'}
            description={
              configStatus === 'success' 
                ? 'La configuración de FACTUS es válida y la conexión es exitosa.'
                : 'Verifica las credenciales y configuración de FACTUS.'
            }
            type={configStatus === 'success' ? 'success' : 'error'}
            icon={configStatus === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          loading={settingsLoading}
        >
          <Card size="small" title="Configuración General" style={{ marginBottom: 16 }}>
            <Form.Item
              name="factus_enabled"
              label="Habilitar FACTUS"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="factus_environment"
              label="Ambiente"
              rules={[{ required: true, message: 'Selecciona el ambiente' }]}
            >
              <Select>
                <Option value="sandbox">Sandbox (Pruebas)</Option>
                <Option value="production">Producción</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="factus_base_url"
              label="URL Base de la API"
              rules={[{ required: true, message: 'Ingresa la URL base' }]}
            >
              <Input placeholder="https://api-sandbox.factus.com.co" />
            </Form.Item>
          </Card>

          <Card size="small" title="Credenciales de Acceso" style={{ marginBottom: 16 }}>
            <Form.Item
              name="factus_client_id"
              label="Client ID"
              rules={[{ required: true, message: 'Ingresa el Client ID' }]}
            >
              <Input placeholder="9fdb08ab-79ea-4d40-b56d-4ed4ed2c5b09" />
            </Form.Item>

            <Form.Item
              name="factus_client_secret"
              label="Client Secret"
              rules={[{ required: true, message: 'Ingresa el Client Secret' }]}
            >
              <Input.Password placeholder="argWsddc97T4sfq8K8mFLFwl5uh9Jfy85FZa61As" />
            </Form.Item>

            <Form.Item
              name="factus_username"
              label="Usuario"
              rules={[{ required: true, message: 'Ingresa el usuario' }]}
            >
              <Input placeholder="sandbox@factus.com.co" />
            </Form.Item>

            <Form.Item
              name="factus_password"
              label="Contraseña"
              rules={[{ required: true, message: 'Ingresa la contraseña' }]}
            >
              <Input.Password placeholder="sandbox2024%" />
            </Form.Item>
          </Card>

          <Card size="small" title="Configuración de Facturación" style={{ marginBottom: 16 }}>
            <Form.Item
              name="factus_series"
              label="Serie de Facturación"
              rules={[{ required: true, message: 'Ingresa la serie' }]}
            >
              <Input placeholder="A" />
            </Form.Item>

            <Form.Item
              name="factus_regime"
              label="Régimen Tributario"
              rules={[{ required: true, message: 'Selecciona el régimen' }]}
            >
              <Select>
                <Option value="Responsable de IVA">Responsable de IVA</Option>
                <Option value="No responsable de IVA">No responsable de IVA</Option>
                <Option value="Régimen Simple">Régimen Simple</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="factus_auto_send"
              label="Envío Automático a DIAN"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Card>

          <Divider />

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Guardar Configuración
            </Button>
            
            <Button
              onClick={getNumberingRanges}
              size="large"
            >
              Obtener Rangos de Numeración
            </Button>
          </Space>
        </Form>
      </Card>

      <Card 
        title="Información de Configuración" 
        style={{ marginTop: 16 }}
        size="small"
      >
        <Alert
          message="Credenciales de Prueba"
          description={
            <div>
              <p><strong>URL Sandbox:</strong> https://api-sandbox.factus.com.co</p>
              <p><strong>Usuario:</strong> sandbox@factus.com.co</p>
              <p><strong>Contraseña:</strong> sandbox2024%</p>
              <p><strong>Client ID:</strong> 9fdb08ab-79ea-4d40-b56d-4ed4ed2c5b09</p>
              <p><strong>Client Secret:</strong> argWsddc97T4sfq8K8mFLFwl5uh9Jfy85FZa61As</p>
            </div>
          }
          type="info"
          showIcon
        />
        
        <Alert
          message="Flujo de Facturación Electrónica"
          description={
            <div>
              <p><strong>Paso 1:</strong> Crear factura en FACTUS</p>
              <p><strong>Paso 2:</strong> Validar factura en FACTUS</p>
              <p><strong>Paso 3:</strong> FACTUS envía automáticamente a DIAN</p>
              <p><strong>Paso 4:</strong> DIAN valida y responde con estado</p>
              <p><strong>Paso 5:</strong> Descargar documentos oficiales</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>
    </div>
  );
};

export default FactusSettingsForm;
