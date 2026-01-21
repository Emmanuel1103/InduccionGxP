# Sistema de Inducción GxP

Sistema web para gestión de inducciones en Buenas Prácticas (GxP) con integración de Azure Cloud Services.

## Características

- **Autenticación Microsoft Azure AD** - Login seguro con cuentas corporativas
- **Gestión de Videos** - Subida y almacenamiento de videos en Azure Blob Storage
- **Cuestionarios Interactivos** - Sistema de evaluación con seguimiento de respuestas
- **Panel de Administración** - Gestión completa de contenido y usuarios
- **Base de Datos NoSQL** - Azure Cosmos DB para almacenamiento escalable
- **Diseño Responsivo** - Interfaz moderna compatible con todos los dispositivos

## Requisitos Previos

### Servicios de Azure
- **Azure AD** (Autenticación)
- **Azure Cosmos DB** (Base de datos)
- **Azure Blob Storage** (Almacenamiento de videos)

### Software
- Python 3.8+
- Node.js 16+
- npm o yarn

## Instalación

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd InduccionGxP
```

### 2. Configurar Backend

```bash
cd backend
pip install -r requirements.txt
```

Crear archivo `.env` basado en `.env.example`:
```env
# Azure AD
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
AZURE_REDIRECT_URI=http://localhost:5000/api/auth/callback

# Azure CosmosDB
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443
COSMOS_KEY=your-cosmos-key
COSMOS_DATABASE=induccion_gxp

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your-account;AccountKey=your-key;EndpointSuffix=core.windows.net

# Flask
SECRET_KEY=your-secret-key
FLASK_ENV=development
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

## Configuración de Azure Storage para Videos

### Crear Contenedor de Videos

1. **Opción A: Usar Script Automatizado**
```bash
cd backend
python scripts/setup_azure_storage.py
```

2. **Opción B: Azure Portal**
   - Ir a Storage Account → Containers
   - Crear contenedor: `videoinduccion`
   - Nivel de acceso: Privado (se usan SAS tokens)

### Subir Videos

**Desde la Aplicación:**
1. Ir a Administración → Información de Inducción
2. Sección "Gestión de Video de Inducción"
3. Click en "Subir Video" o "Reemplazar Video"
4. Seleccionar archivo (MP4, WebM, OGG, MOV - máx 500MB)
5. El sistema automáticamente:
   - Sube el video a Azure Storage
   - Genera URL con SAS token (válida 30 días)
   - Actualiza la configuración

**Desde Script:**
```bash
cd backend
python scripts/subir_video.py
```

## Ejecución

### Desarrollo

**Backend:**
```bash
cd backend
python app.py
```
Servidor en: `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Aplicación en: `http://localhost:5173`

### Producción

**Backend:**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Frontend:**
```bash
cd frontend
npm run build
# Servir carpeta dist/ con servidor web
```

## Estructura del Proyecto

```
InduccionGxP/
├── backend/
│   ├── rutas/
│   │   ├── auth.py              # Autenticación Azure AD
│   │   ├── video_upload.py      # Gestión de videos
│   │   ├── preguntas.py         # API de cuestionarios
│   │   └── configuracion_induccion.py
│   ├── servicios/
│   │   ├── cosmos_db.py         # Cliente Cosmos DB
│   │   └── azure_storage.py     # Cliente Blob Storage
│   ├── scripts/
│   │   ├── setup_azure_storage.py
│   │   └── subir_video.py
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── componets/
│   │   │   ├── configuracion/
│   │   │   │   └── SubidorVideo.jsx  # Componente de subida
│   │   │   ├── videoPlayer/
│   │   │   └── cuestionario/
│   │   ├── servicios/
│   │   │   └── api.js
│   │   └── paginas/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Seguridad

- **Autenticación:** Azure AD con OAuth 2.0
- **Autorización:** Control de acceso basado en roles
- **Videos:** URLs con SAS tokens de tiempo limitado (30 días)
- **Datos:** Cifrado en tránsito (HTTPS) y en reposo (Azure)
- **Secretos:** Variables de entorno (nunca en código)

## Gestión de Videos

### Formatos Soportados
- MP4 (recomendado)
- WebM
- OGG
- MOV

### Límites
- Tamaño máximo: 500MB por archivo
- SAS token válido: 30 días (renovable)

### Características
- ✅ Subida con barra de progreso
- ✅ Validación de formato y tamaño
- ✅ Preservación del nombre original
- ✅ Eliminación de videos
- ✅ Actualización automática de URL

## Base de Datos

### Contenedores de Cosmos DB
- `configuracion` - Configuración de inducción
- `preguntas` - Banco de preguntas
- `respuestas` - Respuestas de usuarios
- `administradores` - Usuarios con permisos

## Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto es propiedad de Fundación Mario Santo Domingo.

## Soporte

Para soporte técnico, contactar al equipo de desarrollo.

## Changelog

### v2.0.0 (2026-01-21)
- ✨ Integración completa con Azure Blob Storage
- ✨ Componente de subida de videos con UI mejorada
- ✨ Generación automática de SAS tokens
- ✨ Reorganización del panel de administración
- 🐛 Correcciones en validación de archivos
- 📝 Documentación actualizada

### v1.0.0
- 🎉 Lanzamiento inicial
- ✨ Sistema de autenticación
- ✨ Gestión de cuestionarios
- ✨ Panel de administración
