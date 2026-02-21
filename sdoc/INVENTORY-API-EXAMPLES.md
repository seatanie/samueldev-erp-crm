# Ejemplos de Uso - API de Inventario

## Endpoints Principales

### 1. Gestión de Inventario

#### Obtener Lista de Inventario
```bash
GET /api/inventory?page=1&limit=10&search=producto&warehouse=warehouse_id
```

**Respuesta:**
```json
{
  "success": true,
  "result": {
    "inventory": [
      {
        "_id": "inventory_id",
        "product": {
          "_id": "product_id",
          "name": "Producto Ejemplo",
          "reference": "REF001"
        },
        "warehouse": {
          "_id": "warehouse_id",
          "name": "Almacén Principal",
          "code": "ALM001"
        },
        "currentStock": 100,
        "reservedStock": 10,
        "availableStock": 90,
        "minStock": 20,
        "maxStock": 500,
        "reorderPoint": 50,
        "status": "active",
        "lastMovement": "2025-01-04T18:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### Crear Registro de Inventario
```bash
POST /api/inventory
Content-Type: application/json

{
  "product": "product_id",
  "warehouse": "warehouse_id",
  "currentStock": 100,
  "minStock": 20,
  "maxStock": 500,
  "reorderPoint": 50
}
```

#### Actualizar Stock
```bash
POST /api/inventory/inventory_id/update-stock
Content-Type: application/json

{
  "quantity": 50,
  "type": "in",
  "reason": "Compra de mercancía"
}
```

### 2. Gestión de Almacenes

#### Obtener Almacenes Activos
```bash
GET /api/warehouses/active
```

**Respuesta:**
```json
{
  "success": true,
  "result": [
    {
      "_id": "warehouse_id",
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
        "manager": "Juan Pérez"
      },
      "capacity": 10000,
      "currentCapacity": 5000,
      "isMain": true,
      "status": "active"
    }
  ]
}
```

#### Crear Almacén
```bash
POST /api/warehouses
Content-Type: application/json

