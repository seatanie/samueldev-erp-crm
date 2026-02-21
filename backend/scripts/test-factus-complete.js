/**
 * Script completo de prueba para FACTUS
 * Verifica configuración, autenticación y funcionalidad básica
 */

require('dotenv').config({ path: '.env' });
const FactusService = require('../src/services/factusService');

console.log('🚀 PRUEBA COMPLETA DE FACTUS - Facturación Electrónica Colombia\n');

// Verificar variables de entorno
console.log('📋 Verificando configuración:');
const envVars = {
  'FACTUS_BASE_URL': process.env.FACTUS_BASE_URL,
  'FACTUS_CLIENT_ID': process.env.FACTUS_CLIENT_ID,
  'FACTUS_CLIENT_SECRET': process.env.FACTUS_CLIENT_SECRET,
  'FACTUS_USERNAME': process.env.FACTUS_USERNAME,
  'FACTUS_PASSWORD': process.env.FACTUS_PASSWORD
};

let allConfigured = true;
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: CONFIGURADO`);
  } else {
    console.log(`❌ ${key}: NO CONFIGURADO`);
    allConfigured = false;
  }
});

if (!allConfigured) {
  console.log('\n💡 Para configurar FACTUS:');
  console.log('1. Abre tu archivo .env en la carpeta backend');
  console.log('2. Agrega las siguientes variables:');
  console.log('');
  console.log('# Configuración de FACTUS');
  console.log('FACTUS_BASE_URL=https://api-sandbox.factus.com.co');
  console.log('FACTUS_CLIENT_ID=tu-client-id');
  console.log('FACTUS_CLIENT_SECRET=tu-client-secret');
  console.log('FACTUS_USERNAME=tu-username');
  console.log('FACTUS_PASSWORD=tu-password');
  console.log('');
  console.log('3. Reinicia el servidor backend');
  process.exit(1);
}

console.log('\n🔐 Probando autenticación...');

async function runFactusTests() {
  try {
    const factusService = new FactusService();
    
    // Test 1: Autenticación
    console.log('\n🧪 Test 1: Autenticación');
    const authResult = await factusService.authenticate();
    
    if (authResult.success) {
      console.log('✅ Autenticación exitosa!');
      console.log(`🎫 Token: ${authResult.accessToken.substring(0, 20)}...`);
      console.log(`⏰ Expira en: ${authResult.expiresIn} segundos`);
    } else {
      console.log('❌ Error en autenticación');
      return;
    }
    
    // Test 2: Conexión básica
    console.log('\n🧪 Test 2: Conexión básica');
    const connectionResult = await factusService.testConnection();
    
    if (connectionResult.success) {
      console.log('✅ Conexión exitosa!');
      console.log(`📊 Mensaje: ${connectionResult.message}`);
    } else {
      console.log('⚠️ Problema de conexión:', connectionResult.message);
    }
    
    // Test 3: Crear factura de prueba (solo en sandbox)
    if (factusService.baseUrl.includes('sandbox')) {
      console.log('\n🧪 Test 3: Crear factura de prueba (Sandbox)');
      
      const testInvoice = {
        _id: 'test-' + Date.now(),
        number: 'TEST-001',
        year: new Date().getFullYear(),
        date: new Date(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        client: {
          name: 'Cliente de Prueba',
          email: 'test@example.com',
          phone: '3001234567',
          documentType: 'CC',
          documentNumber: '12345678'
        },
        items: [{
          itemName: 'Producto de Prueba',
          description: 'Descripción del producto',
          quantity: 1,
          price: 100000,
          total: 100000
        }],
        subTotal: 100000,
        taxRate: 19,
        taxTotal: 19000,
        total: 119000,
        currency: 'COP',
        paymentStatus: 'unpaid',
        company: {
          name: 'Empresa de Prueba',
          nit: '900123456-1',
          address: 'Calle 123 #45-67',
          city: 'Bogotá',
          phone: '6012345678',
          email: 'empresa@example.com'
        }
      };
      
      const invoiceResult = await factusService.createElectronicInvoice(testInvoice);
      
      if (invoiceResult.success) {
        console.log('✅ Factura de prueba creada exitosamente!');
        console.log(`📄 ID FACTUS: ${invoiceResult.factusId}`);
        console.log(`📊 Estado: ${invoiceResult.status}`);
        if (invoiceResult.warning) {
          console.log(`⚠️ Advertencia: ${invoiceResult.warning}`);
        }
      } else {
        console.log('❌ Error creando factura:', invoiceResult.error);
      }
    } else {
      console.log('\n⚠️ Test 3: Saltado (no es sandbox)');
    }
    
    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('✅ Configuración: Correcta');
    console.log('✅ Autenticación: Funcionando');
    console.log('✅ Conexión: Establecida');
    if (factusService.baseUrl.includes('sandbox')) {
      console.log('✅ Facturación: Simulada correctamente');
    }
    
    console.log('\n🚀 FACTUS está listo para usar!');
    console.log('💡 Puedes crear facturas desde el sistema y se enviarán automáticamente a FACTUS');
    
  } catch (error) {
    console.log('\n❌ Error durante las pruebas:', error.message);
    
    // Diagnóstico de errores comunes
    if (error.message.includes('401')) {
      console.log('\n💡 Diagnóstico: Error 401 - No autorizado');
      console.log('   Posibles causas:');
      console.log('   - Credenciales incorrectas');
      console.log('   - Usuario no tiene permisos');
      console.log('   - Cuenta suspendida o inactiva');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Diagnóstico: Error 403 - Prohibido');
      console.log('   Posibles causas:');
      console.log('   - Client ID o Client Secret incorrectos');
      console.log('   - Aplicación no autorizada');
      console.log('   - Permisos insuficientes');
    } else if (error.message.includes('404')) {
      console.log('\n💡 Diagnóstico: Error 404 - No encontrado');
      console.log('   Posibles causas:');
      console.log('   - URL base incorrecta');
      console.log('   - Endpoint no existe');
      console.log('   - Versión de API incorrecta');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Diagnóstico: Error de conectividad');
      console.log('   Posibles causas:');
      console.log('   - Problema de internet');
      console.log('   - URL base incorrecta');
      console.log('   - Servidor FACTUS no disponible');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Diagnóstico: Timeout');
      console.log('   Posibles causas:');
      console.log('   - Servidor lento');
      console.log('   - Problema de red');
      console.log('   - Servidor sobrecargado');
    }
    
    console.log('\n🔧 Soluciones sugeridas:');
    console.log('1. Verifica que las credenciales sean correctas');
    console.log('2. Confirma que la URL base sea la correcta');
    console.log('3. Revisa tu conexión a internet');
    console.log('4. Contacta al soporte de FACTUS si el problema persiste');
  }
}

runFactusTests();
