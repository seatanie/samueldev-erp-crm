const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
const schema = require('./schemaValidate');
const FactusService = require('@/services/factusService');

const create = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0, discount = 0, invoiceTemplate } = value;

  // default
  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;

  //Calculate the items array with subTotal, total, taxTotal
  items.map((item) => {
    let total = calculate.multiply(item['quantity'], item['price']);
    //sub total
    subTotal = calculate.add(subTotal, total);
    //item total
    item['total'] = total;
  });
  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.add(subTotal, taxTotal);

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;
  
  // 🎨 Agregar template de personalización si existe
  if (invoiceTemplate) {
    console.log('🎨 Template recibido:', invoiceTemplate);
    console.log('🎨 Tipo de template:', typeof invoiceTemplate);
    console.log('🎨 Template parseado:', JSON.stringify(invoiceTemplate, null, 2));
    body['invoiceTemplate'] = invoiceTemplate;
  } else {
    console.log('⚠️ No se recibió template de personalización');
  }

  let paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

  body['paymentStatus'] = paymentStatus;
  body['createdBy'] = req.admin._id;

  // Creating a new document in the collection
  const result = await new Model(body).save();
  const fileId = 'invoice-' + result._id + '.pdf';
  const updateResult = await Model.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    {
      new: true,
    }
  ).exec();
  // Returning successfull response

  increaseBySettingKey({
    settingKey: 'last_invoice_number',
  });

  // 🚀 Enviar automáticamente a FACTUS si está habilitado
  try {
    const factus = new FactusService();
    const factusResult = await factus.createElectronicInvoice(updateResult);
    
    if (factusResult.success) {
      // Actualizar la factura con la información de FACTUS
      const updateData = {
        'factus.factusId': factusResult.factusId,
        'factus.status': factusResult.status,
        'factus.createdAt': new Date(),
        'factus.data': factusResult.data
      };

      // Si es sandbox, agregar información adicional
      if (factusResult.warning) {
        updateData['factus.warning'] = factusResult.warning;
        updateData['factus.sandbox'] = true;
        console.log('⚠️ FACTUS en modo sandbox - simulación completada');
      }

      await Model.findOneAndUpdate(
        { _id: updateResult._id },
        updateData,
        { new: true }
      ).exec();
      
      console.log('✅ Factura procesada en FACTUS:', factusResult.factusId);
      if (factusResult.warning) {
        console.log('ℹ️ Advertencia:', factusResult.warning);
      }
    } else {
      console.error('❌ Error en FACTUS:', factusResult.error);
      // No fallar la creación de la factura si FACTUS falla
    }
  } catch (error) {
    console.error('⚠️ Error enviando a FACTUS (continuando sin FACTUS):', error.message);
    // No fallar la creación de la factura si FACTUS falla
  }

  // Returning successfull response
  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Invoice created successfully',
  });
};

module.exports = create;
