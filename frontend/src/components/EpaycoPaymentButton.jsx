import React, { useState } from 'react';
import { Button, Modal, message, Spin } from 'antd';
import { CreditCardOutlined, LoadingOutlined } from '@ant-design/icons';
import { useLanguage } from '@/locale/useLanguage';

const EpaycoPaymentButton = ({ invoice, onPaymentSuccess, style = {} }) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const translate = useLanguage();

  const handlePaymentClick = async () => {
    if (!invoice || invoice.paymentStatus === 'paid') {
      message.warning('Esta factura ya está pagada');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payment/epayco/direct-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          invoiceId: invoice._id,
          paymentMethod: 'card'
        })
      });

      const result = await response.json();

      if (result.success) {
        setPaymentUrl(result.result.paymentUrl);
        setModalVisible(true);
      } else {
        message.error(result.message || 'Error creando enlace de pago');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setModalVisible(false);
    message.success('Pago procesado exitosamente');
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  // No mostrar botón si la factura está pagada
  if (invoice.paymentStatus === 'paid') {
    return null;
  }

  return (
    <>
      <Button
        type="primary"
        icon={<CreditCardOutlined />}
        loading={loading}
        onClick={handlePaymentClick}
        style={{
          background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
          border: 'none',
          borderRadius: '6px',
          height: '40px',
          ...style
        }}
      >
        {loading ? (
          <>
            <Spin indicator={<LoadingOutlined style={{ color: 'white' }} spin />} />
            <span style={{ marginLeft: 8 }}>Procesando...</span>
          </>
        ) : (
          '💳 Pagar con ePayco'
        )}
      </Button>

      <Modal
        title="Pago en Línea - ePayco"
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ marginBottom: '20px' }}>
            <CreditCardOutlined style={{ fontSize: '48px', color: '#27ae60' }} />
            <h3>Procesar Pago</h3>
            <p>Serás redirigido a la plataforma de pagos segura de ePayco</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <strong>Factura:</strong> #{invoice.number}/{invoice.year}<br />
            <strong>Total:</strong> {invoice.currency} {invoice.total?.toFixed(2)}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Button
              type="primary"
              size="large"
              href={paymentUrl}
              target="_blank"
              style={{
                background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                border: 'none',
                borderRadius: '25px',
                height: '50px',
                fontSize: '16px',
                padding: '0 30px'
              }}
            >
              Continuar al Pago
            </Button>
          </div>

          <div style={{ fontSize: '12px', color: '#666' }}>
            <p>🔒 Tu información de pago está protegida por SSL</p>
            <p>💳 Aceptamos todas las tarjetas principales</p>
            <p>🏦 PSE (Pagos Seguros en Línea) disponible</p>
            <p>📧 Recibirás confirmación por email</p>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Nota:</strong> Después de completar el pago, serás redirigido de vuelta a nuestro sistema.
              El estado de la factura se actualizará automáticamente.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EpaycoPaymentButton;
