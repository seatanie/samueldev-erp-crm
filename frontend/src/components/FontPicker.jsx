import React from 'react';
import { Select, Typography } from 'antd';
import { FontSizeOutlined } from '@ant-design/icons';
import { useFont } from '@/context/FontContext';

const { Option } = Select;
const { Text } = Typography;

export default function FontPicker() {
  const { currentFont, fonts, setFont } = useFont();

  const handleFontChange = (value) => {
    setFont(value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <FontSizeOutlined style={{ color: '#666' }} />
      <Text style={{ fontSize: '14px', color: '#666' }}>Fuente:</Text>
      <Select
        value={currentFont}
        onChange={handleFontChange}
        style={{ 
          width: 140,
          fontSize: '14px'
        }}
        size="small"
        dropdownStyle={{
          fontFamily: 'inherit'
        }}
      >
        {fonts.map((font) => (
          <Option 
            key={font.value} 
            value={font.value}
            style={{ 
              fontFamily: `${font.value}, sans-serif`,
              fontSize: '14px'
            }}
          >
            {font.displayName}
          </Option>
        ))}
      </Select>
    </div>
  );
}











