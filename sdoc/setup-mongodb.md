# 🔧 Configuración de MongoDB para SAMUEL DEV ERP CRM

## 🚨 Problema Actual
El backend no puede conectarse a MongoDB, causando errores de login con `net::ERR_EMPTY_RESPONSE`.

## 📋 Soluciones Disponibles

### Opción 1: MongoDB Local (Recomendado para desarrollo)

#### Windows:
1. Descargar MongoDB Community Server desde: https://www.mongodb.com/try/download/community
2. Instalar con configuración por defecto
3. Crear carpeta: `C:\data\db`
4. Iniciar MongoDB: `mongod`

#### macOS:
```bash
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu):
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
```

### Opción 2: MongoDB Atlas (Nube - Gratuito)

1. Ir a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear cuenta gratuita
3. Crear cluster gratuito (M0)
4. Configurar acceso de red (0.0.0.0/0)
5. Crear usuario de base de datos
6. Obtener URL de conexión

### Opción 3: Docker

```bash
# Instalar Docker Desktop
# Luego ejecutar:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## ⚙️ Configuración del Backend

### 1. Crear archivo `.env` en la carpeta `backend/`:

```env
# Para MongoDB local
DATABASE=mongodb://localhost:27017/samueldev-erp-crm

# Para MongoDB Atlas: en cloud.mongodb.com ve a Connect > Drivers y pega tu connection string
# DATABASE=<pegar-aqui-tu-connection-string-desde-atlas>

PORT=8889
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Reiniciar el backend:
```bash
cd backend
npm start
```

## 🧪 Verificar Conexión

### Con MongoDB local:
```bash
# En PowerShell (si MongoDB está instalado)
mongosh
# O
mongo
```

### Con Docker:
```bash
docker exec -it mongodb mongosh
```

## 📝 Crear Usuario Inicial

Una vez que MongoDB esté funcionando, necesitarás crear un usuario administrador inicial:

1. Ir a `/admin` en la aplicación
2. Crear un nuevo usuario con rol "owner"
3. Usar ese usuario para hacer login

## 🔍 Troubleshooting

### Error: "ECONNREFUSED"
- MongoDB no está corriendo
- Puerto incorrecto (por defecto 27017)

### Error: "Authentication failed"
- Credenciales incorrectas
- Base de datos no existe

### Error: "No such file or directory"
- Crear carpeta `C:\data\db` (Windows)
- Verificar permisos de escritura




