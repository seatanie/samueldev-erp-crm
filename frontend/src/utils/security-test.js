/**
 * Script de prueba de seguridad desde F12
 * Ejecutar en la consola del navegador para probar protecciones
 */

console.log('🔒 PRUEBAS DE SEGURIDAD DESDE F12\n');

// 1. Intentar acceder al token
console.log('1. 🍪 Intentando acceder al token JWT...');
try {
  const authData = localStorage.getItem('auth');
  if (authData) {
    console.log('❌ VULNERABLE: Token encontrado en localStorage');
    console.log('Token:', JSON.parse(authData));
  } else {
    console.log('✅ PROTEGIDO: No hay token en localStorage');
  }
} catch (error) {
  console.log('✅ PROTEGIDO: Error al acceder localStorage');
}

// 2. Verificar cookies
console.log('\n2. 🍪 Verificando cookies...');
const cookies = document.cookie;
if (cookies.includes('authToken')) {
  console.log('❌ VULNERABLE: Token visible en cookies');
} else {
  console.log('✅ PROTEGIDO: Token no visible en cookies (httpOnly)');
}

// 3. Intentar hacer request con token falso
console.log('\n3. 🔐 Probando token falso...');
fetch('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token-falso-123',
    'Content-Type': 'application/json'
  }
})
.then(response => {
  if (response.status === 401) {
    console.log('✅ PROTEGIDO: Token falso rechazado');
  } else {
    console.log('❌ VULNERABLE: Token falso aceptado');
  }
})
.catch(error => {
  console.log('✅ PROTEGIDO: Request bloqueado');
});

// 4. Intentar múltiples requests (rate limiting)
console.log('\n4. 🚦 Probando rate limiting...');
let requestCount = 0;
const testRateLimit = () => {
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
  })
  .then(response => {
    requestCount++;
    console.log(`Request ${requestCount}: Status ${response.status}`);
    
    if (response.status === 429) {
      console.log('✅ PROTEGIDO: Rate limiting activado');
    } else if (requestCount < 6) {
      setTimeout(testRateLimit, 1000);
    } else {
      console.log('❌ VULNERABLE: Rate limiting no funciona');
    }
  })
  .catch(error => {
    console.log('✅ PROTEGIDO: Request bloqueado');
  });
};

// Ejecutar después de 2 segundos
setTimeout(testRateLimit, 2000);

// 5. Verificar headers de seguridad
console.log('\n5. 🛡️ Verificando headers de seguridad...');
fetch('/api/users')
.then(response => {
  const headers = response.headers;
  const securityHeaders = [
    'x-frame-options',
    'x-content-type-options', 
    'x-xss-protection',
    'content-security-policy'
  ];
  
  securityHeaders.forEach(header => {
    if (headers.get(header)) {
      console.log(`✅ ${header}: Configurado`);
    } else {
      console.log(`❌ ${header}: No configurado`);
    }
  });
})
.catch(error => {
  console.log('Error verificando headers:', error);
});

console.log('\n📊 RESUMEN DE PRUEBAS:');
console.log('- Si ves muchos ✅, el sistema está bien protegido');
console.log('- Si ves ❌, hay vulnerabilidades que corregir');
console.log('- Las pruebas se ejecutarán en los próximos segundos...');








