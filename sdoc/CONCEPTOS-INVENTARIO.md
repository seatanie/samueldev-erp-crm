# 📦 Conceptos de Inventario - Samuel Dev ERP

## 🔍 Diferencias entre Producto e Inventario

### 📋 **PRODUCTO** (Catálogo)
- **Qué es**: Definición del artículo
- **Dónde**: Módulo de Productos
- **Contiene**:
  - Nombre del producto
  - Descripción
  - Precio
  - Categoría
  - Referencia/SKU
  - Imagen
- **Características**:
  - Es **global** (existe en todo el sistema)
  - No tiene stock específico
  - Se crea una sola vez

### 📊 **INVENTARIO** (Stock Físico)
- **Qué es**: Cantidad física del producto en un almacén específico
- **Dónde**: Módulo de Inventario
- **Contiene**:
  - Producto (referencia al catálogo)
  - Almacén (ubicación específica)
  - Stock actual
  - Stock mínimo
  - Punto de reorden
  - Stock máximo
  - Notas
- **Características**:
  - Es **local** (específico por almacén)
  - Un producto puede tener múltiples registros de inventario
  - Se actualiza constantemente

## 🔄 Flujo de Trabajo Correcto

```
1. CREAR PRODUCTO
   ↓
   Producto: "Laptop Dell XPS 13"
   Precio: $1,500
   Categoría: "Computadoras"
   ↓
2. CREAR INVENTARIO
   ↓
   Almacén A: 10 unidades
   Almacén B: 5 unidades
   Almacén C: 0 unidades
```

## 📝 Ejemplo Práctico

### Producto: "Coca-Cola 500ml"
- **En el catálogo**: Existe una sola vez
- **En inventario**:
  - Almacén Central: 1000 unidades
  - Almacén Norte: 500 unidades
  - Almacén Sur: 200 unidades

### ¿Por qué es así?
1. **Flexibilidad**: Diferentes almacenes pueden tener diferentes cantidades
2. **Control**: Puedes rastrear stock por ubicación
3. **Alertas**: Stock bajo en un almacén específico
4. **Reorden**: Saber cuándo reabastecer cada almacén

## 🎯 Casos de Uso

### Escenario 1: Nuevo Producto
1. Crear producto en "Gestión de Productos"
2. Agregar al inventario en "Gestión de Inventario"
3. Especificar en qué almacén(es) estará disponible

### Escenario 2: Producto Existente en Nuevo Almacén
1. El producto ya existe en el catálogo
2. Solo necesitas crear un nuevo registro de inventario
3. Especificar la cantidad inicial en el nuevo almacén

### Escenario 3: Actualizar Stock
1. Usar "Actualizar Stock" en el inventario
2. Registrar movimientos (entrada/salida/ajuste)
3. El sistema actualiza automáticamente las cantidades

## ⚠️ Puntos Importantes

- **NO** duplicar productos en el catálogo
- **SÍ** crear múltiples registros de inventario por producto
- **SÍ** usar el botón "Agregar Producto" para vincular productos existentes con almacenes
- **NO** confundir "crear producto" con "agregar al inventario"

## 🚀 Beneficios del Sistema

1. **Trazabilidad**: Saber exactamente dónde está cada producto
2. **Control de Stock**: Alertas automáticas por almacén
3. **Eficiencia**: Un producto, múltiples ubicaciones
4. **Reportes**: Análisis detallado por ubicación
5. **Escalabilidad**: Fácil agregar nuevos almacenes

---

*Este sistema te permite manejar inventarios complejos de manera organizada y eficiente.*


