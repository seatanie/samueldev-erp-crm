const mongoose = require('mongoose');

const Model = mongoose.model('Setting');

const updateManySetting = async (req, res) => {
  // req/body = [{settingKey:"",settingValue}]
  let settingsHasError = false;
  const updateDataArray = [];
  const { settings } = req.body;

  for (const setting of settings) {
    if (!setting.hasOwnProperty('settingKey') || !setting.hasOwnProperty('settingValue')) {
      settingsHasError = true;
      break;
    }

    const { settingKey, settingValue } = setting;

    // Determinar el settingCategory basado en el settingKey
    let settingCategory = 'app_settings'; // default
    
    if (settingKey.startsWith('pdf_')) {
      settingCategory = 'pdf_settings';
    } else if (settingKey.startsWith('company_')) {
      settingCategory = 'company_settings';
    } else if (settingKey.startsWith('finance_')) {
      settingCategory = 'finance_settings';
    } else if (settingKey.startsWith('crm_')) {
      settingCategory = 'crm_settings';
    } else if (settingKey.startsWith('money_') || settingKey.startsWith('currency_')) {
      settingCategory = 'money_format_settings';
    }

    updateDataArray.push({
      updateOne: {
        filter: { settingKey: settingKey },
        update: { 
          settingValue: settingValue,
          settingCategory: settingCategory,
          updated: new Date()
        },
        upsert: true // Crear si no existe
      },
    });
  }

  if (updateDataArray.length === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settings provided ',
    });
  }
  if (settingsHasError) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'Settings provided has Error',
    });
  }
  
  const result = await Model.bulkWrite(updateDataArray);

  if (!result || result.nMatched < 1) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No settings found by to update',
    });
  } else {
    return res.status(200).json({
      success: true,
      result: [],
      message: 'we update all settings',
    });
  }
};

module.exports = updateManySetting;
