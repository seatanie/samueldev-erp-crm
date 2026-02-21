import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu, Tooltip } from 'antd';

import { useAppContext } from '@/context/appContext';

import useLanguage from '@/locale/useLanguage';

import useResponsive from '@/hooks/useResponsive';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  TagOutlined,
  TagsOutlined,
  UserOutlined,
  CreditCardOutlined,
  MenuOutlined,
  FileOutlined,
  ShopOutlined,
  FilterOutlined,
  WalletOutlined,
  ReconciliationOutlined,
  TeamOutlined,
  BarChartOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  HomeOutlined,
  HistoryOutlined,
  BarChartOutlined as ChartOutlined,
  LeftOutlined,
  RightOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LayoutOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar />;
}

function Sidebar() {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();
  const navigate = useNavigate();

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>{translate('dashboard')}</Link>,
    },
    {
      key: 'customer',
      icon: <CustomerServiceOutlined />,
      label: <Link to={'/customer'}>{translate('customers')}</Link>,
    },
    {
      key: 'invoice',
      icon: <ContainerOutlined />,
      label: <Link to={'/invoice'}>{translate('invoices')}</Link>,
    },
    {
      key: 'quote',
      icon: <FileSyncOutlined />,
      label: <Link to={'/quote'}>{translate('quote')}</Link>,
    },
    {
      key: 'payment',
      icon: <CreditCardOutlined />,
      label: <Link to={'/payment'}>{translate('payments')}</Link>,
    },
    {
      key: 'paymentMode',
      label: <Link to={'/payment/mode'}>{translate('payments_mode')}</Link>,
      icon: <WalletOutlined />,
    },
    {
      key: 'taxes',
      label: <Link to={'/taxes'}>{translate('taxes')}</Link>,
      icon: <ShopOutlined />,
    },
    {
      key: 'admin',
      label: <Link to={'/admin'}>{translate('admin')}</Link>,
      icon: <TeamOutlined />,
    },
    {
      key: 'reports',
      label: <Link to={'/reports'}>{translate('reports')}</Link>,
      icon: <BarChartOutlined />,
    },
    {
      key: 'product-categories',
      label: <Link to={'/product-categories'}>{translate('product_category')}</Link>,
      icon: <TagOutlined />,
    },
    {
      key: 'products',
      label: <Link to={'/products'}>{translate('product')}</Link>,
      icon: <ShoppingOutlined />,
    },
    {
      key: 'orders',
      label: <Link to={'/orders'}>{translate('orders')}</Link>,
      icon: <ShoppingCartOutlined />,
    },
    {
      key: 'inventory',
      label: <Link to={'/inventory'}>{translate('inventory')}</Link>,
      icon: <InboxOutlined />,
    },
    {
      key: 'inventory-dashboard',
      label: <Link to={'/inventory/dashboard'}>Dashboard Inventario</Link>,
      icon: <ChartOutlined />,
    },
    {
      key: 'inventory-movements',
      label: <Link to={'/inventory/movements'}>Movimientos</Link>,
      icon: <HistoryOutlined />,
    },
    {
      key: 'warehouses',
      label: <Link to={'/warehouses'}>Almacenes</Link>,
      icon: <HomeOutlined />,
    },

    {
      key: 'generalSettings',
      label: <Link to={'/settings'}>{translate('settings')}</Link>,
      icon: <SettingOutlined />,
    },
    {
      key: 'about',
      label: <Link to={'/about'}>{translate('about')}</Link>,
      icon: <ReconciliationOutlined />,
    },
  ];

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
  }, [location, currentPath]);

  const toggleCollapse = () => {
    navMenu.collapse();
  };

  return (
    <>
      <Sider
        className="navigation"
        width={isNavMenuClose ? 80 : 256}
        collapsed={isNavMenuClose}
        style={{
          height: '100vh',
        }}
        theme={'light'}
      >
        <div
          className="logo"
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            padding: '20px',
            textAlign: 'center',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {!isNavMenuClose && <span>Logo</span>}
        </div>

        <Menu
          items={items}
          mode="inline"
          theme={'light'}
          selectedKeys={[currentPath]}
          style={{
            width: isNavMenuClose ? 80 : 256,
          }}
          className="navigation-menu"
          inlineCollapsed={isNavMenuClose}
        />
      </Sider>

      {/* Botón de toggle fuera del sidebar */}
      <Tooltip title={isNavMenuClose ? "Mostrar menú" : "Ocultar menú"} placement="right">
        <Button
          type="text"
          icon={<LayoutOutlined />}
          onClick={toggleCollapse}
          className="sidebar-toggle-btn"
          style={{
            position: 'fixed',
            left: isNavMenuClose ? '90px' : '266px',
            top: '20px',
            zIndex: 1001,
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #d9d9d9',
            color: '#666666',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        />
      </Tooltip>
    </>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ ['marginLeft']: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        placement={'left'}
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <Sidebar />
      </Drawer>
    </>
  );
}
