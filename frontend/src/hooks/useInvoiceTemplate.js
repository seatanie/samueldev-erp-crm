import { useState, useEffect } from 'react';

// 🎨 Hook personalizado para manejar templates de facturas
const useInvoiceTemplate = (initialInvoice = null) => {
  const [template, setTemplate] = useState({
    primaryColor: '#52008c',
    secondaryColor: '#222',
    backgroundColor: '#ffffff',
    tableHeaderColor: '#52008c',
    tableRowColor: '#fcfeff',
    fontFamily: 'sans-serif',
    fontSize: 12,
    headerFontSize: 32,
    customLogo: '',
    logoPosition: 'left',
    logoSize: 200,
    logoAlignment: 'left',
    customFields: [],
    customFooter: '',
    borderColor: '#c2e0f2',
    textColor: '#5d6975'
  });

  const [isModified, setIsModified] = useState(false);

  // 🎨 Cargar template existente
  useEffect(() => {
    if (initialInvoice?.invoiceTemplate) {
      setTemplate(initialInvoice.invoiceTemplate);
      setIsModified(false);
    }
  }, [initialInvoice]);

  // 🎨 Actualizar template
  const updateTemplate = (updates) => {
    setTemplate(prev => ({ ...prev, ...updates }));
    setIsModified(true);
  };

  // 🎨 Actualizar color específico
  const updateColor = (colorKey, color) => {
    updateTemplate({ [colorKey]: color.toHexString() });
  };

  // 🎨 Actualizar valor específico
  const updateValue = (key, value) => {
    updateTemplate({ [key]: value });
  };

  // 🎨 Restablecer template a valores por defecto
  const resetTemplate = () => {
    setTemplate({
      primaryColor: '#52008c',
      secondaryColor: '#222',
      backgroundColor: '#ffffff',
      tableHeaderColor: '#52008c',
      tableRowColor: '#fcfeff',
      fontFamily: 'sans-serif',
      fontSize: 12,
      headerFontSize: 32,
      customLogo: '',
      logoPosition: 'left',
      logoSize: 200,
      logoAlignment: 'left',
      customFields: [],
      customFooter: '',
      borderColor: '#c2e0f2',
      textColor: '#5d6975'
    });
    setIsModified(false);
  };

  // 🎨 Aplicar template predefinido
  const applyPresetTemplate = (presetName) => {
    const presets = {
      modern: {
        primaryColor: '#2196F3',
        secondaryColor: '#333',
        backgroundColor: '#ffffff',
        tableHeaderColor: '#2196F3',
        tableRowColor: '#f5f5f5',
        fontFamily: 'Arial',
        fontSize: 12,
        headerFontSize: 28,
        borderColor: '#e0e0e0',
        textColor: '#666'
      },
      corporate: {
        primaryColor: '#2E7D32',
        secondaryColor: '#424242',
        backgroundColor: '#fafafa',
        tableHeaderColor: '#2E7D32',
        tableRowColor: '#f1f8e9',
        fontFamily: 'Georgia',
        fontSize: 11,
        headerFontSize: 32,
        borderColor: '#c8e6c9',
        textColor: '#555'
      },
      creative: {
        primaryColor: '#E91E63',
        secondaryColor: '#333',
        backgroundColor: '#fff8e1',
        tableHeaderColor: '#E91E63',
        tableRowColor: '#fff3e0',
        fontFamily: 'Verdana',
        fontSize: 13,
        headerFontSize: 36,
        borderColor: '#ffcc02',
        textColor: '#666'
      },
      minimal: {
        primaryColor: '#000000',
        secondaryColor: '#333',
        backgroundColor: '#ffffff',
        tableHeaderColor: '#000000',
        tableRowColor: '#f9f9f9',
        fontFamily: 'Helvetica',
        fontSize: 10,
        headerFontSize: 24,
        borderColor: '#e0e0e0',
        textColor: '#666'
      }
    };

    if (presets[presetName]) {
      setTemplate(prev => ({ ...prev, ...presets[presetName] }));
      setIsModified(true);
    }
  };

  // 🎨 Agregar campo personalizado
  const addCustomField = (label, value, position = 'header') => {
    const newField = { label, value, position };
    updateTemplate({
      customFields: [...template.customFields, newField]
    });
  };

  // 🎨 Remover campo personalizado
  const removeCustomField = (index) => {
    const newFields = template.customFields.filter((_, i) => i !== index);
    updateTemplate({ customFields: newFields });
  };

  // 🎨 Actualizar campo personalizado
  const updateCustomField = (index, updates) => {
    const newFields = template.customFields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    updateTemplate({ customFields: newFields });
  };

  // 🎨 Obtener template para envío
  const getTemplateForSubmission = () => {
    return template;
  };

  // 🎨 Verificar si el template es válido
  const isTemplateValid = () => {
    return template.primaryColor && 
           template.secondaryColor && 
           template.backgroundColor &&
           template.fontFamily &&
           template.fontSize > 0 &&
           template.headerFontSize > 0;
  };

  return {
    template,
    isModified,
    updateTemplate,
    updateColor,
    updateValue,
    resetTemplate,
    applyPresetTemplate,
    addCustomField,
    removeCustomField,
    updateCustomField,
    getTemplateForSubmission,
    isTemplateValid
  };
};

export default useInvoiceTemplate;












