import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Divider, Descriptions } from 'antd';
import { useSelector } from 'react-redux';

import dayjs from 'dayjs';
import { dataForRead } from '@/utils/dataStructure';

import { useCrudContext } from '@/context/crud';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';

import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';

const { Title, Text } = Typography;

export default function ReadItem({ config }) {
  const { dateFormat } = useDate();
  let { readColumns, fields } = config;
  const translate = useLanguage();
  const { result: currentResult } = useSelector(selectCurrentItem);
  const { state } = useCrudContext();
  const { isReadBoxOpen } = state;
  const [listState, setListState] = useState([]);

  if (fields) readColumns = [...dataForRead({ fields: fields, translate: translate })];
  
  useEffect(() => {
    const list = [];
    readColumns.map((props) => {
      const propsKey = props.dataIndex;
      const propsTitle = props.title;
      const isDate = props.isDate || false;
      let value = valueByString(currentResult, propsKey);
      value = isDate ? dayjs(value).format(dateFormat) : value;
      list.push({ propsKey, label: propsTitle, value: value });
    });
    setListState(list);
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
          Detalles
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
              key={item.propsKey} 
              label={item.label}
              style={{
                paddingBottom: '16px',
                borderBottom: '1px solid #fafafa'
              }}
            >
              <Text style={{ 
                color: '#262626',
                fontSize: '14px'
              }}>
                {item.value || 'N/A'}
              </Text>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    </div>
  );
}
