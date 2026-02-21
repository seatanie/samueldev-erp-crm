#!/usr/bin/env node

/**
 * Script de configuración automática para ePay.co
 * Ejecutar: node scripts/setup-epay.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuración de ePay.co para MV');
console.log('================================================\n');

const questions = [
  {
    name: 'apiKey',
    question: '🔑 Ingresa tu API Key de ePay.co: ',
    required: true
  },
  {
    name: 'secretKey',
    question: '🔐 Ingresa tu Secret Key de ePay.co: ',
    required: true
  },
  {
    name: 'baseUrl',
    question: '🌐 URL base de ePay.co (dejar vacío para usar https://api.epay.co): ',
    required: false,
    default: 'https://api.epay.co'
  },
  {
    name: 'frontendUrl',
    question: '🖥️ URL de tu frontend (ej: http://localhost:3000): ',
    required: true
  },
  {
    name: 'backendUrl',
    question: '⚙️ URL de tu backend (ej: http://localhost:8888): ',
    required: true
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    generateEnvFile();
    return;
  }

  const question = questions[index];
  rl.question(question.question, (answer) => {
    if (question.required && !answer.trim()) {
      console.log('❌ Este campo es requerido. Intenta de nuevo.\n');
      askQuestion(index);
      return;
    }

    answers[question.name] = answer.trim() || question.default;
    askQuestion(index + 1);
  });
}

function generateEnvFile() {
  console.log('\n📝 Generando archivo .env...\n');

  const envContent = `# Configuración de ePay.co
EPAY_API_KEY=${answers.apiKey}
EPAY_SECRET_KEY=${answers.secretKey}
EPAY_BASE_URL=${answers.baseUrl}

# URLs del Sistema
FRONTEND_URL=${answers.frontendUrl}
BACKEND_URL=${answers.backendUrl}

# Configuración adicional (opcional)
# EPAY_WEBHOOK_SECRET=tu_webhook_secret_aqui
`;

  const envPath = path.join(process.cwd(), '.env');
  
  try {
    // Leer archivo .env existente
    let existingEnv = '';
    if (fs.existsSync(envPath)) {
      existingEnv = fs.readFileSync(envPath, 'utf8');
      console.log('📁 Archivo .env existente encontrado, agregando configuración de ePay.co...\n');
    }

    // Agregar configuración de ePay.co
    const newEnvContent = existingEnv + '\n' + envContent;
    
    fs.writeFileSync(envPath, newEnvContent);
    console.log('✅ Configuración agregada al archivo .env');
    
  } catch (error) {
    console.error('❌ Error escribiendo archivo .env:', error.message);
    console.log('\n📋 Copia manualmente esta configuración a tu archivo .env:');
    console.log(envContent);
  }

  console.log('\n🔧 Pasos adicionales:');
  console.log('1. Instalar dependencias: npm install axios crypto');
  console.log('2. Reiniciar el servidor');
  console.log('3. Configurar webhook en ePay.co: ' + answers.backendUrl + '/api/payment/epay/webhook');
  
  console.log('\n🎉 ¡Configuración completada!');
  rl.close();
}

// Verificar si estamos en el directorio correcto
if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  console.error('❌ Error: Ejecuta este script desde el directorio backend/');
  process.exit(1);
}

// Verificar si ya existe configuración
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('EPAY_API_KEY')) {
    console.log('⚠️  Ya existe configuración de ePay.co en tu archivo .env');
    rl.question('¿Deseas sobrescribirla? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        askQuestion(0);
      } else {
        console.log('❌ Configuración cancelada');
        rl.close();
      }
    });
    return;
  }
}

askQuestion(0);



