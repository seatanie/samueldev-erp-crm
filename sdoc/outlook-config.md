# 📧 CONFIGURACIÓN OUTLOOK PARA ENVÍO REAL DE EMAILS - SAMUEL DEV ERP CRM

## 🚀 VARIABLES DE ENTORNO NECESARIAS

Agrega estas variables al archivo `.env` del backend:

```bash
# Configuración para Outlook/Hotmail
EMAIL_SERVICE=outlook
EMAIL_USER=tu-email@outlook.com
EMAIL_PASS=tu-contraseña
EMAIL_FROM=noreply@tuapp.com

# URL del frontend
FRONTEND_URL=http://localhost:3001
```

## 🔐 CONFIGURACIÓN DE OUTLOOK

### **Paso 1: Habilitar "Acceso de aplicación menos seguro"**
1. Ve a [account.live.com/proofs/AppPassword](https://account.live.com/proofs/AppPassword)
2. Inicia sesión con tu cuenta de Outlook
3. Genera una **"Contraseña de aplicación"**
4. Usa esa contraseña en `EMAIL_PASS`

### **Paso 2: Verificar configuración**
- ✅ **EMAIL_SERVICE**: `outlook` o `hotmail`
- ✅ **EMAIL_USER**: Tu email completo (ej: `usuario@outlook.com`)
- ✅ **EMAIL_PASS**: Contraseña de aplicación generada
- ✅ **EMAIL_FROM**: Email desde el cual se enviarán (puede ser el mismo)

## 🧪 PRUEBA DE CONFIGURACIÓN

### **1. Reiniciar el backend:**
```bash
docker restart samuel-dev-backend
```

### **2. Verificar logs:**
```bash
docker logs samuel-dev-backend --tail 20
```

Deberías ver:
```
📧 Configurando transportador para Outlook/Hotmail
✅ Express running → On PORT : 8889
```

### **3. Probar envío:**
1. Ve a `http://localhost:3001/login`
2. Haz clic en "¿Se te olvidó tu contraseña?"
3. Ingresa un email válido
4. Verifica que recibas el email real

## 📋 EJEMPLO COMPLETO DE .ENV

```bash
# Configuración del servidor
NODE_ENV=development
PORT=8889

# Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017/samueldev

# Configuración de JWT
JWT_SECRET=your-secret-key-here

# Configuración de Email (OUTLOOK)
EMAIL_SERVICE=outlook
EMAIL_USER=tu-email@outlook.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM=noreply@tuapp.com

# URL del frontend
FRONTEND_URL=http://localhost:3001
```

## ⚠️ NOTAS IMPORTANTES

- **NO uses tu contraseña normal** de Outlook
- **SÍ usa una contraseña de aplicación** generada específicamente
- **Verifica que el email esté habilitado** para envío SMTP
- **Revisa la carpeta de spam** si no recibes los emails

## 🎯 ESTADO DESPUÉS DE CONFIGURAR

- ✅ **Emails reales** se envían desde tu cuenta de Outlook
- ✅ **Enlaces funcionales** para restablecer contraseñas
- ✅ **Confirmaciones** cuando se cambia la contraseña
- ✅ **Logs detallados** en la consola del backend

¡Con esta configuración tendrás un sistema de restablecimiento de contraseña completamente funcional! 🚀









