import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Space, Table, Tag, Switch, message, Modal, Form, Input, Select, ColorPicker, Dropdown } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  TagOutlined,
  DownOutlined,
  MoreOutlined,
  EyeOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';
import productCategoryService from '@/services/productCategoryService';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ProductCategoryModule() {
  const translate = useLanguage();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();

  // Estados para filtros
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Cargar categorías desde el backend
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await productCategoryService.getCategories();
      if (response.success) {
        setCategories(response.result);
      } else {
        message.error(response.message || 'Error al cargar las categorías');
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      message.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtrar categorías
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'enabled' && category.enabled) ||
                         (statusFilter === 'disabled' && !category.enabled);
    
    return matchesSearch && matchesStatus;
  });

  // Abrir modal para crear/editar
  const showModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        color: category.color,
        enabled: category.enabled
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Cerrar modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Abrir modal de detalles
  const showDetailsModal = (category) => {
    setSelectedCategory(category);
    setIsDetailsModalVisible(true);
  };

  // Cerrar modal de detalles
  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setSelectedCategory(null);
  };

  // Guardar categoría
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        // Actualizar categoría existente
        const response = await productCategoryService.updateCategory(editingCategory._id, values);
        if (response.success) {
          message.success('Categoría actualizada exitosamente');
          loadCategories(); // Recargar datos
        } else {
          message.error(response.message || 'Error al actualizar la categoría');
        }
      } else {
        // Crear nueva categoría
        const response = await productCategoryService.createCategory(values);
        if (response.success) {
          message.success('Categoría creada exitosamente');
          loadCategories(); // Recargar datos
        } else {
          message.error(response.message || 'Error al crear la categoría');
        }
      }
      handleCancel();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      message.error('Error al guardar la categoría');
    }
  };

  // Eliminar categoría
  const handleDelete = async (category) => {
    Modal.confirm({
      title: 'Confirmar eliminación',
      content: `¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`,
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await productCategoryService.deleteCategory(category._id);
          if (response.success) {
            message.success('Categoría eliminada exitosamente');
            loadCategories(); // Recargar datos
          } else {
            message.error(response.message || 'Error al eliminar la categoría');
          }
        } catch (error) {
          console.error('Error eliminando categoría:', error);
          message.error('Error al eliminar la categoría');
        }
      }
    });
  };

  // Cambiar estado de categoría
  const handleToggleStatus = async (category) => {
    try {
      const response = await productCategoryService.toggleCategoryStatus(category._id);
      if (response.success) {
        message.success(`Categoría ${!category.enabled ? 'habilitada' : 'deshabilitada'} exitosamente`);
        loadCategories(); // Recargar datos
      } else {
        message.error(response.message || 'Error al cambiar el estado de la categoría');
      }
    } catch (error) {
      console.error('Error cambiando estado de categoría:', error);
      message.error('Error al cambiar el estado de la categoría');
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: translate('name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: record.color, 
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 0 1px #d9d9d9'
            }} 
          />
          <Text strong>{text}</Text>
        </div>
      )
    },
    {
      title: translate('description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: translate('color'),
      dataIndex: 'color',
      key: 'color',
      render: (color) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: color, 
              borderRadius: '4px',
              border: '1px solid #d9d9d9'
            }} 
          />
          <Text code>{color}</Text>
        </div>
      )
    },
    {
      title: translate('enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled, record) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Sí"
          unCheckedChildren="No"
        />
      )
    },
    {
      title: translate('actions'),
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: translate('show'),
                icon: <EyeOutlined />,
                onClick: () => showDetailsModal(record)
              },
              {
                key: 'edit',
                label: translate('edit'),
                icon: <EditOutlined />,
                onClick: () => showModal(record)
              },
              {
                type: 'divider'
              },
              {
                key: 'delete',
                label: translate('delete'),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record)
              }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
            style={{ padding: '4px 8px' }}
          />
        </Dropdown>
      )
    }
  ];

  return (
    <div className="product-category-module" style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <TagOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {translate('product_category_list')}
        </Title>
        <Text type="secondary">
          Gestiona las categorías de productos de tu negocio
        </Text>
      </div>

      {/* Filtros y acciones */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder={translate('search')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">{translate('all')}</Option>
              <Option value="enabled">{translate('enabled')}</Option>
              <Option value="disabled">{translate('disabled')}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
                             <Button
                 icon={<ReloadOutlined />}
                 onClick={loadCategories}
                 loading={loading}
               >
                 {translate('refresh')}
               </Button>
                             <Dropdown
                 menu={{
                   items: [
                     {
                       key: 'add',
                       label: translate('add_new_product_category'),
                       icon: <PlusOutlined />,
                       onClick: () => showModal()
                     }
                   ]
                 }}
                 trigger={['click']}
               >
                 <Button type="primary" icon={<PlusOutlined />}>
                   {translate('add_new_product_category')} <DownOutlined />
                 </Button>
               </Dropdown>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de categorías */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} categorías`
          }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <TagOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <div style={{ color: '#999' }}>No hay datos</div>
              </div>
            )
          }}
        />
      </Card>

             {/* Modal para crear/editar categoría */}
       <Modal
         title={editingCategory ? translate('category_edit_title') : translate('category_new_title')}
         open={isModalVisible}
         onCancel={handleCancel}
         footer={null}
         width={600}
         destroyOnClose
       >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            enabled: true,
            color: '#1890ff'
          }}
        >
                     <Form.Item
             name="name"
             label={`* ${translate('name')}`}
             rules={[{ required: true, message: translate('name') + ' es requerido' }]}
           >
             <Input placeholder={translate('product_category_name')} />
           </Form.Item>

                     <Form.Item
             name="description"
             label={`* ${translate('description')}`}
             rules={[{ required: true, message: translate('description') + ' es requerido' }]}
           >
             <Input.TextArea 
               placeholder={translate('product_category_description')} 
               rows={3}
             />
           </Form.Item>

                     <Form.Item
             name="color"
             label={`* ${translate('color')}`}
             rules={[{ required: true, message: translate('color') + ' es requerido' }]}
           >
             <ColorPicker
               presets={[
                 {
                   label: translate('category_color'),
                   colors: [
                     '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#f5222d',
                     '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#2f54eb'
                   ]
                 }
               ]}
             />
           </Form.Item>

                     <Form.Item
             name="enabled"
             label={`* ${translate('enabled')}`}
             valuePropName="checked"
           >
             <Switch checkedChildren="Sí" unCheckedChildren="No" />
           </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>
                {translate('cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {translate('submit')}
              </Button>
            </Space>
          </Form.Item>
                 </Form>
       </Modal>

       {/* Modal para ver detalles de la categoría */}
       <Modal
         title={
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <TagOutlined style={{ color: '#1890ff' }} />
             {translate('category_details')}
           </div>
         }
         open={isDetailsModalVisible}
         onCancel={handleDetailsCancel}
         footer={[
           <Button key="close" onClick={handleDetailsCancel}>
             {translate('close')}
           </Button>
         ]}
         width={800}
         destroyOnClose
       >
         {selectedCategory && (
           <div style={{ padding: '20px 0' }}>
             <Row gutter={[24, 16]}>
               <Col span={12}>
                 {/* Nombre de la categoría */}
                 <div style={{ marginBottom: '20px' }}>
                   <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                     {translate('name')}
                   </Text>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#262626' }}>
                     {selectedCategory.name}
                   </div>
                 </div>

                 {/* Color */}
                 <div style={{ marginBottom: '20px' }}>
                   <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                     {translate('color')}
                   </Text>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div
                       style={{
                         width: '20px',
                         height: '20px',
                         backgroundColor: selectedCategory.color,
                         borderRadius: '50%',
                         border: '2px solid #f0f0f0'
                       }}
                     />
                     <span style={{ fontSize: '14px', color: '#595959' }}>
                       {selectedCategory.color}
                     </span>
                   </div>
                 </div>

                 {/* Estado */}
                 <div style={{ marginBottom: '20px' }}>
                   <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                     {translate('enabled')}
                   </Text>
                   <Tag 
                     color={selectedCategory.enabled ? '#52c41a' : '#ff4d4f'}
                     style={{ 
                       borderRadius: '16px', 
                       padding: '4px 12px',
                       fontSize: '14px',
                       fontWeight: '500'
                     }}
                   >
                     {selectedCategory.enabled ? translate('enabled') : translate('disabled')}
                   </Tag>
                 </div>
               </Col>

               <Col span={12}>
                 {/* Descripción */}
                 <div style={{ marginBottom: '20px' }}>
                   <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                     {translate('description')}
                   </Text>
                   <div style={{ 
                     fontSize: '14px', 
                     lineHeight: '1.6',
                     padding: '16px',
                     backgroundColor: '#fafafa',
                     borderRadius: '8px',
                     minHeight: '80px',
                     border: '1px solid #f0f0f0',
                     color: '#595959'
                   }}>
                     {selectedCategory.description || translate('no_description')}
                   </div>
                 </div>

                 {/* Fecha de creación */}
                 <div style={{ marginBottom: '20px' }}>
                   <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                     {translate('created')}
                   </Text>
                   <div style={{ fontSize: '14px', color: '#595959' }}>
                     {new Date(selectedCategory.createdAt).toLocaleDateString('es-ES', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                     })}
                   </div>
                 </div>
               </Col>
             </Row>
           </div>
         )}
       </Modal>
     </div>
   );
 }
