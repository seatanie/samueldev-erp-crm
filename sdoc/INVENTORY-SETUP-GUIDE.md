# Guía de Configuración - Sistema de Inventario

## Requisitos Previos

### Backend
- Node.js 16+ 
- MongoDB 4.4+
- Express.js
- Mongoose

### Frontend
- React 18+
- Ant Design 5+
- Vite

## Instalación

### 1. Configuración del Backend

#### Instalar Dependencias
```bash
cd backend
npm install
```

#### Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `backend`:
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/erp_crm

# JWT
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# Servidor
PORT=3000
NODE_ENV=development
```

#### Verificar Modelos
Los siguientes modelos deben estar creados en `backend/src/models/coreModels/`:
- `Inventory.js` - Modelo de inventario
- `InventoryMovement.js` - Modelo de movimientos
- `Warehouse.js` - Modelo de almacenes

#### Verificar Controladores
Los siguientes controladores deben estar en `backend/src/controllers/coreControllers/`:
- `inventoryController/index.js` - Controlador de inventario
- `warehouseController/index.js` - Controlador de almacenes

#### Verificar Rutas
Las siguientes rutas deben estar en `backend/src/routes/coreRoutes/`:
- `inventoryApi.js` - Rutas de inventario
- `warehouseApi.js` - Rutas de almacenes

#### Registrar Rutas en app.js
```javascript
// Importar rutas
const inventoryApiRouter = require('./routes/coreRoutes/inventoryApi');
const warehouseApiRouter = require('./routes/coreRoutes/warehouseApi');

// Registrar rutas con autenticación
app.use('/api/inventory', adminAuth.isValidAuthToken, inventoryApiRouter);
app.use('/api/warehouses', adminAuth.isValidAuthToken, warehouseApiRouter);
```

### 2. Configuración del Frontend

#### Instalar Dependencias
```bash
cd frontend
npm install
```

#### Verificar Servicios
Los siguientes servicios deben estar en `frontend/src/services/`:
- `inventoryService.js` - Servicio de inventario
- `warehouseService.js` - Servicio de almacenes

#### Verificar Páginas
Las siguientes páginas deben estar en `frontend/src/pages/`:
- `Inventory/index.jsx` - Gestión de inventario
- `Inventory/Dashboard.jsx` - Dashboard de inventario
- `Inventory/Movements.jsx` - Movimientos de inventario
- `Warehouse/index.jsx` - Gestión de almacenes

#### Verificar Rutas
Agregar las siguientes rutas en `frontend/src/router/routes.jsx`:
```javascript
// Importar páginas
const Inventory = lazy(() => import('@/pages/Inventory'));
const InventoryDashboard = lazy(() => import('@/pages/Inventory/Dashboard'));
const InventoryMovements = lazy(() => import('@/pages/Inventory/Movements'));
const Warehouse = lazy(() => import('@/pages/Warehouse'));

// Agregar a rutas
{
  path: '/inventory',
  element: <Inventory />
},
{
  path: '/inventory/dashboard',
  element: <InventoryDashboard />
},
{
  path: '/inventory/movements',
  element: <InventoryMovements />
},
{
  path: '/warehouses',
  element: <Warehouse />
}
```

#### Verificar Navegación
Agregar elementos de menú en `frontend/src/apps/Navigation/NavigationContainer.jsx`:
```javascript
// Importar iconos
import {
  InboxOutlined,
  HomeOutlined,
  HistoryOutlined,
  BarChartOutlined as ChartOutlined
} from '@ant-design/icons';

// Agregar elementos de menú
{
  key: 'inventory',
  label: <Link to={'/inventory'}>Inventario</Link>,
  icon: <InboxOutlined />
},
{
  key: 'inventory-dashboard',
  label: <Link to={'/inventory/dashboard'}>Dashboard Inventario</Link>,
  icon: <ChartOutlined />
},
{
  key: 'inventory-movements',
  label: <Link to={'/inventory/movements'}>Movimientos</Link>,
  icon: <HistoryOutlined />
},
{
  key: 'warehouses',
  label: <Link to={'/warehouses'}>Almacenes</Link>,
  icon: <HomeOutlined />
}
```

#### Verificar Traducciones
Agregar traducciones en `frontend/src/locale/translation/es_es.js`:
```javascript
// Inventario
inventory: 'Inventario',
inventory_dashboard: 'Dashboard de Inventario',
inventory_movements: 'Movimientos de Inventario',
warehouses: 'Almacenes',
warehouse: 'Almacén',
current_stock: 'Stock Actual',
reserved_stock: 'Stock Reservado',
available_stock: 'Stock Disponible',
min_stock: 'Stock Mínimo',
max_stock: 'Stock Máximo',
reorder_point: 'Punto de Reorden',
low_stock_alert: 'Alerta de Stock Bajo',
reorder_alert: 'Alerta de Reorden',
movement_type: 'Tipo de Movimiento',
movement_reason: 'Razón del Movimiento',
stock_in: 'Entrada',
stock_out: 'Salida',
stock_adjustment: 'Ajuste',
stock_reserve: 'Reserva',
stock_unreserve: 'Liberación'
```

## Configuración Inicial

### 1. Crear Almacén Principal
```bash
POST /api/warehouses
Content-Type: application/json

