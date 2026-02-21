# 🎨 Sistema de Personalización de Facturas - Samuel Dev ERP CRM

## 🚀 **Descripción**

Este sistema permite personalizar completamente el diseño de las facturas directamente desde la interfaz de usuario, incluyendo colores, tipografías, logos y layout personalizado.

## ✨ **Características Principales**

### 🎨 **Personalización de Colores**
- **Color Principal**: Para títulos y elementos destacados
- **Color Secundario**: Para texto general
- **Color de Fondo**: Para el fondo de la factura
- **Color de Tabla**: Para encabezados de tabla
- **Color de Filas**: Para filas alternas de la tabla
- **Color de Bordes**: Para líneas y separadores
- **Color de Texto**: Para texto secundario

### 🔤 **Personalización de Tipografía**
- **Tipo de Letra**: Arial, Helvetica, Times New Roman, Georgia, Verdana, etc.
- **Tamaño de Letra**: De 8px a 20px
- **Tamaño de Título**: De 20px a 50px

### 🖼️ **Personalización de Logo**
- **Logo Personalizado**: Subir imagen propia
- **Posición del Logo**: Izquierda, derecha o centro
- **Tamaño del Logo**: De 100px a 400px de ancho

### 📝 **Campos Personalizados**
- **Footer Personalizado**: Mensaje personalizado en el pie de página
- **Campos Adicionales**: Agregar información extra en header, footer o sidebar

## 🛠️ **Instalación y Configuración**

### **1. Dependencias Requeridas**

```bash
# Backend
npm install multer

# Frontend
npm install @ant-design/icons
```

### **2. Estructura de Archivos**

```
backend/
├── src/
│   ├── models/appModels/Invoice.js          # Modelo extendido
│   ├── controllers/appControllers/invoiceController/
│   │   ├── create.js                       # Controlador de creación
│   │   └── schemaValidate.js               # Validación del schema
│   ├── services/logoUploadService.js       # Servicio de logos
│   ├── routes/coreRoutes/logoUpload.js     # Ruta de logos
│   ├── app.js                              # Aplicación principal
│   └── pdf/Invoice.pug                     # Template PDF personalizable

frontend/
├── src/
│   ├── components/InvoiceCustomizationPanel.jsx  # Panel de personalización
│   ├── hooks/useInvoiceTemplate.js               # Hook personalizado
│   └── modules/InvoiceModule/Forms/InvoiceForm.jsx  # Formulario integrado
```

### **3. Configuración de Base de Datos**

El modelo de Invoice se extiende automáticamente con los campos de personalización:

```javascript
invoiceTemplate: {
  primaryColor: String,
  secondaryColor: String,
  backgroundColor: String,
  // ... más campos
}
```

## 🎯 **Uso del Sistema**

### **1. Acceso a la Personalización**

1. Ve a **Facturas** → **Crear Nueva Factura**
2. El panel de personalización aparece automáticamente debajo de los campos básicos
3. Expande la sección **🎨 Personalizar Factura**

### **2. Personalización Paso a Paso**

#### **🎨 Colores**
1. Haz clic en el selector de color
2. Elige el color deseado
3. Los cambios se aplican en tiempo real

#### **🔤 Tipografía**
1. Selecciona el tipo de letra del dropdown
2. Ajusta los tamaños con los controles numéricos
3. La vista previa se actualiza automáticamente

#### **🖼️ Logo**
1. Haz clic en **"Subir Logo"**
2. Selecciona tu archivo de imagen
3. Ajusta la posición y tamaño
4. El logo se sube al servidor y se asocia a la factura

#### **📝 Campos Personalizados**
1. Escribe tu mensaje personalizado en el footer
2. Los cambios se reflejan en la vista previa

### **3. Vista Previa en Tiempo Real**

- Activa el switch **👀 Vista Previa**
- Ve cómo se verá tu factura personalizada
- Todos los cambios se reflejan instantáneamente

### **4. Guardado de Plantilla**

1. Haz clic en **💾 Guardar Plantilla**
2. La plantilla se guarda con la factura
3. Al editar la factura, la personalización se mantiene

## 🔧 **API Endpoints**

### **Subir Logo**
```http
POST /api/logos/upload
Content-Type: multipart/form-data

Body: { logo: File }
```

### **Listar Logos**
```http
GET /api/logos/list
```

### **Eliminar Logo**
```http
DELETE /api/logos/:filename
```

## 📱 **Templates Predefinidos**

### **Moderno**
- Colores azules profesionales
- Tipografía Arial limpia
- Diseño minimalista

### **Corporativo**
- Colores verdes empresariales
- Tipografía Georgia elegante
- Fondo suave

### **Creativo**
- Colores vibrantes
- Tipografía Verdana moderna
- Fondo cálido

### **Minimalista**
- Blanco y negro
- Tipografía Helvetica
- Diseño ultra limpio

## 🎨 **Personalización Avanzada**

### **Campos Personalizados Dinámicos**
```javascript
customFields: [
  {
    label: "Términos de Pago",
    value: "Neto 30 días",
    position: "footer"
  }
]
```

### **CSS Personalizado**
El sistema genera CSS dinámico basado en tus selecciones:
```css
body {
  background: #tu-color;
  font-family: 'tu-fuente';
  font-size: tu-tamaño;
}
```

## 🚀 **Generación de PDF Personalizado**

1. **Crear Factura**: Con personalización aplicada
2. **Generar PDF**: El sistema usa tu template personalizado
3. **Resultado**: PDF con colores, fuentes y logo personalizados

## 🔍 **Solución de Problemas**

### **Logo no se muestra**
- Verifica que el archivo sea una imagen válida
- Comprueba que el tamaño no exceda 5MB
- Asegúrate de que la ruta del archivo sea correcta

### **Colores no se aplican**
- Verifica que los códigos de color sean hexadecimales válidos
- Asegúrate de que el template se haya guardado
- Revisa la consola del navegador para errores

### **PDF no se genera**
- Verifica que todos los campos requeridos estén completos
- Comprueba que el template sea válido
- Revisa los logs del servidor

## 🎯 **Próximas Mejoras**

- [ ] **Editor Visual Drag & Drop**
- [ ] **Templates Comunitarios**
- [ ] **Exportación a Formatos Adicionales**
- [ ] **Historial de Cambios**
- [ ] **Sincronización entre Facturas**
- [ ] **API para Templates Externos**

## 🤝 **Contribución**

Para contribuir al sistema de personalización:

1. Fork del repositorio
2. Crea una rama para tu feature
3. Implementa las mejoras
4. Envía un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la misma licencia que Samuel Dev ERP CRM.

## 🆘 **Soporte**

Si tienes problemas o preguntas:

1. Revisa este README
2. Consulta los issues del repositorio
3. Crea un nuevo issue si es necesario

---

**¡Disfruta personalizando tus facturas! 🎨✨**
