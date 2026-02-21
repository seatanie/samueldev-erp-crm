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
  MoreOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import useLanguage from '@/locale/useLanguage';
import useMoney from '@/settings/useMoney';
import productService from '@/services/productService';
import productCategoryService from '@/services/productCategoryService';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useCrudContext } from '@/context/crud';
import { CrudContextProvider } from '@/context/crud';
import { CrudLayout } from '@/layout';
import ProductReadItem from './components/ProductReadItem';
import DynamicForm from '@/forms/DynamicForm';
import CreateForm from '@/components/CreateForm';
import UpdateForm from '@/components/UpdateForm';
import SearchItem from '@/components/SearchItem';
import { fields } from '@/pages/Product/config';
import './product-module.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Componente de tabla personalizado para productos
function ProductDataTable({ products, loading, onRead, onEdit, onDelete, onRefresh, onSearch, onAdd }) {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();

  const items = [
    {
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    {
      type: 'divider',
    },
    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const columns = [
    {
      title: translate('name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <div style={{ fontSize: '12px', color: '#999' }}>Ref: {record.reference}</div>
          </div>
        </div>
      )
    },
    {
      title: translate('product_category'),
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        // Asegurar que category sea un objeto válido
        if (!category || typeof category !== 'object') {
          return <Tag color="default">Sin categoría</Tag>;
        }
        
        return (
          <Tag color={category.color} style={{ borderRadius: '12px' }}>
            {category.name || 'Sin nombre'}
          </Tag>
        );
      }
    },
    {
      title: translate('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text strong style={{ color: '#52c41a' }}>
          {moneyFormatter(price)}
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
      title: translate('status'),
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? '#52c41a' : '#ff4d4f'}>
          {enabled ? 'Habilitado' : 'Deshabilitado'}
        </Tag>
      )
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  onRead(record);
                  break;
                case 'edit':
                  onEdit(record);
                  break;
                case 'delete':
                  onDelete(record);
                  break;
                default:
                  break;
              }
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        title={translate('product_list')}
        ghost={false}
        extra={[
          <Input
            key="searchFilterDataTable"
            onChange={(e) => onSearch(e.target.value)}
            placeholder={translate('search')}
            allowClear
          />,
          <Button onClick={onRefresh} key="refresh" icon={<ReloadOutlined />}>
            {translate('Refresh')}
          </Button>,
          <Button 
            key="add" 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onAdd}
          />
        ]}
        style={{
          padding: '20px 0px',
        }}
      />
      <Table
        columns={columns}
        rowKey="_id"
        dataSource={products}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} de ${total} productos`
        }}
        scroll={{ x: true }}
      />
    </>
  );
}

function ProductModuleContent() {
  const translate = useLanguage();
  const { moneyFormatter, currency_symbol } = useMoney();
  const dispatch = useDispatch();
  const { crudContextAction } = useCrudContext();
  const { readBox, editBox, panel, collapsedBox } = crudContextAction;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Cargar productos y categorías desde el backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getProductsWithCategories(),
        productCategoryService.getCategories()
      ]);

      if (productsResponse.success) {
        setProducts(productsResponse.result.products || []);
      } else {
        message.error('Error al cargar productos');
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.result || []);
      } else {
        message.error('Error al cargar categorías');
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

  // Filtrar productos por búsqueda
  const filteredProducts = (products || []).filter(product => {
    if (!searchText) return true;
    return product.name.toLowerCase().includes(searchText.toLowerCase()) ||
           product.reference.toLowerCase().includes(searchText.toLowerCase());
  });

  // Manejar acciones de la tabla
  const handleRead = (product) => {
    dispatch(crud.currentItem({ data: product }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };

  const handleEdit = (product) => {
    dispatch(crud.currentItem({ data: product }));
    dispatch(crud.currentAction({ actionType: 'update', data: product }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  };

  const handleDelete = (product) => {
    Modal.confirm({
      title: '¿Estás seguro?',
      content: `¿Deseas eliminar el producto "${product.name}"?`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await productService.deleteProduct(product._id);
          if (response.success) {
            message.success('Producto eliminado exitosamente');
            loadData();
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

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleAdd = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <ProductDataTable
      products={filteredProducts}
      loading={loading}
      onRead={handleRead}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
      onSearch={handleSearch}
      onAdd={handleAdd}
    />
  );
}

// Componente para el panel superior (mostrar/editar)
function SidePanelTopContent() {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const { crudContextAction } = useCrudContext();
  const { modal, editBox } = crudContextAction;
  const { result: currentItem } = useSelector(selectCurrentItem);

  const removeItem = () => {
    dispatch(crud.currentAction({ actionType: 'delete', data: currentItem }));
    modal.open();
  };

  const editItem = () => {
    dispatch(crud.currentAction({ actionType: 'update', data: currentItem }));
    editBox.open();
  };

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col span={10}>
          <p style={{ marginBottom: '10px' }}>{currentItem?.name}</p>
        </Col>
        <Col span={14}>
          <Button
            onClick={removeItem}
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '5px', marginTop: '10px' }}
          >
            {translate('remove')}
          </Button>
          <Button
            onClick={editItem}
            type="text"
            icon={<EditOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '0px', marginTop: '10px' }}
          >
            {translate('edit')}
          </Button>
        </Col>
        <Col span={24}>
          <div className="line"></div>
        </Col>
        <div className="space10"></div>
      </Row>
      <ProductReadItem config={{}} />
      <UpdateForm config={{ fields }} formElements={<DynamicForm fields={fields} />} />
    </>
  );
}

// Componente para el panel inferior (crear)
function SidePanelBottomContent() {
  return <CreateForm config={{ fields }} formElements={<DynamicForm fields={fields} />} />;
}

// Componente para el header fijo (ya no se usa)
function FixHeaderPanel() {
  return null;
}

export default function ProductModule() {
  const translate = useLanguage();
  
  return (
    <CrudContextProvider>
      <CrudLayout
        config={{
          entity: 'product',
          PANEL_TITLE: translate('products'),
          DATATABLE_TITLE: translate('product_list'),
          ADD_NEW_ENTITY: translate('add_product'),
          ENTITY_NAME: translate('product'),
          fields
        }}
        fixHeaderPanel={<FixHeaderPanel />}
        sidePanelBottomContent={<SidePanelBottomContent />}
        sidePanelTopContent={<SidePanelTopContent />}
      >
        <ProductModuleContent />
      </CrudLayout>
    </CrudContextProvider>
  );
}
