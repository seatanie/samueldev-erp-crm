# Sistema de Subida de Logos - Samuel Dev ERP CRM

## Descripción
Este sistema permite subir y gestionar el logo de la empresa a través de la configuración del sistema.

## Funcionalidades

### ✅ Subida de Logos
- **Formato**: JPG, PNG, GIF, WebP
- **Tamaño máximo**: 5MB
- **Ubicación**: `backend/src/public/uploads/setting/`
- **Ruta API**: `POST /api/logos/upload`

### ✅ Gestión de Logos
- **Listar logos**: `GET /api/logos/list`
- **Eliminar logo**: `DELETE /api/logos/:filename`
- **Configuración**: Se guarda en la base de datos como `company_logo`

### ✅ Interfaz de Usuario
- **Ubicación**: `frontend/src/modules/SettingModule/CompanyLogoSettingsModule/`
- **Componente**: `AppSettingForm.jsx`
- **Acceso**: Configuración del sistema → Logo de la empresa

## Arquitectura

### Backend
```
backend/src/routes/coreRoutes/logoUpload.js  # Rutas de logos
backend/src/public/uploads/setting/          # Directorio de archivos
backend/src/models/coreModels/Setting.js     # Modelo de configuración
```

### Frontend
```
frontend/src/request/request.js              # Configuración de API
frontend/src/redux/settings/actions.js       # Acciones de Redux
frontend/src/modules/SettingModule/          # Componentes de configuración
```

## Flujo de Funcionamiento

1. **Selección de archivo**: El usuario selecciona una imagen
2. **Validación**: Se valida tipo y tamaño del archivo
3. **Subida**: Se envía al servidor via `POST /api/logos/upload`
4. **Procesamiento**: Multer procesa y guarda el archivo
5. **Base de datos**: Se actualiza el setting `company_logo`
6. **Respuesta**: Se devuelve la información del archivo
7. **UI**: Se actualiza la interfaz con el nuevo logo

## Configuración

### Variables de Entorno
```javascript
// Backend - Puerto del servidor
PORT=8889

// Frontend - URL del backend
VITE_API_URL=http://localhost:8889/api
```

### Directorios Requeridos
```bash
# Crear directorio de uploads
mkdir -p backend/src/public/uploads/setting
```

## Uso

### Desde la Interfaz
1. Ir a **Configuración del Sistema**
2. Seleccionar **Logo de la Empresa**
3. Hacer clic en **Seleccionar Imagen**
4. Elegir archivo de imagen
5. Hacer clic en **Subir Logo**

### Desde la API
```bash
# Subir logo
curl -X POST http://localhost:8889/api/logos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@logo.png"

# Listar logos
curl -X GET http://localhost:8889/api/logos/list \
  -H "Authorization: Bearer YOUR_TOKEN"

# Eliminar logo
curl -X DELETE http://localhost:8889/api/logos/logo-1234567890.png \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Solución de Problemas

### Error: "No se seleccionó ningún archivo"
- Verificar que el archivo se esté enviando correctamente
- Revisar que el campo se llame `file`

### Error: "Solo se permiten archivos de imagen"
- Verificar que el archivo sea JPG, PNG, GIF o WebP
- Revisar el MIME type del archivo

### Error: "La imagen debe ser menor a 5MB"
- Comprimir la imagen antes de subirla
- Usar un formato más eficiente (WebP)

### Error: "No hay token de autenticación"
- Verificar que el usuario esté autenticado
- Revisar que el token esté en localStorage

### Logo no se muestra
- Verificar que el archivo exista en `backend/src/public/uploads/setting/`
- Revisar que la URL sea correcta: `http://localhost:8889/public/uploads/setting/filename`
- Verificar que el servidor esté sirviendo archivos estáticos

## Mantenimiento

### Limpieza de Archivos
```bash
# Eliminar archivos antiguos (opcional)
find backend/src/public/uploads/setting/ -name "logo-*" -mtime +30 -delete
```

### Backup de Configuración
```bash
# Exportar configuración de logos
mongoexport --db samueldev --collection settings --query '{"settingKey": "company_logo"}' --out logo-settings.json
```

## Notas Técnicas

- Los archivos se guardan con nombres únicos: `logo-{timestamp}-{random}.{ext}`
- La configuración se guarda en la colección `settings` con `settingKey: 'company_logo'`
- Los archivos se sirven estáticamente desde `/uploads/setting/`
- La autenticación es requerida para todas las operaciones
- Solo usuarios con rol `Admin` pueden gestionar logos

## Versión
- **Backend**: Node.js + Express + Multer
- **Frontend**: React + Ant Design + Redux
- **Base de datos**: MongoDB
- **Última actualización**: Agosto 2025
