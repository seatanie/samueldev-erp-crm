# 🚀 Integración FACTUS - Facturación Electrónica Colombia

Esta integración permite enviar facturas electrónicas a la DIAN (Dirección de Impuestos y Aduanas Nacionales) de Colombia utilizando la API de FACTUS.

## ✨ Características Principales

- **Facturación Electrónica**: Envío automático de facturas a la DIAN
- **Generación de CUF**: Código Único de Facturación Electrónica
- **Descarga de PDF/XML**: Documentos oficiales de la DIAN
- **Seguimiento de Estado**: Monitoreo del estado de las facturas
- **Anulación de Facturas**: Cancelación de facturas enviadas
- **Configuración Flexible**: Ambiente sandbox y producción

## 🛠️ Instalación

### 1. Variables de Entorno

Agregar al archivo `.env` del backend:

```env
# Configuración de FACTUS (Facturación Electrónica Colombia)
FACTUS_BASE_URL=https://api-sandbox.factus.com.co
FACTUS_CLIENT_ID=9fdb08ab-79ea-4d40-b56d-4ed4ed2c5b09
FACTUS_CLIENT_SECRET=argWsddc97T4sfq8K8mFLFwl5uh9Jfy85FZa61As
FACTUS_USERNAME=sandbox@factus.com.co
FACTUS_PASSWORD=sandbox2024%

# URLs del sistema
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8889
```

### 2. Configuración en el Sistema

1. Ir a **Configuraciones > FACTUS**
2. Habilitar FACTUS
3. Configurar las credenciales
4. Probar la conexión
5. Guardar la configuración

## 🔧 Configuración

### Backend

Los siguientes archivos se han creado/modificado:

- `src/services/factusService.js` - Servicio principal de FACTUS
- `src/controllers/appControllers/factusController.js` - Controlador de operaciones
- `src/routes/appRoutes/factusRoutes.js` - Rutas de la API
- `src/models/appModels/Invoice.js` - Modelo actualizado con campos DIAN
- `src/setup/setupConfig.json` - Configuraciones por defecto

### Frontend

- `src/modules/SettingModule/FactusSettingsModule/FactusSettingsForm.jsx` - Configuración
- `src/components/FactusInvoiceStatus.jsx` - Estado de facturas
- `src/services/factusService.js` - Servicio del frontend

## 📡 API Endpoints

### Crear Factura en FACTUS (Paso 1)
```http
POST /api/factus/create/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "force": false
}
```

### Validar Factura en FACTUS (Paso 2)
```http
POST /api/factus/validate/:id
Content-Type: application/json
Authorization: Bearer <token>

{}
```

### Obtener Estado de Factura
```http
GET /api/factus/status/:id
Authorization: Bearer <token>
```

### Descargar PDF
```http
GET /api/factus/download/pdf/:id
Authorization: Bearer <token>
```

### Descargar XML
```http
GET /api/factus/download/xml/:id
Authorization: Bearer <token>
```

### Anular Factura
```http
POST /api/factus/cancel/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Motivo de anulación"
}
```

### Obtener Rangos de Numeración
```http
GET /api/factus/numbering-ranges
Authorization: Bearer <token>
```

### Validar Configuración
```http
GET /api/factus/validate-config
Authorization: Bearer <token>
```

### Datos Maestros (Recomendados para persistir)
```http
GET /api/factus/municipios
GET /api/factus/paises
GET /api/factus/tributos
GET /api/factus/unidades-medida
Authorization: Bearer <token>
```

## 💳 Flujo de Facturación Electrónica

1. **Crear Factura** en el sistema ERP/CRM
2. **Configurar Datos DIAN** (emisor y cliente)
3. **Crear en FACTUS** usando el botón "Crear en FACTUS" (Paso 1)
4. **Validar Factura** usando el botón "Validar" (Paso 2)
5. **FACTUS envía a DIAN** automáticamente después de validar
6. **DIAN valida** y responde con estado
7. **Sistema actualiza** el estado de la factura
8. **Descargar documentos** oficiales (PDF/XML)

