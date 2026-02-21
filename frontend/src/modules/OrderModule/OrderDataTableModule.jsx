import { useLayoutEffect, useEffect, useState, useCallback } from 'react';
import { Row, Col, Button, Table, Input, Dropdown, App } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileExcelOutlined, 
  ReloadOutlined,
  EyeOutlined,
  EllipsisOutlined,
  ArrowLeftOutlined,
  RedoOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';

import CreateForm from '@/components/CreateForm';
import UpdateForm from '@/components/UpdateForm';
import DeleteModal from '@/components/DeleteModal';
import OrderReadItem from './OrderReadItem';
import SearchItem from '@/components/SearchItem';
import DataTable from '@/components/DataTable/DataTable';

import { useDispatch, useSelector } from 'react-redux';

import { selectCurrentItem, selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';
import { generate as uniqueId } from 'shortid';

import { CrudLayout } from '@/layout';
import orderService from '@/services/orderService';
import './order-module.css';

function SidePanelTopContent({ config, formElements, withUpload }) {
  const translate = useLanguage();
  const { crudContextAction, state } = useCrudContext();
  const { deleteModalLabels } = config;
  const { modal, editBox } = crudContextAction;

  const { isReadBoxOpen, isEditBoxOpen } = state;
  const { result: currentItem } = useSelector(selectCurrentItem);
  const dispatch = useDispatch();

  const [labels, setLabels] = useState('');
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

  const show = isReadBoxOpen || isEditBoxOpen ? { opacity: 1 } : { opacity: 0 };
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
        </Col>

        <Col span={24}>
          <div className="line"></div>
        </Col>
        <div className="space10"></div>
      </Row>
      <OrderReadItem config={config} />
      <UpdateForm config={config} formElements={formElements} withUpload={withUpload} />
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

function OrderDataTable({ config, onExportExcel, isExporting }) {
  let { entity, dataTableColumns, DATATABLE_TITLE, fields, searchConfig } = config;
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox, advancedBox } = crudContextAction;
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const { message } = App.useApp();

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
      label: 'Generar Factura',
      key: 'createInvoice',
      icon: <FileTextOutlined />,
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

  const handleCreateInvoice = async (record) => {
    try {
      message.loading({ content: 'Generando factura...', key: 'createInvoice' });
      const result = await orderService.createInvoiceFromOrder(record._id);
      message.success({ 
        content: 'Factura creada exitosamente', 
        key: 'createInvoice',
        duration: 4
      });
      
      // Opcional: redirigir a la factura creada
      if (result.result && result.result._id) {
        setTimeout(() => {
          window.open(`/invoice/read/${result.result._id}`, '_blank');
        }, 1000);
      }
    } catch (error) {
      console.error('Error creando factura:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear la factura';
      message.error({ 
        content: errorMessage, 
        key: 'createInvoice',
        duration: 4
      });
    }
  };

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
                case 'createInvoice':
                  handleCreateInvoice(record);
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
          <Button 
            onClick={onExportExcel} 
            key={`${uniqueId()}`} 
            icon={<FileExcelOutlined />}
            loading={isExporting}
            disabled={isExporting}
            className="excel-export-button"
            style={{ 
              backgroundColor: isExporting ? '#95de64' : '#52c41a', 
              borderColor: isExporting ? '#95de64' : '#52c41a',
              color: 'white',
              transition: 'all 0.3s ease',
              transform: isExporting ? 'scale(0.95)' : 'scale(1)',
              animation: isExporting ? 'pulse 1.5s infinite' : 'none'
            }}
            title={translate('export_orders_excel')}
          />,
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
        scroll={{ x: true }}
      />
    </>
  );
}

function OrderDataTableModule({ config, createForm, updateForm, withUpload = false }) {
  const dispatch = useDispatch();
  const translate = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const { message } = App.useApp();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      message.loading({ content: 'Exportando órdenes a Excel...', key: 'export' });
      await orderService.exportToExcel();
      message.success({ content: 'Archivo Excel descargado exitosamente', key: 'export' });
      
      // Animación de éxito
      const button = document.querySelector('.excel-export-button');
      if (button) {
        button.classList.add('excel-download-success');
        setTimeout(() => {
          button.classList.remove('excel-download-success');
        }, 600);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error({ content: 'Error al exportar órdenes a Excel', key: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <App>
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
        <OrderDataTable config={config} onExportExcel={handleExportExcel} isExporting={isExporting} />
        <DeleteModal config={config} />
      </CrudLayout>
    </App>
  );
}

export default OrderDataTableModule;
