import React, { useState, useEffect } from 'react';
import { 
  Collapse, 
  Row, 
  Col, 
  ColorPicker, 
  Select, 
  InputNumber, 
  Upload, 
  Button, 
  Divider, 
  Space,
  Typography,
  Card,
  Switch,
  Input
} from 'antd';
import { 
  SettingOutlined, 
  EditOutlined, 
  PictureOutlined, 
  EyeOutlined,
  SaveOutlined,
  ReloadOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  FileImageOutlined,
  FormOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;
const { TextArea } = Input;

const InvoiceCustomizationPanel = ({ 
  invoice, 
  onSaveTemplate, 
  onResetTemplate,
  isVisible = true 
}) => {
  const [template, setTemplate] = useState({
    primaryColor: '#52008c',
    secondaryColor: '#222',
    backgroundColor: '#ffffff',
    tableHeaderColor: '#52008c',
    tableRowColor: '#fcfeff',
    fontFamily: 'sans-serif',
    fontSize: 12,
    headerFontSize: 32,
    customLogo: '',
    logoPosition: 'left',
    logoSize: 200,
    logoAlignment: 'left',
    customFields: [],
    customFooter: '',
    borderColor: '#c2e0f2',
    textColor: '#5d6975'
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (invoice?.invoiceTemplate) {
      setTemplate({ ...template, ...invoice.invoiceTemplate });
    }
  }, [invoice]);

  const handleColorChange = (color, key) => {
    setTemplate(prev => ({ ...prev, [key]: color.toHexString() }));
  };

  const handleInputChange = (value, key) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (info) => {
    if (info.file.status === 'done') {
      try {
        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append('logo', info.file.originFileObj);
        
        // Obtener el token de autenticación
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          console.error('No se encontró token de autenticación');
          return;
        }
        
        // Subir logo al servidor
        const response = await fetch('/api/logos/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'x-auth-token': token
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.result) {
            setTemplate(prev => ({ ...prev, customLogo: result.result.url }));
            console.log('Logo subido exitosamente:', result.result.url);
          } else {
            console.error('Error en la respuesta del servidor:', result.message);
          }
        } else {
          const errorData = await response.json();
          console.error('Error al subir logo:', errorData.message || response.statusText);
        }
      } catch (error) {
        console.error('Error al subir logo:', error);
      }
    }
  };

  const handleSaveTemplate = () => {
    onSaveTemplate(template);
  };

  const handleResetTemplate = () => {
    setTemplate({
      primaryColor: '#52008c',
      secondaryColor: '#222',
      backgroundColor: '#ffffff',
      tableHeaderColor: '#52008c',
      tableRowColor: '#fcfeff',
      fontFamily: 'sans-serif',
      fontSize: 12,
      headerFontSize: 32,
      customLogo: '',
      logoPosition: 'left',
      logoSize: 200,
      logoAlignment: 'left',
      customFields: [],
      customFooter: '',
      borderColor: '#c2e0f2',
      textColor: '#5d6975'
    });
    onResetTemplate();
  };

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'sans-serif', label: 'Sans Serif' },
    { value: 'serif', label: 'Serif' }
  ];

  const positionOptions = [
    { value: 'left', label: 'Izquierda' },
    { value: 'right', label: 'Derecha' },
    { value: 'center', label: 'Centro' }
  ];

  if (!isVisible) return null;

  return (
    <Collapse 
      defaultActiveKey={['colors', 'typography', 'logo', 'preview']}
      style={{ marginBottom: 16 }}
    >
      <Panel 
        header={
          <Space>
            <SettingOutlined style={{ color: template.primaryColor }} />
            <span>Personalizar Factura</span>
          </Space>
        } 
        key="customization"
      >
        <Row gutter={[16, 16]}>
          {/* COLUMNA 1: Colores */}
          <Col span={12}>
            <Card title={<Space><BgColorsOutlined />Colores</Space>} size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Color Principal:</Text>
                  <ColorPicker
                    value={template.primaryColor}
                    onChange={(color) => handleColorChange(color, 'primaryColor')}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div>
                  <Text>Color Secundario:</Text>
                  <ColorPicker
                    value={template.secondaryColor}
                    onChange={(color) => handleColorChange(color, 'secondaryColor')}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div>
                  <Text>Color de Fondo:</Text>
                  <ColorPicker
                    value={template.backgroundColor}
                    onChange={(color) => handleColorChange(color, 'backgroundColor')}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div>
                  <Text>Color de Tabla:</Text>
                  <ColorPicker
                    value={template.tableHeaderColor}
                    onChange={(color) => handleColorChange(color, 'tableHeaderColor')}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div>
                  <Text>Color de Filas:</Text>
                  <ColorPicker
                    value={template.tableRowColor}
                    onChange={(color) => handleColorChange(color, 'tableRowColor')}
                    style={{ marginLeft: 8 }}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          {/* COLUMNA 2: Tipografía */}
          <Col span={12}>
            <Card title={<Space><FontSizeOutlined />Tipografía</Space>} size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Tipo de Letra:</Text>
                  <Select
                    value={template.fontFamily}
                    options={fontOptions}
                    onChange={(value) => handleInputChange(value, 'fontFamily')}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                <div>
                  <Text>Tamaño de Letra:</Text>
                  <InputNumber
                    value={template.fontSize}
                    onChange={(value) => handleInputChange(value, 'fontSize')}
                    min={8}
                    max={20}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                <div>
                  <Text>Tamaño de Título:</Text>
                  <InputNumber
                    value={template.headerFontSize}
                    onChange={(value) => handleInputChange(value, 'headerFontSize')}
                    min={20}
                    max={50}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          {/* COLUMNA 3: Logo y Layout */}
          <Col span={12}>
            <Card title={<Space><FileImageOutlined />Logo y Layout</Space>} size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Logo Personalizado:</Text>
                  {template.customLogo && (
                    <div style={{ marginBottom: 8 }}>
                      <img 
                        src={template.customLogo} 
                        alt="Logo actual" 
                        style={{ 
                          maxWidth: '100px', 
                          maxHeight: '60px', 
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  )}
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    onChange={handleLogoUpload}
                    style={{ marginTop: 4 }}
                  >
                    <Button icon={<PictureOutlined />} size="small">
                      {template.customLogo ? 'Cambiar Logo' : 'Subir Logo'}
                    </Button>
                  </Upload>
                </div>
                <div>
                  <Text>Posición del Logo:</Text>
                  <Select
                    value={template.logoPosition}
                    options={positionOptions}
                    onChange={(value) => handleInputChange(value, 'logoPosition')}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                <div>
                  <Text>Tamaño del Logo:</Text>
                  <InputNumber
                    value={template.logoSize}
                    onChange={(value) => handleInputChange(value, 'logoSize')}
                    min={100}
                    max={400}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          {/* COLUMNA 4: Campos Personalizados */}
          <Col span={12}>
            <Card title={<Space><FormOutlined />Campos Personalizados</Space>} size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Footer Personalizado:</Text>
                  <TextArea
                    value={template.customFooter}
                    onChange={(e) => handleInputChange(e.target.value, 'customFooter')}
                    placeholder="Ingresa tu mensaje personalizado..."
                    rows={3}
                    style={{ marginTop: 4 }}
                  />
                </div>
                <div>
                  <Text>Color de Bordes:</Text>
                  <ColorPicker
                    value={template.borderColor}
                    onChange={(color) => handleColorChange(color, 'borderColor')}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div>
                  <Text>Color de Texto:</Text>
                  <ColorPicker
                    value={template.textColor}
                    onChange={(color) => handleColorChange(color, 'textColor')}
                    style={{ marginLeft: 8 }}
                  />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* VISTA PREVIA */}
        <Card 
          title={
            <Space>
              <EyeOutlined />
              <span>Vista Previa</span>
              <Switch 
                checked={showPreview}
                onChange={setShowPreview}
                size="small"
              />
            </Space>
          }
          size="small"
        >
          {showPreview && (
            <div 
              className="invoice-preview"
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '20px',
                background: template.backgroundColor,
                fontFamily: template.fontFamily,
                fontSize: `${template.fontSize}px`,
                color: template.secondaryColor
              }}
            >
                             <div style={{ textAlign: template.logoPosition }}>
                 {template.customLogo ? (
                   <img 
                     src={template.customLogo}
                     alt="Logo personalizado"
                     style={{
                       width: `${template.logoSize}px`,
                       height: 'auto',
                       maxHeight: '60px',
                       margin: '0 auto',
                       display: 'block',
                       objectFit: 'contain'
                     }}
                   />
                 ) : (
                   <div 
                     style={{
                       width: `${template.logoSize}px`,
                       height: '60px',
                       background: template.primaryColor,
                       margin: '0 auto',
                       borderRadius: '4px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'white',
                       fontSize: '12px'
                     }}
                   >
                     LOGO EMPRESA
                   </div>
                 )}
               </div>
              
              <h1 style={{ 
                color: template.primaryColor, 
                fontSize: `${template.headerFontSize}px`,
                textAlign: 'center',
                margin: '20px 0'
              }}>
                FACTURA
              </h1>

              <div style={{ 
                background: template.tableHeaderColor, 
                color: 'white',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '10px'
              }}>
                <strong>INFORMACIÓN DE LA FACTURA</strong>
              </div>

              <div style={{ 
                background: template.tableRowColor,
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '10px'
              }}>
                <strong>Cliente:</strong> Cliente Ejemplo
              </div>

              {template.customFooter && (
                <div style={{ 
                  marginTop: '20px',
                  padding: '10px',
                  borderTop: `1px solid ${template.borderColor}`,
                  color: template.textColor,
                  textAlign: 'center'
                }}>
                  {template.customFooter}
                </div>
              )}
            </div>
          )}
        </Card>

        <Divider />

        {/* BOTONES DE ACCIÓN */}
        <Row justify="center" gutter={16}>
          <Col>
                          <Button 
                type="primary" 
                icon={<SaveOutlined />}
                onClick={handleSaveTemplate}
                size="large"
              >
                Guardar Plantilla
              </Button>
          </Col>
          <Col>
                          <Button 
                icon={<ReloadOutlined />}
                onClick={handleResetTemplate}
                size="large"
              >
                Restablecer
              </Button>
          </Col>
        </Row>
      </Panel>
    </Collapse>
  );
};

export default InvoiceCustomizationPanel;
