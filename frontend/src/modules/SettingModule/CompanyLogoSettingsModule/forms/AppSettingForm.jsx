import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Row, Col, message, notification, Upload, Image } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { settingsAction } from '@/redux/settings/actions';

const AppSettingForm = () => {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.settings);
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState('');
  const lastUpdateRef = useRef(null);

  // Cargar configuraciones existentes
  useEffect(() => {
    if (list && list.length > 0) {
      const companyLogo = list.find(item => item.settingKey === 'company_logo')?.settingValue || '';
      
      setCurrentLogo(companyLogo);
      if (companyLogo) {
        // Construir la URL completa para el logo
        const logoUrl = companyLogo.startsWith('http') 
          ? companyLogo 
          : `http://localhost:8889/${companyLogo}`;
        setLogoPreview(logoUrl);
      }
    }
  }, [list]);

  // Función para manejar la selección de archivo
  const handleFileSelect = (file) => {
    // Validar tipo de archivo
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo se permiten archivos de imagen!');
      return false;
    }

    // Validar tamaño (máximo 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('La imagen debe ser menor a 5MB!');
      return false;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
      setLogoFile(file);
    };
    reader.readAsDataURL(file);

    return false; // Prevenir upload automático
  };

  // Función para subir el logo
  const handleUploadLogo = async () => {
    if (!logoFile) {
      message.error('Por favor selecciona una imagen primero');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', logoFile);

      const result = await dispatch(settingsAction.uploadCompanyLogo(formData));
      
      if (result.success) {
        // Actualizar el estado local
        const logoPath = result.result.settingValue;
        setCurrentLogo(logoPath);
        
        // Construir la URL completa para el logo
        const logoUrl = logoPath.startsWith('http') 
          ? logoPath 
          : `http://localhost:8889/${logoPath}`;
        setLogoPreview(logoUrl);
        setLogoFile(null);
        
        // Mostrar notificación de éxito
        const key = `logo-${Date.now()}`;
        lastUpdateRef.current = key;
        notification.success({
          key,
          message: 'Logo actualizado',
          description: 'El logo de la empresa se ha actualizado exitosamente',
          placement: 'topRight',
          duration: 4
        });

        // Recargar la lista de configuraciones
        dispatch(settingsAction.list({ entity: 'setting' }));
        
      } else {
        message.error(result.message || 'Error al subir el logo');
      }
    } catch (error) {
      console.error('❌ Error subiendo logo:', error);
      message.error('Error al subir el logo: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar el logo
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Configuración del Logo */}
        <Col xs={24} lg={24}>
          <Card 
            title="Logo de la Empresa" 
            extra={
              <Button 
                type="primary" 
                icon={<UploadOutlined />}
                onClick={handleUploadLogo}
                loading={loading}
                disabled={!logoFile}
              >
                Subir Logo
              </Button>
            }
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {/* Preview del logo */}
              {logoPreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Image
                    src={logoPreview}
                    alt="Logo de la empresa"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      border: '2px solid #d9d9d9',
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }}
                    preview={{
                      mask: <EyeOutlined style={{ fontSize: '20px' }} />
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveLogo}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#ff4d4f',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    border: '2px dashed #d9d9d9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: '#999',
                    margin: '0 auto'
                  }}
                >
                  <UploadOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <span>Sin logo</span>
                </div>
              )}
            </div>

            {/* Selector de archivo */}
            <Upload
              accept="image/*"
              beforeUpload={handleFileSelect}
              showUploadList={false}
              disabled={loading}
            >
              <Button 
                icon={<UploadOutlined />} 
                block
                disabled={loading}
              >
                Seleccionar Imagen
              </Button>
            </Upload>

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
              Formatos: JPG, PNG, GIF • Máximo: 5MB
            </div>

            {/* Información del logo actual */}
            {currentLogo && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Logo actual:
                </div>
                <div style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                  {currentLogo}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div style={{ marginTop: '20px', padding: '16px', background: '#e6f7ff', borderRadius: '6px', border: '1px solid #91d5ff' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                Información Importante
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#1890ff' }}>
                <li>El logo se mostrará en las facturas PDF</li>
                <li>Se recomienda usar imágenes PNG con fondo transparente</li>
                <li>El tamaño óptimo es 200x200 píxeles</li>
                <li>Los cambios se aplican inmediatamente</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AppSettingForm;
