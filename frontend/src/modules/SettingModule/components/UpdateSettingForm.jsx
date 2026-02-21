import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { settingsAction } from '@/redux/settings/actions';
import { selectSettings } from '@/redux/settings/selectors';

import { Button, Form } from 'antd';
import Loading from '@/components/Loading';
import useLanguage from '@/locale/useLanguage';
import React from 'react'; // Added missing import for React

export default function UpdateSettingForm({ config, children, withUpload, uploadSettingKey }) {
  let { entity, settingsCategory } = config;
  const dispatch = useDispatch();
  const { result, isLoading } = useSelector(selectSettings);
  const translate = useLanguage();
  const [form] = Form.useForm();

  const onSubmit = (fieldsValue) => {
    console.log('🚀 ~ onSubmit ~ fieldsValue:', fieldsValue);
    
    // Si no hay campos de configuración, no hacer nada
    if (!fieldsValue || Object.keys(fieldsValue).length === 0) {
      console.log('⚠️ No hay campos de configuración para procesar');
      return;
    }
    
    if (withUpload) {
      console.log('📁 Procesando upload...');
      
      if (fieldsValue.file) {
        fieldsValue.file = fieldsValue.file[0].originFileObj;
        console.log('📁 Archivo procesado:', fieldsValue.file);
      } else {
        console.log('❌ No se encontró archivo en fieldsValue.file');
      }
      
      dispatch(
        settingsAction.upload({ entity, settingKey: uploadSettingKey, jsonData: fieldsValue })
      );
    } else {
      const settings = [];

      // Procesar campos de configuración de PDF
      if (settingsCategory === 'pdf_settings') {
        console.log('📄 Procesando configuración de PDF...');
        
        // Solo incluir campos que tengan valor
        if (fieldsValue.pdf_invoice_footer !== undefined && fieldsValue.pdf_invoice_footer !== '') {
          settings.push({ settingKey: 'pdf_invoice_footer', settingValue: fieldsValue.pdf_invoice_footer });
        }
        if (fieldsValue.pdf_quote_footer !== undefined && fieldsValue.pdf_quote_footer !== '') {
          settings.push({ settingKey: 'pdf_quote_footer', settingValue: fieldsValue.pdf_quote_footer });
        }
        if (fieldsValue.pdf_offer_footer !== undefined && fieldsValue.pdf_offer_footer !== '') {
          settings.push({ settingKey: 'pdf_offer_footer', settingValue: fieldsValue.pdf_offer_footer });
        }
        if (fieldsValue.pdf_payment_footer !== undefined && fieldsValue.pdf_payment_footer !== '') {
          settings.push({ settingKey: 'pdf_payment_footer', settingValue: fieldsValue.pdf_payment_footer });
        }
        
        console.log('📄 Configuraciones de PDF a actualizar:', settings);
      } else {
        // Procesar otros tipos de configuración como antes
        for (const [key, value] of Object.entries(fieldsValue)) {
          if (value !== undefined && value !== '') {
            settings.push({ settingKey: key, settingValue: value });
          }
        }
      }

      if (settings.length > 0) {
        console.log('📋 Enviando configuraciones:', settings);
        dispatch(settingsAction.updateMany({ entity, jsonData: { settings } }));
      } else {
        console.log('⚠️ No hay configuraciones para actualizar');
      }
    }
  };

  useEffect(() => {
    const current = result[settingsCategory];

    form.setFieldsValue(current);
  }, [result]);

  return (
    <div>
      <Loading isLoading={isLoading}>
        <Form
          form={form}
          onFinish={onSubmit}
          // onValuesChange={handleValuesChange}
          labelCol={{ span: 10 }}
          labelAlign="left"
          wrapperCol={{ span: 16 }}
          // Solo permitir submit si hay campos
          onFinishFailed={() => console.log('Form submit falló')}
        >
          {children}
          {/* Solo mostrar botón de submit si hay campos de configuración */}
          {React.Children.count(children) > 0 && (
            <Form.Item
              style={{
                display: 'inline-block',
                paddingRight: '5px',
              }}
            >
              <Button type="primary" htmlType="submit">
                {translate('Save')}
              </Button>
            </Form.Item>
          )}
          <Form.Item
            style={{
              display: 'inline-block',
              paddingLeft: '5px',
            }}
          >
            {/* <Button onClick={() => console.log('Cancel clicked')}>{translate('Cancel')}</Button> */}
          </Form.Item>
        </Form>
      </Loading>
    </div>
  );
}
