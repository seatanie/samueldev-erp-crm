import React, { useState } from 'react';
import { Button, Space, Tag, Modal, message, Tooltip } from 'antd';
import { 
  SendOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  DownloadOutlined,
  StopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { request } from '@/request';

const FactusInvoiceStatus = ({ invoice, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'processing';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'created': return 'Creada en FACTUS';
      case 'validated': return 'Validada';
      case 'sent': return 'Enviada a DIAN';
      case 'accepted': return 'Aceptada por DIAN';
      case 'rejected': return 'Rechazada por DIAN';
      case 'cancelled': return 'Anulada';
      default: return 'Desconocido';
    }
  };

  const handleCreateInFactus = async () => {
    setLoading(true);
    try {
      const response = await request.post({ entity: `factus/create/${invoice._id}`, jsonData: {} });
      
      if (response.success) {
        message.success('Factura creada exitosamente en FACTUS');
        onStatusUpdate && onStatusUpdate();
      } else {
        message.error(response.message || 'Error creando factura en FACTUS');
      }
    } catch (error) {
      console.error('Error creando en FACTUS:', error);
      message.error('Error creando factura en FACTUS');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateInvoice = async () => {
    setLoading(true);
    try {
      const response = await request.post({ entity: `factus/validate/${invoice._id}`, jsonData: {} });
      
      if (response.success) {
        message.success('Factura validada exitosamente en FACTUS');
        onStatusUpdate && onStatusUpdate();
      } else {
        message.error(response.message || 'Error validando factura en FACTUS');
      }
    } catch (error) {
      console.error('Error validando en FACTUS:', error);
      message.error('Error validando factura en FACTUS');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const response = await request.get({ entity: `factus/status/${invoice._id}` });
      
      if (response.success) {
        message.success('Estado actualizado exitosamente');
        onStatusUpdate && onStatusUpdate();
      } else {
        message.error(response.message || 'Error obteniendo estado');
      }
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      message.error('Error obteniendo estado de FACTUS');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await request.get({ entity: `factus/download/pdf/${invoice._id}` });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${invoice.number}-${invoice.year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error descargando PDF:', error);
      message.error('Error descargando PDF de FACTUS');
    }
  };

  const handleDownloadXML = async () => {
    try {
      const response = await request.get({ entity: `factus/download/xml/${invoice._id}` });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${invoice.number}-${invoice.year}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('XML descargado exitosamente');
    } catch (error) {
      console.error('Error descargando XML:', error);
      message.error('Error descargando XML de FACTUS');
    }
  };

  const handleCancelInvoice = () => {
    Modal.confirm({
      title: 'Anular Factura en FACTUS',
      content: '¿Estás seguro de que quieres anular esta factura en FACTUS? Esta acción no se puede deshacer.',
      okText: 'Anular',
      cancelText: 'Cancelar',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await request.post({ 
            entity: `factus/cancel/${invoice._id}`, 
            jsonData: { reason: 'Anulación solicitada por el usuario' }
          });
          
          if (response.success) {
            message.success('Factura anulada exitosamente en FACTUS');
            onStatusUpdate && onStatusUpdate();
          } else {
            message.error(response.message || 'Error anulando factura');
          }
        } catch (error) {
          console.error('Error anulando factura:', error);
          message.error('Error anulando factura en FACTUS');
        }
      }
    });
  };

  const showFactusDetails = () => {
    Modal.info({
      title: 'Detalles de FACTUS',
      content: (
        <div>
          <p><strong>ID FACTUS:</strong> {invoice.factus?.factusId || 'N/A'}</p>
          <p><strong>CUF:</strong> {invoice.factus?.cufe || 'N/A'}</p>
          <p><strong>Estado:</strong> {getStatusText(invoice.factus?.status)}</p>
          <p><strong>Enviada:</strong> {invoice.factus?.sentAt ? new Date(invoice.factus.sentAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Aceptada:</strong> {invoice.factus?.acceptedAt ? new Date(invoice.factus.acceptedAt).toLocaleString() : 'N/A'}</p>
          {invoice.factus?.rejectionReason && (
            <p><strong>Motivo de Rechazo:</strong> {invoice.factus.rejectionReason}</p>
          )}
          {invoice.factus?.cancellationReason && (
            <p><strong>Motivo de Anulación:</strong> {invoice.factus.cancellationReason}</p>
          )}
        </div>
      ),
      width: 500
    });
  };

  if (!invoice.factus) {
    return (
      <Space>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleCreateInFactus}
          loading={loading}
        >
          Crear en FACTUS
        </Button>
      </Space>
    );
  }

  return (
    <Space wrap>
      <Tag color={getStatusColor(invoice.factus.status)}>
        {getStatusText(invoice.factus.status)}
      </Tag>
      
      <Tooltip title="Ver detalles de FACTUS">
        <Button
          size="small"
          onClick={showFactusDetails}
        >
          Detalles
        </Button>
      </Tooltip>

      <Tooltip title="Actualizar estado">
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={handleCheckStatus}
          loading={loading}
        />
      </Tooltip>

      {invoice.factus.pdfUrl && (
        <Tooltip title="Descargar PDF">
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
          />
        </Tooltip>
      )}

      {invoice.factus.xmlUrl && (
        <Tooltip title="Descargar XML">
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownloadXML}
          />
        </Tooltip>
      )}

      {invoice.factus.status === 'sent' && (
        <Tooltip title="Anular factura">
          <Button
            size="small"
            danger
            icon={<StopOutlined />}
            onClick={handleCancelInvoice}
          />
        </Tooltip>
      )}

      {invoice.factus.status === 'created' && (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={handleValidateInvoice}
          loading={loading}
        >
          Validar
        </Button>
      )}

      {!invoice.factus.factusId && (
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          onClick={handleCreateInFactus}
          loading={loading}
        >
          Crear en FACTUS
        </Button>
      )}
    </Space>
  );
};

export default FactusInvoiceStatus;
