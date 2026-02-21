import { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag } from 'antd';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useCrudContext } from '@/context/crud';
import { selectCurrentItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';

const { Title, Text } = Typography;

export default function AdminReadItem() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { result: currentResult } = useSelector(selectCurrentItem);
  const { state } = useCrudContext();
  const { isReadBoxOpen } = state;
  const [listState, setListState] = useState([]);

  const roleColors = {
    owner: 'gold',
    admin: 'blue',
    manager: 'green',
    employee: 'orange',
    create_only: 'purple',
    read_only: 'gray'
  };

  const roleLabels = {
    owner: 'Account Owner',
    admin: 'Super Admin',
    manager: 'Manager',
    employee: 'Employee',
    create_only: 'Create Only',
    read_only: 'Read Only'
  };

  useEffect(() => {
    if (currentResult) {
      const list = [
        { key: 'name', label: translate('name'), value: currentResult.name || 'N/A' },
        { key: 'surname', label: translate('surname'), value: currentResult.surname || 'N/A' },
        { key: 'email', label: translate('email'), value: currentResult.email || 'N/A' },
        { 
          key: 'role', 
          label: translate('role'), 
          value: currentResult.role,
          render: (role) => {
            const color = roleColors[role] || 'default';
            const label = roleLabels[role] || role;
            return <Tag color={color}>{label}</Tag>;
          }
        },
        { key: 'department', label: translate('department'), value: currentResult.department || 'Main' },
        { 
          key: 'enabled', 
          label: translate('enabled'), 
          value: currentResult.enabled,
          render: (enabled) => (
            <Tag color={enabled ? 'green' : 'red'}>
              {enabled ? translate('enabled') : translate('disabled')}
            </Tag>
          )
        },
        { key: 'phone', label: translate('phone'), value: currentResult.phone || 'N/A' },
        { key: 'address', label: translate('address'), value: currentResult.address || 'N/A' },
        { key: 'createdAt', label: translate('created_at'), value: currentResult.createdAt ? dayjs(currentResult.createdAt).format(dateFormat) : 'N/A' }
      ];
      setListState(list);
    }
  }, [currentResult]);

  const show = isReadBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };

  return (
    <div style={show}>
      <Card style={{ margin: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <Title level={4} style={{ marginBottom: '24px', color: '#262626', fontWeight: '500', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
          {translate('admin_details')}
        </Title>
        <Descriptions column={1} size="middle" labelStyle={{ fontWeight: '600', color: '#595959', fontSize: '14px', minWidth: '120px' }} contentStyle={{ color: '#262626', fontSize: '14px' }}>
          {listState.map((item) => (
            <Descriptions.Item key={item.key} label={item.label} style={{ paddingBottom: '16px', borderBottom: '1px solid #fafafa' }}>
              <Text style={{ color: '#262626', fontSize: '14px' }}>
                {item.render ? item.render(item.value) : item.value || 'N/A'}
              </Text>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    </div>
  );
}
