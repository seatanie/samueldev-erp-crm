/**
 * Script para configurar FACTUS fácilmente
 * Ayuda a configurar las variables de entorno necesarias
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 CONFIGURADOR DE FACTUS - Facturación Electrónica Colombia\n');

console.log('Este script te ayudará a configurar FACTUS en tu proyecto.\n');

console.log('📋 Información necesaria:');
console.log('1. Client ID (ID del cliente)');
console.log('2. Client Secret (Secreto del cliente)');
console.log('3. Username (Nombre de usuario)');
console.log('4. Password (Contraseña)');
console.log('5. Base URL (URL de la API - sandbox o producción)\n');

console.log('💡 Puedes obtener estas credenciales en:');
console.log('   - Sandbox: https://sandbox.factus.com.co');
console.log('   - Producción: https://factus.com.co\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function configureFactus() {
  try {
    console.log('🚀 Iniciando configuración...\n');
    
    // Solicitar información
    const baseUrl = await askQuestion('🌐 Base URL (sandbox: https://api-sandbox.factus.com.co): ');
    const clientId = await askQuestion('🆔 Client ID: ');
    const clientSecret = await askQuestion('🔐 Client Secret: ');
    const username = await askQuestion('👤 Username: ');
    const password = await askQuestion('🔑 Password: ');
    
    // Validar información básica
    if (!clientId || !clientSecret || !username || !password) {
      console.log('\n❌ Error: Todos los campos son obligatorios');
      rl.close();
      return;
    }
    
    // Leer archivo .env actual
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Actualizar o agregar variables de FACTUS
    const factusVars = {
      'FACTUS_BASE_URL': baseUrl || 'https://api-sandbox.factus.com.co',
      'FACTUS_CLIENT_ID': clientId,
      'FACTUS_CLIENT_SECRET': clientSecret,
      'FACTUS_USERNAME': username,
      'FACTUS_PASSWORD': password
    };
    
    // Procesar archivo .env
    let lines = envContent.split('\n');
    let factusSectionStart = -1;
    let factusSectionEnd = -1;
    
    // Encontrar sección de FACTUS
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('# Configuración de FACTUS')) {
        factusSectionStart = i;
      }
      if (factusSectionStart !== -1 && lines[i].startsWith('#') && !lines[i].includes('FACTUS')) {
        factusSectionEnd = i;
        break;
      }
    }
    
    // Si no hay sección de FACTUS, agregarla
    if (factusSectionStart === -1) {
      lines.push('');
      lines.push('# Configuración de FACTUS (Facturación Electrónica Colombia)');
      factusSectionStart = lines.length;
    }
    
    // Actualizar variables
    Object.entries(factusVars).forEach(([key, value]) => {
      let found = false;
      for (let i = factusSectionStart; i < lines.length; i++) {
        if (lines[i].startsWith(`${key}=`)) {
          lines[i] = `${key}=${value}`;
          found = true;
          break;
        }
      }
      if (!found) {
        lines.splice(factusSectionStart + 1, 0, `${key}=${value}`);
      }
    });
    
    // Escribir archivo .env
    fs.writeFileSync(envPath, lines.join('\n'));
    
    console.log('\n✅ Configuración guardada exitosamente!');
    console.log(`📁 Archivo actualizado: ${envPath}`);
    
    // Mostrar resumen
    console.log('\n📋 Resumen de configuración:');
    console.log(`🌐 Base URL: ${factusVars.FACTUS_BASE_URL}`);
    console.log(`🆔 Client ID: ${factusVars.FACTUS_CLIENT_ID}`);
    console.log(`🔐 Client Secret: ${factusVars.FACTUS_CLIENT_SECRET.substring(0, 10)}...`);
    console.log(`👤 Username: ${factusVars.FACTUS_USERNAME}`);
    console.log(`🔑 Password: ${'*'.repeat(factusVars.FACTUS_PASSWORD.length)}`);
    
    console.log('\n🚀 Próximos pasos:');
    console.log('1. Reinicia el servidor backend');
    console.log('2. Ejecuta: node scripts/test-factus-complete.js');
    console.log('3. Verifica que la conexión funcione');
    console.log('4. ¡Comienza a usar FACTUS!');
    
  } catch (error) {
    console.log('\n❌ Error durante la configuración:', error.message);
  } finally {
    rl.close();
  }
}

configureFactus();








