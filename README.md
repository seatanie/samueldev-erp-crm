# Samuel Dev ERP CRM

Sistema ERP/CRM de código abierto basado en [Idurar ERP CRM](https://github.com/idurar/idurar-erp-crm-open-source), ampliado con módulos de facturación electrónica, pagos en línea, inventario, pedidos, zonas de entrega y mejoras de seguridad e infraestructura.

**Versión:** 4.1.0  
**Licencia:** Fair-code License

---

## Stack técnico

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React 18, Vite, Redux Toolkit, Ant Design 5
- **Despliegue:** Docker Compose (backend y frontend)

---

## Características base (Idurar)

- Gestión de clientes, proveedores y contactos
- Facturas, cotizaciones y ofertas
- Productos y categorías
- Autenticación y sesiones de administrador
- Panel de administración y reportes
- Generación de PDF (facturas, cotizaciones, ofertas, pagos)
- Configuración por entornos y variables de entorno

---

## Adiciones y mejoras implementadas

### Facturación electrónica (FACTUS)

- Integración con [FACTUS](https://factus.com.co/) para facturación electrónica en Colombia.
- **Solo entorno sandbox:** la integración está configurada para ambiente de pruebas; no está desplegada en producción.
- Creación, validación y anulación de facturas electrónicas desde el ERP.
- Descarga de PDF y XML de facturas emitidas en FACTUS.
- Endpoints para datos maestros: municipios, países, tributos, unidades de medida.
- Validación de configuración y rangos de numeración.

### Pagos en línea (ePayco)

- Integración con [ePayco](https://epayco.co/) para cobro en línea.
- **Solo entorno sandbox:** la integración está configurada para ambiente de pruebas; no está desplegada en producción.
- Generación de enlaces de pago directos por factura.
- Webhooks para confirmación de pagos y actualización del estado de la factura.
- Inclusión de botón de pago en el correo de envío de factura al cliente.

### Envío de facturas por correo

- Envío de facturas por email con PDF adjunto mediante [Resend](https://resend.com).
- Plantilla HTML con datos de la factura, totales y enlace/botón de pago ePayco cuando aplique.
- Configuración de remitente y nombre de app desde ajustes (`samueldev_app_email`, `samueldev_app_name`).

### Pedidos y órdenes

- Módulo de pedidos/órdenes con API REST (`/api/orders`, `/api/order`).
- Gestión de estados y relación con clientes y productos.

### Zonas de entrega

- CRUD de zonas de entrega para envíos o cobertura de servicio.
- API bajo `/api/zones` con autenticación.

### Inventario y bodegas

- Módulo de bodegas (almacenes) con API `/api/warehouses`.
- Módulo de inventario con API `/api/inventory`.
- Middlewares para generación de números únicos y lógica de inventario.

### Logos personalizados

- Subida de logos para uso en PDF y cabeceras.
- API `/api/logos` con almacenamiento local o S3 (según configuración).
- Exclusión de la ruta de logos del middleware genérico de file upload para evitar conflictos.

### Restablecimiento de contraseña

- Flujo de recuperación de contraseña vía correo.
- Rutas bajo `/api/password-reset` (sin autenticación para solicitud y uso del token).

### Estadísticas de usuario

- API `/api/user-stats` para métricas y resúmenes del usuario autenticado.

### Seguridad y robustez

- **Helmet:** cabeceras de seguridad (CSP, XSS, etc.) con opciones adaptadas a subida de archivos.
- **Rate limiting:** límite general por IP y límite específico para login (evitar fuerza bruta).
- **CORS:** orígenes permitidos configurables (`FRONTEND_URL` y localhost).
- **Validación de entorno:** middleware que comprueba variables de entorno críticas antes de servir rutas.
- **Logger:** utilidad centralizada de logs para desarrollo y producción.

### Reportes y productos

- APIs de reportes (`/api/reports`).
- APIs de categorías de producto y productos (`/api/product-categories`, `/api/products`, variantes singular).
- Descarga de archivos estáticos y descarga controlada de PDFs desde `/download`.

### Configuración y ajustes

- Ajustes por categoría: `app_settings`, `pdf_settings`.
- Claves propias para marca y PDF: `samueldev_app_name`, `samueldev_app_email`, `samueldev_app_date_format`, `pdf_invoice_footer`, `pdf_quote_footer`, `pdf_offer_footer`, `pdf_payment_footer`.
- Carga y uso de ajustes en middlewares y controladores (emails, nombres, pies de página en PDF).

### Infraestructura y despliegue

- **Docker Compose:** servicios `backend` (puerto 8889) y `frontend` (puerto 3001) con volúmenes para desarrollo.
- **Almacenamiento:** soporte para subida a AWS S3 además de almacenamiento local.
- **PDF:** generación con Puppeteer y plantillas Pug (Invoice, Quote, Offer, Payment).
- **Email:** Resend como proveedor principal de envío de correos.

### Frontend

- Aplicación principal unificada en `ErpApp.jsx` (layout, navegación, header, router).
- Configuración de API y servidor centralizada.
- Formularios dinámicos, autocompletado asíncrono y componentes reutilizables (ReadItem, SearchItem, SelectAsync).
- Autenticación y persistencia de sesión; layout de auth para login y flujos de recuperación de contraseña.
- Eliminación de flujos no usados (registro público, OrderForm antiguo) y referencias a IdurarOS donde corresponda.

---

## Requisitos

- Node.js 20.x (indicado en `package.json` de backend y frontend)
- MongoDB
- Cuentas/API keys (según uso): Resend, ePayco (sandbox), FACTUS (sandbox), AWS S3 (opcional)

---

## Instalación y ejecución

### Con Docker

```bash
# En la raíz del proyecto
docker-compose up --build
```

- Backend: `http://localhost:8889`
- Frontend: `http://localhost:3001`

### Sin Docker

1. **Backend:**  
   En `backend/`: copiar `.env.example` a `.env`, configurar MongoDB, Resend, ePayco/FACTUS si aplica, y ejecutar `npm install` y `npm run dev`.

2. **Frontend:**  
   En `frontend/`: configurar `.env` (por ejemplo `VITE_SERVER_URL` apuntando al backend) y ejecutar `npm install` y `npm run dev`.

---

## Estructura relevante del proyecto

```
backend/src/
  app.js                    # Entrada Express, rutas, middlewares de seguridad
  routes/
    appRoutes/              # appApi, orderApi, zoneRoutes, epaycoRoutes, factusRoutes
    coreRoutes/             # coreAuth, coreApi, reports, products, inventory, warehouses,
                            # logoUpload, passwordReset, userStats, download, public
  controllers/
    appControllers/         # invoiceController (create, read, sendMail), factusController, paymentController (epayco)
    coreControllers/        # adminAuth, adminController, settingController, setup
  services/                 # factusService, epaycoService, emailService, awsS3Service, puppeteerConfig
  middlewares/              # validateEnvironment, settings, inventory, uploadMiddleware
  pdf/                      # Plantillas Pug: Invoice, Quote, Offer, Payment
  setup/                    # setup.js, defaultSettings (appSettings.json), setupConfig.json

frontend/src/
  apps/                     # ErpApp, Header, Navigation
  router/                  # AppRouter
  redux/                   # settings, persist
  forms/                   # AdminForm, LoginForm, DynamicForm
  config/                  # serverApiConfig
```

---

## Referencias

- Proyecto base: [Idurar ERP CRM Open Source](https://github.com/idurar/idurar-erp-crm-open-source)
- Facturación electrónica (sandbox): [FACTUS](https://factus.com.co/)
- Pagos (sandbox): [ePayco](https://epayco.co/)
- Email: [Resend](https://resend.com)
