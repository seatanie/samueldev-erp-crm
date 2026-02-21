# 📧 Envío de Facturas por Email - SAMUEL DEV ERP CRM

## 🚀 **Funcionalidad Implementada**

He implementado la funcionalidad completa de envío de facturas por correo electrónico. Ahora el botón "Enviar por correo" funciona realmente y envía las facturas a los clientes.

## ✨ **Características**

✅ **Envío real de emails** - No más mensajes de "Premium Version"  
✅ **PDF adjunto** - La factura se envía como PDF adjunto  
✅ **Plantilla personalizable** - Email con diseño profesional  
✅ **Configuración flexible** - Asunto, nombre de empresa, etc.  
✅ **Estado automático** - La factura se marca como "enviada"  
✅ **Validaciones** - Verifica que el cliente tenga email  

## 🔧 **Configuración Requerida**

### 1. **Variables de Entorno (.env)**
```bash
# API Key de Resend (obtener en https://resend.com)
RESEND_API=re_xxxxxxxxxxxxx

# Email desde el cual se envían las facturas
RESEND_FROM_EMAIL=noreply@tuempresa.com
```

### 2. **Configuración de la Empresa**
- **company_email**: Email de la empresa
- **company_name**: Nombre de la empresa
- **samueldev_app_email**: Email para envío de facturas
- **samueldev_app_name**: Nombre de la aplicación

## 📁 **Archivos Modificados**

### Backend
- `backend/src/controllers/appControllers/invoiceController/sendMail.js` - Controlador de envío
- `backend/src/setup/defaultSettings/emailSettings.json` - Configuraciones de email

### Frontend
- `frontend/src/modules/SettingModule/EmailSettingsModule/SettingsForm.jsx` - Formulario de configuración

## 🎯 **Cómo Funciona**

### 1. **Flujo de Envío**
1. Usuario hace clic en "Enviar por correo"
2. Sistema verifica que la factura tenga cliente con email
3. Genera PDF si no existe
4. Envía email con PDF adjunto
5. Actualiza estado de factura a "sent"

### 2. **Plantilla de Email**
- **Asunto**: "Factura #{number}/{year} - {company_name}"
- **Contenido**: Resumen de la factura con detalles
- **Adjunto**: PDF de la factura
- **Diseño**: HTML responsive y profesional

### 3. **Validaciones**
- ✅ Factura existe
- ✅ Cliente tiene email
- ✅ Configuración de email válida
- ✅ API key de Resend configurada

## 📧 **Configuración de Email**

### **Configuraciones Disponibles**
```json
{
  "enable_invoice_emails": true,
  "samueldev_app_email": "noreply@tuempresa.com",
  "samueldev_app_name": "Tu Empresa",
  "invoice_email_subject": "Factura #{number}/{year} - {company_name}",
  "invoice_email_template": "default"
}
```

### **Variables en Asunto**
- `{number}` - Número de factura
- `{year}` - Año de factura
- `{company_name}` - Nombre de la empresa
- `{client_name}` - Nombre del cliente

## 🚀 **Pasos para Activar**

### 1. **Configurar Resend**
1. Crear cuenta en [resend.com](https://resend.com)
2. Obtener API key
3. Agregar a variables de entorno

### 2. **Configurar Email de Empresa**
1. Ir a Configuración > Empresa
2. Configurar email y nombre de empresa
3. Guardar cambios

### 3. **Configurar Envío de Facturas**
1. Ir a Configuración > Email
2. Habilitar envío de facturas
3. Configurar email de aplicación
4. Personalizar asunto del email

### 4. **Probar Envío**
1. Crear o editar una factura
2. Asegurarse de que el cliente tenga email
3. Hacer clic en "Enviar por correo"
4. Verificar que llegue el email

## 📋 **Ejemplo de Uso**

### **Crear Factura con Cliente**
```javascript
// El cliente debe tener email
const client = {
  name: "Juan Pérez",
  email: "juan@ejemplo.com"
};

const invoice = {
  number: 1001,
  year: 2024,
  client: client._id,
  items: [...],
  total: 150.00
};
```

### **Enviar por Email**
```javascript
// Hacer clic en "Enviar por correo"
// Sistema automáticamente:
// 1. Genera PDF
// 2. Envía email
// 3. Actualiza estado
```

## 🔍 **Solución de Problemas**

### **Email no se envía**
1. ✅ Verificar API key de Resend
2. ✅ Verificar email de empresa configurado
3. ✅ Verificar que cliente tenga email
4. ✅ Revisar logs del servidor

### **PDF no se adjunta**
1. ✅ Verificar permisos de carpeta public/download
2. ✅ Verificar que se genere el PDF
3. ✅ Verificar ruta del archivo

### **Error de configuración**
1. ✅ Verificar variables de entorno
2. ✅ Verificar configuraciones de empresa
3. ✅ Verificar que Resend esté activo

## 📊 **Logs y Monitoreo**

### **Logs del Servidor**
```javascript
// En sendMail.js
console.log('Email sent successfully:', data);
console.log('Invoice updated to sent status');
```

### **Respuesta de la API**
```json
{
  "success": true,
  "result": {
    "id": "email_id_from_resend"
  },
  "message": "Invoice sent successfully to cliente@email.com"
}
```

## 🎨 **Personalización**

### **Plantilla de Email**
- Modificar HTML en `sendMail.js`
- Agregar estilos CSS personalizados
- Incluir logo de empresa
- Agregar información adicional

### **Asunto del Email**
- Usar variables disponibles
- Personalizar formato
- Agregar información específica

## 🚀 **Próximas Mejoras**

- [ ] Plantillas de email personalizables
- [ ] Programación de envío automático
- [ ] Notificaciones de entrega
- [ ] Historial de emails enviados
- [ ] Múltiples proveedores de email

## 📞 **Soporte**

Para problemas o sugerencias sobre el envío de facturas por email:
1. Revisar logs del servidor
2. Verificar configuración de Resend
3. Verificar configuraciones de empresa
4. Contactar al equipo de desarrollo

---

**🎯 Sistema de Envío de Facturas por Email Completamente Funcional**
**Desarrollado con ❤️ para SAMUEL DEV ERP CRM**
