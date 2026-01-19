# Guía de Inicialización del Proyecto

## Pasos para iniciar el proyecto completo

### 1. Backend - Iniciar Servidor Flask

```bash
cd backend
python app.py
```

El servidor debería mostrar:
```
✓ CosmosDB inicializado correctamente
⚠ Azure Storage no disponible - Endpoints de recursos deshabilitados
* Running on http://127.0.0.1:5000
```

### 2. Inicializar Preguntas en la Base de Datos

Una vez el backend esté corriendo, inicializa las preguntas de ejemplo:

**Opción A: Usando curl (PowerShell)**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/preguntas/inicializar-datos" -Method POST
```

**Opción B: Usando el navegador**
Abre en tu navegador: `http://localhost:5000/api/preguntas/inicializar-datos`
(Cambia el método a POST si usas una herramienta como Postman)

**Opción C: Usando JavaScript en la consola del navegador**
```javascript
fetch('http://localhost:5000/api/preguntas/inicializar-datos', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log(data))
```

Deberías ver:
```json
{
  "mensaje": "3 preguntas creadas exitosamente",
  "ids": ["...", "...", "..."]
}
```

### 3. Frontend - Iniciar Aplicación React

En otra terminal:

```bash
cd frontend
npm run dev
```

El frontend debería estar en: `http://localhost:5173`

### 4. Verificar Funcionamiento

1. Abre `http://localhost:5173`
2. Ve a la página de inducción
3. Verifica que las preguntas se carguen desde la base de datos
4. Completa el cuestionario
5. Las respuestas se guardarán automáticamente en CosmosDB

## Panel de Administración de Preguntas

El sistema incluye un panel completo de administración donde puedes:

### ✨ Funcionalidades Dinámicas

1. **Crear Preguntas**
   - Botón "Nueva Pregunta" para agregar preguntas
   - Soporte para preguntas de opción múltiple y verdadero/falso
   - Agregar/eliminar opciones dinámicamente
   - Campo de explicación opcional

2. **Editar Preguntas**
   - Botón "Editar" en cada pregunta
   - Modificar cualquier campo: orden, pregunta, opciones, etc.
   - Guardar o cancelar cambios

3. **Eliminar Preguntas**
   - Botón "Eliminar" con confirmación
   - La pregunta se desactiva (no se borra permanentemente)
   - Confirmación antes de eliminar

4. **Reordenar Preguntas**
   - Botones de flechas arriba/abajo para cambiar el orden
   - Actualización automática del orden en la base de datos
   - Botones deshabilitados cuando no se puede mover más

5. **Cargar Datos de Ejemplo**
   - Botón para inicializar 3 preguntas de ejemplo
   - Solo visible cuando no hay preguntas

### Acceder al Panel

Haz clic en el ícono de engranaje (⚙️) en el header para ir a `/configuracion`

---

## Verificar Estado de la API

Puedes verificar que todo esté funcionando:

```
http://localhost:5000/api/salud
```

Debería retornar:
```json
{
  "estado": "activo",
  "mensaje": "API de Inducción GxP funcionando",
  "servicios": {
    "cosmos_db": "conectado",
    "azure_storage": "no configurado"
  }
}
```

## Verificar Preguntas Cargadas

```
http://localhost:5000/api/preguntas/cuestionario/cuestionario_gestion_procesos
```

Debería retornar un array con 3 preguntas.

## Estructura de Datos Creada

### Contenedor: sesiones
- Se crea automáticamente cuando inicias la app
- Guarda información de cada sesión anónima

### Contenedor: preguntas
- Se inicializa con 3 preguntas de ejemplo
- ID del cuestionario: `cuestionario_gestion_procesos`

### Contenedor: respuestas
- Se llena cuando completas el cuestionario
- Guarda todas las respuestas con detalles completos

## Solución de Problemas

### Backend no inicia
- Verifica que el entorno virtual esté activado
- Verifica las credenciales de CosmosDB en `.env`
- Asegúrate de tener las dependencias instaladas

### Frontend no carga preguntas
- Verifica que el backend esté corriendo en `localhost:5000`
- Verifica que hayas inicializado las preguntas
- Revisa la consola del navegador para errores
- Verifica que `.env` tenga `VITE_API_URL=http://localhost:5000/api`

### Error de CORS
- El backend ya tiene CORS configurado para `localhost:5173`
- Si usas otro puerto, actualiza `CORS_ORIGINS` en el `.env` del backend

## Agregar Más Preguntas

Puedes agregar más preguntas usando el endpoint:

```bash
POST http://localhost:5000/api/preguntas/cuestionario
```

Con el cuerpo:
```json
{
  "cuestionario_id": "cuestionario_gestion_procesos",
  "cuestionario_titulo": "Evaluación - Gestión por Procesos",
  "orden": 4,
  "pregunta": "Nueva pregunta aquí",
  "tipo": "opcion-multiple",
  "opciones": [
    {"id": "a", "texto": "Opción A", "correcta": false},
    {"id": "b", "texto": "Opción B", "correcta": true}
  ],
  "explicacion": "Explicación de la respuesta"
}
```

## Flujo Completo del Sistema

1. Usuario abre la aplicación → Se crea sesión automática
2. Sesión se guarda en localStorage y CosmosDB
3. Usuario ve página de inducción
4. Preguntas se cargan desde CosmosDB
5. Usuario responde cuestionario
6. Al finalizar, respuestas se envían a CosmosDB con estructura completa
7. Sistema calcula calificación automáticamente
8. Usuario ve resultados (aprobado/reprobado)
