# 🔒 GUÍA DE CONFIGURACIÓN SEGURA - SAMUEL DEV ERP CRM

## ✅ **MEJORAS DE SEGURIDAD IMPLEMENTADAS**

### **1. 🍪 HTTPONLY COOKIES**
- ✅ Tokens JWT ahora se almacenan en cookies httpOnly
- ✅ No accesibles desde JavaScript (protección XSS)
- ✅ Configuración segura con SameSite=strict
- ✅ Limpieza automática en logout

### **2. 🛡️ HEADERS DE SEGURIDAD**
- ✅ Helmet configurado con CSP
- ✅ Rate limiting implementado
- ✅ Protección contra ataques comunes

### **3. 🔍 LOGGING SEGURO**
- ✅ Sistema de logging condicional
- ✅ Sin datos sensibles en producción
- ✅ Logs de seguridad siempre visibles

### **4. 🌐 CORS MEJORADO**
- ✅ Validación dinámica de orígenes
- ✅ Logging de intentos bloqueados
- ✅ Configuración más restrictiva

## 🚀 **CONFIGURACIÓN PARA PRODUCCIÓN**

### **Variables de Entorno Críticas (.env)**

```bash
# 🔐 SEGURIDAD CRÍTICA
NODE_ENV=production
JWT_SECRET=tu-jwt-secret-super-seguro-y-largo-minimo-32-caracteres
DATABASE=<pegar-connection-string-desde-mongodb-atlas>

# 🌐 URLs DEL SISTEMA
FRONTEND_URL=https://tu-dominio.com
BACKEND_URL=https://api.tu-dominio.com

# 📧 EMAIL (OPCIONAL)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion

# ☁️ AWS S3 (OPCIONAL)
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=tu-bucket

# 🤖 OPENAI (OPCIONAL)
OPENAI_API_KEY=tu-openai-key

# 📄 FACTUS (OPCIONAL)
FACTUS_BASE_URL=https://api.factus.com.co
FACTUS_CLIENT_ID=tu-client-id
FACTUS_CLIENT_SECRET=tu-client-secret
FACTUS_USERNAME=tu-username
FACTUS_PASSWORD=tu-password
```

### **Configuración del Servidor Web (Nginx)**

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # Certificado SSL
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Headers de seguridad adicionales
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy al backend
    location /api {
        proxy_pass http://localhost:8889;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 **COMANDOS DE DESPLIEGUE SEGURO**

### **1. Instalar Dependencias**
```bash
cd backend
npm install --production
npm audit fix
```

### **2. Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar con valores reales
nano .env
```

### **3. Verificar Configuración**
```bash
# Verificar que todas las variables estén configuradas
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ Faltante');"
```

### **4. Iniciar en Producción**
```bash
# Con PM2 (recomendado)
npm install -g pm2
pm2 start src/server.js --name "samuel-dev-backend"
pm2 startup
pm2 save

# O directamente
NODE_ENV=production npm start
```

## 🚨 **CHECKLIST DE SEGURIDAD**

### **Antes del Despliegue**
- [ ] Cambiar JWT_SECRET por uno seguro
- [ ] Configurar HTTPS en producción
- [ ] Verificar que NODE_ENV=production
- [ ] Configurar firewall (solo puertos necesarios)
- [ ] Actualizar todas las dependencias
- [ ] Ejecutar `npm audit fix`

### **Después del Despliegue**
- [ ] Verificar que no hay logs sensibles
- [ ] Probar login/logout
- [ ] Verificar headers de seguridad
- [ ] Monitorear logs de seguridad
- [ ] Configurar backups automáticos

## 📊 **MONITOREO DE SEGURIDAD**

### **Logs a Monitorear**
```bash
# Intentos de login fallidos
grep "Intento de login" /var/log/app.log

# CORS bloqueados
grep "CORS bloqueado" /var/log/app.log

# Rate limiting activado
grep "Rate limit" /var/log/app.log
```

### **Alertas Recomendadas**
- Más de 10 intentos de login fallidos por IP
- Requests desde orígenes no autorizados
- Errores de autenticación frecuentes
- Uso excesivo de recursos

## 🆘 **RESPUESTA A INCIDENTES**

### **Si Detectas Intrusión**
1. Cambiar JWT_SECRET inmediatamente
2. Revocar todas las sesiones activas
3. Revisar logs de acceso
4. Actualizar contraseñas de administradores
5. Notificar a usuarios afectados

### **Comandos de Emergencia**
```bash
# Revocar todas las sesiones
mongo --eval "db.adminpasswords.updateMany({}, {\$set: {loggedSessions: []}})"

# Cambiar JWT_SECRET
# Editar .env y reiniciar servidor
pm2 restart samuel-dev-backend
```

## 📞 **CONTACTO DE SEGURIDAD**

Para reportar vulnerabilidades de seguridad:
- Email: security@tu-dominio.com
- Respuesta: Máximo 24 horas
- Recompensa: Considerada según severidad

---

**⚠️ IMPORTANTE**: Esta configuración debe ser revisada regularmente y actualizada según las mejores prácticas de seguridad actuales.








