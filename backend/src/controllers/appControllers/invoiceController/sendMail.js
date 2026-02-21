const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Resend } = require('resend');
const { generatePdf } = require('@/controllers/pdfController');
const { listAllSettings } = require('@/middlewares/settings');
const awsS3Service = require('@/services/awsS3Service');
const epaycoService = require('@/services/epaycoService');

const mail = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invoice ID is required',
      });
    }

    // Buscar la factura
    const Invoice = mongoose.model('Invoice');
    const invoice = await Invoice.findById(id)
      .populate('client')
      .populate('createdBy')
      .exec();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Invoice not found',
      });
    }

    // Verificar que la factura tenga un cliente
    if (!invoice.client || !invoice.client.email) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invoice must have a client with email address',
      });
    }

    // Cargar configuraciones
    const settings = await listAllSettings();
    const appEmail = process.env.RESEND_FROM_EMAIL || settings.samueldev_app_email || 'noreply@resend.dev';
    const appName = settings.samueldev_app_name || 'Samuel Dev ERP CRM';

        // Crear enlace de pago de ePayco si está configurado
    let paymentButton = '';
    if (epaycoService.isConfigured && invoice.paymentStatus !== 'paid') {
      try {
        const paymentResult = await epaycoService.createDirectPaymentLink(invoice, invoice.client);
        if (paymentResult.success) {
          paymentButton = `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentResult.paymentUrl}" 
                 class="download-btn" 
                 style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); border: 2px solid #ffffff;"
                 target="_blank">
                 💳 Pagar con ePayco
               </a>
            </div>
          `;
        }
      } catch (error) {
        console.log('⚠️ Error creando enlace de pago:', error.message);
      }
    }

    if (!appEmail) {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'App email not configured. Please set RESEND_FROM_EMAIL in your .env file',
      });
    }

    // Generar PDF si no existe
    let pdfPath = invoice.pdf;
    if (!pdfPath || !fs.existsSync(path.join(process.cwd(), 'public', 'download', 'invoice', pdfPath))) {
      // Generar PDF
      const targetLocation = path.join(process.cwd(), 'public', 'download', 'invoice', `invoice-${invoice._id}.pdf`);
      
      await new Promise((resolve, reject) => {
        generatePdf(
          'invoice',
          { 
            filename: `invoice-${invoice._id}`, 
            format: 'A4', 
            targetLocation 
          },
          invoice,
          (error) => {
            if (error) reject(error);
            else resolve();
          }
        );
      });
      
      pdfPath = `invoice-${invoice._id}.pdf`;
      
      // Actualizar la factura con el nuevo PDF
      await Invoice.findByIdAndUpdate(id, { pdf: pdfPath });
    }

    // Configurar Resend
    const resend = new Resend(process.env.RESEND_API);
    
    // Preparar adjuntos - Usar AWS S3 para adjuntos reales
    let attachments = [];
    const localPdfPath = path.join(process.cwd(), 'public', 'download', 'invoice', pdfPath);
    
    if (fs.existsSync(localPdfPath)) {
      if (awsS3Service.isConfigured()) {
        console.log('🚀 Subiendo PDF a AWS S3 para adjuntarlo...');
        
        try {
          const uploadResult = await awsS3Service.uploadFile(
            localPdfPath, 
            pdfPath, 
            'invoices'
          );
          
          if (uploadResult.success) {
            attachments.push({
              filename: pdfPath,
              path: uploadResult.url
            });
            
            console.log('✅ PDF subido a S3 y adjuntado al email');
          } else {
            console.log('⚠️ No se pudo subir PDF a S3, enviando email con enlace de descarga');
          }
        } catch (error) {
          console.log('⚠️ Error subiendo a S3:', error.message, 'Enviando email con enlace de descarga');
        }
      } else {
        console.log('⚠️ AWS S3 no configurado, enviando email con enlace de descarga');
      }
    } else {
      console.log('⚠️ PDF no encontrado en:', localPdfPath);
    }
    
    // Crear plantilla de email PROFESIONAL
    const emailSubject = `Factura #${invoice.number}/${invoice.year} - ${appName}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${emailSubject}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 40px 30px; 
            text-align: center;
            color: white;
          }
          .company-logo {
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: 600; 
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          .greeting {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
          }
          .invoice-card {
            padding: 30px;
            background: white;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f1f3f4;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .invoice-subtitle {
            font-size: 16px;
            color: #7f8c8d;
            font-weight: 400;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 30px;
          }
          .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .info-section-title {
            font-size: 14px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-item {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .info-label {
            font-weight: 500;
            color: #5a6c7d;
            margin-bottom: 2px;
          }
          .info-value {
            color: #2c3e50;
            font-weight: 400;
          }
          .items-section {
            margin-bottom: 30px;
          }
          .items-title {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #f1f3f4;
          }
          .item-row:last-child {
            border-bottom: none;
          }
          .item-name {
            font-weight: 500;
            color: #2c3e50;
            flex: 1;
          }
          .item-quantity {
            color: #7f8c8d;
            margin: 0 15px;
            font-size: 14px;
          }
          .item-price {
            font-weight: 600;
            color: #2c3e50;
            min-width: 80px;
            text-align: right;
          }
          .summary-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 15px;
          }
          .summary-item:last-child {
            margin-bottom: 0;
          }
          .summary-label {
            color: #5a6c7d;
            font-weight: 400;
          }
          .summary-value {
            color: #2c3e50;
            font-weight: 500;
          }
          .total-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
          }
          .total-label {
            font-size: 16px;
            color: rgba(255,255,255,0.9);
            margin-bottom: 8px;
            font-weight: 400;
          }
          .total-amount {
            font-size: 36px;
            font-weight: 700;
            color: white;
            letter-spacing: -1px;
          }
          .payment-section {
            text-align: center;
            margin-bottom: 30px;
          }
          .payment-btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            border: none;
            cursor: pointer;
          }
          .payment-btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }
          .attachment-info {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
            border-left: 4px solid #27ae60;
          }
          .attachment-icon {
            font-size: 24px;
            margin-bottom: 8px;
            color: #27ae60;
          }
          .attachment-text {
            font-size: 16px;
            color: #27ae60;
            font-weight: 500;
          }
          .footer { 
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer-text {
            color: #7f8c8d;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .footer-company {
            color: #667eea;
            font-weight: 600;
            font-size: 16px;
            margin-top: 10px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e9ecef, transparent);
            margin: 20px 0;
          }
          @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
            .container { margin: 10px; }
            .invoice-card { padding: 20px; }
            .header { padding: 30px 20px; }
            .total-amount { font-size: 28px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-logo">🏢</div>
            <div class="company-name">${appName}</div>
            <div class="greeting">Hola ${invoice.client.name || 'Cliente'},</div>
          </div>
          
          <div class="invoice-card">
            <div class="invoice-header">
              <div class="invoice-title">Factura #${invoice.number}/${invoice.year}</div>
              <div class="invoice-subtitle">Detalles de tu compra</div>
            </div>
            
            <div class="info-grid">
              <div class="info-section">
                <div class="info-section-title">Información de la Factura</div>
                <div class="info-item">
                  <div class="info-label">Fecha de emisión</div>
                  <div class="info-value">${new Date(invoice.date).toLocaleDateString('es-CO')}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Número de factura</div>
                  <div class="info-value">${invoice.number}/${invoice.year}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Estado</div>
                  <div class="info-value">${invoice.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente'}</div>
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-section-title">Información del Cliente</div>
                <div class="info-item">
                  <div class="info-label">Nombre</div>
                  <div class="info-value">${invoice.client.name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${invoice.client.email || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Teléfono</div>
                  <div class="info-value">${invoice.client.phone || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div class="items-section">
              <div class="items-title">Productos y Servicios</div>
              ${invoice.items?.map(item => `
                <div class="item-row">
                  <div class="item-name">${item.itemName || item.description || 'Producto'}</div>
                  <div class="item-quantity">Cant: ${item.quantity || 1}</div>
                  <div class="item-price">${invoice.currency} ${(item.price || 0).toFixed(2)}</div>
                </div>
              `).join('') || `
                <div class="item-row">
                  <div class="item-name">Servicio</div>
                  <div class="item-quantity">Cant: 1</div>
                  <div class="item-price">${invoice.currency} ${(invoice.total || 0).toFixed(2)}</div>
                </div>
              `}
            </div>
            
            <div class="summary-section">
              <div class="summary-item">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">${invoice.currency} ${invoice.subTotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Impuestos (${invoice.taxRate || 0}%)</span>
                <span class="summary-value">${invoice.currency} ${invoice.taxTotal?.toFixed(2) || '0.00'}</span>
              </div>
              ${invoice.discount > 0 ? `
                <div class="summary-item">
                  <span class="summary-label">Descuento</span>
                  <span class="summary-value">-${invoice.currency} ${invoice.discount?.toFixed(2) || '0.00'}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="total-section">
              <div class="total-label">Total a Pagar</div>
              <div class="total-amount">${invoice.currency} ${invoice.total?.toFixed(2) || '0.00'}</div>
            </div>
            
            <div class="payment-section">
              ${paymentButton}
            </div>
            
            <div class="attachment-info">
              <div class="attachment-icon">📎</div>
              <div class="attachment-text">La factura PDF está adjunta a este email</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">Esta factura ha sido generada por</div>
            <div class="footer-company">${appName}</div>
            <div class="footer-text">Si tienes alguna pregunta, no dudes en contactarnos</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: appEmail,
      to: invoice.client.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments
    });

    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Error sending email',
        error: error.message,
      });
    }

    // Actualizar estado de la factura a 'sent'
    await Invoice.findByIdAndUpdate(id, { 
      status: 'sent',
      updated: new Date()
    });

                      return res.status(200).json({
                    success: true,
                    result: data,
                    message: `Invoice sent successfully to ${invoice.client.email} with PDF attachment`,
                    hasAttachment: true
                  });

  } catch (error) {
    console.error('❌ Error in sendMail:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Internal server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = mail;
