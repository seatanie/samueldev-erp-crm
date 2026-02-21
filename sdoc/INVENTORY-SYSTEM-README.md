# Sistema de Inventario Avanzado

## Descripción General

El sistema de inventario avanzado es una funcionalidad completa que permite gestionar el stock de productos, movimientos de inventario, alertas de stock bajo y administración de almacenes. Está integrado en el ERP/CRM existente y proporciona control total sobre el inventario de la empresa.

## Características Principales

### 1. Gestión de Inventario
- **Control de Stock**: Seguimiento en tiempo real del stock actual, reservado y disponible
- **Múltiples Almacenes**: Soporte para múltiples ubicaciones de almacenamiento
- **Alertas Inteligentes**: Notificaciones automáticas para stock bajo y productos que necesitan reorden
- **Movimientos de Inventario**: Registro detallado de todas las transacciones de inventario

### 2. Tipos de Movimientos
- **Entrada (in)**: Aumento de stock por compras, devoluciones, etc.
- **Salida (out)**: Reducción de stock por ventas, pérdidas, etc.
- **Ajuste (adjustment)**: Corrección manual de inventario
- **Reserva (reserve)**: Reserva de stock para órdenes pendientes
- **Liberación (unreserve)**: Liberación de stock reservado

### 3. Dashboard de Inventario
- **Estadísticas en Tiempo Real**: Total de productos, stock total, alertas
- **Productos con Stock Bajo**: Lista de productos que han alcanzado su nivel mínimo
- **Productos que Necesitan Reorden**: Lista de productos que han alcanzado su punto de reorden
- **Movimientos Recientes**: Historial de las últimas transacciones
- **Estado de Almacenes**: Información sobre el estado de cada almacén

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        SISTEMA DE INVENTARIO                    │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND (React + Ant Design)                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Dashboard     │ │   Inventario    │ │   Movimientos   │   │
│  │   de Inventario │ │   Management    │ │   History       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│  ┌─────────────────┐ ┌─────────────────┐                       │
│  │   Almacenes     │ │   Servicios     │                       │
│  │   Management    │ │   (API Calls)   │                       │
│  └─────────────────┘ └─────────────────┘                       │
├─────────────────────────────────────────────────────────────────┤
│  BACKEND (Node.js + Express)                                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Controllers   │ │   Models        │ │   Routes        │   │
│  │   - Inventory   │ │   - Inventory   │ │   - /api/       │   │
│  │   - Warehouse   │ │   - Movement    │ │     inventory   │   │
│  │   - Movement    │ │   - Warehouse   │ │   - /api/       │   │
│  └─────────────────┘ └─────────────────┘ │     warehouses  │   │
│  ┌─────────────────┐ ┌─────────────────┐ └─────────────────┘   │
│  │   Middleware    │ │   Services      │                       │
│  │   - Auth        │ │   - Email       │                       │
│  │   - Validation  │ │   - Notifications│                      │
│  └─────────────────┘ └─────────────────┘                       │
├─────────────────────────────────────────────────────────────────┤
│  DATABASE (MongoDB)                                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Inventory     │ │   Movements     │ │   Warehouses    │   │
│  │   Collection    │ │   Collection    │ │   Collection    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│  ┌─────────────────┐ ┌─────────────────┐                       │
│  │   Products      │ │   Users         │                       │
│  │   Collection    │ │   Collection    │                       │
│  └─────────────────┘ └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### Backend

#### Modelos de Datos

**1. Inventory (Inventario)**
```javascript
{
  product: ObjectId,           // Referencia al producto
  warehouse: ObjectId,         // Referencia al almacén
  currentStock: Number,        // Stock actual
  reservedStock: Number,       // Stock reservado
  availableStock: Number,      // Stock disponible (calculado)
  minStock: Number,           // Stock mínimo
  maxStock: Number,           // Stock máximo
  reorderPoint: Number,       // Punto de reorden
  lastMovement: Date,         // Último movimiento
  status: String,             // Estado del inventario
  createdBy: ObjectId,        // Usuario que creó el registro
  updatedBy: ObjectId         // Usuario que actualizó el registro
}
```

