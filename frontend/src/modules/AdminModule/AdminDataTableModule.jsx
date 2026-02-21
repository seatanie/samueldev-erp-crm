import { useLayoutEffect, useEffect, useState, useCallback } from 'react';
import { Row, Col, Button, message, Table, Input, Dropdown, Form, Input as AntInput, Modal } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  EllipsisOutlined,
  ArrowLeftOutlined,
  RedoOutlined,
  LockOutlined,
  CopyOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';

import CreateForm from '@/components/CreateForm';
import UpdateForm from '@/components/UpdateForm';
import DeleteModal from '@/components/DeleteModal';
import AdminReadItem from './AdminReadItem';
import SearchItem from '@/components/SearchItem';

import { useDispatch, useSelector } from 'react-redux';

import { selectCurrentItem, selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';
import { generate as uniqueId } from 'shortid';

import { CrudLayout } from '@/layout';
import adminService from '@/services/crud/admin';
import './admin-module.css';

function SidePanelTopContent({ config, formElements, withUpload }) {
  const translate = useLanguage();
  const { crudContextAction, state } = useCrudContext();
  const { deleteModalLabels } = config;
  const { modal, editBox, advancedBox } = crudContextAction;

  const { isReadBoxOpen, isEditBoxOpen, isAdvancedBoxOpen } = state;
  const { result: currentItem } = useSelector(selectCurrentItem);
  const dispatch = useDispatch();

  const [labels, setLabels] = useState('');
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (currentItem) {
      const currentlabels = deleteModalLabels.map((x) => {
        if (x.includes('.')) {
          const parts = x.split('.');
          let value = currentItem;
          for (const part of parts) {
            value = value?.[part];
          }
          return value;
        }
        return currentItem[x];
      }).join(' ');

      setLabels(currentlabels);
    }
  }, [currentItem]);

  const removeItem = () => {
    dispatch(crud.currentAction({ actionType: 'delete', data: currentItem }));
    modal.open();
  };

  const editItem = () => {
    dispatch(crud.currentAction({ actionType: 'update', data: currentItem }));
    editBox.open();
  };

  const handleUpdatePassword = () => {
    setIsPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async (values) => {
    try {
      const response = await adminService.updatePassword(currentItem._id, values);
      if (response.success) {
        message.success('Contraseña actualizada exitosamente');
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error(response.message || 'Error al actualizar contraseña');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      message.error('Error al actualizar contraseña');
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(currentItem._id);
    message.success('ID copiado al portapapeles');
  };

  const show = isReadBoxOpen || isEditBoxOpen || isAdvancedBoxOpen ? { opacity: 1 } : { opacity: 0 };
  
  return (
    <>
      <Row style={show} gutter={(24, 24)}>
        <Col span={10}>
          <p style={{ marginBottom: '10px' }}>{labels}</p>
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
          <Button
            onClick={copyId}
            type="text"
            icon={<CopyOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '0px', marginTop: '10px' }}
          >
            Copiar ID
          </Button>
          <Button
            onClick={handleUpdatePassword}
            type="text"
            icon={<LockOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '0px', marginTop: '10px' }}
          >
            Actualizar contraseña
          </Button>
        </Col>

        <Col span={24}>
          <div className="line"></div>
        </Col>
        <div className="space10"></div>
      </Row>
      <AdminReadItem config={config} />
      <UpdateForm config={config} formElements={formElements} withUpload={withUpload} />
      
      {/* Modal para actualizar contraseña */}
      <Modal
        title="Administrador"
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
        style={{ top: 20 }}
      >
        <div style={{ padding: '0 24px' }}>
          {/* Título principal */}
          <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600' }}>
            Administrador
          </h2>

          {/* Barra de búsqueda y botón agregar */}
          <div style={{ display: 'flex', marginBottom: '24px', gap: '8px' }}>
            <Input
              placeholder="Buscar administrador..."
              style={{ flex: 1 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} size="large">
              +
            </Button>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <Button icon={<DeleteOutlined />} size="large">
              Eliminar
            </Button>
            <Button icon={<EditOutlined />} size="large">
              Editar
            </Button>
            <Button 
              icon={<LockOutlined />} 
              size="large"
              type="primary"
            >
              Actualizar contraseña
            </Button>
          </div>

          {/* Sección de actualizar contraseña */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
              Actualizar contraseña
            </h3>
            
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
            >
              <Form.Item
                name="newPassword"
                label="* Nueva contraseña"
                rules={[
                  { required: true, message: 'Por favor ingresa la nueva contraseña' },
                  { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                ]}
                style={{ marginBottom: '16px' }}
              >
                <AntInput.Password
                  placeholder="Ingresa la nueva contraseña"
                  size="large"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeOutlined />)}
                />
              </Form.Item>

              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button
                  onClick={() => {
                    setIsPasswordModalVisible(false);
                    passwordForm.resetFields();
                  }}
                  style={{ marginRight: 8 }}
                  size="large"
                >
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  Guardar
                </Button>
              </div>
            </Form>
          </div>

          {/* Botón agregar nuevo administrador */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button type="primary" size="large" style={{ width: '100%' }}>
              AGREGAR NUEVO ADMINISTRADOR
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function FixHeaderPanel({ config }) {
  const { crudContextAction } = useCrudContext();

  const { collapsedBox } = crudContextAction;

  const addNewItem = () => {
    collapsedBox.close();
  };

  return (
    <Row gutter={8}>
      <Col className="gutter-row" span={21}>
        <SearchItem config={config} />
      </Col>
      <Col className="gutter-row" span={3}>
        <Button onClick={addNewItem} block={true} icon={<PlusOutlined />}></Button>
      </Col>
    </Row>
  );
}

function AddNewItem({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;

  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <Button onClick={handelClick} type="primary">
      {ADD_NEW_ENTITY}
    </Button>
  );
}

function AdminDataTable({ config }) {
  let { entity, dataTableColumns, DATATABLE_TITLE, fields, searchConfig } = config;
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox, advancedBox } = crudContextAction;
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

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
      label: 'Copiar ID',
      key: 'copyId',
      icon: <CopyOutlined />,
    },
    {
      label: 'Actualizar contraseña',
      key: 'updatePassword',
      icon: <LockOutlined />,
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

  const handleRead = (record) => {
    dispatch(crud.currentItem({ data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };
  
  function handleEdit(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }
  
  function handleDelete(record) {
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  }

  function handleCopyId(record) {
    navigator.clipboard.writeText(record._id);
    message.success('ID copiado al portapapeles');
  }

  function handleUpdatePassword(record) {
    dispatch(crud.currentItem({ data: record }));
    advancedBox.open();
    panel.open();
    collapsedBox.open();
  }

  let dispatchColumns = [];
  if (fields) {
    dispatchColumns = [...dataForTable({ fields, translate, moneyFormatter, dateFormat })];
  } else {
    dispatchColumns = [...dataTableColumns];
  }

  dataTableColumns = [
    ...dispatchColumns,
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
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;
                case 'copyId':
                  handleCopyId(record);
                  break;
                case 'updatePassword':
                  handleUpdatePassword(record);
                  break;
                case 'delete':
                  handleDelete(record);
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

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);
  const { pagination, items: dataSource } = listResult;
  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback((pagination) => {
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(crud.list({ entity, options }));
  }, []);

  const filterTable = (e) => {
    const value = e.target.value;
    const options = { q: value, fields: searchConfig?.searchFields || '' };
    dispatch(crud.list({ entity, options }));
  };

  const dispatcher = () => {
    dispatch(crud.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        title={DATATABLE_TITLE}
        ghost={false}
        extra={[
          <Input
            key={`searchFilterDataTable}`}
            onChange={filterTable}
            placeholder={translate('search')}
            allowClear
          />,
          <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
            {translate('Refresh')}
          </Button>,
          <AddNewItem key={`${uniqueId()}`} config={config} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <Table
        columns={dataTableColumns}
        rowKey={(item) => item._id}
        dataSource={dataSource}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
      />
    </>
  );
}

function AdminDataTableModule({ config, createForm, updateForm, withUpload = false }) {
  const dispatch = useDispatch();
  const translate = useLanguage();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  return (
    <CrudLayout
      config={config}
      fixHeaderPanel={<FixHeaderPanel config={config} />}
      sidePanelBottomContent={
        <CreateForm config={config} formElements={createForm} withUpload={withUpload} />
      }
      sidePanelTopContent={
        <SidePanelTopContent config={config} formElements={updateForm} withUpload={withUpload} />
      }
    >
      <AdminDataTable config={config} />
      <DeleteModal config={config} />
    </CrudLayout>
  );
}

export default AdminDataTableModule;
