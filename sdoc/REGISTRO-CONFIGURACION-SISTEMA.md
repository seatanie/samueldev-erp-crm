# Registro con Configuración del Sistema

## Descripción

Se ha implementado una nueva funcionalidad que permite a los usuarios configurar las preferencias del sistema durante el proceso de registro. Esto incluye la configuración de idioma, zona horaria, país, moneda, formato de fecha y formato de número.

## Características

### 🎯 Configuración del Sistema
- **Idioma**: Español, Inglés, Francés
- **Zona Horaria**: Zonas horarias de México (Ciudad de México, Tijuana, Hermosillo, Mérida)
- **País**: Lista completa de países con zonas horarias
- **Moneda**: Soporte para múltiples monedas (MXN, USD, EUR, etc.)
- **Formato de Fecha**: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- **Formato de Número**: #,##0.00

### 🎨 Interfaz de Usuario
- Diseño responsivo con 3 columnas en pantallas grandes
- Vista previa en tiempo real de la configuración
- Ejemplo de factura con la configuración seleccionada
- Detección automática de idioma del navegador
- Preselección de país basada en la ubicación del usuario

### 🔧 Componentes Reutilizables
- `SystemSettingsForm`: Formulario de configuración del sistema
- `SystemSettingsPreview`: Vista previa de la configuración
- `RegisterForm`: Formulario de información personal

## Archivos Modificados

### Nuevos Archivos
- `frontend/src/pages/Register.jsx` - Página principal de registro
- `frontend/src/components/SystemSettingsForm.jsx` - Formulario de configuración
- `frontend/src/components/SystemSettingsPreview.jsx` - Vista previa
- `REGISTRO-CONFIGURACION-SISTEMA.md` - Esta documentación

### Archivos Modificados
- `frontend/src/router/AuthRouter.jsx` - Agregada ruta de registro
- `frontend/src/pages/Login.jsx` - Enlace a registro
- `frontend/src/forms/RegisterForm.jsx` - Confirmación de contraseña
- `frontend/src/locale/translation/es_es.js` - Nuevas traducciones

## Uso

### Acceso a la Página de Registro
1. Navegar a `/register`
2. O hacer clic en "Regístrate aquí" desde la página de login

### Proceso de Registro
1. **Información Personal**: Nombre, email, contraseña, confirmación de contraseña, país
2. **Configuración del Sistema**: Seleccionar preferencias de idioma, zona horaria, moneda, etc.
3. **Vista Previa**: Ver en tiempo real cómo se verá la configuración
4. **Crear Cuenta**: Enviar formulario con toda la información

### Configuración por Defecto
- **Idioma**: Español (es_es)
- **Zona Horaria**: México (GMT-6)
- **País**: México (MX)
- **Moneda**: MXN (Peso Mexicano)
- **Formato de Fecha**: DD/MM/YYYY
- **Formato de Número**: #,##0.00

## Estructura de Datos

### Datos del Usuario
```javascript
{
  name: "Nombre del Usuario",
  email: "usuario@email.com",
  password: "contraseña123",
  confirm_password: "contraseña123",
  country: "MX"
}
```

### Configuración del Sistema
```javascript
{
  language: "es_es",
  timezone: "America/Mexico_City",
  country: "MX",
  currency: "MXN",
  dateFormat: "DD/MM/YYYY",
  numberFormat: "#,##0.00"
}
```

## Traducciones

### Español (es_es)
- `create_account`: "Crear Cuenta"
- `personal_information`: "Información Personal"
- `system_configuration`: "Configuración del Sistema"
- `preview_configuration`: "Vista Previa de la Configuración"
- `language`: "Idioma"
- `timezone`: "Zona Horaria"
- `currency`: "Moneda"
- `date_format`: "Formato de Fecha"
- `number_format`: "Formato de Número"

## Responsive Design

### Pantallas Grandes (lg+)
- 3 columnas: Información Personal | Configuración | Vista Previa

### Pantallas Medianas (md)
- 2 columnas: Información Personal + Configuración | Vista Previa

### Pantallas Pequeñas (xs)
- 1 columna: Todos los elementos apilados verticalmente

## Tecnologías Utilizadas

- **React**: Framework principal
- **Ant Design**: Componentes de UI
- **Redux**: Estado de la aplicación
- **React Router**: Navegación
- **CSS-in-JS**: Estilos inline para mejor control

## Próximos Pasos

### Mejoras Futuras
1. **Validación del Backend**: Implementar validación de configuración en el servidor
2. **Persistencia**: Guardar configuración en base de datos
3. **Más Idiomas**: Agregar soporte para más idiomas
4. **Zonas Horarias**: Expandir opciones de zonas horarias
5. **Monedas**: Agregar más opciones de monedas con símbolos
6. **Temas**: Agregar selección de tema (claro/oscuro)

### Integración con Backend
1. **API de Registro**: Modificar endpoint de registro para incluir configuración
2. **Configuración por Defecto**: Aplicar configuración al crear usuario
3. **Validación**: Validar configuración en el servidor
4. **Migración**: Migrar usuarios existentes a nueva estructura

## Contribución

Para contribuir a esta funcionalidad:

1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Implementar cambios
4. Agregar pruebas
5. Crear pull request

## Licencia

Este proyecto está bajo la misma licencia que el proyecto principal.
