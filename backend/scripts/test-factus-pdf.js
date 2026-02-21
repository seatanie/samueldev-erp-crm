/**
 * Script de prueba para generar PDFs con FACTUS
 * Prueba la funcionalidad completa de generación de PDFs
 */

require('dotenv').config({ path: '.env' });
const FactusService = require('../src/services/factusService');
const fs = require('fs');
const path = require('path');

console.log('📄 PRUEBA DE GENERACIÓN DE PDFs CON FACTUS\n');

async function testPDFGeneration() {
  try {
    const factusService = new FactusService();
    
    // Verificar configuración
    if (!factusService.isConfigured) {
      console.log('❌ FACTUS no está configurado');
      return;
    }
    
    console.log('✅ Configuración detectada');
    
    // Autenticar
    console.log('\n🔐 Autenticando...');
    const authResult = await factusService.authenticate();
    
    if (!authResult.success) {
      console.log('❌ Error en autenticación');
      return;
    }
    
    console.log('✅ Autenticación exitosa');
    
    // Crear factura de prueba
    console.log('\n📋 Creando factura de prueba...');
    const testInvoice = {
      _id: 'test-pdf-' + Date.now(),
      number: 'PDF-TEST-001',
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      client: {
        name: 'Cliente PDF Test',
        email: 'test@example.com',
        phone: '3001234567',
        documentType: 'CC',
        documentNumber: '12345678'
      },
      items: [{
        itemName: 'Producto PDF Test',
        description: 'Descripción del producto para PDF',
        quantity: 2,
        price: 50000,
        total: 100000
      }],
      subTotal: 100000,
      taxRate: 19,
      taxTotal: 19000,
      total: 119000,
      currency: 'COP',
      paymentStatus: 'unpaid',
      company: {
        name: 'Empresa PDF Test',
        nit: '900123456-1',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        phone: '6012345678',
        email: 'empresa@example.com'
      }
    };
    
    const invoiceResult = await factusService.createElectronicInvoice(testInvoice);
    
    if (!invoiceResult.success) {
      console.log('❌ Error creando factura:', invoiceResult.error);
      return;
    }
    
    console.log('✅ Factura creada:', invoiceResult.factusId);
    
    // Generar PDF
    console.log('\n📄 Generando PDF...');
    const pdfResult = await factusService.downloadInvoicePDF(invoiceResult.factusId);
    
    if (!pdfResult.success) {
      console.log('❌ Error generando PDF:', pdfResult.error);
      return;
    }
    
    console.log('✅ PDF generado exitosamente!');
    console.log(`📊 Tipo de contenido: ${pdfResult.contentType}`);
    console.log(`📏 Tamaño del PDF: ${pdfResult.pdfBuffer.length} bytes`);
    
    if (pdfResult.sandbox) {
      console.log('⚠️ Modo sandbox - PDF simulado');
      console.log(`ℹ️ Advertencia: ${pdfResult.warning}`);
    }
    
    // Guardar PDF
    const outputDir = path.join(__dirname, '..', 'uploads', 'factus-pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `factura-${invoiceResult.factusId}.pdf`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, pdfResult.pdfBuffer);
    
    console.log(`\n💾 PDF guardado en: ${filepath}`);
    console.log(`📁 Archivo: ${filename}`);
    
    // Mostrar información del PDF
    console.log('\n📋 Información del PDF:');
    console.log(`   • ID FACTUS: ${pdfResult.factusId}`);
    console.log(`   • Tamaño: ${(pdfResult.pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   • Tipo: ${pdfResult.contentType}`);
    console.log(`   • Sandbox: ${pdfResult.sandbox ? 'Sí' : 'No'}`);
    
    if (pdfResult.sandbox) {
      console.log('\n🎯 Próximos pasos para producción:');
      console.log('1. Obtener credenciales de producción de FACTUS');
      console.log('2. Cambiar FACTUS_BASE_URL a producción');
      console.log('3. Actualizar credenciales en .env');
      console.log('4. Probar con facturas reales');
    }
    
    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.log('\n❌ Error durante la prueba:', error.message);
    console.log('💡 Verifica que:');
    console.log('   • Las variables de entorno estén configuradas');
    console.log('   • La conexión a internet funcione');
    console.log('   • Las credenciales sean correctas');
  }
}

testPDFGeneration();