**2. InventoryMovement (Movimiento de Inventario)**
```javascript
{
  inventory: ObjectId,        // Referencia al registro de inventario
  product: ObjectId,          // Referencia al producto
  warehouse: ObjectId,        // Referencia al almacén
  quantity: Number,           // Cantidad del movimiento
  type: String,              // Tipo de movimiento
  oldStock: Number,          // Stock anterior
  newStock: Number,          // Stock nuevo
  reason: String,            // Razón del movimiento
  createdBy: ObjectId        // Usuario que realizó el movimiento
}
```

**3. Warehouse (Almacén)**
```javascript
{
  name: String,              // Nombre del almacén
  code: String,              // Código único del almacén
  description: String,       // Descripción
  address: {                 // Dirección
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {                 // Información de contacto
    phone: String,
    email: String,
    manager: String
  },
  capacity: Number,          // Capacidad total
  currentCapacity: Number,   // Capacidad actual utilizada
  isMain: Boolean,          // Si es el almacén principal
  status: String,           // Estado del almacén
  createdBy: ObjectId,      // Usuario que creó el almacén
  updatedBy: ObjectId       // Usuario que actualizó el almacén
}
```

#### Controladores

**1. InventoryController**
- `create`: Crear nuevo registro de inventario
- `read`: Obtener registro de inventario por ID
- `update`: Actualizar registro de inventario
- `delete`: Eliminar registro de inventario
- `list`: Listar registros de inventario con filtros
- `getInventoryWithDetails`: Obtener inventario con detalles de producto y almacén
- `getLowStockProducts`: Obtener productos con stock bajo
- `getReorderProducts`: Obtener productos que necesitan reorden
- `updateStock`: Actualizar stock y registrar movimiento
- `getMovementHistory`: Obtener historial de movimientos
- `getInventoryStats`: Obtener estadísticas del inventario

**2. WarehouseController**
- `create`: Crear nuevo almacén
- `read`: Obtener almacén por ID
- `update`: Actualizar almacén
- `delete`: Eliminar almacén
- `list`: Listar almacenes con filtros
- `getActiveWarehouses`: Obtener almacenes activos
- `getMainWarehouse`: Obtener almacén principal

#### Rutas API

**Inventario:**
- `GET /api/inventory` - Listar inventario
- `POST /api/inventory` - Crear inventario
- `GET /api/inventory/:id` - Obtener inventario por ID
- `PUT /api/inventory/:id` - Actualizar inventario
- `DELETE /api/inventory/:id` - Eliminar inventario
- `GET /api/inventory/low-stock` - Productos con stock bajo
- `GET /api/inventory/reorder` - Productos que necesitan reorden
- `POST /api/inventory/:id/update-stock` - Actualizar stock
- `GET /api/inventory/:id/movements` - Historial de movimientos
- `GET /api/inventory/stats` - Estadísticas del inventario

**Almacenes:**
- `GET /api/warehouses` - Listar almacenes
- `POST /api/warehouses` - Crear almacén
- `GET /api/warehouses/:id` - Obtener almacén por ID
- `PUT /api/warehouses/:id` - Actualizar almacén
- `DELETE /api/warehouses/:id` - Eliminar almacén
- `GET /api/warehouses/active` - Almacenes activos
- `GET /api/warehouses/main` - Almacén principal

### Frontend

#### Servicios

**1. InventoryService**
```javascript
// Métodos principales
- getInventoryList(params)     // Listar inventario
- createInventory(data)        // Crear inventario
- getInventoryById(id)         // Obtener por ID
- updateInventory(id, data)    // Actualizar inventario
- deleteInventory(id)          // Eliminar inventario
- getLowStockProducts()        // Productos con stock bajo
- getReorderProducts()         // Productos que necesitan reorden
- updateStock(id, data)        // Actualizar stock
- getMovementHistory(params)   // Historial de movimientos
- getInventoryStats()          // Estadísticas
```

**2. WarehouseService**
```javascript
// Métodos principales
- getWarehouseList(params)     // Listar almacenes
- createWarehouse(data)        // Crear almacén
- getWarehouseById(id)         // Obtener por ID
- updateWarehouse(id, data)    // Actualizar almacén
- deleteWarehouse(id)          // Eliminar almacén
- getActiveWarehouses()        // Almacenes activos
- getMainWarehouse()           // Almacén principal
```

#### Páginas

**1. Inventory (Gestión de Inventario)**
- Lista completa de inventario con filtros
- Búsqueda por producto, almacén, estado
- Acciones: crear, editar, eliminar, actualizar stock
- Vista de detalles con historial de movimientos

