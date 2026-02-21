# 🚀 Integración de ePay.co con Samuel Dev ERP CRM

Esta integración permite a los clientes pagar facturas directamente desde el sistema ERP/CRM usando la plataforma de pagos en línea ePay.co.

## ✨ Características Principales

- **Pagos en Línea**: Los clientes pueden pagar facturas directamente desde emails
- **Webhooks Automáticos**: Confirmación automática de pagos
- **Múltiples Métodos**: Soporte para tarjetas, transferencias y más
- **Seguridad**: Firma HMAC para verificar webhooks
- **Integración Completa**: Actualización automática del estado de facturas

## 🛠️ Instalación

### 1. Dependencias

```bash
cd backend
npm install axios crypto
```

### 2. Variables de Entorno

Agregar al archivo `.env`:

```env
# Configuración de ePay.co
EPAY_API_KEY=tu_api_key_de_epay
EPAY_SECRET_KEY=tu_secret_key_de_epay
EPAY_BASE_URL=https://api.epay.co

# URLs del Sistema
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8888
```

### 3. Configuración de ePay.co

1. Crear cuenta en [ePay.co](https://epay.co)
2. Obtener API Key y Secret Key desde el dashboard
3. Configurar webhook URL: `https://tudominio.com/api/payment/epay/webhook`

## 🔧 Configuración

### Backend

Los siguientes archivos se han creado/modificado:

- `src/services/epayService.js` - Servicio principal de ePay.co
- `src/controllers/appControllers/paymentController/epayController.js` - Controlador de pagos
- `src/routes/appRoutes/epayRoutes.js` - Rutas de la API
- `src/models/appModels/Invoice.js` - Modelo actualizado con campos de ePay.co
- `src/controllers/appControllers/invoiceController/sendMail.js` - Email con botón de pago

### Frontend

- `src/components/EpayPaymentButton.jsx` - Componente de botón de pago

## 📡 API Endpoints

### Crear Sesión de Pago
```http
POST /api/payment/epay/session
Content-Type: application/json
Authorization: Bearer <token>

{
  "invoiceId": "invoice_id_here",
  "paymentMethod": "card"
}
```

### Crear Enlace de Pago Directo
```http
POST /api/payment/epay/direct-link
Content-Type: application/json
Authorization: Bearer <token>

{
  "invoiceId": "invoice_id_here",
  "paymentMethod": "card"
}
```

### Verificar Estado de Pago
```http
GET /api/payment/epay/status/:sessionId
Authorization: Bearer <token>
```

### Obtener Métodos de Pago
```http
GET /api/payment/epay/methods
Authorization: Bearer <token>
```

### Webhook (para ePay.co)
```http
POST /api/payment/epay/webhook
Content-Type: application/json
X-Signature: <hmac_signature>

{
  "order_id": "invoice_id",
  "status": "completed",
  "amount": 100.00,
  "transaction_id": "txn_123"
}
```

## 💳 Flujo de Pago

1. **Cliente recibe factura por email** con botón de pago
2. **Cliente hace clic en "Pagar en Línea"**
3. **Sistema crea sesión de pago** en ePay.co
4. **Cliente es redirigido** a la plataforma de ePay.co
5. **Cliente completa el pago** con su método preferido
6. **ePay.co envía webhook** confirmando el pago
7. **Sistema actualiza automáticamente** el estado de la factura
8. **Cliente recibe confirmación** por email

## 🔒 Seguridad

- **Firma HMAC**: Todos los webhooks son verificados con firma criptográfica
- **Validación de Datos**: Verificación completa de datos recibidos
- **Tokens de Autenticación**: API protegida con JWT
- **HTTPS**: Todas las comunicaciones son seguras

## 📧 Emails con Botón de Pago

Los emails de factura ahora incluyen automáticamente:

- ✅ Botón de pago en línea (si ePay.co está configurado)
- ✅ Enlace de descarga del PDF
- ✅ Información completa de la factura
- ✅ Diseño profesional y responsive

## 🎯 Casos de Uso

### 1. Facturación B2B
- Envío automático de facturas con opción de pago inmediato
- Reducción del tiempo de cobro
- Mejor experiencia del cliente

### 2. Suscripciones
- Pagos recurrentes automáticos
- Gestión de renovaciones
- Notificaciones de vencimiento

### 3. E-commerce
- Integración con tiendas online
- Pagos seguros en tiempo real
- Confirmación automática de órdenes

## 🚨 Solución de Problemas

### Error: "ePay.co no está configurado"
- Verificar variables de entorno `EPAY_API_KEY` y `EPAY_SECRET_KEY`
- Reiniciar el servidor después de cambios

### Webhook no recibido
- Verificar URL del webhook en ePay.co
- Confirmar que el servidor es accesible desde internet
- Revisar logs del servidor

### Pago no procesado
- Verificar firma del webhook
- Revisar logs de la base de datos
- Confirmar estado en ePay.co

## 📊 Monitoreo

### Logs Importantes
```javascript
// Pago exitoso
console.log(`✅ Pago procesado exitosamente para factura ${orderId}: ${amount} ${currency}`);

// Pago fallido
console.log(`❌ Pago falló para factura ${orderId}: ${status}`);

// Error de webhook
console.error('Error procesando webhook de ePay.co:', error);
```

### Métricas a Monitorear
- Tasa de conversión de pagos
- Tiempo de procesamiento
- Errores de webhook
- Estado de facturas

## 🔄 Actualizaciones Futuras

- [ ] Soporte para múltiples monedas
- [ ] Integración con más métodos de pago
- [ ] Dashboard de analytics de pagos
- [ ] Notificaciones push para pagos exitosos
- [ ] Integración con sistemas de contabilidad

## 📞 Soporte

Para soporte técnico:
- Revisar logs del servidor
- Verificar configuración de ePay.co
- Contactar al equipo de desarrollo

## 📝 Licencia

Esta integración está bajo la misma licencia que Samuel Dev ERP CRM.

---

**¡Disfruta de la integración de pagos en línea con ePay.co! 🎉**



