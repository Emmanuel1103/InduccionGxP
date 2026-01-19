# Ejemplos de Uso de la API

## Guardar Respuestas de Cuestionario

### Endpoint
`POST /api/cuestionarios/respuesta`

### Estructura del JSON

```json
{
  "sesion_id": "123e4567-e89b-12d3-a456-426614174000",
  "cuestionario_id": "cuestionario_gxp_basico",
  "cuestionario_titulo": "Cuestionario Básico de GxP",
  "tiempo_empleado": 300,
  "respuestas": [
    {
      "orden": 1,
      "titulo": "Definición de GxP",
      "pregunta": "¿Qué significa GxP?",
      "tipo_pregunta": "multiple_choice",
      "opciones": [
        "Good Practice",
        "Great Performance",
        "Global Process",
        "General Protocol"
      ],
      "respuesta_correcta": "Good Practice",
      "respuesta_usuario": "Good Practice",
      "es_correcta": true
    },
    {
      "orden": 2,
      "titulo": "Importancia de GxP",
      "pregunta": "¿Por qué es importante seguir las buenas prácticas GxP?",
      "tipo_pregunta": "multiple_choice",
      "opciones": [
        "Para cumplir regulaciones",
        "Para mejorar la calidad",
        "Para proteger al paciente",
        "Todas las anteriores"
      ],
      "respuesta_correcta": "Todas las anteriores",
      "respuesta_usuario": "Para cumplir regulaciones",
      "es_correcta": false
    },
    {
      "orden": 3,
      "titulo": "Verificación de comprensión",
      "pregunta": "¿Las GxP aplican solo a la industria farmacéutica?",
      "tipo_pregunta": "verdadero_falso",
      "opciones": ["Verdadero", "Falso"],
      "respuesta_correcta": "Falso",
      "respuesta_usuario": "Falso",
      "es_correcta": true
    }
  ]
}
```

### Tipos de Pregunta Soportados

- `multiple_choice` - Selección múltiple con varias opciones
- `verdadero_falso` - Pregunta de verdadero o falso
- `texto_libre` - Respuesta abierta (requiere validación manual)

### Respuesta Exitosa

```json
{
  "id": "789e4567-e89b-12d3-a456-426614174999",
  "sesion_id": "123e4567-e89b-12d3-a456-426614174000",
  "cuestionario_id": "cuestionario_gxp_basico",
  "cuestionario_titulo": "Cuestionario Básico de GxP",
  "respuestas": [...],
  "calificacion": 66.67,
  "total_preguntas": 3,
  "respuestas_correctas": 2,
  "respuestas_incorrectas": 1,
  "porcentaje_acierto": 66.67,
  "aprobado": false,
  "tiempo_empleado": 300,
  "fecha_completado": "2026-01-19T15:30:00.000Z"
}
```

## Crear Sesión

### Endpoint
`POST /api/sesiones/`

### Request Body (opcional)
```json
{
  "metadata": {
    "navegador": "Chrome",
    "dispositivo": "Desktop",
    "ip": "192.168.1.1"
  }
}
```

### Respuesta
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "sesion_id": "123e4567-e89b-12d3-a456-426614174000",
  "fecha_inicio": "2026-01-19T14:00:00.000Z",
  "ultima_actividad": "2026-01-19T14:00:00.000Z",
  "modulos_completados": [],
  "videos_vistos": [],
  "cuestionarios_completados": [],
  "porcentaje_completado": 0,
  "intentos": 1,
  "metadata": {...}
}
```

## Marcar Video Visto

### Endpoint
`POST /api/sesiones/<sesion_id>/video`

### Request Body
```json
{
  "video_id": "video_introduccion_gxp"
}
```

## Obtener Estadísticas de Cuestionario

### Endpoint
`GET /api/cuestionarios/estadisticas/<cuestionario_id>`

### Respuesta
```json
{
  "cuestionario_id": "cuestionario_gxp_basico",
  "total_respuestas": 150,
  "aprobados": 120,
  "reprobados": 30,
  "porcentaje_aprobacion": 80.0,
  "calificacion_promedio": 78.5
}
```

## Verificar Salud de la API

### Endpoint
`GET /api/salud`

### Respuesta
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

## Códigos de Error

- `400` - Solicitud incorrecta (faltan campos requeridos)
- `404` - Recurso no encontrado
- `409` - Conflicto (recurso ya existe)
- `500` - Error interno del servidor
- `503` - Servicio no disponible (ej: Azure Storage no configurado)
