# Backend - Inducción GxP

API REST construida con Flask para gestionar el sistema de inducción GxP.

## Tecnologías

- Flask 3.0
- Azure CosmosDB (Base de datos NoSQL)
- Azure Blob Storage (Almacenamiento de archivos)
- Python 3.9+

## Estructura del Proyecto

```
backend/
├── servicios/          # Servicios para Azure
│   ├── cosmos_db.py    # Interacción con CosmosDB
│   └── azure_storage.py # Interacción con Blob Storage
├── rutas/              # Endpoints de la API
│   ├── usuarios.py     # Gestión de usuarios
│   ├── progreso.py     # Seguimiento de progreso
│   ├── recursos.py     # Videos y documentos
│   └── cuestionarios.py # Respuestas y estadísticas
├── config.py           # Configuración de la aplicación
├── app.py              # Aplicación principal
├── requirements.txt    # Dependencias
└── .env               # Variables de entorno (no incluir en git)
```

## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Completar con tus credenciales de Azure

## Configuración de Azure

### CosmosDB
1. Crear cuenta de CosmosDB en Azure Portal
2. Obtener endpoint y clave primaria
3. Se crearán automáticamente:
   - Base de datos: `induccion_gxp`
   - Contenedores: `usuarios`, `progreso`, `respuestas`

### Blob Storage
1. Crear cuenta de Storage en Azure Portal
2. Obtener cadena de conexión
3. Se crearán automáticamente los contenedores:
   - `videos`
   - `recursos`

## Ejecución

### Desarrollo
```bash
python app.py
```

La API estará disponible en `http://localhost:5000`

### Producción
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:crear_app()
```

## Endpoints Principales

### Usuarios
- `POST /api/usuarios/` - Crear usuario
- `GET /api/usuarios/<id>` - Obtener usuario
- `GET /api/usuarios/email/<email>` - Buscar por email
- `PUT /api/usuarios/<id>` - Actualizar usuario
- `GET /api/usuarios/` - Listar usuarios

### Progreso
- `GET /api/progreso/<usuario_id>` - Obtener progreso
- `POST /api/progreso/<usuario_id>/video` - Marcar video visto
- `POST /api/progreso/<usuario_id>/modulo` - Completar módulo
- `PUT /api/progreso/<usuario_id>` - Actualizar progreso

### Recursos
- `GET /api/recursos/videos` - Listar videos
- `GET /api/recursos/videos/<nombre>` - Obtener URL de video
- `POST /api/recursos/videos` - Subir video
- `GET /api/recursos/documentos` - Listar documentos
- `GET /api/recursos/documentos/<nombre>` - Obtener URL de documento
- `POST /api/recursos/documentos` - Subir documento

### Cuestionarios
- `POST /api/cuestionarios/respuesta` - Guardar respuesta
- `GET /api/cuestionarios/respuestas/<usuario_id>` - Respuestas del usuario
- `GET /api/cuestionarios/respuestas/<usuario_id>/<cuestionario_id>` - Respuesta específica
- `GET /api/cuestionarios/estadisticas/<cuestionario_id>` - Estadísticas

## Salud del Servicio
- `GET /api/salud` - Verificar estado de la API

## Notas de Seguridad

- Nunca subir el archivo `.env` al repositorio
- Rotar las claves de Azure periódicamente
- Usar HTTPS en producción
- Implementar autenticación JWT para producción
- Validar y sanitizar todas las entradas del usuario
- Limitar el tamaño de archivos subidos