## 🔒 Campos Requeridos para DIAN

### Información del Emisor (Empresa)
- **Tipo de Documento**: NIT, CC, CE, etc.
- **Número de Documento**: Número de identificación
- **Razón Social**: Nombre legal de la empresa
- **Nombre Comercial**: Nombre comercial
- **Dirección**: Dirección completa
- **Teléfono**: Número de contacto
- **Email**: Correo electrónico
- **Régimen**: Responsable de IVA, No responsable, etc.

### Información del Cliente
- **Tipo de Documento**: CC, CE, NIT, etc.
- **Número de Documento**: Número de identificación
- **Nombre/Razón Social**: Nombre del cliente
- **Dirección**: Dirección completa
- **Teléfono**: Número de contacto
- **Email**: Correo electrónico

### Información de la Factura
- **Número**: Número consecutivo
- **Serie**: Serie de facturación (A, B, C, etc.)
- **Fecha**: Fecha de emisión
- **Fecha de Vencimiento**: Fecha límite de pago
- **Moneda**: COP, USD, EUR, etc.
- **Tipo de Pago**: Contado, Crédito, Mixto
- **Régimen**: Régimen tributario

## 🎯 Estados de Factura en FACTUS

- **draft**: Borrador (no creada)
- **created**: Creada en FACTUS
- **validated**: Validada en FACTUS
- **sent**: Enviada a DIAN
- **accepted**: Aceptada por la DIAN
- **rejected**: Rechazada por la DIAN
- **cancelled**: Anulada

## 📊 Configuración de la Empresa

Para que la facturación electrónica funcione correctamente, debes configurar:

1. **Datos de la Empresa**:
   - NIT de la empresa
   - Razón social
   - Dirección completa
   - Teléfono y email
   - Régimen tributario

2. **Configuración de Facturación**:
   - Serie de facturación
   - Rango de numeración
   - Tipo de documento por defecto

3. **Datos de Clientes**:
   - Tipo y número de documento
   - Dirección completa
   - Información de contacto

## 🚨 Validaciones Importantes

- **NIT válido**: Debe ser un NIT válido de Colombia
- **Dirección completa**: Ciudad, departamento, código postal
- **Email válido**: Para envío de documentos
- **Rango de numeración**: Debe estar autorizado por la DIAN
- **Certificado digital**: Debe estar vigente

## 🔧 Solución de Problemas

### Error de Autenticación
- Verificar credenciales de FACTUS
- Comprobar que el ambiente sea correcto
- Validar que las credenciales estén activas

### Error de Validación DIAN
- Verificar datos del emisor y cliente
- Comprobar que el NIT sea válido
- Validar que la dirección esté completa

### Error de Numeración
- Verificar que el rango esté autorizado
- Comprobar que no se haya duplicado el número
- Validar que la serie sea correcta

## 📞 Soporte

Para soporte técnico con FACTUS:
- **Email**: soporte@factus.com.co
- **Documentación**: https://developers.factus.com.co/
- **Postman**: https://www.postman.com/martian-spaceship-418933/workspace/api-factus

## 🎉 Casos de Uso

### 1. Facturación B2B
- Envío automático de facturas a empresas
- Cumplimiento con normativas DIAN
- Reducción de errores manuales

### 2. Facturación B2C
- Facturas a consumidores finales
- Generación automática de CUF
- Documentos oficiales de la DIAN

### 3. Exportación
- Facturas de exportación
- Cumplimiento con normativas internacionales
- Documentos para aduanas

## 🔄 Actualizaciones

La integración se actualiza automáticamente con:
- Nuevos campos requeridos por la DIAN
- Mejoras en la validación
- Nuevas funcionalidades de FACTUS
- Corrección de errores

---

**Nota**: Esta integración está diseñada para cumplir con las normativas de facturación electrónica de Colombia. Asegúrate de tener todos los permisos y certificados necesarios antes de usar en producción.