**2. Inventory Dashboard (Dashboard de Inventario)**
- Estadísticas en tiempo real
- Alertas de stock bajo y reorden
- Productos que requieren atención
- Movimientos recientes
- Estado de almacenes

**3. Inventory Movements (Movimientos de Inventario)**
- Historial completo de movimientos
- Filtros por fecha, tipo, producto, almacén
- Detalles de cada movimiento
- Exportación de datos

**4. Warehouse (Gestión de Almacenes)**
- Lista de almacenes
- Crear, editar, eliminar almacenes
- Información de contacto y dirección
- Estado y capacidad de almacenes

#### Navegación

El sistema se integra en el menú principal con las siguientes opciones:
- **Inventario**: Gestión principal de inventario
- **Dashboard Inventario**: Panel de control con alertas
- **Movimientos**: Historial de movimientos
- **Almacenes**: Gestión de almacenes

## Funcionalidades Avanzadas

### 1. Alertas Automáticas
- **Stock Bajo**: Cuando el stock actual ≤ stock mínimo
- **Necesita Reorden**: Cuando el stock actual ≤ punto de reorden
- **Notificaciones Visuales**: Alertas en el dashboard y listas

### 2. Control de Capacidad
- **Capacidad de Almacenes**: Control de espacio disponible
- **Cálculo Automático**: Capacidad utilizada vs. capacidad total
- **Validaciones**: Prevenir exceder capacidad máxima

### 3. Trazabilidad Completa
- **Historial de Movimientos**: Registro de todas las transacciones
- **Auditoría**: Usuario y fecha de cada operación
- **Razones**: Documentación del motivo de cada movimiento

### 4. Integración con Productos
- **Referencias**: Enlace directo con el catálogo de productos
- **Categorías**: Filtrado por categorías de productos
- **Códigos**: Búsqueda por referencia de producto

## Configuración y Uso

### 1. Configuración Inicial
1. Crear almacenes principales
2. Configurar productos con niveles de stock
3. Establecer puntos de reorden
4. Configurar alertas

### 2. Flujo de Trabajo Típico
1. **Recepción de Mercancía**: Crear movimiento de entrada
2. **Venta**: Crear movimiento de salida
3. **Ajustes**: Corregir inventario cuando sea necesario
4. **Reservas**: Reservar stock para órdenes pendientes
5. **Monitoreo**: Revisar dashboard para alertas

### 3. Mejores Prácticas
- Revisar alertas diariamente
- Mantener niveles de stock actualizados
- Documentar razones de movimientos
- Realizar inventarios físicos periódicos

## Seguridad y Permisos

- **Autenticación**: Requerida para todas las operaciones
- **Autorización**: Basada en roles de usuario
- **Auditoría**: Registro de todas las operaciones
- **Validaciones**: Verificación de datos antes de procesar

## Rendimiento y Escalabilidad

- **Índices de Base de Datos**: Optimizados para consultas frecuentes
- **Paginación**: Listas grandes divididas en páginas
- **Caché**: Estadísticas cacheadas para mejor rendimiento
- **Filtros**: Búsquedas eficientes con múltiples criterios

## Mantenimiento

### 1. Tareas Regulares
- Revisar alertas de stock bajo
- Actualizar niveles de reorden
- Verificar capacidad de almacenes
- Limpiar movimientos antiguos

### 2. Monitoreo
- Estadísticas de uso
- Rendimiento de consultas
- Errores en movimientos
- Alertas del sistema

## Futuras Mejoras

### 1. Códigos de Barras
- Generación automática de códigos
- Escaneo para movimientos rápidos
- Integración con lectores de códigos

### 2. Reportes Avanzados
- Análisis de tendencias
- Predicción de demanda
- Optimización de stock
- Reportes personalizados

### 3. Integración Externa
- Sistemas de punto de venta
- Plataformas de e-commerce
- Sistemas de compras
- APIs de proveedores

## Soporte Técnico

Para soporte técnico o consultas sobre el sistema de inventario:
- Revisar esta documentación
- Consultar logs del sistema
- Contactar al administrador del sistema
- Reportar bugs o sugerencias

---

**Versión**: 1.0  
**Última actualización**: Enero 2025  
**Autor**: Sistema ERP/CRM  
**Estado**: Implementado y Funcional
