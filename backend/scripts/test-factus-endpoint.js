/**
 * Script de prueba para el endpoint de descarga de PDFs de FACTUS
 * Prueba la funcionalidad completa desde la API
 */

require('dotenv').config({ path: '.env' });
const axios = require('axios');

console.log('🌐 PRUEBA DE ENDPOINT DE DESCARGA DE PDFs FACTUS\n');

const API_BASE = 'http://localhost:8889/api';

async function testFactusPDFEndpoint() {
  try {
    console.log('🔍 Paso 1: Crear factura de prueba...');
    
    // Crear factura de prueba
    const invoiceData = {
      client: '507f1f77bcf86cd799439011', // ID de cliente de prueba
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [{
        itemName: 'Producto PDF Test',
        description: 'Descripción del producto para PDF',
        quantity: 1,
        price: 100000,
        total: 100000
      }],
      taxRate: 19,
      subTotal: 100000,
      taxTotal: 19000,
      total: 119000,
      currency: 'COP',
      paymentStatus: 'unpaid'
    };
    
    const createResponse = await axios.post(`${API_BASE}/invoice/create`, invoiceData);
    
    if (!createResponse.data.success) {
      console.log('❌ Error creando factura:', createResponse.data.message);
      return;
    }
    
    const invoice = createResponse.data.result;
    console.log('✅ Factura creada:', invoice._id);
    console.log('📄 Número:', invoice.number);
    
    // Verificar si tiene factusId
    if (!invoice.factus || !invoice.factus.factusId) {
      console.log('⚠️ La factura no tiene FACTUS ID, esperando...');
      
      // Esperar un poco y volver a leer la factura
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const readResponse = await axios.get(`${API_BASE}/invoice/read/${invoice._id}`);
      const updatedInvoice = readResponse.data.result;
      
      if (!updatedInvoice.factus || !updatedInvoice.factus.factusId) {
        console.log('❌ La factura no fue procesada por FACTUS');
        return;
      }
      
      invoice.factus = updatedInvoice.factus;
    }
    
    console.log('✅ FACTUS ID:', invoice.factus.factusId);
    
    console.log('\n📄 Paso 2: Descargar PDF de FACTUS...');
    
    // Descargar PDF de FACTUS
    const pdfResponse = await axios.get(`${API_BASE}/invoice/downloadFactusPDF/${invoice._id}`, {
      responseType: 'arraybuffer'
    });
    
    console.log('✅ PDF descargado exitosamente!');
    console.log(`📊 Tamaño: ${pdfResponse.data.length} bytes`);
    console.log(`📋 Content-Type: ${pdfResponse.headers['content-type']}`);
    console.log(`📁 Content-Disposition: ${pdfResponse.headers['content-disposition']}`);
    
    // Guardar PDF
    const fs = require('fs');
    const path = require('path');
    
    const outputDir = path.join(__dirname, '..', 'uploads', 'factus-pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `factura-endpoint-${invoice.number}-${invoice.year}.pdf`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, pdfResponse.data);
    
    console.log(`\n💾 PDF guardado en: ${filepath}`);
    console.log(`📁 Archivo: ${filename}`);
    
    console.log('\n🎉 Prueba del endpoint completada exitosamente!');
    
    console.log('\n📋 Resumen:');
    console.log(`   • Factura ID: ${invoice._id}`);
    console.log(`   • FACTUS ID: ${invoice.factus.factusId}`);
    console.log(`   • Tamaño PDF: ${(pdfResponse.data.length / 1024).toFixed(2)} KB`);
    console.log(`   • Archivo: ${filename}`);
    
    console.log('\n🌐 Endpoint funcionando correctamente!');
    console.log(`   GET ${API_BASE}/invoice/downloadFactusPDF/${invoice._id}`);
    
  } catch (error) {
    console.log('\n❌ Error durante la prueba:', error.message);
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📋 Data:', error.response.data);
    }
    
    console.log('\n💡 Verifica que:');
    console.log('   • El servidor backend esté ejecutándose');
    console.log('   • Las variables de entorno estén configuradas');
    console.log('   • La base de datos esté conectada');
    console.log('   • FACTUS esté configurado correctamente');
  }
}

testFactusPDFEndpoint();








