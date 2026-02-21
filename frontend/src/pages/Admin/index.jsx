import { Tag } from 'antd';
import AdminDataTableModule from '@/modules/AdminModule/AdminDataTableModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

export default function Admin() {
  const translate = useLanguage();
  const entity = 'admin';

  const searchConfig = {
    displayLabels: ['name', 'surname', 'email'],
    searchFields: 'name,surname,email',
  };
  const deleteModalLabels = ['name', 'surname'];

  const dataTableColumns = [
    {
      title: translate('name'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-',
    },
    {
      title: translate('surname'),
      dataIndex: 'surname',
      key: 'surname',
      render: (text) => text || '-',
    },
    {
      title: translate('email'),
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || '-',
    },
    {
      title: translate('role'),
      key: 'role',
      render: (_, record) => {
        const roleColors = {
          owner: 'gold',
          admin: 'blue',
          manager: 'green',
          employee: 'orange',
          create_only: 'purple',
          read_only: 'gray'
        };
        const roleLabels = {
          owner: 'Account Owner',
          admin: 'Super Admin',
          manager: 'Manager',
          employee: 'Employee',
          create_only: 'Create Only',
          read_only: 'Read Only'
        };
        return (
          <Tag color={roleColors[record.role]} style={{ fontWeight: 500 }}>
            {roleLabels[record.role]}
          </Tag>
        );
      },
    },
    {
      title: translate('department'),
      dataIndex: 'department',
      key: 'department',
      render: (text) => text || 'Sin departamento',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('admin'),
    DATATABLE_TITLE: translate('admin_list'),
    ADD_NEW_ENTITY: translate('add_new_admin'),
    ENTITY_NAME: translate('admin'),
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
    <AdminDataTableModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}