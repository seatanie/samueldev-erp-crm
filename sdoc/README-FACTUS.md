# 🚀 FACTUS - Facturación Electrónica Colombia

Esta integración permite enviar facturas electrónicas a la DIAN (Dirección de Impuestos y Aduanas Nacionales) de Colombia utilizando la API de FACTUS.

## ✨ Características Principales

- **Facturación Electrónica**: Envío automático de facturas a la DIAN
- **Generación de CUF**: Código Único de Facturación Electrónica
- **Descarga de PDF/XML**: Documentos oficiales de la DIAN
- **Seguimiento de Estado**: Monitoreo del estado de las facturas
- **Anulación de Facturas**: Cancelación de facturas enviadas
- **Configuración Flexible**: Ambiente sandbox y producción

## 🛠️ Configuración Rápida

### Opción 1: Script Automático (Recomendado)

```bash
cd backend
node scripts/configure-factus.js
```

### Opción 2: Configuración Manual

1. **Obtener credenciales** en [FACTUS Sandbox](https://sandbox.factus.com.co) o [FACTUS Producción](https://factus.com.co)

2. **Agregar al archivo `.env`** del backend:

```env
# Configuración de FACTUS (Facturación Electrónica Colombia)
FACTUS_BASE_URL=https://api-sandbox.factus.com.co
FACTUS_CLIENT_ID=tu-client-id
FACTUS_CLIENT_SECRET=tu-client-secret
FACTUS_USERNAME=tu-username
FACTUS_PASSWORD=tu-password
```

3. **Reiniciar el servidor backend**

## 🧪 Probar la Conexión

```bash
cd backend
node scripts/test-factus-complete.js
```

Este script verificará:
- ✅ Configuración de variables de entorno
- ✅ Autenticación con FACTUS
- ✅ Conexión básica
- ✅ Creación de factura de prueba (sandbox)

## 🔧 Uso en el Sistema

### Crear Factura con FACTUS

1. **Crear factura normalmente** desde el sistema
2. **FACTUS se ejecuta automáticamente** al crear la factura
3. **Verificar estado** en la sección de facturas

### Endpoints de la API

```http
# Crear factura en FACTUS
POST /api/factus/invoice/:id/create

# Validar factura
POST /api/factus/invoice/:id/validate

# Enviar a DIAN
POST /api/factus/invoice/:id/send

# Descargar PDF oficial
GET /api/factus/invoice/:id/pdf

# Anular factura
POST /api/factus/invoice/:id/cancel
```

## 📊 Estados de Factura

- **created**: Factura creada en FACTUS
- **validated**: Factura validada
- **sent**: Enviada a DIAN
- **accepted**: Aceptada por DIAN
- **rejected**: Rechazada por DIAN
- **cancelled**: Anulada

## 🔍 Solución de Problemas

### Error 401 - No autorizado
- Verificar credenciales (Client ID, Client Secret, Username, Password)
- Confirmar que la cuenta esté activa
- Revisar permisos de la aplicación

### Error 403 - Prohibido
- Verificar Client ID y Client Secret
- Confirmar que la aplicación esté autorizada
- Revisar permisos de la cuenta

### Error 404 - No encontrado
- Verificar URL base (sandbox vs producción)
- Confirmar que el endpoint existe
- Revisar versión de la API

### Error de conectividad
- Verificar conexión a internet
- Confirmar que la URL base sea correcta
- Revisar si el servidor FACTUS está disponible

## 📱 Frontend

El frontend incluye:
- **Configuración de FACTUS**: Panel de configuración
- **Estado de facturas**: Indicadores visuales
- **Descarga de documentos**: PDF y XML oficiales
- **Seguimiento**: Estado en tiempo real

## 🚀 Producción

Para usar en producción:

1. **Cambiar a URL de producción**:
   ```env
   FACTUS_BASE_URL=https://api.factus.com.co
   ```

2. **Usar credenciales de producción**

3. **Configurar webhooks** para notificaciones

4. **Implementar manejo de errores** robusto

## 📞 Soporte

- **Documentación FACTUS**: [docs.factus.com.co](https://docs.factus.com.co)
- **Soporte técnico**: soporte@factus.com.co
- **Sandbox**: [sandbox.factus.com.co](https://sandbox.factus.com.co)

## 🔒 Seguridad

- Las credenciales se almacenan en variables de entorno
- Los tokens se manejan de forma segura
- Las comunicaciones usan HTTPS
- No se almacenan datos sensibles en la base de datos

---

**¡FACTUS está listo para usar!** 🎉