{
  "name": "Nuevo Almacén",
  "code": "ALM002",
  "description": "Almacén secundario",
  "address": {
    "street": "Calle Secundaria 456",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "54321",
    "country": "País"
  },
  "contact": {
    "phone": "+0987654321",
    "email": "almacen2@empresa.com",
    "manager": "María García"
  },
  "capacity": 5000,
  "isMain": false
}
```

### 3. Movimientos de Inventario

#### Obtener Historial de Movimientos
```bash
GET /api/inventory/inventory_id/movements?page=1&limit=10&type=in&startDate=2025-01-01&endDate=2025-01-31
```

**Respuesta:**
```json
{
  "success": true,
  "result": {
    "movements": [
      {
        "_id": "movement_id",
        "product": {
          "_id": "product_id",
          "name": "Producto Ejemplo",
          "reference": "REF001"
        },
        "warehouse": {
          "_id": "warehouse_id",
          "name": "Almacén Principal",
          "code": "ALM001"
        },
        "quantity": 50,
        "type": "in",
        "oldStock": 50,
        "newStock": 100,
        "reason": "Compra de mercancía",
        "createdBy": {
          "_id": "user_id",
          "name": "Usuario Admin"
        },
        "createdAt": "2025-01-04T18:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 4. Alertas y Estadísticas

#### Obtener Productos con Stock Bajo
```bash
GET /api/inventory/low-stock
```

**Respuesta:**
```json
{
  "success": true,
  "result": [
    {
      "_id": "inventory_id",
      "product": {
        "_id": "product_id",
        "name": "Producto con Stock Bajo",
        "reference": "REF002"
      },
      "warehouse": {
        "_id": "warehouse_id",
        "name": "Almacén Principal",
        "code": "ALM001"
      },
      "currentStock": 5,
      "minStock": 20,
      "availableStock": 5
    }
  ]
}
```

#### Obtener Estadísticas del Inventario
```bash
GET /api/inventory/stats
```

**Respuesta:**
```json
{
  "success": true,
  "result": {
    "totalProducts": 150,
    "totalStock": 5000,
    "lowStockCount": 12,
    "reorderCount": 8,
    "totalValue": 125000.50,
    "averageStock": 33.33
  }
}
```

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en los datos enviados
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

## Ejemplos de Uso en Frontend

### 1. Cargar Dashboard de Inventario
```javascript
import inventoryService from '@/services/inventoryService';

const loadDashboardData = async () => {
  try {
    const [stats, lowStock, reorder, movements, warehouses] = await Promise.all([
      inventoryService.getInventoryStats(),
      inventoryService.getLowStockProducts(),
      inventoryService.getReorderProducts(),
      inventoryService.getMovementHistory({ limit: 10 }),
      warehouseService.getActiveWarehouses()
    ]);
    
    // Procesar datos...
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
};
```

### 2. Actualizar Stock
```javascript
const updateStock = async (inventoryId, quantity, type, reason) => {
  try {
    const response = await inventoryService.updateStock(inventoryId, {
      quantity,
      type,
      reason
    });
    
    if (response.success) {
      message.success('Stock actualizado correctamente');
      loadData(); // Recargar datos
    }
  } catch (error) {
    message.error('Error actualizando stock');
  }
};
```

### 3. Crear Movimiento de Inventario
```javascript
const createMovement = async (data) => {
  try {
    const response = await inventoryService.updateStock(data.inventoryId, {
      quantity: data.quantity,
      type: data.type,
      reason: data.reason
    });
    
    if (response.success) {
      message.success('Movimiento registrado correctamente');
    }
  } catch (error) {
    message.error('Error registrando movimiento');
  }
};
```

## Filtros y Búsquedas

### Parámetros de Filtrado
- `search`: Búsqueda por nombre de producto
- `warehouse`: Filtrar por almacén
- `status`: Filtrar por estado (active, inactive, discontinued)
- `type`: Filtrar por tipo de movimiento
- `startDate`: Fecha de inicio para movimientos
- `endDate`: Fecha de fin para movimientos
- `page`: Número de página
- `limit`: Elementos por página

### Ejemplo de Búsqueda Avanzada
```bash
GET /api/inventory?search=producto&warehouse=warehouse_id&status=active&page=1&limit=20
```

## Validaciones

### Inventario
- `product`: Requerido, debe existir
- `warehouse`: Requerido, debe existir
- `currentStock`: Requerido, mínimo 0
- `minStock`: Mínimo 0
- `maxStock`: Mínimo 0
- `reorderPoint`: Mínimo 0

### Almacén
- `name`: Requerido, máximo 100 caracteres
- `code`: Requerido, único, máximo 20 caracteres
- `capacity`: Mínimo 0
- `email`: Formato de email válido

### Movimiento
- `quantity`: Requerido, mayor que 0
- `type`: Requerido, debe ser uno de: in, out, adjustment, reserve, unreserve
- `reason`: Máximo 500 caracteres

## Manejo de Errores

### Errores Comunes
1. **Stock Insuficiente**: Al intentar sacar más stock del disponible
2. **Almacén Inactivo**: Al intentar operar en almacén inactivo
3. **Producto No Encontrado**: Al referenciar producto inexistente
4. **Validación Fallida**: Datos inválidos en la petición

### Ejemplo de Manejo de Errores
```javascript
try {
  const response = await inventoryService.updateStock(id, data);
  if (!response.success) {
    message.error(response.message || 'Error en la operación');
  }
} catch (error) {
  if (error.response?.status === 400) {
    message.error('Datos inválidos');
  } else if (error.response?.status === 404) {
    message.error('Recurso no encontrado');
  } else {
    message.error('Error del servidor');
  }
}
```

## Mejores Prácticas

1. **Validar Datos**: Siempre validar datos antes de enviar
2. **Manejar Errores**: Implementar manejo robusto de errores
3. **Cargar Estados**: Mostrar indicadores de carga
4. **Confirmar Acciones**: Pedir confirmación para operaciones críticas
5. **Actualizar UI**: Refrescar datos después de operaciones
6. **Logs**: Registrar operaciones importantes
7. **Permisos**: Verificar permisos antes de operaciones

---

**Nota**: Esta documentación se actualiza regularmente. Para la versión más reciente, consultar el repositorio del proyecto.



