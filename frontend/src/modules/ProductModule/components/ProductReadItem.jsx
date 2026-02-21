import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Divider, Descriptions, Tag, Image } from 'antd';
import { useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useCrudContext } from '@/context/crud';
import useLanguage from '@/locale/useLanguage';
import useMoney from '@/settings/useMoney';

const { Title, Text } = Typography;

export default function ProductReadItem({ config }) {
  const translate = useLanguage();
  const { moneyFormatter, currency_symbol } = useMoney();
  const { result: currentResult } = useSelector(selectCurrentItem);
  const { state } = useCrudContext();
  const { isReadBoxOpen } = state;

  const show = isReadBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };

  if (!currentResult) {
    return null;
  }

  return (
    <div style={show}>
      <Card 
        style={{ 
          margin: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'visible'
        }}
      >
        <Title level={4} style={{ 
          marginBottom: '24px', 
          color: '#262626',
          fontWeight: '500',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '12px'
        }}>
          Detalles del Producto
        </Title>
        
        {/* Imagen del producto */}
        {currentResult.image && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Image
              width={200}
              height={200}
              src={currentResult.image}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              style={{ borderRadius: '8px', border: '2px solid #f0f0f0' }}
            />
          </div>
        )}
        
        <Descriptions 
          column={1} 
          size="middle"
          labelStyle={{
            fontWeight: '600',
            color: '#595959',
            fontSize: '14px',
            minWidth: '120px'
          }}
          contentStyle={{
            color: '#262626',
            fontSize: '14px'
          }}
        >
          <Descriptions.Item label={translate('name')}>
            <Text strong style={{ fontSize: '16px', color: '#262626' }}>
              {currentResult.name || 'N/A'}
            </Text>
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('reference')}>
            <Text code style={{ fontSize: '14px', color: '#1890ff' }}>
              {currentResult.reference || 'N/A'}
            </Text>
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('product_category')}>
            {currentResult.category ? (
              <Tag color={currentResult.category.color} style={{ borderRadius: '12px' }}>
                {currentResult.category.name}
              </Tag>
            ) : (
              <Text style={{ color: '#999' }}>Sin categoría</Text>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('price')}>
            <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
              {moneyFormatter(currentResult.price)}
            </Text>
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('stock')}>
            <Tag color={currentResult.stock > 0 ? '#52c41a' : currentResult.stock === 0 ? '#faad14' : '#ff4d4f'}>
              {currentResult.stock || 0} unidades
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('status')}>
            <Tag color={currentResult.enabled ? '#52c41a' : '#ff4d4f'}>
              {currentResult.enabled ? 'Habilitado' : 'Deshabilitado'}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('description')}>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              minHeight: '80px',
              border: '1px solid #f0f0f0',
              color: '#595959'
            }}>
              {currentResult.description || 'Sin descripción'}
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Fecha de creación">
            <Text style={{ color: '#999' }}>
              {new Date(currentResult.createdAt).toLocaleDateString()}
            </Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Última actualización">
            <Text style={{ color: '#999' }}>
              {new Date(currentResult.updatedAt).toLocaleDateString()}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
