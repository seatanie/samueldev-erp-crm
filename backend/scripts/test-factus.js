/**
 * Script de prueba para FACTUS
 * Verifica la conexión y autenticación con el sandbox de FACTUS
 */

require('dotenv').config({ path: '.env' });
const FactusService = require('../src/services/factusService');

console.log('🔍 VERIFICANDO CONFIGURACIÓN DE FACTUS\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('FACTUS_BASE_URL:', process.env.FACTUS_BASE_URL || 'NO CONFIGURADO');
console.log('FACTUS_CLIENT_ID:', process.env.FACTUS_CLIENT_ID ? 'CONFIGURADO' : 'NO CONFIGURADO');
console.log('FACTUS_CLIENT_SECRET:', process.env.FACTUS_CLIENT_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO');
console.log('FACTUS_USERNAME:', process.env.FACTUS_USERNAME || 'NO CONFIGURADO');
console.log('FACTUS_PASSWORD:', process.env.FACTUS_PASSWORD ? 'CONFIGURADO' : 'NO CONFIGURADO');

console.log('\n🔐 Probando autenticación...');

async function testFactusConnection() {
  try {
    const factusService = new FactusService();
    
    // Verificar configuración
    if (!factusService.isConfigured) {
      console.log('❌ FACTUS no está configurado correctamente');
      console.log('💡 Asegúrate de tener todas las variables de entorno en tu archivo .env');
      return;
    }
    
    console.log('✅ Configuración detectada');
    console.log('🌐 Base URL:', factusService.baseUrl);
    
    // Intentar autenticación
    const authResult = await factusService.authenticate();
    
    if (authResult.success) {
      console.log('✅ Autenticación exitosa!');
      console.log('🎫 Access Token:', authResult.accessToken.substring(0, 20) + '...');
      console.log('⏰ Expires In:', authResult.expiresIn, 'segundos');
      
      // Probar una operación básica
      console.log('\n🧪 Probando operación básica...');
      try {
        const testResult = await factusService.testConnection();
        console.log('✅ Conexión con FACTUS funcionando correctamente');
        console.log('📊 Respuesta:', testResult);
      } catch (testError) {
        console.log('⚠️ Error en operación de prueba:', testError.message);
      }
      
    } else {
      console.log('❌ Error en autenticación');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 Posibles causas:');
      console.log('   - Credenciales incorrectas');
      console.log('   - Usuario no tiene permisos');
      console.log('   - Cuenta suspendida');
    } else if (error.message.includes('403')) {
      console.log('💡 Posibles causas:');
      console.log('   - Client ID o Client Secret incorrectos');
      console.log('   - Aplicación no autorizada');
    } else if (error.message.includes('404')) {
      console.log('💡 Posibles causas:');
      console.log('   - URL base incorrecta');
      console.log('   - Endpoint no existe');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 Posibles causas:');
      console.log('   - Problema de conectividad');
      console.log('   - URL base incorrecta');
      console.log('   - Servidor FACTUS no disponible');
    }
  }
}

testFactusConnection();