{
  "name": "Almacén Principal",
  "code": "ALM001",
  "description": "Almacén principal de la empresa",
  "address": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "12345",
    "country": "País"
  },
  "contact": {
    "phone": "+1234567890",
    "email": "almacen@empresa.com",
    "manager": "Administrador"
  },
  "capacity": 10000,
  "isMain": true
}
```

### 2. Configurar Productos
Para cada producto, crear un registro de inventario:
```bash
POST /api/inventory
Content-Type: application/json

{
  "product": "product_id",
  "warehouse": "warehouse_id",
  "currentStock": 0,
  "minStock": 10,
  "maxStock": 1000,
  "reorderPoint": 50
}
```

### 3. Configurar Alertas
- **Stock Mínimo**: Establecer nivel mínimo de stock
- **Punto de Reorden**: Establecer punto de reorden
- **Capacidad Máxima**: Establecer capacidad máxima de almacenes

## Verificación de Instalación

### 1. Backend
```bash
cd backend
npm start
```

Verificar que no hay errores en la consola y que las rutas se registran correctamente:
```
✅ RUTAS CORE REGISTRADAS EXITOSAMENTE
```

### 2. Frontend
```bash
cd frontend
npm run dev
```

Verificar que la aplicación carga sin errores y que las nuevas páginas son accesibles.

### 3. Pruebas de Funcionalidad

#### Probar Crear Almacén
1. Ir a `/warehouses`
2. Hacer clic en "Nuevo Almacén"
3. Llenar formulario
4. Guardar
5. Verificar que aparece en la lista

#### Probar Crear Inventario
1. Ir a `/inventory`
2. Hacer clic en "Nuevo Inventario"
3. Seleccionar producto y almacén
4. Configurar niveles de stock
5. Guardar
6. Verificar que aparece en la lista

#### Probar Dashboard
1. Ir a `/inventory/dashboard`
2. Verificar que se cargan las estadísticas
3. Verificar que se muestran las alertas

#### Probar Movimientos
1. Ir a `/inventory/movements`
2. Verificar que se cargan los movimientos
3. Probar filtros

## Solución de Problemas

### Error: "Route.delete() requires a callback function"
**Causa**: El controlador no exporta el método `delete`
**Solución**: Verificar que el controlador exporte todos los métodos necesarios

### Error: "Failed to resolve import"
**Causa**: Ruta de importación incorrecta
**Solución**: Verificar las rutas de importación en los servicios

### Error: "The requested module does not provide an export named"
**Causa**: Icono de Ant Design no existe
**Solución**: Reemplazar con icono válido de Ant Design

### Error: "Cannot read properties of undefined"
**Causa**: Datos no cargados correctamente
**Solución**: Verificar que los servicios retornen datos válidos

## Mantenimiento

### 1. Limpieza de Datos
- Eliminar movimientos antiguos (más de 1 año)
- Limpiar inventarios inactivos
- Archivar almacenes cerrados

### 2. Optimización
- Revisar índices de base de datos
- Optimizar consultas frecuentes
- Limpiar caché periódicamente

### 3. Monitoreo
- Revisar logs de errores
- Monitorear rendimiento
- Verificar alertas del sistema

## Actualizaciones

### 1. Backup
Antes de cualquier actualización:
```bash
# Backup de base de datos
mongodump --db erp_crm --out backup/

# Backup de código
git commit -am "Backup antes de actualización"
```

### 2. Migración
Para actualizaciones de esquema:
```bash
# Ejecutar scripts de migración
node scripts/migrate-inventory.js
```

### 3. Verificación
Después de actualizaciones:
- Probar todas las funcionalidades
- Verificar que no hay errores
- Confirmar que los datos se mantienen

## Soporte

Para soporte técnico:
1. Revisar esta guía
2. Consultar logs del sistema
3. Verificar configuración
4. Contactar al administrador

---

**Versión**: 1.0  
**Última actualización**: Enero 2025  
**Autor**: Sistema ERP/CRM



