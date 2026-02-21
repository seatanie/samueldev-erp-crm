import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Descriptions, Tag } from 'antd';
import { useSelector } from 'react-redux';

import dayjs from 'dayjs';

import { useCrudContext } from '@/context/crud';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';

import useLanguage from '@/locale/useLanguage';
import { useDate, useMoney } from '@/settings';

const { Title, Text } = Typography;

export default function OrderReadItem({ config }) {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const translate = useLanguage();
  const { result: currentResult } = useSelector(selectCurrentItem);
  const { state } = useCrudContext();
  const { isReadBoxOpen } = state;
  const [listState, setListState] = useState([]);

  useEffect(() => {
    if (currentResult) {
      const list = [
        {
          key: 'orderNumber',
          label: translate('order_number'),
          value: currentResult.orderNumber || 'N/A'
        },
        {
          key: 'customer',
          label: translate('customer'),
          value: currentResult.customer?.name || 'N/A'
        },
        {
          key: 'product',
          label: translate('product'),
          value: currentResult.product?.name || 'N/A'
        },
        {
          key: 'quantity',
          label: translate('quantity'),
          value: currentResult.quantity || 'N/A'
        },
        {
          key: 'price',
          label: translate('price'),
          value: currentResult.price ? moneyFormatter({ amount: currentResult.price, currency_code: 'USD' }) : 'N/A'
        },
        {
          key: 'discount',
          label: translate('discount'),
          value: currentResult.discount ? moneyFormatter({ amount: currentResult.discount, currency_code: 'USD' }) : 'N/A'
        },
        {
          key: 'total',
          label: translate('total'),
          value: currentResult.total ? moneyFormatter({ amount: currentResult.total, currency_code: 'USD' }) : 'N/A'
        },
        {
          key: 'status',
          label: translate('status'),
          value: currentResult.status,
          render: (status) => {
            const statusConfig = {
              'pending': { color: 'orange', text: translate('pending') },
              'processing': { color: 'blue', text: translate('processing') },
              'shipped': { color: 'purple', text: translate('shipped') },
              'delivered': { color: 'green', text: translate('delivered') },
              'cancelled': { color: 'red', text: translate('cancelled') }
            };
            const config = statusConfig[status] || { color: 'default', text: status };
            return <Tag color={config.color}>{config.text}</Tag>;
          }
        },
        {
          key: 'phone',
          label: translate('phone'),
          value: currentResult.phone || 'N/A'
        },
        {
          key: 'state',
          label: translate('state'),
          value: currentResult.state || 'N/A'
        },
        {
          key: 'city',
          label: translate('city'),
          value: currentResult.city || 'N/A'
        },
        {
          key: 'address',
          label: translate('address'),
          value: currentResult.address || 'N/A'
        },
        {
          key: 'note',
          label: translate('note'),
          value: currentResult.note || 'N/A'
        },
        {
          key: 'createdAt',
          label: translate('created_at'),
          value: currentResult.createdAt ? dayjs(currentResult.createdAt).format(dateFormat) : 'N/A'
        }
      ];
      setListState(list);
    }
  }, [currentResult]);

  const show = isReadBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };

  return (
    <div style={show}>
      <Card 
        style={{ 
          margin: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Title level={4} style={{ 
          marginBottom: '24px', 
          color: '#262626',
          fontWeight: '500',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '12px'
        }}>
          {translate('order_details')}
        </Title>
        
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
          {listState.map((item) => (
            <Descriptions.Item 
              key={item.key} 
              label={item.label}
              style={{
                paddingBottom: '16px',
                borderBottom: '1px solid #fafafa'
              }}
            >
              {item.render ? item.render(item.value) : (
                <Text style={{ 
                  color: '#262626',
                  fontSize: '14px'
                }}>
                  {item.value}
                </Text>
              )}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    </div>
  );
}
