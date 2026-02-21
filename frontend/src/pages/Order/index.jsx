import { Tag } from 'antd';
import OrderDataTableModule from '@/modules/OrderModule/OrderDataTableModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import { useMoney } from '@/settings';
import useLanguage from '@/locale/useLanguage';

export default function Order() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const entity = 'order';

  const searchConfig = {
    displayLabels: ['orderNumber', 'customer.name'],
    searchFields: 'orderNumber,customer.name',
  };
  const deleteModalLabels = ['orderNumber'];

  // Configuración de columnas personalizadas para la tabla
  const dataTableColumns = [
    {
      title: translate('order_number'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: translate('customer'),
      dataIndex: ['customer', 'name'],
      key: 'customer',
    },
    {
      title: translate('product'),
      dataIndex: ['product', 'name'],
      key: 'product',
    },
    {
      title: translate('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: translate('price'),
      dataIndex: 'price',
      key: 'price',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (price) => moneyFormatter({ amount: price, currency_code: 'USD' }),
    },
    {
      title: translate('discount'),
      dataIndex: 'discount',
      key: 'discount',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (discount) => moneyFormatter({ amount: discount || 0, currency_code: 'USD' }),
    },
    {
      title: translate('total'),
      dataIndex: 'total',
      key: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total) => moneyFormatter({ amount: total, currency_code: 'USD' }),
    },
    {
      title: translate('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'pending': { color: 'orange', text: translate('pending') },
          'processing': { color: 'blue', text: translate('processing') },
          'shipped': { color: 'purple', text: translate('shipped') },
          'delivered': { color: 'green', text: translate('delivered') },
          'cancelled': { color: 'red', text: translate('cancelled') }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('orders'),
    DATATABLE_TITLE: translate('order_list'),
    ADD_NEW_ENTITY: translate('add_new_order'),
    ENTITY_NAME: translate('order'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  
  return (
    <OrderDataTableModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}
