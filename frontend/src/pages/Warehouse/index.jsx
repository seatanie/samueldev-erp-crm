import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Typography, 
  Tag, 
  Modal, 
  Form, 
  InputNumber,
  message,
  Tooltip,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  HomeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import useLanguage from '@/locale/useLanguage';
import warehouseService from '@/services/warehouseService';
import './warehouse.css';

const { Title, Text } = Typography;

const Warehouse = () => {
  const translate = useLanguage();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [form] = Form.useForm();

  // Cargar almacenes
  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await warehouseService.getWarehouses();
      
      if (response.success) {
        // El backend devuelve un objeto con paginación, necesitamos extraer el array
        const warehousesData = response.result?.warehouses || response.result || [];
        setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
      } else {
        setWarehouses([]);
      }
    } catch (error) {
      console.error('Error cargando almacenes:', error);
      message.error('Error al cargar los almacenes');
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  // Abrir modal para crear/editar
  const handleOpenModal = (warehouse = null) => {
    setEditingWarehouse(warehouse);
    setModalVisible(true);
    
    if (warehouse) {
      form.setFieldsValue(warehouse);
    } else {
      form.resetFields();
    }
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingWarehouse(null);
    form.resetFields();
  };

  // Guardar almacén
  const handleSave = async (values) => {
    try {
      let response;
      
      if (editingWarehouse) {
        response = await warehouseService.updateWarehouse(editingWarehouse._id, values);
      } else {
        response = await warehouseService.createWarehouse(values);
      }

      if (response.success) {
        message.success(`Almacén ${editingWarehouse ? 'actualizado' : 'creado'} exitosamente`);
        handleCloseModal();
        loadWarehouses();
      } else {
        message.error(response.message || 'Error al guardar el almacén');
      }
    } catch (error) {
      console.error('Error guardando almacén:', error);
      message.error('Error al guardar el almacén');
    }
  };

  // Eliminar almacén
  const handleDelete = (warehouse) => {
    Modal.confirm({
      title: '¿Eliminar almacén?',
      content: `¿Estás seguro de que quieres eliminar el almacén "${warehouse.name}"?`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await warehouseService.deleteWarehouse(warehouse._id);
          if (response.success) {
            message.success('Almacén eliminado exitosamente');
            loadWarehouses();
          } else {
            message.error(response.message || 'Error al eliminar el almacén');
          }
        } catch (error) {
          console.error('Error eliminando almacén:', error);
          message.error('Error al eliminar el almacén');
        }
      }
    });
  };

  // Calcular capacidad
  const handleCalculateCapacity = async (warehouse) => {
    try {
      const response = await warehouseService.calculateCapacity(warehouse._id);
      if (response.success) {
        message.success('Capacidad calculada exitosamente');
        loadWarehouses();
      }
    } catch (error) {
      console.error('Error calculando capacidad:', error);
      message.error('Error al calcular la capacidad');
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.isMain && (
            <Tag color="gold" icon={<HomeOutlined />} style={{ marginLeft: 8 }}>
              Principal
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Ubicación',
      key: 'location',
      render: (_, record) => (
        <div>
          {record.address?.city && (
            <Text>{record.address.city}</Text>
          )}
          {record.address?.state && (
            <Text type="secondary">, {record.address.state}</Text>
          )}
        </div>
      )
    },
    {
      title: 'Capacidad',
      key: 'capacity',
      render: (_, record) => {
        if (!record.capacity) {
          return <Text type="secondary">Sin límite</Text>;
        }
        
        const percentage = (record.currentCapacity / record.capacity) * 100;
        return (
          <div>
            <Progress 
              percent={Math.round(percentage)} 
              size="small"
              status={percentage > 90 ? 'exception' : percentage > 70 ? 'active' : 'normal'}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.currentCapacity} / {record.capacity}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          active: { color: 'green', text: 'Activo' },
          inactive: { color: 'red', text: 'Inactivo' },
          maintenance: { color: 'orange', text: 'Mantenimiento' }
        };
        
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_, record) => (
        <div>
          {record.contact?.phone && (
            <div><Text type="secondary">Teléfono: {record.contact.phone}</Text></div>
          )}
          {record.contact?.email && (
            <div><Text type="secondary">Email: {record.contact.email}</Text></div>
          )}
        </div>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Calcular Capacidad">
            <Button 
              size="small" 
              icon={<InfoCircleOutlined />}
              onClick={() => handleCalculateCapacity(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="warehouse-page">
      <PageHeader
        title="Gestión de Almacenes"
        subTitle="Administrar ubicaciones de inventario"
        extra={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={loadWarehouses}>
            Actualizar
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Nuevo Almacén
          </Button>
        ]}
      />

      {/* Tabla de almacenes */}
      <Card>
        <Table
          columns={columns}
          dataSource={warehouses}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} almacenes`
          }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Modal de crear/editar almacén */}
      <Modal
        title={editingWarehouse ? 'Editar Almacén' : 'Nuevo Almacén'}
        open={modalVisible}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre"
                name="name"
                rules={[{ required: true, message: 'Ingresa el nombre del almacén' }]}
              >
                <Input placeholder="Nombre del almacén" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Código"
                name="code"
                rules={[{ required: true, message: 'Ingresa el código del almacén' }]}
              >
                <Input placeholder="Código único" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Descripción"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Descripción del almacén" />
          </Form.Item>

          <Title level={5}>Dirección</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Calle"
                name={['address', 'street']}
              >
                <Input placeholder="Dirección" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ciudad"
                name={['address', 'city']}
              >
                <Input placeholder="Ciudad" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Estado"
                name={['address', 'state']}
              >
                <Input placeholder="Estado" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Código Postal"
                name={['address', 'zipCode']}
              >
                <Input placeholder="Código postal" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="País"
                name={['address', 'country']}
              >
                <Input placeholder="País" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5}>Contacto</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Teléfono"
                name={['contact', 'phone']}
              >
                <Input placeholder="Teléfono" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name={['contact', 'email']}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Gerente"
            name={['contact', 'manager']}
          >
            <Input placeholder="Nombre del gerente" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Capacidad Máxima"
                name="capacity"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Capacidad máxima (opcional)"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Estado"
                name="status"
                initialValue="active"
              >
                <Input placeholder="Estado" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isMain"
            valuePropName="checked"
          >
            <input type="checkbox" /> Marcar como almacén principal
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Warehouse;
