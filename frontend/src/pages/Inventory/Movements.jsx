import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  Typography, 
  Tag, 
  message,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import useLanguage from '@/locale/useLanguage';
import inventoryService from '@/services/inventoryService';
import warehouseService from '@/services/warehouseService';
import productService from '@/services/productService';
import './movements.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Movements = () => {
  const translate = useLanguage();
  const [movements, setMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    warehouse: '',
    product: '',
    type: '',
    dateRange: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
    loadWarehouses();
    loadProducts();
  }, []);

  // Cargar movimientos
  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.pageSize,
        ...filters
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key] && params[key] !== 0) {
          delete params[key];
        }
      });

      // Convertir rango de fechas
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.fromDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.toDate = filters.dateRange[1].format('YYYY-MM-DD');
        delete params.dateRange;
      }

      const response = await inventoryService.getMovementHistory(params);
      
      if (response.success) {
        setMovements(response.result.movements);
        setPagination(prev => ({
          ...prev,
          current: response.result.pagination.currentPage,
          total: response.result.pagination.totalItems
        }));
      }
    } catch (error) {
      console.error('Error cargando movimientos:', error);
      message.error('Error al cargar el historial de movimientos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar almacenes
  const loadWarehouses = async () => {
    try {
      const response = await warehouseService.getActiveWarehouses();
      if (response.success) {
        setWarehouses(response.result);
      }
    } catch (error) {
      console.error('Error cargando almacenes:', error);
    }
  };

  // Cargar productos
  const loadProducts = async () => {
    try {
      const response = await productService.getProductsWithCategories();
      if (response.success) {
        setProducts(response.result.products || []);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  // Manejar filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    loadData(1);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      search: '',
      warehouse: '',
      product: '',
      type: '',
      dateRange: null
    });
    loadData(1);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    loadData(page);
  };

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

  // Obtener texto del tipo de movimiento
  const getMovementTypeText = (type) => {
    const texts = {
      in: 'Entrada',
      out: 'Salida',
      adjustment: 'Ajuste',
      reserve: 'Reserva',
      unreserve: 'Liberar',
      transfer: 'Transferencia'
    };
    return texts[type] || type;
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: 150
    },
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
      render: (text, record) => (
        <Tag color="blue">{text} ({record.warehouse?.code})</Tag>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getMovementTypeColor(type)}>
          {getMovementTypeText(type)}
        </Tag>
      ),
      filters: [
        { text: 'Entrada', value: 'in' },
        { text: 'Salida', value: 'out' },
        { text: 'Ajuste', value: 'adjustment' },
        { text: 'Reserva', value: 'reserve' },
        { text: 'Liberar', value: 'unreserve' },
        { text: 'Transferencia', value: 'transfer' }
      ],
      onFilter: (value, record) => record.type === value
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <Text strong style={{ 
          color: ['in', 'adjustment', 'unreserve'].includes(record.type) ? '#52c41a' : '#ff4d4f'
        }}>
          {['in', 'adjustment', 'unreserve'].includes(record.type) ? '+' : '-'}{quantity}
        </Text>
      ),
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Stock Anterior',
      dataIndex: 'oldStock',
      key: 'oldStock',
      render: (value) => <Text>{value}</Text>
    },
    {
      title: 'Stock Nuevo',
      dataIndex: 'newStock',
      key: 'newStock',
      render: (value) => <Text strong>{value}</Text>
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Referencia',
      dataIndex: 'reference',
      key: 'reference',
      render: (text) => text ? <Tag color="default">{text}</Tag> : '-'
    },
    {
      title: 'Usuario',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      render: (text, record) => (
        <div>
          <Text>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.createdBy?.email}
          </Text>
        </div>
      )
    }
  ];

  return (
    <div className="movements-page">
      <PageHeader
        title="Historial de Movimientos"
        subTitle="Registro de todos los movimientos de inventario"
        extra={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={() => loadData()}>
            Actualizar
          </Button>,
          <Button key="export" icon={<DownloadOutlined />}>
            Exportar
          </Button>
        ]}
      />

      {/* Filtros */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Search
              placeholder="Buscar en motivo..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onSearch={handleApplyFilters}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Almacén"
              style={{ width: '100%' }}
              value={filters.warehouse}
              onChange={(value) => handleFilterChange('warehouse', value)}
              allowClear
            >
              {warehouses.map(warehouse => (
                <Option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Producto"
              style={{ width: '100%' }}
              value={filters.product}
              onChange={(value) => handleFilterChange('product', value)}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {products.map(product => (
                <Option key={product._id} value={product._id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Tipo"
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear
            >
              <Option value="in">Entrada</Option>
              <Option value="out">Salida</Option>
              <Option value="adjustment">Ajuste</Option>
              <Option value="reserve">Reserva</Option>
              <Option value="unreserve">Liberar</Option>
              <Option value="transfer">Transferencia</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              placeholder={['Fecha inicio', 'Fecha fin']}
            />
          </Col>
        </Row>
        
        <Row style={{ marginTop: 16 }}>
          <Col>
            <Space>
              <Button type="primary" icon={<FilterOutlined />} onClick={handleApplyFilters}>
                Aplicar Filtros
              </Button>
              <Button onClick={handleClearFilters}>
                Limpiar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <Table
          columns={columns}
          dataSource={movements}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: pagination.pageSize,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} movimientos`
          }}
          scroll={{ x: true }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Movements;
