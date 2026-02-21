import { Space, Layout, Divider, Typography } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  const translate = useLanguage();

  return (
    <Content
      style={{
        padding: '20px',
        width: '100%',
        maxWidth: '100%',
        margin: '0',
        background: '#f5f5f5',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="sideContent"
    >
      <div style={{ 
        textAlign: 'center',
        padding: '40px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: '300px',
        width: '100%'
      }}>
        <Title level={2} style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#333',
          marginBottom: '16px'
        }}>
          MV
        </Title>
        <Text style={{ 
          color: '#666', 
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          Sistema de Gestión Empresarial
        </Text>
      </div>
    </Content>
  );
}
