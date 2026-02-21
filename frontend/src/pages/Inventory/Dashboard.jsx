import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Alert, 
  Table, 
  Typography, 
  Button, 
  Space, 
  Tag,
  Progress,
  List,
  Avatar,
  Tooltip
} from 'antd';
import { 
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import useLanguage from '@/locale/useLanguage';
import inventoryService from '@/services/inventoryService';
import warehouseService from '@/services/warehouseService';
import './dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const translate = useLanguage();
  const [stats, setStats] = useState({});
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [reorderProducts, setReorderProducts] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        statsResponse,
        lowStockResponse,
        reorderResponse,
        movementsResponse,
        warehousesResponse
      ] = await Promise.all([
        inventoryService.getInventoryStats(),
        inventoryService.getLowStockProducts(),
        inventoryService.getReorderProducts(),
        inventoryService.getMovementHistory({ limit: 10 }),
        warehouseService.getActiveWarehouses()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.result);
      }

      if (lowStockResponse.success) {
        setLowStockProducts(lowStockResponse.result);
      }

      if (reorderResponse.success) {
        setReorderProducts(reorderResponse.result);
      }

      if (movementsResponse.success) {
        setRecentMovements(movementsResponse.result.movements);
      }

      if (warehousesResponse.success) {
        setWarehouses(warehousesResponse.result);
      }

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Obtener color del tipo de movimiento
  const getMovementTypeColor = (type) => {
    const colors = {
      in: 'green',
      out: 'red',
      adjustment: 'blue',
      reserve: 'orange',
      unreserve: 'purple',
      transfer: 'cyan'
    };
    return colors[type] || 'default';
  };

  // Obtener icono del tipo de movimiento
  const getMovementTypeIcon = (type) => {
    const icons = {
      in: <ArrowUpOutlined />,
      out: <ArrowDownOutlined />,
      adjustment: <InfoCircleOutlined />,
      reserve: <ShoppingCartOutlined />,
      unreserve: <ShoppingCartOutlined />,
      transfer: <HomeOutlined />
    };
    return icons[type] || <InfoCircleOutlined />;
  };

  // Columnas para productos con stock bajo
  const lowStockColumns = [
    {
      title: 'Producto',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Ref: {record.product?.reference}
          </Text>
        </div>
      )
    },
    {
      title: 'Almacén',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Stock Actual',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (value) => (
        <Text strong style={{ color: '#ff4d4f' }}>
          {value}
        </Text>
      )
    },
    {
      title: 'Stock Mínimo',
      dataIndex: 'minStock',
      key: 'minStock',
      render: (value) => <Text>{value}</Text>
    }
  ];

  // Columnas para productos que necesitan reorden
  const reorderColumns = [
    {
      title: 'Producto',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Ref: {record.product?.reference}
          </Text>
        </div>
      )
    },
    {
      title: 'Almacén',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Stock Actual',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (value) => (
        <Text strong style={{ color: '#faad14' }}>
          {value}
        </Text>
      )
    },
    {
      title: 'Punto de Reorden',
      dataIndex: 'reorderPoint',
      key: 'reorderPoint',
      render: (value) => <Text>{value}</Text>
    }
  ];

  return (
    <div className="inventory-dashboard">
      <PageHeader
        title="Dashboard de Inventario"
        subTitle="Resumen y alertas del sistema de inventario"
        extra={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={loadDashboardData}>
            Actualizar
          </Button>
        ]}
      />

      {/* Estadísticas principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Productos"
              value={stats.totalProducts || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Stock Total"
              value={stats.totalStock || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Stock Bajo"
              value={stats.lowStockCount || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Necesitan Reorden"
              value={stats.reorderCount || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alertas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {lowStockProducts.length > 0 && (
          <Col xs={24} lg={12}>
            <Alert
              message={`${lowStockProducts.length} productos con stock bajo`}
              description="Algunos productos han alcanzado su nivel mínimo de stock"
              type="error"
              icon={<ExclamationCircleOutlined />}
              showIcon
              action={
                <Button size="small" type="primary">
                  Ver Detalles
                </Button>
              }
            />
          </Col>
        )}
        
        {reorderProducts.length > 0 && (
          <Col xs={24} lg={12}>
            <Alert
              message={`${reorderProducts.length} productos necesitan reorden`}
              description="Algunos productos han alcanzado su punto de reorden"
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              action={
                <Button size="small" type="primary">
                  Ver Detalles
                </Button>
              }
            />
          </Col>
        )}

        {lowStockProducts.length === 0 && reorderProducts.length === 0 && (
          <Col span={24}>
            <Alert
              message="Todo en orden"
              description="No hay alertas de inventario en este momento"
              type="success"
              icon={<InfoCircleOutlined />}
              showIcon
            />
          </Col>
        )}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Productos con stock bajo */}
        <Col xs={24} lg={12}>
          <Card
            title="Productos con Stock Bajo"
            extra={<Button type="link">Ver todos</Button>}
            size="small"
          >
            {lowStockProducts.length > 0 ? (
              <Table
                columns={lowStockColumns}
                dataSource={lowStockProducts.slice(0, 5)}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            ) : (
              <Text type="secondary">No hay productos con stock bajo</Text>
            )}
          </Card>
        </Col>

        {/* Productos que necesitan reorden */}
        <Col xs={24} lg={12}>
          <Card
            title="Productos que Necesitan Reorden"
            extra={<Button type="link">Ver todos</Button>}
            size="small"
          >
            {reorderProducts.length > 0 ? (
              <Table
                columns={reorderColumns}
                dataSource={reorderProducts.slice(0, 5)}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            ) : (
              <Text type="secondary">No hay productos que necesiten reorden</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Movimientos recientes */}
        <Col xs={24} lg={16}>
          <Card
            title="Movimientos Recientes"
            extra={<Button type="link">Ver historial completo</Button>}
            size="small"
          >
            <List
              dataSource={recentMovements}
              renderItem={(movement) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: getMovementTypeColor(movement.type),
                          color: 'white'
                        }}
                        icon={getMovementTypeIcon(movement.type)}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{movement.product?.name}</Text>
                        <Tag color={getMovementTypeColor(movement.type)}>
                          {movement.type}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary">
                          {movement.warehouse?.name} • {movement.quantity} unidades
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(movement.createdAt).toLocaleString()} • {movement.createdBy?.name}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Estado de almacenes */}
        <Col xs={24} lg={8}>
          <Card
            title="Estado de Almacenes"
            size="small"
          >
            <List
              dataSource={warehouses}
              renderItem={(warehouse) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<HomeOutlined />} />}
                    title={warehouse.name}
                    description={
                      <div>
                        <Text type="secondary">{warehouse.code}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {warehouse.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
