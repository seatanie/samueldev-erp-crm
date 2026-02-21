import { ConfigProvider } from 'antd';
import { LanguageProvider } from '@/context/LanguageContext';

export default function Localization({ children }) {
  return (
    <LanguageProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#339393',
            colorLink: '#1640D6',
            borderRadius: 0,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </LanguageProvider>
  );
}
