// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Función helper para manejar errores
const manejarRespuesta = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error || `Error ${response.status}`)
  }
  return response.json()
}

// Servicio de Sesiones
export const sesionesAPI = {
  // Crear una nueva sesión de inducción
  crear: async (metadata = {}) => {
    const response = await fetch(`${API_BASE_URL}/sesiones/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata })
    })
    return manejarRespuesta(response)
  },

  // Obtener datos de una sesión
  obtener: async (sesionId) => {
    const response = await fetch(`${API_BASE_URL}/sesiones/${sesionId}`)
    return manejarRespuesta(response)
  },

  // Marcar video como visto
  marcarVideoVisto: async (sesionId, videoId) => {
    const response = await fetch(`${API_BASE_URL}/sesiones/${sesionId}/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId })
    })
    return manejarRespuesta(response)
  },

  // Completar módulo
  completarModulo: async (sesionId, moduloId) => {
    const response = await fetch(`${API_BASE_URL}/sesiones/${sesionId}/modulo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modulo_id: moduloId })
    })
    return manejarRespuesta(response)
  },

  // Actualizar sesión
  actualizar: async (sesionId, datos) => {
    const response = await fetch(`${API_BASE_URL}/sesiones/${sesionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    return manejarRespuesta(response)
  }
}

// Servicio de Cuestionarios
export const cuestionariosAPI = {
  // Guardar respuestas del cuestionario
  guardarRespuestas: async (datos) => {
    const response = await fetch(`${API_BASE_URL}/cuestionarios/respuesta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    return manejarRespuesta(response)
  },

  // Obtener respuestas de una sesión
  obtenerRespuestasSesion: async (sesionId) => {
    const response = await fetch(`${API_BASE_URL}/cuestionarios/respuestas/${sesionId}`)
    return manejarRespuesta(response)
  },

  // Obtener respuesta específica de un cuestionario
  obtenerRespuestaEspecifica: async (sesionId, cuestionarioId) => {
    const response = await fetch(
      `${API_BASE_URL}/cuestionarios/respuestas/${sesionId}/${cuestionarioId}`
    )
    return manejarRespuesta(response)
  },

  // Obtener estadísticas de un cuestionario
  obtenerEstadisticas: async (cuestionarioId) => {
    const response = await fetch(
      `${API_BASE_URL}/cuestionarios/estadisticas/${cuestionarioId}`
    )
    return manejarRespuesta(response)
  }
}

// Servicio de Recursos (videos y documentos)
export const recursosAPI = {
  // Listar videos
  listarVideos: async () => {
    const response = await fetch(`${API_BASE_URL}/recursos/videos`)
    return manejarRespuesta(response)
  },

  // Obtener URL de un video
  obtenerVideoUrl: async (nombreVideo) => {
    const response = await fetch(`${API_BASE_URL}/recursos/videos/${nombreVideo}`)
    return manejarRespuesta(response)
  },

  // Listar documentos
  listarDocumentos: async () => {
    const response = await fetch(`${API_BASE_URL}/recursos/documentos`)
    return manejarRespuesta(response)
  },

  // Obtener URL de un documento
  obtenerDocumentoUrl: async (nombreDocumento) => {
    const response = await fetch(`${API_BASE_URL}/recursos/documentos/${nombreDocumento}`)
    return manejarRespuesta(response)
  }
}

// Verificar salud de la API
export const verificarSalud = async () => {
  const response = await fetch(`${API_BASE_URL}/salud`)
  return manejarRespuesta(response)
}

// Servicio de Preguntas
export const preguntasAPI = {
  // Obtener preguntas de un cuestionario
  obtenerPreguntas: async (cuestionarioId) => {
    const response = await fetch(`${API_BASE_URL}/preguntas/cuestionario/${cuestionarioId}`)
    return manejarRespuesta(response)
  },

  // Crear nueva pregunta
  crearPregunta: async (datos) => {
    const response = await fetch(`${API_BASE_URL}/preguntas/cuestionario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    return manejarRespuesta(response)
  },

  // Actualizar pregunta
  actualizarPregunta: async (preguntaId, datos) => {
    const response = await fetch(`${API_BASE_URL}/preguntas/cuestionario/${preguntaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    return manejarRespuesta(response)
  },

  // Eliminar pregunta
  eliminarPregunta: async (preguntaId, cuestionarioId) => {
    const response = await fetch(`${API_BASE_URL}/preguntas/cuestionario/${preguntaId}?cuestionario_id=${cuestionarioId}`, {
      method: 'DELETE'
    })
    return manejarRespuesta(response)
  },

  // Listar todos los cuestionarios disponibles
  listarCuestionarios: async () => {
    const response = await fetch(`${API_BASE_URL}/preguntas/cuestionarios`)
    return manejarRespuesta(response)
  },

  // Inicializar datos de ejemplo (solo desarrollo)
  inicializarDatosEjemplo: async () => {
    const response = await fetch(`${API_BASE_URL}/preguntas/inicializar-datos`, {
      method: 'POST'
    })
    return manejarRespuesta(response)
  }
}

// Servicio de Administración
export const adminAPI = {
  // Obtener todas las sesiones
  obtenerTodasSesiones: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/sesiones/todas`)
    return manejarRespuesta(response)
  },

  // Obtener todas las respuestas
  obtenerTodasRespuestas: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/respuestas/todas`)
    return manejarRespuesta(response)
  },

  // Obtener todas las preguntas
  obtenerTodasPreguntas: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/preguntas/todas`)
    return manejarRespuesta(response)
  },

  // Obtener estadísticas generales
  obtenerEstadisticas: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/estadisticas`)
    return manejarRespuesta(response)
  },

  // Vaciar contenedor de sesiones
  vaciarSesiones: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/sesiones/vaciar`, {
      method: 'DELETE'
    })
    return manejarRespuesta(response)
  },

  // Vaciar contenedor de respuestas
  vaciarRespuestas: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/respuestas/vaciar`, {
      method: 'DELETE'
    })
    return manejarRespuesta(response)
  }
}
