import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Space, Table, Tag, Input, message, Modal, Form, Select, InputNumber, Upload, Image, Dropdown, Switch } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  UploadOutlined,
  EyeOutlined,
  DownOutlined,
  MoreOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import useMoney from '@/settings/useMoney';
import productService from '@/services/productService';
import productCategoryService from '@/services/productCategoryService';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useCrudContext } from '@/context/crud';
import ProductReadItem from './components/ProductReadItem';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ProductModule() {
  const translate = useLanguage();
  const { moneyFormatter, currency_symbol } = useMoney();
  const dispatch = useDispatch();
  const { crudContextAction } = useCrudContext();
  const { readBox } = crudContextAction;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // Estados para filtros
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Cargar productos y categorías desde el backend
  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar categorías habilitadas
      const categoriesResponse = await productCategoryService.getEnabledCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.result);
      }

      // Cargar productos con filtros
      const productsResponse = await productService.getProductsWithCategories({
        search: searchText,
        category: categoryFilter,
        enabled: 'all'
      });
      
      if (productsResponse.success) {
        setProducts(productsResponse.result.products || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.ref.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category._id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Abrir modal para crear/editar
  const showModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue({
        name: product.name,
        category: product.category._id,
        price: product.price,
        description: product.description,
        reference: product.reference,
        stock: product.stock || 0,
        enabled: product.enabled !== undefined ? product.enabled : true
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Abrir panel de detalles (como en clientes)
  const showDetailsModal = (product) => {
    dispatch(crud.currentAction({ actionType: 'read', data: product }));
    readBox.open();
  };

  // Cerrar modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };



  // Guardar producto
  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        // Actualizar producto existente
        const response = await productService.updateProduct(editingProduct._id, values);
        if (response.success) {
          message.success('Producto actualizado exitosamente');
          loadData(); // Recargar datos
        } else {
          message.error(response.message || 'Error al actualizar el producto');
        }
      } else {
        // Crear nuevo producto
        const response = await productService.createProduct(values);
        if (response.success) {
          message.success('Producto creado exitosamente');
          loadData(); // Recargar datos
        } else {
          message.error(response.message || 'Error al crear el producto');
        }
      }
      handleCancel();
    } catch (error) {
      console.error('Error guardando producto:', error);
      message.error('Error al guardar el producto');
    }
  };

  // Eliminar producto
  const handleDelete = async (product) => {
    Modal.confirm({
      title: 'Confirmar eliminación',
      content: `¿Estás seguro de que quieres eliminar el producto "${product.name}"?`,
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await productService.deleteProduct(product._id);
          if (response.success) {
            message.success('Producto eliminado exitosamente');
            loadData(); // Recargar datos
          } else {
            message.error(response.message || 'Error al eliminar el producto');
          }
        } catch (error) {
          console.error('Error eliminando producto:', error);
          message.error('Error al eliminar el producto');
        }
      }
    });
  };

  // Formatear precio
  const formatPrice = (price) => {
    if (price === 0) return `${currency_symbol || '$'} 0.00`;
    return moneyFormatter({ amount: price });
  };

  // Columnas de la tabla
  const columns = [
    {
      title: translate('name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {record.image ? (
            <Image
              width={40}
              height={40}
              src={record.image}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              style={{ borderRadius: '4px' }}
            />
          ) : (
            <div 
              style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '12px',
                textAlign: 'center',
                lineHeight: '1.2'
              }}
            >
              {text.length > 8 ? text.substring(0, 8) + '...' : text}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>Ref: {record.ref}</div>
          </div>
        </div>
      )
    },
    {
      title: translate('product_category'),
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={category.color} style={{ borderRadius: '12px' }}>
          {category.name}
        </Tag>
      )
    },
         {
       title: translate('price'),
       dataIndex: 'price',
       key: 'price',
       render: (price) => (
         <Text strong style={{ color: '#52c41a' }}>
           {formatPrice(price)}
         </Text>
       )
     },
     {
       title: translate('stock'),
       dataIndex: 'stock',
       key: 'stock',
       render: (stock) => (
         <Tag color={stock > 0 ? '#52c41a' : stock === 0 ? '#faad14' : '#ff4d4f'}>
           {stock || 0} unidades
         </Tag>
       )
     },
    {
      title: translate('image'),
      dataIndex: 'image',
      key: 'image',
      render: (image, record) => (
        <div style={{ textAlign: 'center' }}>
          {image ? (
            <Image
              width={60}
              height={60}
              src={image}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              style={{ borderRadius: '4px' }}
            />
          ) : (
            <div 
              style={{ 
                width: 60, 
                height: 60, 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '12px',
                textAlign: 'center',
                lineHeight: '1.2'
              }}
            >
              {record.name.length > 8 ? record.name.substring(0, 8) + '...' : record.name}
            </div>
          )}
        </div>
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
    <div className="product-module" style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <ShoppingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {translate('product_list')}
        </Title>
        <Text type="secondary">
          Gestiona el inventario de productos de tu negocio
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
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              placeholder="Categoría"
            >
              <Option value="all">{translate('all')}</Option>
              {categories.map(category => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
                     <Col xs={24} sm={12} md={6}>
             <Space>
               <Button
                 icon={<ReloadOutlined />}
                 onClick={loadData}
                 loading={loading}
               >
                 {translate('refresh')}
               </Button>
               <Dropdown
                 menu={{
                   items: [
                     {
                       key: 'add',
                       label: translate('add_new_product'),
                       icon: <PlusOutlined />,
                       onClick: () => showModal()
                     }
                   ]
                 }}
                 trigger={['click']}
               >
                 <Button type="primary" icon={<PlusOutlined />}>
                   {translate('add_new_product')} <DownOutlined />
                 </Button>
               </Dropdown>
             </Space>
           </Col>
        </Row>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} productos`
          }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <ShoppingOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <div style={{ color: '#999' }}>No hay datos</div>
              </div>
            )
          }}
        />
      </Card>

             {/* Modal para crear/editar producto */}
       <Modal
         title={editingProduct ? translate('product_edit_title') : translate('product_new_title')}
         open={isModalVisible}
         onCancel={handleCancel}
         footer={null}
         width={700}
         destroyOnClose
       >
                 <Form
           form={form}
           layout="vertical"
           onFinish={handleSubmit}
           initialValues={{
             price: 0.00,
             stock: 0,
             enabled: true
           }}
         >
                     <Row gutter={16}>
             <Col span={12}>
               <Form.Item
                 name="name"
                 label={`* ${translate('name')}`}
                 rules={[{ required: true, message: translate('name') + ' es requerido' }]}
               >
                 <Input placeholder={translate('product_name')} />
               </Form.Item>
             </Col>
             <Col span={12}>
               <Form.Item
                 name="reference"
                 label={`* ${translate('product_reference')}`}
                 rules={[{ required: true, message: translate('product_reference') + ' es requerido' }]}
               >
                 <Input placeholder={translate('product_reference')} />
               </Form.Item>
             </Col>
           </Row>

                                           <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label={`* ${translate('category')}`}
                  rules={[{ required: true, message: translate('category') + ' es requerido' }]}
                >
                  <Select placeholder={translate('select_category')}>
                    {categories.map(category => (
                      <Option key={category._id} value={category._id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div 
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              backgroundColor: category.color, 
                              borderRadius: '50%' 
                            }} 
                          />
                          {category.name}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label={`* ${translate('price')}`}
                  rules={[{ required: true, message: translate('price') + ' es requerido' }]}
                >
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    formatter={value => `${currency_symbol || '$'} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="stock"
                  label={translate('stock')}
                  rules={[{ type: 'number', min: 0, message: translate('stock') + ' debe ser mayor o igual a 0' }]}
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    step={1}
                    style={{ width: '100%' }}
                    addonAfter="unidades"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="enabled"
                  label={translate('enabled')}
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch 
                    checkedChildren="Sí" 
                    unCheckedChildren="No"
                    defaultChecked
                  />
                </Form.Item>
              </Col>
            </Row>

                     <Form.Item
             name="description"
             label={translate('description')}
           >
             <TextArea 
               placeholder={translate('product_description')} 
               rows={4}
             />
           </Form.Item>

                                         <Form.Item
                      name="image"
                      label={translate('image')}
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        onChange={({ fileList }) => {
                          // Actualizar el valor del formulario con la lista de archivos
                          form.setFieldValue('image', fileList);
                        }}
                      >
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>{translate('click_to_upload')}</div>
                        </div>
                      </Upload>
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

        {/* Panel de detalles del producto (se expande desde la derecha) */}
        <ProductReadItem config={{}} />
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingOutlined style={{ color: '#1890ff' }} />
              {translate('product_details')}
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
          {selectedProduct && (
            <div style={{ padding: '20px 0' }}>
              {/* Layout de dos columnas */}
              <Row gutter={[32, 24]}>
                {/* Columna izquierda - Información del producto */}
                <Col span={12}>
                  {/* Nombre del producto */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('name')}
                    </Text>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#262626' }}>
                      {selectedProduct.name}
                    </div>
                  </div>

                  {/* Categoría */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('product_category')}
                    </Text>
                    <div style={{ fontSize: '14px', color: '#595959' }}>
                      {selectedProduct.category?.name || translate('no_category')}
                    </div>
                  </div>

                  {/* Moneda */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('currency')}
                    </Text>
                    <div style={{ fontSize: '14px', color: '#595959' }}>
                      USD
                    </div>
                  </div>

                  {/* Precio */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('price')}
                    </Text>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#262626' }}>
                      {selectedProduct.price}
                    </div>
                  </div>

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
                      {selectedProduct.description || translate('no_description')}
                    </div>
                  </div>

                  {/* Imagen */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('image')}
                    </Text>
                    <div style={{ textAlign: 'center' }}>
                      {selectedProduct.image ? (
                        <Image
                          width={200}
                          height={200}
                          src={selectedProduct.image}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                          style={{ borderRadius: '8px', border: '2px solid #f0f0f0' }}
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: 200, 
                            height: 200, 
                            backgroundColor: '#fafafa', 
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: '14px',
                            border: '2px dashed #d9d9d9'
                          }}
                        >
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                          {translate('no_image')}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Columna derecha - Metadatos y estado */}
                <Col span={12}>
                  {/* Estado */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('enabled')}
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <Tag 
                        color={selectedProduct.enabled ? '#52c41a' : '#ff4d4f'}
                        style={{ 
                          borderRadius: '16px', 
                          padding: '4px 12px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        {selectedProduct.enabled ? translate('enabled') : translate('disabled')}
                      </Tag>
                    </div>
                  </div>

                  {/* Creado por */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('created_by')}
                    </Text>
                    <div style={{ fontSize: '14px', color: '#595959' }}>
                      {selectedProduct.createdBy?.firstName && selectedProduct.createdBy?.lastName 
                        ? `${selectedProduct.createdBy.firstName} ${selectedProduct.createdBy.lastName}`
                        : 'Usuario del sistema'
                      }
                    </div>
                  </div>

                  {/* Actualizado por */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('updated_by')}
                    </Text>
                    <div style={{ fontSize: '14px', color: '#595959' }}>
                      {selectedProduct.updatedBy?.firstName && selectedProduct.updatedBy?.lastName 
                        ? `${selectedProduct.updatedBy.firstName} ${selectedProduct.updatedBy.lastName}`
                        : 'No actualizado'
                      }
                    </div>
                  </div>

                  {/* Fecha de creación */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('created')}
                    </Text>
                    <div style={{ fontSize: '14px', color: '#595959' }}>
                      {new Date(selectedProduct.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Última actualización */}
                  <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                      {translate('updated')}
                    </Text>
                    <div style={{ fontSize: '14px', color: '#595959' }}>
                      {selectedProduct.updatedAt 
                        ? new Date(selectedProduct.updatedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'No actualizado'
                      }
                    </div>
                  </div>

                  {/* Stock (si existe) */}
                  {selectedProduct.stock !== undefined && (
                    <div style={{ marginBottom: '20px' }}>
                      <Text strong style={{ fontSize: '16px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                        Stock
                      </Text>
                      <div style={{ fontSize: '16px', color: '#262626', fontWeight: '500' }}>
                        {selectedProduct.stock} unidades
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal>
     </div>
   );
 }
