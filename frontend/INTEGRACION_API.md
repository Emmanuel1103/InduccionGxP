# Guía de Integración con la API

## Configuración Inicial

1. **Variables de entorno**: Copia `.env.example` a `.env` y ajusta la URL si es necesario
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Estructura de Servicios Creados

### 1. Servicio API (`src/servicios/api.js`)

Cliente HTTP para consumir todos los endpoints del backend:

```javascript
import { sesionesAPI, cuestionariosAPI, recursosAPI } from './servicios/api'

// Ejemplos de uso:
const sesion = await sesionesAPI.crear()
await cuestionariosAPI.guardarRespuestas(datos)
```

### 2. Hook de Sesión (`src/hooks/useSesion.js`)

Maneja toda la lógica de la sesión de inducción:

```javascript
import { useSesion } from './hooks/useSesion'

function MiComponente() {
  const { sesion, cargando, marcarVideoVisto, completarModulo } = useSesion()
  
  // La sesión se crea automáticamente y se guarda en localStorage
  // Persiste entre recargas de página
}
```

### 3. Hook de Cuestionario (`src/hooks/useCuestionario.js`)

Maneja envío de respuestas y conversión de formato:

```javascript
import { useCuestionario } from './hooks/useCuestionario'

function Cuestionario() {
  const { sesion } = useSesion()
  const { enviarRespuestas, enviando, resultado } = useCuestionario(
    sesion?.sesion_id,
    'cuestionario_gxp_basico',
    'Cuestionario Básico de GxP'
  )
  
  const handleSubmit = async () => {
    await enviarRespuestas(preguntas, respuestasUsuario, tiempoEmpleado)
  }
}
```

## Integración Paso a Paso

### Paso 1: Agregar Proveedor de Sesión en la Aplicación

Envuelve tu aplicación con el hook de sesión:

```jsx
// src/App.jsx
import { useSesion } from './hooks/useSesion'
import { createContext } from 'react'

export const SesionContext = createContext()

function AppContent() {
  const sesionData = useSesion()
  
  if (sesionData.cargando) {
    return <div>Cargando...</div>
  }
  
  return (
    <SesionContext.Provider value={sesionData}>
      <Router>
        {/* tus rutas */}
      </Router>
    </SesionContext.Provider>
  )
}
```

### Paso 2: Actualizar PaginaInduccion

```jsx
// src/paginas/PaginaInduccion.jsx
import { useContext } from 'react'
import { SesionContext } from '../App'

export const PaginaInduccion = () => {
  const { sesion, marcarVideoVisto } = useContext(SesionContext)
  
  const handleVideoCompleto = async () => {
    await marcarVideoVisto('video_gestion_procesos')
  }
  
  return (
    <div className='pagina-induccion'>
      {/* Pasar sesionId a componentes hijos */}
      <Cuestionario sesionId={sesion?.sesion_id} />
      <EstadoProgreso porcentaje={sesion?.porcentaje_completado || 0} />
    </div>
  )
}
```

### Paso 3: Actualizar Componente Cuestionario

```jsx
// src/componets/cuestionario/Cuestionario.jsx
import { useCuestionario } from '../../hooks/useCuestionario'
import { useEffect, useState } from 'react'

export const Cuestionario = ({ sesionId }) => {
  const [tiempoInicio, setTiempoInicio] = useState(Date.now())
  
  const { enviarRespuestas, enviando, resultado, error } = useCuestionario(
    sesionId,
    'cuestionario_gestion_procesos',
    'Evaluación - Gestión por Procesos'
  )
  
  const manejarEnvioFinal = async () => {
    const tiempoEmpleado = Math.floor((Date.now() - tiempoInicio) / 1000)
    
    const respuesta = await enviarRespuestas(
      preguntas,
      respuestas,
      tiempoEmpleado
    )
    
    if (respuesta) {
      console.log('Calificación:', respuesta.calificacion)
      console.log('Aprobado:', respuesta.aprobado)
      setMostrarResultados(true)
    }
  }
  
  // Llamar cuando el usuario termine todas las preguntas
  // antes de mostrar resultados
}
```

### Paso 4: Actualizar VideoPlayer

```jsx
// src/componets/videoPlayer/VideoPlayer.jsx
import { useContext } from 'react'
import { SesionContext } from '../../App'

export const VideoPlayer = ({ url, videoId }) => {
  const { marcarVideoVisto } = useContext(SesionContext)
  
  const handleVideoCompleto = async () => {
    try {
      await marcarVideoVisto(videoId)
      console.log('Video marcado como visto')
    } catch (error) {
      console.error('Error al marcar video:', error)
    }
  }
  
  // Llamar handleVideoCompleto cuando el video termine
}
```

## Formato de Datos del Cuestionario

El hook `useCuestionario` convierte automáticamente el formato de tus preguntas al formato del backend:

**Formato Frontend (actual):**
```javascript
{
  id: 1,
  tipo: 'opcion-multiple',
  pregunta: '¿Qué es la gestión por procesos?',
  opciones: [
    { id: 'a', texto: 'Opción A', correcta: false },
    { id: 'b', texto: 'Opción B', correcta: true }
  ]
}
```

**Formato Backend (automático):**
```javascript
{
  orden: 1,
  titulo: 'Pregunta 1',
  pregunta: '¿Qué es la gestión por procesos?',
  tipo_pregunta: 'multiple_choice',
  opciones: ['Opción A', 'Opción B'],
  respuesta_correcta: 'Opción B',
  respuesta_usuario: 'Opción A',
  es_correcta: false
}
```

## Manejo de Errores

Todos los hooks manejan errores automáticamente:

```jsx
const { error, cargando } = useSesion()

if (error) {
  return <div>Error: {error}</div>
}

if (cargando) {
  return <div>Cargando...</div>
}
```

## Persistencia de Sesión

La sesión se guarda automáticamente en `localStorage` con la clave `sesion_induccion_id`. Esto permite:

- Continuar la inducción después de refrescar la página
- Mantener el progreso entre sesiones
- Recuperar respuestas anteriores

Para iniciar una nueva sesión:
```javascript
const { reiniciarSesion } = useSesion()
reiniciarSesion() // Limpia localStorage y recarga
```

## Verificación de Salud de la API

Antes de comenzar, puedes verificar que la API esté disponible:

```javascript
import { verificarSalud } from './servicios/api'

const estado = await verificarSalud()
console.log(estado) // { estado: 'activo', servicios: {...} }
```

## Próximos Pasos Recomendados

1. Crear contexto global para la sesión
2. Actualizar PaginaInduccion para pasar sesionId
3. Modificar Cuestionario para usar el hook
4. Agregar indicadores de carga durante envíos
5. Mostrar mensajes de error amigables
6. Agregar confirmación antes de reiniciar sesión
