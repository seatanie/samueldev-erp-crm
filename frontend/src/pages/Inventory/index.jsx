import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Typography, 
  Statistic,
  Alert,
  Modal,
  Form,
  InputNumber,
  message,
  Tooltip,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import useLanguage from '@/locale/useLanguage';
import inventoryService from '@/services/inventoryService';
import warehouseService from '@/services/warehouseService';
import productService from '@/services/productService';
import './inventory.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Inventory = () => {
  const translate = useLanguage();
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    warehouse: '',
    search: '',
    lowStock: false,
    reorder: false
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
    loadWarehouses();
    loadProducts();
    loadStats();
  }, []);

  // Cargar inventario
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

      const response = await inventoryService.getInventory(params);
      
      if (response.success) {
        setInventory(response.result.inventory);
        setPagination(prev => ({
          ...prev,
          current: response.result.pagination.currentPage,
          total: response.result.pagination.totalItems
        }));
      }
    } catch (error) {
      console.error('Error cargando inventario:', error);
      message.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  // Cargar almacenes
  const loadWarehouses = async () => {
    try {
      const response = await warehouseService.getActiveWarehouses();
      if (response.success) {
        const warehousesData = response.result || [];
        setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
      } else {
        setWarehouses([]);
      }
    } catch (error) {
      console.error('Error cargando almacenes:', error);
      setWarehouses([]);
    }
  };

  // Cargar productos
  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 });
      if (response.success) {
        const productsData = response.result || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProducts([]);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await inventoryService.getInventoryStats(filters.warehouse);
      if (response.success) {
        setStats(response.result);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Manejar filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Manejar búsqueda
  const handleSearch = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
    loadData(1);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    loadData(page);
  };

  // Abrir modal de actualización
  const handleUpdateStock = (record) => {
    setSelectedItem(record);
    setUpdateModalVisible(true);
    form.setFieldsValue({
      quantity: 0,
      type: 'in',
      reason: ''
    });
  };

  // Actualizar stock
  const handleUpdateStockSubmit = async (values) => {
    try {
      const response = await inventoryService.updateStock({
        inventoryId: selectedItem._id,
        ...values
      });

      if (response.success) {
        message.success('Stock actualizado exitosamente');
        setUpdateModalVisible(false);
        form.resetFields();
        loadData(pagination.current);
        loadStats();
      } else {
        message.error(response.message || 'Error al actualizar stock');
      }
    } catch (error) {
      console.error('Error actualizando stock:', error);
      message.error('Error al actualizar stock');
    }
  };

  // Abrir modal de agregar producto
  const handleAddProduct = () => {
    setAddModalVisible(true);
    addForm.resetFields();
  };

  // Agregar producto al inventario
  const handleAddProductSubmit = async (values) => {
    try {
      const response = await inventoryService.createInventory(values);

      if (response.success) {
        message.success('Producto agregado al inventario exitosamente');
        setAddModalVisible(false);
        addForm.resetFields();
        loadData(pagination.current);
        loadStats();
      } else {
        message.error(response.message || 'Error al agregar producto');
      }
    } catch (error) {
      console.error('Error agregando producto:', error);
      message.error('Error al agregar producto');
    }
  };

  // Columnas de la tabla
  const columns = [
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
      title: 'Stock Actual',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (value, record) => (
        <div>
          <Text strong style={{ 
            color: value <= record.minStock ? '#ff4d4f' : 
                   value <= record.reorderPoint ? '#faad14' : '#52c41a' 
          }}>
            {value}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Disponible: {record.availableStock}
          </Text>
        </div>
      )
    },
    {
      title: 'Stock Mínimo',
      dataIndex: 'minStock',
      key: 'minStock'
    },
    {
      title: 'Punto de Reorden',
      dataIndex: 'reorderPoint',
      key: 'reorderPoint'
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_, record) => {
        if (record.currentStock <= record.minStock) {
          return <Tag color="red" icon={<ExclamationCircleOutlined />}>Stock Bajo</Tag>;
        } else if (record.currentStock <= record.reorderPoint) {
          return <Tag color="orange" icon={<WarningOutlined />}>Reordenar</Tag>;
        } else {
          return <Tag color="green" icon={<InfoCircleOutlined />}>Normal</Tag>;
        }
      }
    },
    {
      title: 'Último Movimiento',
      dataIndex: 'lastMovement',
      key: 'lastMovement',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Actualizar Stock">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleUpdateStock(record)}
            />
          </Tooltip>
          <Tooltip title="Ver Historial">
            <Button 
              size="small" 
              icon={<HistoryOutlined />}
              onClick={() => {/* TODO: Implementar historial */}}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="inventory-page">
      <PageHeader
        title="Gestión de Inventario"
        subTitle="Control de stock y movimientos"
        extra={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={() => loadData()}>
            Actualizar
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
            Agregar Producto
          </Button>
        ]}
      />

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Productos"
              value={stats.totalProducts || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Stock Total"
              value={stats.totalStock || 0}
              valueStyle={{ color: '#52c41a' }}
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

      {/* Filtros */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Buscar productos..."
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Seleccionar almacén"
              style={{ width: '100%' }}
              value={filters.warehouse}
              onChange={(value) => {
                handleFilterChange('warehouse', value);
                loadData(1);
              }}
              allowClear
            >
              {warehouses.map(warehouse => (
                <Option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={10}>
            <Space>
              <Button
                type={filters.lowStock ? 'primary' : 'default'}
                onClick={() => {
                  handleFilterChange('lowStock', !filters.lowStock);
                  loadData(1);
                }}
                icon={<ExclamationCircleOutlined />}
              >
                Stock Bajo
              </Button>
              <Button
                type={filters.reorder ? 'primary' : 'default'}
                onClick={() => {
                  handleFilterChange('reorder', !filters.reorder);
                  loadData(1);
                }}
                icon={<WarningOutlined />}
              >
                Reordenar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de inventario */}
      <Card>
        <Table
          columns={columns}
          dataSource={inventory}
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
              `${range[0]}-${range[1]} de ${total} productos`
          }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Modal de actualización de stock */}
      <Modal
        title="Actualizar Stock"
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateStockSubmit}
        >
          <Form.Item
            label="Tipo de Movimiento"
            name="type"
            rules={[{ required: true, message: 'Selecciona el tipo de movimiento' }]}
          >
            <Select>
              <Option value="in">Entrada</Option>
              <Option value="out">Salida</Option>
              <Option value="adjustment">Ajuste</Option>
              <Option value="reserve">Reservar</Option>
              <Option value="unreserve">Liberar Reserva</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Cantidad"
            name="quantity"
            rules={[{ required: true, message: 'Ingresa la cantidad' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Cantidad"
            />
          </Form.Item>

          <Form.Item
            label="Motivo"
            name="reason"
            rules={[{ required: true, message: 'Ingresa el motivo del movimiento' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe el motivo del movimiento de stock"
            />
          </Form.Item>

          <Form.Item
            label="Referencia (Opcional)"
            name="reference"
          >
            <Input placeholder="Número de orden, factura, etc." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de agregar producto */}
      <Modal
        title="Agregar Producto al Inventario"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          addForm.resetFields();
        }}
        onOk={() => addForm.submit()}
        width={600}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 6 }}>
          <Text type="secondary">
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Este formulario crea un registro de inventario para un producto en un almacén específico. 
            El producto ya debe existir en el catálogo de productos.
          </Text>
        </div>
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddProductSubmit}
        >
          <Form.Item
            label="Producto"
            name="product"
            rules={[{ required: true, message: 'Selecciona un producto' }]}
          >
            <Select
              placeholder="Buscar producto..."
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map(product => (
                <Option key={product._id} value={product._id}>
                  {product.name} ({product.reference})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Almacén"
            name="warehouse"
            rules={[{ required: true, message: 'Selecciona un almacén' }]}
          >
            <Select placeholder="Seleccionar almacén">
              {warehouses.map(warehouse => (
                <Option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name} ({warehouse.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Cantidad Inicial en Almacén"
            name="currentStock"
            rules={[{ required: true, message: 'Ingresa la cantidad inicial' }]}
            extra="Cantidad física del producto que hay actualmente en este almacén"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>

          <Form.Item
            label="Stock Mínimo"
            name="minStock"
            rules={[{ required: true, message: 'Ingresa el stock mínimo' }]}
            extra="Cantidad mínima antes de generar alerta de stock bajo"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>

          <Form.Item
            label="Punto de Reorden"
            name="reorderPoint"
            rules={[{ required: true, message: 'Ingresa el punto de reorden' }]}
            extra="Cantidad que activa la sugerencia de reordenar"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>

          <Form.Item
            label="Stock Máximo (Opcional)"
            name="maxStock"
            extra="Capacidad máxima de almacenamiento para este producto"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Sin límite"
            />
          </Form.Item>

          <Form.Item
            label="Notas (Opcional)"
            name="notes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Notas adicionales sobre el producto en inventario"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventory;
