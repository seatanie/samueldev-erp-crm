import React, { useState } from 'react';
import { Button, Tag, Space, message, Tooltip } from 'antd';
import { 
  CloudOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { request } from '@/request';
import { BASE_URL } from '@/config/serverApiConfig';

const FactusStatus = ({ invoice, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return 'processing';
      case 'validated': return 'success';
      case 'sent': return 'processing';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'created': return 'Creada en FACTUS';
      case 'validated': return 'Validada';
      case 'sent': return 'Enviada a DIAN';
      case 'accepted': return 'Aceptada por DIAN';
      case 'rejected': return 'Rechazada por DIAN';
      case 'cancelled': return 'Anulada';
      default: return 'Sin estado';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created': return <ClockCircleOutlined />;
      case 'validated': return <CheckCircleOutlined />;
      case 'sent': return <CloudOutlined />;
      case 'accepted': return <CheckCircleOutlined />;
      case 'rejected': return <ExclamationCircleOutlined />;
      case 'cancelled': return <ExclamationCircleOutlined />;
      default: return <CloudOutlined />;
    }
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      // Usar el endpoint específico de FACTUS para descargar PDF
      const response = await fetch(`${BASE_URL}/api/invoice/downloadFactusPDF/${invoice._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).current?.token : ''}`,
        },
      });

      if (response.ok) {
        // Obtener el blob del PDF
        const blob = await response.blob();
        
        // Crear URL temporal para descargar
        const url = window.URL.createObjectURL(blob);
        
        // Crear elemento de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${invoice.number}-${invoice.year}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Mostrar mensaje apropiado según el tipo
        if (invoice.factus.factusId && invoice.factus.factusId.startsWith('SANDBOX-')) {
          message.success('PDF descargado (modo sandbox)');
        } else {
          message.success('PDF descargado exitosamente');
        }
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Error descargando PDF');
      }
    } catch (error) {
      console.error('Error descargando PDF:', error);
      message.error('Error descargando PDF');
    } finally {
      setLoading(false);
    }
  };

  if (!invoice.factus || !invoice.factus.factusId) {
    return (
      <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px', margin: '8px 0' }}>
        <Space>
          <CloudOutlined style={{ color: '#999' }} />
          <span style={{ color: '#999' }}>Esta factura no está en FACTUS</span>
        </Space>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '6px', margin: '8px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <CloudOutlined style={{ color: '#1890ff' }} />
          <strong>FACTUS - Facturación Electrónica</strong>
        </Space>
        
        <Space wrap>
          <Tag 
            color={getStatusColor(invoice.factus.status)} 
            icon={getStatusIcon(invoice.factus.status)}
          >
            {getStatusText(invoice.factus.status)}
          </Tag>
          
          {invoice.factus.factusId && (
            <Tooltip title="ID de FACTUS">
              <Tag color="blue">ID: {invoice.factus.factusId}</Tag>
            </Tooltip>
          )}
          
          {invoice.factus.factusId && invoice.factus.factusId.startsWith('SANDBOX-') && (
            <Tooltip title="Modo sandbox - simulación de FACTUS">
              <Tag color="orange">SANDBOX</Tag>
            </Tooltip>
          )}
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
            loading={loading}
            size="small"
          >
            Descargar PDF Oficial
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default FactusStatus;

